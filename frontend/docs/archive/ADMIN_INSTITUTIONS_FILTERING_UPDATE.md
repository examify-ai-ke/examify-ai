# Admin Institutions List - Filtering & Sorting Update

## Changes Made

Updated the admin institutions list page to properly use the backend API for filtering and sorting, ensuring all filters work correctly with the search endpoint.

### 1. Smart API Selection

The page now intelligently chooses between two endpoints:

**List API** (`/api/v1/institution`):
- Used when NO filters are active
- Simple pagination only
- Most efficient for browsing all institutions

**Search API** (`/api/v1/institution/search/advanced`):
- Used when ANY filter is active (search, type, category, location, or sort)
- Supports advanced filtering and sorting
- Parameters sent to backend:
  - `q`: Search query (text search)
  - `institution_type`: Public/Private/Other
  - `location`: Specific location filter
  - `sort_by`: Field to sort by
  - `sort_order`: asc/desc
  - `limit` & `skip`: Pagination

### 2. Filter Implementation

**Institution Type Filter**:
- Options: All Types, Public, Private, Other
- Sent to backend via `institution_type` parameter
- ✅ Backend-supported

**Category Filter**:
- Options: All Categories, University, College, TVET, TVC, TTI, Other
- Applied client-side (not supported by backend search API)
- ⚠️ Note: Category filtering is done after receiving results

**Location Filter**:
- Dynamically populated from available institutions
- Sent to backend via `location` parameter
- ✅ Backend-supported

**Search Filter**:
- Text search across institution name, location, description
- Sent to backend via `q` parameter
- ✅ Backend-supported

### 3. Sorting Implementation

**Sort Options**:
- Name A-Z (default)
- Institution Type
- Category
- Location

**Backend Sorting**:
- `sort_by` parameter sent to search API
- `sort_order` set to 'asc'

**Client-Side Sorting**:
- Applied for type, category, and location when needed
- Ensures consistent sorting even when backend doesn't support specific field

### 4. Pagination

- Properly integrated with both list and search APIs
- `limit` and `skip` parameters calculated correctly
- Page resets to 1 when filters change
- Total count updated from API response

### 5. Response Handling

Handles multiple response structures:
```typescript
// Preferred structure
response.data.data.items
response.data.data.total

// Fallback structures
response.data.items
response.data (if array)
```

### 6. Debounced Search

- Search input debounced by 300ms
- Prevents excessive API calls while typing
- Resets to page 1 on new search

## API Endpoints Used

### List Endpoint
```
GET /api/v1/institution
Parameters:
  - limit: number
  - skip: number
```

### Search Endpoint
```
GET /api/v1/institution/search/advanced
Parameters:
  - q: string (optional)
  - institution_type: 'Public' | 'Private' | 'Other' (optional)
  - location: string (optional)
  - sort_by: string (optional)
  - sort_order: 'asc' | 'desc' (optional)
  - limit: number
  - skip: number
```

## Filter Behavior

| Filter | Backend Support | Implementation |
|--------|----------------|----------------|
| Search (q) | ✅ Yes | Backend via search API |
| Institution Type | ✅ Yes | Backend via search API |
| Location | ✅ Yes | Backend via search API |
| Category | ❌ No | Client-side filtering |
| Sort By | ✅ Partial | Backend + client-side |

## User Experience Improvements

1. **Efficient API Usage**: Only uses search API when needed
2. **Fast Response**: Debounced search prevents excessive requests
3. **Consistent Results**: Client-side filtering ensures all filters work
4. **Clear Feedback**: Loading states and empty states properly handled
5. **Fallback Support**: Mock data available if API fails

## Testing Recommendations

1. Test with no filters (should use list API)
2. Test with search term (should use search API)
3. Test with type filter (should use search API)
4. Test with location filter (should use search API)
5. Test with category filter (client-side, works with any API)
6. Test pagination with various filters
7. Test sorting with different options
8. Test debounced search (type quickly, should only call API once)

## Future Enhancements

1. Add category support to backend search API
2. Add more sort options (created_at, exam_count, etc.)
3. Add tags filtering
4. Add date range filtering (established_year)
5. Add has_exam_papers filter
6. Implement URL query parameters for shareable filtered views
