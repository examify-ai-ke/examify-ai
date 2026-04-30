"""CLI entry point for the exam-parser pipeline."""

import json
import os
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional

from dotenv import load_dotenv

from .metadata import ExamPaperMetadataExtractor
from .llm_providers import get_llm_provider
from .image_processor import process_images, replace_urls_in_json
from .validator import validate_output
from .pdf_parser import PdfParser
from .schemas import QuestionSetWithQuestionsSchema
from .s3_client import S3Client, PREFIX_OUTPUT, PREFIX_ARCHIVE, PREFIX_FAILED, PREFIX_STAGING
from .tracking import ProcessingTracker
from .prompts import QUESTION_EXTRACTION_PROMPT

load_dotenv()

llm = get_llm_provider()
extractor = ExamPaperMetadataExtractor(provider=llm)
s3 = S3Client()
tracker = ProcessingTracker(s3)
pdf_service = PdfParser(s3, tracker)

MAX_WORKERS = int(os.environ.get("MAX_WORKERS", 4))


def convert_exam_metadata(metadata: dict) -> dict:
    duration_str = metadata.get("exam_duration", "0 HOURS")
    try:
        duration_value = int(duration_str.split()[0])
        duration_minutes = duration_value * 60
    except (ValueError, IndexError):
        duration_minutes = 0

    year_of_exam = metadata.get("year_of_exam", "").replace("_", "/")

    exam_date_str = metadata.get("exam_date", "")
    if exam_date_str:
        try:
            month_name = exam_date_str.split()[0]
            year = int(exam_date_str.split()[-1])
            month_map = {
                "JANUARY": 1, "FEBRUARY": 2, "MARCH": 3, "APRIL": 4,
                "MAY": 5, "JUNE": 6, "JULY": 7, "AUGUST": 8,
                "SEPTEMBER": 9, "OCTOBER": 10, "NOVEMBER": 11, "DECEMBER": 12,
            }
            month = month_map.get(month_name.upper(), 1)
            exam_date = datetime(year, month, 1).date()
        except (ValueError, IndexError):
            exam_date = datetime.now().date()
    else:
        exam_date = datetime.now().date()

    instructions_list = metadata.get("instructions", [])
    if isinstance(instructions_list, str):
        instructions_list = [instructions_list]
    instructions = [{"name": instruction} for instruction in instructions_list]

    courses = metadata.get("course", [])
    modules = metadata.get("module", [])
    module_code = metadata.get("module_code", "")

    modules_list = []
    if modules and module_code:
        modules_list.append({
            "name": modules[0] if modules else "",
            "unit_code": module_code,
            "description": "",
        })

    return {
        "exam_paper": {
            "year_of_exam": year_of_exam,
            "exam_duration": duration_minutes,
            "exam_date": exam_date,
            "tags": [],
        },
        "prerequisites": {
            "exam_title": {
                "name": metadata.get("exam_title", ""),
                "description": "",
            },
            "exam_description": {
                "name": metadata.get("exam_description", ""),
                "description": "",
            },
            "course": {
                "name": courses[0] if courses else "",
                "course_acronym": "",
                "description": "",
            },
            "institution": {
                "name": metadata.get("institution", "").replace("-", " ").title(),
                "description": "",
                "category": "",
                "institution_type": "",
                "location": "",
            },
            "programme": {
                "name": metadata.get("programme_name", ""),
                "description": "",
            },
            "modules": modules_list,
            "instructions": instructions,
        },
    }


def generate_from_text(markdown_text: str, metadata: dict) -> dict:
    print(f"Input length: {len(markdown_text)} chars")

    json_response = llm.chat_completion(
        system_prompt=QUESTION_EXTRACTION_PROMPT,
        user_message=markdown_text,
    )
    converted_metadata = convert_exam_metadata(metadata)

    json_questions = json.loads(json_response)
    if isinstance(json_questions, list):
        json_questions = {"question_sets": json_questions}
    final_output = {"questions": json_questions}
    final_output.update(converted_metadata)
    return final_output


def process_file(s3_key: str, institution: str) -> Optional[str]:
    filename = Path(s3_key).name

    print(f"\n{'='*80}")
    print(f"Processing: {s3_key}")
    print(f"{'='*80}")

    try:
        markdown_text = s3.download_as_text(s3_key)

        metadata = extractor.extract_metadata(markdown_text=markdown_text)
        if "error" in metadata:
            print(f"Metadata extraction failed: {metadata['error']}")
            return None

        new_folder_name = extractor.generate_exampaper_name(metadata)
        metadata["institution"] = institution

        paper_id = new_folder_name.rsplit("_", 1)[-1]
        metadata["paper_id"] = paper_id.strip()

        source_s3_dir = str(Path(s3_key).parent) + "/"

        img_result = process_images(markdown_text, s3, institution, new_folder_name, source_s3_dir)
        markdown_text = img_result["updated_markdown"]
        url_map = img_result["url_map"]
        if img_result["uploaded_count"]:
            print(f"  Re-hosted {img_result['uploaded_count']} image(s) to S3 images bucket")
        if img_result["errors"]:
            for err in img_result["errors"]:
                print(f"  Image warning: {err}")

        output_prefix = f"{PREFIX_OUTPUT}{institution}/{new_folder_name}"

        s3.upload_text(
            markdown_text,
            f"{output_prefix}/{new_folder_name}.md",
            content_type="text/markdown",
        )
        print(f"Uploaded source .md to s3://{s3.bucket}/{output_prefix}/{new_folder_name}.md")

        final_output = generate_from_text(markdown_text, metadata)

        if url_map:
            final_output = replace_urls_in_json(final_output, url_map)
            print(f"  Replaced {len(url_map)} image URL(s) in JSON output")

        validation = validate_output(final_output)
        if validation["valid"]:
            print(f"  JSON validation: PASSED")
        else:
            print(f"  JSON validation: {len(validation['errors'])} issue(s)")
            for err in validation["errors"][:5]:
                print(f"    - {err}")

        output_json_key = f"{output_prefix}/{new_folder_name}.response.json"
        s3.upload_text(
            json.dumps(final_output, indent=2, ensure_ascii=False, default=str),
            output_json_key,
            content_type="application/json",
        )
        print(f"Uploaded parsed output to s3://{s3.bucket}/{output_json_key}")

        processed_key = f"{PREFIX_ARCHIVE}{institution}/markdown/{filename}"
        s3.move_object(s3_key, processed_key)
        print(f"Moved source to s3://{s3.bucket}/{processed_key}")

        tracker.mark_processed(
            source_key=s3_key,
            institution=institution,
            exam_name=new_folder_name,
            paper_id=paper_id,
            output_key=output_prefix,
            metadata=metadata,
            status="success" if validation["valid"] else "success_with_warnings",
        )

        return output_prefix

    except Exception as e:
        print(f"Error processing {s3_key}: {e}")

        failed_key = f"{PREFIX_FAILED}{institution}/{filename}"
        try:
            s3.move_object(s3_key, failed_key)
            print(f"Moved failed file to s3://{s3.bucket}/{failed_key}")
        except Exception as move_err:
            print(f"Could not move failed file: {move_err}")

        tracker.mark_processed(
            source_key=s3_key,
            institution=institution,
            exam_name=filename,
            paper_id="",
            output_key="",
            metadata={"module_code": "", "module": [], "exam_date": "", "year_of_exam": ""},
            status="error",
            error_message=str(e),
        )

        return None


def run(source_mode: str = "s3"):
    """Main entry point.

    Pipeline:
      1. Convert raw PDFs to markdown (raw_pdf/ -> source institution folders)
      2. Process markdown files (source -> parsed-outputs/)
    """
    if source_mode == "local":
        _run_local()
        return

    # Phase 1: PDF -> Markdown conversion
    print("=" * 80)
    print("PHASE 1: PDF -> Markdown conversion")
    print("=" * 80)
    pdf_service.run()

    # Phase 2: Markdown -> Structured JSON processing
    print("\n" + "=" * 80)
    print("PHASE 2: Markdown -> Structured JSON processing")
    print("=" * 80)
    print("Scanning staging/ for .md files...")
    institution_files = s3.list_staging_files()

    if not institution_files:
        print("No .md files found in staging/.")
        return

    already_processed = tracker.get_processed_keys()

    pending: list[tuple[str, str]] = []
    skipped = 0

    for institution, s3_keys in institution_files.items():
        print(f"  {institution}: {len(s3_keys)} file(s)")
        for s3_key in s3_keys:
            if s3_key in already_processed:
                print(f"  Skipping already processed: {s3_key}")
                skipped += 1
            else:
                pending.append((s3_key, institution))

    print(f"\n{len(pending)} file(s) to process | {skipped} skipped | {MAX_WORKERS} workers")

    if not pending:
        return

    processed = 0
    failed = 0

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {
            pool.submit(process_file, s3_key, institution): s3_key
            for s3_key, institution in pending
        }
        for future in as_completed(futures):
            s3_key = futures[future]
            try:
                result = future.result()
                if result:
                    processed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"Worker error for {s3_key}: {e}")
                failed += 1

    print(f"\n{'='*80}")
    print(f"Processing complete.")
    print(f"  Total found:    {len(pending) + skipped}")
    print(f"  Skipped:        {skipped}")
    print(f"  Processed:      {processed}")
    print(f"  Failed:         {failed}")
    stats = tracker.get_processing_stats()
    print(f"  All-time total: {stats['total_processed']}")
    print(f"{'='*80}")


def _run_local():
    """Legacy local filesystem mode."""
    base_markdown_dir = Path("./past_exam_papers/markdown")
    base_output_dir = Path("./past_exam_papers/parsed_outputs")
    base_markdown_dir.mkdir(parents=True, exist_ok=True)
    base_output_dir.mkdir(parents=True, exist_ok=True)

    import shutil

    institution_files: Dict[str, list] = {}
    for institution_dir in base_markdown_dir.iterdir():
        if institution_dir.is_dir():
            md_files = list(institution_dir.glob("*.md"))
            if md_files:
                institution_files[institution_dir.name] = md_files

    if not institution_files:
        print(f"No markdown files found under {base_markdown_dir}")
        return

    files_processed = 0
    for institution_name, md_files in institution_files.items():
        print(f"\nProcessing institution: {institution_name}")
        inst_out_dir = base_output_dir / institution_name
        inst_out_dir.mkdir(parents=True, exist_ok=True)

        for md_path in md_files:
            print(f"\nProcessing: {md_path.name}")
            markdown_text = md_path.read_text(encoding="utf-8")

            metadata = extractor.extract_metadata(markdown_text=markdown_text)
            new_folder_name = extractor.generate_exampaper_name(metadata)

            new_output_dir = inst_out_dir / new_folder_name
            new_output_dir.mkdir(parents=True, exist_ok=True)

            paper_id = new_folder_name.rsplit("_", 1)[-1]
            metadata["institution"] = institution_name
            metadata["paper_id"] = paper_id.strip()

            new_md_file = new_output_dir / f"{new_folder_name}.md"
            shutil.copy2(md_path, new_md_file)

            final_output = generate_from_text(markdown_text, metadata)
            out_json = new_output_dir / f"{new_folder_name}.response.json"
            out_json.write_text(
                json.dumps(final_output, indent=2, ensure_ascii=False, default=str),
                encoding="utf-8",
            )
            print(f"Saved output to {out_json}")

            md_path.unlink()
            files_processed += 1

    print(f"\nDone. {files_processed} file(s) processed locally.")


def retry_failed(phase: str = "all"):
    """Move files from failed/ back to their input location and reprocess them.

    Args:
        phase: "pdf" to retry Phase 1 (PDFs -> inbox),
               "md" to retry Phase 2 (markdown -> staging),
               "all" to retry both.
    """
    failed_files = s3.list_failed_files()
    if not failed_files:
        print("No failed files found.")
        return

    total = sum(len(keys) for keys in failed_files.values())
    print(f"Found {total} failed file(s) across {len(failed_files)} institution(s)\n")

    pdf_count = 0
    md_count = 0

    for institution, keys in failed_files.items():
        for s3_key in keys:
            filename = Path(s3_key).name

            if filename.lower().endswith(".pdf") and phase in ("pdf", "all"):
                dest = f"{PREFIX_INBOX}{institution}/{filename}"
                s3.move_object(s3_key, dest)
                print(f"  PDF retry: {s3_key} -> {dest}")
                pdf_count += 1

            elif filename.lower().endswith(".md") and phase in ("md", "all"):
                dest = f"{PREFIX_STAGING}{institution}/{filename}"
                s3.move_object(s3_key, dest)
                print(f"  MD retry:  {s3_key} -> {dest}")
                md_count += 1

    # Remove old error entries from manifest so they get reprocessed
    tracker.remove_by_status("error")

    print(f"\nMoved {pdf_count} PDF(s) to inbox/, {md_count} markdown file(s) to staging/")

    # Run the pipeline to reprocess
    if pdf_count > 0 or md_count > 0:
        print("\nRe-running pipeline on retried files...\n")
        run(source_mode="s3")


def main():
    mode = "s3"
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        if arg == "--local":
            mode = "local"
        elif arg == "--retry-failed":
            phase = sys.argv[2] if len(sys.argv) > 2 else "all"
            retry_failed(phase=phase)
            return
    run(source_mode=mode)


if __name__ == "__main__":
    main()
