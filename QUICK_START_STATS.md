# Statistics Widget Quick Start

## 🚀 Quick Deployment (5 minutes)

### 1. Database Setup (1 min)

```bash
# In Supabase Dashboard > SQL Editor, paste and run:
# Content of: supabase/migrations/20260305000000_statistics_schema.sql
```

### 2. Install Dependencies (1 min)

```bash
cd /home/dembolx/Pulpit/nawykolog-ewolucja-bohatera
bun install html2canvas
```

### 3. Deploy Edge Functions (2 min)

```bash
# Use Supabase Dashboard or CLI
supabase functions deploy get-stats-today
supabase functions deploy get-stats-week
supabase functions deploy get-stats-month
supabase functions deploy get-stats-year
```

### 4. Test (1 min)

```bash
bun run dev
# Navigate to Dashboard - see "Twoje Statystyki" section
```

---

## 📁 File Structure

```
src/
  components/stats/
    ├── StatsWidget.tsx          # Main container
    ├── StatsToday.tsx           # Today's stats
    ├── StatsWeek.tsx            # Weekly view
    ├── StatsMonth.tsx           # Monthly view (PLUS+)
    ├── StatsYear.tsx            # Yearly view (PRO)
    ├── SharingCard.tsx          # Share card
    ├── Charts.tsx               # Reusable charts
    └── index.ts                 # Exports

  hooks/
    └── useStats.ts              # Data hooks

  lib/
    └── stats-cache.ts           # Caching utils

supabase/
  migrations/
    └── 20260305000000_statistics_schema.sql
  functions/
    ├── get-stats-today/
    ├── get-stats-week/
    ├── get-stats-month/
    └── get-stats-year/

Documentation/
  ├── STATS_IMPLEMENTATION.md    # Full guide
  ├── README_STATS.md            # Overview
  └── STATS_CHECKLIST.md         # Feature list
```

---

## 🔌 How to Use

### Import in any component:

```typescript
import { StatsWidget } from "@/components/stats";

export default function MyComponent() {
  return <StatsWidget />;
}
```

### Use individual hooks:

```typescript
import { useStatsDaily, useStatsMonthly } from "@/hooks/useStats";

function MyStats() {
  const daily = useStatsDaily();
  const monthly = useStatsMonthly(2026, 3);

  return (
    <div>
      {daily.loading ? "Loading..." : <p>{daily.stats?.completedCount}</p>}
    </div>
  );
}
```

---

## 🎨 Customization

### Change colors:

Edit `src/components/stats/Charts.tsx` and `StatsMonth.tsx`

```typescript
const colors = [
  "bg-gray-200", // 0%
  "bg-green-200", // 1-49%
  "bg-green-400", // 50-99%
  "bg-green-600", // 100%
];
```

### Adjust cache duration:

Edit `src/lib/stats-cache.ts`

```typescript
export const CACHE_DURATION = {
  WEEK: 60 * 60 * 1000, // Change this
  MONTH: 60 * 60 * 1000,
  YEAR: 24 * 60 * 60 * 1000,
};
```

### Add more statistics:

1. Add field to `user_daily_stats` table
2. Update `materialize_daily_stats()` function
3. Update edge function responses
4. Add to component UI

---

## 🐛 Troubleshooting

**Stats not showing?**

- Check browser console for errors
- Verify edge functions are deployed
- Ensure habit_completions have data
- Check RLS policies allow user access

**Images not downloading?**

- Install html2canvas: `npm install html2canvas`
- Check browser allows downloads
- Verify element is being found by ref

**Cache not working?**

- Check localStorage isn't full
- Clear browser cache and try again
- Inspect localStorage in DevTools

**Modules not found?**

- Build might not recognize new files
- Try: `rm -rf .next && npm run build`
- Or use: `npm run dev` to rebuild on change

---

## 📊 Data Flow

```
User Habit Completion
  ↓
Trigger: handle_habit_completion()
  ↓
Update: profiles (coins, exp, streak)
       tournament_participants (coins)
  ↓
Edge Function Called (via Dashboard load)
  ↓
Query: habit_completions, profiles, tournaments
  ↓
Calculate: completion %, best habit, streaks
  ↓
Response: JSON with stats object
  ↓
Cache: LocalStorage (except daily)
  ↓
React Hook: Returns stats + loading + error
  ↓
Component: Renders charts and cards
```

---

## 🔐 Security

- ✅ RLS policies restrict user visibility
- ✅ Authenticated requests only
- ✅ Server-side calculations (no client math)
- ✅ Plan validation in component (should be server-side too)

**TODO**: Add server-side plan validation in edge functions

---

## 📈 Performance Tips

1. **Don't** fetch stats on every render - use hooks with caching
2. **Do** materialize daily stats overnight with cron
3. **Do** lazy-load yearly heatmap only when tab is clicked
4. **Do** keep chart update animations under 1 second

---

## 🎯 Next Steps

- [ ] Test all functionality
- [ ] Deploy to production
- [ ] Monitor Edge Function execution times
- [ ] Gather user feedback on stat clarity
- [ ] Consider: habit-level streaks
- [ ] Consider: friend comparisons
- [ ] Consider: stats export (CSV)

---

## 💡 Tips

**For Development:**

```bash
# Hot reload enabled
bun run dev

# Watch tests
bun run test:watch

# Check types
# (TypeScript errors in StatsWidget imports are normal during dev)
```

**For Production:**

```bash
# Build
bun run build

# Test build
bun run preview

# Lint
bun run lint
```

---

**Questions?** See full documentation in STATS_IMPLEMENTATION.md

---

Last updated: March 5, 2026
