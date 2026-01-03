'use client';

import { Button } from '@/components/ui/button';
import {
  trackAuthEvent,
  trackExamPaperEvent,
  trackProfileEvent,
  trackFeatureEvent,
} from '@/lib/analytics';
import { useAnalyticsFeature } from '@/hooks/use-analytics';

/**
 * Example component showing how to use analytics tracking
 * This is for demonstration purposes only
 */
export function AnalyticsExample() {
  // Track feature usage with hook
  const { trackFeatureUse } = useAnalyticsFeature('analytics-example');

  const handleLoginClick = () => {
    // Track authentication event
    trackAuthEvent.login('email');
    console.log('Tracked: user_login event');
  };

  const handlePaperView = () => {
    // Track exam paper view
    trackExamPaperEvent.view('paper-123', 'Math Final 2024');
    console.log('Tracked: exam_paper_viewed event');
  };

  const handlePaperDownload = () => {
    // Track exam paper download
    trackExamPaperEvent.download('paper-123', 'Math Final 2024', 'pdf');
    console.log('Tracked: exam_paper_downloaded event');
  };

  const handleSearch = () => {
    // Track search
    trackExamPaperEvent.search('calculus', 15);
    console.log('Tracked: exam_paper_searched event');
  };

  const handleProfileUpdate = () => {
    // Track profile update
    trackProfileEvent.update(['name', 'email']);
    console.log('Tracked: profile_updated event');
  };

  const handleFeatureUse = () => {
    // Track feature usage with hook
    trackFeatureUse('button_clicked', {
      button_name: 'Example Button',
      timestamp: new Date().toISOString(),
    });
    console.log('Tracked: feature_action event');
  };

  const handleCustomEvent = () => {
    // Track custom event
    trackFeatureEvent.use('custom_feature', {
      custom_property: 'custom_value',
      user_action: 'clicked_example',
    });
    console.log('Tracked: feature_used event');
  };

  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <h2 className="text-2xl font-bold">Analytics Tracking Examples</h2>
      <p className="text-sm text-muted-foreground">
        Click buttons to track events. Check browser console for confirmation.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <Button onClick={handleLoginClick} variant="outline">
          Track Login Event
        </Button>

        <Button onClick={handlePaperView} variant="outline">
          Track Paper View
        </Button>

        <Button onClick={handlePaperDownload} variant="outline">
          Track Paper Download
        </Button>

        <Button onClick={handleSearch} variant="outline">
          Track Search Event
        </Button>

        <Button onClick={handleProfileUpdate} variant="outline">
          Track Profile Update
        </Button>

        <Button onClick={handleFeatureUse} variant="outline">
          Track Feature Use (Hook)
        </Button>

        <Button onClick={handleCustomEvent} variant="outline">
          Track Custom Event
        </Button>
      </div>

      <div className="mt-4 p-4 bg-muted rounded-md">
        <h3 className="font-semibold mb-2">How to use:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Set up PostHog API key in .env.local</li>
          <li>Click any button above to track an event</li>
          <li>Check browser console for confirmation</li>
          <li>View events in PostHog dashboard</li>
        </ol>
      </div>
    </div>
  );
}
