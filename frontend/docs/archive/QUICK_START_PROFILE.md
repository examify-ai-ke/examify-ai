# Profile Page - Quick Start Guide

## 🚀 Quick Start

### Access Profile Page
```
URL: http://localhost:3000/dashboard/profile
```

### Edit Profile
1. Click **"Edit Profile"** button
2. Make changes to any field
3. **Changes auto-save automatically** (no save button needed!)
4. Watch for **"Auto-saved"** indicator in header
5. Click **"Done"** when finished

### Change Password
1. Click **"Change"** button in Account Settings
2. Enter current password
3. Enter new password (minimum 8 characters)
4. Confirm new password
5. Click **"Change Password"**
6. Success message appears

## 🔍 Verify It's Working

### Check Autosave
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Edit a field
4. Look for logs:
   - `Auto-saving profile with data: {...}`
   - `Auto-save response: {...}`
5. After 2 seconds, you should see "Auto-saved" indicator

### Check Network
1. Open DevTools (F12)
2. Go to **Network** tab
3. Edit a field
4. Look for **PUT** request to `/api/v1/user`
5. Check response status (should be 200)

### Verify Persistence
1. Edit a field
2. Wait for "Auto-saved" indicator
3. Refresh the page (F5)
4. Changes should still be there

## ⚙️ Configuration

### Autosave Delay
To change autosave delay (currently 2 seconds):

In `src/app/dashboard/profile/page.tsx`, find:
```typescript
autoSaveTimeoutRef.current = setTimeout(() => {
    handleAutoSave({...});
}, 2000);  // ← Change this number (in milliseconds)
```

Examples:
- `1000` = 1 second
- `3000` = 3 seconds
- `5000` = 5 seconds

## 🐛 Common Issues

### "Auto-saving..." but never completes
- Check if backend server is running
- Check network tab for errors
- Verify auth token is valid

### Changes don't save
- Check browser console for errors
- Verify API endpoint is correct
- Check if user has permission to update

### Password change fails
- Verify current password is correct
- Check new password is at least 8 characters
- Verify passwords match

## 📊 API Endpoints

### Update Profile
```
PUT /api/v1/user
Content-Type: application/json
Authorization: Bearer {token}

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "state": "CA",
  "country": "USA"
}
```

### Change Password
```
POST /api/v1/login/change_password
Content-Type: application/json
Authorization: Bearer {token}

{
  "current_password": "oldpassword123",
  "new_password": "newpassword456"
}
```

## 🎯 Features

✅ Autosave (2 second delay)
✅ Real-time validation
✅ Error handling
✅ Success notifications
✅ Password change
✅ Responsive design
✅ Mobile-friendly
✅ Accessibility support

## 📱 Mobile Testing

The profile page is fully responsive:
- Works on phones (320px+)
- Works on tablets (768px+)
- Works on desktops (1024px+)

Test on mobile:
1. Open DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Select device or custom size
4. Test all features

## 🔐 Security Notes

- All API calls use authentication token
- Password changes use separate endpoint
- Sensitive data not logged
- CSRF protection enabled
- Input validation on frontend and backend

## 📞 Need Help?

1. Check browser console (F12 → Console)
2. Check network tab (F12 → Network)
3. Read PROFILE_UPDATE_TROUBLESHOOTING.md
4. Check backend server logs

## 🎓 Learning Resources

- **PROFILE_PAGE_IMPLEMENTATION.md** - Full implementation details
- **PROFILE_PAGE_AUTOSAVE_UPDATE.md** - Autosave feature details
- **PROFILE_UPDATE_TROUBLESHOOTING.md** - Debugging guide
- **PROFILE_PAGE_FINAL_SUMMARY.md** - Complete summary

---

**That's it!** Your profile page is ready to use. 🎉
