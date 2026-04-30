import os
from datetime import datetime, timezone
from typing import Dict, List, Optional

import requests

from .s3_client import S3Client


class ProcessingTracker:
    """Tracks processed exam files via S3 manifest + optional NocoDB."""

    def __init__(self, s3_client: S3Client):
        self.s3 = s3_client
        self.nocodb_url = os.environ.get("NOCODB_URL")
        self.nocodb_api_key = os.environ.get("NOCODB_API_KEY")
        self.nocodb_table = os.environ.get("NOCODB_TABLE", "processed_exams")
        self._manifest: Optional[Dict] = None

    def _load_manifest(self) -> Dict:
        if self._manifest is None:
            self._manifest = self.s3.get_processed_manifest()
        return self._manifest

    def _save_manifest(self) -> None:
        if self._manifest is not None:
            self.s3.save_processed_manifest(self._manifest)

    def is_processed(self, s3_key: str) -> bool:
        manifest = self._load_manifest()
        return any(entry["source_key"] == s3_key for entry in manifest.get("processed_files", []))

    def get_processed_keys(self) -> set:
        manifest = self._load_manifest()
        return {entry["source_key"] for entry in manifest.get("processed_files", [])}

    def mark_processed(
        self,
        source_key: str,
        institution: str,
        exam_name: str,
        paper_id: str,
        output_key: str,
        metadata: Dict,
        status: str = "success",
        error_message: Optional[str] = None,
    ) -> None:
        manifest = self._load_manifest()

        entry = {
            "source_key": source_key,
            "institution": institution,
            "exam_name": exam_name,
            "paper_id": paper_id,
            "output_key": output_key,
            "status": status,
            "error_message": error_message,
            "module_code": metadata.get("module_code", ""),
            "module_name": ", ".join(metadata.get("module", [])),
            "exam_date": metadata.get("exam_date", ""),
            "year_of_exam": metadata.get("year_of_exam", ""),
            "processed_at": datetime.now(timezone.utc).isoformat(),
        }

        manifest.setdefault("processed_files", []).append(entry)
        self._save_manifest()

        if self.nocodb_url and self.nocodb_api_key:
            self._push_to_nocodb(entry)

    def _push_to_nocodb(self, entry: Dict) -> None:
        try:
            headers = {
                "xc-token": self.nocodb_api_key,
                "Content-Type": "application/json",
            }
            url = f"{self.nocodb_url}/api/v2/tables/{self.nocodb_table}/records"
            resp = requests.post(url, json=entry, headers=headers, timeout=30)
            resp.raise_for_status()
        except Exception as e:
            print(f"Warning: NocoDB sync failed: {e}")

    def get_processing_stats(self) -> Dict:
        manifest = self._load_manifest()
        files = manifest.get("processed_files", [])
        return {
            "total_processed": len(files),
            "successful": sum(1 for f in files if f["status"] == "success"),
            "failed": sum(1 for f in files if f["status"] == "error"),
            "institutions": list({f["institution"] for f in files}),
        }
