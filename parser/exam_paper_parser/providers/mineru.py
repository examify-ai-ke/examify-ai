import io
import time
import zipfile
from typing import Dict, Optional

import requests
from decouple import config

from .base import PdfParserProvider, ConversionResult


class MinerUProvider(PdfParserProvider):
    """MinerU Precision Extract API integration.

    Uses the file-upload path (not URL-based) because MinerU servers are in
    China and cannot reliably reach AWS S3 presigned URLs.

    Flow:
      1. Request signed upload URL from MinerU  -> file_url + batch_id
      2. PUT the PDF bytes to MinerU's OSS
      3. Poll batch status until all tasks are "done"
      4. Download result zip, extract full.md + images/
    """

    API_BASE = "https://mineru.net/api/v4"
    POLL_INTERVAL = 5   # seconds between polls
    POLL_TIMEOUT = 600  # max seconds to wait (10 min)

    def __init__(self):
        self.token = config("MINERU_BEARER_TOKEN")
        self.model_version = "vlm"

    def _headers(self) -> dict:
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}",
        }

    def _request_upload_url(self, filename: str) -> tuple:
        """Return (batch_id, upload_url) for a single file."""
        resp = requests.post(
            f"{self.API_BASE}/file-urls/batch",
            headers=self._headers(),
            json={
                "files": [{"name": filename}],
                "model_version": self.model_version,
                "enable_formula": True,
                "enable_table": True,
                "language": "en",
            },
            timeout=60,
        )
        resp.raise_for_status()
        data = resp.json()

        if data.get("code") != 0:
            raise RuntimeError(
                f"MinerU upload-url request failed: {data.get('msg', data)}"
            )

        batch_id = data["data"]["batch_id"]
        upload_url = data["data"]["file_urls"][0]
        print(f"  MinerU upload prepared: batch_id={batch_id}")
        return batch_id, upload_url

    def _upload_file(self, upload_url: str, file_data: bytes) -> None:
        resp = requests.put(upload_url, data=file_data, timeout=120)
        if resp.status_code not in (200, 201):
            raise RuntimeError(
                f"MinerU file upload failed: HTTP {resp.status_code}"
            )
        print(f"  MinerU file uploaded ({len(file_data):,} bytes)")

    def _poll_batch(self, batch_id: str) -> str:
        """Poll batch status. Returns the full_zip_url when done."""
        url = f"{self.API_BASE}/extract-results/batch/{batch_id}"
        start = time.time()

        while time.time() - start < self.POLL_TIMEOUT:
            resp = requests.get(url, headers=self._headers(), timeout=30)
            resp.raise_for_status()
            data = resp.json()

            if data.get("code") != 0:
                raise RuntimeError(f"MinerU poll error: {data.get('msg', data)}")

            results = data["data"].get("extract_result", [])
            elapsed = int(time.time() - start)

            for r in results:
                state = r.get("state", "unknown")
                fname = r.get("file_name", "?")

                if state == "done":
                    zip_url = r.get("full_zip_url", "")
                    if not zip_url:
                        raise RuntimeError("MinerU task done but no full_zip_url")
                    print(f"  MinerU extraction complete ({elapsed}s)")
                    return zip_url

                if state == "failed":
                    err = r.get("err_msg", "unknown error")
                    raise RuntimeError(f"MinerU extraction failed: {err}")

                progress = r.get("extract_progress", {})
                extracted = progress.get("extracted_pages", "?")
                total = progress.get("total_pages", "?")
                print(f"  MinerU [{elapsed}s] state={state} pages={extracted}/{total}")

            time.sleep(self.POLL_INTERVAL)

        raise TimeoutError(
            f"MinerU batch {batch_id} did not complete within {self.POLL_TIMEOUT}s"
        )

    def _extract_from_zip(self, zip_url: str) -> ConversionResult:
        """Download result zip and extract markdown + all images."""
        print(f"  Downloading MinerU result zip...")
        resp = requests.get(zip_url, timeout=120)
        resp.raise_for_status()

        images: Dict[str, bytes] = {}

        with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
            names = zf.namelist()

            md_files = [n for n in names if n.endswith("full.md")]
            if not md_files:
                md_files = [n for n in names if n.endswith(".md")]
            if not md_files:
                raise RuntimeError(
                    f"No markdown in MinerU zip. Contents: {names[:20]}"
                )
            markdown = zf.read(md_files[0]).decode("utf-8")
            print(f"  Extracted {md_files[0]} ({len(markdown)} chars)")

            img_exts = (".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp")
            for name in names:
                if name.lower().endswith(img_exts):
                    images[name] = zf.read(name)

            if images:
                print(f"  Extracted {len(images)} image(s) from zip")

        return ConversionResult(markdown=markdown, images=images)

    def convert(
        self,
        file_url: str,
        file_data: Optional[bytes] = None,
        filename: str = "",
    ) -> ConversionResult:
        if not file_data:
            raise ValueError(
                "MinerU provider requires file_data (raw PDF bytes) "
                "because MinerU servers cannot reach AWS S3 presigned URLs."
            )

        filename = filename or "document.pdf"
        batch_id, upload_url = self._request_upload_url(filename)
        self._upload_file(upload_url, file_data)
        zip_url = self._poll_batch(batch_id)
        return self._extract_from_zip(zip_url)
