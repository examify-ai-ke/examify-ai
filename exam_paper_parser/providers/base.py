from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Dict, Optional


@dataclass
class ConversionResult:
    """What a provider returns after converting a document."""
    markdown: str
    images: Dict[str, bytes] = field(default_factory=dict)


class PdfParserProvider(ABC):
    """Each provider converts a PDF and returns markdown + embedded images."""

    @abstractmethod
    def convert(
        self,
        file_url: str,
        file_data: Optional[bytes] = None,
        filename: str = "",
    ) -> ConversionResult:
        """Convert a document.

        Args:
            file_url: Presigned S3 URL (used by providers that can reach it).
            file_data: Raw PDF bytes (used by providers that need direct upload).
            filename: Original filename (used for MinerU upload).

        Returns:
            ConversionResult with markdown text and any extracted images.
        """
