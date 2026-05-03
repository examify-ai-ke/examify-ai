# Profile Picture Display Fix

## Issue
Profile pictures were uploading successfully but not displaying on the profile pages.

## Root Cause
The profile pages were trying to access `user?.avatar_url`, but the actual API response structure uses a nested object:
```typescript
user.image.media.link
```

## Solution
Updated both profile pages to use the correct nested property path that matches the institution logo pattern.

### Files Changed:
1. `src/app/(public)/profile/page.tsx`
2. `src/app/dashboard/profile/page.tsx`

### Change Made:
```typescript
// Before (incorrect)
<AvatarImage src={user?.avatar_url} alt={user?.full_name || 'User'} />

// After (correct)
<AvatarImage src={user?.image?.media?.link || undefined} alt={user?.full_name || 'User'} />
```

## API Response Structure

The user object from the API has this structure:

```typescript
interface IUserRead {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  image?: {
    media: {
      link: string;        // ← This is the avatar URL
      title?: string;
      description?: string;
      path?: string;
      id: string;
    } | null;
  } | null;
  // ... other fields
}
```

## How It Matches Institution Logos

This fix makes the avatar display consistent with how institution logos are displayed:

**Institution Logo** (from `institution-card.tsx`):
```typescript
{institution.logo?.media?.link ? (
  <img src={institution.logo.media.link} alt={institution.name} />
) : (
  <Building2 className="h-10 w-10 text-blue-600" />
)}
```

**User Avatar** (now fixed):
```typescript
<Avatar className="h-24 w-24 mx-auto">
  <AvatarImage src={user?.image?.media?.link || undefined} alt={user?.full_name || 'User'} />
  <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
    {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
  </AvatarFallback>
</Avatar>
```

Both now use the same nested structure: `entity.image.media.link` or `entity.logo.media.link`

## Testing

✅ Upload profile picture
✅ Verify image displays immediately after upload
✅ Refresh page and verify image persists
✅ Test on both `/profile` and `/dashboard/profile`
✅ Verify fallback initials show when no image

## Related Files

- `src/app/(public)/profile/page.tsx` - Public profile page
- `src/app/dashboard/profile/page.tsx` - Dashboard profile page
- `src/components/public/institution-card.tsx` - Reference for logo display pattern
- `src/types/generated/api.ts` - API type definitions (IUserRead, IImageMediaRead, IMediaRead)
