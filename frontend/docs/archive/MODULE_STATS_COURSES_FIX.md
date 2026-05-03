# Module Stats - Total Courses Fix

## Problem
On the `/dashboard/institutions/modules` page, the "Total Courses" statistic was showing an incorrect count. For example:
- **Actual**: 4 modules all linked to 1 course
- **Displayed**: "Total Courses: 4" ❌
- **Expected**: "Total Courses: 1" ✅

## Root Cause
The `modules.getStats()` function in `src/lib/api-admin.ts` was **summing** the `courses_count` from each module instead of counting **unique courses**.

### Before (Incorrect Logic)
```typescript
// This sums courses_count from each module
// If 4 modules each have courses_count = 1, result = 4
totalCourses = data.items.reduce(
    (sum: number, mod: any) => sum + (mod.courses_count || 0), 
    0
);
```

**Problem**: If multiple modules are linked to the same course, that course gets counted multiple times.

### Example Scenario
```
Module A → Course X (courses_count = 1)
Module B → Course X (courses_count = 1)
Module C → Course X (courses_count = 1)
Module D → Course X (courses_count = 1)

Old calculation: 1 + 1 + 1 + 1 = 4 courses ❌
Correct: 1 unique course ✅
```

## Solution
Changed the logic to count **unique course IDs** using a JavaScript `Set`:

```typescript
// Count unique courses across all modules
const uniqueCourseIds = new Set<string>();

data.items.forEach((mod: any) => {
    // Add course IDs from the courses array
    if (mod.courses && Array.isArray(mod.courses)) {
        mod.courses.forEach((course: any) => {
            if (course.id) {
                uniqueCourseIds.add(course.id);
            }
        });
    }
    
    // Sum up exam papers
    totalExamPapers += (mod.exam_papers_count || 0);
});

totalCourses = uniqueCourseIds.size; // ✅ Unique count
```

## How It Works

### Step 1: Create a Set
```typescript
const uniqueCourseIds = new Set<string>();
```
A `Set` automatically handles uniqueness - adding the same ID multiple times only stores it once.

### Step 2: Iterate Through Modules
```typescript
data.items.forEach((mod: any) => {
    if (mod.courses && Array.isArray(mod.courses)) {
        mod.courses.forEach((course: any) => {
            if (course.id) {
                uniqueCourseIds.add(course.id);
            }
        });
    }
});
```
For each module, we iterate through its `courses` array and add each course ID to the Set.

### Step 3: Get Unique Count
```typescript
totalCourses = uniqueCourseIds.size;
```
The Set's `size` property gives us the count of unique course IDs.

## Example Results

### Scenario 1: Multiple Modules, One Course
```
Module A → [Course X]
Module B → [Course X]
Module C → [Course X]
Module D → [Course X]

Result: 1 unique course ✅
```

### Scenario 2: Multiple Modules, Multiple Courses
```
Module A → [Course X]
Module B → [Course X, Course Y]
Module C → [Course Y]
Module D → [Course Z]

Result: 3 unique courses (X, Y, Z) ✅
```

### Scenario 3: Module with No Courses
```
Module A → [Course X]
Module B → []
Module C → [Course X]

Result: 1 unique course ✅
```

## Testing

### Test Case 1: Single Course, Multiple Modules
1. Create 4 modules all linked to the same course
2. Navigate to `/dashboard/institutions/modules`
3. ✅ "Total Courses" should show 1

### Test Case 2: Multiple Courses
1. Create modules linked to different courses:
   - Module A → Course 1
   - Module B → Course 2
   - Module C → Course 1
2. Navigate to `/dashboard/institutions/modules`
3. ✅ "Total Courses" should show 2

### Test Case 3: Module with Multiple Courses
1. Create a module linked to 2 courses
2. Create another module linked to 1 of those courses
3. Navigate to `/dashboard/institutions/modules`
4. ✅ "Total Courses" should show 2 (not 3)

### Test Case 4: No Modules
1. Delete all modules
2. Navigate to `/dashboard/institutions/modules`
3. ✅ "Total Courses" should show 0

## Additional Changes

### Exam Papers Count
Also fixed the exam papers calculation to use direct summation (which was already correct):
```typescript
totalExamPapers += (mod.exam_papers_count || 0);
```

### Average Calculation
The average modules per course calculation now uses the correct unique course count:
```typescript
const averageModulesPerCourse = totalCourses > 0 ?
    Number((totalModules / totalCourses).toFixed(1)) : 0;
```

## Files Modified

```
src/lib/api-admin.ts - modules.getStats() method
```

## Related Statistics

This fix ensures consistency with other stats:
- **Total Modules**: Count of all modules (unchanged)
- **Total Courses**: Count of unique courses (✅ fixed)
- **Total Exam Papers**: Sum of exam papers across modules (unchanged)
- **Avg Modules/Course**: Total modules ÷ unique courses (✅ now accurate)

## Performance Considerations

### Time Complexity
- **Before**: O(n) - simple reduce
- **After**: O(n × m) where n = modules, m = avg courses per module
- **Impact**: Negligible for typical dataset sizes (< 100 modules)

### Memory
- **Additional**: One Set to store unique course IDs
- **Impact**: Minimal (typically < 100 unique courses)

## Future Improvements

### Option 1: Backend Calculation
Move this calculation to the backend for better performance:
```python
# Backend endpoint: GET /api/v1/module/stats
def get_module_stats():
    unique_courses = db.query(Course).join(Module.courses).distinct().count()
    return {"totalCourses": unique_courses, ...}
```

### Option 2: Caching
Cache the stats result to avoid recalculation:
```typescript
// Use React Query or similar
const { data: stats } = useQuery(
    ['moduleStats'], 
    fetchModuleStats,
    { staleTime: 5 * 60 * 1000 } // 5 minutes
);
```

### Option 3: Real-time Updates
Use WebSocket or polling for real-time stat updates across users.

## Related Issues

Check if similar issues exist in other stats calculations:
- ✅ Courses stats (uses correct logic)
- ✅ Programmes stats (uses correct logic)
- ✅ Faculties stats (uses correct logic)
- ✅ Departments stats (uses correct logic)

---

**Status**: ✅ Fixed
**Date**: 2025-10-06
**Impact**: Module statistics display
**Breaking Changes**: None
**Backward Compatible**: Yes
