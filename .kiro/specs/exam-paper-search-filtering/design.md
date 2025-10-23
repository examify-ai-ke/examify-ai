# Design Document

## Overview

This document outlines the technical design for implementing comprehensive search and filtering functionality for exam papers. The solution will integrate with the existing backend API (`/api/v1/exampaper/search`) and enhance the current browse page with fully functional search and filtering capabilities.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browse Page Component                     │
│                  (browse-content.tsx)                        │
└───────────────────┬─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼────────┐    ┌────────▼─────────┐
│  SearchAndSort │    │  FilterSidebar   │
│   Component    │    │    Component     │
└───────┬────────┘    └────────┬─────────┘
        │                      │
        └──────────┬───────────┘
                   │
        ┌──────────▼──────────┐
        │  useExamPaperSearch │
        │       Hook          │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │   publicAPI.        │
        │   examPapers.search │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │   Backend API       │
        │ /api/v1/exampaper/  │
        │      search         │
        └─────────────────────┘
```

### Component Hierarchy

```
BrowsePageContent
├── SearchAndSort (updated)
│   ├── Search Input
│   ├── Sort Dropdown
│   └── View Mode Toggle
├── FilterSidebar (updated)
│   ├── Institution Filter
│   ├── Year Filter
│   ├── Course Filter
│   ├── Duration Range Filter
│   ├── Tag Filter
│   ├── Date Range Filter
│   └── Clear Filters Button
└── Results Grid/List
    └── ExamPaperCard (multiple)
```

## Components and Interfaces

### 1. Custom Hook: useExamPaperSearch

**Purpose:** Centralize search and filtering logic with proper API integration

**Location:** `src/hooks/useExamPaperSearch.ts`

**Interface:**
```typescript
interface SearchFilters {
  // Text search
  query?: string;
  
  // Entity filters
  institutionIds?: string[];
  courseIds?: string[];
  years?: string[];
  tags?: string[];
  
  // Range filters
  durationMin?: number;
  durationMax?: number;
  examDateFrom?: string;
  examDateTo?: string;
  
  // Sorting
  sortBy?: 'relevance' | 'date' | 'duration' | 'title';
  sortOrder?: 'asc' | 'desc';
  
  // Pagination
  page?: number;
  pageSize?: number;
}

interface UseExamPaperSearchReturn {
  // Data
  papers: ExamPaperRead[];
  total: number;
  
  // Loading states
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Filter management
  filters: SearchFilters;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  setPage: (page: number) => void;
}
```

**Implementation Details:**
- Use React Query for caching and automatic refetching
- Debounce text search queries (300ms)
- Sync filters with URL query parameters
- Handle loading and error states gracefully

### 2. Updated Component: FilterSidebar

**Purpose:** Provide comprehensive filtering UI

**Location:** `src/components/public/filter-sidebar.tsx`

**Props Interface:**
```typescript
interface FilterSidebarProps {
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  onClearFilters: () => void;
  availableFilters: AvailableFilters;
  isLoading?: boolean;
}

interface AvailableFilters {
  institutions: FilterOption[];
  courses: FilterOption[];
  years: FilterOption[];
  tags: FilterOption[];
  durationRange: { min: number; max: number };
  dateRange: { min: string; max: string };
}

interface FilterOption {
  value: string;
  label: string;
  count: number;
  disabled?: boolean;
}
```

**Features:**
- Collapsible filter sections
- Search within filter options (for institutions, courses)
- Display counts for each filter option
- Visual indication of active filters
- Mobile-responsive drawer on small screens

### 3. Updated Component: SearchAndSort

**Purpose:** Provide search input and sorting controls

**Location:** `src/components/public/search-and-sort.tsx`

**Props Interface:**
```typescript
interface SearchAndSortProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  totalResults: number;
  onFilterClick?: () => void;
  showFilterButton?: boolean;
  isLoading?: boolean;
}
```

**Features:**
- Debounced search input
- Clear search button
- Sort dropdown with order toggle
- Results count display
- Mobile filter button

### 4. Updated Component: BrowsePageContent

**Purpose:** Orchestrate search, filtering, and display

**Location:** `src/app/(public)/exampapers/browse-content.tsx`

**State Management:**
```typescript
// Use custom hook for search logic
const {
  papers,
  total,
  isLoading,
  isError,
  error,
  filters,
  setFilters,
  clearFilters,
  currentPage,
  totalPages,
  setPage,
} = useExamPaperSearch();

// Fetch available filter options
const { data: availableFilters } = useAvailableFilters();

// Mobile filter drawer state
const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
```

## Data Models

### SearchFilters Type
```typescript
export interface SearchFilters {
  query?: string;
  institutionIds?: string[];
  courseIds?: string[];
  years?: string[];
  tags?: string[];
  durationMin?: number;
  durationMax?: number;
  examDateFrom?: string;
  examDateTo?: string;
  sortBy?: 'relevance' | 'date' | 'duration' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
```

### API Request Mapping
```typescript
// Map frontend filters to API parameters
function mapFiltersToAPIParams(filters: SearchFilters) {
  return {
    q: filters.query,
    institution_id: filters.institutionIds?.join(','),
    course_id: filters.courseIds?.join(','),
    year: filters.years?.join(','),
    tags: filters.tags?.join(','),
    duration_min: filters.durationMin,
    duration_max: filters.durationMax,
    exam_date_from: filters.examDateFrom,
    exam_date_to: filters.examDateTo,
    sort_by: filters.sortBy,
    sort_order: filters.sortOrder,
    skip: (filters.page - 1) * filters.pageSize,
    limit: filters.pageSize,
    highlight: true,
  };
}
```

## Error Handling

### Error Scenarios

1. **API Request Failure**
   - Display error message with retry button
   - Log error details for debugging
   - Maintain previous results if available

2. **No Results Found**
   - Display friendly "No results" message
   - Suggest clearing filters or adjusting search
   - Show active filters for context

3. **Invalid Filter Values**
   - Validate filter inputs before API call
   - Show validation errors inline
   - Prevent invalid API requests

4. **Network Timeout**
   - Show timeout message
   - Provide retry option
   - Consider implementing request cancellation

### Error Handling Strategy
```typescript
try {
  const response = await publicAPI.examPapers.search(apiParams);
  
  if (response.error) {
    throw new Error(response.error.message || 'Failed to fetch exam papers');
  }
  
  return response;
} catch (error) {
  console.error('Search error:', error);
  
  // Show user-friendly error
  toast.error('Failed to search exam papers. Please try again.');
  
  // Return empty results with error flag
  return {
    data: [],
    total: 0,
    error: error as Error,
  };
}
```

## Testing Strategy

### Unit Tests

1. **useExamPaperSearch Hook**
   - Test filter state management
   - Test URL synchronization
   - Test debouncing behavior
   - Test pagination logic

2. **FilterSidebar Component**
   - Test filter selection/deselection
   - Test clear filters functionality
   - Test filter option rendering
   - Test mobile drawer behavior

3. **SearchAndSort Component**
   - Test search input debouncing
   - Test sort option changes
   - Test view mode toggle

### Integration Tests

1. **Search Flow**
   - User enters search query → API called with correct params → Results displayed
   - User clears search → Results reset to all papers

2. **Filter Flow**
   - User selects filters → API called with filters → Filtered results displayed
   - User clears filters → All papers displayed

3. **URL Synchronization**
   - Filters applied → URL updated
   - Page loaded with URL params → Filters restored

### E2E Tests

1. **Complete Search Journey**
   - Navigate to browse page
   - Enter search query
   - Apply multiple filters
   - Change sort order
   - Verify results match expectations

2. **Mobile Filter Experience**
   - Open filter drawer on mobile
   - Apply filters
   - Close drawer
   - Verify results updated

## Performance Considerations

### Optimization Strategies

1. **Debouncing**
   - Debounce search input (300ms)
   - Prevent excessive API calls

2. **Caching**
   - Use React Query for automatic caching
   - Cache filter options (institutions, courses, years)
   - Set appropriate stale times

3. **Lazy Loading**
   - Load filter options on demand
   - Implement virtual scrolling for large filter lists

4. **Request Cancellation**
   - Cancel pending requests when new search initiated
   - Use AbortController for cleanup

5. **Memoization**
   - Memoize filter option computations
   - Memoize API parameter mapping

### Performance Metrics

- Search response time: < 500ms
- Filter application: < 200ms
- Page load with filters: < 1s
- Mobile filter drawer animation: 60fps

## Accessibility

### WCAG 2.1 AA Compliance

1. **Keyboard Navigation**
   - All filters accessible via keyboard
   - Proper tab order
   - Enter/Space to toggle filters

2. **Screen Reader Support**
   - ARIA labels for all controls
   - Announce filter changes
   - Announce result counts

3. **Visual Indicators**
   - Clear focus states
   - Sufficient color contrast
   - Loading indicators

4. **Form Labels**
   - Proper label associations
   - Error message announcements
   - Helper text for complex filters

## Security Considerations

1. **Input Validation**
   - Sanitize search queries
   - Validate filter values
   - Prevent injection attacks

2. **Rate Limiting**
   - Implement client-side rate limiting
   - Respect API rate limits
   - Handle 429 responses gracefully

3. **Data Privacy**
   - Don't expose sensitive data in URLs
   - Sanitize error messages
   - Follow GDPR guidelines

## Migration Strategy

### Phase 1: Foundation (Week 1)
- Create useExamPaperSearch hook
- Update publicAPI.examPapers.search integration
- Implement URL synchronization

### Phase 2: UI Components (Week 1-2)
- Update FilterSidebar with all filter types
- Update SearchAndSort component
- Implement mobile filter drawer

### Phase 3: Integration (Week 2)
- Update BrowsePageContent to use new hook
- Connect all components
- Implement error handling

### Phase 4: Polish (Week 2-3)
- Add loading states
- Implement empty states
- Add animations and transitions
- Performance optimization

### Phase 5: Testing (Week 3)
- Write unit tests
- Write integration tests
- Conduct E2E testing
- User acceptance testing

## Dependencies

### New Dependencies
- None required (use existing libraries)

### Existing Dependencies
- React Query (already in use)
- React Hook Form (for filter forms)
- Zustand (for global state if needed)
- Next.js router (for URL management)

## Rollback Plan

If issues arise:
1. Feature flag to toggle new search/filter
2. Keep old implementation as fallback
3. Monitor error rates and user feedback
4. Gradual rollout to percentage of users

## Success Metrics

1. **Functionality**
   - All filters working correctly
   - Search returns relevant results
   - URL synchronization working

2. **Performance**
   - Search response < 500ms
   - No UI blocking during search
   - Smooth animations

3. **User Experience**
   - Reduced time to find papers
   - Increased filter usage
   - Positive user feedback

4. **Technical**
   - Test coverage > 80%
   - No critical bugs
   - Accessibility score > 90
