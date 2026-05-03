# Requirements Document

## Introduction

This specification outlines the requirements for enhancing the `/dashboard/questions/manage` page to match the comprehensive filtering, search, and data loading functionality currently implemented in the `/dashboard/questions` page. The goal is to provide a consistent user experience across both question management interfaces while maintaining the unique management-focused features of the manage page.

Currently, the `/dashboard/questions/manage` page has basic filtering but lacks the advanced search capabilities, comprehensive filter options, and optimized data loading patterns that exist in the main questions list page. This enhancement will bring feature parity between the two pages while preserving the management-specific functionality.

## Requirements

### Requirement 1: Advanced Search and Filtering

**User Story:** As an admin or manager, I want to search and filter questions using the same comprehensive options available on the main questions page, so that I can efficiently find and manage specific questions.

#### Acceptance Criteria

1. WHEN I access the questions manage page THEN I SHALL see a search input that supports full-text search across question content
2. WHEN I enter a search term THEN the system SHALL use the backend `/questions/search` endpoint with highlighting enabled
3. WHEN I apply filters THEN the system SHALL support filtering by:
   - Question type (main, sub, all)
   - Marks range (low: 1-3, medium: 4-7, high: 8+)
   - Exam paper ID
   - Question set ID
   - Institution ID
   - Course ID
   - Module ID
   - Programme ID
   - Numbering style
   - Has answers (yes, no, all)
4. WHEN I change any filter THEN the page SHALL reset to page 0 and reload questions
5. WHEN filters are active THEN I SHALL see visual indicators showing which filters are applied

### Requirement 2: Academic Hierarchy Data Loading

**User Story:** As an admin or manager, I want to filter questions by academic hierarchy (institutions, courses, modules, programmes), so that I can manage questions within specific academic contexts.

#### Acceptance Criteria

1. WHEN the page loads THEN the system SHALL fetch academic hierarchy data including:
   - Institutions (limit: 100)
   - Courses (limit: 100)
   - Modules (limit: 100)
   - Programmes (limit: 100)
2. WHEN hierarchy data is loading THEN I SHALL see a loading indicator
3. WHEN hierarchy data loads successfully THEN the filter dropdowns SHALL be populated with the fetched data
4. IF hierarchy data fails to load THEN the system SHALL log the error and continue with empty filter options
5. WHEN I select a hierarchy filter THEN only questions related to that entity SHALL be displayed

### Requirement 3: Enhanced Statistics Display

**User Story:** As an admin or manager, I want to see comprehensive statistics about questions that update based on my current filters, so that I can understand the scope and status of questions I'm viewing.

#### Acceptance Criteria

1. WHEN questions are loaded THEN the system SHALL calculate and display:
   - Total questions count (main + sub)
   - Main questions count
   - Sub-questions count
   - Questions with answers count and percentage
   - Total marks across all questions
   - Average marks per question
   - Recent questions (created in last 7 days)
   - Orphan questions (without question_set_id or exam_paper_id)
2. WHEN filters are applied THEN statistics SHALL update to reflect only the filtered questions
3. WHEN statistics are calculated THEN the system SHALL use the loaded questions data, not make separate API calls
4. WHEN displaying percentages THEN the system SHALL round to 1 decimal place

### Requirement 4: Optimized Data Loading Pattern

**User Story:** As an admin or manager, I want the page to load questions efficiently using the same optimized patterns as the main questions page, so that I experience fast and reliable performance.

#### Acceptance Criteria

1. WHEN the page initializes THEN the system SHALL use a ref guard to prevent React StrictMode double-fetch in development
2. WHEN loading questions THEN the system SHALL use the `adminAPI.questions.search()` endpoint for all queries
3. WHEN building search parameters THEN the system SHALL:
   - Set `include_children: true` to load sub-questions
   - Set `highlight: true` to enable search term highlighting
   - Include pagination parameters (skip, limit)
   - Include all active filters
   - Set default sort_by to 'relevance' and sort_order to 'desc'
4. WHEN the API response is received THEN the system SHALL extract questions from `responseData.items`
5. WHEN questions include children THEN the system SHALL use the pre-loaded children from the API response
6. IF the API call fails THEN the system SHALL display an error notification and keep the questions list empty

### Requirement 5: Server-Side Pagination

**User Story:** As an admin or manager, I want to navigate through large sets of questions using server-side pagination, so that the page loads quickly regardless of the total number of questions.

#### Acceptance Criteria

1. WHEN the page loads THEN the system SHALL default to page 0 with 20 items per page
2. WHEN I change pages THEN the system SHALL:
   - Update the currentPage state
   - Trigger a new API call with updated skip parameter
   - Maintain all active filters
3. WHEN I change page size THEN the system SHALL:
   - Update the pageSize state
   - Reset to page 0
   - Trigger a new API call with updated limit parameter
4. WHEN pagination controls are displayed THEN I SHALL see:
   - Current page number (0-based internally, 1-based in UI)
   - Total pages
   - Total items count
   - Page size selector
5. WHEN the DataTable component is used THEN pagination SHALL be passed as a ServerPagination object with:
   - currentPage
   - totalPages
   - totalItems
   - pageSize
   - onPageChange callback
   - onPageSizeChange callback

### Requirement 6: Enhanced Table Display

**User Story:** As an admin or manager, I want to see questions displayed in a table with comprehensive information matching the main questions page, so that I can quickly assess question details.

#### Acceptance Criteria

1. WHEN questions are displayed in table view THEN each row SHALL show:
   - Question text preview (truncated to 120 characters)
   - Question number with numbering style badge
   - Marks with visual indicator
   - Question type (main/sub) with sub-question count if applicable
   - Answer status with count
   - Exam paper and question set information
   - Created date with relative time
   - Institution name
   - Programme name
   - Course name
   - Modules list (showing first 2, with "+X more" indicator)
   - Action menu
2. WHEN displaying question text THEN the system SHALL extract text from the QuestionTextSchema blocks structure
3. WHEN a question has sub-questions THEN the system SHALL display the count in the type column
4. WHEN a question has answers THEN the system SHALL show a green badge with checkmark and count
5. WHEN a question has no answers THEN the system SHALL show a warning badge
6. WHEN displaying modules THEN the system SHALL show the first 2 modules and indicate if there are more

### Requirement 7: Filter UI Components

**User Story:** As an admin or manager, I want to use intuitive filter controls that match the main questions page, so that I can easily refine my question search.

#### Acceptance Criteria

1. WHEN I view the filter section THEN I SHALL see filter controls for:
   - Search input (with debouncing)
   - Question type dropdown
   - Marks range dropdown
   - Institution dropdown
   - Course dropdown
   - Module dropdown
   - Programme dropdown
   - Numbering style dropdown
   - Has answers dropdown
   - Sort by dropdown
   - Sort order dropdown
2. WHEN I type in the search input THEN the search SHALL be debounced to avoid excessive API calls
3. WHEN I select "all" in any dropdown THEN that filter SHALL be cleared (set to undefined)
4. WHEN filters are active THEN I SHALL see a "Clear Filters" button
5. WHEN I click "Clear Filters" THEN all filters SHALL be reset to their default values

### Requirement 8: Action Handlers Enhancement

**User Story:** As an admin or manager, I want action handlers that work with the enhanced data structure, so that I can perform management operations on questions.

#### Acceptance Criteria

1. WHEN I click "Remove from Main Question" on a sub-question THEN the system SHALL call `adminAPI.questions.removeSubQuestion()`
2. WHEN I click "Unlink from Question Set" on a main question THEN the system SHALL call `adminAPI.questions.unlinkFromQuestionSet()`
3. WHEN an action completes successfully THEN the system SHALL:
   - Show a success notification
   - Reload the questions list to reflect changes
4. IF an action fails THEN the system SHALL:
   - Show an error notification
   - Log the error to console
   - Keep the current questions list unchanged
5. WHEN I click any action THEN the system SHALL use the question ID from the transformed table data

### Requirement 9: View Mode Consistency

**User Story:** As an admin or manager, I want to switch between hierarchical and table views with the same functionality as the main questions page, so that I can choose my preferred viewing mode.

#### Acceptance Criteria

1. WHEN I switch to hierarchical view THEN the system SHALL use the HierarchicalQuestions component
2. WHEN I switch to table view THEN the system SHALL use the DataTable component with enhanced columns
3. WHEN I switch views THEN the current filters and search SHALL be maintained
4. WHEN I switch views THEN the questions data SHALL not be reloaded
5. WHEN in either view THEN the statistics SHALL remain visible and accurate

### Requirement 10: Loading States and Error Handling

**User Story:** As an admin or manager, I want clear feedback when data is loading or when errors occur, so that I understand the system state.

#### Acceptance Criteria

1. WHEN questions are loading THEN I SHALL see a loading indicator
2. WHEN hierarchy data is loading THEN I SHALL see a separate loading indicator for filters
3. WHEN an API error occurs THEN I SHALL see an error notification with the error message
4. WHEN no questions match the filters THEN I SHALL see an empty state message
5. WHEN the API is connected THEN I SHALL see a green status indicator
6. WHEN the API connection fails THEN I SHALL see a red status indicator with error status
