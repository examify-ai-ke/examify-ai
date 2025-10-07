# Implementation Plan

- [x] 1. Fix Question Sets Display in Details Page
  - Enhance the `loadQuestionSetsWithCounts` function to handle different API response structures
  - Add robust error handling and fallback mechanisms
  - Implement proper loading states and error messages
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 1.1 Improve API response parsing in loadQuestionSetsWithCounts function
  - Create a utility function to parse different API response structures consistently
  - Handle cases where data is nested in different ways (data.data.items, data.items, direct array)
  - Add logging for debugging response structure issues
  - _Requirements: 3.1, 3.4, 4.1_

- [x] 1.2 Add comprehensive error handling to question sets loading
  - Implement try-catch blocks with specific error types
  - Add user-friendly error messages for different failure scenarios
  - Implement fallback to exam paper question_sets if API call fails
  - _Requirements: 1.5, 3.4, 5.3_

- [x] 1.3 Enhance question sets display logic
  - Prioritize questionSetsWithCounts over examPaper.question_sets when available
  - Ensure consistent data structure for rendering
  - Add proper empty state handling
  - _Requirements: 1.1, 1.3, 4.2, 4.3_

- [x] 2. Standardize Question Set Dialog Components
  - Replace custom AddQuestionSetDialog in edit page with working QuestionSetSelector
  - Ensure consistent API integration across both pages
  - Implement proper state management for dialog interactions
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2.1 Replace custom dialog with QuestionSetSelector in edit page
  - Remove the custom AddQuestionSetDialog component from edit page
  - Import and integrate QuestionSetSelector component
  - Update state management to work with QuestionSetSelector interface
  - _Requirements: 2.1, 2.2, 4.3_

- [x] 2.2 Implement proper question set addition in edit page
  - Add handleAddQuestionSets function similar to details page
  - Use correct API endpoint for adding question sets to exam paper
  - Implement proper loading states and success/error notifications
  - _Requirements: 2.3, 2.4, 2.5, 3.2_

- [x] 2.3 Update question sets state management in edit page
  - Ensure question sets are reloaded after successful addition
  - Update both questionSets and availableQuestionSets states
  - Implement proper state synchronization
  - _Requirements: 4.1, 4.2, 5.1_

- [x] 3. Fix API Integration Issues
  - Verify and fix API endpoint usage for question set operations
  - Implement consistent error handling across all API calls
  - Add proper request/response logging for debugging
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3.1 Audit and fix API endpoint usage
  - Verify getByExamPaper endpoint is called correctly
  - Ensure addQuestionSet and removeQuestionSet use correct endpoints
  - Test API calls with different response scenarios
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3.2 Implement consistent error handling for API calls
  - Create standardized error handling utility
  - Add specific error messages for different API failure types
  - Implement retry mechanisms where appropriate
  - _Requirements: 3.4, 5.3_

- [x]* 3.3 Add comprehensive API logging and debugging
  - Add detailed logging for API requests and responses
  - Log response structure variations for debugging
  - Add performance monitoring for API calls
  - _Requirements: 3.4, 4.4_

- [x] 4. Enhance User Experience
  - Improve loading states and user feedback
  - Add success notifications for operations
  - Implement better empty states and error messages
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 4.1 Implement comprehensive loading states
  - Add loading spinners for all async operations
  - Show progress indicators during question set operations
  - Disable buttons during processing to prevent double-clicks
  - _Requirements: 5.1, 2.6_

- [x] 4.2 Add detailed success and error notifications
  - Show specific success messages with operation details
  - Implement error notifications with actionable guidance
  - Add notification for auto-save and manual save operations
  - _Requirements: 5.2, 5.3_

- [x] 4.3 Improve empty states and user guidance
  - Create informative empty state for no question sets
  - Add actionable guidance for adding first question set
  - Implement helpful tooltips and descriptions
  - _Requirements: 5.5, 1.3_

- [ ]* 4.4 Add user experience enhancements
  - Implement keyboard shortcuts for common operations
  - Add drag-and-drop reordering for question sets
  - Create bulk operations for multiple question sets
  - _Requirements: 5.4_

- [x] 5. Data Consistency and Validation
  - Ensure data consistency between different views
  - Implement data validation and sanitization
  - Add cache invalidation strategies
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 5.1 Implement data synchronization between views
  - Ensure details and edit pages show consistent data
  - Update all relevant state when question sets change
  - Implement proper cache invalidation after operations
  - _Requirements: 4.1, 4.2_

- [x] 5.2 Add data validation and sanitization
  - Validate question set data before display
  - Sanitize user inputs and API responses
  - Handle malformed or incomplete data gracefully
  - _Requirements: 4.3, 4.4_

- [ ]* 5.3 Implement comprehensive testing
  - Add unit tests for question set operations
  - Create integration tests for API interactions
  - Add end-to-end tests for user workflows
  - _Requirements: All requirements_