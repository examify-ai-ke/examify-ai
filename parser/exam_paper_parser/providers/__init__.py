from .base import PdfParserProvider, ConversionResult
from .mineru import MinerUProvider
from .zai import ZAiProvider

PROVIDERS = {
    "zai": ZAiProvider,
    "mineru": MinerUProvider,
}


def get_provider(name: str) -> PdfParserProvider:
    """Instantiate a provider by name (case-insensitive)."""
    cls = PROVIDERS.get(name.lower())
    if cls is None:
        raise ValueError(
            f"Unknown PDF parser provider '{name}'. "
            f"Available: {list(PROVIDERS.keys())}"
        )
    return cls()
