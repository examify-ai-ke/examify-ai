import json
import re
import time

from decouple import config
from google import genai
from google.genai import types

from .base import LlmProvider

MAX_RETRIES = 3
RETRY_BASE_DELAY = 5


def _repair_json(text: str) -> str:
    """Try to fix common JSON issues from LLM output."""
    # Remove trailing commas before } or ]
    text = re.sub(r",\s*([}\]])", r"\1", text)
    return text


class GeminiLlmProvider(LlmProvider):
    """Google Gemini API provider using the google-genai SDK."""

    def __init__(self):
        self.api_key = config("GEMINI_API_KEY", "")
        self.model = config("GEMINI_MODEL", default="gemini-2.0-flash")
        self.client = genai.Client(api_key=self.api_key)

    def chat_completion(self, system_prompt: str, user_message: str) -> str:
        last_error = None
        for attempt in range(MAX_RETRIES):
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=user_message,
                    config=types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        response_mime_type="application/json",
                        temperature=0.4,
                    ),
                )
                text = response.text
                # Validate JSON, attempt repair if needed
                try:
                    json.loads(text)
                except json.JSONDecodeError:
                    repaired = _repair_json(text)
                    json.loads(repaired)  # validate repair worked
                    text = repaired
                return text
            except json.JSONDecodeError as e:
                if attempt < MAX_RETRIES - 1:
                    delay = RETRY_BASE_DELAY * (2 ** attempt)
                    print(f"  Gemini returned invalid JSON, retrying in {delay}s (attempt {attempt + 1}/{MAX_RETRIES})...")
                    time.sleep(delay)
                    last_error = e
                    continue
                raise
            except Exception as e:
                status = getattr(e, "code", 0) or 0
                if status in (429, 500, 502, 503, 504) and attempt < MAX_RETRIES - 1:
                    delay = RETRY_BASE_DELAY * (2 ** attempt)
                    print(f"  Gemini {status} error, retrying in {delay}s (attempt {attempt + 1}/{MAX_RETRIES})...")
                    time.sleep(delay)
                    last_error = e
                    continue
                raise
        raise last_error
