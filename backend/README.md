# Examify Enterprise Backend (FastAPI)

Welcome to the backend infrastructure for **Examify.ai** — the AI-Powered Assessment Ecosystem for Institutions and Students in Africa.

This backend powers both **Exampapel** (the B2C student platform) and **Examify Enterprise** (the B2B SaaS platform for educators), providing a robust, highly-scalable API driven by Retrieval-Augmented Generation (RAG).

## 🚀 Mission
We are solving the hardest problem in academic data: structuring legacy PDF past papers into intelligent, interactive data. Our backend consumes unstructured PDFs through a proprietary OCR pipeline and uses advanced LLMs and Vector Databases to provide safe, hallucination-free generation of new exam papers based on institutional data.

## 🛠️ Tech Stack
- **Framework:** FastAPI (Python >=3.10)
- **Database:** PostgreSQL (with SQLModel for async ORM)
- **Vector DB:** Qdrant / Pinecone (for RAG document retrieval)
- **Task Queue:** Celery with Redis broker (for async PDF ingestion and AI processing)
- **Authentication:** JWT with Role-Based Access Control (Admin, Educator, Student)
- **Storage:** MinIO (S3-compatible Object Storage for PDFs and assets)
- **Reverse Proxy:** Caddy

## ⚙️ Key Features
- **RAG Exam Generation:** Generates 100% syllabus-aligned exams using institutional historical data.
- **Intelligent Ingestion:** Automated pipeline to parse unstructured PDFs into rich Editor.js format.
- **AI Answer Generation:** Step-by-step automatic answer synthesis for past paper revision.
- **Educational Analytics:** Institutional difficulty indexing and Bloom's Taxonomy cognitive load mapping.

---

## 💻 Local Development

### Prerequisites
- Python 3.10+
- Docker & Docker Compose
- Make
- Poetry (for Python dependency management)

### 1. Environment Setup
Create a `.env` file from the example:
```bash
cp .env.example .env
```

### 2. Run with Docker Compose
We use Docker to spin up the FastAPI server, PostgreSQL, Redis, and MinIO locally.
```bash
# Build and run containers
make run-dev-build

# Or use standard docker compose
docker compose -f docker-compose-dev.yml up --build
```

### 3. Initialize Database
Generate initial data, including admin and test users:
```bash
make init-db
```
*(Default test users: admin@admin.com, manager@example.com, user@example.com with password: admin)*

### 4. Interactive API Documentation
Once running, the Swagger API docs are available at:
[http://fastapi.localhost/docs](http://fastapi.localhost/docs)

---

## 🧪 Testing & Quality Assurance
We use `pytest` and `pytest-asyncio` for comprehensive backend testing.

```bash
# Start test environment
make run-test

# Run pytest
make pytest
```

Code formatting is enforced using **Black** and **Ruff**:
```bash
make formatter
make lint
```

## 📚 Documentation
For deeper architectural overviews, check the `docs/` folder:
- `docs/AI-EDUCATION.md`: Full business and technical context.
- `docs/SMART_STARTUP_SYSTEM.md`: Architecture of our deployment pipeline.
- `docs/ENTERPRISE-WORKFLOW.md`: Documentation for B2B institutional onboarding.

---
*Built with ❤️ for African Education.*