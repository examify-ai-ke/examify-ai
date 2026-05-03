# Requirements Document

## Introduction

This specification defines the refactoring of the Exam Paper Edit page's question management system. The goal is to improve the UI/UX for displaying and managing QuestionSets, main questions, and sub-questions through a cleaner component architecture, better visual hierarchy, shared dialog components, and skeleton loading states. The refactoring will separate concerns into dedicated components while maintaining the existing API integration.

## Glossary

- **Exam Paper**: A document containing exam questions organized into question sets
- **QuestionSet**: A grouping of related questions within an exam paper (e.g., "Question One", "Question Two")
- **Main Question**: A top-level question within a QuestionSet that may have sub-questions
- **Sub-Question**: A child question nested under a main question (identified by `parent_id`)
- **HierarchicalQuestions**: The component responsible for displaying the nested question structure
- **EditorJS**: The rich text editor format used for question and answer content
- **Skeleton Loading**: Placeholder UI elements shown while data is being fetched

## Requirements

### Requirement 1

**User Story:** As an exam paper editor, I want to see a clear visual hierarchy of QuestionSets, main questions, and sub-questions, so that I can easily understand and navigate the exam structure.

#### Acceptance Criteria

1. WHEN the exam edit page loads THEN the system SHALL display QuestionSets as distinct collapsible cards with clear visual boundaries
2. WHEN a QuestionSet is expanded THEN the system SHALL display main questions with indentation and visual indicators distinguishing them from sub-questions
3. WHEN a main question has sub-questions THEN the system SHALL display sub-questions with additional indentation and a connecting visual element
4. WHEN displaying question counts THEN the system SHALL show separate counts for main questions and total questions per QuestionSet
5. WHEN displaying marks THEN the system SHALL calculate and show total marks for each QuestionSet and the entire exam paper

### Requirement 2

**User Story:** As an exam paper editor, I want skeleton loading states while data is being fetched, so that I have visual feedback during loading and the UI does not jump around.

#### Acceptance Criteria

1. WHEN the exam edit page is loading question data THEN the system SHALL display skeleton placeholders matching the expected layout structure
2. WHEN loading QuestionSets THEN the system SHALL display skeleton cards with animated pulse effects
3. WHEN loading questions within a QuestionSet THEN the system SHALL display skeleton question items with appropriate indentation
4. WHEN data finishes loading THEN the system SHALL smoothly transition from skeleton to actual content without layout shift

### Requirement 3

**User Story:** As an exam paper editor, I want to use a unified dialog component for adding and editing questions, so that I have a consistent experience regardless of question type.

#### Acceptance Criteria

1. WHEN adding a main question THEN the system SHALL open a shared dialog with question set selection and question form fields
2. WHEN adding a sub-question THEN the system SHALL open the same shared dialog with parent question pre-selected and sub-question mode enabled
3. WHEN editing any question THEN the system SHALL open the shared dialog pre-populated with existing question data
4. WHEN the dialog is submitted successfully THEN the system SHALL close the dialog and refresh the question list
5. WHEN the dialog is cancelled THEN the system SHALL close without making changes and reset form state

### Requirement 4

**User Story:** As an exam paper editor, I want separated and reusable components for question display, so that the codebase is maintainable and consistent.

#### Acceptance Criteria

1. WHEN rendering a QuestionSet THEN the system SHALL use a dedicated QuestionSetCard component
2. WHEN rendering a main question THEN the system SHALL use a dedicated MainQuestionCard component
3. WHEN rendering a sub-question THEN the system SHALL use a dedicated SubQuestionCard component
4. WHEN rendering skeleton states THEN the system SHALL use dedicated skeleton components for each question level
5. WHEN any question card needs actions THEN the system SHALL use a shared QuestionActions dropdown component

### Requirement 5

**User Story:** As an exam paper editor, I want intuitive expand/collapse behavior for question hierarchies, so that I can focus on specific sections without visual clutter.

#### Acceptance Criteria

1. WHEN clicking on a QuestionSet header THEN the system SHALL toggle the expanded state showing or hiding its questions
2. WHEN clicking on a main question header THEN the system SHALL toggle the expanded state showing or hiding its sub-questions and answers
3. WHEN a QuestionSet is collapsed THEN the system SHALL display a summary showing question count and total marks
4. WHEN expanding a previously collapsed section THEN the system SHALL restore the previous scroll position within that section

### Requirement 6

**User Story:** As an exam paper editor, I want clear visual feedback for question states and actions, so that I understand what operations are available and their current status.

#### Acceptance Criteria

1. WHEN hovering over a question card THEN the system SHALL display a subtle highlight effect
2. WHEN a question has no answers THEN the system SHALL display a warning indicator
3. WHEN a question has answers THEN the system SHALL display a success indicator with answer count
4. WHEN an action is in progress THEN the system SHALL display a loading indicator on the affected element
5. WHEN an action completes successfully THEN the system SHALL display a brief success notification

### Requirement 7

**User Story:** As an exam paper editor, I want responsive layout for question management, so that I can effectively edit exams on different screen sizes.

#### Acceptance Criteria

1. WHEN viewing on desktop THEN the system SHALL display full question details with side-by-side metadata
2. WHEN viewing on tablet THEN the system SHALL stack metadata below question content while maintaining readability
3. WHEN viewing on mobile THEN the system SHALL collapse non-essential information and prioritize question text and actions
4. WHEN the dialog opens on mobile THEN the system SHALL display as a full-screen modal with appropriate touch targets
