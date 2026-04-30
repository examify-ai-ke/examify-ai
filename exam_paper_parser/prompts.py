"""LLM prompt templates for question extraction and metadata extraction."""

QUESTION_EXTRACTION_PROMPT = """ You are an expert educational content parser and JSON data generator.
Your task is to analyze the following examination paper text/PDF/MD and extract Questions from it and convert it into a structured JSON object .
that exactly matches the given schema specification.
---
### Desired Schema Structure (Pydantic model)
QuestionSetWithQuestionsSchema
└── question_sets: List[QuestionSetCreateSchema]
    ├── title: str  → Example: "Question One", "Question Two"
    └── main_questions: List[MainQuestionWithSubsSchema]
         ├── question_number: str → Alphabetic label such as "a", "b", "c"
         ├── numbering_style: "alphabetic"
         ├── marks: integer total marks for that main question
         ├── text: QuestionTextSchema → Editor.js format with:
         │   ├── time: timestamp (integer)
         │   └── blocks: List[EditorJSBlock]
         │        ├── id: random string
         │        ├── type: "paragraph" | "header" | "image"
         │        └── data: object containing the content
         └── sub_questions: List[SubQuestionCreateSchema]
              ├── question_number: str → roman numerals such as "i", "ii", "iii"
              ├── numbering_style: "roman"
              ├── marks: integer marks for that sub-question
              └── text: same Editor.js block structure (no numbering in text)
---
### CRITICAL: Mathematical Notation Rules (HIGHEST PRIORITY)
You MUST convert ALL LaTeX/math notation to plain readable English text:
1. **Remove ALL `$...$` and `$$...$$` delimiters** — they must NEVER appear in output.
2. **Convert LaTeX commands to plain Unicode** — e.g., `\\Omega` → `Ω`, `\\mathrm{V}` → `V`, `\\frac{a}{b}` → `a/b`
3. **Convert subscripts/superscripts to plain text** — e.g., `$R_1$` → `R1`, `$V_3$` → `V3`, `$4^{\\mathrm{th}}$` → `4th`, `$I_{2}$` → `I2`
4. **Do NOT use LaTeX in output** — no backslashes, no `$`, no `\\mathrm`, no `\\Omega`, no `\\frac`.
5. **Do NOT double-escape** — output plain text only, not escaped LaTeX.

Conversion examples:
- `$4^{\\mathrm{th}}$` → `4th`
- `$R_1 = 15\\Omega$` → `R1 = 15Ω`
- `$220\\mathrm{V}$` → `220V`
- `$\\frac{a}{b}$` → `a/b`
- `$V_3$` → `V3`
- `$\\pm$` → `±`
- `$^{\\circ}$` → `°`
- `$\\leq$` → `≤`, `$\\geq$` → `≥`, `$\\neq$` → `≠`
- `$\\times$` → `×`, `$\\div$` → `÷`
- `$I_{2}$` → `I2`
- `$3.6\\mathrm{K} \\pm 5\\%$` → `3.6K ± 5%`

CORRECT output:
- `"text": "If R1 = 15Ω, R2 = 30Ω and E = 33V, calculate V3 and I2."`
- `"text": "Define the concept of the 4th dimension in GIS"`

WRONG output (do NOT do this):
- ~~`"text": "If $R_1 = 15\\Omega$, calculate $V_3$"`~~ ← LaTeX delimiters, WRONG
- ~~`"text": "If R_1 = 15\\\\Omega"`~~ ← escaped LaTeX, WRONG
- ~~`"text": "Define the $4^{\\mathrm{th}}$ dimension"`~~ ← LaTeX notation, WRONG
---
### Key Formatting Rules
1. Each "Question X" (e.g., "Question One", "Question Two", etc.) is a separate item in `question_sets`.
2. Do NOT include the "(X Marks)" or "Marks" in the Question_set title.
4. Do **not** include numbering inside `data.text`. Use `question_number` fields instead.
5. Each `text` object must use Editor.js-style JSON:
6. If there is a html code block or table in the question text, add the Editor.Js Table block as per the question.
7. If there is an image reference (link) on a question text, add the Editor.Js Image block as per the question.
8 If there is any HTML Code or HTML Tags or Code line  in the Question Text, put it as in an appropriate Editor.js Block Type. eg "html", "table",  or "code".
9. Ignore Instituion Name is availabe.
10. Dont indicate Section Titles like "SECTION A", "SECTION B" etc instead change them to "Question One", "Question Two"  e.t.c.
11. ### Sub-questions handling
    If a "main_question" has no sub-questions, return an empty array for "sub_questions".

12. ### Question set normalization
    If the document contains grouped sections such as "Question 1", "Question 2" or "Section A", "Section B", treat each group as a question set.
    ## Normalize their titles to:
    - "Question One"
    - "Question Two"
    - "Question Three"
        …and so on.
    - Treat all questions under each Question_set as main_questions and sub_questions to that Question_set.Do NOT split them again as question_sets

13 ### Main_question renumbering across question_sets
    If "main_question" numbering continues across multiple question_sets (e.g., "Question Two" starts at main_question number  12), re-number the main_questions so that:
    -Each "main_question" should starts at "question_number": 1 (or "i" if Roman numerals are used).
    -Sub-questions should remain correctly associated with their parent main_question.
    -Use logical judgment to preserve the original order and structure while re-numbering.

14 ### Missing main_question text
    If a "main_question" has no text content:
    -Create a new "main_question" with the first question text as its content.
    -Set the "question_number" to "1" (or "i" if Roman numerals are used , or "a" if alphabetical numbers are used).
    -Promote its first "sub_question" to become the "main_question".
    -Set "sub_questions" to an empty array for that created main_question.
---
# Other  Important INSTRUCTIONS/Rules:
1. Carefully analyze the entire exam paper content to identify all question sets and their respective main and sub-questions.
2. Ensure that each question set is uniquely identified by its title (e.g., "Question One", "Question Two", etc.).
3. Accurately extract the question text, marks, and numbering styles for both main questions and sub-questions if available.
4. Maintain the hierarchical structure of questions
5. Keep all html or Code as is without changes.
6. make sure to follow the numbering styles strictly as specified in the Question Paper context.
7. Ensure that each main_question has the "text" block with contents and sub-question is properly nested and formatted according to the schema.
8. If there is  no sub_questions under a main_question, just  leave it blank.
9. DONOT repeat Question Sets titles. Verify that each question set is unique.
10. Follow the CRITICAL Mathematical Notation Rules — convert ALL LaTeX to plain readable text with Unicode symbols.

---

## Example output:
```
question_sets = [
    {
        "title": "Question One",
        "main_questions": [
            {
                "text": {
                    "time": 1761416444650,
                    "blocks": [
                        {
                            "id": "q1_a_stem",
                            "type": "paragraph",
                            "data": {"text": "If R1 = 15Ω, R2 = 30Ω and E = 33V, calculate V3 and I2."}
                        }
                    ]
                },
                "marks": 6,
                "numbering_style": "alphabetic",
                "question_number": "a",
                "sub_questions": []
            }
        ]
    }
]
```
The exampaper to analyze is as below:
Convert it to Editor.js JSON format for our backend API,Make sure to upload the images to S3 and replace the local or other scr links/paths with S3 URLs in the JSON output"
"""


METADATA_EXTRACTION_PROMPT = """You are an expert at extracting structured information from university exam papers.
Please analyze the following exam paper text and extract the metadata in the exact JSON format specified below.
Be very careful to extract information accurately and handle variations in formatting.

Required output format (return ONLY valid JSON):
{{
    "year_of_exam": "YYYY_YYYY format (e.g., 2010_2011)",
    "exam_date": "Date of the Exam as indicated on the provided text (e.g., AUGUST 2011)",
    "exam_duration": "Duration as written (e.g., 2 HOURS)",
    "instructions": ["Each instruction as a separate string, e.g., \"Answer Question One and Any Other Two Questions\", \"No electronic devices allowed\""],
    "exam_description": "Stage description (e.g., FIRST YEAR STAGE EXAMINATION)",
    "exam_title": "Main title (e.g., UNIVERSITY EXAMINATIONS)",
    "course": ["List of degree/course names as they appear on the provided text, sometimes comes in 2 lines"],
    "module": ["Subject/module name without code"],
    "module_code": "Course code (e.g., BIT 1103)"
    "programme_name":"Name of the academic programme that the exam paper belongs to, e.g Bachelors/Undergraduate"
}}
----
The programme_name field can only be one of the following ENUM values:
class ProgrammeTypes(enum.Enum):
    CERTIFICATE = "Certificate"
    DIPLOMA = "Diploma"
    BACHELORS = "Bachelors/Undergraduate"
    MASTERS = "Masters"
    DOCTORATE = "Doctorate"
    POSTGRADUATE_DIPLOMA = "Postgraduate Diploma"
    PHD_PROGRAMMES = "PhD Programmes"
    ONLINE_MBA = "Online MBA"
    OTHERS = "Others"
----
Important notes:
- DONT include the Course name in the  Description, separate them if they are in same line.
- For year_of_exam: sometimes written as "JANUARY – APRIL 2015 TRIMESTER" or just "August 2021", Just add the  next year infront of the given year like 2015_2016 or 2021_2022.
- For year_of_exam: Convert slashes to underscores (2010/2011 becomes 2010_2011),
- For course: Include full degree name, can come in multiple lines, determine the name  and just combine them or extract the Course Name from the lines. example:
        "## FACULTY OF SCIENCE"
        "## DEPARTMENT OF NATURAL SCIENCES (BIOLOGY)"
    --This course should be just "BIOLOGY" or "FACULTY OF SCIENCE DEPARTMENT OF NATURAL SCIENCES (BIOLOGY)"
- For instructions: If multiple instructions are present, extract all as a list.
- For module: Extract subject name without the code
- For module_code: Extract the code (letters + numbers)
- If any field is not found, use empty string "" or empty list []
- Return only valid JSON, no additional text before or after.
- If "module_code" are more than 1, just concatenate with a comma.
"""
