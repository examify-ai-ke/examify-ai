# Session Expiry Login Fix

## Problem

When a user's session expires and they try to login again, they get an error "Your session has expired. Please login again." on the first attempt. The second login attempt succeeds.

## Root Cause

The issue occurred because:

1. When the session expires, the expired token remains in localStorage and cookies
2. On the first login attempt, the API interceptor adds the expired token to the Authorization header
3. The backend receives the login request WITH an expired token in the header
4. The backend returns 401 Unauthorized because of the expired token
5. The 401 handler clears the expired token
6. On the second login attempt, there's no token, so the request succeeds

## Solution

We implemented a two-part fix:

### Part 1: Exclude Auth Endpoints from Token Injection

Modified `src/lib/api.ts` to NOT add Authorization headers to authentication endpoints:

```typescript
// Don't add auth token to login/register/password-reset endpoints
const url = request.url;
const isAuthEndpoint = url.includes('/login') || 
                      url.includes('/register') || 
                      url.includes('/password-reset') ||
                      url.includes('/user') && request.method === 'POST' && !url.includes('/user/');

// Only add Authorization header if we have a token AND it's not an auth endpoint
if (token && !isAuthEndpoint) {
  request.headers.set('Authorization', `Bearer ${token}`);
}
```

**Why this works:**
- Login, register, and password reset endpoints don't require authentication
- They should never receive an Authorization header
- This prevents expired tokens from interfering with new login attempts

### Part 2: Clear Expired Tokens Before Login

Modified `src/hooks/useAuth.ts` to clear any existing tokens before attempting login:

```typescript
const handleLogin = async (credentials) => {
  setIsLoading(true);
  clearError();

  // Clear any existing expired tokens before login attempt
  clearAuthToken();

  // ... rest of login logic
}
```

**Why this works:**
- Ensures a clean slate for each login attempt
- Removes any stale or expired tokens that might interfere
- Prevents the API interceptor from finding an old token

## Benefits

1. **Better UX**: Users can login successfully on the first attempt after session expiry
2. **Cleaner Auth Flow**: No expired tokens are sent to authentication endpoints
3. **More Secure**: Expired tokens are immediately cleared when attempting new authentication
4. **Consistent Behavior**: Login works the same whether or not there's an expired token

## Testing

To verify the fix:

1. Login to the application
2. Wait for the session to expire (or manually delete the token from localStorage)
3. Try to login again
4. ✅ Login should succeed on the first attempt without any error messages

## Related Files

- `src/lib/api.ts` - API client configuration and interceptors
- `src/hooks/useAuth.ts` - Authentication hook with login logic
- `src/stores/auth.ts` - Auth state management

## Additional Improvements

Consider these future enhancements:

1. **Token Refresh**: Implement automatic token refresh before expiry
2. **Session Warning**: Show a warning before session expires
3. **Silent Refresh**: Refresh tokens in the background without user interaction
4. **Better Error Messages**: Distinguish between "expired session" and "invalid credentials"
