# Avatar Display Issue - Debugging Guide

## Problem
The Avatar component is not displaying user profile pictures even though the code appears correct:
```tsx
<AvatarImage 
  src={user?.image?.media?.link || '/default-avatar-profile-picture-male-icon.png'} 
  alt={`${user?.first_name} ${user?.last_name}` || 'User'} 
/>
```

## Quick Diagnosis Steps

### Step 1: Add the Debug Component

Add the debug component to your profile page temporarily:

```tsx
// In src/app/dashboard/profile/page.tsx or src/app/(public)/profile/page.tsx
import { AvatarDebug } from '@/components/debug/avatar-debug';

// Add this somewhere in your page:
<AvatarDebug />
```

### Step 2: Check Browser Console

Open your browser's developer console and look for:
1. **Image loading errors** - Look for 404, 403, or CORS errors
2. **Console logs** - The debug component logs image load success/failure
3. **Network tab** - Check if the image request is being made and what the response is

### Step 3: Inspect the Image URL

Check what URL is actually being used:
1. Right-click on where the avatar should be
2. Inspect element
3. Look at the `<img>` tag's `src` attribute
4. Copy the URL and try opening it in a new browser tab

## Common Issues and Fixes

### Issue 1: Image URL is Relative (Missing Base URL)

**Symptom:** The image URL is something like `/media/images/abc123.jpg`

**Fix:** Prepend the API base URL:

```tsx
// Create a helper function
const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '/default-avatar-profile-picture-male-icon.png';
  
  // If it's already an absolute URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Otherwise, prepend the API base URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://fastapi.localhost';
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Use it in your Avatar:
<AvatarImage 
  src={getImageUrl(user?.image?.media?.link)} 
  alt={`${user?.first_name} ${user?.last_name}` || 'User'} 
/>
```

### Issue 2: CORS Blocking the Image

**Symptom:** Console shows CORS error like "Access to image blocked by CORS policy"

**Fix:** Add `crossOrigin` attribute:

```tsx
<AvatarImage 
  src={user?.image?.media?.link || '/default-avatar-profile-picture-male-icon.png'} 
  alt={`${user?.first_name} ${user?.last_name}` || 'User'}
  crossOrigin="anonymous"
/>
```

**Backend Fix:** Ensure your FastAPI backend has proper CORS headers:
```python
# In your FastAPI app
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue 3: Wrong Property Path

**Symptom:** The image object structure is different than expected

**Fix:** Check the actual structure in the debug component and adjust:

```tsx
// If the structure is different, adjust accordingly:
// Option 1: Direct link
src={user?.image?.link}

// Option 2: Path instead of link
src={user?.image?.media?.path}

// Option 3: Different nesting
src={user?.profile_image?.url}
```

### Issue 4: Image URL is Double-Encoded

**Symptom:** The URL contains `%2F` instead of `/` or other encoded characters

**Fix:** Decode the URL:

```tsx
const imageUrl = user?.image?.media?.link 
  ? decodeURIComponent(user.image.media.link)
  : '/default-avatar-profile-picture-male-icon.png';

<AvatarImage src={imageUrl} alt="..." />
```

### Issue 5: Radix UI Avatar Not Handling Errors

**Symptom:** The image fails silently without showing fallback

**Fix:** Add explicit error handling:

```tsx
import { useState } from 'react';

const [imageError, setImageError] = useState(false);

<Avatar className="h-8 w-8">
  {!imageError && user?.image?.media?.link ? (
    <AvatarImage 
      src={user.image.media.link}
      alt={`${user?.first_name} ${user?.last_name}` || 'User'}
      onError={() => {
        console.error('Failed to load avatar:', user.image.media.link);
        setImageError(true);
      }}
    />
  ) : null}
  <AvatarFallback className="bg-blue-100 text-blue-600">
    {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
  </AvatarFallback>
</Avatar>
```

### Issue 6: Cache Issues

**Symptom:** Old image shows or no image shows after upload

**Fix:** Add cache-busting parameter:

```tsx
const imageUrl = user?.image?.media?.link 
  ? `${user.image.media.link}?t=${Date.now()}`
  : '/default-avatar-profile-picture-male-icon.png';
```

## Recommended Solution

Create a reusable `UserAvatar` component that handles all edge cases:

```tsx
// src/components/ui/user-avatar.tsx
'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user?: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    image?: {
      media?: {
        link?: string | null;
        path?: string | null;
      } | null;
    } | null;
  } | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24',
};

export function UserAvatar({ user, className, size = 'md' }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const getImageUrl = (path: string | null | undefined): string => {
    if (!path) return '/default-avatar-profile-picture-male-icon.png';
    
    // If it's already an absolute URL, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Otherwise, prepend the API base URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://fastapi.localhost';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const imageUrl = getImageUrl(user?.image?.media?.link);
  const fallbackText = user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U';

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {!imageError && imageUrl !== '/default-avatar-profile-picture-male-icon.png' ? (
        <AvatarImage 
          src={imageUrl}
          alt={`${user?.first_name} ${user?.last_name}` || 'User'}
          onError={() => {
            console.error('Failed to load avatar image:', imageUrl);
            setImageError(true);
          }}
          onLoad={() => {
            console.log('Avatar image loaded successfully:', imageUrl);
          }}
        />
      ) : null}
      <AvatarFallback className="bg-blue-100 text-blue-600">
        {fallbackText}
      </AvatarFallback>
    </Avatar>
  );
}
```

Then use it everywhere:

```tsx
import { UserAvatar } from '@/components/ui/user-avatar';

// In your header or profile page:
<UserAvatar user={user} size="md" />
```

## Testing Checklist

- [ ] Check browser console for errors
- [ ] Verify image URL in network tab
- [ ] Try opening image URL directly in browser
- [ ] Check if default avatar image loads
- [ ] Test with different user accounts
- [ ] Test after uploading new profile picture
- [ ] Check CORS configuration
- [ ] Verify API response structure
- [ ] Test in different browsers
- [ ] Check mobile responsiveness

## Next Steps

1. Add the `AvatarDebug` component to your profile page
2. Check the console logs and image URL
3. Identify which issue matches your symptoms
4. Apply the appropriate fix
5. Test thoroughly
6. Replace all Avatar usages with the new `UserAvatar` component

## Need More Help?

If none of these fixes work, provide:
1. The exact image URL from the debug component
2. Browser console errors
3. Network tab screenshot showing the image request
4. The user object structure from the debug component
