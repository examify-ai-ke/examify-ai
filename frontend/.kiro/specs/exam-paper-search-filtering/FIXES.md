# Sidebar Filtering Fixes

## Issue Summary
The sidebar filters were not loading properly due to:
1. Incorrect field name references (`course_code` instead of `course_acronym`)
2. Missing error handling in API calls
3. Lack of proper null/undefined checks for API responses

## Changes Made

### 1. Fixed `src/lib/api-public.ts`

#### Institutions List Method
- ✅ Added API URL logging for debugging
- ✅ Added explicit error checking for `response.error`
- ✅ Added better error messages with context
- ✅ Confirmed correct field name: `exams_count` (matches API schema)

#### Courses List Method
- ✅ Added API URL logging for debugging
- ✅ Added explicit error checking for `response.error`
- ✅ Added better error messages with context
- ✅ Fixed field name: Changed `course_code` to `course_acronym` (matches API schema)

### 2. Fixed `src/hooks/useAvailableFilters.ts`

#### Institutions Query
- ✅ Wrapped in try-catch for better error handling
- ✅ Added null/undefined checks for API response data
- ✅ Added retry logic (2 retries)
- ✅ Confirmed correct field: `institution.exams_count`

#### Courses Query
- ✅ Wrapped in try-catch for better error handling
- ✅ Added null/undefined checks for API response data
- ✅ Added retry logic (2 retries)
- ✅ Fixed field name: `course.course_acronym` instead of `course.course_code`

#### Papers Query
- ✅ Wrapped in try-catch for better error handling
- ✅ Added null/undefined checks for API response data
- ✅ Added retry logic (2 retries)

### 3. Enhanced `src/components/public/browse-page-content.tsx`

- ✅ Improved debug logging with structured output
- ✅ Added counts for each filter type in debug info

## API Schema Verification

Based on the `src/types/generated/api.ts` schema:

### InstitutionRead Schema
```typescript
{
  name: string;
  id: string;
  slug: string;
  exams_count: number | null;        // ✅ Correct field name
  campuses_count: number | null;
  faculties_count: number | null;
  // ... other fields
}
```

### CourseRead Schema
```typescript
{
  name: string;
  id: string;
  course_acronym: string | null;     // ✅ Correct field name (NOT course_code)
  modules_count: number | null;
  exam_papers_count: number | null;
  // ... other fields
}
```

## Testing Instructions

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Navigate to the browse page**
   - Go to `/browse` or click "Browse Papers" in the navigation

3. **Check browser console for debug logs**
   Look for these log messages:
   - `🏛️ Fetching institutions from: http://localhost:8000`
   - `📚 Fetching courses from: http://localhost:8000`
   - `📦 Institutions response: { count: X, ... }`
   - `📦 Courses response: { count: X, ... }`
   - `🔍 Filter Debug Info: { ... }`

4. **Verify sidebar filters appear**
   - Institution filters with counts
   - Course filters
   - Year filters
   - Tag filters
   - Duration range inputs
   - Date range inputs

## Expected Behavior

### Success Case
- Sidebar loads with all filter options
- Institution filters show exam counts
- Course filters show course names/acronyms
- Year filters show available years (sorted descending)
- Tag filters show tags with counts
- Duration and date ranges show appropriate min/max values

### Error Case (API not available)
- Error message displayed in sidebar
- Retry button available
- Detailed error logged to console
- Application doesn't crash

## Common Issues & Solutions

### Issue: "Failed to fetch institutions"
**Solution:** 
- Check if backend API is running on `http://localhost:8000`
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS configuration on backend

### Issue: Empty filter options
**Solution:**
- Check if backend has data (institutions, courses, exam papers)
- Verify API endpoints return data in correct format
- Check console for API response structure

### Issue: CORS errors
**Solution:**
- Ensure backend allows requests from `http://localhost:3000`
- Check backend CORS middleware configuration

## Environment Configuration

Create or update `.env.local`:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Enable mock data if API is not available
NEXT_PUBLIC_USE_MOCK_DATA=false
```

## Next Steps

If filters still don't load:
1. Check backend API health: `curl http://localhost:8000/api/v1/health`
2. Test institutions endpoint: `curl http://localhost:8000/api/v1/institution?limit=10`
3. Test courses endpoint: `curl http://localhost:8000/api/v1/course?limit=10`
4. Check browser Network tab for failed requests
5. Review backend logs for errors
