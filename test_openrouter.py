"""Quick smoke test for the OpenRouter LLM provider.

Usage: uv run python test_openrouter.py [path-to-md-file]
Defaults to DBIT 103 FOUNDATIONS OF MATHEMATICS (1).md
"""

import json
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

from exam_paper_parser.llm_providers.openrouter import OpenRouterLlmProvider
from exam_paper_parser.metadata import ExamPaperMetadataExtractor

MD_FILE = sys.argv[1] if len(sys.argv) > 1 else "DBIT 103 FOUNDATIONS OF MATHEMATICS (1).md"


def main():
    md_path = Path(__file__).parent / MD_FILE
    if not md_path.exists():
        print(f"File not found: {md_path}")
        sys.exit(1)

    print(f"Testing OpenRouter provider with: {md_path.name}\n")

    provider = OpenRouterLlmProvider()
    # Override model for testing if needed
    test_model = sys.argv[2] if len(sys.argv) > 2 else None
    if test_model:
        provider.model = test_model
    print(f"Model: {provider.model}\n")

    extractor = ExamPaperMetadataExtractor(provider=provider)

    metadata = extractor.extract_metadata(markdown_file_url=str(md_path))

    print(json.dumps(metadata, indent=2))


if __name__ == "__main__":
    main()
