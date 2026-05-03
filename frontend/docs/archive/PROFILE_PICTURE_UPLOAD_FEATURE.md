# Profile Picture Upload Feature Implementation

## Overview
Added profile picture upload functionality to both the public user profile page (`/profile`) and the admin dashboard profile page (`/dashboard/profile`).

## Changes Made

### 1. Public Profile Page (`src/app/(public)/profile/page.tsx`)

#### Added State Variables:
- `isUploadingAvatar`: Tracks upload progress
- `fileInputRef`: Reference to hidden file input element

#### New Functions:
- `handleAvatarClick()`: Triggers file input when camera button is clicked
- `handleAvatarUpload()`: Handles the file upload process with validation

#### Features:
- File type validation (images only)
- File size validation (max 5MB)
- Loading spinner during upload
- Success/error notifications
- Automatic user data refresh after upload
- Hidden file input with camera button trigger
- Direct fetch API for proper multipart/form-data handling

### 2. Dashboard Profile Page (`src/app/dashboard/profile/page.tsx`)

#### Added State Variables:
- `isUploadingAvatar`: Tracks upload progress
- `fileInputRef`: Reference to hidden file input element

#### New Functions:
- `handleAvatarClick()`: Triggers file input when camera button is clicked
- `handleAvatarUpload()`: Handles the file upload process with validation

#### Features:
- File type validation (images only)
- File size validation (max 5MB)
- Loading spinner during upload
- Success/error notifications
- Automatic user data refresh after upload
- Hidden file input with camera button trigger
- Direct fetch API for proper multipart/form-data handling

## API Integration

Both implementations use the `/api/v1/user/image` POST endpoint to upload profile pictures.

### Important Technical Note:
The upload uses direct `fetch` API instead of the openapi-fetch client because FormData requires special handling. The browser must set the `Content-Type` header automatically (including the multipart boundary), so we don't set it manually.

### Request Format:
```typescript
FormData with 'image_file' field containing the image file
```

### Headers:
```typescript
{
  'Authorization': `Bearer ${token}`,
  // Content-Type is NOT set - browser sets it automatically with boundary
}
```

### Response:
Returns updated user data with new `avatar_url`

## User Experience

### How It Works:
1. User clicks "Edit Profile" button
2. Camera icon button appears on avatar
3. User clicks camera button
4. File picker opens
5. User selects an image
6. Image is validated (type and size)
7. Upload progress shown with spinner
8. Success notification displayed
9. Avatar updates immediately with new image

### Validation:
- **File Type**: Only image files accepted (image/*)
- **File Size**: Maximum 5MB
- **Error Handling**: Clear error messages for validation failures

### Visual Feedback:
- Camera button only visible in edit mode
- Loading spinner replaces camera icon during upload
- Toast notifications for success/error states
- Immediate avatar update on success

## Technical Details

### File Input:
- Hidden input element (`display: none`)
- Triggered programmatically via ref
- Accepts only image files (`accept="image/*"`)
- Value reset after upload to allow re-uploading same file

### Upload Process:
1. File validation (type and size)
2. Create FormData with file
3. Use direct fetch (not openapi-fetch) for proper multipart handling
4. POST to `/api/v1/user/image` with Authorization header
5. Handle response/errors
6. Update auth store with new user data
7. Show notification
8. Reset file input

### Why Direct Fetch?
FormData uploads require special handling where the browser automatically sets the `Content-Type` header with the multipart boundary. Using the openapi-fetch client can interfere with this, so we use direct `fetch` API following the same pattern used for question image uploads in the codebase.

### Error Handling:
- Invalid file type → Error notification
- File too large → Error notification
- API error → Error notification with details
- Network error → Generic error notification

## Benefits

1. **User-Friendly**: Simple click-to-upload interface
2. **Secure**: Server-side validation and authentication
3. **Responsive**: Immediate visual feedback
4. **Consistent**: Same implementation on both profile pages
5. **Validated**: Client-side validation before upload
6. **Accessible**: Proper button states and loading indicators
7. **Reliable**: Uses proven fetch pattern for multipart uploads

## Testing Checklist

- [x] Upload valid image file (JPG, PNG, GIF, etc.)
- [x] Try uploading non-image file (should show error)
- [x] Try uploading file > 5MB (should show error)
- [x] Verify loading spinner appears during upload
- [x] Verify success notification appears
- [x] Verify avatar updates immediately
- [x] Test on both `/profile` and `/dashboard/profile`
- [ ] Test with different image sizes and formats
- [ ] Verify error handling for network failures
- [x] Verify camera button only appears in edit mode
- [x] Fixed 422 error by using direct fetch API

## Troubleshooting

### 422 Unprocessable Entity Error
**Problem**: Getting 422 error when uploading
**Solution**: Use direct `fetch` API instead of openapi-fetch client. The browser needs to set the Content-Type header automatically with the multipart boundary.

### Avatar Not Updating/Displaying
**Problem**: Upload succeeds but avatar doesn't display
**Solution**: The user object structure uses `user.image.media.link` for the avatar URL, not `user.avatar_url`. Ensure you're accessing the correct nested property:
```typescript
// ✅ Correct
<AvatarImage src={user?.image?.media?.link || undefined} />

// ❌ Incorrect
<AvatarImage src={user?.avatar_url} />
```

The API response structure is:
```typescript
{
  data: {
    id: "user-id",
    email: "user@example.com",
    image: {
      media: {
        link: "https://storage.url/path/to/avatar.jpg",
        title: "...",
        description: "...",
        path: "...",
        id: "..."
      }
    },
    ...
  }
}
```

## Future Enhancements

Potential improvements for future iterations:

1. **Image Cropping**: Add image cropper before upload
2. **Preview**: Show preview before confirming upload
3. **Drag & Drop**: Support drag-and-drop file upload
4. **Multiple Formats**: Support for more image formats
5. **Compression**: Client-side image compression before upload
6. **Progress Bar**: Show upload progress percentage
7. **Remove Avatar**: Add option to remove/reset avatar
8. **Default Avatars**: Provide default avatar options

## Related Files

- `src/app/(public)/profile/page.tsx` - Public profile page
- `src/app/dashboard/profile/page.tsx` - Dashboard profile page
- `src/types/generated/api.ts` - API type definitions
- `src/lib/api.ts` - API client configuration
- `src/lib/api-admin.ts` - Reference implementation for image uploads

## API Endpoint

**Endpoint**: `POST /api/v1/user/image`

**Authentication**: Required (JWT token)

**Content-Type**: `multipart/form-data` (set automatically by browser)

**Request Body**: FormData
- `image_file`: File (image file to upload)
- `title`: string (optional)
- `description`: string (optional)

**Response**: 
```json
{
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "image": {
      "media": {
        "link": "https://storage.url/path/to/avatar.jpg",
        "title": "Profile Picture",
        "description": null,
        "path": "/uploads/avatars/...",
        "id": "media-id"
      }
    },
    ...
  }
}
```

**Important**: The avatar URL is accessed via `user.image.media.link`, not `user.avatar_url`.

## Notes

- Both profile pages now have identical avatar upload functionality
- The feature respects the edit mode - camera button only appears when editing
- File validation happens client-side before upload to save bandwidth
- Server-side validation provides additional security
- Auth store automatically updates with new user data after successful upload
- Uses direct fetch API for proper multipart/form-data handling (same pattern as question image uploads)
