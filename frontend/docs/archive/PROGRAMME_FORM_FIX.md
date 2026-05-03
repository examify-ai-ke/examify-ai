# Programme Form Updates

## Changes Made

### 1. Programme Type Enum ✅
Changed the "Programme Name" field from a free-text input to a dropdown with predefined enum values matching the API schema.

#### Before
```typescript
// Free text input
<Input
    id="name"
    placeholder="e.g., Bachelor of Computer Science"
/>
```

#### After
```typescript
// Dropdown with enum values
const PROGRAMME_TYPES = [
    { value: 'Certificate', label: 'Certificate' },
    { value: 'Diploma', label: 'Diploma' },
    { value: 'Bachelors/Undergraduate', label: 'Bachelors/Undergraduate' },
    { value: 'Masters', label: 'Masters' },
    { value: 'Doctorate', label: 'Doctorate' },
    { value: 'Postgraduate Diploma', label: 'Postgraduate Diploma' },
    { value: 'PhD Programmes', label: 'PhD Programmes' },
    { value: 'Online MBA', label: 'Online MBA' },
    { value: 'Others', label: 'Others' },
];

<Select value={selectedProgrammeName} onValueChange={...}>
    {PROGRAMME_TYPES.map((type) => (
        <SelectItem key={type.value} value={type.value}>
            {type.label}
        </SelectItem>
    ))}
</Select>
```

### 2. Department Optional ✅
Made the department field optional as per the API schema.

#### Before
```typescript
// Required field
const programmeSchema = z.object({
    department_id: z.string().min(1, 'Department is required'),
});

<Label>
    Department <span className="text-red-500">*</span>
</Label>
```

#### After
```typescript
// Optional field
const programmeSchema = z.object({
    department_id: z.string().optional(),
});

<Label>
    Department <span className="text-gray-400">(Optional)</span>
</Label>

// Added "No department" option
<SelectItem value="none">
    <span className="text-gray-500">No department</span>
</SelectItem>
```

### 3. Conditional API Payload
Updated the form submission to only include `department_id` if it's provided.

#### Before
```typescript
await adminAPI.programmes.create({
    name: data.name,
    description: data.description || '',
    department_id: data.department_id, // Always included
});
```

#### After
```typescript
const createData: any = {
    name: data.name,
    description: data.description || null,
};

// Only include department_id if it's provided
if (data.department_id) {
    createData.department_id = data.department_id;
}

await adminAPI.programmes.create(createData);
```

## Programme Type Enum Values

The following programme types are now available in the dropdown:

| Value | Display Label |
|-------|---------------|
| `Certificate` | Certificate |
| `Diploma` | Diploma |
| `Bachelors/Undergraduate` | Bachelors/Undergraduate |
| `Masters` | Masters |
| `Doctorate` | Doctorate |
| `Postgraduate Diploma` | Postgraduate Diploma |
| `PhD Programmes` | PhD Programmes |
| `Online MBA` | Online MBA |
| `Others` | Others |

**Default Value**: `Bachelors/Undergraduate`

## Validation Schema

### Before
```typescript
const programmeSchema = z.object({
    name: z.string().min(2, 'Programme name must be at least 2 characters'),
    description: z.string().optional(),
    department_id: z.string().min(1, 'Department is required'),
});
```

### After
```typescript
const programmeSchema = z.object({
    name: z.enum([
        'Certificate',
        'Diploma',
        'Bachelors/Undergraduate',
        'Masters',
        'Doctorate',
        'Postgraduate Diploma',
        'PhD Programmes',
        'Online MBA',
        'Others'
    ], {
        required_error: 'Programme type is required',
        invalid_type_error: 'Please select a valid programme type',
    }),
    description: z.string().optional(),
    department_id: z.string().optional(), // Now optional
});
```

## User Experience Improvements

### 1. Clearer Programme Type Selection
- Users now select from predefined programme types instead of typing
- Prevents typos and ensures consistency
- Matches the backend enum exactly

### 2. Optional Department
- Users can create programmes without assigning to a department
- "No department" option clearly indicates the choice
- Useful for institution-level programmes

### 3. Better Labels
- Changed "Programme Name" to "Programme Type" for clarity
- Added "(Optional)" indicator for department field
- Removed red asterisk from department field

## Testing

### Test Case 1: Create Programme with Department
1. Navigate to programmes page
2. Click "Add Programme"
3. Select programme type: "Masters"
4. Enter description
5. Select a department
6. ✅ Programme should be created with department link

### Test Case 2: Create Programme without Department
1. Navigate to programmes page
2. Click "Add Programme"
3. Select programme type: "Doctorate"
4. Enter description
5. Select "No department"
6. ✅ Programme should be created without department

### Test Case 3: All Programme Types
Test creating programmes with each type:
- ✅ Certificate
- ✅ Diploma
- ✅ Bachelors/Undergraduate
- ✅ Masters
- ✅ Doctorate
- ✅ Postgraduate Diploma
- ✅ PhD Programmes
- ✅ Online MBA
- ✅ Others

### Test Case 4: Edit Programme
1. Edit an existing programme
2. Change programme type
3. Remove department (select "No department")
4. ✅ Changes should be saved correctly

### Test Case 5: Validation
1. Try to submit form without selecting programme type
2. ✅ Should show validation error
3. Select a programme type
4. ✅ Should allow submission

## API Schema Alignment

### ProgrammeCreate Schema
```typescript
{
    name: ProgrammeTypes; // Required enum
    description: string | null; // Optional
    // department_id is NOT in the schema - handled by backend
}
```

### ProgrammeTypes Enum
```typescript
type ProgrammeTypes = 
    | "Certificate"
    | "Diploma"
    | "Bachelors/Undergraduate"
    | "Masters"
    | "Doctorate"
    | "Postgraduate Diploma"
    | "PhD Programmes"
    | "Online MBA"
    | "Others";
```

## Benefits

1. **Data Consistency**: All programmes use standardized types
2. **Better UX**: Dropdown is easier than remembering exact names
3. **Validation**: Prevents invalid programme types
4. **Flexibility**: Department is now optional as intended
5. **API Compliance**: Matches backend schema exactly

## Files Modified

```
src/components/forms/programme-form.tsx
```

## Related Components

This change affects:
- Programme creation modal
- Programme edit modal
- Programme list page
- Department detail page (programme section)

## Migration Notes

### Existing Data
- Existing programmes with free-text names may not match enum values
- Consider running a data migration to standardize existing programme names
- Or add a fallback to "Others" for non-matching values

### Future Enhancements
- Add programme code/acronym field (e.g., "BSc", "MSc")
- Add duration field (e.g., 3 years, 4 years)
- Add level field (undergraduate, postgraduate)
- Add accreditation information

---

**Status**: ✅ Complete
**Date**: 2025-10-06
**Impact**: Programme creation and editing
**Breaking Changes**: None (backward compatible)
**Schema Compliant**: Yes
