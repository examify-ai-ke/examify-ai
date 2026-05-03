# Google OAuth Implementation

## Overview

Implemented Google Social Authentication that integrates with your backend API endpoint `/api/v1/user/social-auth/google`.

## Files Created/Modified

### New Files

1. **`src/lib/social-auth.ts`**
   - Social authentication utilities
   - `redirectToGoogleAuth()` - Initiates Google OAuth flow
   - `exchangeGoogleCode()` - Exchanges authorization code for tokens via backend
   - `loginWithGoogle()` - Complete authentication flow (popup version)

2. **`src/app/(public)/auth/callback/google/page.tsx`**
   - Google OAuth callback handler
   - Receives authorization code from Google
   - Exchanges code with backend
   - Stores authentication token
   - Redirects to dashboard or original destination

### Modified Files

1. **`src/app/(public)/auth/login/page.tsx`**
   - Added Google login button functionality
   - Integrated `redirectToGoogleAuth()` function
   - Button triggers OAuth flow on click

2. **`.env.local`**
   - Added `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (required for browser)
   - Updated `GOOGLE_CLIENT_SECRET` (for backend)

3. **`.env.local.example`**
   - Documented Google OAuth configuration
   - Added setup instructions

## How It Works

### Authentication Flow

```
1. User clicks "Google" button on login page
   ↓
2. Frontend redirects to Google OAuth consent screen
   ↓
3. User authorizes the application
   ↓
4. Google redirects to: /auth/callback/google?code=xxx&state=yyy
   ↓
5. Callback page extracts authorization code
   ↓
6. Frontend sends code to backend: POST /api/v1/user/social-auth/google
   ↓
7. Backend exchanges code with Google for user info
   ↓
8. Backend creates/updates user and returns JWT token
   ↓
9. Frontend stores token and redirects to dashboard
```

### Key Components

**Frontend (Next.js)**:
- Initiates OAuth flow
- Handles callback
- Stores authentication token

**Backend (FastAPI)**:
- Exchanges authorization code with Google
- Validates user information
- Creates/updates user account
- Returns JWT token

## Configuration

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to **APIs & Services** > **Credentials**
5. Click **Create Credentials** > **OAuth 2.0 Client ID**
6. Configure OAuth consent screen if not done
7. Choose **Web application**
8. Add **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://your-production-domain.com
   ```
9. Add **Authorized redirect URIs**:
   ```
   http://localhost:3000/auth/callback/google
   https://your-production-domain.com/auth/callback/google
   ```
10. Copy **Client ID** and **Client Secret**

### 2. Environment Variables

Update `.env.local`:

```env
# Frontend (browser-accessible)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here

# Backend (server-only)
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

**Important**: 
- `NEXT_PUBLIC_` prefix makes the variable available in the browser
- Client Secret should NEVER be exposed to the browser
- The backend needs both values to complete the OAuth flow

### 3. Backend Configuration

Ensure your backend API endpoint is configured:
- Endpoint: `POST /api/v1/user/social-auth/{provider}`
- Provider: `google`
- Request body: Authorization code (string)
- Response: JWT token

## Usage

### Login Page

The Google button is already integrated:

```typescript
<Button 
    variant="outline" 
    className="w-full"
    type="button"
    onClick={() => handleGoogleLogin()}
>
    <Chrome className="mr-2 h-4 w-4" />
    Google
</Button>
```

### Programmatic Usage

```typescript
import { redirectToGoogleAuth } from '@/lib/social-auth';

// Redirect to Google OAuth
redirectToGoogleAuth('/dashboard'); // Optional redirect URL
```

## Security Features

1. **State Parameter**: Preserves redirect URL through OAuth flow
2. **HTTPS Only in Production**: OAuth requires HTTPS for production
3. **Token Storage**: 
   - LocalStorage for client-side access
   - HTTP-only cookie for SSR (optional)
4. **Error Handling**: Comprehensive error messages and fallbacks
5. **CSRF Protection**: State parameter prevents CSRF attacks

## Testing

### Development Testing

1. Start your backend API:
   ```bash
   # Make sure backend is running
   docker-compose up
   ```

2. Start Next.js development server:
   ```bash
   npm run dev
   ```

3. Navigate to: `http://localhost:3000/auth/login`

4. Click the "Google" button

5. You should be redirected to Google's consent screen

6. After authorization, you'll be redirected back and logged in

### Troubleshooting

**"Popup blocked" error**:
- The implementation uses full-page redirect (not popup)
- No popup blockers should interfere

**"Redirect URI mismatch" error**:
- Verify the redirect URI in Google Console matches exactly:
  `http://localhost:3000/auth/callback/google`
- Check for trailing slashes
- Ensure protocol (http/https) matches

**"Invalid client" error**:
- Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set correctly
- Check that the Client ID matches your Google Console project

**"No token received" error**:
- Check backend logs
- Verify backend endpoint is working
- Ensure `GOOGLE_CLIENT_SECRET` is set on backend

**Token not persisting**:
- Check browser console for errors
- Verify localStorage is enabled
- Check cookie settings

## API Response Format

The backend should return a response in one of these formats:

```typescript
// Format 1 (preferred)
{
  "data": {
    "access_token": "jwt-token-here",
    "token_type": "bearer"
  }
}

// Format 2
{
  "access_token": "jwt-token-here",
  "token_type": "bearer"
}

// Format 3
{
  "token": "jwt-token-here"
}
```

The callback page handles all three formats automatically.

## Future Enhancements

1. **GitHub OAuth**: Similar implementation for GitHub
2. **Remember Me**: Optional persistent sessions
3. **Account Linking**: Link Google account to existing email account
4. **Profile Sync**: Sync profile picture from Google
5. **Refresh Tokens**: Implement token refresh flow
6. **Popup Mode**: Alternative popup-based flow (less disruptive)

## Production Checklist

- [ ] Update Google Console with production redirect URIs
- [ ] Set production environment variables
- [ ] Enable HTTPS on your domain
- [ ] Test OAuth flow in production
- [ ] Monitor authentication logs
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure rate limiting on backend
- [ ] Add analytics tracking for social logins

## Support

For issues or questions:
1. Check browser console for errors
2. Check backend API logs
3. Verify Google Console configuration
4. Test with a different Google account
5. Clear browser cache and cookies
