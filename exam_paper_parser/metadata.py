import json
import uuid
from typing import Dict, List, Optional

from pydantic import BaseModel, Field

from .llm_providers import get_llm_provider
from .llm_providers.base import LlmProvider
from .prompts import METADATA_EXTRACTION_PROMPT


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
    def __init__(self, provider: LlmProvider | None = None):
        self.provider = provider or get_llm_provider()

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

            response_text = self.provider.chat_completion(
                system_prompt=prompt,
                user_message=text_head,
            )
            return json.loads(response_text)
        except Exception as e:
            raise Exception(f"Error extracting metadata: {str(e)}")

    def generate_exampaper_name(self, metadata: Dict) -> str:
        module_code = metadata["module_code"].replace(" ", "_").replace("/", "_")
        module_name = metadata["module"][0].title().replace(" ", "_").replace("/", "_")
        exam_date = metadata["exam_date"].replace(" ", "_").replace("/", "_")
        year = metadata["year_of_exam"].replace("/", "_").replace(" ", "_")
        return f"{module_code}_{exam_date}_{module_name}_{year}_{uuid.uuid4().hex}"
