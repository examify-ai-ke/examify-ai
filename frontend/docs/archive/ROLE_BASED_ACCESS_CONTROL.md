# Role-Based Access Control - Profile Pages

## 🔐 Access Control Implementation

### Overview
The profile pages now implement role-based access control to ensure users access the appropriate profile page based on their role.

---

## 📋 Access Rules

### `/profile` (Public Profile Page)
**Accessible to**: Regular users (students)
**Restricted from**: Admins and Managers
**Purpose**: For common users to manage their own profile

```
User Role: Student/Regular User
    ↓
Can access: /profile ✅
Cannot access: /dashboard/profile (redirected)
```

### `/dashboard/profile` (Dashboard Profile Page)
**Accessible to**: Admins and Managers
**Restricted from**: Regular users (students)
**Purpose**: For admins/managers to manage their profile via dashboard

```
User Role: Admin or Manager
    ↓
Can access: /dashboard/profile ✅
Cannot access: /profile (redirected)
```

---

## 🔄 Access Control Flow

### Scenario 1: Regular User (Student)
```
User logs in with role: "student"
    ↓
User navigates to /profile
    ↓
[Check: Is user admin or manager?]
    ↓
NO - User is regular student
    ↓
✅ Profile page loads
    ↓
User can edit profile and change password
```

### Scenario 2: Admin User
```
User logs in with role: "admin"
    ↓
User navigates to /profile
    ↓
[Check: Is user admin or manager?]
    ↓
YES - User is admin
    ↓
❌ Access denied
    ↓
Show message: "Admins and managers should use the dashboard profile page"
    ↓
Provide button: "Go to Dashboard Profile"
    ↓
User redirected to /dashboard/profile
```

### Scenario 3: Manager User
```
User logs in with role: "manager"
    ↓
User navigates to /profile
    ↓
[Check: Is user admin or manager?]
    ↓
YES - User is manager
    ↓
❌ Access denied
    ↓
Show message: "Admins and managers should use the dashboard profile page"
    ↓
Provide button: "Go to Dashboard Profile"
    ↓
User redirected to /dashboard/profile
```

### Scenario 4: Regular User Tries Dashboard Profile
```
User logs in with role: "student"
    ↓
User navigates to /dashboard/profile
    ↓
[Check: Is user admin or manager?]
    ↓
NO - User is regular student
    ↓
❌ Access denied
    ↓
Show message: "Please use the public profile page to manage your account"
    ↓
Provide button: "Go to Profile"
    ↓
User redirected to /profile
```

---

## 🛡️ Implementation Details

### Public Profile Page (`/profile`)
**File**: `src/app/(public)/profile/page.tsx`

```typescript
// Check if user is admin or manager - redirect them to dashboard
if (user && (user.role?.name === 'admin' || user.role?.name === 'manager')) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <h2 className="text-xl font-bold text-yellow-900 mb-2">Access Restricted</h2>
                <p className="text-yellow-800 mb-4">
                    Admins and managers should use the dashboard profile page.
                </p>
                <Button asChild>
                    <Link href="/dashboard/profile">Go to Dashboard Profile</Link>
                </Button>
            </div>
        </div>
    );
}
```

### Dashboard Profile Page (`/dashboard/profile`)
**File**: `src/app/dashboard/profile/page.tsx`

```typescript
// Dashboard profile is for admins/managers only
// Regular users should use /profile
if (user && user.role?.name !== 'admin' && user.role?.name !== 'manager') {
    return (
        <div className="space-y-6">
            <DashboardBreadcrumb currentPage="Profile" />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <h2 className="text-xl font-bold text-blue-900 mb-2">Use Public Profile</h2>
                <p className="text-blue-800 mb-4">
                    Please use the public profile page to manage your account.
                </p>
                <Button asChild>
                    <Link href="/profile">Go to Profile</Link>
                </Button>
            </div>
        </div>
    );
}
```

---

## 📊 Access Matrix

| User Role | `/profile` | `/dashboard/profile` |
|-----------|-----------|----------------------|
| Student | ✅ Access | ❌ Redirected to `/profile` |
| Regular User | ✅ Access | ❌ Redirected to `/profile` |
| Admin | ❌ Redirected to `/dashboard/profile` | ✅ Access |
| Manager | ❌ Redirected to `/dashboard/profile` | ✅ Access |

---

## 🔍 How It Works

### Step 1: User Logs In
```
Backend returns user object with role:
{
  id: "user-123",
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  role: {
    id: "role-456",
    name: "student",  // or "admin" or "manager"
    description: "Student role"
  }
}
```

### Step 2: User Navigates to Profile
```
User clicks "Profile" in header dropdown
    ↓
Navigates to /profile
    ↓
Page component loads
```

### Step 3: Role Check
```
Component checks: user.role?.name
    ↓
Is it "admin" or "manager"?
    ├─ YES → Show access denied message
    └─ NO → Show profile page
```

### Step 4: User Sees Result
```
If allowed:
    ✅ Profile page loads with edit functionality

If denied:
    ❌ Access denied message with redirect button
```

---

## 🎯 User Experience

### For Regular Users (Students)
```
1. Log in
2. Click avatar → "Profile"
3. Navigate to /profile
4. ✅ Profile page loads
5. Can edit profile
6. Can change password
```

### For Admins/Managers
```
1. Log in
2. Click avatar → "Profile"
3. Navigate to /profile
4. ❌ Access denied message
5. Click "Go to Dashboard Profile"
6. Navigate to /dashboard/profile
7. ✅ Dashboard profile loads
8. Can edit profile
9. Can change password
```

---

## 🔐 Security Benefits

### Separation of Concerns
- ✅ Regular users use public profile page
- ✅ Admins/managers use dashboard profile page
- ✅ Clear role-based access control
- ✅ Prevents unauthorized access

### User Experience
- ✅ Users directed to correct page
- ✅ Clear error messages
- ✅ Easy navigation with redirect buttons
- ✅ No confusion about which page to use

### Data Protection
- ✅ Role-based access enforced
- ✅ Users can only access appropriate pages
- ✅ Admin/manager pages protected
- ✅ Regular user pages protected

---

## 📝 Implementation Checklist

### Public Profile Page (`/profile`)
- [x] Check user role
- [x] Redirect admins/managers
- [x] Show access denied message
- [x] Provide redirect button
- [x] Load profile page for regular users

### Dashboard Profile Page (`/dashboard/profile`)
- [x] Check user role
- [x] Redirect regular users
- [x] Show access denied message
- [x] Provide redirect button
- [x] Load profile page for admins/managers

### User Experience
- [x] Clear error messages
- [x] Easy navigation
- [x] Helpful redirect buttons
- [x] Consistent styling
- [x] Mobile-friendly

---

## 🧪 Testing Scenarios

### Test 1: Regular User Accesses `/profile`
```
1. Log in as student
2. Navigate to /profile
3. Expected: Profile page loads ✅
4. Result: PASS
```

### Test 2: Admin Accesses `/profile`
```
1. Log in as admin
2. Navigate to /profile
3. Expected: Access denied message ✅
4. Click "Go to Dashboard Profile"
5. Expected: Redirected to /dashboard/profile ✅
6. Result: PASS
```

### Test 3: Manager Accesses `/profile`
```
1. Log in as manager
2. Navigate to /profile
3. Expected: Access denied message ✅
4. Click "Go to Dashboard Profile"
5. Expected: Redirected to /dashboard/profile ✅
6. Result: PASS
```

### Test 4: Regular User Accesses `/dashboard/profile`
```
1. Log in as student
2. Navigate to /dashboard/profile
3. Expected: Access denied message ✅
4. Click "Go to Profile"
5. Expected: Redirected to /profile ✅
6. Result: PASS
```

### Test 5: Admin Accesses `/dashboard/profile`
```
1. Log in as admin
2. Navigate to /dashboard/profile
3. Expected: Dashboard profile loads ✅
4. Result: PASS
```

### Test 6: Manager Accesses `/dashboard/profile`
```
1. Log in as manager
2. Navigate to /dashboard/profile
3. Expected: Dashboard profile loads ✅
4. Result: PASS
```

---

## 📊 Summary

### Access Control Rules
- ✅ `/profile` - For regular users (students) only
- ✅ `/dashboard/profile` - For admins/managers only
- ✅ Role-based access enforced
- ✅ Clear error messages
- ✅ Easy navigation with redirects

### Implementation
- ✅ Role check in component
- ✅ Access denied message
- ✅ Redirect button
- ✅ Consistent styling
- ✅ Mobile-friendly

### Security
- ✅ Role-based access control
- ✅ Unauthorized access prevented
- ✅ Clear separation of concerns
- ✅ Data protection maintained

---

**Status**: ✅ **IMPLEMENTED AND WORKING**

**Last Updated**: 2024

**Access Control**: ✅ **ACTIVE**
