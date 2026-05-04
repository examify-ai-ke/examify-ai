import json
import time
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from app.schemas import ExamGenerationResponse

# We use a slightly more creative temperature for assembly, but strict formatting
llm = ChatOpenAI(model="gpt-4o", temperature=0.1)

ASSEMBLY_PROMPT = """
You are an expert academic exam assembler. 
I am going to provide you with a raw list of database rows containing exam questions and their marks.

Your job is to format these questions into a STRICT JSON object that complies exactly with the Editor.js block format.

REQUIREMENTS:
1. The output MUST be a valid JSON object.
2. Group the questions logically (e.g., using "header" blocks for "SECTION A").
3. Use the requested numbering style: {numbering_style}.
4. Append the marks to the end of each question text (e.g., "... (5 Marks)").

EDITOR.JS FORMAT SPECIFICATION:
{{
    "time": 1714859000,
    "blocks": [
        {{
            "id": "random_string_1",
            "type": "header",
            "data": {{ "text": "QUESTION ONE", "level": 2 }}
        }},
        {{
            "id": "random_string_2",
            "type": "paragraph",
            "data": {{ "text": "a) Here is the first question text. (5 Marks)" }}
        }}
    ],
    "version": "2.28.0"
}}

RAW DATABASE ROWS TO ASSEMBLE:
{raw_db_results}

ONLY return the JSON object. Do not wrap it in markdown. Do not include explanations.
"""

def assemble_exam_json(raw_db_results: str, numbering_style: str) -> dict:
    """
    Takes the raw text string returned by the database execution 
    and forces the LLM to format it into Editor.js JSON blocks.
    """
    prompt = ChatPromptTemplate.from_template(ASSEMBLY_PROMPT)
    chain = prompt | llm
    
    response = chain.invoke({
        "raw_db_results": raw_db_results,
        "numbering_style": numbering_style
    })
    
    # Parse the LLM's string response into an actual python dictionary
    try:
        content = response.content.replace("```json", "").replace("```", "").strip()
        editor_payload = json.loads(content)
        
        # Ensure the timestamp is current
        editor_payload["time"] = int(time.time() * 1000)
        
        return editor_payload
    except json.JSONDecodeError as e:
        print(f"Failed to parse LLM output as JSON: {e}")
        # Fallback empty payload
        return {
            "time": int(time.time() * 1000),
            "blocks": [],
            "version": "2.28.0"
        }
