# Course Institutions Display Update

## Overview
Updated the course detail page to display institution information that comes through the faculty relationship. The backend now includes institutions data when fetching courses through the `Course → Faculty → Institutions` relationship.

## Changes Made

### 1. Updated Quick Stats Section
**File**: `src/app/dashboard/institutions/courses/[id]/page.tsx`

- Changed grid from 4 columns to 5 columns to accommodate new stat card
- Added new "Institutions" stat card showing the count of institutions the course belongs to through its faculty
- The card displays: `course.faculty?.institutions?.length || 0`

**Visual Design**:
- Uses indigo color scheme (bg-indigo-100 with indigo-600 icon)
- Building2 icon to represent institutions
- Consistent with other stat cards

### 2. Enhanced Academic Hierarchy Section
**File**: `src/app/dashboard/institutions/courses/[id]/page.tsx`

Completely redesigned the hierarchy display to prioritize institution information:

**New Structure**:
1. **Institutions List** (if available)
   - Shows all institutions the faculty belongs to
   - Displays count in header: "Institutions (X)"
   - Each institution shown as a bullet point
   - Blue color scheme with border highlight
   - Only shown when `course.faculty?.institutions` exists and has items

2. **Faculty** (if available)
   - Shows the direct faculty link
   - Teal color scheme with border highlight
   - Displays faculty name

3. **Programme**
   - Shows the programme the course belongs to
   - Orange color scheme

4. **Department** (if available)
   - Shows the department through programme relationship
   - Green color scheme
   - Only shown when `course.programme?.department` exists

## Data Structure

### API Schema
The course now receives faculty data with institutions:

```typescript
FacultyReadForCourse: {
  id: string | null;
  name: string | null;
  institutions: InstitutionReadForFaculty[] | null;
}

InstitutionReadForFaculty: {
  id: string;      // UUID
  name: string;
  slug: string;
}
```

### Access Pattern
```typescript
// Get institutions count
course.faculty?.institutions?.length || 0

// Get institutions list
course.faculty?.institutions?.map((institution) => ({
  id: institution.id,
  name: institution.name,
  slug: institution.slug
}))
```

## Visual Improvements

### Before
- 4 stat cards (Modules, Exam Papers, Programme, Faculty)
- Hierarchy showed: Institution (via programme), Faculty (via programme), Direct Faculty Link, Programme
- No clear indication of how many institutions

### After
- 5 stat cards including new Institutions count
- Hierarchy prioritizes institutions list at the top
- Clear visual hierarchy with color-coded sections
- Better organization: Institutions → Faculty → Programme → Department

## Benefits

1. **Visibility**: Users can immediately see how many institutions a course belongs to
2. **Detail**: Full list of institution names in the hierarchy section
3. **Clarity**: Removed confusing "via Programme" labels and simplified the display
4. **Consistency**: Maintains the same design language as other detail pages
5. **Scalability**: Handles multiple institutions gracefully with a scrollable list

## Testing Recommendations

1. Test with courses that have:
   - No faculty (should show 0 institutions)
   - Faculty with no institutions (should show 0 institutions)
   - Faculty with 1 institution (should display properly)
   - Faculty with multiple institutions (should list all)

2. Verify responsive design:
   - Mobile: Stats should stack vertically
   - Tablet: Stats should wrap appropriately
   - Desktop: All 5 stats should display in a row

3. Check data loading:
   - Ensure institutions data is loaded from API
   - Verify loading states work correctly
   - Test error handling when data is missing

## Future Enhancements

Potential improvements for future iterations:

1. **Clickable Institutions**: Make institution names clickable to navigate to institution detail pages
2. **Institution Badges**: Add institution logos or badges in the hierarchy
3. **Institution Filtering**: Allow filtering courses by institution
4. **Institution Stats**: Show additional stats per institution (e.g., number of courses)
5. **Breadcrumb Update**: Include institution in breadcrumb navigation

## Related Files

- `src/app/dashboard/institutions/courses/[id]/page.tsx` - Main course detail page
- `src/types/generated/api.ts` - API type definitions
- `src/lib/api-admin.ts` - Admin API client

## API Endpoint

The course detail endpoint automatically includes institution data:
```
GET /api/admin/courses/{id}
```

The backend uses `selectinload` to eagerly load faculty institutions, ensuring optimal performance.
