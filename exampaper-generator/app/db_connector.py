import os
from sqlalchemy import create_engine
from langchain_community.utilities import SQLDatabase
from dotenv import load_dotenv

load_dotenv()

# We expect a read-only database URL to be provided via environment variables
# e.g., postgresql+psycopg2://readonly_user:password@localhost:5432/examify_db
DB_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:postgres@localhost:5432/postgres")

def get_db_connection() -> SQLDatabase:
    """
    Creates a SQLAlchemy engine and wraps it in LangChain's SQLDatabase utility.
    We explicitly restrict the tables the AI can see to prevent hallucination 
    and improve query accuracy.
    """
    engine = create_engine(DB_URL)
    
    # Restrict the LLM to only see relevant exam schema tables
    include_tables = [
        "course",
        "module",
        "exam_paper",
        "question_set",
        "question",
        "exam_paper_question_link",
        "module_exams_link"
    ]
    
    db = SQLDatabase(engine, include_tables=include_tables)
    return db
