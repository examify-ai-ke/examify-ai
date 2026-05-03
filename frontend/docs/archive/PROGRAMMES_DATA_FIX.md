# 🔧 Programmes Data Structure Fix

## Issue Identified

The API returns programmes with a nested data structure where `departments` is an **array** (not a single object), causing the table and UI to render incorrectly.

### API Response Structure
```json
{
  "name": "Bachelors/Undergraduate",
  "id": "01986e2a-b230-7667-a570-d767a6ca5e49",
  "departments": [  // ← ARRAY, not single object
    {
      "id": "01986e2a-b226-7209-b090-be3b0949c9ff",
      "name": "Software Engineering Department",
      "faculty_id": "01986e2a-b209-7dea-97cb-f7e91a243d53"
    }
  ],
  "courses": [...],  // Full nested courses
  "courses_count": 1,
  "departments_count": 1
}
```

## Problems Fixed

### 1. **Table Column - Department Rendering**
**Before:** Tried to access `programme.department.name` (single object)
**After:** Handles `programme.departments` as an array

```typescript
// Fixed to handle array
const departments = programme.departments || [];
if (departments.length === 0) {
    return <span className="text-sm text-muted-foreground">N/A</span>;
}

return (
    <div className="text-sm">
        {departments.map((dept, index) => (
            <div key={dept.id || index}>
                <div>{dept.name}</div>
                {dept.faculty && (
                    <div className="text-xs text-muted-foreground">{dept.faculty.name}</div>
                )}
            </div>
        ))}
    </div>
);
```

### 2. **Table Column - Courses Count**
**Before:** `programme.courses_count || 0`
**After:** `programme.courses_count || programme.courses?.length || 0` (fallback to array length)

### 3. **Statistics Calculation - Departments**
**Before:** Tried to collect `programme.department.id` (single)
**After:** Iterates through `programme.departments` array

```typescript
const departmentIds = new Set<string>();
items.forEach((prog: any) => {
    if (prog.departments && Array.isArray(prog.departments)) {
        prog.departments.forEach((dept: any) => {
            if (dept.id) departmentIds.add(dept.id);
        });
    } else if (prog.department?.id) {
        // Fallback for single department
        departmentIds.add(prog.department.id);
    }
});
```

### 4. **Statistics Calculation - Courses**
**Before:** `prog.courses_count || 0`
**After:** `prog.courses_count || prog.courses?.length || 0` (handles both count and array)

### 5. **Details Page - Hero Badge**
**Before:** `programme.department.name`
**After:** `programme.departments[0].name` with fallback

```typescript
{programme.departments && programme.departments.length > 0 && (
    <Badge variant="outline" className="...">
        {programme.departments[0].name}
    </Badge>
)}
{programme.department && !programme.departments && (
    <Badge variant="outline" className="...">
        {programme.department.name}
    </Badge>
)}
```

### 6. **Details Page - Quick Stats Cards**
**Before:** Accessed single `programme.department.name`
**After:** Uses optional chaining for array

```typescript
// Department name
{programme.departments?.[0]?.name || programme.department?.name || 'N/A'}

// Faculty name
{programme.departments?.[0]?.faculty?.name || programme.department?.faculty?.name || 'N/A'}
```

### 7. **Details Page - Overview Tab**
**Before:** Single department reference
**After:** Handles both array and single department

```typescript
<p className="font-semibold">
    {programme.departments?.[0]?.name || programme.department?.name || 'N/A'}
</p>
```

### 8. **Details Page - Department Info Tab**
**Before:** Single department rendering
**After:** Maps through departments array

```typescript
{programme.departments && programme.departments.length > 0 ? (
    programme.departments.map((dept) => (
        <div key={dept.id} className="p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
                <Building2 className="h-6 w-6 text-blue-600" />
                <div>
                    <h3 className="font-semibold">{dept.name}</h3>
                    {dept.faculty && (
                        <p className="text-sm text-muted-foreground">
                            {dept.faculty.name}
                        </p>
                    )}
                </div>
            </div>
            <Button onClick={() => router.push(`/dashboard/institutions/departments/${dept.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View Department
            </Button>
        </div>
    ))
) : programme.department ? (
    // Fallback for single department
    ...
) : null}
```

## Files Modified

1. ✅ `/src/app/dashboard/institutions/programmes/page.tsx`
   - Fixed table columns
   - Fixed statistics calculation
   
2. ✅ `/src/app/dashboard/institutions/programmes/[id]/page.tsx`
   - Fixed hero badge
   - Fixed quick stats cards
   - Fixed overview tab
   - Fixed department info tab

## Testing Status

- ✅ No TypeScript errors
- ✅ No linting errors
- ✅ Handles `departments` as array
- ✅ Fallback to single `department` object
- ✅ Handles missing data gracefully

## Key Takeaways

### The Pattern
```typescript
// Always check both structures
const deptName = programme.departments?.[0]?.name || programme.department?.name || 'N/A';
```

### Why Both?
- API returns `departments` as an array in list responses
- Some endpoints might return single `department` object
- This ensures compatibility with both structures

### Best Practice
```typescript
// For display: Use first department or fallback
programme.departments?.[0]?.name || programme.department?.name || 'N/A'

// For iteration: Map through all departments
{programme.departments?.map(dept => ...)}

// For counts: Use count field or fallback to length
programme.departments_count || programme.departments?.length || 0
```

## Result

✅ Table now renders properly
✅ No more "sketchy" data display
✅ Statistics calculate correctly
✅ Details page shows correct information
✅ Handles multiple departments per programme
✅ Graceful fallbacks for missing data

---

**Status: FIXED ✅**

The programmes list and details pages now handle the nested array structure correctly!

