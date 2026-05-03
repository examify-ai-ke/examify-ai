# Troubleshooting Guide - Search & Filter Implementation

## Issue: Empty Filter Sidebar

### Symptoms
- Filter sidebar appears empty
- No institution, course, year, or tag filters visible
- May show "Loading Filters..." indefinitely

### Possible Causes & Solutions

#### 1. Backend API Not Running
**Check:**
```bash
# Verify the API is accessible
curl http://fastapi.localhost/api/v1/health
```

**Solution:**
- Ensure the FastAPI backend is running
- Check `NEXT_PUBLIC_API_URL` environment variable in `.env.local`
- Default: `http://fastapi.localhost`

#### 2. CORS Issues
**Check browser console for:**
```
Access to fetch at 'http://fastapi.localhost/api/v1/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**
- Ensure backend CORS settings allow `http://localhost:3000`
- Check FastAPI CORS middleware configuration

#### 3. API Endpoints Not Available
**Check:**
```bash
# Test institutions endpoint
curl http://fastapi.localhost/api/v1/institution

# Test courses endpoint
curl http://fastapi.localhost/api/v1/course

# Test exam papers endpoint
curl http://fastapi.localhost/api/v1/exampaper
```

**Solution:**
- Verify all required endpoints are implemented in backend
- Check API documentation at `http://fastapi.localhost/api/v1/docs`

#### 4. Empty Database
**Symptoms:**
- API returns empty arrays `[]`
- Total count is 0

**Solution:**
- Seed the database with test data
- Run database migrations
- Check database connection

#### 5. Network/Proxy Issues
**Check:**
- Browser DevTools > Network tab
- Look for failed requests (red)
- Check request/response details

**Solution:**
- Verify network connectivity
- Check proxy settings
- Try accessing API directly in browser

### Debug Steps

1. **Open Browser Console** (F12)
   - Look for console.log messages:
     - "Available Filters: ..."
     - "Filters Loading: ..."
     - "Filters Error: ..."

2. **Check Network Tab**
   - Filter by "Fetch/XHR"
   - Look for requests to:
     - `/api/v1/institution`
     - `/api/v1/course`
     - `/api/v1/exampaper`
   - Check status codes (should be 200)
   - Check response data

3. **Verify Environment Variables**
   ```bash
   # Check .env.local file
   cat .env.local | grep API_URL
   ```

4. **Test API Directly**
   ```bash
   # Test from command line
   curl -v http://fastapi.localhost/api/v1/institution
   ```

## Issue: Missing Pagination

### Symptoms
- No pagination controls at top or bottom of results
- Can't navigate between pages

### Possible Causes & Solutions

#### 1. Only One Page of Results
**Behavior:**
- Pagination is hidden when `totalPages <= 1`
- This is intentional

**Check:**
- Total results count
- Page size setting (default: 20)
- If you have < 20 results, pagination won't show

**Solution:**
- Add more data to database
- Or reduce page size for testing

#### 2. Missing Props
**Check component props:**
```typescript
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  pageSize={filters.pageSize || 20}
  totalItems={total}
  onPageChange={setPage}
  onPageSizeChange={(size) => setFilters({ pageSize: size })}
/>
```

**Solution:**
- Ensure all required props are passed
- Check that `total` and `totalPages` are calculated correctly

#### 3. Component Not Imported
**Check:**
```typescript
import { Pagination } from './pagination';
```

**Solution:**
- Verify import path is correct
- Check that Pagination component exists

## Issue: List View Not Default

### Solution Applied
Changed default `viewMode` from `'grid'` to `'list'` in:
- `src/components/public/browse-page-content.tsx`
- `src/components/public/search-and-sort.tsx`

## Quick Fixes

### Reset Everything
```bash
# Clear browser cache and storage
# In browser console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Restart Development Server
```bash
# Stop the dev server (Ctrl+C)
# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

### Check API Health
```bash
# Quick health check
curl http://fastapi.localhost/api/v1/health

# Detailed health check
curl http://fastapi.localhost/api/v1/health/detailed
```

## Expected Behavior

### Filter Sidebar Should Show:
- ✅ Institution filter (with search if > 5 items)
- ✅ Year filter (sorted descending)
- ✅ Course filter (with search if > 5 items)
- ✅ Tags filter
- ✅ Duration range (min/max inputs)
- ✅ Date range (from/to date pickers)
- ✅ Clear All button (when filters active)
- ✅ Active filter count badge

### Pagination Should Show:
- ✅ At top of results (above cards)
- ✅ At bottom of results (below cards)
- ✅ Current page indicator
- ✅ Total pages
- ✅ Previous/Next buttons
- ✅ Page number buttons
- ✅ Page size selector (desktop)
- ✅ Results count ("Showing X to Y of Z results")

## Still Having Issues?

### Enable Debug Mode
Add to `src/components/public/browse-page-content.tsx`:
```typescript
console.log('Debug Info:', {
  availableFilters,
  filtersLoading,
  filtersError,
  papers: papers.length,
  total,
  currentPage,
  totalPages,
  filters,
});
```

### Check React Query DevTools
Install React Query DevTools:
```bash
npm install @tanstack/react-query-devtools
```

Add to your app:
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// In your layout or app component
<ReactQueryDevtools initialIsOpen={false} />
```

### Contact Support
If issues persist:
1. Check browser console for errors
2. Check network tab for failed requests
3. Verify backend is running and accessible
4. Check database has data
5. Review this troubleshooting guide again

## Common Error Messages

### "Failed to fetch"
- **Cause:** Backend not running or not accessible
- **Solution:** Start backend server, check URL

### "CORS policy"
- **Cause:** CORS not configured properly
- **Solution:** Update backend CORS settings

### "404 Not Found"
- **Cause:** API endpoint doesn't exist
- **Solution:** Check API routes, verify backend version

### "500 Internal Server Error"
- **Cause:** Backend error
- **Solution:** Check backend logs, verify database connection

### "Network Error"
- **Cause:** Network connectivity issue
- **Solution:** Check internet connection, proxy settings
