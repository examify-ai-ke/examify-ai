import os

from .base import LlmProvider
from .zai import ZAiLlmProvider
from .openrouter import OpenRouterLlmProvider
from .gemini import GeminiLlmProvider

PROVIDERS = {
    "zai": ZAiLlmProvider,
    "openrouter": OpenRouterLlmProvider,
    "gemini": GeminiLlmProvider,
}


def get_llm_provider(name: str | None = None) -> LlmProvider:
    """Instantiate an LLM provider by name.

    Falls back to the METADATA_PROVIDER env var, then to "zai".
    """
    name = name or os.environ.get("METADATA_PROVIDER", "zai")
    cls = PROVIDERS.get(name.lower())
    if cls is None:
        raise ValueError(
            f"Unknown LLM provider '{name}'. Available: {list(PROVIDERS.keys())}"
        )
    return cls()
