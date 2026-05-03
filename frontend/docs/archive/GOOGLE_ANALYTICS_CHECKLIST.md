# Google Analytics Implementation Checklist

Use this checklist to ensure your Google Analytics integration is complete and working correctly.

## Setup Checklist

### Initial Configuration
- [ ] Created Google Analytics 4 property
- [ ] Set up Web data stream
- [ ] Copied Measurement ID (G-XXXXXXXXXX)
- [ ] Added `NEXT_PUBLIC_GA_MEASUREMENT_ID` to `.env.local`
- [ ] Restarted development server
- [ ] Verified GA component is loaded in browser

### Testing
- [ ] Opened browser DevTools → Network tab
- [ ] Filtered for "google-analytics" or "gtag"
- [ ] Navigated between pages
- [ ] Confirmed GA requests are being sent
- [ ] Checked Google Analytics DebugView for real-time events
- [ ] Waited 24-48 hours and verified data in GA dashboard

## Event Tracking Checklist

### User Authentication Events
- [ ] Login tracking implemented
- [ ] Logout tracking implemented
- [ ] Sign up tracking implemented
- [ ] User properties set on login (user_id, role, institution)
- [ ] Password change tracking (optional)
- [ ] Profile update tracking (optional)

### Content Viewing Events
- [ ] Exam paper view tracking
- [ ] Question view tracking
- [ ] Institution view tracking
- [ ] Course view tracking (if applicable)
- [ ] Download tracking for PDFs/files

### Search & Discovery Events
- [ ] Search query tracking
- [ ] Filter application tracking
- [ ] Sort change tracking
- [ ] Search results count tracking

### Engagement Events
- [ ] Comment posting tracking
- [ ] Like/favorite tracking
- [ ] Share tracking
- [ ] Follow/unfollow tracking

### Form Events
- [ ] Form start tracking
- [ ] Form submission tracking (success/failure)
- [ ] Form validation error tracking

### Navigation Events
- [ ] Important button click tracking
- [ ] CTA button tracking
- [ ] Navigation link tracking (optional)

### Error Events
- [ ] 404 page tracking
- [ ] API error tracking
- [ ] Exception/crash tracking
- [ ] Form error tracking

## Privacy & Compliance Checklist

### GDPR Compliance (if applicable)
- [ ] Cookie consent banner implemented
- [ ] GA only loads after consent
- [ ] Privacy policy updated
- [ ] Opt-out mechanism provided
- [ ] Data retention settings configured in GA
- [ ] IP anonymization enabled (automatic in GA4)

### Data Protection
- [ ] No PII (Personally Identifiable Information) sent to GA
- [ ] User IDs are hashed/anonymized
- [ ] Email addresses not tracked
- [ ] Phone numbers not tracked
- [ ] Sensitive data excluded from events

## Documentation Checklist

- [ ] Read GOOGLE_ANALYTICS_QUICK_START.md
- [ ] Read GOOGLE_ANALYTICS_SETUP.md
- [ ] Reviewed GOOGLE_ANALYTICS_IMPLEMENTATION_EXAMPLES.md
- [ ] Documented custom events in team wiki/docs
- [ ] Created event naming conventions document
- [ ] Shared GA access with team members

## Google Analytics Dashboard Setup

### Basic Configuration
- [ ] Set up data retention period
- [ ] Configured site search tracking
- [ ] Set up enhanced measurement (if needed)
- [ ] Configured cross-domain tracking (if applicable)
- [ ] Set up user-ID tracking

### Goals & Conversions
- [ ] Created conversion events (signups, downloads, etc.)
- [ ] Set up funnel analysis
- [ ] Configured e-commerce tracking (if applicable)
- [ ] Created custom dimensions (if needed)
- [ ] Created custom metrics (if needed)

### Reports & Dashboards
- [ ] Created custom dashboard for key metrics
- [ ] Set up automated reports
- [ ] Configured alerts for important metrics
- [ ] Created audience segments
- [ ] Set up comparison reports

## Monitoring & Maintenance Checklist

### Weekly Tasks
- [ ] Check DebugView for event errors
- [ ] Review real-time reports
- [ ] Verify key events are firing
- [ ] Check for unusual traffic patterns

### Monthly Tasks
- [ ] Review top pages and user flows
- [ ] Analyze conversion rates
- [ ] Check bounce rates and engagement
- [ ] Review search queries and filters
- [ ] Identify drop-off points in funnels
- [ ] Update event tracking as needed

### Quarterly Tasks
- [ ] Audit all tracked events
- [ ] Review and update goals
- [ ] Clean up unused events
- [ ] Update documentation
- [ ] Train team on new features
- [ ] Review privacy compliance

## Troubleshooting Checklist

If GA is not working:
- [ ] Verified Measurement ID is correct
- [ ] Checked `.env.local` has `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- [ ] Restarted development server after adding env variable
- [ ] Checked browser console for errors
- [ ] Verified ad blocker is disabled
- [ ] Checked Network tab for GA requests
- [ ] Verified GA script is loading in page source
- [ ] Checked GA property is active (not deleted)
- [ ] Verified data stream is active

If events are not showing:
- [ ] Waited 24-48 hours for data to appear
- [ ] Checked DebugView for real-time events
- [ ] Verified event names follow GA4 conventions
- [ ] Checked event parameters are valid
- [ ] Verified gtag function is available
- [ ] Checked for JavaScript errors
- [ ] Verified events are being sent in Network tab

## Best Practices Checklist

### Event Naming
- [ ] Using lowercase with underscores (e.g., `button_click`)
- [ ] Using descriptive, consistent names
- [ ] Following GA4 recommended event names when possible
- [ ] Avoiding special characters in event names
- [ ] Keeping event names under 40 characters

### Event Parameters
- [ ] Including relevant context (page, user_role, etc.)
- [ ] Using consistent parameter names
- [ ] Keeping parameter values meaningful
- [ ] Not sending PII in parameters
- [ ] Limiting number of parameters per event

### Performance
- [ ] Not tracking every single user action
- [ ] Batching events when possible
- [ ] Not blocking UI with tracking calls
- [ ] Using `strategy="afterInteractive"` for GA script
- [ ] Minimizing custom dimensions/metrics

### Data Quality
- [ ] Testing events before production
- [ ] Documenting all tracked events
- [ ] Regular audits of event data
- [ ] Removing unused events
- [ ] Validating event parameters

## Production Deployment Checklist

- [ ] Verified GA works in staging environment
- [ ] Tested all critical events in staging
- [ ] Updated production `.env` with Measurement ID
- [ ] Verified GA loads in production
- [ ] Checked first 24 hours of production data
- [ ] Set up monitoring alerts
- [ ] Documented deployment for team
- [ ] Created runbook for troubleshooting

## Success Metrics

After implementation, you should be able to:
- [ ] See real-time users in GA dashboard
- [ ] Track page views across all pages
- [ ] Monitor user authentication events
- [ ] Analyze content engagement
- [ ] Track search behavior
- [ ] Measure conversion rates
- [ ] Identify user drop-off points
- [ ] Segment users by properties
- [ ] Create custom reports
- [ ] Export data for analysis

---

## Status Tracking

**Setup Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

**Last Updated**: _____________

**Completed By**: _____________

**Notes**:
_____________________________________________
_____________________________________________
_____________________________________________
