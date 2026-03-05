# Statistics Widget System - Implementation Guide

## Overview

A comprehensive statistics system has been added to Nawykolog with daily, weekly, monthly, and yearly analytics featuring visualizations, caching, and sharing capabilities.

## Database Schema

### New Tables Created:

1. **user_daily_stats** - Materialized daily statistics (indexed for quick access)
2. **monthly_snapshots** - Monthly snapshots taken on day 1 of next month
3. **yearly_snapshots** - Yearly snapshots with annual aggregations

### Key Functions:

- `materialize_daily_stats(p_user_id UUID, p_date DATE)` - Generate daily stats
- `materialize_daily_stats_range(p_user_id UUID, p_start_date DATE, p_end_date DATE)` - Batch daily stats
- `create_monthly_snapshot(p_user_id UUID, p_year INTEGER, p_month INTEGER)` - Create monthly summary

## Backend Functions (Edge Functions)

Located in `supabase/functions/`:

- **get-stats-today** - Daily statistics (progres, streak, coins, EXP, best habit)
- **get-stats-week** - Weekly heatmap and comparison with previous week
- **get-stats-month** - Month calendar heatmap, top 3 habits, worst habit
- **get-stats-year** - GitHub-style yearly heatmap, year in numbers, tournaments

## Frontend Components

### Stats Components (`src/components/stats/`):

- **StatsWidget.tsx** - Main container with tabs for each time period
- **StatsToday.tsx** - Daily view with donut chart, streak, coins, EXP
- **StatsWeek.tsx** - Weekly heatmap and bar chart
- **StatsMonth.tsx** - Month calendar heatmap and top habits (PLUS/PRO only)
- **StatsYear.tsx** - Yearly heatmap and year summary (PRO only)
- **SharingCard.tsx** - "Year in numbers" sharing card
- **Charts.tsx** - Reusable chart components (DonutChart, BarChart, HeatmapGrid, LineChart, ProgressRing)

### Hooks (`src/hooks/useStats.ts`):

- `useStatsDaily()` - Fetch today's statistics
- `useStatsWeekly()` - Fetch week with caching
- `useStatsMonthly(year, month)` - Fetch month with caching
- `useStatsYearly(year)` - Fetch year with caching

### Utilities (`src/lib/stats-cache.ts`):

- Local storage caching with expiration
- Cache key generation
- Date utilities (week numbers, month names, etc.)

## Features

### Daily Stats (Everyone)

- Donut chart: completed habits vs total
- Current streak with animated flame (scales at 7+ days)
- Coins earned today
- EXP earned today
- Best habit of the day (longest personal streak)
- Last login time

### Weekly Stats (Everyone)

- 7-day heatmap (gray/light-green/green/dark-green based on % completion)
- Bar chart showing completed habits per day
- Weekly totals: completions, complete days, coins, EXP
- Best day of the week
- Comparison with previous week (% difference, up/down arrow)

### Monthly Stats (PLUS/PRO)

- Calendar heatmap (31-day grid view)
- Click to view details for each day
- Top 3 habits of the month
- Worst habit with suggestion to change reminder time
- Monthly totals and loot box stats
- Legend for intensity colors

### Yearly Stats (PRO only; PLUS shows 3 months)

- GitHub contribution-style yearly heatmap
- "Year in Numbers" Spotify Wrapped-style infographic:
  - Total habits completed
  - Total active days
  - Longest streak
  - Total coins
  - Total EXP
  - Favorite habit and completion count
  - Tournaments completed & average position
  - Items acquired
- Share as image button (generates PNG via html2canvas)
- Copy profile link button

## Caching Strategy

| Period  | Duration | Cache Key             | Comments         |
| ------- | -------- | --------------------- | ---------------- |
| Daily   | 15 min   | Auto-refresh on nav   | Always fresh     |
| Weekly  | 1 hour   | `stats_week_YYYY-WW`  | User can refresh |
| Monthly | 1 hour   | `stats_month_YYYY-MM` | User can refresh |
| Yearly  | 24 hours | `stats_year_YYYY`     | User can refresh |

Refresh button appears if cache is older than 2 hours.

## Integration with Dashboard

The `StatsWidget` component is integrated into the Dashboard (`src/pages/Dashboard.tsx`) and displays below the quick stats bar and above the habits section.

## Setup & Deployment

### 1. Database Migrations

```bash
# Apply migrations in this order:
# 1. supabase/migrations/20260305000000_statistics_schema.sql
# - Creates tables, views, and statistics functions
```

### 2. Install Dependencies

```bash
bun install html2canvas
# or
npm install html2canvas
```

### 3. Deploy Edge Functions

```bash
supabase functions deploy get-stats-today
supabase functions deploy get-stats-week
supabase functions deploy get-stats-month
supabase functions deploy get-stats-year
```

### 4. Schedule Cron Jobs (Optional - for automatic monthly snapshots)

```sql
-- In Supabase SQL editor, add this scheduled job:
SELECT cron.schedule('materialize-daily-stats', '0 2 * * *', $$
  SELECT materialize_daily_stats_range(profiles.id, CURRENT_DATE - 7, CURRENT_DATE)
  FROM profiles;
$$);

SELECT cron.schedule('create-monthly-snapshots', '0 0 1 * *', $$
  SELECT create_monthly_snapshot(profiles.id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 day')::INTEGER)
  FROM profiles;
$$);
```

## Plan-Based Access

| Feature       | FREE | PLUS     | PRO       |
| ------------- | ---- | -------- | --------- |
| Daily Stats   | ✅   | ✅       | ✅        |
| Weekly Stats  | ✅   | ✅       | ✅        |
| Monthly Stats | ❌   | ✅       | ✅        |
| Yearly Stats  | ❌   | 3 months | Full year |
| Share Feature | ❌   | ❌       | ✅        |

## Performance Optimizations

1. **Materialized Daily Stats**: Precomputed aggregations prevent expensive real-time calculations
2. **Indexed Queries**: Indexes on (user_id, date) for O(log n) lookups
3. **Client-Side Caching**: LocalStorage caching reduces unnecessary API calls
4. **Lazy Loading**: Monthly and yearly stats only computed when tab is clicked
5. **Edge Functions**: Server-side aggregation logic closer to data

## Data Calculation Details

### Completion Percentage

```
completion_percent = (habits_completed / habits_total) * 100
```

Color coding:

- 0% → Gray
- 1-49% → Light green
- 50-99% → Green
- 100% → Dark green

### Streak Calculation

Tracked in `profiles.streak_days` and updated by habit completion trigger.

### Coins & EXP

Calculated during habit completion trigger in `handle_habit_completion()` function.

## Customization Notes

### Changing Color Scheme

Colors are defined in component files:

- `Charts.tsx` - Chart colors
- `StatsMonth.tsx` - Heatmap colors
- `StatsYear.tsx` - Yearly heatmap colors

Update the color arrays to match your theme.

### Adjusting Cache Duration

In `src/lib/stats-cache.ts`, modify `CACHE_DURATION` constants:

```typescript
export const CACHE_DURATION = {
  WEEK: 60 * 60 * 1000, // 1 hour
  MONTH: 60 * 60 * 1000, // 1 hour
  YEAR: 24 * 60 * 60 * 1000, // 24 hours
};
```

### Adding New Statistics

1. Create new column in `user_daily_stats`
2. Update `materialize_daily_stats()` function
3. Add to `get-stats-*` edge functions
4. Create new component section in Stats tab

## Known Limitations & Future Improvements

1. **Streak per Habit**: Currently tracks user streak only. Per-habit streaks in development.
2. **Timezone Handling**: Uses server timezone. Client-side timezone consideration needed.
3. **Real-time Updates**: Stats cache is one query behind. Refresh button provides immediate update.
4. **Mobile Sharing**: Image generation works on mobile but file download may vary by browser.

## Troubleshooting

### Stats Not Updating

1. Check user_daily_stats table has data
2. Verify habit_completions records are being created
3. Check browser's LocalStorage isn't full
4. Try clearing cache and refreshing

### Materialization Not Running

1. Verify pg_cron extension is enabled: `CREATE EXTENSION IF NOT EXISTS pg_cron;`
2. Check cron logs in Supabase
3. Manually run: `SELECT materialize_daily_stats_range(user_id, CURRENT_DATE - 7, CURRENT_DATE);`

### html2canvas Not Found

1. Install: `npm install html2canvas`
2. If still not working, image download will fail gracefully with user notification

## Testing

Test data can be created with:

```sql
-- Create test habit completions
INSERT INTO habit_completions (habit_id, user_id, completed_date)
  SELECT h.id, h.user_id, CURRENT_DATE - (n || ' days')::INTERVAL
  FROM habits h, generate_series(0, 30) n
  WHERE h.user_id = 'test-user-id'
  AND random() > 0.3;

-- Materialize stats
SELECT materialize_daily_stats_range('test-user-id', CURRENT_DATE - 30, CURRENT_DATE);
```
