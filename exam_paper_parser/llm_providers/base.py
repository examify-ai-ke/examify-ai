from abc import ABC, abstractmethod


class LlmProvider(ABC):
    """Base class for LLM providers used in metadata extraction."""

    @abstractmethod
    def chat_completion(self, system_prompt: str, user_message: str) -> str:
        """Send a chat completion request and return the raw text response."""
