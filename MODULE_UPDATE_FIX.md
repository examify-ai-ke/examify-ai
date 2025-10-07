# Module Update Endpoint Fix

## Problem
The module update functionality was not working properly. When editing a module, changes were not being saved correctly.

## Root Cause
The module form was only updating the basic module fields (name, description, unit_code) but was not handling course relationship updates.

### What Was Missing
1. Course relationship updates were not being processed in edit mode
2. No logic to add/remove module from courses when the course selection changed
3. No handling for "none" selection to remove module from all courses

## Solution
Enhanced the module update logic to properly handle course relationships.

### Changes Made

#### Before (Broken)
```typescript
// Only updated basic fields
const moduleData: ModuleUpdate = {
    name: data.name,
    description: data.description || null,
    unit_code: data.unit_code,
};
await adminAPI.modules.update(module.id, moduleData);
```

#### After (Fixed)
```typescript
// Update basic fields
await adminAPI.modules.update(module.id, moduleData);

// Handle course relationship changes
if (data.course_id && data.course_id !== 'none') {
    const currentCourseId = module.courses?.[0]?.id;
    if (currentCourseId !== data.course_id) {
        // Remove from old course
        if (currentCourseId) {
            await adminAPI.courses.removeModule(currentCourseId, module.id);
        }
        // Add to new course
        await adminAPI.courses.addModule(data.course_id, module.id);
    }
} else if (data.course_id === 'none') {
    // Remove from current course
    const currentCourseId = module.courses?.[0]?.id;
    if (currentCourseId) {
        await adminAPI.courses.removeModule(currentCourseId, module.id);
    }
}
```

## Update Flow

### Scenario 1: Change Module Course
```
1. User edits module
2. Changes course from "Course A" to "Course B"
3. Clicks "Update Module"
   ↓
4. Update basic module info
5. Remove module from Course A
6. Add module to Course B
7. Success notification
```

### Scenario 2: Remove Module from Course
```
1. User edits module
2. Selects "None" for course
3. Clicks "Update Module"
   ↓
4. Update basic module info
5. Remove module from current course
6. Success notification
```

### Scenario 3: Update Without Course Change
```
1. User edits module
2. Changes name/description/unit_code
3. Keeps same course
4. Clicks "Update Module"
   ↓
5. Update basic module info
6. Skip course relationship update (no change)
7. Success notification
```

## Error Handling

### Course Relationship Update Fails
If the course relationship update fails but the module update succeeds:
```typescript
addNotification({
    type: 'warning',
    title: 'Module updated',
    message: 'Module was updated but course relationship could not be changed. You can update it manually.',
});
```

This ensures users know the module was updated even if the course linking failed.

## Files Modified
- src/components/forms/module-form.tsx

## Testing

### Test Case 1: Update Module Name
1. Edit a module
2. Change the name
3. Click "Update Module"
4. ✅ Name should be updated

### Test Case 2: Change Module Course
1. Edit a module linked to Course A
2. Change course to Course B
3. Click "Update Module"
4. ✅ Module should be removed from Course A
5. ✅ Module should be added to Course B

### Test Case 3: Remove Module from Course
1. Edit a module linked to a course
2. Select "None" for course
3. Click "Update Module"
4. ✅ Module should be removed from the course

### Test Case 4: Update Multiple Fields
1. Edit a module
2. Change name, description, unit_code, and course
3. Click "Update Module"
4. ✅ All fields should be updated
5. ✅ Course relationship should be updated

## API Endpoints Used

### Module Update
```
PUT /api/v1/module/{module_id}
Body: { name, description, unit_code }
```

### Add Module to Course
```
POST /api/v1/course/add_module/{course_id}/{module_id}
```

### Remove Module from Course
```
POST /api/v1/course/remove_module/{course_id}/{module_id}
```

## Benefits
1. ✅ Module updates now work correctly
2. ✅ Course relationships are properly managed
3. ✅ Users can change module-course associations
4. ✅ Clear error messages if something fails
5. ✅ Partial success handling (module updated even if course linking fails)

---

**Status**: ✅ Fixed
**Date**: 2025-10-06
**Impact**: Module editing functionality
**Breaking Changes**: None
