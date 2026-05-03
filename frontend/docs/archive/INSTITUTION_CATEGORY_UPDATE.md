# Institution Category Enum Update

## Issue
The frontend institution category values didn't match the backend enum values. The backend uses uppercase values for TVET, TVC, and TTI, but the frontend was using mixed case (Tvet, Tvc, Tti).

## Backend Enum (Python)
```python
class InstitutionCategory(enum.Enum):
    UNIVERSITY = "University"
    COLLEGE = "College"
    TVET = "TVET"
    TVC = "TVC"
    TTI = "TTI"
    OTHER = "Other"
```

## Changes Made

### 1. Updated Institution Edit Page
**File**: `src/app/dashboard/institutions/[id]/edit/page.tsx`

**Schema** (already correct):
```typescript
category: z.enum(['University', 'College', 'TVET', 'TVC', 'TTI', 'Other'])
```

**Select Options** (fixed):
```typescript
<SelectContent>
    <SelectItem value="University">University</SelectItem>
    <SelectItem value="College">College</SelectItem>
    <SelectItem value="TVET">TVET</SelectItem>
    <SelectItem value="TVC">TVC</SelectItem>
    <SelectItem value="TTI">TTI</SelectItem>
    <SelectItem value="Other">Other</SelectItem>
</SelectContent>
```

### 2. Updated Institution Form Component
**File**: `src/components/forms/institution-form.tsx`

**Schema** (updated):
```typescript
category: z.enum(['University', 'College', 'TVET', 'TVC', 'TTI', 'Other'])
```

**Select Options** (updated):
```typescript
<SelectContent>
    <SelectItem value="University">University</SelectItem>
    <SelectItem value="College">College</SelectItem>
    <SelectItem value="TVET">TVET</SelectItem>
    <SelectItem value="TVC">TVC</SelectItem>
    <SelectItem value="TTI">TTI</SelectItem>
    <SelectItem value="Other">Other</SelectItem>
</SelectContent>
```

### 3. Public Institutions Page
**File**: `src/app/(public)/institutions/institutions-content.tsx`

Already correct - no changes needed:
```typescript
type InstitutionCategory = 'all' | 'University' | 'College' | 'TVET' | 'TVC' | 'TTI' | 'Other';
```

## Summary

All institution category values now match the backend enum:
- ✅ **University** - Correct
- ✅ **College** - Correct
- ✅ **TVET** - Fixed (was "Tvet")
- ✅ **TVC** - Fixed (was "Tvc")
- ✅ **TTI** - Fixed (was "Tti")
- ✅ **Other** - Correct

The frontend will now correctly send and receive institution category values that match the backend API expectations.
