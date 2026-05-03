# Module Stats Update Fix

## Problem
After adding or deleting a module on `/dashboard/institutions/modules`, the statistics cards (Total Modules, Total Courses, etc.) were not updating. Only the datatable items were refreshing.

## Root Cause
The `loadStats()` function used a ref (`statsLoadedRef`) to prevent duplicate API calls. Once set to `true`, it would never reload the stats, even when explicitly called after creating or deleting a module.

```typescript
// Before - problematic code
const loadStats = useCallback(async () => {
    if (statsLoadedRef.current) return; // ❌ Always returns early after first load
    statsLoadedRef.current = true;
    // ... fetch stats
}, []);
```

## Solution
Modified the `loadStats()` function to accept a `force` parameter that bypasses the ref check when needed:

```typescript
// After - fixed code
const loadStats = useCallback(async (force = false) => {
    if (!force && statsLoadedRef.current) return; // ✅ Can be forced to reload
    statsLoadedRef.current = true;
    // ... fetch stats
}, []);
```

## Changes Made

### 1. Updated `loadStats()` Function
- Added `force` parameter (default: `false`)
- Only skip loading if not forced AND already loaded
- Maintains duplicate call prevention for normal loads

### 2. Updated `handleFormSuccess()`
```typescript
const handleFormSuccess = async () => {
    setShowCreateModal(false);
    setEditingModule(null);
    statsLoadedRef.current = false; // Reset ref
    await loadModules();
    await loadStats(true); // Force reload ✅
};
```

### 3. Updated `handleDeleteModule()`
```typescript
const handleDeleteModule = async () => {
    // ... delete logic
    statsLoadedRef.current = false; // Reset ref
    await loadModules();
    await loadStats(true); // Force reload ✅
};
```

## Testing

### Test Case 1: Add Module
1. Navigate to `/dashboard/institutions/modules`
2. Note the "Total Modules" count
3. Click "Add Module" and create a new module
4. ✅ Stats should update to reflect the new module count

### Test Case 2: Delete Module
1. Navigate to `/dashboard/institutions/modules`
2. Note the "Total Modules" count
3. Delete a module
4. ✅ Stats should update to reflect the reduced module count

### Test Case 3: Edit Module
1. Navigate to `/dashboard/institutions/modules`
2. Edit an existing module
3. ✅ Stats should remain consistent (no change expected)

### Test Case 4: Initial Load
1. Navigate to `/dashboard/institutions/modules`
2. ✅ Stats should load once without duplicate API calls

## Benefits

1. **Stats Update Correctly**: Statistics now refresh after CRUD operations
2. **No Duplicate Calls**: Initial load still prevents duplicate API calls
3. **Consistent UX**: Users see accurate data immediately after actions
4. **Minimal Changes**: Small, focused fix without refactoring entire component

## Alternative Approaches Considered

### Option 1: Remove Ref Entirely
```typescript
// Not chosen - would cause duplicate calls on mount
const loadStats = useCallback(async () => {
    // ... fetch stats
}, []);
```
**Rejected**: Would cause duplicate API calls during component mount

### Option 2: Use React Query
```typescript
// Future improvement - better caching and invalidation
const { data: stats } = useQuery(['moduleStats'], fetchStats);
```
**Future**: Consider migrating to React Query for better cache management

### Option 3: Reset Ref in useEffect
```typescript
// Not chosen - less explicit
useEffect(() => {
    statsLoadedRef.current = false;
}, [modules.length]);
```
**Rejected**: Less explicit about when stats should reload

## Files Modified

```
src/app/dashboard/institutions/modules/page.tsx
```

## Related Issues

This same pattern may exist in other dashboard pages:
- `/dashboard/institutions/courses/page.tsx`
- `/dashboard/institutions/programmes/page.tsx`
- `/dashboard/institutions/departments/page.tsx`
- `/dashboard/institutions/faculties/page.tsx`
- `/dashboard/institutions/campuses/page.tsx`

Consider applying the same fix if they exhibit similar behavior.

---

**Status**: ✅ Fixed
**Date**: 2025-10-06
**Impact**: Module management page only
**Breaking Changes**: None
