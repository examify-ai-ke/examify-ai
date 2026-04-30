"""exam-paper-parser — Exam paper PDF to structured JSON pipeline.

Public API:
    PdfParser          — Unified PDF-to-Markdown service with swappable providers
    MinerUProvider     — MinerU Precision Extract API backend
    ZAiProvider        — Z.ai GLM-OCR backend
    S3Client           — S3 operations (dual-bucket)
    ProcessingTracker  — Processing history (S3 manifest + optional NocoDB)
    ExamPaperMetadataExtractor — Metadata extraction via Z.ai
    validate_output    — JSON output validation
"""

from .pdf_parser import PdfParser
from .providers import MinerUProvider, ZAiProvider, get_provider
from .providers.base import ConversionResult, PdfParserProvider
from .s3_client import S3Client
from .tracking import ProcessingTracker
from .metadata import ExamPaperMetadataExtractor, z_chat_completion
from .image_processor import process_images, replace_urls_in_json
from .validator import validate_output
from .schemas import QuestionSetWithQuestionsSchema
from .prompts import QUESTION_EXTRACTION_PROMPT

__version__ = "0.3.0"
