# exam-paper-parser

Convert raw exam paper PDFs into structured JSON with extracted questions, metadata, and images.

Two swappable OCR providers — **MinerU** and **Z.ai** — switchable via a single env var. All I/O flows through S3 with full processing history tracking.

## Install

```bash
pip install exam-paper-parser
```

Or from source:

```bash
git clone https://github.com/your-org/exam-paper-parser.git
cd exam-paper-parser
uv sync
```

## Quick Start

```bash
# Configure
cp .env.example .env
# Edit .env with your API keys and AWS credentials

# Run the full pipeline
exam-paper-parser

# Or as a module
python -m exam_paper_parser.cli
```

## Architecture

```
                        S3: examapapers (main bucket)
                       ┌──────────────────────────────────────────────────┐
                       │                                                  │
  Drop PDFs here ────► │  inbox/<institution>/*.pdf                      │
                       │        │                                         │
                       │        ▼ PHASE 1: PDF → Markdown                │
                       │        │  Provider: MinerU or Z.ai              │
                       │        │                                         │
                       │        ├─► staging/<institution>/*.md            │
                       │        └─► archive/<inst>/pdfs/*.pdf             │
                       │                                                  │
                       │        ▼ PHASE 2: Markdown → JSON (GLM-5.1)     │
                       │                                                  │
  Final output ◄────── │  output/<institution>/<exam_name>/              │
  Archived .md ◄────── │  archive/<institution>/markdown/*.md            │
  Failed files ◄────── │  failed/<institution>/                           │
  History ◄─────────── │  .system/manifest.json                           │
                       └──────────────────────────────────────────────────┘

                        S3: exampapel-images-bucket2025
                       ┌──────────────────────────────────────┐
  MinerU images ─────► │  <institution>/<exam_name>/           │
  Exam images ───────► │  (re-hosted from PDFs & markdown)    │
                       └──────────────────────────────────────┘
```

### S3 Layout

**Main bucket** (`examapapers`):

| Prefix | Purpose |
|---|---|
| `inbox/<institution>/*.pdf` | Drop raw exam paper PDFs here |
| `staging/<institution>/*.md` | Markdown files (Phase 1 output → Phase 2 input) |
| `output/<institution>/<exam_name>/` | Final output: `<name>.md` + `<name>.response.json` |
| `archive/<institution>/pdfs/` | Original PDFs moved here after successful conversion |
| `archive/<institution>/markdown/` | Processed `.md` files moved here after Phase 2 |
| `failed/<institution>/` | Files moved here on processing failure |
| `.system/manifest.json` | Full processing history |

**Images bucket** (`exampapel-images-bucket2025`):

| Prefix | Purpose |
|---|---|
| `<institution>/<exam_name>/` | Exam paper images (referenced in output) |

## Package Structure

```
exam_paper_parser/
├── __init__.py          # Public API exports
├── cli.py               # CLI entry point — 2-phase pipeline
├── pdf_parser.py        # Unified PDF parser (PdfParser orchestrator)
├── prompts.py           # LLM prompt templates
├── metadata.py          # Metadata extraction via Z.ai
├── schemas.py           # Pydantic question schemas
├── validator.py         # Output JSON validation
├── image_processor.py   # Image extraction, re-hosting to S3
├── s3_client.py         # S3 operations (main + images buckets)
├── tracking.py          # Processing tracker (S3 manifest + NocoDB)
└── providers/
    ├── __init__.py      # Provider factory
    ├── base.py          # PdfParserProvider ABC + ConversionResult
    ├── mineru.py        # MinerU Precision Extract API
    └── zai.py           # Z.ai GLM-OCR
```

## PDF Parser Providers

### MinerU (`PDF_PARSER_PROVIDER=mineru`)

Uses MinerU's Precision Extract API with the `vlm` model. Uploads PDF bytes directly to MinerU's OSS (MinerU servers can't reach AWS S3). Returns a zip containing markdown + extracted images.

**Features:**
- Formula and table recognition (configurable)
- Image extraction from PDFs (re-hosted to S3)
- Up to 200 MB / 200 pages per file

### Z.ai (`PDF_PARSER_PROVIDER=zai`)

Uses Z.ai's GLM-OCR API via presigned S3 URL. Simpler flow — returns markdown directly.

### Switching providers

```bash
# In .env
PDF_PARSER_PROVIDER=mineru   # or "zai"
```

Or programmatically:

```python
from exam_paper_parser import PdfParser, S3Client, ProcessingTracker

s3 = S3Client()
tracker = ProcessingTracker(s3)
parser = PdfParser(s3, tracker, provider="mineru")
parser.run()
```

## Environment Variables

### Required

| Variable | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | AWS credentials |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials |
| `AWS_REGION` | AWS region (default: `us-east-1`) |
| `S3_EXAMPAPERS_MAIN_BUCKET` | Main bucket for exam paper processing |
| `S3_EXAMPAPERS_IMAGES_BUCKET` | Separate bucket for exam paper images |
| `Z_API_KEY` | Z.ai API key |
| `MINERU_BEARER_TOKEN` | MinerU API token |

### Optional

| Variable | Description | Default |
|---|---|---|
| `PDF_PARSER_PROVIDER` | PDF parser: `"mineru"` or `"zai"` | `"mineru"` |
| `MAX_WORKERS` | Parallel workers for Phase 2 | `4` |
| `NOCODB_URL` | NocoDB instance URL | — |
| `NOCODB_API_KEY` | NocoDB API token | — |
| `NOCODB_TABLE` | NocoDB table name | `processed_exams` |

## Pipeline

### Phase 1: PDF → Markdown

1. Scan `inbox/<institution>/` for PDFs
2. Skip already-processed files
3. Download PDF, delegate to active provider:
   - **MinerU**: Upload to MinerU OSS → poll → download zip → extract markdown + images
   - **Z.ai**: Presigned URL → GLM-OCR → markdown
4. Re-host extracted images to S3 images bucket (MinerU)
5. Rewrite image references in markdown
6. Upload markdown to `staging/<institution>/`, move PDF to `archive/<institution>/pdfs/`

### Phase 2: Markdown → JSON

1. Scan `staging/<institution>/` for `.md` files
2. Extract metadata (institution, course, module, date) via Z.ai
3. Process images (download HTTP images, re-host to S3)
4. Parse questions via Z.ai with structured prompt
5. Validate output JSON
6. Upload results to `output/<institution>/<exam_name>/`
7. Move processed `.md` to `archive/<institution>/markdown/`

## Output Schema

Each `.response.json` contains:

```json
{
  "questions": {
    "question_sets": [
      {
        "title": "Question One",
        "main_questions": [
          {
            "question_number": "a",
            "numbering_style": "alphabetic",
            "marks": 6,
            "text": { "time": 1761416444650, "blocks": [...] },
            "sub_questions": [...]
          }
        ]
      }
    ]
  },
  "exam_paper": { "year_of_exam": "2010/2011", "exam_duration": 120, "exam_date": "2011-08-01" },
  "prerequisites": {
    "institution": { "name": "..." },
    "course": { "name": "..." },
    "modules": [...],
    "instructions": [...]
  }
}
```

Question text uses Editor.js block format (`paragraph`, `header`, `image`, `table`, `code`).

## Programmatic Usage

```python
from exam_paper_parser import (
    PdfParser,
    MinerUProvider,
    S3Client,
    ProcessingTracker,
    ExamPaperMetadataExtractor,
    validate_output,
)

# Use just the MinerU provider standalone
provider = MinerUProvider()
with open("exam.pdf", "rb") as f:
    result = provider.convert(file_url="", file_data=f.read(), filename="exam.pdf")
    print(result.markdown)       # Markdown text
    print(len(result.images))    # Extracted images

# Full pipeline
s3 = S3Client()
tracker = ProcessingTracker(s3)
parser = PdfParser(s3, tracker, provider="mineru")
stats = parser.run()
```

## License

MIT
