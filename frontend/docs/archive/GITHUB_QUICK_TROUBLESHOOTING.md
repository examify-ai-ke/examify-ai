# GitHub Sign-In Troubleshooting Flow

## When You See "Invalid GitHub token: 401 - Bad credentials"

```
User clicks GitHub Sign-In
         ↓
GitHub asks for permission
         ↓
User clicks "Authorize"
         ↓
Frontend receives authorization code ✅
         ↓
Frontend sends code to backend ✅
         ↓
Backend receives code ✅
         ↓
Backend tries to exchange code with GitHub ❌ FAILS HERE
         ↓
Backend returns error: "Invalid GitHub token"
         ↓
Frontend shows error message
```

---

## Most Common Cause

**Backend Client Secret is WRONG**

### How to Fix (3 Steps)

**Step 1:** Go to GitHub App Settings
```
github.com → Settings → Developer settings → OAuth Apps → Your App
```

**Step 2:** Generate NEW Client Secret
- Click "Generate a new client secret"
- Copy the new secret (don't use old one)

**Step 3:** Update Backend
- Open backend `.env` file
- Find: `GITHUB_CLIENT_SECRET=`
- Replace with new secret from Step 2
- Save file
- **Restart backend server**

---

## If That Doesn't Work

### Cause #2: Code Expired

Authorization codes only last **10 minutes** and are **single-use**.

**Fix:**
1. Clear browser cache: `Ctrl+Shift+Delete`
2. Open incognito/private window
3. Try sign-in again
4. Complete within 2-3 minutes

---

### Cause #3: Redirect URI Wrong

GitHub must have exact callback URL.

**Verify in GitHub App Settings:**
- Authorization callback URL: `http://localhost:3000/auth/callback/github`
- Must be exact match (no trailing slash, case-sensitive)

---

## How to Tell What's Wrong

### Open Browser Console (F12)

Look for this error message:
```
💡 Debug hint: GitHub returned invalid credentials
   1. Authorization code may have expired (10 min limit)
   2. Code may have already been used (single-use)
   3. Try fresh authentication in incognito window
```

**This tells you:** Code issue (expired or reused)

**Solution:** Try fresh sign-in in incognito window

---

## What Each Config Does

```
Frontend (.env.local):
├─ NEXT_PUBLIC_GITHUB_CLIENT_ID → Tells GitHub who you are
└─ NEXT_PUBLIC_API_URL → Where to send code for exchange

Backend (.env):
├─ GITHUB_CLIENT_ID → Confirms identity with GitHub
└─ GITHUB_CLIENT_SECRET → Proves backend identity to GitHub
```

**All 4 values must be correct for sign-in to work.**

---

## Quick Checklist

- [ ] Have GitHub Client ID: `06aca3f90393e582db1c`
- [ ] Generated NEW Client Secret from GitHub app
- [ ] Updated backend `.env` with new secret
- [ ] Restarted backend server
- [ ] Cleared browser cache
- [ ] Tried in incognito window
- [ ] Waited less than 10 minutes since auth started
- [ ] Checked browser console for error details

---

## If None of That Works

**Tell your backend developer:**

1. "Please regenerate the GitHub Client Secret in the app settings"
2. "Please update the backend `.env` with the new Client Secret"  
3. "Please restart the backend server"
4. "Please check backend logs for the exact error from GitHub API"

Then try fresh sign-in.

---

## Detailed Reference

See these files for more details:

- `GITHUB_SIGNIN_VERIFICATION.md` - Complete verification guide
- `NO_TOKEN_FROM_GITHUB_FIX.md` - Detailed fix for backend issues
- `GITHUB_OAUTH_BACKEND_TROUBLESHOOTING.md` - For developers

