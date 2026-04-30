import json
import os
from pathlib import Path
from typing import Dict, List, Optional

import boto3
from botocore.exceptions import ClientError


# S3 path prefixes — single source of truth for the bucket layout
PREFIX_INBOX = "inbox/"
PREFIX_STAGING = "staging/"
PREFIX_OUTPUT = "output/"
PREFIX_ARCHIVE = "archive/"
PREFIX_FAILED = "failed/"
PREFIX_SYSTEM = ".system/"


class S3Client:
    def __init__(self):
        self.s3 = boto3.client(
            "s3",
            aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
            region_name=os.environ.get("AWS_REGION", "us-east-1"),
        )
        self.bucket = os.environ.get("S3_EXAMPAPERS_MAIN_BUCKET", "examapapers")
        self.images_bucket = os.environ.get("S3_EXAMPAPERS_IMAGES_BUCKET", "exampapel-images-bucket2025")

    # ------------------------------------------------------------------
    # Listing
    # ------------------------------------------------------------------

    def list_inbox_pdfs(self, institution: Optional[str] = None) -> Dict[str, List[str]]:
        """List PDFs in inbox/<institution>/, grouped by institution."""
        prefix = PREFIX_INBOX
        if institution:
            prefix += f"{institution}/"

        paginator = self.s3.get_paginator("list_objects_v2")
        pdf_files: Dict[str, List[str]] = {}

        for page in paginator.paginate(Bucket=self.bucket, Prefix=prefix):
            for obj in page.get("Contents", []):
                key = obj["Key"]
                if not key.lower().endswith(".pdf"):
                    continue
                # inbox/<institution>/file.pdf -> extract institution
                parts = key[len(PREFIX_INBOX):].split("/", 1)
                if len(parts) == 2:
                    pdf_files.setdefault(parts[0], []).append(key)

        return pdf_files

    def list_staging_files(self, institution: Optional[str] = None) -> Dict[str, List[str]]:
        """List .md files in staging/<institution>/, grouped by institution."""
        prefix = PREFIX_STAGING
        if institution:
            prefix += f"{institution}/"

        paginator = self.s3.get_paginator("list_objects_v2")
        institution_files: Dict[str, List[str]] = {}

        for page in paginator.paginate(Bucket=self.bucket, Prefix=prefix):
            for obj in page.get("Contents", []):
                key = obj["Key"]
                if not key.endswith(".md"):
                    continue
                # staging/<institution>/file.md -> extract institution
                parts = key[len(PREFIX_STAGING):].split("/", 1)
                if len(parts) == 2:
                    institution_files.setdefault(parts[0], []).append(key)

        return institution_files

    # ------------------------------------------------------------------
    # File I/O
    # ------------------------------------------------------------------

    def download_file(self, s3_key: str, local_path: Path) -> Path:
        local_path.parent.mkdir(parents=True, exist_ok=True)
        self.s3.download_file(self.bucket, s3_key, str(local_path))
        return local_path

    def download_as_text(self, s3_key: str) -> str:
        resp = self.s3.get_object(Bucket=self.bucket, Key=s3_key)
        return resp["Body"].read().decode("utf-8")

    def upload_file(self, local_path: Path, s3_key: str) -> str:
        self.s3.upload_file(str(local_path), self.bucket, s3_key)
        return s3_key

    def upload_text(self, content: str, s3_key: str, content_type: str = "application/json") -> str:
        self.s3.put_object(
            Bucket=self.bucket,
            Key=s3_key,
            Body=content.encode("utf-8"),
            ContentType=content_type,
        )
        return s3_key

    def upload_bytes(self, data: bytes, s3_key: str, content_type: str = "application/octet-stream") -> str:
        self.s3.put_object(
            Bucket=self.bucket,
            Key=s3_key,
            Body=data,
            ContentType=content_type,
        )
        return s3_key

    def delete_object(self, s3_key: str) -> None:
        self.s3.delete_object(Bucket=self.bucket, Key=s3_key)

    def move_object(self, src_key: str, dst_key: str) -> str:
        self.s3.copy_object(
            Bucket=self.bucket,
            Key=dst_key,
            CopySource={"Bucket": self.bucket, "Key": src_key},
        )
        self.delete_object(src_key)
        return dst_key

    def file_exists(self, s3_key: str) -> bool:
        try:
            self.s3.head_object(Bucket=self.bucket, Key=s3_key)
            return True
        except ClientError:
            return False

    # ------------------------------------------------------------------
    # Images bucket
    # ------------------------------------------------------------------

    def upload_image(self, data: bytes, s3_key: str, content_type: str = "image/png") -> str:
        self.s3.put_object(
            Bucket=self.images_bucket,
            Key=s3_key,
            Body=data,
            ContentType=content_type,
        )
        return f"s3://{self.images_bucket}/{s3_key}"

    def image_exists(self, s3_key: str) -> bool:
        try:
            self.s3.head_object(Bucket=self.images_bucket, Key=s3_key)
            return True
        except ClientError:
            return False

    # ------------------------------------------------------------------
    # Manifest / tracking
    # ------------------------------------------------------------------

    def get_processed_manifest(self) -> Dict:
        try:
            resp = self.s3.get_object(Bucket=self.bucket, Key=f"{PREFIX_SYSTEM}manifest.json")
            return json.loads(resp["Body"].read().decode("utf-8"))
        except ClientError as e:
            if e.response["Error"]["Code"] == "NoSuchKey":
                return {"processed_files": [], "last_updated": None}
            raise

    def save_processed_manifest(self, manifest: Dict) -> None:
        from datetime import datetime, timezone
        manifest["last_updated"] = datetime.now(timezone.utc).isoformat()
        self.upload_text(
            json.dumps(manifest, indent=2, ensure_ascii=False),
            f"{PREFIX_SYSTEM}manifest.json",
            content_type="application/json",
        )

    # ------------------------------------------------------------------
    # Presigned URLs
    # ------------------------------------------------------------------

    def generate_presigned_url(self, s3_key: str, expires_in: int = 3600) -> str:
        return self.s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket, "Key": s3_key},
            ExpiresIn=expires_in,
        )

    # ------------------------------------------------------------------
    # Backward compatibility aliases
    # ------------------------------------------------------------------

    def list_raw_pdfs(self, institution: Optional[str] = None) -> Dict[str, List[str]]:
        """Alias for list_inbox_pdfs()."""
        return self.list_inbox_pdfs(institution)

    def list_source_files(self, institution: Optional[str] = None) -> Dict[str, List[str]]:
        """Alias for list_staging_files()."""
        return self.list_staging_files(institution)
