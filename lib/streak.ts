import { addDays } from "@/lib/dates";

// XP earned on each day, by local date: { "2026-11-11": 30 }
export type XPByDay = Record<string, number>;

// A day counts as a learning day as soon as any XP was earned on it
export function hasLearnedOn(xpByDay: XPByDay, day: string): boolean {
  return (xpByDay[day] ?? 0) > 0;
}

// The day the streak reaches back from: today if the learner already
// learned today, else yesterday. A streak is not lost until a whole day
// has passed without learning.
function getLastStreakDay(xpByDay: XPByDay, today: string): string {
  return hasLearnedOn(xpByDay, today) ? today : addDays(today, -1);
}

// How many days in a row the learner has learned
export function getStreak(xpByDay: XPByDay, today: string): number {
  let day = getLastStreakDay(xpByDay, today);
  let streak = 0;
  while (hasLearnedOn(xpByDay, day)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

// The first day of the current streak, or null when there is none
export function getStreakStart(xpByDay: XPByDay, today: string): string | null {
  const streak = getStreak(xpByDay, today);
  if (streak === 0) return null;
  return addDays(getLastStreakDay(xpByDay, today), -(streak - 1));
}
