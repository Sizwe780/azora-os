# Feedback Loop & Analytics

## Feedback

- In-app, always-on feedback panel
- Survey, ratings, freeform input
- All feedback routed to `/services/feedback/`

## Analytics

- Real-time pageview, funnel, click, and journey analytics
- Dashboards for admins in `/apps/main-app/src/components/AnalyticsDashboard.jsx`
- Export as CSV or to BigQuery/Snowflake

## User Journey

- Session tracking and drop-off analysis
- User path visualization

## How to Add More

- Use `/services/analytics/` and `/services/feedback/` APIs
- Add custom event hooks in UI via `/hooks/useAnalytics.js`