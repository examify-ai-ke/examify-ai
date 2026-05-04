from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID

class ExamGenerationRequest(BaseModel):
    institution_id: UUID = Field(..., description="The ID of the institution requesting the exam.")
    course_id: UUID = Field(..., description="The ID of the course.")
    module_id: Optional[UUID] = Field(None, description="Optional specific module to filter by.")
    total_marks: int = Field(50, description="The target total marks for the generated exam.")
    difficulty_level: str = Field("Medium", description="Target difficulty: Easy, Medium, Hard")
    numbering_style: str = Field("roman", description="Style of numbering: roman, alphabetic, numeric")
    exam_title: str = Field(..., description="The title of the exam paper")
    year_range: Optional[tuple[int, int]] = Field(None, description="Tuple of (start_year, end_year) to filter questions.")

class EditorJSBlock(BaseModel):
    id: str
    type: str
    data: Dict[str, Any]

class ExamGenerationResponse(BaseModel):
    status: str
    total_questions: int
    total_marks: int
    editor_js_payload: Dict[str, Any]
