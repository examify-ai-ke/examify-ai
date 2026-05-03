# Design Document

## Overview

This design document outlines the technical approach for enhancing the `/dashboard/questions/manage` page to match the filtering, search, and data loading functionality of the `/dashboard/questions` page. The enhancement will maintain the existing management-focused features while adopting the proven patterns from the main questions page.

The design follows React best practices, uses TypeScript for type safety, and leverages the existing API infrastructure through `adminAPI.questions.search()`. The implementation will be backward compatible with existing functionality while adding new capabilities.

## Architecture

### Component Structure

```
QuestionsManagePage (src/app/dashboard/questions/manage/page.tsx)
├── State Management
│   ├── questions: QuestionRead[]
│   ├── loading: boolean
│   ├── stats: QuestionsOverviewStats
│   ├── filters: QuestionsFilters
│   ├── currentPage: number
│   ├── totalPages: number
│   ├── totalItems: number
│   ├── pageSize: number
│   ├── viewMode: 'hierarchical' | 'table'
│   ├── institutions: InstitutionRead[]
│   ├── courses: CourseRead[]
│   ├── modules: ModuleRead[]
│   ├── programmes: ProgrammeRead[]
│   └── loadingHierarchy: boolean
│
├── Data Loading
│   ├── loadQuestions() - Main data fetching function
│   ├── loadHierarchyData() - Load filter options
│   └── useEffect hooks for initialization and filter changes
│
├── UI Components
│   ├── Header Section
│   │   ├── Title and description
│   │   ├── API status indicator
│   │   ├── View mode toggle
│   │   └── Action buttons (Refresh, Import, Add Question)
│   │
│   ├── Statistics Cards (4 cards)
│   │   ├── Total Questions
│   │   ├── With Answers
│   │   ├── Total Marks
│   │   └── Recent Questions
│   │
│   ├── Filter Section
│   │   ├── Search input
│   │   ├── Question type filter
│   │   ├── Marks range filter
│   │   ├── Academic hierarchy filters
│   │   ├── Numbering style filter
│   │   ├── Has answers filter
│   │   ├── Sort controls
│   │   └── Clear filters button
│   │
│   └── Content Display
│       ├── DataTable (table view)
│       └── HierarchicalQuestions (hierarchical view)
│
└── Helper Functions
    ├── transformQuestionForTable()
    ├── handleSearch()
    ├── handleFilterChange()
    ├── getMarksRangeMin()
    ├── getMarksRangeMax()
    └── Action handlers (view, edit, delete, etc.)
```

### Data Flow

```
User Action → State Update → useEffect Trigger → API Call → Data Processing → UI Update
     ↓              ↓              ↓                ↓              ↓              ↓
  Filter      Update filters   Detect change   questions.search()  Transform    Re-render
  Change      state            in dependencies  with params        data         components
```

## Components and Interfaces

### Type Definitions

```typescript
// Import from API schema
type QuestionRead = components['schemas']['QuestionRead'];
type InstitutionRead = components['schemas']['InstitutionRead'];
type CourseRead = components['schemas']['CourseRead'];
type ModuleRead = components['schemas']['ModuleRead'];
type ProgrammeRead = components['schemas']['ProgrammeRead'];

// Statistics interface
interface QuestionsOverviewStats {
    totalQuestions: number;
    mainQuestions: number;
    subQuestions: number;
    questionsWithAnswers: number;
    totalMarks: number;
    averageMarks: number;
    recentQuestions: number;
    orphanQuestions: number;
}

// Filter interface
interface QuestionsFilters {
    search?: string;
    question_type?: 'main' | 'sub' | 'all';
    marks_range?: 'low' | 'medium' | 'high';
    exam_paper_id?: string;
    question_set_id?: string;
    institution_id?: string;
    course_id?: string;
    module_id?: string;
    programme_id?: string;
    numbering_style?: string;
    has_answers?: 'yes' | 'no' | 'all';
    sort_by?: 'relevance' | 'marks' | 'created_at';
    sort_order?: 'asc' | 'desc';
}

// Table display interface
interface QuestionTableData extends QuestionRead {
    displayText: string;
    numberingDisplay: React.ReactNode;
    marksDisplay: React.ReactNode;
    typeDisplay: React.ReactNode;
    statusDisplay: React.ReactNode;
    paperInfo: React.ReactNode;
    createdAtDisplay: React.ReactNode;
    actions: React.ReactNode;
}
```

### State Management

The component will use React hooks for state management:

```typescript
// Core data state
const [questions, setQuestions] = useState<QuestionRead[]>([]);
const [loading, setLoading] = useState(false);
const [stats, setStats] = useState<QuestionsOverviewStats>(initialStats);

// Filter and pagination state
const [filters, setFilters] = useState<QuestionsFilters>({});
const [currentPage, setCurrentPage] = useState(0);
const [totalPages, setTotalPages] = useState(0);
const [totalItems, setTotalItems] = useState(0);
const [pageSize, setPageSize] = useState(20);

// UI state
const [viewMode, setViewMode] = useState<'hierarchical' | 'table'>('table');
const [apiStatus, setApiStatus] = useState<'connected' | 'error'>('error');

// Hierarchy data for filters
const [institutions, setInstitutions] = useState<InstitutionRead[]>([]);
const [courses, setCourses] = useState<CourseRead[]>([]);
const [modules, setModules] = useState<ModuleRead[]>([]);
const [programmes, setProgrammes] = useState<ProgrammeRead[]>([]);
const [loadingHierarchy, setLoadingHierarchy] = useState(false);

// Initialization guard
const hasInitializedRef = useRef(false);
```

### Data Loading Functions

#### loadQuestions()

Primary function for fetching questions data:

```typescript
const loadQuestions = async () => {
    try {
        setLoading(true);
        
        // Build search parameters
        const searchParams: any = {
            question_type: filters.question_type || 'main',
            include_children: true,
            skip: currentPage * pageSize,
            limit: pageSize,
            highlight: true,
        };

        // Add search query
        if (filters.search && filters.search.trim() !== '') {
            searchParams.q = filters.search.trim();
        }

        // Add all filters
        if (filters.exam_paper_id) searchParams.exam_paper_id = filters.exam_paper_id;
        if (filters.question_set_id) searchParams.question_set_id = filters.question_set_id;
        if (filters.institution_id) searchParams.institution_id = filters.institution_id;
        if (filters.course_id) searchParams.course_id = filters.course_id;
        if (filters.module_id) searchParams.module_id = filters.module_id;
        if (filters.programme_id) searchParams.programme_id = filters.programme_id;
        if (filters.numbering_style) searchParams.numbering_style = filters.numbering_style;
        
        if (filters.has_answers && filters.has_answers !== 'all') {
            searchParams.has_answers = filters.has_answers === 'yes';
        }

        // Add marks range
        if (filters.marks_range) {
            const marksMin = getMarksRangeMin(filters.marks_range);
            const marksMax = getMarksRangeMax(filters.marks_range);
            if (marksMin !== undefined) searchParams.marks_min = marksMin;
            if (marksMax !== undefined) searchParams.marks_max = marksMax;
        }

        // Add sorting
        searchParams.sort_by = filters.sort_by || 'relevance';
        searchParams.sort_order = filters.sort_order || 'desc';

        // Call API
        const questionsResponse = await adminAPI.questions.search(searchParams);

        if (questionsResponse.data?.data) {
            const responseData = questionsResponse.data.data;
            const questionsData = responseData.items || [];

            setQuestions(questionsData);
            setTotalItems(responseData.total || 0);
            setTotalPages(Math.ceil((responseData.total || 0) / pageSize));

            // Calculate statistics
            calculateStats(questionsData);
            
            setApiStatus('connected');
        }
    } catch (error) {
        console.error('Error loading questions:', error);
        setApiStatus('error');
        addNotification({
            type: 'error',
            title: 'Failed to load questions',
            message: error instanceof Error ? error.message : 'Please try again later.',
        });
        setQuestions([]);
        setTotalItems(0);
    } finally {
        setLoading(false);
    }
};
```

#### loadHierarchyData()

Function for loading filter options:

```typescript
const loadHierarchyData = async () => {
    try {
        setLoadingHierarchy(true);
        const [institutionsResponse, coursesResponse, modulesResponse, programmesResponse] = 
            await Promise.all([
                adminAPI.institutions.list({ limit: 100 }),
                adminAPI.courses.list({ limit: 100 }),
                adminAPI.modules.list({ limit: 100 }),
                adminAPI.programmes.list({ limit: 100 })
            ]);

        setInstitutions(institutionsResponse.data?.data?.items || []);
        setCourses(coursesResponse.data?.data?.items || []);
        setModules(modulesResponse.data?.data?.items || []);
        setProgrammes(programmesResponse.data?.data?.items || []);
    } catch (error) {
        console.error('Error loading hierarchy data:', error);
    } finally {
        setLoadingHierarchy(false);
    }
};
```

#### calculateStats()

Helper function for calculating statistics:

```typescript
const calculateStats = (questionsData: QuestionRead[]) => {
    const totalSubQuestions = questionsData.reduce(
        (sum, q) => sum + (q.children?.length || 0), 0
    );
    
    const questionsWithAnswers = questionsData.filter(
        q => q.answers && q.answers.length > 0
    ).length;
    
    const totalMarks = questionsData.reduce((sum, q) => {
        const mainMarks = q.marks || 0;
        const subMarks = (q.children || []).reduce(
            (subSum, sub) => subSum + (sub.marks || 0), 0
        );
        return sum + mainMarks + subMarks;
    }, 0);
    
    const totalQuestionCount = questionsData.length + totalSubQuestions;
    const averageMarks = totalQuestionCount > 0 ? totalMarks / totalQuestionCount : 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentQuestions = questionsData.filter(
        q => new Date(q.created_at) > sevenDaysAgo
    ).length;

    const orphanQuestions = questionsData.filter(
        q => !q.question_set_id && !q.exam_paper_id
    ).length;

    setStats({
        totalQuestions: totalQuestionCount,
        mainQuestions: questionsData.length,
        subQuestions: totalSubQuestions,
        questionsWithAnswers,
        totalMarks,
        averageMarks: Math.round(averageMarks * 10) / 10,
        recentQuestions,
        orphanQuestions,
    });
};
```

### Effect Hooks

```typescript
// Initial load (with StrictMode guard)
useEffect(() => {
    if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
        void loadQuestions();
        void loadHierarchyData();
    }
}, []);

// Reload when filters or pagination change
useEffect(() => {
    if (!hasInitializedRef.current) return;
    void loadQuestions();
}, [currentPage, filters, pageSize]);
```

## Data Models

### Question Text Extraction

Questions use the QuestionTextSchema format with blocks:

```typescript
interface QuestionTextSchema {
    blocks: Array<{
        type: string;
        data: {
            text?: string;
            [key: string]: any;
        };
    }>;
}
```

Text extraction logic:

```typescript
const extractQuestionText = (question: QuestionRead): string => {
    const firstBlock = question.text?.blocks?.[0];
    const blockText = typeof firstBlock?.data?.['text'] === 'string' 
        ? (firstBlock?.data?.['text'] as string) 
        : '';
    return blockText || 'No text content';
};
```

### Table Data Transformation

Transform QuestionRead to QuestionTableData:

```typescript
const transformQuestionForTable = (question: QuestionRead): QuestionTableData => {
    const displayText = extractQuestionText(question);
    const truncatedText = displayText.length > 120 
        ? `${displayText.substring(0, 120)}...` 
        : displayText;

    return {
        ...question,
        displayText: truncatedText,
        numberingDisplay: renderNumberingBadge(question),
        marksDisplay: renderMarksBadge(question),
        typeDisplay: renderTypeBadge(question),
        statusDisplay: renderStatusBadge(question),
        paperInfo: renderPaperInfo(question),
        createdAtDisplay: renderCreatedAt(question),
        actions: renderActions(question),
    };
};
```

## UI Components

### Statistics Cards

Four cards displaying key metrics:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <Card>
        <CardHeader>
            <CardTitle>Total Questions</CardTitle>
            <HelpCircle className="h-4 w-4" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuestions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
                {stats.mainQuestions} main, {stats.subQuestions} sub
            </p>
        </CardContent>
    </Card>
    {/* Additional cards... */}
</div>
```

### Filter Section

Comprehensive filter controls:

```tsx
<Card>
    <CardHeader>
        <CardTitle>Filters</CardTitle>
    </CardHeader>
    <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search Input */}
            <Input
                placeholder="Search questions..."
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
            />
            
            {/* Question Type Filter */}
            <Select
                value={filters.question_type || 'all'}
                onValueChange={(value) => handleFilterChange('question_type', value)}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Question Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="main">Main Questions</SelectItem>
                    <SelectItem value="sub">Sub-questions</SelectItem>
                </SelectContent>
            </Select>
            
            {/* Additional filters... */}
        </div>
    </CardContent>
</Card>
```

### DataTable Configuration

Enhanced column definitions:

```typescript
const columns = [
    {
        key: 'displayText' as keyof QuestionTableData,
        header: 'Question',
        cell: (item: QuestionTableData) => (
            <div className="flex items-start space-x-3">
                <HelpCircle className="h-6 w-6 text-purple-600" />
                <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 mb-2">{item.displayText}</div>
                    <div className="flex items-center space-x-3 mb-1">
                        {item.numberingDisplay}
                        {item.marksDisplay}
                    </div>
                    <div className="flex items-center space-x-2">
                        {item.typeDisplay}
                    </div>
                </div>
            </div>
        ),
        sortable: false,
        width: '45%',
    },
    {
        key: 'createdAtDisplay' as keyof QuestionTableData,
        header: 'Created',
        cell: (item: QuestionTableData) => item.createdAtDisplay,
        sortable: true,
        width: '15%',
    },
    {
        key: 'institution' as keyof QuestionTableData,
        header: 'Institution',
        cell: (item: QuestionTableData) => (
            <div className="max-w-[120px]">
                <div className="font-medium text-sm truncate">
                    {item.institution?.name || 'N/A'}
                </div>
            </div>
        ),
        sortable: false,
        width: '15%',
    },
    // Additional columns...
];
```

### Pagination Configuration

Server-side pagination setup:

```tsx
<DataTable
    data={transformedQuestions}
    columns={columns}
    loading={loading}
    searchable={false}  // Using custom search
    pagination={{
        currentPage: currentPage,
        totalPages: totalPages,
        totalItems: totalItems,
        pageSize: pageSize,
        onPageChange: (newPage: number) => setCurrentPage(newPage),
        onPageSizeChange: (newSize: number) => {
            setPageSize(newSize);
            setCurrentPage(0);
        },
    }}
    emptyMessage="No questions found matching your filters"
/>
```

## Error Handling

### API Error Handling

```typescript
try {
    // API call
} catch (error) {
    console.error('Error loading questions:', error);
    setApiStatus('error');
    addNotification({
        type: 'error',
        title: 'Failed to load questions',
        message: error instanceof Error ? error.message : 'Please try again later.',
    });
    setQuestions([]);
    setTotalItems(0);
} finally {
    setLoading(false);
}
```

### Action Error Handling

```typescript
const handleRemoveSubQuestion = async (mainQuestionId: string, subQuestionId: string) => {
    try {
        await adminAPI.questions.removeSubQuestion(mainQuestionId, subQuestionId);
        useUIStore.getState().addNotification({
            type: 'success',
            title: 'Success',
            message: 'Sub-question removed successfully'
        });
        void loadQuestions();
    } catch (error) {
        console.error('Error removing sub-question:', error);
        useUIStore.getState().addNotification({
            type: 'error',
            title: 'Error',
            message: 'Failed to remove sub-question'
        });
    }
};
```

## Testing Strategy

### Unit Tests

1. **State Management Tests**
   - Test filter state updates
   - Test pagination state updates
   - Test statistics calculations

2. **Data Transformation Tests**
   - Test transformQuestionForTable()
   - Test text extraction from QuestionTextSchema
   - Test marks range helper functions

3. **Filter Logic Tests**
   - Test search parameter building
   - Test filter combinations
   - Test filter clearing

### Integration Tests

1. **API Integration Tests**
   - Test loadQuestions() with various filter combinations
   - Test loadHierarchyData()
   - Test error handling for failed API calls

2. **User Interaction Tests**
   - Test search input with debouncing
   - Test filter selection and clearing
   - Test pagination controls
   - Test view mode switching

### End-to-End Tests

1. **Complete User Flows**
   - Load page → Apply filters → View results
   - Search questions → Paginate → View details
   - Switch views → Maintain filters → Reload data

## Performance Considerations

### Optimization Strategies

1. **Debounced Search**
   - Implement 300ms debounce on search input
   - Prevent excessive API calls during typing

2. **Memoization**
   - Use useMemo for transformed questions data
   - Memoize expensive calculations

3. **Lazy Loading**
   - Load hierarchy data in parallel with questions
   - Don't block initial render

4. **Pagination**
   - Server-side pagination reduces client-side processing
   - Limit API responses to 20 items per page

5. **React StrictMode Guard**
   - Use ref to prevent double-fetch in development
   - Ensures single initialization

### Bundle Size

- No new dependencies required
- Reuse existing components and utilities
- Estimated impact: < 5KB additional code

## Security Considerations

### Access Control

- Maintain existing role-based access control
- Verify admin/manager permissions before rendering
- Show access denied message for unauthorized users

### Data Validation

- Validate filter inputs before API calls
- Sanitize search terms
- Validate pagination parameters

### API Security

- Use existing authentication tokens
- Handle 401/403 responses appropriately
- Don't expose sensitive data in error messages

## Accessibility

### WCAG 2.1 AA Compliance

1. **Keyboard Navigation**
   - All filters accessible via keyboard
   - Proper tab order
   - Focus indicators visible

2. **Screen Reader Support**
   - ARIA labels on filter controls
   - Status announcements for loading states
   - Descriptive button labels

3. **Visual Accessibility**
   - Sufficient color contrast
   - Text alternatives for icons
   - Responsive text sizing

## Migration Strategy

### Backward Compatibility

- Preserve existing management features
- Maintain current action handlers
- Keep existing dialog components

### Rollout Plan

1. **Phase 1**: Update state management and data loading
2. **Phase 2**: Implement filter UI components
3. **Phase 3**: Enhance table columns and display
4. **Phase 4**: Add statistics calculations
5. **Phase 5**: Testing and refinement

### Rollback Plan

- Keep original code in version control
- Feature flag for new functionality
- Quick revert capability if issues arise
