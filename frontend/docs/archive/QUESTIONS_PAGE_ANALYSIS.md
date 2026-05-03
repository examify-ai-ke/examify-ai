# Questions Page - API Analysis & Enhancement Recommendations

## Current State
The `/questions` page currently uses:
- Basic search with debouncing (300ms)
- Simple pagination (20 items per page)
- `RecentQuestionsSection` component for display
- Limited filtering capabilities

---

## Available API Endpoints & Capabilities

### 1. **Search Endpoint** (`/api/v1/questions/search`)
**Advanced search with comprehensive filtering:**

#### Query Parameters:
```typescript
{
  q?: string;                          // Full-text search query
  question_type?: "main" | "sub" | "all";  // Filter by question type
  exam_paper_id?: string;              // Filter by exam paper
  question_set_id?: string;            // Filter by question set
  institution_id?: string;             // Filter by institution
  course_id?: string;                  // Filter by course
  module_id?: string;                  // Filter by module
  programme_id?: string;               // Filter by programme
  marks_min?: number;                  // Minimum marks filter
  marks_max?: number;                  // Maximum marks filter
  numbering_style?: string;            // Filter by numbering style (roman, alpha, numerical)
  has_answers?: boolean;               // Filter questions with/without answers
  include_children?: boolean;          // Include sub-questions
  sort_by?: string;                    // "relevance" | "marks" | "created_at"
  sort_order?: string;                 // "asc" | "desc"
  highlight?: boolean;                 // Enable search term highlighting
  skip?: number;                       // Pagination offset
  limit?: number;                      // Items per page
}
```

### 2. **Search Suggestions Endpoint** (`/api/v1/questions/search/suggestions`)
**Auto-complete suggestions for search:**
```typescript
{
  q: string;                           // Search query (required)
  question_type?: "main" | "sub" | "all";
  limit?: number;                      // Max suggestions (default: 10)
}
```

### 3. **Question Stats Endpoint** (`/api/v1/questions/stats`)
**Get statistics about questions:**
- Total questions count
- Questions by type (main/sub)
- Questions by institution
- Questions by course
- Average marks
- Questions with answers count

### 4. **Get Question by ID** (`/api/v1/questions/{question_id}`)
**Retrieve single question with options:**
```typescript
{
  include_children?: boolean;          // Include sub-questions
}
```

---

## Existing Reusable Components

### 1. **FilterSidebar** (`filter-sidebar.tsx`)
- Multi-select filtering
- Searchable filter options
- Collapsible sections
- Active filter badges
- Clear filters button
- Supports: institutions, years, courses, modules, tags, duration range, date range

### 2. **SearchAndSort** (`search-and-sort.tsx`)
- Search input with debouncing
- Sort options (relevance, date, duration, title)
- View mode toggle (grid/list)
- Filter button trigger
- Result count display
- Loading state

### 3. **StatsSection** (`stats-section.tsx`)
- Animated counter display
- Icon-based stat cards
- Intersection observer for lazy animation
- Responsive grid layout

### 4. **PaginationComponent** (`pagination.tsx`)
- Page navigation
- Previous/Next buttons
- Page number buttons
- Result count display

### 5. **QuestionCard** (`question-card.tsx`)
- Individual question display
- Marks display
- Question metadata
- Click handlers

### 6. **MobileFilterDrawer** (`mobile-filter-drawer.tsx`)
- Mobile-optimized filter interface
- Slide-out drawer
- Touch-friendly controls

---

## Recommended Enhancements

### Phase 1: Immediate Improvements (High Priority)

#### 1. **Add Advanced Filtering**
- Use `FilterSidebar` component
- Filter by:
  - Institution
  - Course
  - Module
  - Programme
  - Marks range (min/max)
  - Question type (main/sub)
  - Has answers (yes/no)

#### 2. **Improve Search**
- Implement search suggestions using `/api/v1/questions/search/suggestions`
- Add search highlighting
- Use `sort_by` parameter (relevance, marks, created_at)
- Add sort order toggle (asc/desc)

#### 3. **Add Statistics Display**
- Display question stats at top of page
- Use `StatsSection` component
- Show: Total questions, by type, by institution, etc.

#### 4. **Better Sorting Options**
- Sort by: Relevance, Marks, Date Created
- Sort order: Ascending/Descending
- Use `SearchAndSort` component

### Phase 2: Enhanced UX (Medium Priority)

#### 5. **Mobile Optimization**
- Implement `MobileFilterDrawer` for mobile filters
- Responsive layout adjustments
- Touch-friendly controls

#### 6. **Question Type Filtering**
- Toggle between Main/Sub/All questions
- Visual indicators for question type

#### 7. **Marks Range Slider**
- Filter by marks range (min/max)
- Visual slider component

#### 8. **Answer Availability Filter**
- Show only questions with answers
- Toggle option

### Phase 3: Advanced Features (Lower Priority)

#### 9. **Search Suggestions Dropdown**
- Auto-complete as user types
- Suggestion categories
- Quick select from suggestions

#### 10. **Saved Filters**
- Save frequently used filter combinations
- Quick filter presets

#### 11. **Related Questions**
- Show related questions based on current selection
- Suggestions sidebar

#### 12. **Question Difficulty Indicator**
- Visual difficulty badges
- Based on marks or question type

---

## Implementation Roadmap

### Step 1: Update `usePublicData.ts` Hook
Add new hook for advanced search:
```typescript
export function useAdvancedQuestionSearch(filters: AdvancedQuestionFilters) {
  // Use /api/v1/questions/search endpoint
  // Support all filter parameters
}

export function useQuestionSearchSuggestions(query: string) {
  // Use /api/v1/questions/search/suggestions endpoint
}

export function useQuestionStats() {
  // Use /api/v1/questions/stats endpoint
}
```

### Step 2: Update Questions Page Component
```typescript
// Add:
- FilterSidebar component
- SearchAndSort component
- StatsSection component
- MobileFilterDrawer for mobile
- Enhanced pagination

// Remove:
- Basic SearchBar
- Simple Filter button
```

### Step 3: Update API Calls
```typescript
// Current:
const searchFilters = {
  search: debouncedSearchQuery,
  skip: (page - 1) * ITEMS_PER_PAGE,
  limit: ITEMS_PER_PAGE,
};

// Enhanced:
const searchFilters = {
  q: debouncedSearchQuery,
  question_type: selectedQuestionType,
  institution_id: selectedInstitution,
  course_id: selectedCourse,
  module_id: selectedModule,
  programme_id: selectedProgramme,
  marks_min: marksRange.min,
  marks_max: marksRange.max,
  has_answers: filterAnswers,
  sort_by: sortBy,
  sort_order: sortOrder,
  highlight: true,
  include_children: true,
  skip: (page - 1) * ITEMS_PER_PAGE,
  limit: ITEMS_PER_PAGE,
};
```

---

## Component Integration Example

```typescript
// questions-content.tsx structure:

<div className="container mx-auto p-4 md:p-8">
  {/* Stats Section */}
  <StatsSection stats={questionStats} />
  
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
    {/* Sidebar with Filters */}
    <aside className="lg:col-span-1">
      <FilterSidebar
        filters={availableFilters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />
      <MobileFilterDrawer
        // Mobile version
      />
    </aside>
    
    {/* Main Content */}
    <main className="lg:col-span-3">
      {/* Search and Sort */}
      <SearchAndSort
        searchQuery={searchQuery}
        sortBy={sortBy}
        sortOrder={sortOrder}
        totalResults={totalItems}
        onSearchChange={handleSearch}
        onSortChange={handleSort}
        onFilterClick={handleMobileFilterClick}
      />
      
      {/* Questions List */}
      <RecentQuestionsSection
        questions={questions}
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />
      
      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </main>
  </div>
</div>
```

---

## Benefits of These Enhancements

1. **Better User Experience**: Users can find questions more easily
2. **Advanced Filtering**: Filter by multiple criteria simultaneously
3. **Improved Search**: Suggestions and highlighting
4. **Mobile Friendly**: Optimized for all devices
5. **Performance**: Leverage existing API capabilities
6. **Reusability**: Use existing components
7. **Consistency**: Match other pages (ExamPapers, Institutions)

---

## API Response Format

All endpoints return paginated responses:
```typescript
{
  message: string;
  meta: {
    timestamp: string;
    version: string;
  };
  data: {
    items: QuestionRead[];
    total: number;
    page: number;
    size: number;
    pages: number;
    previous_page?: number;
    next_page?: number;
  }
}
```

---

## Notes

- The search endpoint supports **full-text search** across question content
- **Highlighting** can be enabled for search results
- **Sort options**: relevance, marks, created_at
- **Question types**: main, sub, or all
- **Include children** option to get sub-questions with main questions
- All filters are **optional** and can be combined
