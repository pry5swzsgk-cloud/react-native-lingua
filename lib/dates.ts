// Days are identified by their local date as text, for example "2026-11-11".
// Local time, not UTC: a lesson at 23:30 still belongs to "today" for the
// learner, wherever they live.

export function toDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getToday(): string {
  return toDayKey(new Date());
}

function toDate(dayKey: string): Date {
  const [year, month, day] = dayKey.split("-").map(Number);
  // Noon keeps the date stable on days when the clocks change
  return new Date(year, month - 1, day, 12);
}

// The day a number of days after the given one (before it, if negative)
export function addDays(dayKey: string, amount: number): string {
  const date = toDate(dayKey);
  date.setDate(date.getDate() + amount);
  return toDayKey(date);
}

// The last `count` days ending with `today`, oldest first
export function getLastDays(today: string, count: number): string[] {
  const days: string[] = [];
  for (let back = count - 1; back >= 0; back--) days.push(addDays(today, -back));
  return days;
}

const WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

// "M" for a Monday, "T" for a Tuesday …
export function getWeekdayLetter(dayKey: string): string {
  return WEEKDAY_LETTERS[toDate(dayKey).getDay()];
}
