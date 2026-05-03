# Module Filter Implementation

## Overview
Added module filtering and search functionality to the exam papers browse page.

## Implementation Details

### 1. Backend Limitation
The backend `/api/v1/exampaper/search` endpoint does **NOT** support `module_id` filtering parameter. Therefore, module filtering is implemented **client-side**.

### 2. Changes Made

#### A. `src/hooks/useAvailableFilters.ts`
- ✅ Added `modules: FilterOption[]` to `AvailableFilters` interface
- ✅ Created `extractModules()` function to extract unique modules from exam papers
- ✅ Modules are extracted with counts and sorted alphabetically
- ✅ Added modules to the returned filter data

#### B. `src/hooks/useExamPaperSearch.ts`
- ✅ Added `moduleIds?: string[]` to `SearchFilters` interface
- ✅ Added module IDs to URL parameter parsing (`modules` query param)
- ✅ Added module IDs to URL parameter generation
- ✅ Implemented client-side filtering for modules using `useMemo`
- ✅ Applied pagination to filtered results

#### C. `src/components/public/filter-sidebar.tsx`
- ✅ Added `modules: FilterOption[]` to filters interface
- ✅ Created `handleModuleToggle()` function
- ✅ Added Module filter section in UI (between Courses and Tags)
- ✅ Made module filter searchable when > 5 options

## How It Works

### Data Flow
1. **Fetch exam papers** (up to 100) to extract available modules
2. **Extract unique modules** from the papers' `modules` array
3. **Display module filter** in sidebar with counts
4. **User selects modules** → Updates URL with `?modules=id1,id2`
5. **Client-side filtering** → Filters papers where any module matches selected IDs
6. **Re-paginate** filtered results

### Client-Side Filtering Logic
```typescript
// Filter papers by selected module IDs
if (filters.moduleIds && filters.moduleIds.length > 0) {
  papers = papers.filter(paper => {
    if (!paper.modules || !Array.isArray(paper.modules)) return false;
    return paper.modules.some((module: any) => 
      filters.moduleIds?.includes(module.id)
    );
  });
}
```

### URL Synchronization
- **URL Format:** `/browse?modules=uuid1,uuid2,uuid3`
- **Parsing:** Comma-separated module IDs from URL
- **Generation:** Joins selected module IDs with commas

## Features

### Module Filter Section
- **Location:** Between "Course" and "Tags" filters in sidebar
- **Searchable:** Yes, when more than 5 modules available
- **Shows counts:** Number of papers per module
- **Multi-select:** Users can select multiple modules
- **Badge:** Shows count of selected modules

### Behavior
- **OR Logic:** Papers matching ANY selected module are shown
- **Pagination:** Applied after filtering
- **URL Sync:** Module selections persist in URL
- **Clear Filters:** Clears module selections along with other filters

## Limitations

### 1. Client-Side Filtering
- **Pro:** Works without backend changes
- **Con:** Limited to papers already fetched (max 100)
- **Impact:** If you have >100 papers, some modules might not appear in filters

### 2. Sample Size
- Modules are extracted from first 100 exam papers
- If you have 1000+ papers, module list might be incomplete

### 3. Performance
- Filtering happens in browser
- Should be fast for <1000 papers
- Might slow down with very large datasets

## Future Improvements

### Backend Enhancement (Recommended)
Add `module_id` parameter to `/api/v1/exampaper/search` endpoint:

```python
# Backend API enhancement
@router.get("/search")
async def search_exam_papers(
    module_id: Optional[str] = None,  # Add this parameter
    # ... other parameters
):
    query = select(ExamPaper)
    
    if module_id:
        query = query.join(ExamPaper.modules).where(
            Module.id == module_id
        )
    
    # ... rest of query
```

### Alternative: Dedicated Filters Endpoint
Create `/api/v1/filters/available` endpoint that returns:
- All unique modules with counts
- All unique tags with counts
- Year range
- Duration range
- etc.

This would be more efficient than fetching 100 papers just to extract filter options.

## Testing

### Test Cases
1. ✅ Module filter appears in sidebar
2. ✅ Modules are searchable
3. ✅ Selecting modules filters papers
4. ✅ Multiple modules can be selected (OR logic)
5. ✅ Module selections persist in URL
6. ✅ Clear filters removes module selections
7. ✅ Pagination works with filtered results
8. ✅ Module counts are displayed

### Manual Testing Steps
1. Navigate to `/browse`
2. Wait for filters to load
3. Scroll to "Module" section in sidebar
4. Select one or more modules
5. Verify papers are filtered
6. Check URL contains `?modules=...`
7. Refresh page - selections should persist
8. Click "Clear All Filters" - modules should clear

## Notes

- Module filtering is **additive** with other filters (institution, course, year, tags)
- If a paper has multiple modules and ANY match the selection, it's included
- Empty module arrays are treated as "no modules" and excluded from results
- Module filter only shows modules that exist in the fetched papers sample

