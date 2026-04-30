import os
import time

import requests
from decouple import config

from .base import LlmProvider

MAX_RETRIES = 3
RETRY_BASE_DELAY = 5


class OpenRouterLlmProvider(LlmProvider):
    """OpenRouter API provider — routes to many models via a single endpoint."""

    def __init__(self):
        self.api_key = config("OPENROUTER_API_KEY", "")
        self.model = config("OPENROUTER_MODEL", default="google/gemini-2.0-flash-001")
        self.base_url = config(
            "OPENROUTER_BASE_URL", default="https://openrouter.ai/api/v1"
        )

    def chat_completion(self, system_prompt: str, user_message: str) -> str:
        last_error = None
        for attempt in range(MAX_RETRIES):
            try:
                resp = requests.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_message},
                        ],
                        "response_format": {"type": "json_object"},
                    },
                    timeout=120,
                )
                resp.raise_for_status()
                data = resp.json()
                return data["choices"][0]["message"]["content"]
            except Exception as e:
                status = getattr(
                    getattr(e, "response", None), "status_code", 0
                )
                if status in (429, 500, 502, 503, 504) and attempt < MAX_RETRIES - 1:
                    delay = RETRY_BASE_DELAY * (2 ** attempt)
                    print(f"  OpenRouter {status} error, retrying in {delay}s (attempt {attempt + 1}/{MAX_RETRIES})...")
                    time.sleep(delay)
                    last_error = e
                    continue
                raise
        raise last_error
