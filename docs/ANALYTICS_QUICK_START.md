# PostHog Analytics - Quick Start Guide

## 1. Get Your PostHog API Key

1. Go to [PostHog](https://posthog.com) and sign up (free tier available)
2. Create a new project
3. Go to **Settings** → **Project** → **Project API Key**
4. Copy your API key

## 2. Add to Environment Variables

Add to your `.env.local` file:

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_your_actual_api_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## 3. Start Tracking Events

### Automatic Tracking (Already Set Up)
✅ Page views - tracked automatically  
✅ User identification - tracked on login  
✅ User properties - synced automatically

### Manual Event Tracking

**In any component:**

```typescript
import { trackExamPaperEvent } from '@/lib/analytics';

// Track when user views a paper
trackExamPaperEvent.view(paperId, paperTitle);

// Track when user downloads a paper
trackExamPaperEvent.download(paperId, paperTitle, 'pdf');

// Track search
trackExamPaperEvent.search(searchQuery, resultsCount);
```

**Track authentication:**

```typescript
import { trackAuthEvent } from '@/lib/analytics';

trackAuthEvent.login('email');
trackAuthEvent.signup('google');
trackAuthEvent.logout();
```

**Track admin actions:**

```typescript
import { trackAdminEvent } from '@/lib/analytics';

trackAdminEvent.createPaper(paperId);
trackAdminEvent.updatePaper(paperId);
trackAdminEvent.deletePaper(paperId);
```

**Track custom events:**

```typescript
import { analytics } from '@/lib/analytics';

analytics.track('custom_event_name', {
  property1: 'value1',
  property2: 'value2',
});
```

## 4. View Your Analytics

1. Go to [app.posthog.com](https://app.posthog.com)
2. Select your project
3. View real-time events in the **Activity** tab
4. Create dashboards in the **Dashboards** tab
5. Analyze user behavior in **Insights**

## 5. Common Use Cases

### Track Button Clicks
```typescript
import { trackFeatureEvent } from '@/lib/analytics';

<Button onClick={() => {
  trackFeatureEvent.use('download_button', { paper_id: '123' });
  // ... your download logic
}}>
  Download
</Button>
```

### Track Form Submissions
```typescript
import { analytics } from '@/lib/analytics';

const onSubmit = (data) => {
  analytics.track('form_submitted', {
    form_name: 'contact_form',
    fields_filled: Object.keys(data).length,
  });
  // ... your submit logic
};
```

### Track Errors
```typescript
import { trackErrorEvent } from '@/lib/analytics';

try {
  // ... your code
} catch (error) {
  trackErrorEvent.apiError('/api/papers', 500, error.message);
}
```

## 6. Testing

In development mode, events are logged to the browser console. Open DevTools and look for PostHog logs.

## 7. Privacy & GDPR

To allow users to opt out:

```typescript
import { posthog } from '@/lib/posthog';

// Opt out
posthog.opt_out_capturing();

// Opt in
posthog.opt_in_capturing();
```

## Need More Help?

- See full documentation: `docs/ANALYTICS_SETUP.md`
- PostHog docs: [posthog.com/docs](https://posthog.com/docs)
- Example component: `src/components/examples/analytics-example.tsx`
