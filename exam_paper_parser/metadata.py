import json
import os
import time
import uuid
from pathlib import Path
from typing import Dict, List, Optional

from pydantic import BaseModel, Field
from zai import ZaiClient
from decouple import config

from .prompts import METADATA_EXTRACTION_PROMPT


def _get_zai_client():
    return ZaiClient(
        api_key=config("Z_API_KEY", ""),
        base_url="https://api.z.ai/api/paas/v4/chat/completions",
    )


ZAI_MAX_RETRIES = 3
ZAI_RETRY_BASE_DELAY = 5


def z_chat_completion(messages_list: list) -> str:
    """Send a chat completion request to Z.ai with retry on 429/5xx."""
    last_error = None
    for attempt in range(ZAI_MAX_RETRIES):
        try:
            client = _get_zai_client()
            completion = client.chat.completions.create(
                model=os.environ.get("Z_API_MODEL", "glm-5.1"),
                messages=messages_list,
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
            if status in (429, 500, 502, 503, 504) and attempt < ZAI_MAX_RETRIES - 1:
                delay = ZAI_RETRY_BASE_DELAY * (2 ** attempt)
                print(f"  Z.ai {status} error, retrying in {delay}s (attempt {attempt + 1}/{ZAI_MAX_RETRIES})...")
                time.sleep(delay)
                last_error = e
                continue
            raise
    raise last_error


class ExamPaperMetadataSchema(BaseModel):
    year_of_exam: Optional[str] = Field(None, description="Academic year in YYYY_YYYY format")
    exam_date: Optional[str] = Field(None, description="Date of examination")
    exam_duration: Optional[str] = Field(None, description="Duration of the examination")
    instructions: Optional[str] = Field(None, description="Examination instructions")
    exam_description: Optional[str] = Field(None, description="Description of exam level/stage")
    exam_title: Optional[str] = Field(None, description="Main title of the examination")
    course: Optional[List[str]] = Field(default_factory=list, description="List of degree/course programs")
    module: Optional[List[str]] = Field(default_factory=list, description="List of subject/module names")
    module_code: Optional[str] = Field(None, description="Course/module code identifier")
    programme_name: Optional[str] = Field(None, description="Name of the academic programme")


class ExamPaperMetadataExtractor:
    def __init__(self, api_key=os.environ.get("GEMINI_API_KEY")):
        pass

    def extract_metadata(
        self, markdown_file_url=None, markdown_text: Optional[str] = None
    ) -> dict:
        if markdown_text:
            text_head = markdown_text[:2500]
        elif markdown_file_url:
            try:
                with open(markdown_file_url, "r", encoding="utf-8") as f:
                    text_head = f.read()[:2500]
            except FileNotFoundError:
                return {"error": f"File not found: {markdown_file_url}"}
        else:
            return {"error": "No markdown content provided"}

        try:
            prompt = METADATA_EXTRACTION_PROMPT + "\nHere is the schema of the output format we expect:\n"
            prompt += json.dumps(ExamPaperMetadataSchema.model_json_schema())

            z_messages = [
                {"role": "system", "content": prompt},
                {"role": "user", "content": text_head},
            ]
            metadata_response_text = z_chat_completion(z_messages)
            metadata = json.loads(metadata_response_text)
            return metadata
        except Exception as e:
            raise Exception(f"Error extracting metadata: {str(e)}")

    def generate_exampaper_name(self, metadata: Dict) -> str:
        module_code = metadata["module_code"].replace(" ", "_").replace("/", "_")
        module_name = metadata["module"][0].title().replace(" ", "_").replace("/", "_")
        exam_date = metadata["exam_date"].replace(" ", "_").replace("/", "_")
        year = metadata["year_of_exam"].replace("/", "_").replace(" ", "_")
        return f"{module_code}_{exam_date}_{module_name}_{year}_{uuid.uuid4().hex}"
