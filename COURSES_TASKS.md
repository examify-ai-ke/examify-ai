# 📋 Courses & Programmes Management - Task List

## 🎯 Overview
Complete implementation of Courses, Programmes, and Modules management with full CRUD operations, proper pagination, filtering, and UI improvements.

---

## ✅ **COMPLETED TASKS**

### 1. Departments Page ✅
- [x] Dynamic page size selector (10, 25, 50, 100)
- [x] Improved filter UI with grid layout
- [x] Institution filter added
- [x] Active filters display section
- [x] Server-side pagination fully working
- [x] Proper text wrapping for display

### 2. Department Details Page ✅
- [x] All buttons functional with onClick handlers
- [x] Edit Department modal integrated
- [x] Add Programme modal placeholder
- [x] Delete Department confirmation dialog
- [x] Programme cards clickable with navigation
- [x] Empty state with "Add First Programme" button

---

### Task 3: Complete Courses Page ✅ **COMPLETED**
**Priority: HIGH** 🔴
**Completed: October 5, 2025**

#### 3.1. Add Programme Management API to api-admin.ts ✅
- [x] Create `programmes` section in `adminAPI` object
- [x] Add endpoints:
  - [x] `list(params)` - GET `/programme`
  - [x] `search(params)` - GET `/programme/search`
  - [x] `getById(programmeId)` - GET `/programme/get_by_id/{programme_id}`
  - [x] `getBySlug(programmeSlug)` - GET `/programme/get_by_slug/{programme_slug}`
  - [x] `create(programmeData)` - POST `/programme`
  - [x] `update(programmeId, programmeData)` - PUT `/programme/{programme_id}`
  - [x] `delete(programmeId)` - DELETE `/programme/{programme_id}`
  - [x] `uploadImage(programmeId, imageFile)` - POST `/programme/{programme_id}/image`
  - [x] `getOrderedByCreatedAt(params)` - GET `/programme/get_by_created_at`
  - [x] `getStats()` - Custom stats aggregation using backend count properties

#### 3.2. Add Modules Management API to api-admin.ts ✅
- [x] Expand `modules` section in `adminAPI` object
- [x] Add full CRUD endpoints for modules
- [x] Add `search(params)` - GET `/module/search`
- [x] Add `getStats()` - Custom stats aggregation using backend count properties

#### 3.3. Complete Courses Page Updates ✅
- [x] Add `loadProgrammes()` function - fetch from `adminAPI.programmes.list()`
- [x] Add `loadDepartments()` function - fetch from `adminAPI.departments.list()`
- [x] Add `loadInstitutions()` function - fetch from `adminAPI.institutions.list()`
- [x] Add `handlePageSizeChange(newPageSize)` function
- [x] Update `useEffect` dependencies to include `pageSize`, `selectedDepartment`, `selectedInstitution`
- [x] Add statistics section at top (5 cards: Total Courses, Total Programmes, Total Modules, Exam Papers, Avg. Modules)
- [x] Update filter UI layout to match faculties/departments style:
  - [x] Grid layout (4 columns on large screens)
  - [x] Search input with label
  - [x] Programme filter dropdown with label
  - [x] Department filter dropdown with label
  - [x] Institution filter dropdown with label
  - [x] Active Filters Info section with badges
- [x] Update `DataTable` pagination prop:
  - [x] Add `pageSize` prop
  - [x] Add `onPageSizeChange` handler
- [x] Fix notification system - changed from `showNotification` to `addNotification`
- [x] Optimize statistics loading using backend count properties
- [x] Fix API call method - use `this.list()` instead of direct `api.GET()`
- [x] Apply backend limit validation (max 100 items per request)
- [x] Remove debug logs from production code

**Files modified:**
- ✅ `/src/lib/api-admin.ts` - Added programmes & modules sections with full CRUD + stats
- ✅ `/src/app/dashboard/institutions/courses/page.tsx` - Complete updates with filters, stats, pagination

**Key Achievements:**
- 🎯 Integrated backend's new count properties (`modules_count`, `exam_papers_count`, `courses_count`, `departments_count`)
- 🚀 Reduced API calls for statistics from 4 calls to 2 calls
- 🎨 Modern UI with responsive grid filters and active filter badges
- ⚡ Server-side pagination with dynamic page size
- 🐛 Fixed all errors (notification system, API fetch, limit validation)

---

## 🚧 **PENDING TASKS - Phase 2: Course & Programme Details**

---

### Task 4: Create Course Details Page
**Priority: HIGH** 🔴
**Estimated Time: 3-4 hours**

#### 4.1. Create Course Details Page
- [ ] File: `/src/app/dashboard/institutions/courses/[id]/page.tsx`
- [ ] Fetch course data using `adminAPI.courses.getById(courseId)`
- [ ] Display course hero section:
  - [ ] Course name, acronym, description
  - [ ] Programme, department, faculty, institution breadcrumb
  - [ ] Edit Course button
  - [ ] Dropdown menu (Add Module, Delete Course, etc.)
- [ ] Add statistics cards:
  - [ ] Total Modules
  - [ ] Total Exam Papers
  - [ ] Total Questions (if applicable)
  - [ ] Enrollment count (mock for now)
- [ ] Create tabs:
  - [ ] Overview tab (course details, about)
  - [ ] Modules tab (list of modules with add/view/delete)
  - [ ] Exam Papers tab (list of exam papers)
  - [ ] Analytics tab (placeholder)
- [ ] Make all buttons functional:
  - [ ] Edit Course → Open edit modal with CourseForm
  - [ ] Add Module → Open add module modal
  - [ ] Delete Course → Open confirmation dialog
  - [ ] Module cards → Clickable, navigate to module details
  - [ ] Exam paper cards → Clickable, navigate to paper details
- [ ] Add modals:
  - [ ] Edit Course modal (Dialog with CourseForm)
  - [ ] Add Module modal (Dialog with ModuleForm placeholder)
  - [ ] Delete Course confirmation (AlertDialog)

**Files to create:**
- `/src/app/dashboard/institutions/courses/[id]/page.tsx`

---

### Task 5: Create CourseForm Component
**Priority: HIGH** 🔴
**Estimated Time: 2-3 hours**

#### 5.1. Create CourseForm
- [ ] File: `/src/components/forms/course-form.tsx`
- [ ] Add Zod validation schema:
  - [ ] `name` (required, min 2 chars)
  - [ ] `description` (optional)
  - [ ] `course_acronym` (required, 2-10 chars)
  - [ ] `programme_id` (required, select from programmes)
  - [ ] `image` (optional, file upload)
- [ ] Support create and edit modes
- [ ] Fetch programmes list for dropdown
- [ ] Add image upload with preview
- [ ] Implement `onSubmit`:
  - [ ] Call `adminAPI.courses.create()` or `adminAPI.courses.update()`
  - [ ] Handle success and error states
  - [ ] Show notifications
  - [ ] Call `onSuccess` callback
- [ ] Add `embedded` prop for modal usage (no Card wrapper)
- [ ] Add loading states and disabled inputs during submission

**Files to create:**
- `/src/components/forms/course-form.tsx`

---

## 🚧 **PENDING TASKS - Phase 2: Programmes Management**

### Task 6: Create Programmes Page
**Priority: MEDIUM** 🟡
**Estimated Time: 3-4 hours**

#### 6.1. Create Programmes List Page
- [ ] File: `/src/app/dashboard/institutions/programmes/page.tsx`
- [ ] Implement full pagination (skip, limit, pageSize selector)
- [ ] Add search functionality (search by name)
- [ ] Add filters:
  - [ ] Filter by Department
  - [ ] Filter by Faculty
  - [ ] Filter by Institution
- [ ] Display statistics cards:
  - [ ] Total Programmes
  - [ ] Total Courses
  - [ ] Total Departments
  - [ ] Average Courses per Programme
- [ ] Create DataTable with columns:
  - [ ] Programme Name
  - [ ] Description (truncated)
  - [ ] Department
  - [ ] Faculty
  - [ ] Courses Count
  - [ ] Actions (View, Edit, Delete)
- [ ] Add "Create Programme" button
- [ ] Implement CRUD modals:
  - [ ] Create Programme modal
  - [ ] Edit Programme modal
  - [ ] Delete Programme confirmation
- [ ] Make programme rows clickable → navigate to programme details

**Files to create:**
- `/src/app/dashboard/institutions/programmes/page.tsx`

**API calls needed:**
- `adminAPI.programmes.search()` for list with filters
- `adminAPI.programmes.create()` for creation
- `adminAPI.programmes.update()` for editing
- `adminAPI.programmes.delete()` for deletion
- `adminAPI.departments.list()` for department filter
- `adminAPI.faculties.list()` for faculty filter
- `adminAPI.institutions.list()` for institution filter

---

### Task 7: Create Programme Details Page
**Priority: MEDIUM** 🟡
**Estimated Time: 3-4 hours**

#### 7.1. Create Programme Details Page
- [ ] File: `/src/app/dashboard/institutions/programmes/[id]/page.tsx`
- [ ] Fetch programme data using `adminAPI.programmes.getById(programmeId)`
- [ ] Display programme hero section:
  - [ ] Programme name and description
  - [ ] Department, faculty, institution info
  - [ ] Edit Programme button
  - [ ] Dropdown menu (Add Course, Delete Programme, etc.)
- [ ] Add statistics cards:
  - [ ] Total Courses
  - [ ] Total Students (mock)
  - [ ] Total Exam Papers
  - [ ] Completion Rate (mock)
- [ ] Create tabs:
  - [ ] Overview tab (programme details)
  - [ ] Courses tab (list of courses with add/view/delete)
  - [ ] Department Info tab
  - [ ] Analytics tab (placeholder)
- [ ] Make all buttons functional:
  - [ ] Edit Programme → Open edit modal
  - [ ] Add Course → Open add course modal
  - [ ] Delete Programme → Open confirmation dialog
  - [ ] Course cards → Clickable, navigate to course details
- [ ] Add modals:
  - [ ] Edit Programme modal (Dialog with ProgrammeForm)
  - [ ] Add Course modal (Dialog with CourseForm)
  - [ ] Delete Programme confirmation (AlertDialog)

**Files to create:**
- `/src/app/dashboard/institutions/programmes/[id]/page.tsx`

---

### Task 8: Create ProgrammeForm Component
**Priority: MEDIUM** 🟡
**Estimated Time: 2-3 hours**

#### 8.1. Create ProgrammeForm
- [ ] File: `/src/components/forms/programme-form.tsx`
- [ ] Add Zod validation schema:
  - [ ] `name` (required, min 2 chars)
  - [ ] `description` (optional, textarea)
  - [ ] `department_id` (required, select from departments)
  - [ ] `programme_type` (optional, e.g., Bachelor, Master, PhD, Diploma, Certificate)
  - [ ] `duration_years` (optional, number)
  - [ ] `image` (optional, file upload)
- [ ] Support create and edit modes
- [ ] Fetch departments list for dropdown (with faculty and institution info)
- [ ] Add image upload with preview
- [ ] Implement `onSubmit`:
  - [ ] Call `adminAPI.programmes.create()` or `adminAPI.programmes.update()`
  - [ ] Handle success and error states
  - [ ] Show notifications
  - [ ] Call `onSuccess` callback
- [ ] Add `embedded` prop for modal usage
- [ ] Add `defaultDepartmentId` prop for pre-selecting department

**Files to create:**
- `/src/components/forms/programme-form.tsx`

---

## 🚧 **PENDING TASKS - Phase 3: Modules Management**

### Task 9: Add Module Management to api-admin.ts
**Priority: MEDIUM** 🟡
**Estimated Time: 1-2 hours**

#### 9.1. Expand modules section in api-admin.ts
Currently `adminAPI.modules` only has `list()`. Add full CRUD:
- [ ] `search(params)` - GET `/module/search` (if available in backend)
- [ ] `getById(moduleId)` - GET `/module/get_by_id/{module_id}` (check backend)
- [ ] `create(moduleData)` - POST `/module` (check backend)
- [ ] `update(moduleId, moduleData)` - PUT `/module/{module_id}` (check backend)
- [ ] `delete(moduleId)` - DELETE `/module/{module_id}` (check backend)
- [ ] `getStats()` - Custom stats aggregation

**Note:** Check backend API schemas to confirm these endpoints exist. If not, document what's missing.

**Files to modify:**
- `/src/lib/api-admin.ts` - Expand modules section

---

### Task 10: Create Modules Page
**Priority: LOW** 🟢
**Estimated Time: 3-4 hours**

#### 10.1. Create Modules List Page (Optional - may not be needed as a standalone page)
- [ ] File: `/src/app/dashboard/institutions/modules/page.tsx`
- [ ] Implement full pagination
- [ ] Add search functionality
- [ ] Add filters (by course, by programme, by institution)
- [ ] Display statistics
- [ ] Create DataTable
- [ ] Add "Create Module" button
- [ ] Implement CRUD modals

**Note:** Modules may be better managed directly from the Course Details page rather than as a standalone page. Discuss this with the team.

**Files to create (if needed):**
- `/src/app/dashboard/institutions/modules/page.tsx`

---

### Task 11: Create Module Details Page
**Priority: LOW** 🟢
**Estimated Time: 2-3 hours**

#### 11.1. Create Module Details Page
- [ ] File: `/src/app/dashboard/institutions/modules/[id]/page.tsx`
- [ ] Display module information
- [ ] Show associated courses
- [ ] Show exam papers using this module
- [ ] Add edit/delete functionality

**Files to create:**
- `/src/app/dashboard/institutions/modules/[id]/page.tsx`

---

### Task 12: Create ModuleForm Component
**Priority: LOW** 🟢
**Estimated Time: 1-2 hours**

#### 12.1. Create ModuleForm
- [ ] File: `/src/components/forms/module-form.tsx`
- [ ] Add Zod validation
- [ ] Support create and edit modes
- [ ] Fetch courses for dropdown
- [ ] Implement `onSubmit`

**Files to create:**
- `/src/components/forms/module-form.tsx`

---

## 🚧 **PENDING TASKS - Phase 4: Integration & Polish**

### Task 13: Update Department Details Page - Add Programme Form
**Priority: HIGH** 🔴
**Estimated Time: 30 minutes**

#### 13.1. Replace Programme Modal Placeholder
- [ ] Remove placeholder "Add Programme" modal
- [ ] Integrate real `ProgrammeForm` component
- [ ] Pass `defaultDepartmentId` prop to pre-select department
- [ ] Update `handleFormSuccess` to refresh department data

**Files to modify:**
- `/src/app/dashboard/institutions/departments/[id]/page.tsx`

---

### Task 14: Add Course Statistics to Courses Page
**Priority: MEDIUM** 🟡
**Estimated Time: 1-2 hours**

#### 14.1. Implement Course Statistics
- [ ] Add `loadStats()` function in courses page
- [ ] Create statistics cards section
- [ ] Display:
  - [ ] Total Courses
  - [ ] Total Programmes
  - [ ] Total Modules
  - [ ] Average Modules per Course
- [ ] Add skeleton loading for stats

**Files to modify:**
- `/src/app/dashboard/institutions/courses/page.tsx`

---

### Task 15: Add Breadcrumbs to All Pages
**Priority: LOW** 🟢
**Estimated Time: 1 hour**

#### 15.1. Ensure All Pages Have Proper Breadcrumbs
- [ ] Courses page
- [ ] Course details page
- [ ] Programmes page
- [ ] Programme details page
- [ ] Modules pages (if created)

**Files to modify:**
- All course/programme/module pages

---

### Task 16: Add Search Functionality Improvements
**Priority: LOW** 🟢
**Estimated Time: 2-3 hours**

#### 16.1. Enhance Search Experience
- [ ] Add debouncing to search inputs (300ms delay)
- [ ] Add search suggestions/autocomplete
- [ ] Add search history (localStorage)
- [ ] Add "Clear filters" button
- [ ] Add filter count badges on filter buttons

**Files to modify:**
- `/src/app/dashboard/institutions/courses/page.tsx`
- `/src/app/dashboard/institutions/programmes/page.tsx`

---

### Task 17: Add Bulk Operations
**Priority: LOW** 🟢
**Estimated Time: 3-4 hours**

#### 17.1. Implement Bulk Actions
- [ ] Add row selection checkboxes to DataTables
- [ ] Add bulk delete functionality
- [ ] Add bulk export functionality (CSV/Excel)
- [ ] Add bulk update (e.g., change department for multiple programmes)
- [ ] Add confirmation dialogs for bulk operations

**Files to modify:**
- All list pages (courses, programmes, departments, faculties)

---

### Task 18: Add Export/Import Functionality
**Priority: LOW** 🟢
**Estimated Time: 4-5 hours**

#### 18.1. Export Data
- [ ] Add export button to all list pages
- [ ] Support CSV export
- [ ] Support Excel export
- [ ] Support PDF export (for reports)

#### 18.2. Import Data
- [ ] Add import button to all list pages
- [ ] Support CSV import with validation
- [ ] Show import preview before confirming
- [ ] Handle errors gracefully

**Files to create:**
- `/src/lib/export-utils.ts`
- `/src/lib/import-utils.ts`

---

### Task 19: Add Image Upload & Management
**Priority: MEDIUM** 🟡
**Estimated Time: 2-3 hours**

#### 19.1. Implement Image Upload in Forms
- [ ] Add image upload component to CourseForm
- [ ] Add image upload component to ProgrammeForm
- [ ] Add image preview
- [ ] Add image cropping/resizing
- [ ] Handle upload to backend
- [ ] Display uploaded images in details pages

**Files to create:**
- `/src/components/ui/image-upload.tsx`

**Files to modify:**
- All form components

---

### Task 20: Testing & Bug Fixes
**Priority: HIGH** 🔴
**Estimated Time: 4-6 hours**

#### 20.1. Comprehensive Testing
- [ ] Test all CRUD operations for courses
- [ ] Test all CRUD operations for programmes
- [ ] Test all filters and search
- [ ] Test pagination on all pages
- [ ] Test page size changes
- [ ] Test modals open/close properly
- [ ] Test form validation
- [ ] Test error handling
- [ ] Test loading states
- [ ] Test empty states
- [ ] Test responsive design on mobile/tablet
- [ ] Test accessibility (keyboard navigation, screen readers)

#### 20.2. Bug Fixes
- [ ] Fix any linting errors
- [ ] Fix any TypeScript errors
- [ ] Fix any console warnings
- [ ] Fix any performance issues
- [ ] Fix any UI/UX issues

---

## 📊 **Summary & Priority**

### **Immediate Priority (Next 2-3 days):**
1. ✅ **Task 3:** Complete Courses Page (High Priority)
2. ✅ **Task 4:** Create Course Details Page (High Priority)
3. ✅ **Task 5:** Create CourseForm Component (High Priority)
4. ✅ **Task 13:** Update Department Details - Add Programme Form (High Priority)

### **Short-term Priority (Next week):**
5. **Task 6:** Create Programmes Page (Medium Priority)
6. **Task 7:** Create Programme Details Page (Medium Priority)
7. **Task 8:** Create ProgrammeForm Component (Medium Priority)
8. **Task 14:** Add Course Statistics (Medium Priority)

### **Long-term Priority (Next 2 weeks):**
9. **Task 9-12:** Modules Management (Low-Medium Priority)
10. **Task 15-19:** Polish & Enhancements (Low Priority)

### **Final Priority:**
11. **Task 20:** Testing & Bug Fixes (High Priority - before deployment)

---

## 🔗 **Dependencies**

### Backend API Requirements:
Check if these endpoints exist in the backend. If not, they need to be implemented:

1. **Programme Endpoints:**
   - ✅ `GET /programme` (exists)
   - ✅ `GET /programme/get_by_id/{programme_id}` (exists)
   - ✅ `POST /programme` (exists)
   - ✅ `PUT /programme/{programme_id}` (exists)
   - ✅ `DELETE /programme/{programme_id}` (exists)
   - ❓ `GET /programme/search` (check if exists)

2. **Module Endpoints:**
   - ✅ `GET /module` (exists)
   - ❓ `GET /module/get_by_id/{module_id}` (check if exists)
   - ❓ `POST /module` (check if exists)
   - ❓ `PUT /module/{module_id}` (check if exists)
   - ❓ `DELETE /module/{module_id}` (check if exists)
   - ❓ `GET /module/search` (check if exists)

3. **Course-Module Relationship:**
   - ✅ `POST /course/{course_id}/modules/{module_id}` (exists in api-admin.ts)
   - ❓ `DELETE /course/{course_id}/modules/{module_id}` (check if exists)

---

## 📝 **Notes**

1. **Consistent UI/UX:** All pages should follow the same design patterns as Faculties and Departments pages.
2. **Reusable Components:** Maximize component reusability (DataTable, forms, modals, etc.).
3. **Type Safety:** Always use generated API types from `@/types/generated/api`.
4. **Error Handling:** Implement proper error handling with user-friendly messages.
5. **Loading States:** Show loading spinners/skeletons during async operations.
6. **Empty States:** Use EmptyState component for empty data scenarios.
7. **Accessibility:** Ensure all components are keyboard-navigable and screen-reader friendly.
8. **Performance:** Implement lazy loading, debouncing, and proper memoization.
9. **Documentation:** Document all complex functions and components.
10. **Testing:** Write tests as you go, don't leave it for the end.

---

## 📚 **Reference Files**

- ✅ **Good Examples to Follow:**
  - `/src/app/dashboard/institutions/faculties/page.tsx`
  - `/src/app/dashboard/institutions/faculties/[id]/page.tsx`
  - `/src/app/dashboard/institutions/departments/page.tsx`
  - `/src/app/dashboard/institutions/departments/[id]/page.tsx`
  - `/src/components/forms/faculty-form.tsx`
  - `/src/components/forms/department-form.tsx`
  - `/src/components/forms/institution-form.tsx`

- **API Reference:**
  - `/src/lib/api-admin.ts` - All API endpoints
  - `/src/types/generated/api.ts` - Generated API types

- **UI Components:**
  - `/src/components/ui/data-table.tsx`
  - `/src/components/ui/dialog.tsx`
  - `/src/components/ui/alert-dialog.tsx`
  - `/src/components/ui/form.tsx`

---

**Last Updated:** October 5, 2025
**Status:** In Progress - Task 3 (Courses Page)
**Next Action:** Complete courses page filter UI and integrate ProgrammeForm

