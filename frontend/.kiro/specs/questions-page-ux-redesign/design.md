# Design Document

## Overview

This design document outlines the architectural improvements for the public questions page to address UX issues related to loading states, filter interactions, and smooth transitions. The redesign focuses on maintaining UI stability, implementing proper loading patterns, and ensuring filters work correctly.

## Architecture

### Component Hierarchy

```
PublicQuestionsContent (Container)
├── StatsSection (Independent)
├── FilterSidebar (Persistent)
│   ├── FilterSection (Reusable)
│   │   ├── SearchInput (Optional)
│   │   └── FilterCheckboxList
│   └── ClearFiltersButton
├── QuestionsMainContent
│   ├── SearchAndSort (Persistent)
│   ├── ActiveFiltersDisplay (Conditional)
│   └── QuestionsListContainer
│       ├── LoadingOverlay (Conditional)
│       ├── ErrorState (Conditional)
│       ├── EmptyState (Conditional)
│       └── QuestionsList (with transitions)
└── MobileFilterDrawer (Mobile only)
```

### State Management Strategy

**Separation of Concerns:**
- **UI State**: Loading indicators, transitions, drawer open/closed
- **Filter State**: Selected filters, search queries
- **Data State**: Questions data, filter options, pagination
- **Cache State**: Previously fetched data for instant display

### Loading State Types

1. **Initial Load**: First page load - show skeleton loaders
2. **Filter Change**: User changes filters - show overlay on questions list
3. **Pagination**: User changes page - show inline loading indicator
4. **Background Refresh**: Silent data refresh - no loading indicator

## Components and Interfaces

### 1. QuestionsListContainer Component

**Purpose**: Manages the display of questions with proper loading states and transitions.

**Props Interface:**
```typescript
interface QuestionsListContainerProps {
  questions: Question[];
  isInitialLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error?: Error;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}
```

**Behavior:**
- Shows skeleton loaders during initial load
- Shows semi-transparent overlay during refetch
- Applies fade transition when content changes
- Maintains minimum height to prevent layout shift
- Shows appropriate empty/error states

### 2. FilterSidebar Component (Enhanced)

**Purpose**: Provides filter options with proper event handling and visual feedback.

**Key Improvements:**
- Single click handler per filter row (no double-firing)
- Immediate visual feedback on filter selection
- Debounced search inputs
- Loading states for filter options
- Sticky positioning for better UX

**Event Flow:**
```
User clicks filter row
  → onClick handler fires once
  → Update local state immediately (optimistic)
  → Call onFilterChange callback
  → Parent updates filter state
  → API call triggered (debounced)
  → Questions list shows loading overlay
  → Results update with fade transition
```

### 3. LoadingOverlay Component

**Purpose**: Provides consistent loading feedback across the application.

**Props Interface:**
```typescript
interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  variant?: 'full' | 'overlay' | 'inline';
}
```

**Variants:**
- **full**: Covers entire viewport (initial load)
- **overlay**: Semi-transparent over content (refetch)
- **inline**: Small spinner inline with content (pagination)

### 4. SkeletonLoader Component

**Purpose**: Shows placeholder content during initial load.

**Types:**
- QuestionCardSkeleton
- FilterSectionSkeleton
- StatsCardSkeleton

## Data Models

### Filter State Model

```typescript
interface FilterState {
  institutionIds: string[];
  courseIds: string[];
  moduleIds: string[];
  programmeIds: string[];
  years: string[];
  tags: string[];
  durationMin?: number;
  durationMax?: number;
  examDateFrom?: string;
  examDateTo?: string;
}
```

### Loading State Model

```typescript
interface LoadingState {
  isInitialLoad: boolean;
  isFetchingQuestions: boolean;
  isFetchingFilters: boolean;
  isChangingPage: boolean;
}
```

### Cache Model

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

interface QuestionsCache {
  [key: string]: CacheEntry<QuestionsResponse>;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Layout Stability During Loading

*For any* loading state transition, the page layout dimensions and component positions should remain stable without causing content shifts or disappearances.

**Validates: Requirements 1.1, 1.2**

### Property 2: Single Event Firing

*For any* filter checkbox click, the toggle handler should fire exactly once, resulting in a single state update.

**Validates: Requirements 2.1, 2.4**

### Property 3: Filter State Consistency

*For any* filter toggle operation, if a filter is checked then unchecked, the final state should match the initial state (idempotent round-trip).

**Validates: Requirements 2.3**

### Property 4: Loading State Isolation

*For any* component, when its data is loading, only that component's loading indicator should be visible, not affecting other independent components.

**Validates: Requirements 1.2, 3.1**

### Property 5: Transition Smoothness

*For any* content update, the transition duration should be consistent (300ms) and complete before the next update begins.

**Validates: Requirements 4.1, 4.2**

### Property 6: Error Recovery

*For any* API error, the system should provide a retry mechanism that, when successful, restores the component to a working state.

**Validates: Requirements 5.2**

### Property 7: Debounce Effectiveness

*For any* rapid sequence of filter changes within 300ms, only the final state should trigger an API call.

**Validates: Requirements 1.5, 6.1**

### Property 8: Cache Validity

*For any* cached data, if the cache is fresh (within expiry time), the system should display cached data immediately while fetching updates in the background.

**Validates: Requirements 3.2, 6.2**

## Error Handling

### Error Types and Handling

1. **Network Errors**
   - Display: "Unable to connect. Please check your internet connection."
   - Action: Retry button, auto-retry after 5s

2. **API Errors (4xx)**
   - Display: "Something went wrong. Please try again."
   - Action: Retry button, log error details

3. **No Results**
   - Display: "No questions found matching your criteria"
   - Action: Clear filters button, search suggestions

4. **Timeout Errors**
   - Display: "Request timed out. Please try again."
   - Action: Retry button with longer timeout

### Error Boundaries

- Wrap each major section in error boundary
- Prevent one component's error from breaking entire page
- Log errors to monitoring service
- Show fallback UI with recovery options

## Testing Strategy

### Unit Tests

1. **Filter Toggle Logic**
   - Test single filter toggle
   - Test multiple filter toggles
   - Test filter clear functionality
   - Test edge cases (empty arrays, undefined values)

2. **Loading State Management**
   - Test initial load state
   - Test refetch state
   - Test pagination state
   - Test state transitions

3. **Debounce Functionality**
   - Test rapid filter changes
   - Test debounce timing
   - Test cleanup on unmount

### Property-Based Tests

Using **fast-check** library for JavaScript/TypeScript property-based testing.

**Configuration:**
- Minimum 100 iterations per property test
- Use appropriate generators for test data
- Tag each test with corresponding property number

### Integration Tests

1. **Filter Flow**
   - User selects filter → Questions update → Filter badge appears
   - User removes filter → Questions update → Filter badge disappears

2. **Loading Flow**
   - Initial load → Skeleton → Content with fade
   - Filter change → Overlay → Updated content

3. **Error Flow**
   - API fails → Error message → Retry → Success

### E2E Tests

1. Complete user journey: Search → Filter → View results
2. Mobile filter drawer interaction
3. Pagination and scroll behavior
4. Error recovery scenarios

## Performance Considerations

### Optimization Strategies

1. **React.memo** for expensive components
2. **useMemo** for computed values (filter counts, active filters)
3. **useCallback** for event handlers to prevent re-renders
4. **Debouncing** for search and filter inputs (300ms)
5. **Request cancellation** for outdated API calls
6. **Virtual scrolling** for large question lists (>100 items)
7. **Image lazy loading** for question images
8. **Code splitting** for mobile drawer component

### Performance Metrics

- Time to Interactive (TTI): < 3s
- First Contentful Paint (FCP): < 1.5s
- Filter interaction response: < 100ms (optimistic UI)
- API response handling: < 50ms
- Smooth 60fps animations

## Accessibility

### ARIA Labels and Roles

- Filter checkboxes: `role="checkbox"`, `aria-checked`
- Loading states: `aria-live="polite"`, `aria-busy="true"`
- Error messages: `role="alert"`
- Filter counts: `aria-label="X filters active"`

### Keyboard Navigation

- Tab through filters
- Space/Enter to toggle
- Escape to close mobile drawer
- Arrow keys for pagination

### Screen Reader Announcements

- "Filter applied: Institution - University Name"
- "Loading questions..."
- "X questions found"
- "Error loading questions. Retry button available"

## Mobile Considerations

### Touch Interactions

- Minimum touch target: 44x44px
- Swipe to close filter drawer
- Pull-to-refresh for questions list
- Smooth scroll with momentum

### Responsive Breakpoints

- Mobile: < 768px (drawer for filters)
- Tablet: 768px - 1024px (collapsible sidebar)
- Desktop: > 1024px (persistent sidebar)

### Mobile-Specific Optimizations

- Reduce animation complexity on low-end devices
- Smaller images for mobile
- Simplified filter UI
- Bottom sheet for filters (alternative to drawer)

## Implementation Notes

### Key Technical Decisions

1. **Use React Query** for data fetching and caching
   - Automatic background refetch
   - Built-in loading states
   - Request deduplication
   - Cache management

2. **CSS Transitions** over JavaScript animations
   - Better performance
   - Hardware acceleration
   - Simpler implementation

3. **Optimistic UI Updates**
   - Update UI immediately
   - Revert on error
   - Better perceived performance

4. **Intersection Observer** for lazy loading
   - Native browser API
   - Better performance than scroll listeners
   - Automatic cleanup

### Migration Strategy

1. **Phase 1**: Fix filter toggle double-firing issue
2. **Phase 2**: Implement proper loading states
3. **Phase 3**: Add transitions and animations
4. **Phase 4**: Optimize performance
5. **Phase 5**: Add accessibility features

### Backward Compatibility

- Maintain existing API contracts
- Gradual rollout with feature flags
- Fallback for browsers without Intersection Observer
- Progressive enhancement approach
