# Requirements Document

## Introduction

This specification addresses a critical HTML validation error in the public exam paper details page. The QuestionCard component currently has nested button elements, which violates HTML standards and causes hydration errors in React. When users click to view an exam paper from the public exampapers page (/exampapers), they encounter a console error: "In HTML, <button> cannot be a descendant of <button>."

## Glossary

- **QuestionCard Component**: A React component that displays exam questions with expandable sub-questions and answer visibility toggles
- **Hydration Error**: A mismatch between server-rendered HTML and client-rendered React that occurs when HTML structure is invalid
- **Button Nesting**: The invalid practice of placing a `<button>` element inside another `<button>` element
- **Event Propagation**: The process by which events bubble up through the DOM tree

## Requirements

### Requirement 1

**User Story:** As a student viewing exam papers, I want to expand questions with sub-questions without encountering browser errors, so that I can navigate the interface smoothly

#### Acceptance Criteria

1. WHEN the QuestionCard Component renders a question with sub-questions, THE QuestionCard Component SHALL use a non-button container element for the clickable card wrapper
2. WHEN a user clicks on the card area to expand sub-questions, THE QuestionCard Component SHALL toggle the expanded state without triggering nested button warnings
3. WHEN a user clicks on the "View Answer" Button within the card, THE QuestionCard Component SHALL prevent event propagation to the parent container
4. THE QuestionCard Component SHALL maintain all existing visual styling and hover effects
5. THE QuestionCard Component SHALL preserve keyboard accessibility for all interactive elements

### Requirement 2

**User Story:** As a developer maintaining the codebase, I want the component to follow HTML standards, so that the application passes validation and avoids hydration errors

#### Acceptance Criteria

1. THE QuestionCard Component SHALL NOT contain any nested button elements in its rendered HTML
2. WHEN the browser console is checked during page load, THE QuestionCard Component SHALL NOT generate any HTML validation warnings
3. WHEN React hydration occurs, THE QuestionCard Component SHALL NOT produce hydration mismatch errors
4. THE QuestionCard Component SHALL use semantic HTML elements appropriate for their purpose
5. THE QuestionCard Component SHALL maintain proper ARIA attributes for accessibility

### Requirement 3

**User Story:** As a student using keyboard navigation, I want to interact with questions and answers using only my keyboard, so that I can access content without a mouse

#### Acceptance Criteria

1. WHEN a question card has sub-questions, THE QuestionCard Component SHALL be focusable and activatable via keyboard
2. WHEN a user presses Enter or Space on a focusable card container, THE QuestionCard Component SHALL toggle the expanded state
3. WHEN a user tabs through interactive elements, THE QuestionCard Component SHALL provide logical focus order
4. THE QuestionCard Component SHALL display visible focus indicators for all interactive elements
5. WHEN a question card has no sub-questions, THE QuestionCard Component SHALL NOT be keyboard-focusable as a container
