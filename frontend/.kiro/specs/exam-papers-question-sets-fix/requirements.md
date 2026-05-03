# Requirements Document

## Introduction

This specification addresses critical functionality issues in the exam paper detail page related to question set management. The current implementation has problems where the "Add Question Sets to Exam Paper" dialog loads correctly but sends incorrect API calls, and the question sets section appears blank instead of displaying the current question sets associated with the exam paper.

## Requirements

### Requirement 1: Fix Question Sets Display

**User Story:** As an exam paper administrator, I want to see all question sets currently associated with an exam paper, so that I can understand what content is included in the exam.

#### Acceptance Criteria

1. WHEN I navigate to an exam paper detail page THEN the system SHALL display all question sets currently linked to that exam paper
2. WHEN question sets are displayed THEN each question set SHALL show its title, description, and question count
3. IF no question sets are linked to the exam paper THEN the system SHALL display an appropriate empty state message
4. WHEN question sets are loading THEN the system SHALL show a loading indicator
5. IF there is an error loading question sets THEN the system SHALL display an error message and fallback gracefully

### Requirement 2: Fix Add Question Sets Dialog Functionality

**User Story:** As an exam paper administrator, I want to add question sets to an exam paper through a dialog interface, so that I can build comprehensive exams from existing question collections.

#### Acceptance Criteria

1. WHEN I click "Add Question Set" THEN the system SHALL open a dialog showing available question sets
2. WHEN the dialog opens THEN the system SHALL load and display all available question sets that are not already linked to the current exam paper
3. WHEN I select one or more question sets and click "Add" THEN the system SHALL call the correct API endpoint to link the question sets to the exam paper
4. WHEN question sets are successfully added THEN the system SHALL refresh the question sets display and show a success notification
5. WHEN there is an error adding question sets THEN the system SHALL display an appropriate error message
6. WHEN the dialog is processing THEN the system SHALL show loading states and disable the submit button

### Requirement 3: Fix API Integration Issues

**User Story:** As a system administrator, I want the question set management APIs to work correctly, so that users can reliably manage exam paper content.

#### Acceptance Criteria

1. WHEN the system loads question sets for an exam paper THEN it SHALL use the correct API endpoint `/api/v1/question-set/by-exam-paper/{exam_paper_id}`
2. WHEN adding question sets to an exam paper THEN the system SHALL use the POST endpoint `/api/v1/exampaper/{exampaper_id}/question-sets/{question_set_id}`
3. WHEN removing question sets from an exam paper THEN the system SHALL use the DELETE endpoint `/api/v1/exampaper/{exampaper_id}/question-sets/{question_set_id}`
4. WHEN API calls fail THEN the system SHALL handle errors gracefully and provide meaningful feedback to users
5. WHEN API responses have different data structures THEN the system SHALL handle all expected response formats correctly

### Requirement 4: Improve Data Consistency

**User Story:** As an exam paper administrator, I want the question sets data to be consistent across different views, so that I can trust the information displayed.

#### Acceptance Criteria

1. WHEN question sets are added or removed THEN the system SHALL update both the main exam paper data and the separate question sets with counts data
2. WHEN the page loads THEN the system SHALL prioritize the most accurate and complete question sets data source
3. WHEN displaying question sets THEN the system SHALL show consistent information regardless of the data source
4. IF there are discrepancies between data sources THEN the system SHALL use the most reliable source and log the inconsistency

### Requirement 5: Enhance User Experience

**User Story:** As an exam paper administrator, I want clear feedback and intuitive interactions when managing question sets, so that I can work efficiently without confusion.

#### Acceptance Criteria

1. WHEN I perform any question set operation THEN the system SHALL provide clear loading states during processing
2. WHEN operations complete successfully THEN the system SHALL show success notifications with specific details
3. WHEN operations fail THEN the system SHALL show error messages that help me understand what went wrong
4. WHEN viewing question sets THEN the system SHALL display relevant metadata like question counts and usage statistics
5. WHEN the question sets list is empty THEN the system SHALL provide actionable guidance on how to add question sets