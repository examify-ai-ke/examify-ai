from typing import Dict, List


def validate_block_structure(block: Dict, errors: List[str], path: str = "block"):
    required_fields = ["id", "type", "data"]
    for field in required_fields:
        if field not in block:
            errors.append(f"{path}: Missing required field '{field}'")

    if "type" in block:
        valid_types = ["paragraph", "header", "image", "table", "code", "quote", "list", "html"]
        if block["type"] not in valid_types:
            errors.append(f"{path}: Invalid block type '{block['type']}'")

    if "type" in block and "data" in block:
        block_type = block["type"]
        data = block["data"]

        if block_type == "paragraph" and "text" not in data:
            errors.append(f"{path}.paragraph: Missing 'text' field")
        elif block_type == "header":
            if "text" not in data:
                errors.append(f"{path}.header: Missing 'text' field")
            if "level" in data and not (1 <= data["level"] <= 6):
                errors.append(f"{path}.header: Invalid 'level' {data['level']}")
        elif block_type == "image":
            if "file" not in data:
                errors.append(f"{path}.image: Missing 'file' field")
            elif "url" not in data.get("file", {}):
                errors.append(f"{path}.image.file: Missing 'url' field")
        elif block_type == "table" and "content" not in data:
            errors.append(f"{path}.table: Missing 'content' field")


def validate_question_text(text_obj: Dict, errors: List[str], path: str = "question_text"):
    if not isinstance(text_obj, dict):
        errors.append(f"{path}: Must be an object")
        return
    if "time" not in text_obj:
        errors.append(f"{path}: Missing 'time' field")
    if "blocks" not in text_obj:
        errors.append(f"{path}: Missing 'blocks' field")
    elif not isinstance(text_obj["blocks"], list):
        errors.append(f"{path}.blocks: Must be an array")
    else:
        for i, block in enumerate(text_obj["blocks"]):
            validate_block_structure(block, errors, f"{path}.blocks[{i}]")


def validate_question(question: Dict, errors: List[str], path: str = "question", is_sub: bool = False):
    for field in ["question_number", "numbering_style"]:
        if field not in question:
            errors.append(f"{path}: Missing required field '{field}'")

    if "numbering_style" in question:
        if question["numbering_style"] not in ("alphabetic", "roman", "numeric"):
            errors.append(f"{path}: Invalid numbering_style '{question['numbering_style']}'")

    if "marks" in question and (not isinstance(question["marks"], int) or question["marks"] < 0):
        errors.append(f"{path}: 'marks' must be a positive integer")

    if "text" in question and question["text"] is not None:
        validate_question_text(question["text"], errors, f"{path}.text")

    if not is_sub and "sub_questions" in question:
        if not isinstance(question["sub_questions"], list):
            errors.append(f"{path}.sub_questions: Must be an array")
        else:
            for i, sub_q in enumerate(question["sub_questions"]):
                validate_question(sub_q, errors, f"{path}.sub_questions[{i}]", is_sub=True)


def validate_question_set(qs: Dict, errors: List[str], path: str = "question_set"):
    if not isinstance(qs, dict):
        errors.append(f"{path}: Must be an object")
        return
    if "title" not in qs:
        errors.append(f"{path}: Missing 'title' field")
    if "main_questions" not in qs:
        errors.append(f"{path}: Missing 'main_questions' field")
    elif not isinstance(qs["main_questions"], list):
        errors.append(f"{path}.main_questions: Must be an array")
    else:
        for i, q in enumerate(qs["main_questions"]):
            validate_question(q, errors, f"{path}.main_questions[{i}]")


def validate_questions_section(questions: Dict, errors: List[str]):
    if not isinstance(questions, dict):
        errors.append("questions: Must be an object")
        return
    if "question_sets" not in questions:
        errors.append("questions: Missing 'question_sets' field")
        return
    if not isinstance(questions["question_sets"], list):
        errors.append("questions.question_sets: Must be an array")
        return
    if len(questions["question_sets"]) == 0:
        errors.append("questions.question_sets: Cannot be empty")
    for i, qs in enumerate(questions["question_sets"]):
        validate_question_set(qs, errors, f"questions.question_sets[{i}]")


def validate_exam_paper_section(exam_paper: Dict, errors: List[str]):
    if not isinstance(exam_paper, dict):
        errors.append("exam_paper: Must be an object")
        return
    for field in ["year_of_exam", "exam_duration", "exam_date", "tags"]:
        if field not in exam_paper:
            errors.append(f"exam_paper: Missing required field '{field}'")
    if "year_of_exam" in exam_paper and not isinstance(exam_paper["year_of_exam"], str):
        errors.append("exam_paper.year_of_exam: Must be a string")
    if "exam_duration" in exam_paper and not isinstance(exam_paper["exam_duration"], int):
        errors.append("exam_paper.exam_duration: Must be an integer")


def validate_prerequisites_section(prerequisites: Dict, errors: List[str]):
    if not isinstance(prerequisites, dict):
        errors.append("prerequisites: Must be an object")
        return
    for section in ["exam_title", "exam_description", "course", "institution", "programme", "modules", "instructions"]:
        if section not in prerequisites:
            errors.append(f"prerequisites: Missing required section '{section}'")


def validate_output(data: dict) -> Dict:
    """Validate the full exam paper JSON output structure."""
    errors: List[str] = []

    for section in ["questions", "exam_paper", "prerequisites"]:
        if section not in data:
            errors.append(f"Missing required top-level section: '{section}'")

    if "questions" in data:
        validate_questions_section(data["questions"], errors)
    if "exam_paper" in data:
        validate_exam_paper_section(data["exam_paper"], errors)
    if "prerequisites" in data:
        validate_prerequisites_section(data["prerequisites"], errors)

    return {"valid": len(errors) == 0, "errors": errors}
