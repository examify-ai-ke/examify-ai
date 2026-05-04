from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(
    title="Exampaper Generator API",
    description="Text-to-SQL API for generating exam papers from historical data.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "exampaper-generator"}

from app.schemas import ExamGenerationRequest, ExamGenerationResponse
from app.text_to_sql import execute_and_fetch_questions
from app.exam_assembler import assemble_exam_json

@app.post("/api/v1/exams/generate", response_model=ExamGenerationResponse)
async def generate_exam(request: ExamGenerationRequest):
    \"\"\"
    Main endpoint for generating an exam paper via Text-to-SQL.
    \"\"\"
    try:
        # 1. Translate constraints to SQL and fetch raw questions
        raw_db_results = execute_and_fetch_questions(request)
        
        # 2. Re-assemble into Editor.js JSON format
        editor_payload = assemble_exam_json(raw_db_results, request.numbering_style)
        
        # We don't have a strict parser for counting questions from the JSON easily here, 
        # so we pass placeholder counters to be enriched later or derived from payload lengths
        return ExamGenerationResponse(
            status="success",
            total_questions=len(editor_payload.get("blocks", [])), 
            total_marks=request.total_marks,
            editor_js_payload=editor_payload
        )
    except Exception as e:
        return ExamGenerationResponse(
            status=f"error: {str(e)}",
            total_questions=0,
            total_marks=0,
            editor_js_payload={"time": 0, "blocks": [], "version": "2.28.0"}
        )

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
