// Cache keys for statistics
export const STATS_CACHE_KEYS = {
  WEEK: (year: number, week: number) => `stats_week_${year}-W${week}`,
  MONTH: (year: number, month: number) =>
    `stats_month_${year}-${String(month).padStart(2, "0")}`,
  YEAR: (year: number) => `stats_year_${year}`,
};

// Cache durations in milliseconds
export const CACHE_DURATION = {
  DAILY: 15 * 60 * 1000, // 15 minutes
  WEEK: 60 * 60 * 1000, // 1 hour
  MONTH: 60 * 60 * 1000, // 1 hour
  YEAR: 24 * 60 * 60 * 1000, // 24 hours
};

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function getCachedStats<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    const age = Date.now() - entry.timestamp;

    // Determine cache duration based on key
    let duration = CACHE_DURATION.WEEK;
    if (key.includes("stats_month")) duration = CACHE_DURATION.MONTH;
    if (key.includes("stats_year")) duration = CACHE_DURATION.YEAR;

    if (age < duration) {
      return entry.data;
    }

    // Cache expired
    localStorage.removeItem(key);
    return null;
  } catch {
    return null;
  }
}

export function setCachedStats<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function clearStatsCache(pattern?: string): void {
  try {
    if (!pattern) {
      Object.keys(localStorage)
        .filter((key) => key.startsWith("stats_"))
        .forEach((key) => localStorage.removeItem(key));
    } else {
      const keys = Object.keys(localStorage).filter((key) =>
        key.includes(pattern),
      );
      keys.forEach((key) => localStorage.removeItem(key));
    }
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function isCacheExpired(timestamp: number, duration: number): boolean {
  return Date.now() - timestamp > duration;
}

export function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getWeekDateRange(year: number, week: number) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());

  const weekStart = new Date(ISOweekStart);
  const weekEnd = new Date(ISOweekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  return {
    start: weekStart.toISOString().split("T")[0],
    end: weekEnd.toISOString().split("T")[0],
  };
}

export function dateToString(date: Date | string): string {
  if (typeof date === "string") return date;
  return date.toISOString().split("T")[0];
}

export function getMonthName(month: number, locale: string = "pl"): string {
  const date = new Date(2024, month - 1, 1);
  return date.toLocaleDateString(locale, { month: "long" });
}

export function getDayName(dayOfWeek: number, locale: string = "pl"): string {
  const days =
    locale === "pl"
      ? [
          "Niedziela",
          "Poniedziałek",
          "Wtorek",
          "Środa",
          "Czwartek",
          "Piątek",
          "Sobota",
        ]
      : [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
  return days[dayOfWeek];
}
