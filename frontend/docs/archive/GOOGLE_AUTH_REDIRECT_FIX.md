# Google OAuth Redirect Fix

## Problem
After successful Google OAuth login, the app was stuck on the loading screen and not redirecting to the exam papers page.

## Root Causes

### 1. Using setToken() Instead of login()
The callback page was calling `setToken()` which only sets the token but doesn't set `isAuthenticated: true`. This caused the auth state to show:
```json
{
  "user": null,
  "token": "eyJhbGci...",
  "isAuthenticated": false  // ❌ This should be true!
}
```

The correct approach is to call `login(user, token)` which sets both the user and `isAuthenticated: true`.

### 2. Not Extracting User Data
The callback page was only extracting the token but not the user data from the response. The API returns:
```typescript
{
  access_token: string,
  token_type: string,
  refresh_token: string,
  user: IUserRead  // ❌ This was being ignored
}
```

### 2. Wrong Default Redirect
The default redirect was set to `/dashboard` instead of `/exampapers`.

### 3. Delayed Redirect
Using `setTimeout` and `router.push` was causing issues. Changed to immediate redirect with `window.location.href`.

## Changes Made

### 1. Fixed Auth Store Update (`src/app/(public)/auth/callback/google/page.tsx`)
```typescript
// OLD - Only sets token, isAuthenticated stays false
const setToken = useAuthStore((state) => state.setToken);
setToken(token);

// NEW - Sets both user and token, isAuthenticated becomes true
const login = useAuthStore((state) => state.login);
login(user, token);
```

### 2. Extract Both Token AND User Data
The response structure is:
- **Backend returns**: `{ message, meta, data: Token }`
- **openapi-fetch wraps**: `{ data: { message, meta, data: Token }, error }`
- **exchangeGoogleCode returns**: `response.data` (the full backend response)
- **Callback receives**: `{ message, meta, data: { access_token, token_type, refresh_token, user } }`
- **Must access**: `response.data.access_token` and `response.data.user`

```typescript
// OLD - Only extracted token
let token: string | undefined;
if (response && 'access_token' in response) {
    token = response.access_token;
}

// NEW - Extract both token and user from nested data
let token: string | undefined;
let user: any | undefined;
if (response && typeof response === 'object' && 'data' in response) {
    const data = response.data;
    if (data && typeof data === 'object') {
        token = data.access_token;
        user = data.user;
    }
}
```

### 3. Changed Default Redirect to `/exampapers`
Updated in:
- `src/app/(public)/auth/callback/google/page.tsx`
- `src/lib/social-auth.ts` (both `initiateGoogleAuth` and `redirectToGoogleAuth`)

### 3. Immediate Hard Redirect
```typescript
// OLD - Delayed soft redirect
setTimeout(() => {
    router.push(redirectUrl);
}, 1500);

// NEW - Immediate hard redirect
window.location.href = redirectUrl;
```

### 4. Added Better Logging
Added console logs to track:
- Token extraction success
- Redirect URL
- Response structure (on error)

### 5. Updated UI Text
Changed "Redirecting you to your dashboard..." to "Redirecting you to exam papers..."

## Testing
1. Click "Sign in with Google" on the login page
2. Complete Google OAuth flow
3. Should immediately redirect to `/exampapers` page
4. Check browser console for logs:
   - ✅ Token stored successfully
   - 🔄 Redirecting to: /exampapers

## Files Modified
1. `src/app/(public)/auth/callback/google/page.tsx` - Fixed token extraction and redirect
2. `src/lib/social-auth.ts` - Updated default redirect URLs

## Next Steps
If the issue persists:
1. Check browser console for error messages
2. Verify the backend API is returning the correct response structure
3. Check if the `/exampapers` route is accessible
4. Verify middleware is not blocking the redirect
