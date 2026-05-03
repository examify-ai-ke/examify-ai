# Requirements Document

## Introduction

This feature addresses the issue where questions are not displaying on the exam paper details page despite the API endpoint being called correctly. The system should fetch and display all questions associated with an exam paper through its question sets.

## Glossary

- **ExamPaper**: A complete examination document containing questions, instructions, and metadata
- **QuestionSet**: A logical grouping of questions within an exam paper (e.g., "Question One", "Question Two")
- **MainQuestion**: A top-level question that may contain sub-questions
- **SubQuestion**: A child question nested under a main question
- **Frontend**: The Next.js React application that displays exam papers to users
- **Backend API**: The FastAPI service that provides exam paper and question data
- **API Client**: The openapi-fetch client used to communicate with the backend

## Requirements

### Requirement 1: Investigate Question Data Flow

**User Story:** As a developer, I want to understand why questions are not appearing on the exam paper details page, so that I can identify and fix the root cause.

#### Acceptance Criteria

1. WHEN the exam paper details page loads, THE Frontend SHALL log the complete API response from the question sets endpoint
2. WHEN the API response is received, THE Frontend SHALL log the structure and content of each question set including the questions array
3. WHEN questions are present in the API response, THE Frontend SHALL log each question's key properties (id, question_number, text, children)
4. WHEN the API returns an error, THE Frontend SHALL log the error details with context about which endpoint failed
5. WHEN the component renders question sets, THE Frontend SHALL log whether questions exist and their count for each set

### Requirement 2: Verify API Response Structure

**User Story:** As a developer, I want to verify that the backend API is returning questions in the expected format, so that I can determine if the issue is in the frontend or backend.

#### Acceptance Criteria

1. WHEN the `/api/v1/question-set/by-exam-paper/{exam_paper_id}` endpoint is called, THE Backend API SHALL return an array of QuestionSetReadWithQuestions objects
2. WHEN a QuestionSetReadWithQuestions object is returned, THE Backend API SHALL include a questions array containing MainQuestionReadForQuestionSet objects
3. WHEN a MainQuestionReadForQuestionSet object is returned, THE Backend API SHALL include all required fields (id, question_number, text, marks, children)
4. WHEN a MainQuestionReadForQuestionSet has sub-questions, THE Backend API SHALL include them in the children array
5. WHEN no questions exist for an exam paper, THE Backend API SHALL return an empty array rather than null or undefined

### Requirement 3: Fix Data Extraction Logic

**User Story:** As a user, I want to see all questions when viewing an exam paper, so that I can study the complete examination content.

#### Acceptance Criteria

1. WHEN the API response contains question sets with questions, THE Frontend SHALL correctly extract and store the questions in component state
2. WHEN extracting question data, THE Frontend SHALL handle both nested and flat response structures correctly
3. WHEN questions are stored in state, THE Frontend SHALL preserve the complete question structure including text, marks, and sub-questions
4. WHEN the questions array is empty, THE Frontend SHALL display an appropriate "no questions" message
5. WHEN questions exist, THE Frontend SHALL render each question with its complete content and sub-questions

### Requirement 4: Display Questions Correctly

**User Story:** As a user, I want questions to be displayed in a clear, organized format, so that I can easily read and understand the exam content.

#### Acceptance Criteria

1. WHEN questions are available, THE Frontend SHALL render each question set with its title
2. WHEN rendering a question, THE Frontend SHALL display the question number, text content, and marks allocation
3. WHEN a question has sub-questions, THE Frontend SHALL display them nested under the main question
4. WHEN rendering question text, THE Frontend SHALL properly format the JSON content blocks
5. WHEN no questions are available, THE Frontend SHALL display a user-friendly message explaining that questions will appear once added

### Requirement 5: Error Handling and User Feedback

**User Story:** As a user, I want clear feedback when questions fail to load, so that I understand what went wrong and what to do next.

#### Acceptance Criteria

1. WHEN the question sets API call fails, THE Frontend SHALL display an error message to the user
2. WHEN questions are loading, THE Frontend SHALL display a loading indicator
3. WHEN the API returns successfully but with no questions, THE Frontend SHALL distinguish this from an error state
4. WHEN an error occurs, THE Frontend SHALL log sufficient debugging information for developers
5. WHEN the user navigates back from an error state, THE Frontend SHALL allow them to retry loading the exam paper
