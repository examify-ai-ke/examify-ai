# X (Twitter) OAuth Implementation

## Overview
Replaced GitHub OAuth with X (Twitter) OAuth across the authentication system. The implementation follows the same patterns as Google OAuth for consistency.

## Changes Made

### 1. **Frontend Pages Updated**

#### Login Page (`src/app/(public)/auth/login/page.tsx`)
- ✅ Updated imports: `Github` → `X as XIcon`
- ✅ Updated function calls: `redirectToGitHubAuth()` → `redirectToXAuth()`
- ✅ Updated handler: `handleGitHubLogin()` → `handleXLogin()`
- ✅ Updated button UI: GitHub button replaced with X button
- ✅ Social providers positioned at top, email form at bottom

#### Register Page (`src/app/auth/register/page.tsx`)
- ✅ Updated imports: `Github` → `X as XIcon`
- ✅ Updated function calls: `redirectToGitHubAuth()` → `redirectToXAuth()`
- ✅ Updated handler: `handleGitHubSignup()` → `handleXSignup()`
- ✅ Updated button UI: GitHub button replaced with X button
- ✅ Redirect changed to `/exampapers` for new users

### 2. **OAuth Utilities (`src/lib/social-auth.ts`)**

#### New Functions Added
- **`initiateXAuth(redirectUrl?: string)`** - Initiates X OAuth flow using popup window
- **`redirectToXAuth(redirectUrl?: string)`** - Direct redirect approach for X OAuth
- **`exchangeXCode(code: string, provider: 'twitter')`** - Exchanges authorization code for tokens via backend
- **`loginWithX(redirectUrl?: string)`** - Complete X authentication flow wrapper

#### Configuration
- Uses X OAuth 2.0 with PKCE support
- Endpoint: `https://twitter.com/i/oauth2/authorize`
- Scopes: `tweet.read users.read follows.read follows.write`
- Provider name in backend: `twitter` (not `x`)

#### Error Handling
- Detects and logs OAuth errors
- Provides detailed error messages
- Type assertions used to resolve TypeScript compilation issues

### 3. **OAuth Callback Handler (`src/app/auth/callback/x/page.tsx`)**

#### Features
- ✅ Abort signal handling to prevent memory leaks
- ✅ Mount state tracking to prevent unmounted component updates
- ✅ Cancellation detection (`access_denied` error) - redirects to login
- ✅ Role-based redirect logic:
  - Admins/managers → `/dashboard`
  - Regular users → `/exampapers` (ignores `/dashboard` in state)
- ✅ Token and user extraction from backend response
- ✅ Error feedback with auto-redirect after 3 seconds
- ✅ Loading spinner during authentication process

## Environment Variables Required

Add the following to `.env.local` and backend `.env`:

```bash
# Frontend (.env.local)
NEXT_PUBLIC_X_CLIENT_ID=your_x_app_client_id

# Backend (.env)
X_CLIENT_ID=your_x_app_client_id
X_CLIENT_SECRET=your_x_app_client_secret
```

## API Integration

### Backend Endpoint
```
POST /api/v1/user/social-auth/{provider}/callback
```

**Provider value:** `twitter` (or `x` if backend supports both)

### Request Payload
```json
{
  "code": "authorization_code_from_x",
  "redirect_uri": "https://yourdomain.com/auth/callback/x"
}
```

### Expected Response
```json
{
  "message": "Authentication successful",
  "meta": {},
  "data": {
    "access_token": "jwt_token",
    "token_type": "Bearer",
    "refresh_token": "refresh_token_if_applicable",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "is_superuser": false,
      "role": {
        "name": "user"
      }
    }
  }
}
```

## Testing Checklist

- [ ] X Client ID and Secret are configured in environment variables
- [ ] Frontend imports are correct (`Chrome`, `X as XIcon`)
- [ ] Function calls use `redirectToXAuth()` throughout
- [ ] Login page displays X button instead of GitHub
- [ ] Register page displays X button instead of GitHub
- [ ] Clicking X button initiates OAuth flow
- [ ] X OAuth authorization page loads correctly
- [ ] After authorization, user is redirected to callback page
- [ ] Loading spinner displays during authentication
- [ ] Token is extracted correctly from backend response
- [ ] User is logged in and redirected appropriately:
  - Admins/managers → `/dashboard`
  - Regular users → `/exampapers`
- [ ] Cancelling X OAuth redirects back to login page
- [ ] OAuth errors display with appropriate error messages
- [ ] No console errors or warnings

## Architecture

### OAuth Flow
1. User clicks "X" button on login/register page
2. `redirectToXAuth()` redirects to X authorization endpoint
3. User authenticates with X account
4. X redirects back to `/auth/callback/x` with authorization code
5. Callback page exchanges code for tokens via backend
6. Backend validates code with X and returns JWT + user data
7. User is logged in and redirected based on role

### Error Handling Flow
1. If authorization code is missing → Error message
2. If user cancels OAuth (access_denied) → Silent redirect to login
3. If backend error occurs → Display error + auto-redirect to login after 3s
4. If component unmounts during request → Silently cancel request (no state update)

## Migration Notes

- **Removed:** All GitHub OAuth code and functions
- **Provider naming:** Uses `twitter` as provider key to match backend API schema
- **Type safety:** Used `as any` assertions where needed to work with OpenAPI-generated types
- **Callback location:** Changed from `/auth/callback/github` to `/auth/callback/x`

## Related Files

- `src/app/(public)/auth/login/page.tsx` - Login page with X auth
- `src/app/auth/register/page.tsx` - Register page with X auth
- `src/lib/social-auth.ts` - OAuth utilities including X functions
- `src/app/auth/callback/x/page.tsx` - X OAuth callback handler (NEW)
- `src/types/generated/api.ts` - OpenAPI-generated types

## GitHub OAuth Removal

All GitHub-specific code has been removed:
- ❌ `initiateGitHubAuth()` - Removed
- ❌ `redirectToGitHubAuth()` - Removed
- ❌ `exchangeGitHubCode()` - Removed
- ❌ `loginWithGitHub()` - Removed
- ❌ `/auth/callback/github/` - Callback handler remains for legacy support

## Next Steps

1. **Obtain X App Credentials**
   - Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
   - Create/select your app
   - Generate OAuth 2.0 credentials (Client ID and Client Secret)
   - Set callback URI to: `https://yourdomain.com/auth/callback/x`

2. **Configure Environment Variables**
   ```bash
   NEXT_PUBLIC_X_CLIENT_ID=your_client_id
   X_CLIENT_SECRET=your_client_secret  # On backend
   ```

3. **Backend Configuration**
   - Ensure backend has X OAuth implementation
   - Endpoint: `POST /api/v1/user/social-auth/twitter/callback`
   - Should accept code and redirect_uri
   - Should return JWT and user data in expected format

4. **Test in Development**
   - Start dev server
   - Navigate to login page
   - Click X button
   - Complete X authentication
   - Verify redirect and login

5. **Deploy to Production**
   - Update production environment variables
   - Ensure X callback URI is registered in X Developer Portal for production domain
   - Test end-to-end authentication flow

## Troubleshooting

### X button not appearing
- Check imports: Should have `X as XIcon`
- Check button JSX: Should reference `XIcon` component
- Clear browser cache

### OAuth flow not initiating
- Check `NEXT_PUBLIC_X_CLIENT_ID` is set in `.env.local`
- Check browser console for errors
- Verify X app is configured correctly in developer portal

### Callback page shows error
- Check backend is receiving authorization code
- Verify redirect URI matches exactly in X app settings
- Check backend `/api/v1/user/social-auth/twitter/callback` endpoint exists
- Inspect backend logs for detailed error messages

### User not logged in after OAuth
- Check token extraction logic in callback page
- Verify backend response includes `access_token` and `user` in `data` object
- Check `useAuth().login()` function is working correctly

### "Provider not found" error
- Backend likely expects different provider name
- May need to use `x` instead of `twitter` or vice versa
- Check API schema or backend documentation for correct value
