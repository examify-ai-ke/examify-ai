"""Quick smoke test for the Z.ai LLM provider.

Usage: uv run python test_zai.py [path-to-md-file]
Defaults to DBIT 103 FOUNDATIONS OF MATHEMATICS (1).md
"""

import json
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

from exam_paper_parser.llm_providers.zai import ZAiLlmProvider
from exam_paper_parser.metadata import ExamPaperMetadataExtractor

MD_FILE = sys.argv[1] if len(sys.argv) > 1 else "DBIT 103 FOUNDATIONS OF MATHEMATICS (1).md"


def main():
    md_path = Path(__file__).parent / MD_FILE
    if not md_path.exists():
        print(f"File not found: {md_path}")
        sys.exit(1)

    print(f"Testing Z.ai provider with: {md_path.name}\n")

    provider = ZAiLlmProvider()
    extractor = ExamPaperMetadataExtractor(provider=provider)

    metadata = extractor.extract_metadata(markdown_file_url=str(md_path))

    print(json.dumps(metadata, indent=2))


if __name__ == "__main__":
    main()
