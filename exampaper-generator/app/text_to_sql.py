import os
from langchain_openai import ChatOpenAI
from langchain.chains import create_sql_query_chain
from langchain_community.tools.sql_database.tool import QuerySQLDataBaseTool
from operator import itemgetter
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from app.db_connector import get_db_connection
from app.schemas import ExamGenerationRequest
from dotenv import load_dotenv

load_dotenv()

# Setup the LLM - defaulting to GPT-4o for high reasoning capabilities
llm = ChatOpenAI(model="gpt-4o", temperature=0)

def generate_sql_query(request: ExamGenerationRequest) -> str:
    """
    Uses LangChain to translate the natural language constraints into a PostgreSQL query.
    """
    db = get_db_connection()
    
    # 1. We create the query generation chain
    # This chain looks at the DB schema and our prompt, and outputs raw SQL
    generate_query = create_sql_query_chain(llm, db)
    
    # 2. We construct a highly specific natural language prompt based on the request
    prompt_text = f"""
    Find exactly enough questions to total approximately {request.total_marks} marks.
    The questions MUST belong to course_id '{request.course_id}' and institution_id '{request.institution_id}'.
    """
    
    if request.module_id:
        prompt_text += f"\nFilter specifically for module_id '{request.module_id}'."
        
    prompt_text += f"\nFilter for a difficulty level roughly corresponding to '{request.difficulty_level}'."
    prompt_text += "\nOnly return the 'text', 'marks', and 'numbering_style' columns from the question table."
    prompt_text += "\nEnsure you JOIN across exam_paper, exam_paper_question_link, and question_set appropriately."
    
    # Generate the SQL
    response = generate_query.invoke({"question": prompt_text})
    
    # Clean the output (sometimes LLMs wrap SQL in markdown blocks)
    sql_query = response.replace("```sql", "").replace("```", "").strip()
    return sql_query

def execute_and_fetch_questions(request: ExamGenerationRequest) -> list:
    """
    Generates the SQL, executes it against the read-only DB, and returns the raw rows.
    """
    db = get_db_connection()
    sql_query = generate_sql_query(request)
    
    print(f"Generated SQL: {sql_query}")
    
    execute_query = QuerySQLDataBaseTool(db=db)
    raw_results = execute_query.invoke(sql_query)
    
    return raw_results
