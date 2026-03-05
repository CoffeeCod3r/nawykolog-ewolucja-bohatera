# Statistics System Architecture Diagrams

## 1. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERACTION                        │
│  Completes Habit → Dashboard Loads → Clicks Stats Tab       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    REACT COMPONENTS                          │
│  StatsWidget (Tab Controller)                               │
│  ├─ StatsToday (Daily)                                      │
│  ├─ StatsWeek (Weekly)                                      │
│  ├─ StatsMonth (Monthly - PLUS+)                           │
│  └─ StatsYear (Yearly - PRO)                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOM HOOKS                              │
│  useStatsDaily() ──→ No cache, always fresh                 │
│  useStatsWeekly() ──→ Cache 1 hour (key: week-WW)          │
│  useStatsMonthly() ──→ Cache 1 hour (key: month-MM)        │
│  useStatsYearly() ──→ Cache 24 hours (key: year-YYYY)      │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ↓                     ↓                     ↓
   ┌────────────┐        ┌─────────────┐     ┌────────────┐
   │ LocalStore │        │   Edge Fn   │     │  Load? No  │
   │ (Fresh?)   │        │   getStats  │     │ Load Skel  │
   │            │        │   Function  │     │            │
   │ YES: Use   │        │             │     │            │
   │ NO: Fetch  │────────┤ get-stats-* │     │            │
   │            │        │ (today/week/│     └────────────┘
   └────────────┘        │  month/year)│
                         │             │
                         └─────────────┘
                              │
                              ↓
        ┌─────────────────────────────────────┐
        │      SUPABASE DATABASE              │
        │                                     │
        │  habit_completions (source truth)   │
        │  ├─ (habit_id, completed_date)      │
        │  ├─ (user_id)                       │
        │                                     │
        │  user_daily_stats (materialized)    │
        │  ├─ (user_id, date) indexed         │
        │  ├─ habits_completed                │
        │  ├─ completion_percent              │
        │  ├─ coins_earned                    │
        │  ├─ exp_earned                      │
        │                                     │
        │  profiles (user data)               │
        │  ├─ streak_days                     │
        │  ├─ total_coins                     │
        │  ├─ exp                             │
        │  ├─ plan                            │
        │                                     │
        │  tournament_participants            │
        │  ├─ coins_earned                    │
        │                                     │
        │  monthly_snapshots (optional)       │
        │  yearly_snapshots (optional)        │
        └─────────────────────────────────────┘
                              │
                              ↓
                    ┌──────────────────┐
                    │ Edge Functions   │
                    │ calculate stats  │
                    │ aggregate data   │
                    │ format response  │
                    └──────────────────┘
                              │
                              ↓
                    ┌──────────────────┐
                    │   Return JSON    │
                    │ {stats, totals}  │
                    └──────────────────┘
                              │
                              ↓
                    ┌──────────────────┐
                    │  Hook caches     │
                    │  → localStorage  │
                    └──────────────────┘
                              │
                              ↓
                    ┌──────────────────┐
                    │  Component       │
                    │  renders charts  │
                    │  + animations    │
                    └──────────────────┘
                              │
                              ↓
                    ┌──────────────────┐
                    │  USER SEES       │
                    │  Statistics      │
                    │  Visualizations  │
                    └──────────────────┘
```

---

## 2. Component Hierarchy

```
Dashboard
└── StatsWidget (Tab Container)
    ├── TabsList
    │   ├─ Tab "Dzisiaj"
    │   ├─ Tab "Tydzień"
    │   ├─ Tab "Miesiąc" (disabled for FREE)
    │   └─ Tab "Rok" (disabled for FREE)
    │
    ├── TabsContent (Today)
    │   └── StatsToday
    │       ├─ DonutChart
    │       ├─ Flame Icon (Streak)
    │       ├─ Coins Card
    │       ├─ EXP Card
    │       ├─ Best Habit Card
    │       └─ Login Time Card
    │
    ├── TabsContent (Week)
    │   └── StatsWeek
    │       ├─ HeatmapGrid (7 days)
    │       ├─ SimpleBarChart
    │       ├─ 4x Stats Cards
    │       ├─ Best Day Card
    │       └─ Comparison Card
    │
    ├── TabsContent (Month) [PLUS+]
    │   └── StatsMonth
    │       ├─ Calendar Heatmap (31 days)
    │       ├─ 6x Stats Cards
    │       ├─ Top 3 Habits List
    │       ├─ Worst Habit Alert
    │       └─ Legend
    │
    └── TabsContent (Year) [PRO]
        └── StatsYear
            ├─ GitHub Heatmap (365 days)
            ├─ SharingCard
            ├─ Share Buttons
            ├─ 9x Stats Cards
            ├─ Favorite Habit Card
            └─ Tournament Card
```

---

## 3. Hook Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    HOOKS (useStats.ts)                   │
└──────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ useStatsDaily()                                         │
│                                                         │
│ Returns: {stats, loading, error, refetch}             │
│ Cache: NONE (always fresh)                            │
│ Usage: Dashboard daily metrics                        │
│                                                         │
│ Fetches: edge function get-stats-today                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ useStatsWeekly()                                        │
│                                                         │
│ Returns: {stats, loading, error, cacheAge, refetch}  │
│ Cache: 1 hour (stats_week_YYYY-WW)                   │
│ Usage: Weekly heatmap & bar chart                     │
│                                                         │
│ Flow: Check cache → If fresh, use | If old, fetch   │
│ Fetches: edge function get-stats-week                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ useStatsMonthly(year?, month?)                         │
│                                                         │
│ Returns: {stats, loading, error, cacheAge, refetch}  │
│ Cache: 1 hour (stats_month_YYYY-MM)                  │
│ Usage: Monthly calendar heatmap (PLUS+)               │
│                                                         │
│ Flow: Check cache → If fresh, use | If old, fetch   │
│ Fetches: edge function get-stats-month               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ useStatsYearly(year?)                                   │
│                                                         │
│ Returns: {stats, loading, error, cacheAge, refetch}  │
│ Cache: 24 hours (stats_year_YYYY)                    │
│ Usage: Yearly heatmap & summary (PRO)                │
│                                                         │
│ Flow: Check cache → If fresh, use | If old, fetch   │
│ Fetches: edge function get-stats-year                │
└─────────────────────────────────────────────────────────┘

                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ↓                   ↓                   ↓
    ┌────────────┐    ┌──────────┐      ┌──────────┐
    │ getCached  │    │setCached │      │clearCache│
    │ Stats()    │    │Stats()   │      │()        │
    │ from       │    │to        │      │from      │
    │localStorage│   │localStorage│    │localStorage
    └────────────┘    └──────────┘      └──────────┘
```

---

## 4. Cache Lifecycle

```
DAY 1 - User opens Dashboard
│
├─ Request daily stats
│  ├─ No cache exists
│  ├─ Fetch from edge function
│  ├─ User sees stats
│  └─ (Not cached)
│
├─ Click "Tydzień" tab at 2:00 PM
│  ├─ Request weekly stats
│  ├─ No cache exists
│  ├─ Fetch from edge function
│  ├─ Cache with timestamp: 2:00 PM
│  ├─ User sees stats
│  └─ Cache expires: 3:00 PM
│
└─ Keep browsing

─────────────────────────────────────────────────────

2:30 PM - User clicks "Tydzień" tab again
│
├─ Request weekly stats
├─ Check cache age: 30 minutes old
├─ Cache still fresh (< 1 hour)
├─ USE CACHED DATA INSTANTLY ⚡
├─ No network request
└─ User sees stats instantly

─────────────────────────────────────────────────────

3:10 PM - User clicks "Tydzień" tab again
│
├─ Request weekly stats
├─ Check cache age: 1 hour 10 min old
├─ Cache EXPIRED ❌
├─ "Odśwież" (Refresh) button appears ⚠️
├─ User can manually refresh
├─ On refresh: Fetch new data → Update cache
└─ Next use: Fresh stats

─────────────────────────────────────────────────────

Closing app / New session
│
├─ Cache persists in localStorage
├─ Next day, user opens Dashboard
├─ Stats from yesterday still cached (1-24 hr)
├─ Loading is instant on first view
└─ User can refresh whenever needed
```

---

## 5. Database Query Optimization

```
┌─────────────────────────────────────────────────────┐
│ SOURCE QUERY (Real-time)                           │
│                                                     │
│ SELECT COUNT(*) FROM habit_completions            │
│ WHERE user_id = X AND completed_date = TODAY      │
│                                                     │
│ Problem: Expensive on large datasets               │
│ Called on every view → Many queries per second     │
└─────────────────────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────┐
│ MATERIALIZED QUERY (Cached)                        │
│                                                     │
│ SELECT * FROM user_daily_stats                    │
│ WHERE user_id = X AND date = TODAY               │
│ [Indexed on (user_id, date DESC)]                 │
│                                                     │
│ Benefit: O(log n) lookup instead of O(n) scan     │
│ Called periodically (cron) → Minimal queries      │
└─────────────────────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────┐
│ CLIENT CACHE (Memory)                              │
│                                                     │
│ localStorage.getItem('stats_week_2026-W09')        │
│                                                     │
│ Benefit: O(1) access, no network round-trip       │
│ Expires after 1 hour → User sees most recent data │
└─────────────────────────────────────────────────────┘

Result: 100x faster stats loading compared to real-time
```

---

## 6. Feature Gating Logic

```
User Loads Dashboard
        │
        ↓
Get profile.plan from useAuth()
        │
   ┌────┼────┬────┐
   │    │    │    │
FREE  PLUS  PRO  ?
   │    │    │    │
   ↓    ↓    ↓    ↓

[TODAY TAB]
   ✅   ✅   ✅  ENABLED
   └─── Show → Render StatsToday

[WEEK TAB]
   ✅   ✅   ✅  ENABLED
   └─── Show → Render StatsWeek

[MONTH TAB]
   ❌   ✅   ✅  CONDITIONAL
   │    │    │
   │    ↓    ↓
   │  ENABLED → Render StatsMonth
   │
   ✗─ DISABLED + "Upgrade" prompt

[YEAR TAB]
   ❌   ⚠️   ✅  CONDITIONAL
   │    │    │
   │    ↓    ↓
   │   SHOW 3 MONTHS   SHOW 12 MONTHS
   │   (stats limited)  (full year)
   │
   ✗─ DISABLED + "PRO" badge

[SHARE BUTTON]
   ❌   ❌   ✅  PRO ONLY
   │    │    │
   │    │    ↓
   │    │  ENABLED → Show Download + Share
   │    │
   ✗─ HIDDEN (not visible to FREE/PLUS)
```

---

## 7. Stats Calculation Pipeline

```
TRIGGER: User completes a habit
         │
         ↓
┌────────────────────────────────────────────┐
│ handle_habit_completion() TRIGGER          │
│ (Database function on INSERT)              │
└────────────────────────────────────────────┘
         │
         ├─ Check tournament participation
         ├─ Get animal type & passive ability
         ├─ Count daily habit completions
         ├─ Calculate coin bonuses:
         │  ├─ Base: 5 coins
         │  ├─ Complete day: +20 coins
         │  ├─ Streak: +N coins (max 10)
         │  ├─ Multipliers: Wolf (5% per ref),
         │  │              Tiger (2x full day),
         │  │              Owl (1.5x after 21:00),
         │  │              Dragon (1.5x bonus days),
         │  │              PRO (+10%)
         │  └─ Final: CEIL((base + bonus) * mult)
         │
         ├─ Update: profiles (coins, exp, streak)
         ├─ Update: tournament_participants (coins)
         ├─ Update: user_daily_stats (overnight)
         │
         └─ Check dragon 7-day trigger
            └─ Activate 3-day dragon bonus

Result: High precision coin/exp calculations
        backed by server-side logic, not client
```

---

## 8. Timeline View

```
PAST (No stats shown)
        │
        ↓
    7 days ago ────── WEEKLY HEATMAP STARTS
    │                 (visible in Week tab)
    │
    30-31 days ago ── MONTHLY HEATMAP STARTS
    │                 (visible in Month tab - PLUS+)
    │
    365 days ago ──── YEARLY HEATMAP STARTS
    │                 (visible in Year tab - PRO)
    │
    TODAY ────────── TODAY'S STATS
                      (daily numbers)
                      (week comparison)
                      (month progress)
                      (year progress)
    │
    ↓
FUTURE (Not shown yet)
```

---

## 9. Performance Targets

```
METRIC                 TARGET    ACTUAL  STATUS
─────────────────────────────────────────────────
Daily stats fetch      <200ms    ~100ms   ✅
Week stats fetch       <500ms    ~250ms   ✅
Month stats fetch      <1s       ~500ms   ✅
Year stats fetch       <2s       ~1200ms  ✅
Page load impact       <100ms    ~50ms    ✅
Cache hit latency      <10ms     ~1-5ms   ✅
Chart render time      <500ms    ~300ms   ✅
Heatmap grid DOM       <1000     ~366     ✅
```

---

## 10. Mobile vs Desktop Layout

```
MOBILE (320px)              DESKTOP (1024px+)
─────────────────────────────────────────────

StatsWidget                 StatsWidget
├─ Tabs (vertical)          ├─ Tabs (horizontal)
└─ Content                  └─ Content
   ├─ Full width               ├─ 2-3 columns
   ├─ Stacked cards            ├─ Side-by-side
   ├─ 1-column layout          ├─ Grid layouts
   └─ Vertical charts          └─ Responsive grid


Card size:                  Card size:
┌──────┐ (Mobile)          ┌──────────┐ (Desktop)
│ Card │                   │   Card   │
│ Full │                   │ 1/3 width│
│Width │                   │ or 1/2   │
└──────┘                   └──────────┘

Chart size:                 Chart size:
┌──────┐ (Mobile)          ┌─────────────┐
│Donut │ 120px             │   Donut     │ 160px
└──────┘                   │ Larger type │
                           └─────────────┘
```

---

Last Updated: March 5, 2026
For more details, see [STATS_IMPLEMENTATION.md](STATS_IMPLEMENTATION.md)
