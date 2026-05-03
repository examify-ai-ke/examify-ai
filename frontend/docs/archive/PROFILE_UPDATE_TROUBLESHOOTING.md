# Profile Update Troubleshooting Guide

## Issue: Profile Update Not Working

If the profile update is not working as expected, follow these steps:

### Step 1: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for logs like:
   - `Auto-saving profile with data: {...}`
   - `Auto-save response: {...}`
   - `Auto-save error: {...}`

### Step 2: Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Make a profile change
4. Look for a PUT request to `/api/v1/user`
5. Check the response:
   - **Status 200**: Success - check response body
   - **Status 422**: Validation error - check error details
   - **Status 401**: Unauthorized - token may be expired
   - **Status 500**: Server error - check server logs

### Step 3: Verify API Response Format
The API should return a response like:
```json
{
  "data": {
    "id": "user-id",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "state": "CA",
    "country": "USA",
    ...
  },
  "message": "User updated successfully"
}
```

### Step 4: Check Auth Store Update
After autosave completes:
1. Open DevTools Console
2. Run: `localStorage.getItem('auth-storage')`
3. Check if user data is updated with new values

### Step 5: Verify API Endpoint
The endpoint should be: `PUT /api/v1/user`

Check in `src/types/generated/api.ts`:
```typescript
update_my_user_api_v1_user_put: {
    requestBody: {
        content: {
            "application/json": components["schemas"]["IUserUpdate"];
        };
    };
    responses: {
        200: {
            content: {
                "application/json": components["schemas"]["IPutResponseBase_IUserRead_"];
            };
        };
    };
};
```

## Common Issues and Solutions

### Issue 1: "Auto-saving..." but never completes
**Cause**: API request is hanging or timing out

**Solution**:
1. Check network tab for pending requests
2. Verify backend server is running
3. Check if token is valid (not expired)
4. Look for CORS errors in console

### Issue 2: "Auto-save error" appears
**Cause**: API returned an error

**Solution**:
1. Check the error message in console
2. Common errors:
   - `"Invalid email format"` - Email field has invalid format
   - `"User not found"` - User session expired
   - `"Validation error"` - One or more fields are invalid
3. Fix the invalid field and try again

### Issue 3: Changes don't persist after refresh
**Cause**: Auth store not being updated

**Solution**:
1. Check if `setUser()` is being called
2. Verify API response contains updated user data
3. Check browser console for errors
4. Verify localStorage is not disabled

### Issue 4: Profile shows old data after save
**Cause**: Component not re-rendering with new data

**Solution**:
1. Check if `useAuth()` hook is properly connected
2. Verify auth store is being updated
3. Try refreshing the page
4. Check if there are multiple instances of auth store

## Debug Mode

To enable detailed debugging:

1. Open browser console
2. Add this to the console:
```javascript
// Watch for autosave events
window.addEventListener('autosave', (e) => {
    console.log('Autosave event:', e.detail);
});
```

3. Check logs when making changes

## API Testing with cURL

Test the profile update endpoint directly:

```bash
# Get current user
curl -X GET http://localhost:3000/api/v1/user/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update profile
curl -X PUT http://localhost:3000/api/v1/user \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "state": "CA",
    "country": "USA"
  }'
```

## Backend Verification

If frontend is working but backend isn't updating:

1. Check backend logs for errors
2. Verify database connection
3. Check if user has permission to update profile
4. Verify all required fields are being sent
5. Check for any validation rules on backend

## Performance Issues

If autosave is slow:

1. Check network latency (Network tab)
2. Verify backend response time
3. Check if other requests are blocking
4. Consider increasing autosave delay (currently 2 seconds)

## Still Not Working?

1. Check the full error response in Network tab
2. Look at backend server logs
3. Verify API schema matches expected format
4. Test with a fresh login
5. Clear browser cache and localStorage
6. Try in incognito/private mode

## Contact Support

If you've tried all steps above, provide:
1. Browser console logs
2. Network tab screenshot
3. API response body
4. Backend error logs
5. Steps to reproduce
