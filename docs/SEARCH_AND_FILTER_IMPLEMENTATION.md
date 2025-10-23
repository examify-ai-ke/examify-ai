# Search and Filter Implementation

## Overview

This document describes the comprehensive search and filtering system implemented for the Exampapel frontend application. The system allows users to search and filter exam papers by multiple criteria including institutions, courses, years, tags, duration, and exam dates.

## Architecture

### Components

1. **useExamPaperSearch Hook** (`src/hooks/useExamPaperSearch.ts`)
   - Manages search and filter state
   - Integrates with React Query for data fetching
   - Handles URL synchronization
   - Implements debouncing for search input (300ms)

2. **useAvailableFilters Hook** (`src/hooks/useAvailableFilters.ts`)
   - Fetches available filter options from API
   - Implements caching strategy (10 min stale, 30 min GC)
   - Extracts years and tags from exam papers
   - Calculates duration and date ranges

3. **FilterSidebar Component** (`src/components/public/filter-sidebar.tsx`)
   - Desktop filter interface
   - Multi-select checkboxes for institutions, courses, years, tags
   - Range inputs for duration and dates
   - Search within filter options
   - Clear filters functionality

4. **MobileFilterDrawer Component** (`src/components/public/mobile-filter-drawer.tsx`)
   - Mobile-optimized filter interface
   - Slide-in drawer with apply button
   - Filter count badge

5. **SearchAndSort Component** (`src/components/public/search-and-sort.tsx`)
   - Search input with debouncing
   - Sort controls (relevance, date, duration, title)
   - Sort order toggle (asc/desc)
   - Results count display
   - View mode toggle (grid/list)

6. **BrowsePageContent Component** (`src/components/public/browse-page-content.tsx`)
   - Main integration component
   - Combines all search/filter functionality
   - Handles loading, error, and empty states
   - Pagination support

### Data Flow

```
User Input → Component State → useExamPaperSearch Hook → API Call → Results
                                        ↓
                                   URL Params (synced)
```

## Features

### Search
- Full-text search across exam papers
- 300ms debouncing to reduce API calls
- Clear search button
- Loading indicator during search

### Filters

#### Institution Filter
- Multi-select checkboxes
- Search within institutions
- Paper count for each institution
- Sorted by API default

#### Year Filter
- Multi-select checkboxes
- Sorted in descending order (most recent first)
- Extracted from exam papers

#### Course Filter
- Multi-select checkboxes
- Search within courses
- Paper count for each course

#### Tag Filter
- Multi-select checkboxes
- OR logic (papers matching any selected tag)
- Tag occurrence counts
- Sorted alphabetically

#### Duration Range Filter
- Min/max number inputs
- Validation (min <= max)
- Range calculated from exam papers

#### Date Range Filter
- Date picker inputs (from/to)
- Validation (from <= to)
- Range calculated from exam papers

### Sorting
- **Relevance**: Best match for search query
- **Date**: Year of exam (newest/oldest)
- **Duration**: Exam duration (shortest/longest)
- **Title**: Alphabetical order
- Toggle between ascending/descending

### URL Synchronization
- All filters synced to URL query parameters
- Shareable URLs with active filters
- Browser back/forward navigation support
- Clean URLs (only non-default values included)

### Responsive Design
- Desktop: Sidebar layout
- Mobile: Drawer with apply button
- Filter count badges
- Optimized touch targets

### Performance
- React Query caching
- Request cancellation for pending searches
- Debounced search input
- Memoized filter computations
- Parallel data fetching

### Accessibility
- ARIA labels on all controls
- Keyboard navigation support
- Focus management
- Screen reader announcements
- Proper semantic HTML

## API Integration

### Endpoints Used

1. **GET /api/v1/exampaper/search**
   - Search exam papers with filters
   - Supports all filter parameters
   - Returns paginated results

2. **GET /api/v1/institution**
   - Fetch available institutions
   - Includes exam counts

3. **GET /api/v1/course**
   - Fetch available courses

4. **GET /api/v1/exampaper**
   - Fetch exam papers for extracting years/tags

### Request Parameters

```typescript
{
  // Text search
  q?: string;
  
  // Entity filters
  institution_id?: string;  // comma-separated IDs
  course_id?: string;       // comma-separated IDs
  year?: string;            // comma-separated years
  tags?: string;            // comma-separated tags
  
  // Range filters
  duration_min?: number;
  duration_max?: number;
  exam_date_from?: string;  // YYYY-MM-DD
  exam_date_to?: string;    // YYYY-MM-DD
  
  // Sorting
  sort_by?: 'created_at' | 'title' | 'year_of_exam' | 'duration';
  sort_order?: 'asc' | 'desc';
  
  // Pagination
  skip?: number;
  limit?: number;
}
```

## Usage Examples

### Basic Search

```typescript
import { useExamPaperSearch } from '@/hooks/useExamPaperSearch';

function MyComponent() {
  const { papers, setFilters } = useExamPaperSearch();
  
  const handleSearch = (query: string) => {
    setFilters({ query });
  };
  
  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {papers.map(paper => <PaperCard key={paper.id} paper={paper} />)}
    </div>
  );
}
```

### With Filters

```typescript
import { useExamPaperSearch } from '@/hooks/useExamPaperSearch';
import { useAvailableFilters } from '@/hooks/useAvailableFilters';

function BrowsePage() {
  const { papers, filters, setFilters } = useExamPaperSearch();
  const { data: availableFilters } = useAvailableFilters();
  
  return (
    <div>
      <FilterSidebar
        filters={availableFilters}
        activeFilters={filters}
        onFilterChange={setFilters}
      />
      <ResultsGrid papers={papers} />
    </div>
  );
}
```

## Type Definitions

### SearchFilters

```typescript
interface SearchFilters {
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

### AvailableFilters

```typescript
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
  count?: number;
  disabled?: boolean;
}
```

## Testing

### Manual Testing Checklist

- [ ] Search functionality works
- [ ] All filters can be applied
- [ ] Multiple filters work together (AND logic)
- [ ] Tags use OR logic
- [ ] Clear filters resets all state
- [ ] URL updates with filter changes
- [ ] Browser back/forward works
- [ ] Mobile drawer opens and closes
- [ ] Sorting works correctly
- [ ] Pagination works
- [ ] Loading states display
- [ ] Error states display
- [ ] Empty state displays
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility

### Automated Tests

Unit tests are marked as optional in the implementation plan. If needed, they can be added for:
- Filter state management
- URL synchronization utilities
- Data extraction functions
- Component rendering

## Performance Considerations

### Caching Strategy
- **Available Filters**: 10 min stale, 30 min GC
- **Search Results**: 2 min stale, 5 min GC
- Separate query keys for independent caching

### Optimization Techniques
- Debounced search input (300ms)
- Request cancellation with AbortController
- Parallel data fetching
- Memoized computations
- React Query automatic deduplication

### Bundle Size
- Uses existing shadcn/ui components
- No additional heavy dependencies
- Tree-shakeable imports

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled
- Graceful degradation for older browsers

## Future Enhancements

1. **Dynamic Filter Counts**
   - Update counts based on active filters
   - Show "0" for unavailable options

2. **Saved Searches**
   - Allow users to save filter combinations
   - Quick access to frequent searches

3. **Advanced Search**
   - Boolean operators (AND, OR, NOT)
   - Field-specific search
   - Wildcard support

4. **Filter Presets**
   - Common filter combinations
   - "Recent exams", "Popular courses", etc.

5. **Backend Aggregations**
   - Dedicated endpoint for filter options
   - More accurate counts
   - Better performance

## Troubleshooting

### Filters Not Working
- Check browser console for errors
- Verify API endpoints are accessible
- Check network tab for failed requests
- Ensure React Query is properly configured

### URL Not Updating
- Verify Next.js router is available
- Check middleware configuration
- Ensure component is client-side rendered

### Performance Issues
- Check React Query cache settings
- Verify debouncing is working
- Monitor network requests
- Check for unnecessary re-renders

## Support

For issues or questions:
1. Check this documentation
2. Review component source code
3. Check browser console for errors
4. Contact development team

## Changelog

### Version 1.0.0 (Current)
- Initial implementation
- All core features complete
- Mobile responsive
- Accessibility compliant
- URL synchronization
- Performance optimized
