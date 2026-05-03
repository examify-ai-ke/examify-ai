# Login Gate Dialog Fixes

## Issues Fixed

### 1. Dialog Appearing for Authenticated Users
**Problem**: The "Sign In Required" dialog was appearing even when users were logged in as admin.

**Root Cause**: The authentication state check wasn't properly clearing the dialog state and sessionStorage when users were authenticated.

**Solution**: 
- Added explicit check in `useLoginGate` hook to hide the prompt and clear sessionStorage when user is authenticated
- This ensures that if a user logs in while the dialog is showing, it immediately disappears

### 2. Dialog Cannot Be Closed
**Problem**: Users couldn't close the dialog by clicking outside or using the close button.

**Root Cause**: The `onClose` handler was passed to the dialog but there was no function to actually close the prompt state.

**Solution**:
- Added `closePrompt` function to the `useLoginGate` hook that sets `showLoginPrompt` to `false`
- Updated all pages to use the `closePrompt` function and pass it to the `LoginGateDialog` component
- Increased redirect timeout from 2 seconds to 3 seconds to match the countdown display

## Files Modified

### 1. `src/hooks/useLoginGate.ts`
- Added logic to clear prompt and sessionStorage when user is authenticated
- Added `closePrompt` function to return value
- Increased redirect timeout to 3 seconds

### 2. `src/app/(public)/page.tsx` (Homepage)
- Destructured `closePrompt` from `useLoginGate` hook
- Passed `onClose={closePrompt}` to `LoginGateDialog`

### 3. `src/app/(public)/questions/questions-content.tsx`
- Destructured `closePrompt` from `useLoginGate` hook
- Passed `onClose={closePrompt}` to `LoginGateDialog`

### 4. `src/app/(public)/institutions/institutions-content.tsx`
- Destructured `closePrompt` from `useLoginGate` hook
- Passed `onClose={closePrompt}` to `LoginGateDialog`

### 5. `src/components/public/browse-page-content.tsx` (Exam Papers)
- Destructured `closePrompt` from `useLoginGate` hook
- Passed `onClose={closePrompt}` to `LoginGateDialog`

## How It Works Now

1. **For Authenticated Users**:
   - The hook checks `isAuthenticated` on every render
   - If authenticated, it immediately hides the prompt and clears sessionStorage
   - The dialog never appears for logged-in users

2. **For Non-Authenticated Users**:
   - Page views are tracked in sessionStorage
   - After 3 pages, the dialog appears
   - Users can close the dialog by:
     - Clicking outside the dialog
     - Clicking the X button (if present)
     - The dialog will reappear if they continue browsing
   - After 3 seconds, users are automatically redirected to login

3. **Dialog Behavior**:
   - Shows countdown timer (3 seconds)
   - Provides "Sign In Now" button for immediate login
   - Provides "Create Account" button for registration
   - Can be dismissed by user (but will reappear on next page if still over limit)

## Testing Recommendations

1. Test as non-authenticated user:
   - Browse 3 pages
   - Verify dialog appears on 4th page
   - Verify dialog can be closed
   - Verify redirect happens after 3 seconds

2. Test as authenticated user (admin):
   - Browse multiple pages
   - Verify dialog never appears
   - Verify sessionStorage is cleared

3. Test login during dialog:
   - Trigger dialog as non-authenticated user
   - Log in while dialog is showing
   - Verify dialog disappears immediately after login
