import { Mascot } from "@/data/mascots";
import { getStreak, XPByDay } from "@/lib/streak";

// Rewards for learning regularly:
//   - Daily chest: earned when today's XP reach the daily goal.
//     It holds one mascot piece.
//   - Weekly chest: earned for every 7 days learned in a row.
//     It holds three mascot pieces.
// Four pieces complete a mascot. Pieces fill the collectible mascots one
// after the other, so the learner always works towards the next one.
// An earned chest waits until it is opened. It is never taken away.
//
// Everything here is plain logic without screens, so it is easy to test.

export const PARTS_PER_MASCOT = 4;
export const DAILY_PARTS = 1;
export const WEEKLY_PARTS = 3;
export const WEEK_LENGTH = 7; // days in a row for one weekly chest
// When every mascot is collected, a chest gives bonus XP instead
export const DAILY_BONUS_XP = 10;
export const WEEKLY_BONUS_XP = 30;

export type ChestKind = "daily" | "weekly";

// ── Earning chests ──

// Which chests the learner earned with XP that was just added.
// `xpBefore` is the XP per day before, `xpAfter` with the new XP.
export function getEarnedChests(
  xpBefore: XPByDay,
  xpAfter: XPByDay,
  today: string,
  dailyGoal: number,
): { daily: boolean; weekly: boolean } {
  // Daily: today's XP just crossed the goal (only once a day)
  const before = xpBefore[today] ?? 0;
  const after = xpAfter[today] ?? 0;
  const daily = before < dailyGoal && after >= dailyGoal;

  // Weekly: the streak just grew to 7, 14, 21 … days.
  // It only grows with the first XP of a day, so this is once a day too.
  const streakBefore = getStreak(xpBefore, today);
  const streakAfter = getStreak(xpAfter, today);
  const weekly = streakAfter > streakBefore && streakAfter % WEEK_LENGTH === 0;

  return { daily, weekly };
}

// ── Showing chests ──

//   locked - not earned yet
//   ready  - earned, waits to be opened
//   opened - opened, the next one is not earned yet
export type ChestState = "locked" | "ready" | "opened";

export function getDailyChestState(
  xpToday: number,
  dailyGoal: number,
  waitingDailyChests: number,
): ChestState {
  if (waitingDailyChests > 0) return "ready";
  // Goal reached and nothing waits: today's chest was opened already
  return xpToday >= dailyGoal ? "opened" : "locked";
}

export function getWeeklyChestState(
  streak: number,
  waitingWeeklyChests: number,
): ChestState {
  if (waitingWeeklyChests > 0) return "ready";
  // A full week and nothing waits: this week's chest was opened already
  return streak > 0 && streak % WEEK_LENGTH === 0 ? "opened" : "locked";
}

// Days of the current streak week that are done: 0 … 7.
// It stays at 7 until the first day of the next week is learned.
export function getWeekProgress(streak: number, waitingWeeklyChests: number): number {
  return getWeeklyChestState(streak, waitingWeeklyChests) === "locked"
    ? streak % WEEK_LENGTH
    : WEEK_LENGTH;
}

// How many more days in a row are needed for the next weekly chest
export function getDaysToWeeklyChest(streak: number): number {
  return WEEK_LENGTH - (streak % WEEK_LENGTH);
}

// ── Collecting mascots ──

export interface MascotStatus {
  mascot: Mascot;
  parts: number; // 0 … PARTS_PER_MASCOT
  isUnlocked: boolean;
}

// How many pieces can be collected at all
export function getMaxParts(mascots: Mascot[]): number {
  return mascots.filter((mascot) => !mascot.isStarter).length * PARTS_PER_MASCOT;
}

// How far every mascot is with the given number of collected pieces
export function getMascotStatuses(
  mascots: Mascot[],
  collectedParts: number,
): MascotStatus[] {
  let left = Math.max(0, collectedParts);

  return mascots.map((mascot) => {
    if (mascot.isStarter) {
      return { mascot, parts: PARTS_PER_MASCOT, isUnlocked: true };
    }
    const parts = Math.min(PARTS_PER_MASCOT, left);
    left -= parts;
    return { mascot, parts, isUnlocked: parts === PARTS_PER_MASCOT };
  });
}

// ── What is inside a chest ──

// A mascot that received pieces from a chest
export interface MascotChange {
  mascot: Mascot;
  before: number; // pieces before the chest
  after: number; // pieces now
  isUnlocked: boolean; // this chest completed the mascot
}

export interface Reward {
  kind: ChestKind;
  parts: number; // pieces received (0 when everything is collected already)
  bonusXP: number; // given instead of pieces when nothing is left to collect
  changes: MascotChange[]; // in collection order
}

export function buildReward(
  mascots: Mascot[],
  collectedParts: number,
  kind: ChestKind,
): Reward {
  const wanted = kind === "daily" ? DAILY_PARTS : WEEKLY_PARTS;
  const parts = Math.min(wanted, getMaxParts(mascots) - collectedParts);

  if (parts <= 0) {
    return {
      kind,
      parts: 0,
      bonusXP: kind === "daily" ? DAILY_BONUS_XP : WEEKLY_BONUS_XP,
      changes: [],
    };
  }

  const before = getMascotStatuses(mascots, collectedParts);
  const after = getMascotStatuses(mascots, collectedParts + parts);
  const changes = after
    .map((status, index) => ({
      mascot: status.mascot,
      before: before[index].parts,
      after: status.parts,
      isUnlocked: status.isUnlocked,
    }))
    .filter((change) => change.after !== change.before);

  return { kind, parts, bonusXP: 0, changes };
}
