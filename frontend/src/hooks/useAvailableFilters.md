# useAvailableFilters Hook

## Overview

The `useAvailableFilters` hook provides available filter options for the exam paper search functionality. It fetches and processes data from multiple API endpoints to provide comprehensive filter options including institutions, courses, years, tags, and ranges.

## Features

- ✅ Fetches institutions with exam counts
- ✅ Fetches available courses
- ✅ Extracts unique years from exam papers (sorted descending)
- ✅ Extracts unique tags with counts
- ✅ Calculates duration range (min/max)
- ✅ Calculates date range (min/max)
- ✅ Implements React Query caching strategy
- ✅ Handles errors gracefully
- ✅ TypeScript type safety

## Usage

```typescript
import { useAvailableFilters } from '@/hooks/useAvailableFilters';

function FilterSidebar() {
  const { data, isLoading, isError, error } = useAvailableFilters();
  
  if (isLoading) {
    return <div>Loading filters...</div>;
  }
  
  if (isError) {
    return <div>Error loading filters: {error?.message}</div>;
  }
  
  return (
    <div>
      {/* Institutions */}
      <div>
        <h3>Institutions</h3>
        {data?.institutions.map(inst => (
          <label key={inst.value}>
            <input type="checkbox" value={inst.value} />
            {inst.label} ({inst.count})
          </label>
        ))}
      </div>
      
      {/* Courses */}
      <div>
        <h3>Courses</h3>
        {data?.courses.map(course => (
          <label key={course.value}>
            <input type="checkbox" value={course.value} />
            {course.label}
          </label>
        ))}
      </div>
      
      {/* Years */}
      <div>
        <h3>Years</h3>
        {data?.years.map(year => (
          <label key={year.value}>
            <input type="checkbox" value={year.value} />
            {year.label}
          </label>
        ))}
      </div>
      
      {/* Tags */}
      <div>
        <h3>Tags</h3>
        {data?.tags.map(tag => (
          <label key={tag.value}>
            <input type="checkbox" value={tag.value} />
            {tag.label} ({tag.count})
          </label>
        ))}
      </div>
      
      {/* Duration Range */}
      <div>
        <h3>Duration (minutes)</h3>
        <input 
          type="number" 
          min={data?.durationRange.min} 
          max={data?.durationRange.max}
          placeholder="Min"
        />
        <input 
          type="number" 
          min={data?.durationRange.min} 
          max={data?.durationRange.max}
          placeholder="Max"
        />
      </div>
      
      {/* Date Range */}
      <div>
        <h3>Exam Date</h3>
        <input 
          type="date" 
          min={data?.dateRange.min} 
          max={data?.dateRange.max}
          placeholder="From"
        />
        <input 
          type="date" 
          min={data?.dateRange.min} 
          max={data?.dateRange.max}
          placeholder="To"
        />
      </div>
    </div>
  );
}
```

## API Reference

### Return Type

```typescript
interface UseAvailableFiltersReturn {
  data: AvailableFilters | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}
```

### Data Structure

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

## Caching Strategy

The hook uses React Query with the following caching configuration:

- **Stale Time**: 10 minutes - Data is considered fresh for 10 minutes
- **GC Time**: 30 minutes - Cached data is kept in memory for 30 minutes
- **Query Keys**: Separate keys for institutions, courses, and papers

This ensures:
- Reduced API calls for frequently accessed filter data
- Fresh data when needed
- Efficient memory usage

## Data Processing

### Institutions
- Fetched from `/api/v1/institution` endpoint
- Limited to 100 institutions
- Includes exam count for each institution
- Sorted by API default order

### Courses
- Fetched from `/api/v1/course` endpoint
- Limited to 100 courses
- Uses course name or course code as label
- Sorted by API default order

### Years
- Extracted from exam papers
- Unique values only
- Sorted in descending order (most recent first)
- Converted to string format

### Tags
- Extracted from exam papers
- Unique values with occurrence counts
- Sorted alphabetically
- Includes count for each tag

### Duration Range
- Calculated from all exam papers
- Returns min and max duration in minutes
- Defaults to 0-300 if no valid durations found

### Date Range
- Calculated from all exam papers
- Returns min and max exam dates
- Defaults to last 5 years if no valid dates found
- Format: YYYY-MM-DD

## Error Handling

The hook handles errors at multiple levels:

1. **API Errors**: Caught and thrown as Error objects
2. **Network Errors**: Handled by React Query
3. **Data Processing Errors**: Graceful fallbacks for missing data

Example error handling:

```typescript
const { data, isError, error } = useAvailableFilters();

if (isError) {
  console.error('Failed to load filters:', error);
  // Show error UI or fallback
}
```

## Performance Considerations

- **Parallel Fetching**: All three queries run in parallel
- **Caching**: Reduces redundant API calls
- **Lazy Loading**: Data only fetched when hook is used
- **Sample Size**: Fetches 500 papers for comprehensive filter data

## Integration with useExamPaperSearch

The hook is designed to work seamlessly with `useExamPaperSearch`:

```typescript
function BrowsePageContent() {
  const { data: availableFilters, isLoading: filtersLoading } = useAvailableFilters();
  const { papers, filters, setFilters } = useExamPaperSearch();
  
  return (
    <div>
      <FilterSidebar 
        filters={filters}
        availableFilters={availableFilters}
        onFilterChange={setFilters}
        isLoading={filtersLoading}
      />
      <ResultsGrid papers={papers} />
    </div>
  );
}
```

## Requirements Satisfied

This hook satisfies the following requirements from the spec:

- **Requirement 2.1**: Fetch and display available institutions
- **Requirement 3.1**: Display available exam years
- **Requirement 4.1**: Fetch and display available courses
- **Requirement 6.1**: Display available tags
- **Requirement 12.1**: Show count of papers for each filter option

## Future Enhancements

Potential improvements for future iterations:

1. **Dynamic Counts**: Update counts based on active filters
2. **Search Within Filters**: Add search functionality for long lists
3. **Pagination**: Handle large filter option lists
4. **Real-time Updates**: WebSocket support for live filter updates
5. **Custom Aggregations**: Backend endpoint for optimized filter data
