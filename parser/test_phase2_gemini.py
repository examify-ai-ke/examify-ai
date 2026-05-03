"""Test Phase 2 (metadata + question extraction) with the Gemini provider.

Usage: uv run python test_phase2_gemini.py [path-to-md-file]
Defaults to DBIT 103 FOUNDATIONS OF MATHEMATICS (1).md
"""

import json
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

from exam_paper_parser.llm_providers import get_llm_provider
from exam_paper_parser.metadata import ExamPaperMetadataExtractor
from exam_paper_parser.prompts import QUESTION_EXTRACTION_PROMPT
from exam_paper_parser.validator import validate_output

MD_FILE = sys.argv[1] if len(sys.argv) > 1 else "DBIT 103 FOUNDATIONS OF MATHEMATICS (1).md"


def main():
    md_path = Path(__file__).parent / MD_FILE
    if not md_path.exists():
        print(f"File not found: {md_path}")
        sys.exit(1)

    print(f"=== Phase 2 test with Gemini — {md_path.name} ===\n")

    llm = get_llm_provider()
    print(f"Provider: {type(llm).__name__}\n")

    extractor = ExamPaperMetadataExtractor(provider=llm)
    markdown_text = md_path.read_text(encoding="utf-8")

    # Step 1: Metadata extraction
    print("--- Step 1: Metadata extraction ---")
    metadata = extractor.extract_metadata(markdown_text=markdown_text)
    print(json.dumps(metadata, indent=2))

    if "error" in metadata:
        print(f"\nMetadata extraction failed: {metadata['error']}")
        sys.exit(1)

    # Step 2: Question extraction
    print("\n--- Step 2: Question extraction ---")
    json_response = llm.chat_completion(
        system_prompt=QUESTION_EXTRACTION_PROMPT,
        user_message=markdown_text,
    )
    questions = json.loads(json_response)
    if isinstance(questions, list):
        questions = {"question_sets": questions}

    final_output = {"questions": questions}
    print(f"Extracted {len(questions.get('question_sets', []))} question set(s)")

    # Step 3: Validation
    print("\n--- Step 3: Validation ---")
    validation = validate_output(final_output)
    if validation["valid"]:
        print("Validation: PASSED")
    else:
        print(f"Validation: {len(validation['errors'])} issue(s)")
        for err in validation["errors"][:5]:
            print(f"  - {err}")

    # Save output
    out_file = Path(__file__).parent / "test_phase2_output.json"
    out_file.write_text(json.dumps(final_output, indent=2, ensure_ascii=False, default=str))
    print(f"\nOutput saved to {out_file}")


if __name__ == "__main__":
    main()
