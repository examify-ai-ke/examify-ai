# API Parameter Fixes - Sidebar Filtering

## Issues Found and Fixed

### Issue 1: Wrong Parameter Names in `getRecent` Method
**Location:** `src/lib/api-public.ts` - `examPapers.getRecent()`

**Problem:**
```typescript
// ❌ WRONG - Backend doesn't recognize these parameters
{
  page: 1,
  size: limit,
  order: 'descendent'
}
```

**Backend Error:**
```
pydantic_core._pydantic_core.ValidationError: 1 validation error for Params
size
  Input should be less than or equal to 100 [type=less_than_equal, input_value=50]
```

**Solution:**
```typescript
// ✅ CORRECT - Backend expects skip/limit
{
  skip: 0,
  limit: limit,
  order: 'descendent'
}
```

**API Schema Reference:**
According to `src/types/generated/api.ts`, the `/api/v1/exampaper/get_by_created_at` endpoint expects:
- `skip?: number` - Offset for pagination
- `limit?: number` - Maximum number of items to return
- `order?: 'ascendent' | 'descendent'` - Sort order

---

### Issue 2: Limit Exceeds Backend Maximum
**Location:** `src/hooks/useAvailableFilters.ts`

**Problem:**
```typescript
// ❌ WRONG - Backend max limit is 100
const result = await publicAPI.examPapers.list({ limit: 500 });
```

**Backend Constraint:**
The backend has a maximum limit of 100 items per request for all list endpoints.

**Solution:**
```typescript
// ✅ CORRECT - Respects backend limit
const result = await publicAPI.examPapers.list({ limit: 100 });
```

---

## All Fixed Endpoints

### 1. Exam Papers - Get Recent
- **Endpoint:** `/api/v1/exampaper/get_by_created_at`
- **Fixed Parameters:** Changed `page`/`size` to `skip`/`limit`
- **Limit:** Uses provided limit (default 10)

### 2. Exam Papers - List for Filters
- **Endpoint:** `/api/v1/exampaper`
- **Fixed Parameters:** Reduced limit from 500 to 100
- **Limit:** 100 (backend maximum)

### 3. Institutions - List for Filters
- **Endpoint:** `/api/v1/institution`
- **Parameters:** Already correct (`skip`/`limit`)
- **Limit:** 100 (backend maximum)

### 4. Courses - List for Filters
- **Endpoint:** `/api/v1/course`
- **Parameters:** Already correct (`skip`/`limit`)
- **Limit:** 100 (backend maximum)

---

## Backend API Parameter Standards

Based on the OpenAPI schema (`src/types/generated/api.ts`), all list endpoints follow this pattern:

### Standard Pagination Parameters
```typescript
{
  skip?: number;    // Offset (default: 0)
  limit?: number;   // Max items (default: 20, max: 100)
}
```

### NOT Used (Common Mistake)
```typescript
{
  page?: number;    // ❌ Not used in this API
  size?: number;    // ❌ Not used in this API
  per_page?: number; // ❌ Not used in this API
}
```

---

## Testing Checklist

- [x] Fixed `examPapers.getRecent()` parameter names
- [x] Reduced `examPapers.list()` limit from 500 to 100
- [x] Verified all limits are ≤ 100
- [x] Checked TypeScript compilation (no errors)
- [ ] Test sidebar filters load correctly
- [ ] Verify no backend validation errors
- [ ] Check browser console for successful API calls

---

## Expected Behavior After Fix

### Sidebar Filters Should:
1. ✅ Load institutions (up to 100)
2. ✅ Load courses (up to 100)
3. ✅ Load years from exam papers (extracted from 100 papers)
4. ✅ Load tags from exam papers (extracted from 100 papers)
5. ✅ Calculate duration range from papers
6. ✅ Calculate date range from papers

### No More Errors:
- ❌ "Failed to fetch" errors
- ❌ Pydantic validation errors about `size` parameter
- ❌ Backend 422 validation errors

---

## Notes

### Why Limit of 100?
The backend enforces a maximum limit of 100 items per request to:
- Prevent excessive database queries
- Maintain API performance
- Ensure reasonable response times

### Impact on Filter Data
Extracting years/tags from 100 papers instead of 500:
- **Pros:** Faster API response, respects backend limits
- **Cons:** Might miss some years/tags if you have >100 papers
- **Mitigation:** 100 papers should provide a good representative sample of available filters

### Future Improvements
If you need more comprehensive filter data:
1. Create a dedicated `/api/v1/filters/available` endpoint on backend
2. Backend can aggregate years/tags efficiently from database
3. Return pre-computed filter options without fetching all papers
