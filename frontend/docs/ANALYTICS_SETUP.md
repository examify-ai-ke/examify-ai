# PostHog Analytics Setup

## Overview
This project uses PostHog for product analytics, feature flags, and user behavior tracking.

## Configuration

### Environment Variables
Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-project-api-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Getting Your PostHog API Key
1. Sign up at [PostHog](https://posthog.com)
2. Create a new project
3. Copy your Project API Key from Settings > Project > Project API Key
4. Add it to your `.env.local` file

## Usage

### Automatic Tracking
The following are tracked automatically:
- **Page views**: Every route change
- **User identification**: When users log in/out
- **User properties**: Email, name, role, etc.

### Manual Event Tracking

#### Basic Event Tracking
```typescript
import { analytics } from '@/lib/analytics';

// Track a custom event
analytics.track('button_clicked', {
  button_name: 'Download Paper',
  paper_id: '123',
});
```

#### Predefined Event Tracking

**Authentication Events:**
```typescript
import { trackAuthEvent } from '@/lib/analytics';

trackAuthEvent.login('email');
trackAuthEvent.signup('google');
trackAuthEvent.logout();
trackAuthEvent.passwordReset();
```

**Exam Paper Events:**
```typescript
import { trackExamPaperEvent } from '@/lib/analytics';

trackExamPaperEvent.view('paper-123', 'Math Final 2024');
trackExamPaperEvent.download('paper-123', 'Math Final 2024', 'pdf');
trackExamPaperEvent.search('calculus', 15);
trackExamPaperEvent.filter({ subject: 'Math', year: 2024 });
```

**Admin Events:**
```typescript
import { trackAdminEvent } from '@/lib/analytics';

trackAdminEvent.createPaper('paper-123');
trackAdminEvent.updatePaper('paper-123');
trackAdminEvent.deletePaper('paper-123');
trackAdminEvent.createInstitution('inst-456');
```

**Profile Events:**
```typescript
import { trackProfileEvent } from '@/lib/analytics';

trackProfileEvent.update(['name', 'email']);
trackProfileEvent.avatarUpload();
trackProfileEvent.view('user-789');
```

**Error Events:**
```typescript
import { trackErrorEvent } from '@/lib/analytics';

trackErrorEvent.apiError('/api/papers', 500, 'Internal Server Error');
trackErrorEvent.formError('login-form', { email: 'Invalid email' });
```

### React Hooks

**Track Page Views:**
```typescript
import { useAnalyticsPageView } from '@/hooks/use-analytics';

function MyPage() {
  useAnalyticsPageView('Dashboard', { section: 'admin' });
  return <div>...</div>;
}
```

**Track Feature Usage:**
```typescript
import { useAnalyticsFeature } from '@/hooks/use-analytics';

function MyFeature() {
  const { trackFeatureUse } = useAnalyticsFeature('exam-paper-editor');
  
  const handleSave = () => {
    trackFeatureUse('save', { paper_id: '123' });
  };
  
  return <button onClick={handleSave}>Save</button>;
}
```

### User Identification

User identification happens automatically when users log in via the `useAnalyticsIdentify` hook in the PostHogProvider.

To manually identify a user:
```typescript
import { analytics } from '@/lib/analytics';

analytics.identify('user-123', {
  email: 'user@example.com',
  name: 'John Doe',
  role: 'admin',
});
```

To reset user identity (on logout):
```typescript
import { analytics } from '@/lib/analytics';

analytics.reset();
```

## Best Practices

### Event Naming
- Use snake_case for event names: `exam_paper_downloaded`
- Be descriptive but concise
- Group related events with prefixes: `admin_*`, `user_*`, `exam_paper_*`

### Event Properties
- Include relevant context in properties
- Use consistent property names across events
- Avoid PII in event properties (use user identification instead)

### Performance
- Analytics calls are non-blocking
- Events are batched and sent asynchronously
- No impact on user experience

## Feature Flags (Optional)

PostHog also supports feature flags. To use them:

```typescript
import { posthog } from '@/lib/posthog';

// Check if a feature is enabled
const isFeatureEnabled = posthog.isFeatureEnabled('new-editor');

if (isFeatureEnabled) {
  // Show new editor
} else {
  // Show old editor
}
```

## A/B Testing (Optional)

```typescript
import { posthog } from '@/lib/posthog';

// Get feature flag variant
const variant = posthog.getFeatureFlag('button-color');

if (variant === 'blue') {
  // Show blue button
} else if (variant === 'green') {
  // Show green button
}
```

## Debugging

In development mode, PostHog will log events to the console. Check your browser console to see tracked events.

To enable debug mode:
```typescript
// Already enabled in development in src/lib/posthog.ts
posthog.debug();
```

## Privacy & GDPR Compliance

PostHog is GDPR compliant. To respect user privacy:

1. **Opt-out**: Allow users to opt out of tracking
```typescript
import { posthog } from '@/lib/posthog';

posthog.opt_out_capturing();
```

2. **Opt-in**: Require explicit consent
```typescript
import { posthog } from '@/lib/posthog';

posthog.opt_in_capturing();
```

3. **Delete user data**: When users request data deletion
```typescript
// Contact PostHog support or use their API to delete user data
```

## Dashboard & Reports

Access your PostHog dashboard at [app.posthog.com](https://app.posthog.com) to:
- View real-time analytics
- Create custom dashboards
- Set up funnels and retention analysis
- Analyze user paths
- Create cohorts
- Set up alerts

## Troubleshooting

### Events not showing up
1. Check that `NEXT_PUBLIC_POSTHOG_KEY` is set correctly
2. Verify the API key in PostHog dashboard
3. Check browser console for errors
4. Ensure you're not blocking analytics with ad blockers

### User identification not working
1. Verify user is logged in
2. Check that `useAnalyticsIdentify` hook is called
3. Ensure user object has required properties

### Development vs Production
- In development: Events are logged to console
- In production: Events are sent to PostHog silently
- Use different PostHog projects for dev/staging/production

## Resources
- [PostHog Documentation](https://posthog.com/docs)
- [PostHog React Integration](https://posthog.com/docs/libraries/react)
- [PostHog Feature Flags](https://posthog.com/docs/feature-flags)
- [PostHog A/B Testing](https://posthog.com/docs/experiments)
