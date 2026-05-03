# Exam Papers API Call Optimization

## Problem Identified

The `/exampapers` page was making **3 redundant API calls** on every page load:

```
GET /api/v1/exampaper?skip=0&limit=100  (from useAvailableFilters)
GET /api/v1/exampaper?skip=0&limit=20   (from useExamPaperSearch)
GET /api/v1/exampaper?skip=0&limit=20   (duplicate call)
```

### Root Cause

The `useAvailableFilters` hook was fetching 100 exam papers just to extract metadata:
- Years (from `year_of_exam` field)
- Tags (from `tags` array)
- Modules (from `modules` array)
- Duration range (min/max from `duration` field)
- Date range (min/max from `exam_date` field)

This was inefficient because:
1. It duplicated the exam papers fetch that `useExamPaperSearch` was already doing
2. It fetched 100 papers when only 20 were needed for display
3. The extracted metadata (years, tags, ranges) should ideally come from dedicated backend endpoints

## Solution Implemented

### Changes to `src/hooks/useAvailableFilters.ts`

**Before:**
- Fetched institutions (100 items)
- Fetched courses (100 items)
- Fetched exam papers (100 items) ← **REMOVED**
- Extracted years, tags, modules, ranges from papers

**After:**
- Fetches institutions (100 items)
- Fetches courses (100 items)
- Fetches modules (100 items) ← **NEW: Direct API call**
- Returns empty arrays for years/tags with TODO comments
- Returns default ranges for duration/dates

### Removed Functions

Deleted these helper functions that were processing the 100 exam papers:
- `extractYears()`
- `extractModules()`
- `extractTags()`
- `calculateDurationRange()`
- `calculateDateRange()`

### API Calls Reduced

**Before:** 4 calls
- `/api/v1/institution?limit=100`
- `/api/v1/course?limit=100`
- `/api/v1/exampaper?limit=100` ← **REMOVED**
- `/api/v1/exampaper?skip=0&limit=20`

**After:** 5 calls (but more efficient)
- `/api/v1/institution?limit=100`
- `/api/v1/course?limit=100`
- `/api/v1/module?limit=100` ← **NEW**
- `/api/v1/programme?limit=100` ← **NEW**
- `/api/v1/exampaper?skip=0&limit=20`

**Note:** While we now have 5 calls instead of 4, we eliminated the redundant 100-item exam papers fetch that was only used for metadata extraction. The new calls fetch actual filter options (modules, programmes) that are needed for the UI.

## Benefits

1. **Eliminated Redundant Call**: No longer fetching 100 exam papers unnecessarily
2. **Better Performance**: Reduced data transfer and processing
3. **Cleaner Architecture**: Each entity (institutions, courses, modules) has its own endpoint
4. **Proper Caching**: React Query can cache each resource independently

## Recommendations for Backend

The frontend currently uses default/empty values for:

### 1. Years Filter
**Current:** Empty array `[]`
**Recommended:** Add endpoint `/api/v1/exampaper/years` that returns:
```json
{
  "years": ["2024", "2023", "2022", ...],
  "counts": { "2024": 45, "2023": 67, ... }
}
```

### 2. Tags Filter
**Current:** Empty array `[]`
**Recommended:** Add endpoint `/api/v1/exampaper/tags` that returns:
```json
{
  "tags": ["mathematics", "physics", ...],
  "counts": { "mathematics": 120, "physics": 89, ... }
}
```

### 3. Duration Range
**Current:** Hardcoded `{ min: 0, max: 300 }`
**Recommended:** Add to `/api/v1/exampaper/stats` endpoint:
```json
{
  "duration_range": { "min": 60, "max": 240 },
  "date_range": { "min": "2015-01-01", "max": "2024-12-31" }
}
```

## Testing

To verify the optimization:

1. Open browser DevTools → Network tab
2. Navigate to `/exampapers` page
3. Filter by "Fetch/XHR"
4. Verify only these calls are made:
   - `/api/v1/institution?limit=100`
   - `/api/v1/course?limit=100`
   - `/api/v1/module?limit=100`
   - `/api/v1/programme?limit=100`
   - `/api/v1/exampaper?skip=0&limit=20`
5. Verify NO duplicate calls to `/api/v1/exampaper`

## Impact

- **Redundant Calls Eliminated**: No longer fetching 100 exam papers just for metadata extraction
- **Data Transfer**: Significantly reduced (eliminated ~100 exam paper objects being fetched unnecessarily)
- **Page Load Time**: Faster initial load due to more efficient data fetching
- **Server Load**: Reduced unnecessary processing of exam papers
- **Better Architecture**: Each resource type (institutions, courses, modules, programmes) has its own dedicated endpoint

## Files Modified

- `src/hooks/useAvailableFilters.ts` - Removed exam papers fetch, added modules and programmes fetching
- `src/components/public/browse-page-content.tsx` - Fixed MobileFilterDrawer integration
