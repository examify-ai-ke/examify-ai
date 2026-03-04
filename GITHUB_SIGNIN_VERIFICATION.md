# GitHub OAuth Sign-in Verification Checklist

## Quick Verification Steps

### Step 1: Verify GitHub App Settings
1. Go to **GitHub.com** → Click profile icon (top right) → **Settings**
2. Click **Developer settings** (left sidebar)
3. Click **OAuth Apps**
4. Click your app (or create one if needed)

**Copy and verify these values:**

```
Client ID: ________________________  (should be: 06aca3f90393e582db1c)
Client Secret: ____________________  (keep this secret!)
```

**Check Authorization callback URL:**
- [ ] Must be: `http://localhost:3000/auth/callback/github`
- [ ] No trailing slash
- [ ] Case-sensitive
- [ ] Exact match matters!

---

### Step 2: Verify Frontend Configuration
**File: `.env.local`**

```
NEXT_PUBLIC_GITHUB_CLIENT_ID=06aca3f90393e582db1c
NEXT_PUBLIC_API_URL=http://fastapi.localhost
```

Check:
- [ ] `NEXT_PUBLIC_GITHUB_CLIENT_ID` matches GitHub app Client ID
- [ ] Value is correct: `06aca3f90393e582db1c`

---

### Step 3: Verify Backend Configuration
**File: Backend `.env` (NOT `.env.local`)**

```
GITHUB_CLIENT_ID=06aca3f90393e582db1c
GITHUB_CLIENT_SECRET=________________________________
```

**Critical Steps:**
1. Go to your GitHub app settings
2. Click **"Generate a new client secret"** (if you haven't done this recently)
3. Copy the **NEW** secret (old ones may not work)
4. Paste into backend `.env`
5. **Restart your backend server** (important!)

Check:
- [ ] Client ID matches: `06aca3f90393e582db1c`
- [ ] Client Secret copied from GitHub app settings
- [ ] No extra spaces before/after
- [ ] Backend server restarted after updating

---

### Step 4: Test Fresh Authentication

**Clear everything and try fresh:**

1. **Clear browser cache**
   - Press `Ctrl+Shift+Delete` (Windows/Linux) or `Cmd+Shift+Delete` (Mac)
   - Select "All time"
   - Clear cookies and cached images

2. **Use incognito/private window**
   - Open new incognito/private window
   - Go to your app
   - Try GitHub sign-in

3. **Check you have fresh code**
   - Every authentication attempt should generate NEW code
   - Codes expire after 10 minutes
   - Can only be used once

---

### Step 5: Verify API URL Configuration

**Frontend `.env.local`:**
```
NEXT_PUBLIC_API_URL=http://fastapi.localhost
```

**Make sure:**
- [ ] Backend is running on correct port
- [ ] `http://fastapi.localhost` or `http://localhost:8000` (whichever your backend uses)
- [ ] Backend is accessible from frontend
- [ ] CORS is configured correctly

---

## What Each Piece Does

| Component | Purpose | Example |
|-----------|---------|---------|
| **Frontend Client ID** | Tells GitHub who's asking for permission | `06aca3f90393e582db1c` |
| **Redirect URI** | Where GitHub sends user back after auth | `http://localhost:3000/auth/callback/github` |
| **Backend Client ID** | Backend confirms identity | `06aca3f90393e582db1c` |
| **Backend Client Secret** | Backend proves identity to GitHub | `secret_key_here` |
| **Auth Code** | Single-use ticket from GitHub | Generated during auth, valid 10 min |

---

## Troubleshooting the "Invalid GitHub token" Error

### If you see: "Invalid GitHub token: 401 - Bad credentials"

This means GitHub rejected the credentials when backend tried to exchange the code.

**Check in this order:**

1. **Backend Client Secret is wrong**
   - [ ] Go to GitHub app settings
   - [ ] Generate NEW client secret (don't use old one)
   - [ ] Copy exact value
   - [ ] Update backend `.env`
   - [ ] Restart backend
   - [ ] Try again

2. **Authorization code expired**
   - [ ] Did you wait too long? (codes expire in 10 minutes)
   - [ ] Try fresh sign-in in incognito window
   - [ ] Complete within 2-3 minutes

3. **Authorization code already used**
   - [ ] Did you try same code twice?
   - [ ] Each code can only be used once
   - [ ] Try fresh sign-in

4. **Redirect URI mismatch**
   - [ ] Check GitHub app "Authorization callback URL"
   - [ ] Must be: `http://localhost:3000/auth/callback/github`
   - [ ] No extra spaces, exact match required

---

## Testing Step-by-Step

### Test 1: Verify GitHub App is Correct
```
Go to GitHub.com → Settings → Developer settings → OAuth Apps → Your App
Look for:
- Client ID displayed
- Can you see Client Secret? (may be hidden)
- Authorization callback URL listed
```

### Test 2: Verify Backend Credentials
```bash
# Check backend .env file has:
cat .env | grep GITHUB

# Should show:
GITHUB_CLIENT_ID=06aca3f90393e582db1c
GITHUB_CLIENT_SECRET=value_from_github_app
```

### Test 3: Try Fresh Sign-In
```
1. Clear browser cache (Ctrl+Shift+Delete)
2. Open incognito window
3. Go to http://localhost:3000/auth/login
4. Click GitHub button
5. Authorize on GitHub
6. Check browser console (F12) for logs
```

### Test 4: Check Console Logs
Open DevTools (F12) → Console tab and look for:

**Success logs:**
```
📋 Request body: { code: "gho_...", redirect_uri: "..." }
📋 Backend response: { message: "Authentication successful" }
✅ Authentication response: { ... }
```

**Error logs:**
```
❌ Backend error object: { detail: "..." }
💡 Debug hint: GitHub returned invalid credentials
   1. Authorization code may have expired (10 min limit)
   2. Code may have already been used (single-use)
   3. Try fresh authentication in incognito window
```

---

## Final Checklist - Do These Before Asking for Help

- [ ] Visited GitHub app settings page
- [ ] Confirmed Client ID: `06aca3f90393e582db1c`
- [ ] Confirmed Redirect URL: `http://localhost:3000/auth/callback/github`
- [ ] Generated NEW Client Secret from GitHub app
- [ ] Updated backend `.env` with new Client Secret
- [ ] Restarted backend server
- [ ] Cleared browser cache
- [ ] Tried fresh sign-in in incognito window
- [ ] Checked browser console for detailed logs
- [ ] Tried within 10 minutes of authorization

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Invalid GitHub token" | Generate new Client Secret in GitHub app, update backend, restart |
| Code expired error | Clear cache, use incognito, complete within 10 minutes |
| Code already used | Can't reuse code, must get fresh code from new auth attempt |
| Redirect URI error | Check GitHub app settings has exact: `http://localhost:3000/auth/callback/github` |
| Backend can't reach GitHub | Check firewall, proxy settings, network connectivity |
| Still not working | Check backend logs (see next section) |

---

## If Still Not Working - Check Backend Logs

Ask your backend developer to check these logs:

```
✅ Received GitHub code exchange request
✅ Exchanging code with GitHub API...
✅ GitHub response status: 200 (or error code)
✅ GitHub response body: { ... }
✅ Successfully extracted access_token
✅ Fetched user info from GitHub
✅ Created/updated user in database
✅ Generated JWT token
✅ Returning authenticated response
```

If any step shows error, that's where the issue is.

---

## Questions to Ask Your Backend Developer

1. "Can you confirm the GitHub Client Secret in `.env` is correct?"
2. "Can you check if backend logs show successful token exchange with GitHub?"
3. "Is the backend at the correct URL and accessible from frontend?"
4. "Can you test the GitHub token exchange endpoint directly with curl?"

---

## Summary

To fix "Invalid GitHub token" error:

1. **Get new Client Secret from GitHub** ← Usually the issue
2. **Update backend .env** with the new secret
3. **Restart backend server**
4. **Try fresh sign-in** in incognito window
5. **Check browser console** for detailed error messages

That should fix it! 🚀

