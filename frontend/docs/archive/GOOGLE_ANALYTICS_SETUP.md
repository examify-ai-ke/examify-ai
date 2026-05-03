# Google Analytics Setup Guide

This guide will help you set up Google Analytics 4 (GA4) in your Next.js application.

## Table of Contents

1. [Getting Your Measurement ID](#getting-your-measurement-id)
2. [Configuration](#configuration)
3. [Usage](#usage)
4. [Custom Event Tracking](#custom-event-tracking)
5. [User Properties](#user-properties)
6. [Testing](#testing)
7. [Privacy & GDPR Compliance](#privacy--gdpr-compliance)

---

## Getting Your Measurement ID

### Step 1: Create a Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Start measuring" or "Admin" (gear icon)
3. Create an account or select an existing one

### Step 2: Create a Property

1. In Admin, click "Create Property"
2. Enter your property name (e.g., "Exampapel")
3. Select your timezone and currency
4. Click "Next"

### Step 3: Set Up Data Stream

1. Select "Web" as your platform
2. Enter your website URL (e.g., `https://exampapel.com`)
3. Enter a stream name (e.g., "Exampapel Website")
4. Click "Create stream"

### Step 4: Get Your Measurement ID

1. After creating the stream, you'll see your **Measurement ID**
2. It looks like: `G-XXXXXXXXXX`
3. Copy this ID - you'll need it for configuration

---

## Configuration

### Step 1: Add Environment Variable

Add your Measurement ID to your `.env.local` file:

```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional: Enable GA in development mode
NEXT_PUBLIC_GA_DEBUG=true
```

**Important Notes:**
- Replace `G-XXXXXXXXXX` with your actual Measurement ID
- The `NEXT_PUBLIC_` prefix is required for client-side access
- By default, GA is disabled in development mode
- Set `NEXT_PUBLIC_GA_DEBUG=true` to test GA in development

### Step 2: Verify Installation

The Google Analytics component is already integrated in `src/app/layout.tsx`. No additional setup needed!

---

## Usage

### Automatic Page View Tracking

Page views are tracked automatically when users navigate between pages. No additional code needed!

The component uses Next.js App Router's `usePathname()` and `useSearchParams()` to detect route changes.

### Manual Page View Tracking (Rare)

If you need to manually track a page view:

```typescript
import { trackPageView } from '@/components/analytics/google-analytics';

// Track a custom page view
trackPageView('/custom-page');
```

---

## Custom Event Tracking

Track custom events throughout your application using the `trackEvent` helper function.

### Basic Event Tracking

```typescript
import { trackEvent } from '@/components/analytics/google-analytics';

// Track a button click
trackEvent('button_click', {
  button_name: 'signup',
  page: '/home'
});
```

### Common Event Examples

#### 1. Track User Registration

```typescript
// In your registration component
import { trackEvent } from '@/components/analytics/google-analytics';

const handleRegister = async (userData) => {
  const result = await register(userData);
  
  if (result.success) {
    trackEvent('sign_up', {
      method: 'email',
      user_role: userData.role
    });
  }
};
```

#### 2. Track Login

```typescript
// In your login component
import { trackEvent } from '@/components/analytics/google-analytics';

const handleLogin = async (credentials) => {
  const result = await login(credentials);
  
  if (result.success) {
    trackEvent('login', {
      method: credentials.provider || 'email'
    });
  }
};
```

#### 3. Track Exam Paper Views

```typescript
// In your exam paper component
import { trackEvent } from '@/components/analytics/google-analytics';

useEffect(() => {
  if (examPaper) {
    trackEvent('view_item', {
      item_id: examPaper.id,
      item_name: examPaper.title,
      item_category: examPaper.course?.name,
      institution: examPaper.institution?.name
    });
  }
}, [examPaper]);
```

#### 4. Track Search

```typescript
// In your search component
import { trackEvent } from '@/components/analytics/google-analytics';

const handleSearch = (query: string) => {
  trackEvent('search', {
    search_term: query,
    page: '/exampapers'
  });
};
```

#### 5. Track Downloads

```typescript
// In your download component
import { trackEvent } from '@/components/analytics/google-analytics';

const handleDownload = (examPaper) => {
  trackEvent('file_download', {
    file_name: examPaper.title,
    file_type: 'pdf',
    item_id: examPaper.id
  });
};
```

#### 6. Track Form Submissions

```typescript
// In your form component
import { trackEvent } from '@/components/analytics/google-analytics';

const handleSubmit = async (formData) => {
  const result = await submitForm(formData);
  
  trackEvent('form_submit', {
    form_name: 'contact',
    success: result.success,
    form_location: '/contact'
  });
};
```

#### 7. Track Errors

```typescript
// In your error boundary or error handler
import { trackEvent } from '@/components/analytics/google-analytics';

const handleError = (error: Error) => {
  trackEvent('exception', {
    description: error.message,
    fatal: false,
    page: window.location.pathname
  });
};
```

---

## User Properties

Set user properties to segment your analytics data:

```typescript
import { setUserProperties } from '@/components/analytics/google-analytics';

// After user logs in
const handleLogin = async (credentials) => {
  const result = await login(credentials);
  
  if (result.success) {
    setUserProperties({
      user_id: result.user.id,
      user_role: result.user.role?.name,
      institution: result.user.institution?.name,
      account_type: result.user.is_superuser ? 'admin' : 'user'
    });
  }
};
```

---

## Testing

### Test in Development Mode

1. Set `NEXT_PUBLIC_GA_DEBUG=true` in your `.env.local`
2. Open your browser's Developer Tools
3. Go to the Network tab
4. Filter by "google-analytics" or "gtag"
5. Navigate around your app and watch for GA requests

### Test with Google Analytics DebugView

1. Install the [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger) Chrome extension
2. Enable the extension
3. Open your app in Chrome
4. Go to Google Analytics → Admin → DebugView
5. You should see real-time events as you interact with your app

### Verify Events in Google Analytics

1. Go to Google Analytics
2. Navigate to Reports → Realtime
3. Interact with your app
4. You should see events appearing in real-time

---

## Privacy & GDPR Compliance

### Cookie Consent

If you need to comply with GDPR or other privacy regulations, you should:

1. **Get user consent before loading GA**
2. **Provide an opt-out mechanism**
3. **Update your privacy policy**

### Example: Conditional Loading with Consent

```typescript
// src/components/analytics/google-analytics-with-consent.tsx
'use client';

import { useState, useEffect } from 'react';
import { GoogleAnalytics } from './google-analytics';

export function GoogleAnalyticsWithConsent() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check if user has given consent (from cookie or localStorage)
    const consent = localStorage.getItem('analytics-consent');
    setHasConsent(consent === 'true');
  }, []);

  if (!hasConsent) {
    return null;
  }

  return <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />;
}
```

### Anonymize IP Addresses

Google Analytics 4 automatically anonymizes IP addresses, but you can ensure this in your configuration:

```typescript
// In google-analytics.tsx, update the config:
gtag('config', '${measurementId}', {
  page_path: window.location.pathname,
  send_page_view: true,
  anonymize_ip: true  // Add this line
});
```

---

## Recommended Events to Track

Here's a checklist of events you should consider tracking:

### User Actions
- [ ] Sign up
- [ ] Login
- [ ] Logout
- [ ] Profile update
- [ ] Password change

### Content Interaction
- [ ] Exam paper view
- [ ] Question view
- [ ] Institution view
- [ ] Search
- [ ] Filter applied
- [ ] Sort changed

### Engagement
- [ ] File download
- [ ] Share
- [ ] Comment posted
- [ ] Like/favorite
- [ ] Follow institution

### Forms
- [ ] Form start
- [ ] Form submit
- [ ] Form error

### Errors
- [ ] 404 errors
- [ ] API errors
- [ ] Form validation errors

---

## Troubleshooting

### GA Not Loading

1. Check that `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set in `.env.local`
2. Verify the Measurement ID format (should be `G-XXXXXXXXXX`)
3. Check browser console for errors
4. Ensure you're not blocking GA with an ad blocker

### Events Not Showing Up

1. Wait 24-48 hours for data to appear in standard reports
2. Use DebugView for real-time testing
3. Check that events are being sent in the Network tab
4. Verify event names follow GA4 naming conventions (lowercase, underscores)

### Development Mode Issues

1. GA is disabled in development by default
2. Set `NEXT_PUBLIC_GA_DEBUG=true` to enable in development
3. Check that `NODE_ENV` is set correctly

---

## Best Practices

1. **Use Descriptive Event Names**: Use clear, consistent naming (e.g., `button_click`, not `btn_clk`)
2. **Include Context**: Add relevant parameters to events (page, user_role, etc.)
3. **Don't Over-Track**: Focus on meaningful user interactions
4. **Test Before Production**: Always test events in development/staging
5. **Document Your Events**: Keep a list of all tracked events and their parameters
6. **Respect Privacy**: Always get consent and provide opt-out options
7. **Use Standard Events**: Use GA4's recommended event names when possible

---

## Resources

- [Google Analytics 4 Documentation](https://support.google.com/analytics/answer/9304153)
- [GA4 Event Reference](https://support.google.com/analytics/answer/9267735)
- [Next.js Analytics Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)
- [GDPR Compliance Guide](https://support.google.com/analytics/answer/9019185)

---

## Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review the [Google Analytics Help Center](https://support.google.com/analytics)
3. Check the browser console for errors
4. Verify your Measurement ID is correct
