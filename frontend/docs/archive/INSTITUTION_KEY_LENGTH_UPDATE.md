# Institution Key Length Update

## Change Request
Update the institution key field maximum length from 10 characters to 25 characters.

## Changes Made

### 1. Institution Edit Page
**File**: `src/app/dashboard/institutions/[id]/edit/page.tsx`

**Schema Validation** (updated):
```typescript
key: z.string()
    .optional()
    .refine((val) => !val || val.length <= 25, {
        message: 'Key must not exceed 25 characters'
    }),
```

**Input Placeholder** (updated):
```typescript
<Input placeholder="Enter institution key (max 25 characters)" {...field} />
```

### 2. Institution Form Component
**File**: `src/components/forms/institution-form.tsx`

**Schema Validation** (updated from 20 to 25):
```typescript
key: z.string()
    .optional()
    .refine((val) => !val || val.length <= 25, {
        message: 'Key must not exceed 25 characters'
    }),
```

**Note**: The form component placeholder doesn't show the character limit, which is acceptable as the validation message will inform users if they exceed the limit.

## Summary

The institution key field now accepts up to 25 characters instead of the previous limits:
- **Edit Page**: Changed from 10 to 25 characters
- **Form Component**: Changed from 20 to 25 characters

Both forms now have consistent validation at 25 characters maximum, providing users with more flexibility for institution abbreviations and keys.

## Examples of Valid Keys
With the new 25-character limit, institutions can use longer abbreviations:
- Short: "UON", "MIT", "UCLA"
- Medium: "STANFORD", "CAMBRIDGE"
- Longer: "MASSACHUSETTS-INST-TECH" (24 chars)
