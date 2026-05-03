# Implementation Plan

- [x] 1. Create custom hook for exam paper search
  - Create `src/hooks/useExamPaperSearch.ts` with search filter state management
  - Implement React Query integration for API calls
  - Add URL synchronization for filter persistence
  - Implement debouncing for search input (300ms delay)
  - _Requirements: 1.1, 1.4, 1.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 2. Create hook for fetching available filter options
  - Create `src/hooks/useAvailableFilters.ts` to fetch institutions, courses, years, tags
  - Implement caching strategy with React Query
  - Add error handling for filter option fetching
  - _Requirements: 2.1, 3.1, 4.1, 6.1, 12.1_

- [x] 3. Update API integration for search endpoint
  - Update `src/lib/api-public.ts` examPapers.search method to support all filter parameters
  - Add proper type mapping from SearchFilters to API parameters
  - Implement request cancellation with AbortController
  - Add error handling and retry logic
  - _Requirements: 1.1, 2.2, 3.2, 4.2, 5.2, 6.2, 7.2, 8.2_

- [x] 4. Create SearchFilters type definitions
  - Create `src/types/search-filters.ts` with comprehensive filter interfaces
  - Define SearchFilters, AvailableFilters, FilterOption types
  - Export types for use across components
  - _Requirements: All requirements (type foundation)_

- [x] 5. Update FilterSidebar component
- [x] 5.1 Add institution filter section
  - Implement multi-select checkbox list for institutions
  - Add search within institutions functionality
  - Display paper count for each institution
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 12.1, 12.2_

- [x] 5.2 Add year filter section
  - Implement multi-select checkbox list for years
  - Sort years in descending order
  - Display paper count for each year
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 12.1_

- [x] 5.3 Add course filter section
  - Implement multi-select checkbox list for courses
  - Add search within courses functionality
  - Display paper count for each course
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 12.1_

- [x] 5.4 Add duration range filter section
  - Implement min/max number inputs for duration
  - Add validation for min <= max
  - Display current range selection
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5.5 Add tag filter section
  - Implement multi-select checkbox list for tags
  - Display paper count for each tag
  - Implement OR logic for multiple tags
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 12.1_

- [x] 5.6 Add date range filter section
  - Implement date picker inputs for from/to dates
  - Add validation for from <= to
  - Display current date range selection
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 5.7 Implement clear filters functionality
  - Add "Clear All Filters" button
  - Implement individual filter section clear buttons
  - Update UI to reflect cleared state
  - _Requirements: 2.5, 9.5_

- [x] 5.8 Add mobile filter drawer
  - Implement slide-in drawer for mobile screens
  - Add "Apply Filters" button for mobile
  - Display filter count badge on mobile filter button
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 6. Update SearchAndSort component
- [x] 6.1 Enhance search input
  - Implement debounced search input
  - Add clear search button
  - Add search icon and loading indicator
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 6.2 Implement sorting controls
  - Add sort dropdown with options (relevance, date, duration, title)
  - Implement sort order toggle (asc/desc)
  - Show current sort selection
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 6.3 Add results count display
  - Display total results count
  - Update count when filters change
  - Show "No results" when count is 0
  - _Requirements: 10.2, 12.5_

- [x] 7. Update BrowsePageContent component
  - Integrate useExamPaperSearch hook
  - Connect FilterSidebar with filter state
  - Connect SearchAndSort with search state
  - Implement pagination controls
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 8. Implement loading states
  - Add loading spinner during API calls
  - Disable filter controls while loading
  - Show skeleton loaders for results
  - _Requirements: 10.1, 10.5_

- [x] 9. Implement empty and error states
  - Create "No results found" component
  - Add suggestions for adjusting filters
  - Create error message component with retry button
  - _Requirements: 10.2, 10.3, 10.4_

- [x] 10. Implement URL synchronization
  - Sync all filters to URL query parameters
  - Parse URL parameters on page load
  - Update URL when filters change
  - Support browser back/forward navigation
  - _Requirements: 1.4, 1.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 11. Add filter count indicators
  - Display count of active filters
  - Show counts for each filter option
  - Update counts when filters change
  - Hide/disable options with zero count
  - _Requirements: 2.4, 6.5, 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 12. Implement accessibility features
  - Add ARIA labels to all filter controls
  - Implement keyboard navigation
  - Add focus management for filter drawer
  - Ensure proper tab order
  - Add screen reader announcements for filter changes
  - _Requirements: All requirements (accessibility)_

- [x] 13. Add performance optimizations
  - Implement request cancellation for pending searches
  - Add memoization for filter computations
  - Optimize re-renders with React.memo
  - Implement virtual scrolling for large filter lists (if needed)
  - _Requirements: All requirements (performance)_

- [x] 14. Update existing components for consistency
  - Ensure ExamPaperCard works with search results
  - Update Pagination component if needed
  - Verify all components work with new data structure
  - _Requirements: All requirements (integration)_

- [x] 15. Add error handling and validation
  - Validate filter inputs before API calls
  - Handle API errors gracefully
  - Add retry logic for failed requests
  - Display user-friendly error messages
  - _Requirements: 10.4_

- [ ]* 16. Write unit tests
  - Test useExamPaperSearch hook
  - Test useAvailableFilters hook
  - Test FilterSidebar component
  - Test SearchAndSort component
  - Test URL synchronization utilities
  - _Requirements: All requirements (testing)_

- [ ]* 17. Write integration tests
  - Test complete search flow
  - Test filter application flow
  - Test URL synchronization flow
  - Test mobile filter drawer flow
  - _Requirements: All requirements (testing)_

- [x] 18. Documentation and cleanup
  - Add JSDoc comments to all new functions
  - Update README with search/filter documentation
  - Remove any unused code
  - Verify all TypeScript types are correct
  - _Requirements: All requirements (documentation)_
