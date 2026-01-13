# Implementation Plan: Add Answer Functionality for Exam Papers

## Overview

This implementation plan breaks down the work into discrete tasks for adding answer creation functionality to the exam papers edit page. The tasks are organized to build incrementally, with testing integrated throughout.

## Tasks

- [x] 1. Update TypeScript interfaces for answer change callbacks
  - Add `onAnswersChange?: () => void` to MainQuestionCardProps
  - Add `onAnswersChange?: () => void` to SubQuestionCardProps
  - Add `onAnswersChange?: () => void` to QuestionSetCardProps
  - Add `onAnswersChange?: () => void` to QuestionSetListProps
  - Update exports in `src/components/questions/types.ts`
  - _Requirements: 1.1, 2.1, 3.4, 4.1, 7.2_

- [x] 2. Implement Add Answer functionality in MainQuestionCard
  - [x] 2.1 Add state management for answer form visibility
    - Import useState and Plus icon from lucide-react
    - Add `const [showAnswerForm, setShowAnswerForm] = useState(false)`
    - Import AnswerForm component
    - _Requirements: 2.1, 2.2, 7.1_

  - [x] 2.2 Add "Add Answer" button to the component
    - Render button below AnswerList when expanded
    - Only show button when `!showAnswerForm`
    - Add onClick handler to set `showAnswerForm(true)`
    - Style with appropriate spacing (ml-9 to match indentation)
    - _Requirements: 1.1, 1.2, 1.4_

  - [x] 2.3 Add conditional AnswerForm rendering
    - Render AnswerForm when `showAnswerForm === true`
    - Pass `questionId={question.id}` prop
    - Pass `onSuccess` callback to hide form and call `onAnswersChange`
    - Pass `onCancel` callback to hide form
    - Wrap in styled container (border, rounded, padding, bg-gray-50)
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 3.4, 5.2_

  - [x] 2.4 Add error handling for missing question ID
    - Check if question.id exists before showing form
    - Log error and show notification if ID is missing
    - _Requirements: 6.3_

  - [x] 2.5 Update component to accept and use onAnswersChange prop
    - Add `onAnswersChange` to component props destructuring
    - Pass to AnswerForm's onSuccess callback
    - _Requirements: 3.3, 3.4_

- [x] 3. Implement Add Answer functionality in SubQuestionCard
  - [x] 3.1 Add state management for answer form visibility
    - Import useState and Plus icon from lucide-react
    - Add `const [showAnswerForm, setShowAnswerForm] = useState(false)`
    - Import AnswerForm component
    - _Requirements: 4.1, 7.1_

  - [x] 3.2 Add "Add Answer" button to the component
    - Render button below AnswerList when expanded
    - Only show button when `!showAnswerForm`
    - Add onClick handler to set `showAnswerForm(true)`
    - Style with appropriate spacing (ml-6 for sub-question indentation)
    - _Requirements: 4.1, 1.4_

  - [x] 3.3 Add conditional AnswerForm rendering
    - Render AnswerForm when `showAnswerForm === true`
    - Pass `questionId={question.id}` prop
    - Pass `onSuccess` callback to hide form and call `onAnswersChange`
    - Pass `onCancel` callback to hide form
    - Wrap in styled container (border, rounded, padding, bg-gray-50)
    - _Requirements: 4.1, 4.2, 5.2_

  - [x] 3.4 Update component to accept and use onAnswersChange prop
    - Add `onAnswersChange` to component props destructuring
    - Pass to AnswerForm's onSuccess callback
    - _Requirements: 4.1, 4.2_

- [x] 4. Update QuestionSetCard to pass through onAnswersChange
  - Add `onAnswersChange` to component props destructuring
  - Pass `onAnswersChange` prop to MainQuestionCard components
  - Ensure prop is passed through the component tree correctly
  - _Requirements: 3.3, 3.4_

- [x] 5. Update QuestionSetList to pass through onAnswersChange
  - Add `onAnswersChange` to component props destructuring
  - Pass `onAnswersChange` prop to QuestionSetCard components
  - Ensure prop is passed through the component tree correctly
  - _Requirements: 3.3, 3.4_

- [x] 6. Update ExamPaperEditPage to provide onAnswersChange callback
  - Pass `onAnswersChange={reloadQuestionSets}` to QuestionSetList component
  - Verify reloadQuestionSets function properly reloads question data with answers
  - Test that the callback chain works from edit page to question cards
  - _Requirements: 3.3, 3.4_

- [ ] 7. Checkpoint - Manual testing of basic functionality
  - Ensure all tests pass, ask the user if questions arise.
  - Manually test adding answer to main question
  - Manually test adding answer to sub-question
  - Manually test cancel functionality
  - Manually test that answers appear after creation
  - Verify UI spacing and styling

- [ ] 8. Add responsive design improvements
  - Test answer form on mobile viewport (< 640px)
  - Test answer form on tablet viewport (640px - 1024px)
  - Test answer form on desktop viewport (> 1024px)
  - Adjust AnswerForm dialog width if needed for mobile
  - Verify button sizes are touch-friendly on mobile
  - _Requirements: 5.4_

- [ ] 9. Implement error handling and validation
  - Test submitting empty answer (should show validation error)
  - Test API failure scenarios (mock failed API call)
  - Verify error notifications display correctly
  - Verify form state is preserved on validation errors
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ]* 10. Write unit tests for MainQuestionCard
  - [ ]* 10.1 Test Add Answer button renders when expanded
    - **Property 1: Answer Form Visibility Toggle**
    - **Validates: Requirements 2.2, 2.3**

  - [ ]* 10.2 Test Add Answer button hidden when form is open
    - **Property 1: Answer Form Visibility Toggle**
    - **Validates: Requirements 2.2**

  - [ ]* 10.3 Test form closes on cancel
    - **Property 1: Answer Form Visibility Toggle**
    - **Validates: Requirements 2.3**

  - [ ]* 10.4 Test form closes and reloads on success
    - **Property 2: Answer Creation Persistence**
    - **Validates: Requirements 3.1, 3.3**

- [ ]* 11. Write unit tests for SubQuestionCard
  - [ ]* 11.1 Test sub-question answer form uses correct question ID
    - **Property 4: Sub-Question Answer Association**
    - **Validates: Requirements 4.2**

  - [ ]* 11.2 Test Add Answer button renders for sub-questions
    - **Property 1: Answer Form Visibility Toggle**
    - **Validates: Requirements 4.1**

- [ ]* 12. Write integration tests for exam paper edit page
  - [ ]* 12.1 Test adding answer to main question updates display
    - **Property 2: Answer Creation Persistence**
    - **Validates: Requirements 3.1, 3.3**

  - [ ]* 12.2 Test adding answer to sub-question updates display
    - **Property 4: Sub-Question Answer Association**
    - **Validates: Requirements 4.1, 4.2**

  - [ ]* 12.3 Test multiple questions maintain independent form state
    - **Property 3: Independent Form State**
    - **Validates: Requirements 7.2**

- [ ]* 13. Write property-based tests
  - [ ]* 13.1 Property test for form visibility toggle
    - **Property 1: Answer Form Visibility Toggle**
    - **Validates: Requirements 2.2, 2.3**
    - Generate random question data
    - Test form show/hide behavior across 100 iterations

  - [ ]* 13.2 Property test for answer persistence
    - **Property 2: Answer Creation Persistence**
    - **Validates: Requirements 3.1, 3.3**
    - Generate random answer content
    - Test answer appears in reloaded data across 100 iterations

  - [ ]* 13.3 Property test for form state preservation on error
    - **Property 5: Form State Preservation on Validation Error**
    - **Validates: Requirements 6.4**
    - Generate random invalid inputs
    - Test form content remains unchanged across 100 iterations

- [ ] 14. Final checkpoint - Complete testing and verification
  - Ensure all tests pass, ask the user if questions arise.
  - Run full test suite
  - Perform manual testing on all viewports
  - Verify all requirements are met
  - Check for any console errors or warnings
  - Verify accessibility (keyboard navigation, screen reader support)

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The existing AnswerForm component handles most of the answer creation logic
- Focus is on integration and UI state management
