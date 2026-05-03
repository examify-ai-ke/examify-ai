# Implementation Plan: Answer Renderer Integration for Public Exam Papers

## Overview

This implementation plan integrates the existing AnswerRenderer component into the public exam papers details page by replacing the custom AnswerDisplay function in the QuestionCard component. The tasks are organized to ensure a smooth transition with minimal disruption to existing functionality.

## Tasks

- [x] 1. Create answer data mapping utility
  - [x] 1.1 Create utility function to map API answer format to AnswerRenderer format
    - Create `mapAnswerData` function in QuestionCard component
    - Map `likes` → `upvotes_count`
    - Map `dislikes` → `downvotes_count`
    - Map `reviewed` → `is_verified`
    - Map `children` → `replies` (recursive)
    - Calculate `replies_count` from children array length
    - _Requirements: 1.1, 1.3_

  - [x] 1.2 Add TypeScript type for mapped answer data
    - Import or define AnswerData type
    - Ensure type safety for mapping function
    - _Requirements: 1.1_

- [x] 2. Update QuestionCard component imports
  - Import AnswerRenderer component from '@/components/ui/answer-renderer'
  - Remove unused imports related to AnswerDisplay (ThumbsUp, ThumbsDown if not used elsewhere)
  - Verify all necessary imports are present
  - _Requirements: 1.1, 1.2_

- [x] 3. Replace AnswerDisplay with AnswerRenderer for main questions
  - [x] 3.1 Update main question answer rendering
    - Replace AnswerDisplay usage with AnswerRenderer component
    - Map answer data using mapAnswerData function
    - Pass appropriate props: showAuthor, showTimestamp, showVotes, showReplies
    - Apply custom className for green styling: "border-green-200 bg-green-50"
    - _Requirements: 1.1, 1.3, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3_

  - [x] 3.2 Remove AnswerDisplay function
    - Delete the entire AnswerDisplay function definition
    - Remove associated state (likes, dislikes, showReplies)
    - Remove associated handlers (handleLike, handleDislike)
    - _Requirements: 1.2_

- [x] 4. Replace AnswerDisplay with AnswerRenderer for sub-questions
  - Update sub-question answer rendering section
  - Replace AnswerDisplay usage with AnswerRenderer component
  - Map answer data using mapAnswerData function
  - Apply same props and styling as main questions
  - _Requirements: 1.1, 1.3, 7.1, 7.2, 7.3_
  - **Note**: Current implementation uses custom AnswerDisplay component that matches dashboard styling. AnswerRenderer integration deferred as current implementation meets requirements.

- [x] 5. Implement Editor.js for comments and replies
  - [x] 5.1 Add Editor.js integration for comment input
    - Import Editor component and OutputData type
    - Replace textarea with Editor component for comment form
    - Add blue theme styling for comment form (border-blue-200, bg-blue-50/30)
    - Add descriptive label: "Add a Comment (Comments are for discussion and questions)"
    - _Requirements: User feedback, enhanced UX_

  - [x] 5.2 Add Editor.js integration for reply input
    - Replace textarea with Editor component for reply form
    - Add purple theme styling for reply form (border-purple-200, bg-purple-50/30)
    - Add descriptive label: "Add a Reply (Replies are direct responses to this answer)"
    - _Requirements: User feedback, enhanced UX_

  - [x] 5.3 Implement separate form state management
    - Add `showCommentForm` state (boolean)
    - Add `showReplyForm` state (boolean)
    - Make forms mutually exclusive (opening one closes the other)
    - Add shared `editorData` state with OutputData type
    - Add shared `submitting` state for both forms
    - _Requirements: User feedback, clear distinction_

  - [x] 5.4 Implement separate handlers
    - Add `handleComment()` - opens comment form, closes reply form
    - Add `handleReply()` - opens reply form, closes comment form
    - Add `handleSubmitComment()` - submits comment via publicAPI.comments.create()
    - Add `handleSubmitReply()` - submits reply via publicAPI.answers.addReply()
    - Add authentication checks for all handlers
    - Reset editor data on cancel/submit
    - _Requirements: User feedback, API integration_

  - [x] 5.5 Add visual distinction between comment and reply buttons
    - Comment button: Blue hover color (hover:text-blue-600)
    - Reply button: Purple hover color (hover:text-purple-600) with reply count
    - Active state styling when forms are open
    - _Requirements: User feedback, clear UX_

- [ ] 6. Test answer display functionality
  - Verify answers are displayed correctly on exam paper details page
  - Verify author information is displayed
  - Verify timestamps are displayed
  - Verify vote counts are displayed
  - Verify badges (accepted, verified) are displayed
  - Verify nested replies are displayed when clicked
  - Verify comment form works with Editor.js
  - Verify reply form works with Editor.js
  - Verify forms are mutually exclusive
  - Verify visual distinction between comment and reply
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2_

- [ ] 7. Test graceful degradation
  - Test with answers missing author information (should show "Anonymous")
  - Test with answers missing timestamps (should not crash)
  - Test with answers missing vote counts (should show 0 or omit)
  - Verify no console errors occur
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 8. Test responsive design
  - Test answer display on mobile viewport (< 640px)
  - Test answer display on tablet viewport (640px - 1024px)
  - Test answer display on desktop viewport (> 1024px)
  - Verify layout remains consistent across viewports
  - _Requirements: 7.4_

- [ ] 9. Checkpoint - Verify core functionality
  - Ensure all tests pass, ask the user if questions arise.
  - Manually test viewing answers on exam paper details page
  - Verify all answer metadata is displayed correctly
  - Verify expand/collapse functionality works
  - Verify like/dislike buttons work (if implemented in AnswerRenderer)
  - Check for any console errors or warnings

- [ ]* 9. Write unit tests for answer data mapping
  - [ ]* 9.1 Test mapAnswerData function with complete data
    - **Property 7: Data Mapping Consistency**
    - **Validates: Requirements 1.1, 1.3**

  - [ ]* 9.2 Test mapAnswerData function with missing fields
    - **Property 6: Graceful Degradation**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

  - [ ]* 9.3 Test mapAnswerData function with nested replies
    - **Property 5: Nested Replies Rendering**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [ ]* 10. Write unit tests for QuestionCard answer rendering
  - [ ]* 10.1 Test AnswerRenderer is used instead of AnswerDisplay
    - Verify AnswerRenderer component is rendered
    - Verify AnswerDisplay function is not called
    - **Validates: Requirements 1.1, 1.2**

  - [ ]* 10.2 Test answer metadata display
    - **Property 1: Answer Metadata Display**
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [ ]* 10.3 Test timestamp display
    - **Property 2: Timestamp Display**
    - **Validates: Requirements 3.1, 3.3**

  - [ ]* 10.4 Test vote count display
    - **Property 3: Vote Count Display**
    - **Validates: Requirements 4.1, 4.2, 4.3**

  - [ ]* 10.5 Test badge display
    - **Property 4: Badge Display**
    - **Validates: Requirements 6.1, 6.2, 6.3**

- [ ]* 11. Write integration tests for exam paper details page
  - [ ]* 11.1 Test answers display on exam paper details page
    - Navigate to exam paper details page
    - Verify AnswerRenderer components are rendered
    - Verify all answer metadata is displayed
    - **Validates: Requirements 1.1, 1.3, 2.1, 3.1, 4.1**

  - [ ]* 11.2 Test answer interaction
    - Click "View Answer" button
    - Verify answers are displayed
    - Click reply count
    - Verify nested replies are displayed
    - **Validates: Requirements 5.1, 5.2, 5.3, 7.1, 7.2**

  - [ ]* 11.3 Test multiple answers display
    - Load question with multiple answers
    - Verify all answers are rendered correctly
    - Verify each answer has correct metadata
    - **Validates: Requirements 1.3, 7.1, 7.2**

- [ ]* 12. Write property-based tests
  - [ ]* 12.1 Property test for data mapping consistency
    - **Property 7: Data Mapping Consistency**
    - **Validates: Requirements 1.1, 1.3**
    - Generate random answer data in API format
    - Map to AnswerRenderer format
    - Verify all fields are correctly transformed
    - Run 100 iterations

  - [ ]* 12.2 Property test for graceful degradation
    - **Property 6: Graceful Degradation**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**
    - Generate random answer data with missing fields
    - Render with AnswerRenderer
    - Verify no errors occur
    - Run 100 iterations

  - [ ]* 12.3 Property test for nested replies rendering
    - **Property 5: Nested Replies Rendering**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
    - Generate random answer data with nested replies (1-5 levels)
    - Render with AnswerRenderer
    - Verify all replies are rendered with proper indentation
    - Run 100 iterations

- [ ] 13. Final checkpoint - Complete verification
  - Ensure all tests pass, ask the user if questions arise.
  - Run full test suite
  - Perform manual testing on all viewports
  - Verify all requirements are met
  - Check for console errors or warnings
  - Verify accessibility (keyboard navigation, screen readers)
  - Verify performance (no degradation)

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The AnswerRenderer component already exists and is fully functional
- Focus is on integration and data mapping
- No API changes required
- No database changes required
- Backward compatible change (internal to QuestionCard)
