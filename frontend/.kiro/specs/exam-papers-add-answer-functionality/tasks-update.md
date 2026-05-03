# Implementation Tasks: Answer Display and Interaction Improvements

## Overview

These tasks address the missing and broken features in the answer display functionality. Priority is given to fixing visual issues first, then adding interactive features.

## Tasks

- [ ] 1. Add Comment API Functions to api-admin.ts
  - [ ] 1.1 Add getComments function
    - Implement GET `/api/v1/comment/by_answer/{answer_id}`
    - Support skip, limit, and order parameters
    - _Requirements: 8.2, 8.7_

  - [ ] 1.2 Add getCommentCount function
    - Implement GET `/api/v1/comment/count/{answer_id}`
    - _Requirements: 8.3, 8.6_

  - [ ] 1.3 Add createComment function
    - Implement POST `/api/v1/comment`
    - Accept CommentCreate schema
    - _Requirements: 8.1_

  - [ ] 1.4 Add updateComment function
    - Implement PUT `/api/v1/comment/{comment_id}`
    - Accept CommentUpdate schema
    - _Requirements: 8.1_

  - [ ] 1.5 Add deleteComment function
    - Implement DELETE `/api/v1/comment/{comment_id}`
    - _Requirements: 8.1_

  - [ ] 1.6 Add createCommentReply function
    - Implement POST `/api/v1/comment/reply/{parent_id}`
    - Support nested comments
    - _Requirements: 8.5_

  - [ ] 1.7 Add toggleCommentLike function
    - Implement POST `/api/v1/comment/{comment_id}/like`
    - _Requirements: 8.4_

  - [ ] 1.8 Add toggleCommentDislike function
    - Implement POST `/api/v1/comment/{comment_id}/dislike`
    - _Requirements: 8.4_

- [ ] 2. Add Comment API Functions to api-public.ts
  - [ ] 2.1 Add getComments function with error handling
    - Implement GET `/api/v1/comment/by_answer/{answer_id}`
    - Add try-catch error handling
    - _Requirements: 8.2, 8.7_

  - [ ] 2.2 Add getCommentCount function with error handling
    - Implement GET `/api/v1/comment/count/{answer_id}`
    - Add try-catch error handling
    - _Requirements: 8.3, 8.6_

  - [ ] 2.3 Add createComment function with error handling
    - Implement POST `/api/v1/comment`
    - Add try-catch error handling
    - _Requirements: 8.1_

  - [ ] 2.4 Add toggleCommentLike function with error handling
    - Implement POST `/api/v1/comment/{comment_id}/like`
    - Add try-catch error handling
    - _Requirements: 8.4_

  - [ ] 2.5 Add toggleCommentDislike function with error handling
    - Implement POST `/api/v1/comment/{comment_id}/dislike`
    - Add try-catch error handling
    - _Requirements: 8.4_

- [ ] 3. Fix AnswerRenderer Component Display Issues
  - [ ] 3.1 Fix duplicate author name
    - Remove duplicate author name display
    - Keep only one instance in the header
    - _Requirements: 9.2_

  - [ ] 3.2 Add avatar display with proper sizing
    - Add avatar image with w-8 h-8 (32x32px) classes
    - Use rounded-full for circular avatar
    - Add alt text with author name
    - _Requirements: 9.1, 9.6_

  - [ ] 3.3 Add default avatar fallback
    - Check if profile_image exists
    - Show default avatar placeholder when missing
    - Use a colored circle with initials or icon
    - _Requirements: 9.3_

  - [ ] 3.4 Reorganize author information layout
    - Create single row with: avatar | name | timestamp
    - Use flex layout with gap-2
    - Ensure proper alignment
    - _Requirements: 9.5, 9.7_

  - [ ] 3.5 Add visual separator
    - Import Separator component from shadcn/ui
    - Add separator between answer content and footer
    - Use appropriate margin (my-3 or my-4)
    - _Requirements: 9.4_

- [ ] 4. Add Like/Dislike Interactive Buttons
  - [ ] 4.1 Add state management for vote status
    - Add useState for isLiking and isDisliking loading states
    - Add useState for local vote counts
    - Initialize from answer.upvotes_count and answer.downvotes_count
    - _Requirements: 10.8_

  - [ ] 4.2 Implement handleLike function
    - Call publicAPI.answers.toggleLike(answer.id)
    - Update local vote counts on success
    - Handle loading state
    - Show error notification on failure
    - _Requirements: 10.2, 10.4, 10.6, 10.7_

  - [ ] 4.3 Implement handleDislike function
    - Call publicAPI.answers.toggleDislike(answer.id)
    - Update local vote counts on success
    - Handle loading state
    - Show error notification on failure
    - _Requirements: 10.3, 10.5, 10.6, 10.7_

  - [ ] 4.4 Add Like button UI
    - Replace static like count with interactive button
    - Show ThumbsUp icon from lucide-react
    - Display current like count
    - Disable when isLiking is true
    - Add hover effects
    - _Requirements: 10.1, 10.4, 10.6_

  - [ ] 4.5 Add Dislike button UI
    - Replace static dislike count with interactive button
    - Show ThumbsDown icon from lucide-react
    - Display current dislike count
    - Disable when isDisliking is true
    - Add hover effects
    - _Requirements: 10.1, 10.5, 10.6_

- [ ] 5. Add Comment Count Display
  - [ ] 5.1 Add comment count to answer footer
    - Check if answer.comments_count exists
    - Display "X comments" or "X comment" (singular)
    - Use MessageCircle icon from lucide-react
    - Add hover effect for future comment viewing
    - _Requirements: 8.6_

  - [ ] 5.2 Style comment count consistently
    - Match styling of other footer elements
    - Use text-sm text-gray-600
    - Add appropriate spacing
    - _Requirements: 9.5_

- [ ] 6. Checkpoint - Test Display Improvements
  - Ensure all tests pass, ask the user if questions arise.
  - Test avatar display with profile_image
  - Test avatar display without profile_image (default)
  - Test that author name appears only once
  - Test visual separator is visible
  - Test responsive layout on mobile/tablet/desktop
  - Verify no console errors

- [ ] 7. Checkpoint - Test Interactive Features
  - Ensure all tests pass, ask the user if questions arise.
  - Test like button toggles correctly
  - Test dislike button toggles correctly
  - Test switching from like to dislike
  - Test vote counts update correctly
  - Test buttons disable during API calls
  - Test error handling for failed API calls
  - Test comment count displays correctly

- [ ]* 8. Write Unit Tests for AnswerRenderer
  - [ ]* 8.1 Test avatar displays when profile_image exists
    - **Property: Avatar Display**
    - **Validates: Requirements 9.1**

  - [ ]* 8.2 Test default avatar displays when profile_image missing
    - **Property: Default Avatar Fallback**
    - **Validates: Requirements 9.3**

  - [ ]* 8.3 Test author name appears only once
    - **Property: Single Author Name**
    - **Validates: Requirements 9.2**

  - [ ]* 8.4 Test separator renders between content and footer
    - **Property: Visual Separator**
    - **Validates: Requirements 9.4**

- [ ]* 9. Write Integration Tests for Like/Dislike
  - [ ]* 9.1 Test like button calls API correctly
    - **Property: Like API Integration**
    - **Validates: Requirements 10.2**

  - [ ]* 9.2 Test dislike button calls API correctly
    - **Property: Dislike API Integration**
    - **Validates: Requirements 10.3**

  - [ ]* 9.3 Test vote counts update after API success
    - **Property: Vote Count Updates**
    - **Validates: Requirements 10.4, 10.5**

  - [ ]* 9.4 Test buttons disable during API calls
    - **Property: Loading State Management**
    - **Validates: Requirements 10.8**

- [ ] 10. Final Checkpoint - Complete Verification
  - Ensure all tests pass, ask the user if questions arise.
  - Run full test suite
  - Perform manual testing on all viewports
  - Verify all requirements are met
  - Check for console errors or warnings
  - Test with real API data
  - Verify accessibility (keyboard navigation, screen reader support)

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Priority is on fixing display issues (tasks 3) before adding interactions (tasks 4-5)
- Comment API functions are added but UI for comments is future work
- Like/dislike functionality uses existing API endpoints
