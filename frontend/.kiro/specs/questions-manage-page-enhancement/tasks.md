# Implementation Plan

- [x] 1. Update state management and type definitions
  - Create comprehensive state variables matching the main questions page
  - Add QuestionsOverviewStats interface
  - Add QuestionsFilters interface with all filter options
  - Add QuestionTableData interface for table display
  - Add state for academic hierarchy data (institutions, courses, modules, programmes)
  - Add hasInitializedRef for React StrictMode guard
  - Add apiStatus state for connection indicator
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [x] 2. Implement loadHierarchyData function
  - Create async function to load academic hierarchy data
  - Use Promise.all to fetch institutions, courses, modules, and programmes in parallel
  - Set limit to 100 for each API call
  - Add loadingHierarchy state management
  - Handle errors gracefully with console logging
  - Update state with fetched data or empty arrays on error
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Refactor loadQuestions function to use search endpoint
  - Replace existing API call with adminAPI.questions.search()
  - Build comprehensive searchParams object
  - Set include_children: true to load sub-questions
  - Set highlight: true for search term highlighting
  - Add pagination parameters (skip, limit)
  - Add all filter parameters conditionally
  - Implement marks range filter logic with helper functions
  - Add default sorting (relevance, desc)
  - _Requirements: 1.2, 1.3, 4.2, 4.3, 4.4, 5.2_

- [x] 4. Implement statistics calculation logic
  - Create calculateStats helper function
  - Calculate totalQuestions (main + sub)
  - Calculate mainQuestions and subQuestions counts
  - Calculate questionsWithAnswers count and percentage
  - Calculate totalMarks across all questions and sub-questions
  - Calculate averageMarks per question (rounded to 1 decimal)
  - Calculate recentQuestions (last 7 days)
  - Calculate orphanQuestions (without question_set_id or exam_paper_id)
  - Update stats state with calculated values
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 5. Add helper functions for marks range filtering
  - Create getMarksRangeMin function
  - Return 1 for 'low', 4 for 'medium', 8 for 'high'
  - Create getMarksRangeMax function
  - Return 3 for 'low', 7 for 'medium', undefined for 'high'
  - Use these functions in loadQuestions when marks_range filter is active
  - _Requirements: 1.3, 4.3_

- [x] 6. Update useEffect hooks for data loading
  - Add initialization useEffect with hasInitializedRef guard
  - Call loadQuestions() and loadHierarchyData() on mount
  - Add reactive useEffect for filters and pagination changes
  - Skip execution if not initialized
  - Add proper dependency arrays
  - _Requirements: 4.1, 4.6, 5.2, 5.3_

- [x] 7. Enhance transformQuestionForTable function
  - Update text extraction to handle QuestionTextSchema blocks
  - Truncate display text to 120 characters
  - Create numberingDisplay with Hash icon and numbering style
  - Create marksDisplay with Star icon and marks value
  - Create typeDisplay showing main/sub with sub-question count
  - Create statusDisplay with answer count and badge
  - Add institution, programme, course display
  - Add modules display (first 2 with "+X more" indicator)
  - Create createdAtDisplay with formatted date and relative time
  - Update actions dropdown with enhanced handlers
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 8. Update table column definitions
  - Add displayText column with comprehensive question info (45% width)
  - Add createdAtDisplay column with date and relative time (15% width)
  - Add institution column with truncated name (15% width)
  - Add programme column with truncated name (15% width)
  - Add course column with truncated name (15% width)
  - Add modules column with list and "+X more" indicator (20% width)
  - Keep actions column (10% width)
  - Remove or update select column if needed
  - _Requirements: 6.1, 6.6_

- [x] 9. Implement comprehensive filter UI
  - Add search input with onChange handler
  - Add question type Select dropdown (all, main, sub)
  - Add marks range Select dropdown (all, low, medium, high)
  - Add institution Select dropdown with loaded data
  - Add course Select dropdown with loaded data
  - Add module Select dropdown with loaded data
  - Add programme Select dropdown with loaded data
  - Add numbering style Select dropdown
  - Add has answers Select dropdown (all, yes, no)
  - Add sort by Select dropdown (relevance, marks, created_at)
  - Add sort order Select dropdown (asc, desc)
  - Add "Clear Filters" button
  - Show loading state for hierarchy data
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 10. Implement filter change handlers
  - Update handleSearch to set search filter and reset page
  - Update handleFilterChange to handle all filter types
  - Convert 'all' values to undefined to clear filters
  - Reset currentPage to 0 when filters change
  - Implement clearFilters function to reset all filters
  - _Requirements: 1.4, 7.2, 7.3, 7.5_

- [x] 11. Update DataTable pagination configuration
  - Pass pagination as ServerPagination object
  - Set currentPage (0-based)
  - Set totalPages calculated from totalItems and pageSize
  - Set totalItems from API response
  - Set pageSize state value
  - Implement onPageChange handler to update currentPage
  - Implement onPageSizeChange handler to update pageSize and reset page
  - Set searchable={false} to use custom search
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 12. Update statistics cards display
  - Update Total Questions card with main/sub breakdown
  - Update With Answers card with percentage
  - Update Total Marks card with average marks
  - Update Recent Questions card (last 7 days)
  - Ensure all cards use stats state
  - Format numbers with toLocaleString()
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 13. Add API status indicator
  - Add apiStatus state ('connected' | 'error')
  - Set to 'connected' on successful API call
  - Set to 'error' on failed API call
  - Display status indicator in header
  - Show green dot for connected
  - Show red dot for error
  - Add descriptive text
  - _Requirements: 10.5, 10.6_

- [x] 14. Implement enhanced action handlers
  - Add handleRemoveSubQuestion function
  - Call adminAPI.questions.removeSubQuestion()
  - Show success notification and reload questions
  - Add handleUnlinkFromQuestionSet function
  - Call adminAPI.questions.unlinkFromQuestionSet()
  - Show success notification and reload questions
  - Add error handling for both functions
  - Update actions dropdown to include these options
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 15. Add loading states and error handling
  - Show loading spinner when loading is true
  - Show loading indicator for hierarchy data
  - Display error notifications on API failures
  - Show empty state when no questions match filters
  - Include error message in notifications
  - Log errors to console for debugging
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 16. Update header section
  - Add view mode toggle buttons (Hierarchical/Table)
  - Add Refresh button with loading state
  - Add Import button (placeholder)
  - Add "Add Question" button linking to create page
  - Add API status indicator
  - Maintain existing title and description
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 17. Implement view mode switching
  - Maintain viewMode state
  - Show HierarchicalQuestions component when viewMode is 'hierarchical'
  - Show DataTable component when viewMode is 'table'
  - Preserve filters when switching views
  - Don't reload data when switching views
  - Keep statistics visible in both views
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 18. Add filter active indicators
  - Show badge count of active filters
  - Highlight active filter controls
  - Show "Clear Filters" button when filters are active
  - Display active filter summary
  - _Requirements: 1.5, 7.4_

- [x] 19. Test and validate implementation
  - Test search functionality with various queries
  - Test all filter combinations
  - Test pagination controls
  - Test view mode switching
  - Test action handlers (remove, unlink, delete)
  - Test error handling scenarios
  - Test loading states
  - Verify statistics calculations
  - Test with empty results
  - Verify API status indicator
  - _Requirements: All_

- [x] 20. Code cleanup and optimization
  - Remove unused code and imports
  - Add TypeScript type annotations where missing
  - Ensure consistent code formatting
  - Add comments for complex logic
  - Verify no console errors or warnings
  - Check for accessibility compliance
  - Optimize re-renders with useMemo if needed
  - _Requirements: All_
