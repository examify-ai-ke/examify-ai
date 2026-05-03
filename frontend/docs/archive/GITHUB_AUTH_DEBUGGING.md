# GitHub OAuth Debugging Guide

## Common GitHub OAuth Errors

### Error 1: "Invalid GitHub token: 401 - Bad credentials"
**Cause**: The backend is receiving an invalid token from GitHub.

**Why this happens**:
1. GitHub code was already used (OAuth codes are single-use)
2. Code expired (GitHub codes expire after 10 minutes)
3. Redirect URI doesn't match between frontend and backend
4. GitHub app credentials are misconfigured

**Solutions**:
1. Check that redirect URIs match exactly:
   - Frontend: `${window.location.origin}/auth/callback/github` 
   - GitHub App Settings: Add `http://localhost:3000/auth/callback/github` for dev
   - GitHub App Settings: Add `https://yourdomain.com/auth/callback/github` for production
2. Ensure fresh authentication (clear browser cache, try incognito)
3. Check GitHub app Client ID and Client Secret are correct in backend `.env`

### Error 2: "No token received from GitHub"
**Cause**: The backend didn't receive the authorization code from the frontend.

**Why this happens**:
1. `code` parameter is null or empty in request body
2. Request body format is incorrect
3. Authorization code wasn't extracted from URL parameters
4. Browser blocked the redirect

**Solutions**:
1. Open DevTools Console and check for logs:
   ```
   🔍 GitHub OAuth callback received { hasCode: true, ... }
   📍 Callback URL: http://localhost:3000/auth/callback/github
   📋 Request body: { code: "gho_...", redirect_uri: "..." }
   ```
2. Verify code is being extracted: Look for `code: "gho_xxxx..."` in logs
3. Check network tab for the backend request - body should have `code` field

### Error 3: "Backend error: {}"
**Cause**: Backend returned an empty error object.

**Why this happens**:
1. Response structure is unexpected
2. Error logging is catching unexpected response format
3. Backend crashed without proper error message

**Solutions**:
1. Check browser console for full response:
   ```
   📋 Backend response: [response object]
   📊 Response structure: [keys from response]
   ```
2. Check backend logs for the actual error
3. Ensure backend returns proper error format:
   ```json
   {
     "error": {
       "message": "Error description",
       "detail": "More details"
     }
   }
   ```

## Debugging Steps

### 1. Check Frontend Logs
Open DevTools Console and look for these logs when clicking GitHub login:

```
🔐 Initiating GitHub OAuth...
// (Redirect to GitHub, user authorizes)
🔍 GitHub OAuth callback received { hasCode: true, hasState: true, hasError: false, ... }
🔄 Exchanging GitHub code for authentication...
📍 Callback URL: http://localhost:3000/auth/callback/github
📋 Request body: { code: "gho_...", redirect_uri: "..." }
📋 Backend response: [object]
📊 Response structure: [keys]
```

If you see `hasCode: false`, the code wasn't extracted from URL.

### 2. Check GitHub App Configuration
Go to GitHub Settings → Developer settings → OAuth Apps:

1. **Client ID**: Verify it matches `NEXT_PUBLIC_GITHUB_CLIENT_ID` in `.env.local`
2. **Redirect URIs**: Must include:
   - `http://localhost:3000/auth/callback/github` (for local dev)
   - `https://yourdomain.com/auth/callback/github` (for production)
3. Click "Update" if you add a new redirect URI

### 3. Test Backend Directly
You can test the backend endpoint directly:

```bash
# First, get a fresh authorization code by going through OAuth flow
# Then copy the code from console logs, then test:

curl -X POST "http://localhost:8000/api/v1/user/social-auth/github/callback" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "gho_xxxxxxxxxxxx",
    "redirect_uri": "http://localhost:3000/auth/callback/github"
  }'
```

Expected response:
```json
{
  "message": "Authentication successful",
  "data": {
    "access_token": "jwt-token-here",
    "token_type": "bearer",
    "user": {
      "id": 123,
      "email": "user@github.com",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

### 4. Check Backend Logs
Look for logs showing:
1. Code received from frontend
2. GitHub API call being made
3. GitHub response status
4. User creation/update
5. JWT token generation

Sample backend logs you should see:
```
INFO: Received GitHub code exchange request
DEBUG: Exchanging GitHub code with GitHub API
DEBUG: GitHub response: { access_token: "...", user: { login: "...", email: "..." } }
INFO: Creating/updating user from GitHub
INFO: Generating JWT token
INFO: Returning authenticated response
```

### 5. Verify Environment Variables
Check both frontend and backend have correct values:

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-client-id-here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend** (`.env`):
```
GITHUB_CLIENT_ID=your-client-id-here
GITHUB_CLIENT_SECRET=your-client-secret-here
```

## Response Structure

The backend returns responses in this format:

```typescript
// Success
{
  "message": "Authentication successful",
  "data": {
    "access_token": "jwt-token-here",
    "token_type": "bearer",
    "refresh_token": "refresh-token-here",
    "user": {
      "id": 123,
      "email": "user@github.com",
      "first_name": "John",
      "last_name": "Doe",
      "provider": "github",
      "provider_user_id": "github-123"
    }
  }
}

// Error
{
  "error": {
    "message": "Failed to exchange code",
    "detail": "Invalid GitHub token: 401 - Bad credentials"
  }
}
```

The frontend callback page extracts:
```typescript
const token = response.data.access_token;
const user = response.data.user;
```

## Common Checklist

- [ ] GitHub app Client ID in `.env.local` matches app settings
- [ ] GitHub app Client Secret in backend `.env` matches app settings  
- [ ] Redirect URI in GitHub app includes: `http://localhost:3000/auth/callback/github`
- [ ] Redirect URI in GitHub app includes production domain for prod
- [ ] Backend endpoint exists: `POST /api/v1/user/social-auth/github/callback`
- [ ] Backend can make requests to GitHub API (no firewall blocking)
- [ ] No CORS issues (check Network tab for failed requests)
- [ ] Browser allows cookies/storage for auth tokens
- [ ] Code isn't being reused (single-use authorization codes)

## GitHub OAuth Flow Diagram

```
1. User clicks GitHub login button
   ↓
2. Frontend redirects to GitHub OAuth endpoint
   ↓
3. GitHub shows authorization dialog
   ↓
4. User authorizes the application
   ↓
5. GitHub redirects to: /auth/callback/github?code=gho_xxx&state=yyy
   ↓
6. Frontend extracts code from URL
   ↓
7. Frontend sends code to backend: POST /api/v1/user/social-auth/github/callback
   ↓
8. Backend exchanges code with GitHub for access token
   ↓
9. Backend fetches user info from GitHub API
   ↓
10. Backend creates/updates user in database
    ↓
11. Backend generates JWT token and returns to frontend
    ↓
12. Frontend stores JWT and redirects to dashboard
```

## Example Working Backend Implementation

```python
@router.post("/social-auth/{provider}/callback")
async def github_callback(
    provider: str,
    code: str = Body(...),
    redirect_uri: str = Body(...),
    db: Session = Depends(get_db)
):
    """Exchange GitHub authorization code for JWT token"""
    
    if provider != "github":
        raise HTTPException(status_code=400, detail="Invalid provider")
    
    try:
        # Exchange code with GitHub
        token_url = "https://github.com/login/oauth/access_token"
        token_data = {
            "client_id": settings.GITHUB_CLIENT_ID,
            "client_secret": settings.GITHUB_CLIENT_SECRET,
            "code": code,
            "redirect_uri": redirect_uri
        }
        
        response = requests.post(
            token_url,
            data=token_data,
            headers={"Accept": "application/json"}
        )
        
        if response.status_code != 200:
            raise Exception(f"GitHub token error: {response.text}")
        
        tokens = response.json()
        access_token = tokens.get("access_token")
        
        if not access_token:
            raise Exception("No token received from GitHub")
        
        # Get user info from GitHub
        headers = {"Authorization": f"Bearer {access_token}"}
        user_response = requests.get(
            "https://api.github.com/user",
            headers=headers
        )
        
        if user_response.status_code != 200:
            raise Exception(f"Invalid GitHub token: {user_response.status_code} - {user_response.text}")
        
        github_user = user_response.json()
        
        # Create or update user
        user = get_or_create_user(
            db=db,
            email=github_user.get("email"),
            provider="github",
            provider_user_id=str(github_user["id"]),
            first_name=github_user.get("name", "").split()[0] if github_user.get("name") else "",
            last_name=github_user.get("name", "").split()[-1] if github_user.get("name") else "",
        )
        
        # Generate JWT
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)
        
        return {
            "message": "Authentication successful",
            "data": {
                "access_token": access_token,
                "token_type": "bearer",
                "refresh_token": refresh_token,
                "user": UserSchema.from_orm(user)
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"GitHub authentication failed: {str(e)}"
        )
```

## Still Having Issues?

1. **Check if the authorization code was used before**: Codes are single-use. If you test multiple times, use fresh codes.
2. **Check GitHub app redirect URI**: Make sure it's exactly `http://localhost:3000/auth/callback/github` (case-sensitive, no trailing slash)
3. **Check backend logs**: Run backend with `--log-level debug` to see detailed OAuth flow
4. **Test with Google OAuth first**: If Google works but GitHub doesn't, issue is likely GitHub-specific
5. **Check firewall/proxy**: Some networks block GitHub API calls

