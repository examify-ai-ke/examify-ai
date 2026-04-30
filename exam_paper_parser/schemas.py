from typing import List, Optional, Union, Literal, Any
from pydantic import BaseModel, Field, HttpUrl


class ParagraphData(BaseModel):
    text: str


class HeaderData(BaseModel):
    text: str
    level: int = Field(ge=1, le=6)


class ImageFile(BaseModel):
    url: HttpUrl
    name: str
    size: int
    width: Optional[int] = None
    height: Optional[int] = None
    format: Optional[str] = None


class ImageData(BaseModel):
    file: ImageFile
    caption: str = ""
    stretched: bool = False
    withBorder: bool = False
    withBackground: bool = False


class ListData(BaseModel):
    style: Literal["ordered", "unordered"] = "unordered"
    items: List[str]


class CodeData(BaseModel):
    code: str
    language: Optional[str] = None


class QuoteData(BaseModel):
    text: str
    caption: str = ""
    alignment: Literal["left", "center"] = "left"


class EditorJSBlock(BaseModel):
    id: str
    type: str
    data: Union[ParagraphData, HeaderData, ImageData, ListData, QuoteData, CodeData, Any]


class QuestionTextSchema(BaseModel):
    time: int
    blocks: List[EditorJSBlock] = Field(default_factory=list)


class SubQuestionCreateSchema(BaseModel):
    text: Optional[QuestionTextSchema] = None
    marks: Optional[int] = Field(None, ge=1, le=100)
    numbering_style: str = Field(default="alphabetic")
    question_number: str = Field(default="a")


class MainQuestionWithSubsSchema(BaseModel):
    text: Optional[QuestionTextSchema] = None
    marks: Optional[int] = Field(None, ge=1, le=100)
    numbering_style: str = Field(default="alphabetic")
    question_number: str = Field(..., min_length=1)
    sub_questions: List[SubQuestionCreateSchema] = Field(default_factory=list)


class QuestionSetCreateSchema(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    main_questions: List[MainQuestionWithSubsSchema] = Field(default_factory=list)


class QuestionSetWithQuestionsSchema(BaseModel):
    question_sets: List[QuestionSetCreateSchema] = Field(default_factory=list)


QuestionSetWithQuestionsSchema.model_rebuild()
