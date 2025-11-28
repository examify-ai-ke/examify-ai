# Institution Logo Upload Fix

## Issue
The institution edit page had a syntax error causing build failure and the logo upload was not working correctly due to FormData handling issues.

## Changes Made

### 1. Fixed Syntax Error (Line 958)
**Problem**: Missing closing parenthesis in Button component JSX
**Solution**: Added proper closing tags for the Button component

### 2. Updated Logo Upload Implementation
**Problem**: 
- openapi-fetch client was setting `Content-Type: application/json` for all requests
- FormData uploads require `multipart/form-data` with boundary
- This caused 422 Unprocessable Entity errors

**Solution**: 
- Changed from openapi-fetch to direct `fetch` API for FormData uploads
- Let browser automatically set correct `Content-Type` with boundary
- Applied same fix to all image upload endpoints (faculty, department, programme, course)
- Logo upload now uses a separate endpoint from the institution update endpoint
- Immediate upload on file selection for better UX

### 3. Removed Duplicate Code
- Removed duplicate `handleLogoUpload` function
- Consolidated logo upload logic into single `uploadLogo` function

## API Details

### Endpoint
```
POST /api/v1/institution/{institution_id}/logo
```

### Request Body (multipart/form-data)
```typescript
{
  institution_logo: File,  // Required - the logo image file
  title?: string,          // Optional - title for the logo
  description?: string     // Optional - description for the logo
}
```

### Implementation in api-admin.ts
```typescript
async uploadLogo(institutionId: string, formData: FormData) {
    try {
        // Get auth token
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
        
        // Get base URL
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://fastapi.localhost';

        // Use direct fetch for FormData upload (openapi-fetch doesn't handle multipart/form-data correctly)
        const response = await fetch(`${baseUrl}/api/v1/institution/${institutionId}/logo`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                // Don't set Content-Type - let browser set it with boundary
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                data: undefined,
                error: errorData,
                response: response as any
            };
        }

        const data = await response.json();
        return {
            data,
            error: undefined,
            response: response as any
        };
    } catch (error) {
        console.error('Institution logo upload error:', error);
        return {
            data: undefined,
            error: error,
            response: undefined as any
        };
    }
}
```

## How It Works

1. User selects a logo file via file input
2. File is validated (type and size)
3. Preview is generated immediately
4. Logo is uploaded to the server via the dedicated endpoint using direct fetch
5. Server response updates the institution's logo
6. UI reflects the new logo

## File Validation
- **Allowed types**: JPEG, PNG, WebP, GIF
- **Max size**: 5MB
- **Recommended size**: 400x400px

## Technical Notes

### Why Direct Fetch Instead of openapi-fetch?
The openapi-fetch client sets `Content-Type: application/json` for all requests in the middleware. For FormData uploads, the browser needs to:
1. Set `Content-Type: multipart/form-data`
2. Add a boundary parameter (e.g., `boundary=----WebKitFormBoundary...`)

When we manually set Content-Type, we can't easily generate the correct boundary. By omitting the Content-Type header entirely, the browser automatically handles both.

### Other Image Uploads Fixed
Applied the same fix to:
- Faculty image upload
- Department image upload  
- Programme image upload
- Course image upload
- Question image upload (already using direct fetch)

## Testing
- Build now completes successfully
- No TypeScript errors
- Logo upload uses correct API endpoint and field names
- FormData is properly sent with multipart/form-data content type
