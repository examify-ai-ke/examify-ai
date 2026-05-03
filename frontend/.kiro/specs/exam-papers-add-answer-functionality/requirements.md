# Requirements Document

## Introduction

This feature adds the ability to create and manage answers for questions directly from the exam papers edit page. Currently, the AnswerForm component exists but is not integrated into the question display interface. Users need a way to add, edit, and delete answers for both main questions and sub-questions while editing an exam paper.

## Glossary

- **Exam_Paper_Edit_Page**: The page at `/dashboard/exam-papers/[id]/edit` where users edit exam paper details and manage questions
- **Question**: A main question or sub-question within a question set on an exam paper
- **Answer**: A solution or response to a question, stored with EditorJS format content
- **AnswerForm**: The existing form component for creating and editing answers
- **AnswerList**: The component that displays existing answers for a question
- **MainQuestionCard**: The component that displays a main question with its sub-questions
- **SubQuestionCard**: The component that displays a sub-question

## Requirements

### Requirement 1: Add Answer Button Display

**User Story:** As an exam paper editor, I want to see an "Add Answer" button for each question, so that I can easily add answers while editing the exam paper.

#### Acceptance Criteria

1. WHEN viewing a question in the exam paper edit page, THE System SHALL display an "Add Answer" button below the question text
2. WHEN a question already has answers, THE System SHALL display the "Add Answer" button below the existing answers list
3. WHEN a question is collapsed, THE System SHALL NOT display the "Add Answer" button
4. THE "Add Answer" button SHALL be visually distinct and easily identifiable with an icon and text label

### Requirement 2: Answer Creation Interface

**User Story:** As an exam paper editor, I want to click the "Add Answer" button to open a form, so that I can create a new answer for the question.

#### Acceptance Criteria

1. WHEN a user clicks the "Add Answer" button, THE System SHALL display the AnswerForm component inline below the button
2. WHEN the AnswerForm is displayed, THE System SHALL hide the "Add Answer" button to prevent duplicate forms
3. WHEN a user cancels the answer form, THE System SHALL hide the form and show the "Add Answer" button again
4. THE AnswerForm SHALL include the EditorJS editor for rich text content entry
5. THE AnswerForm SHALL include "Add Answer" and "Cancel" action buttons

### Requirement 3: Answer Submission and Display

**User Story:** As an exam paper editor, I want to submit the answer form and see the new answer appear in the list, so that I can verify my answer was saved correctly.

#### Acceptance Criteria

1. WHEN a user submits a valid answer, THE System SHALL create the answer via the API
2. WHEN the answer is successfully created, THE System SHALL display a success notification
3. WHEN the answer is successfully created, THE System SHALL reload the question sets to show the updated answer
4. WHEN the answer is successfully created, THE System SHALL hide the AnswerForm and show the "Add Answer" button again
5. IF the answer creation fails, THEN THE System SHALL display an error notification with the failure reason

### Requirement 4: Answer Management for Sub-Questions

**User Story:** As an exam paper editor, I want to add answers to sub-questions, so that I can provide complete solutions for multi-part questions.

#### Acceptance Criteria

1. WHEN viewing a sub-question, THE System SHALL display an "Add Answer" button for that sub-question
2. WHEN adding an answer to a sub-question, THE System SHALL associate the answer with the correct sub-question ID
3. THE answer creation process for sub-questions SHALL follow the same workflow as main questions

### Requirement 5: Visual Integration

**User Story:** As an exam paper editor, I want the answer creation interface to fit naturally with the existing UI, so that the experience is consistent and intuitive.

#### Acceptance Criteria

1. THE "Add Answer" button SHALL use consistent styling with other action buttons in the interface
2. THE AnswerForm SHALL be displayed with appropriate spacing and indentation to match the question hierarchy
3. WHEN the AnswerForm is displayed, THE System SHALL provide smooth visual transitions
4. THE answer creation interface SHALL be responsive and work on mobile, tablet, and desktop screen sizes

### Requirement 6: Error Handling

**User Story:** As an exam paper editor, I want clear error messages when answer creation fails, so that I can understand and fix the problem.

#### Acceptance Criteria

1. IF the API request fails, THEN THE System SHALL display an error notification with a descriptive message
2. IF the user submits an empty answer, THEN THE System SHALL display a validation error message
3. IF the question ID is invalid, THEN THE System SHALL prevent the form from being displayed and log an error
4. THE System SHALL maintain form state during validation errors so users don't lose their work

### Requirement 7: State Management

**User Story:** As an exam paper editor, I want the interface to properly manage the state of answer forms, so that I can only have one form open at a time per question.

#### Acceptance Criteria

1. WHEN an answer form is open for a question, THE System SHALL prevent opening another answer form for the same question
2. WHEN switching between questions, THE System SHALL maintain independent form states for each question
3. WHEN reloading question sets after answer creation, THE System SHALL preserve the expanded/collapsed state of question sets
