import json
import time
from typing import Optional

import requests
from decouple import config

from .base import PdfParserProvider, ConversionResult


class ZAiProvider(PdfParserProvider):
    """Z.ai GLM-OCR provider — synchronous presigned-URL-based conversion."""

    MAX_RETRIES = 3
    RETRY_BASE_DELAY = 5

    def __init__(self):
        self.api_key = config("Z_API_KEY")
        self.api_base = "https://api.z.ai/api/paas/v4/chat/completions"

    def convert(
        self,
        file_url: str,
        file_data: Optional[bytes] = None,
        filename: str = "",
    ) -> ConversionResult:
        last_error = None
        for attempt in range(self.MAX_RETRIES):
            try:
                resp = requests.post(
                    self.api_base,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "glm-4.6v",
                        "file": file_url,
                    },
                    timeout=300,
                )
                resp.raise_for_status()
                data = resp.json()

                md_content = data.get("md_results", "")
                if not md_content:
                    raise ValueError(
                        f"Z.ai returned empty md_results. Response: {json.dumps(data)[:500]}"
                    )
                return ConversionResult(markdown=md_content)

            except requests.exceptions.HTTPError as e:
                status = e.response.status_code if e.response is not None else 0
                if status in (429, 500, 502, 503, 504) and attempt < self.MAX_RETRIES - 1:
                    delay = self.RETRY_BASE_DELAY * (2 ** attempt)
                    print(f"  Z.ai {status} error, retrying in {delay}s "
                          f"(attempt {attempt + 1}/{self.MAX_RETRIES})...")
                    time.sleep(delay)
                    last_error = e
                    continue
                raise

        raise last_error  # type: ignore[misc]
