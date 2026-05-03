# "No token received from GitHub" - Quick Fix Guide

## The Error
```
Backend error: Internal server error during authentication: 400: No token received from GitHub
```

## What This Means
Your backend's GitHub OAuth endpoint is not successfully exchanging the authorization code with GitHub's API. The code reaches your backend, but the exchange with GitHub fails.

## Quick Checklist (Do These First)

### 1. Verify GitHub App Credentials
- [ ] Go to GitHub.com → Settings → Developer settings → OAuth Apps
- [ ] Click your app
- [ ] Copy **Client ID**: Should match `NEXT_PUBLIC_GITHUB_CLIENT_ID` in frontend `.env.local`
- [ ] Copy **Client Secret**: Should match backend `.env` `GITHUB_CLIENT_SECRET`
- [ ] Check **Authorization callback URL**: Must be `http://localhost:3000/auth/callback/github` (for local dev)

### 2. Check Backend Environment
```bash
# In your backend .env file:
GITHUB_CLIENT_ID=06aca3f90393e582db1c
GITHUB_CLIENT_SECRET=35b03858d7c0fc9e81db66faba6c1b02b8b1b0b4
```

**Critical**: Client Secret must match EXACTLY. Go to GitHub app settings and verify character-by-character.

### 3. Get Fresh Authorization Code
- [ ] Clear browser cache: Ctrl+Shift+Delete
- [ ] Use incognito window
- [ ] Click GitHub login again (codes expire in 10 minutes and are single-use)

### 4. Check Browser Console Logs
Open DevTools (F12) → Console and look for:

```
📋 Request body: { code: "gho_...", redirect_uri: "http://localhost:3000/auth/callback/github" }
📋 Backend response: { error: { message: "No token received from GitHub" } }
💡 Debug hint: Backend did not receive token from GitHub
   1. Check backend GITHUB_CLIENT_SECRET in .env
   2. Verify redirect_uri matches exactly
   3. Check GitHub app Client ID/Secret are correct
   4. See GITHUB_OAUTH_BACKEND_TROUBLESHOOTING.md for more
```

## Testing Backend Directly

Get a fresh code from the console logs, then test your backend:

```bash
curl -X POST "http://localhost:8000/api/v1/user/social-auth/github/callback" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "gho_16C7e42F292c6912E7710c838347Ae178B4a",
    "redirect_uri": "http://localhost:3000/auth/callback/github"
  }'
```

**If this fails**: Your backend is the issue.
**If this works**: Frontend is the issue.

## Common Causes & Solutions

| Issue | How to Check | Fix |
|-------|-------------|-----|
| Wrong Client Secret | GitHub settings vs backend .env | Copy exact value from GitHub |
| Redirect URI mismatch | GitHub app settings | Add exact: `http://localhost:3000/auth/callback/github` |
| Code expired | Took >10 minutes since auth | Try fresh auth in new incognito window |
| Code reused | Tried same code twice | Can only use once, get fresh code |
| Network blocked | Backend logs show timeout | Check firewall, proxy settings |
| Backend crashed | Backend logs show error | Check backend error logs |

## Backend Implementation

Your backend must:

1. **Receive**: Authorization code + redirect_uri from frontend
2. **Exchange**: Code with GitHub API for access token
3. **Verify**: Got valid access token back
4. **Fetch**: User info from GitHub API using token
5. **Create/Update**: User in your database
6. **Generate**: JWT token for frontend
7. **Return**: Response with user + JWT token

If any step fails, you get this error.

## Detailed Troubleshooting

### Step 1: Check Backend Logs
Run your backend with debug logging and watch the logs while authenticating.

Look for these messages:
```
✅ Received GitHub code exchange request
✅ Exchanging code with GitHub API...
✅ GitHub response status: 200
✅ Successfully extracted access_token
✅ Fetched user info from GitHub
✅ Created/updated user in database
✅ Generated JWT token
✅ Returning authenticated response
```

If you don't see these, backend is failing.

### Step 2: Test GitHub API Directly
```bash
# Test token exchange with GitHub
curl -X POST https://github.com/login/oauth/access_token \
  -H "Accept: application/json" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "code=YOUR_CODE" \
  -d "redirect_uri=http://localhost:3000/auth/callback/github"
```

Should return:
```json
{
  "access_token": "ghu_...",
  "token_type": "bearer",
  "scope": "read:user,user:email"
}
```

If this fails, it's a GitHub credentials issue.

### Step 3: Check Expected Backend Response
Your backend should return:

```json
{
  "message": "Authentication successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "user": {
      "id": 123,
      "email": "user@github.com"
    }
  }
}
```

## For Developers

If implementing GitHub OAuth backend, ensure:

```python
@router.post("/social-auth/github/callback")
async def github_callback(code: str, redirect_uri: str):
    # 1. Exchange code with GitHub
    token_response = requests.post(
        "https://github.com/login/oauth/access_token",
        headers={"Accept": "application/json"},
        data={
            "client_id": settings.GITHUB_CLIENT_ID,
            "client_secret": settings.GITHUB_CLIENT_SECRET,  # ← CRITICAL
            "code": code,
            "redirect_uri": redirect_uri  # ← Must match exactly
        }
    )
    
    # 2. Extract access token
    tokens = token_response.json()
    access_token = tokens.get("access_token")
    
    if not access_token:
        raise Exception("No token received from GitHub")  # ← This is your error
    
    # 3. Get user info and create JWT
    # ... rest of implementation
```

## Need More Help?

See: `GITHUB_OAUTH_BACKEND_TROUBLESHOOTING.md` for comprehensive guide.

