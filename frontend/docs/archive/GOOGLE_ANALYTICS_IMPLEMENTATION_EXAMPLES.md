# Google Analytics Implementation Examples

This document shows practical examples of how to integrate Google Analytics tracking into your existing components.

## Table of Contents

1. [Authentication Tracking](#authentication-tracking)
2. [Content Viewing Tracking](#content-viewing-tracking)
3. [Search Tracking](#search-tracking)
4. [Form Tracking](#form-tracking)
5. [Error Tracking](#error-tracking)

---

## Authentication Tracking

### Example: Track Login in useAuth Hook

```typescript
// src/hooks/useAuth.ts
import analytics from '@/lib/analytics';

const handleLogin = async (credentials) => {
  // ... existing login logic ...
  
  if (data?.data) {
    const tokenData = data.data as TokenResponse;
    const user = tokenData.user as UserRead;

    // Store token and user data
    setAuthToken(tokenData.access_token);
    login(user, tokenData.access_token);
    
    // 🎯 Track login event
    analytics.user.login(credentials.provider || 'email');
    
    // 🎯 Set user properties for segmentation
    analytics.user.setProperties(
      user.id,
      user.role?.name || 'user',
      user.institution?.name
    );

    addNotification({
      type: 'success',
      title: 'Welcome back!',
      message: `Hello ${user.first_name}!`,
    });

    return { success: true, user, token: tokenData.access_token };
  }
};
```

### Example: Track Registration

```typescript
// src/hooks/useAuth.ts
import analytics from '@/lib/analytics';

const handleRegister = async (userData: UserCreateRequest) => {
  // ... existing registration logic ...

  if (data?.data) {
    const user = data.data as UserRead;

    // 🎯 Track sign up event
    analytics.user.signUp('email', userData.role_id);

    addNotification({
      type: 'success',
      title: 'Registration Successful',
      message: 'Your account has been created successfully!',
    });

    return { success: true, user };
  }
};
```

### Example: Track Logout

```typescript
// src/hooks/useAuth.ts
import analytics from '@/lib/analytics';

const handleLogout = async () => {
  try {
    await api.POST('/api/v1/logout');
  } catch (err) {
    console.warn('Server logout failed:', err);
  } finally {
    // 🎯 Track logout event
    analytics.user.logout();
    
    clearAuthToken();
    logout();
    
    addNotification({
      type: 'success',
      title: 'Logged out',
      message: 'You have been successfully logged out.',
    });
  }
};
```

---

## Content Viewing Tracking

### Example: Track Exam Paper View

```typescript
// src/app/(public)/exampapers/[id]/page.tsx
'use client';

import { useEffect } from 'react';
import analytics from '@/lib/analytics';

export default function ExamPaperPage({ params }: { params: { id: string } }) {
  const { data: examPaper } = useExamPaper(params.id);

  useEffect(() => {
    if (examPaper) {
      // 🎯 Track exam paper view
      analytics.content.viewExamPaper(
        examPaper.id,
        examPaper.title,
        examPaper.course?.name,
        examPaper.institution?.name
      );
    }
  }, [examPaper]);

  return (
    // ... your component JSX ...
  );
}
```

### Example: Track Download

```typescript
// src/components/exam-paper-card.tsx
import analytics from '@/lib/analytics';

const handleDownload = async (examPaper: ExamPaper) => {
  try {
    // 🎯 Track download event
    analytics.content.downloadPaper(
      examPaper.id,
      examPaper.title,
      'pdf'
    );

    // ... existing download logic ...
  } catch (error) {
    console.error('Download failed:', error);
  }
};
```

---

## Search Tracking

### Example: Track Search in Browse Page

```typescript
// src/components/public/browse-page-content.tsx
import analytics from '@/lib/analytics';

const handleSearch = (query: string) => {
  setSearchQuery(query);
  
  // 🎯 Track search event
  analytics.search.perform(query, 'exam_papers');
};
```

### Example: Track Filter Application

```typescript
// src/components/public/browse-page-content.tsx
import analytics from '@/lib/analytics';

const handleFilterChange = (filterType: string, value: string) => {
  setFilters(prev => ({ ...prev, [filterType]: value }));
  
  // 🎯 Track filter event
  analytics.search.filter(filterType, value);
};
```

---

## Form Tracking

### Example: Track Profile Update

```typescript
// src/app/dashboard/profile/page.tsx
import analytics from '@/lib/analytics';

const handleSave = async () => {
  setIsSaving(true);
  
  try {
    const { data, error } = await api.PUT('/api/v1/user', {
      body: formData,
    });

    if (error) {
      // 🎯 Track form error
      analytics.form.error('profile_update', 'api_error');
      
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: errorMessage,
      });
      return;
    }

    if (data?.data) {
      setUser(data.data);
      
      // 🎯 Track successful form submission
      analytics.form.submit('profile_update', true);
      
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully.',
      });
      setIsEditing(false);
    }
  } catch (err) {
    // 🎯 Track form error
    analytics.form.error('profile_update', 'exception');
    
    addNotification({
      type: 'error',
      title: 'Error',
      message: 'An unexpected error occurred.',
    });
  } finally {
    setIsSaving(false);
  }
};
```

---

## Error Tracking

### Example: Track API Errors

```typescript
// src/lib/api.ts
import analytics from '@/lib/analytics';

api.use({
  onResponse({ response }) {
    if (!response.ok) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        console.warn('API 401 Unauthorized:', response.url);
        clearAuthToken();
        
        // 🎯 Track authentication error
        analytics.error.apiError(
          response.url,
          401,
          'Unauthorized - Token expired'
        );
      }
      
      // 🎯 Track other API errors
      if (response.status >= 500) {
        analytics.error.apiError(
          response.url,
          response.status,
          response.statusText
        );
      }
    }

    return response;
  },
});
```

### Example: Track 404 Errors

```typescript
// src/app/not-found.tsx
'use client';

import { useEffect } from 'react';
import analytics from '@/lib/analytics';

export default function NotFound() {
  useEffect(() => {
    // 🎯 Track 404 error
    analytics.error.notFound(window.location.pathname);
  }, []);

  return (
    <div>
      <h1>404 - Page Not Found</h1>
    </div>
  );
}
```

### Example: Track Exceptions in Error Boundary

```typescript
// src/components/error-boundary.tsx
'use client';

import { useEffect } from 'react';
import analytics from '@/lib/analytics';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 🎯 Track exception
    analytics.error.track(
      error.message,
      error.name,
      true // fatal error
    );
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

---

## Button Click Tracking

### Example: Track Navigation Clicks

```typescript
// src/components/layout/header.tsx
import analytics from '@/lib/analytics';

<Link
  href="/exampapers"
  onClick={() => {
    // 🎯 Track navigation click
    analytics.navigation.clickLink('ExamPapers', '/exampapers');
  }}
>
  ExamPapers
</Link>
```

### Example: Track CTA Button Clicks

```typescript
// src/components/hero-section.tsx
import analytics from '@/lib/analytics';

<Button
  onClick={() => {
    // 🎯 Track button click
    analytics.navigation.clickButton('get_started', 'hero_section');
    router.push('/auth/register');
  }}
>
  Get Started
</Button>
```

---

## Engagement Tracking

### Example: Track Comments

```typescript
// src/components/comment-form.tsx
import analytics from '@/lib/analytics';

const handleSubmitComment = async (comment: string) => {
  const result = await submitComment(comment);
  
  if (result.success) {
    // 🎯 Track comment posted
    analytics.engagement.comment('exam_paper', examPaperId);
  }
};
```

### Example: Track Follows

```typescript
// src/components/follow-button.tsx
import analytics from '@/lib/analytics';

const handleFollow = async (institutionId: string) => {
  const result = await followInstitution(institutionId);
  
  if (result.success) {
    // 🎯 Track follow action
    analytics.engagement.follow('institution', institutionId);
  }
};
```

---

## Best Practices

1. **Track at the Right Level**: Track user actions, not component renders
2. **Use Descriptive Names**: Make event names clear and consistent
3. **Include Context**: Add relevant parameters (page, user_role, etc.)
4. **Handle Errors**: Always track errors for debugging
5. **Test Events**: Use GA DebugView to verify events are firing
6. **Don't Over-Track**: Focus on meaningful interactions
7. **Respect Privacy**: Only track what's necessary and get consent

---

## Quick Start Checklist

- [ ] Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` to `.env.local`
- [ ] Track user login/logout
- [ ] Track user registration
- [ ] Track content views (exam papers, questions)
- [ ] Track search queries
- [ ] Track downloads
- [ ] Track form submissions
- [ ] Track errors (404, API errors, exceptions)
- [ ] Track key button clicks
- [ ] Test events in GA DebugView
- [ ] Set up conversion goals in GA dashboard

---

## Need Help?

Refer to the main [GOOGLE_ANALYTICS_SETUP.md](./GOOGLE_ANALYTICS_SETUP.md) guide for detailed setup instructions and troubleshooting.
