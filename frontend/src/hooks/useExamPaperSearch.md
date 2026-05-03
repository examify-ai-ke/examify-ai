# useExamPaperSearch Hook Documentation

## Overview

The `useExamPaperSearch` hook provides comprehensive search and filtering functionality for exam papers with URL synchronization, debouncing, and React Query integration.

## Features

- ✅ **Text Search**: Full-text search with 300ms debouncing
- ✅ **Multiple Filters**: Institution, course, year, tags, duration, date range
- ✅ **URL Synchronization**: All filters persist in URL for sharing and bookmarking
- ✅ **React Query Integration**: Automatic caching, refetching, and loading states
- ✅ **Pagination**: Built-in pagination support
- ✅ **Sorting**: Multiple sort options (relevance, date, duration, title)
- ✅ **TypeScript**: Full type safety

## Usage

```typescript
import { useExamPaperSearch } from '@/hooks/useExamPaperSearch';

function BrowsePageContent() {
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

  // Update search query
  const handleSearch = (query: string) => {
    setFilters({ query });
  };

  // Update filters
  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    clearFilters();
  };

  // Change page
  const handlePageChange = (page: number) => {
    setPage(page);
  };

  return (
    <div>
      {isLoading && <LoadingSpinner />}
      {papers.map(paper => (
        <ExamPaperCard key={paper.id} paper={paper} />
      ))}
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
```

## API Reference

### Return Value

```typescript
interface UseExamPaperSearchReturn {
  // Data
  papers: ExamPaperRead[];        // Array of exam papers
  total: number;                   // Total number of results
  
  // Loading states
  isLoading: boolean;              // Loading indicator
  isError: boolean;                // Error indicator
  error: Error | null;             // Error object if any
  
  // Filter management
  filters: SearchFilters;          // Current filter state
  setFilters: (filters: Partial<SearchFilters>) => void;  // Update filters
  clearFilters: () => void;        // Clear all filters
  
  // Pagination
  currentPage: number;             // Current page number
  totalPages: number;              // Total number of pages
  setPage: (page: number) => void; // Change page
}
```

### SearchFilters Interface

```typescript
interface SearchFilters {
  // Text search
  query?: string;                  // Search query (debounced 300ms)
  
  // Entity filters
  institutionIds?: string[];       // Filter by institutions
  courseIds?: string[];            // Filter by courses
  years?: string[];                // Filter by years
  tags?: string[];                 // Filter by tags
  
  // Range filters
  durationMin?: number;            // Minimum duration in minutes
  durationMax?: number;            // Maximum duration in minutes
  examDateFrom?: string;           // Start date (ISO format)
  examDateTo?: string;             // End date (ISO format)
  
  // Sorting
  sortBy?: 'relevance' | 'date' | 'duration' | 'title';
  sortOrder?: 'asc' | 'desc';
  
  // Pagination
  page?: number;                   // Current page (1-indexed)
  pageSize?: number;               // Items per page
}
```

## URL Synchronization

The hook automatically syncs all filters to URL query parameters:

```
/exampapers?q=mathematics&institutions=inst1,inst2&years=2023,2024&page=2
```

### URL Parameters

- `q` - Search query
- `institutions` - Comma-separated institution IDs
- `courses` - Comma-separated course IDs
- `years` - Comma-separated years
- `tags` - Comma-separated tags
- `durationMin` - Minimum duration
- `durationMax` - Maximum duration
- `dateFrom` - Start date
- `dateTo` - End date
- `sortBy` - Sort field
- `sortOrder` - Sort direction
- `page` - Current page
- `pageSize` - Items per page

## Debouncing

Search queries are automatically debounced with a 300ms delay to prevent excessive API calls:

```typescript
// User types "mathematics"
setFilters({ query: 'm' });        // No API call yet
setFilters({ query: 'ma' });       // No API call yet
setFilters({ query: 'mat' });      // No API call yet
// ... 300ms passes ...
// API call with query: "mat"
```

## Caching

React Query caching is configured for optimal performance:

- **Stale Time**: 2 minutes - Data is considered fresh for 2 minutes
- **GC Time**: 5 minutes - Cached data is kept for 5 minutes

## Examples

### Basic Search

```typescript
const { papers, isLoading } = useExamPaperSearch();

// Search for papers
setFilters({ query: 'calculus' });
```

### Multiple Filters

```typescript
// Filter by institution and year
setFilters({
  institutionIds: ['inst1', 'inst2'],
  years: ['2023', '2024'],
});
```

### Range Filters

```typescript
// Filter by duration range
setFilters({
  durationMin: 60,
  durationMax: 180,
});

// Filter by date range
setFilters({
  examDateFrom: '2023-01-01',
  examDateTo: '2023-12-31',
});
```

### Sorting

```typescript
// Sort by date (newest first)
setFilters({
  sortBy: 'date',
  sortOrder: 'desc',
});

// Sort by title (A-Z)
setFilters({
  sortBy: 'title',
  sortOrder: 'asc',
});
```

### Pagination

```typescript
// Go to page 2
setPage(2);

// Change page size
setFilters({ pageSize: 50 });
```

### Clear Filters

```typescript
// Reset to default state
clearFilters();
```

## Requirements Satisfied

This hook satisfies the following requirements from the spec:

- **1.1**: Full-text search across exam papers
- **1.4**: URL query parameters for search state
- **1.5**: Restore search state from URL
- **9.1**: Update URL with active filters
- **9.2**: Restore filter state from URL on navigation
- **9.3**: Share URLs with filters
- **9.4**: Apply filters from URL on page load
- **9.5**: Remove filter parameters when cleared

## Performance Considerations

1. **Debouncing**: Search input is debounced to reduce API calls
2. **Caching**: React Query caches results for faster subsequent loads
3. **URL Updates**: URL updates use `router.replace()` to avoid history pollution
4. **Memoization**: API parameters are memoized to prevent unnecessary re-renders

## Browser Compatibility

- Supports browser back/forward navigation
- Works with URL sharing and bookmarking
- Compatible with all modern browsers

## Testing

See `src/hooks/__tests__/useExamPaperSearch.test.ts` for test examples.

## Migration from Old Implementation

```typescript
// Old implementation
const [searchQuery, setSearchQuery] = useState('');
const [filters, setFilters] = useState({});
const { data } = useExamPapers({ search: searchQuery, ...filters });

// New implementation
const { papers, filters, setFilters } = useExamPaperSearch();
```

## Notes

- The hook automatically resets to page 1 when filters change (except pagination)
- URL synchronization happens automatically - no manual intervention needed
- The hook uses the search endpoint when filters are active, otherwise uses list endpoint
- All filter values are optional - the hook works with no filters applied
