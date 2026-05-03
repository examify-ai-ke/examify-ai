import os
import time

from decouple import config
from zai import ZaiClient

from .base import LlmProvider

MAX_RETRIES = 3
RETRY_BASE_DELAY = 5


class ZAiLlmProvider(LlmProvider):
    """Z.ai GLM model provider."""

    def __init__(self):
        self.api_key = config("Z_API_KEY", "")
        self.model = os.environ.get("Z_API_MODEL", "glm-5.1")

    def _get_client(self):
        return ZaiClient(
            api_key=self.api_key,
            base_url="https://api.z.ai/api/paas/v4",
        )

    def chat_completion(self, system_prompt: str, user_message: str) -> str:
        last_error = None
        for attempt in range(MAX_RETRIES):
            try:
                client = self._get_client()
                completion = client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message},
                    ],
                    thinking={"type": "enabled"},
                    temperature=1.0,
                    response_format={"type": "json_object"},
                )
                return completion.choices[0].message.content
            except Exception as e:
                status = getattr(getattr(e, "status_code", None), "__int__", lambda: 0)()
                if not status:
                    resp = getattr(e, "response", None)
                    status = getattr(resp, "status_code", 0) if resp else 0
                if status in (429, 500, 502, 503, 504) and attempt < MAX_RETRIES - 1:
                    delay = RETRY_BASE_DELAY * (2 ** attempt)
                    print(f"  Z.ai {status} error, retrying in {delay}s (attempt {attempt + 1}/{MAX_RETRIES})...")
                    time.sleep(delay)
                    last_error = e
                    continue
                raise
        raise last_error
