# Implementation Plan

- [x] 1. Refactor QuestionCard container element
  - Replace outer `<button>` element with `<div>` element in QuestionCard component
  - Add conditional rendering logic: use interactive div with ARIA attributes for questions with sub-questions, use plain div for questions without sub-questions
  - Implement keyboard event handler for Enter and Space keys to toggle expansion
  - Add appropriate ARIA attributes: role="button", tabIndex={0}, aria-expanded, aria-label
  - Preserve all existing className values and conditional styling logic
  - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.4, 3.1, 3.2, 3.5_

- [x] 2. Update event handling for nested buttons
  - Ensure all "View Answer" Button components in main question section call e.stopPropagation() in onClick handler
  - Ensure all "View Answer" Button components in sub-questions section call e.stopPropagation() in onClick handler
  - Verify that stopPropagation prevents parent container click events from firing
  - _Requirements: 1.3, 2.1_

- [x] 3. Verify HTML validity and accessibility
  - Load the exam paper details page in browser and open developer console
  - Confirm no "nested button" warnings appear in console
  - Confirm no React hydration errors appear in console
  - Test keyboard navigation: Tab to expandable question card and verify it receives focus
  - Test keyboard activation: Press Enter and Space keys on focused card to verify expansion toggle
  - Test that "View Answer" buttons are reachable via Tab key and activatable via Enter
  - Verify focus indicators are visible on all interactive elements
  - _Requirements: 1.1, 1.2, 1.5, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4_
<!-- 
- [x] 4. Test user interaction scenarios
  - Click on question card with sub-questions to verify expand/collapse functionality
  - Click on "View Answer" button in main question to verify answer shows/hides without expanding card
  - Click on "View Answer" button in sub-question to verify sub-answer shows/hides
  - Verify question cards without sub-questions are not clickable at container level
  - Verify all hover effects and visual styling remain unchanged
  - Test on mobile device or browser responsive mode to verify touch interactions work correctly
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.5_ -->
