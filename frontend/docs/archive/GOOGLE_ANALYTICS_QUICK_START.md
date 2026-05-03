# Google Analytics - Quick Start

Get Google Analytics up and running in 5 minutes!

## Step 1: Get Your Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a property for your website
3. Set up a Web data stream
4. Copy your Measurement ID (looks like `G-XXXXXXXXXX`)

## Step 2: Add to Environment Variables

Create or update `.env.local`:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

## Step 3: Restart Your Dev Server

```bash
npm run dev
```

## Step 4: Verify It's Working

1. Open your app in the browser
2. Open Developer Tools → Network tab
3. Filter by "google-analytics" or "gtag"
4. Navigate around your app
5. You should see GA requests being sent

## Step 5: Add Custom Tracking (Optional)

Track user actions in your components:

```typescript
import analytics from '@/lib/analytics';

// Track login
analytics.user.login('email');

// Track content view
analytics.content.viewExamPaper(paperId, title, course, institution);

// Track search
analytics.search.perform(query, 'exam_papers');

// Track download
analytics.content.downloadPaper(paperId, title, 'pdf');
```

## That's It! 🎉

Your app is now tracking:
- ✅ Page views (automatic)
- ✅ User navigation (automatic)
- ✅ Custom events (when you add them)

## Next Steps

- Read [GOOGLE_ANALYTICS_SETUP.md](./GOOGLE_ANALYTICS_SETUP.md) for detailed setup
- Check [GOOGLE_ANALYTICS_IMPLEMENTATION_EXAMPLES.md](./GOOGLE_ANALYTICS_IMPLEMENTATION_EXAMPLES.md) for code examples
- Set up conversion goals in Google Analytics dashboard
- Add custom event tracking throughout your app

## Testing

Enable GA in development mode:

```bash
# In .env.local
NEXT_PUBLIC_GA_DEBUG=true
```

Then use [Google Analytics DebugView](https://support.google.com/analytics/answer/7201382) to see events in real-time.

## Troubleshooting

**Not seeing data?**
- Wait 24-48 hours for data to appear in standard reports
- Use DebugView for real-time testing
- Check that your Measurement ID is correct
- Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is in `.env.local`

**Need help?**
- Check the [full setup guide](./GOOGLE_ANALYTICS_SETUP.md)
- Review [implementation examples](./GOOGLE_ANALYTICS_IMPLEMENTATION_EXAMPLES.md)
- Visit [Google Analytics Help Center](https://support.google.com/analytics)
