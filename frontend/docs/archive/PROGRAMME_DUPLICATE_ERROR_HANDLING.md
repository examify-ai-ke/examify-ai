# Programme Duplicate Error Handling

## Problem
When trying to create a programme that already exists, the backend returns a 409 Conflict error with a database constraint violation message, but the frontend wasn't showing a user-friendly error message.

### Backend Error
```
INFO: 172.21.0.2:44408 - "POST /api/v1/programme HTTP/1.1" 409 Conflict
ERROR: duplicate key value violates unique constraint "Programme_name_key"
DETAIL: Key (name)=(BACHELORS) already exists.
```

### User Experience Before
- Generic error message: "Failed to create programme"
- No indication that the programme already exists
- User doesn't know what to do next

## Solution
Enhanced error handling in the programme form to detect duplicate programme errors and show a clear, actionable message.

### Error Detection Strategy
The code now checks for duplicate errors using multiple indicators:

```typescript
const errorString = JSON.stringify(error).toLowerCase();
const isDuplicateError = 
    errorString.includes('duplicate') || 
    errorString.includes('already exists') ||
    errorString.includes('unique constraint') ||
    (error.response?.status === 409) ||
    (error.status === 409);
```

### User-Friendly Message
When a duplicate is detected:

```typescript
if (isDuplicateError) {
    errorTitle = 'Programme already exists';
    errorMessage = `A programme of type "${data.name}" already exists. Each programme type can only be created once. Please select a different programme type.`;
}
```

## Error Handling Flow

### 1. Duplicate Programme Error (409 Conflict)
```
User tries to create "Bachelors/Undergraduate"
↓
Backend: 409 Conflict - duplicate key
↓
Frontend detects duplicate error
↓
Shows: "Programme already exists"
Message: "A programme of type 'Bachelors/Undergraduate' already exists. 
         Each programme type can only be created once. 
         Please select a different programme type."
```

### 2. Validation Errors (422 Unprocessable Entity)
```
User submits invalid data
↓
Backend: 422 with validation details
↓
Frontend extracts validation messages
↓
Shows: "Failed to create programme"
Message: Specific validation errors
```

### 3. Other Errors
```
Network error, server error, etc.
↓
Frontend shows generic error
↓
Shows: "Failed to create programme"
Message: Error message or "Please try again later."
```

## Implementation Details

### Error Detection Methods

#### Method 1: HTTP Status Code
```typescript
error.response?.status === 409 || error.status === 409
```
Checks if the response status is 409 Conflict.

#### Method 2: Error Message Content
```typescript
errorString.includes('duplicate') || 
errorString.includes('already exists') ||
errorString.includes('unique constraint')
```
Searches for keywords in the error message that indicate a duplicate.

#### Method 3: Combined Approach
Uses both methods to ensure we catch the error regardless of how it's formatted.

### Error Message Extraction

```typescript
// FastAPI validation errors
if (error.response?.data?.detail) {
    if (Array.isArray(error.response.data.detail)) {
        errorMessage = error.response.data.detail
            .map((err: any) => err.msg || err.message)
            .join(', ');
    } else if (typeof error.response.data.detail === 'string') {
        errorMessage = error.response.data.detail;
    }
}
```

## User Experience After

### Scenario 1: Duplicate Programme
**Before:**
```
❌ Failed to create programme
   Please try again later.
```

**After:**
```
❌ Programme already exists
   A programme of type "Bachelors/Undergraduate" already exists. 
   Each programme type can only be created once. 
   Please select a different programme type.
```

### Scenario 2: Validation Error
**Before:**
```
❌ Failed to create programme
   Please try again later.
```

**After:**
```
❌ Failed to create programme
   Field 'name' is required
```

## Testing

### Test Case 1: Create Duplicate Programme
1. Create a programme: "Masters"
2. Try to create another "Masters" programme
3. ✅ Should show: "Programme already exists" with helpful message

### Test Case 2: Create Unique Programme
1. Create a programme: "Doctorate"
2. ✅ Should succeed with success message

### Test Case 3: Validation Error
1. Try to submit form without selecting programme type
2. ✅ Should show validation error

### Test Case 4: Network Error
1. Disconnect network
2. Try to create programme
3. ✅ Should show generic error message

## Database Constraint

The backend enforces uniqueness at the database level:

```sql
CONSTRAINT "Programme_name_key" UNIQUE (name)
```

This means:
- Each programme type can only exist once
- "Bachelors/Undergraduate" can only be created once
- "Masters" can only be created once
- etc.

## Why This Constraint Exists

Programme types are meant to be **categories**, not individual programmes. For example:
- ❌ Wrong: Multiple "Bachelors/Undergraduate" entries
- ✅ Correct: One "Bachelors/Undergraduate" category with multiple courses/departments

## Recommended Workflow

### For Users
1. Check if programme type already exists before creating
2. If it exists, use the existing programme
3. Link courses/departments to existing programmes

### For Administrators
Consider adding:
- Programme list view showing all existing programmes
- Warning before attempting to create duplicate
- Suggestion to edit existing programme instead

## Future Enhancements

### 1. Pre-validation
Check if programme exists before submitting:
```typescript
const checkProgrammeExists = async (name: string) => {
    const response = await adminAPI.programmes.search({ q: name });
    return response.data?.data?.items?.some(p => p.name === name);
};
```

### 2. Show Existing Programmes
Display list of existing programmes in the form:
```typescript
<div className="mb-4 p-3 bg-blue-50 rounded">
    <p className="text-sm font-medium">Existing Programmes:</p>
    <ul className="text-sm text-gray-600">
        {existingProgrammes.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
</div>
```

### 3. Suggest Edit Instead
When duplicate detected, offer to edit existing:
```typescript
<Button onClick={() => router.push(`/dashboard/programmes/${existingId}/edit`)}>
    Edit Existing Programme
</Button>
```

### 4. Better Error Response from Backend
Backend could return more structured error:
```json
{
    "error": "duplicate_programme",
    "message": "Programme already exists",
    "existing_programme_id": "uuid-here",
    "programme_name": "Bachelors/Undergraduate"
}
```

## Related Files

```
src/components/forms/programme-form.tsx - Enhanced error handling
src/lib/api-admin.ts - API calls (unchanged)
```

## Error Handling Pattern

This pattern can be applied to other forms:
- Course form (duplicate course codes)
- Module form (duplicate unit codes)
- Department form (duplicate department names)
- Faculty form (duplicate faculty names)

## Benefits

1. **Clear Communication**: Users understand exactly what went wrong
2. **Actionable Guidance**: Users know what to do next
3. **Better UX**: Reduces frustration and confusion
4. **Prevents Data Issues**: Helps maintain data integrity
5. **Consistent Errors**: All error types handled appropriately

---

**Status**: ✅ Complete
**Date**: 2025-10-06
**Impact**: Programme creation error handling
**Breaking Changes**: None
**User Experience**: Significantly improved
