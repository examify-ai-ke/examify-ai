# Featured Institutions Update - Advanced Search Integration

## Overview
Updated the Featured Institutions section on the homepage to use the new advanced search endpoint (`/api/v1/institution/search/advanced`) with server-side sorting by exam count.

## Changes Made

### 1. Updated API Function (`src/lib/api-public.ts`)

**Before:**
- Used basic `/api/v1/institution` endpoint
- Fetched 50 institutions
- Sorted client-side by `exams_count`
- Sliced to get top N institutions

**After:**
- Uses `/api/v1/institution/search/advanced` endpoint
- Passes `sort_by: 'exam_count'` parameter
- Passes `sort_order: 'desc'` parameter
- Fetches exactly the number needed (no client-side filtering)
- Server handles all sorting logic

**Benefits:**
- More efficient (no over-fetching)
- Leverages backend sorting capabilities
- Consistent with new API features
- Better performance for large datasets

### 2. Updated Hook (`src/hooks/usePublicData.ts`)

**Before:**
- Received data from API
- Applied client-side sorting by `exams_count`
- Returned sorted array

**After:**
- Receives pre-sorted data from API
- No client-side sorting needed
- Simply returns the data as-is

**Benefits:**
- Cleaner code
- No redundant sorting
- Trusts backend sorting logic

## API Endpoint Details

### Endpoint
```
GET /api/v1/institution/search/advanced
```

### Parameters Used
```typescript
{
  skip: 0,
  limit: 8,              // Number of featured institutions to show
  sort_by: 'exam_count', // Sort by number of exam papers
  sort_order: 'desc'     // Descending order (most papers first)
}
```

### Available Sort Options
- `sort_by="exam_count"`: Sorts by the number of exam papers
- `sort_by="question_count"`: Sorts by the total number of questions across all exam papers

## Result

The Featured Institutions section on the homepage now:
1. ✅ Shows institutions sorted by exam paper count (most papers first)
2. ✅ Uses efficient server-side sorting
3. ✅ Fetches only the exact number needed (8 institutions)
4. ✅ Prioritizes institutions with actual content
5. ✅ Provides better user experience by showing most active institutions

## Testing Recommendations

1. **Verify Sorting**:
   - Check that institutions with more exam papers appear first
   - Verify the order matches the exam count

2. **Check Performance**:
   - Monitor network requests (should fetch exactly 8 institutions)
   - Verify no client-side sorting overhead

3. **Validate Data**:
   - Ensure all featured institutions have exam papers
   - Check that institutions without papers don't appear (or appear last)

## Future Enhancements

Consider adding:
- Toggle between `exam_count` and `question_count` sorting
- Display the exam/question count on institution cards
- Add "Most Active" or "Top Contributors" badge to featured institutions
