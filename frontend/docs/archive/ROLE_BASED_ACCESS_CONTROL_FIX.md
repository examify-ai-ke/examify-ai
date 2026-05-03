# Role-Based Access Control Fix

## Problem
Regular users could access admin pages like `/dashboard` and `/dashboard/exam-papers` even though they don't have admin privileges.

## Root Cause
The middleware only checked if a user was authenticated, but didn't verify their role. It allowed any authenticated user to access admin routes.

## Solution
Implemented role-based access control by:

1. **Storing user role in a cookie** - Added `user-role` cookie that stores the user's role (`superuser`, `admin`, or `user`)
2. **Middleware role checking** - Updated middleware to check the `user-role` cookie and redirect non-admin users away from admin routes
3. **Setting role on login** - Updated both Google OAuth and email/password login to set the `user-role` cookie
4. **Clearing role on logout** - Updated logout and session invalidation to clear the `user-role` cookie

## Changes Made

### 1. Middleware (`src/middleware.ts`)
Added role-based access control:
```typescript
// Define admin routes
const adminRoutes = ['/dashboard', '/admin'];

// Get user role from cookie
const userRole = request.cookies.get('user-role')?.value;
const hasAdminAccess = userRole === 'superuser' || userRole === 'admin';

// Redirect non-admin users from admin routes
if (isAdminRoute && isAuthenticated && !hasAdminAccess) {
  return NextResponse.redirect(new URL('/exampapers', request.url));
}
```

### 2. Google OAuth Callback (`src/app/(public)/auth/callback/google/page.tsx`)
Set user-role cookie after successful authentication:
```typescript
// Store user role in cookie for middleware access control
const userRole = user.is_superuser ? 'superuser' : (user.role?.name || 'user');
document.cookie = `user-role=${userRole}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
```

### 3. Email/Password Login (`src/hooks/useAuth.ts`)
Set user-role cookie in `handleLogin`:
```typescript
// Store user role in cookie for middleware access control
if (typeof window !== 'undefined') {
  const userRole = user.is_superuser ? 'superuser' : (user.role?.name || 'user');
  document.cookie = `user-role=${userRole}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
}
```

### 4. Logout (`src/hooks/useAuth.ts`)
Clear user-role cookie in `handleLogout`:
```typescript
// Clear user-role cookie
if (typeof window !== 'undefined') {
  document.cookie = 'user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}
```

### 5. Session Invalidation (`src/stores/auth.ts`)
Clear user-role cookie in `invalidateSession`:
```typescript
document.cookie = 'user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
```

## User Roles
Based on the backend API schema, users have:
- `is_superuser: boolean` - Flag for superuser status
- `role.name: string` - One of: `admin`, `manager`, `user`

**Admin Access** is granted to:
- **superuser**: Users with `is_superuser: true` (full admin access)
- **admin**: Users with `role.name === 'admin'` (admin access)

**No Admin Access**:
- **manager**: Users with `role.name === 'manager'` (regular user access)
- **user**: Users with `role.name === 'user'` (regular user access)

## Protected Routes
- `/dashboard/*` - Requires admin or superuser role
- `/admin/*` - Requires admin or superuser role
- `/profile` - Requires authentication only (any role)

## Testing
1. **As a regular user** (role: `user` or `manager`):
   - Login with Google or email/password
   - Try to access `/dashboard` or `/dashboard/exam-papers`
   - Should be redirected to `/exampapers`
   - Check cookies: should see `user-role=user` or `user-role=manager`

2. **As an admin user** (role: `admin`):
   - Login with admin credentials
   - Should be able to access `/dashboard` and all admin routes
   - Check cookies: should see `user-role=admin`

3. **As a superuser** (`is_superuser: true`):
   - Login with superuser credentials
   - Should be able to access `/dashboard` and all admin routes
   - Check cookies: should see `user-role=superuser`

## Files Modified
1. `src/middleware.ts` - Added role-based access control
2. `src/app/(public)/auth/callback/google/page.tsx` - Set user-role cookie on OAuth login
3. `src/hooks/useAuth.ts` - Set/clear user-role cookie on login/logout
4. `src/stores/auth.ts` - Clear user-role cookie on session invalidation

## Security Notes
- The `user-role` cookie is set with `SameSite=Lax` for CSRF protection
- The cookie expires after 7 days (same as auth token)
- The middleware runs on every request to protected routes
- Non-admin users are redirected to `/exampapers` instead of showing an error page
