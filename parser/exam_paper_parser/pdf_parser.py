"""Unified PDF-to-Markdown parser with swappable provider backends."""

import os
import re
from pathlib import Path
from typing import Dict, Optional

from .providers import get_provider
from .providers.base import ConversionResult
from .s3_client import S3Client, PREFIX_STAGING, PREFIX_ARCHIVE, PREFIX_FAILED, PREFIX_INBOX
from .tracking import ProcessingTracker


class PdfParser:
    """Unified PDF-to-Markdown service with swappable provider backends.

    Handles the full pipeline:
      - Downloads PDF from S3
      - Delegates to provider (Z.ai or MinerU)
      - Re-hosts extracted images to S3 images bucket
      - Rewrites image references in markdown to S3 URLs
      - Uploads final markdown to S3

    Usage:
        parser = PdfParser(s3, tracker, provider="mineru")
        parser.run()
    """

    def __init__(
        self,
        s3: S3Client,
        tracker: ProcessingTracker,
        provider: Optional[str] = None,
    ):
        self.s3 = s3
        self.tracker = tracker
        provider_name = provider or os.environ.get("PDF_PARSER_PROVIDER", "zai")
        print(f"[PdfParser] Provider: {provider_name}")
        self.provider = get_provider(provider_name)

    def _rehost_images(
        self,
        images: Dict[str, bytes],
        institution: str,
        stem: str,
    ) -> Dict[str, str]:
        """Upload extracted images to S3 images bucket.

        Returns a mapping of original zip path -> S3 images URL.
        """
        url_map: Dict[str, str] = {}

        for img_path, img_bytes in images.items():
            img_name = Path(img_path).name
            s3_key = f"{institution}/{stem}/{img_name}"

            ext = Path(img_name).suffix.lower()
            content_types = {
                ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
                ".png": "image/png", ".gif": "image/gif",
                ".webp": "image/webp", ".bmp": "image/bmp",
            }
            content_type = content_types.get(ext, "image/jpeg")

            try:
                s3_url = self.s3.upload_image(img_bytes, s3_key, content_type)
                url_map[img_path] = s3_url
            except Exception as e:
                print(f"  Warning: failed to upload image {img_name}: {e}")

        return url_map

    @staticmethod
    def _rewrite_image_urls(markdown: str, url_map: Dict[str, str]) -> str:
        """Replace relative image references in markdown with S3 URLs."""
        for original_path, s3_url in url_map.items():
            img_name = Path(original_path).name
            markdown = markdown.replace(f"({original_path})", f"({s3_url})")
            markdown = markdown.replace(f"(images/{img_name})", f"({s3_url})")
        return markdown

    def process_pdf(self, s3_key: str, institution: str) -> Optional[str]:
        """Convert a single PDF from raw_pdf/ to markdown.

        Returns the new source .md S3 key on success, None on failure.
        """
        raw_filename = Path(s3_key).name
        # Sanitize: collapse spaces/dashes into single dashes, strip parens
        stem = re.sub(r"[\s]+", "-", Path(s3_key).stem)
        stem = re.sub(r"[()]", "", stem)
        filename = f"{stem}.pdf"

        print(f"\n{'='*80}")
        print(f"[PDF->MD] Processing: {s3_key} (provider: {type(self.provider).__name__})")
        print(f"{'='*80}")

        try:
            print(f"Downloading PDF from S3...")
            resp = self.s3.s3.get_object(Bucket=self.s3.bucket, Key=s3_key)
            file_data = resp["Body"].read()
            print(f"Downloaded {len(file_data):,} bytes")

            presigned_url = self.s3.generate_presigned_url(s3_key, expires_in=3600)

            print(f"Sending to {type(self.provider).__name__}...")
            result: ConversionResult = self.provider.convert(
                file_url=presigned_url,
                file_data=file_data,
                filename=filename,
            )
            print(f"Conversion complete -- {len(result.markdown)} chars of markdown")

            if result.images:
                print(f"Re-hosting {len(result.images)} image(s) to S3...")
                url_map = self._rehost_images(result.images, institution, stem)
                if url_map:
                    result.markdown = self._rewrite_image_urls(result.markdown, url_map)
                    print(f"  Rewrote {len(url_map)} image URL(s) in markdown")

            md_filename = f"{stem}.md"
            source_key = f"{PREFIX_STAGING}{institution}/{md_filename}"
            self.s3.upload_text(
                result.markdown,
                source_key,
                content_type="text/markdown",
            )
            print(f"Uploaded markdown to s3://{self.s3.bucket}/{source_key}")

            archive_key = f"{PREFIX_ARCHIVE}{institution}/pdfs/{filename}"
            self.s3.move_object(s3_key, archive_key)
            print(f"Moved PDF to s3://{self.s3.bucket}/{archive_key}")

            self.tracker.mark_processed(
                source_key=s3_key,
                institution=institution,
                exam_name=stem,
                paper_id="",
                output_key=source_key,
                metadata={"module_code": "", "module": [], "exam_date": "", "year_of_exam": ""},
                status="pdf_converted",
            )

            return source_key

        except Exception as e:
            print(f"Error converting PDF {s3_key}: {e}")

            failed_key = f"{PREFIX_FAILED}{institution}/{filename}"
            try:
                self.s3.move_object(s3_key, failed_key)
                print(f"Moved failed PDF to s3://{self.s3.bucket}/{failed_key}")
            except Exception as move_err:
                print(f"Could not move failed PDF: {move_err}")

            self.tracker.mark_processed(
                source_key=s3_key,
                institution=institution,
                exam_name=stem,
                paper_id="",
                output_key="",
                metadata={"module_code": "", "module": [], "exam_date": "", "year_of_exam": ""},
                status="error",
                error_message=str(e),
            )

            return None

    def run(self) -> Dict[str, int]:
        """Scan inbox/, convert all PDFs to markdown, return stats."""
        print("Scanning inbox/ for raw PDF files...")
        pdf_files = self.s3.list_inbox_pdfs()

        if not pdf_files:
            print("No PDF files found under inbox/.")
            return {"total": 0, "converted": 0, "failed": 0}

        already_processed = self.tracker.get_processed_keys()

        total = 0
        converted = 0
        failed = 0

        for institution, keys in pdf_files.items():
            print(f"  {institution}: {len(keys)} PDF(s)")

            for s3_key in keys:
                total += 1

                if s3_key in already_processed:
                    print(f"  Skipping already processed: {s3_key}")
                    continue

                result = self.process_pdf(s3_key, institution)
                if result:
                    converted += 1
                else:
                    failed += 1

        print(f"\n{'='*80}")
        print(f"PDF conversion complete.")
        print(f"  Total:     {total}")
        print(f"  Converted: {converted}")
        print(f"  Failed:    {failed}")
        print(f"{'='*80}")

        return {"total": total, "converted": converted, "failed": failed}
