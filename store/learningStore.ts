import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { DEFAULT_MASCOT_ID, MascotId, MASCOTS } from "@/data/mascots";
import { getToday } from "@/lib/dates";
import {
  buildReward,
  ChestKind,
  getEarnedChests,
  getMascotStatuses,
  Reward,
} from "@/lib/rewards";
import { getStreak, XPByDay } from "@/lib/streak";

interface LearningState {
  dailyGoal: number;
  completedLessonIds: string[];
  // XP earned on each day, by local date: { "2026-11-11": 30 }.
  // Today's XP and the streak are worked out from this.
  xpByDay: XPByDay;
  totalXP: number;
  longestStreak: number;
  // Reward chests that were earned and wait to be opened (lib/rewards.ts)
  dailyChests: number;
  weeklyChests: number;
  // Mascot pieces collected from chests
  mascotParts: number;
  // The mascot the learner picked in the profile
  selectedMascotId: MascotId;
  addXP: (amount: number) => void;
  completeLesson: (lessonId: string) => void;
  // Opens a waiting chest and returns what was inside (null if none waits)
  openChest: (kind: ChestKind) => Reward | null;
  selectMascot: (mascotId: MascotId) => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      dailyGoal: 20,
      completedLessonIds: [],
      xpByDay: {},
      totalXP: 0,
      longestStreak: 0,
      dailyChests: 0,
      weeklyChests: 0,
      mascotParts: 0,
      selectedMascotId: DEFAULT_MASCOT_ID,
      addXP: (amount) =>
        set((state) => {
          const today = getToday();
          const xpByDay = {
            ...state.xpByDay,
            [today]: (state.xpByDay[today] ?? 0) + amount,
          };
          // Reaching the daily goal or a full week earns a chest
          const earned = getEarnedChests(
            state.xpByDay,
            xpByDay,
            today,
            state.dailyGoal,
          );
          return {
            xpByDay,
            totalXP: state.totalXP + amount,
            longestStreak: Math.max(
              state.longestStreak,
              getStreak(xpByDay, today),
            ),
            dailyChests: state.dailyChests + (earned.daily ? 1 : 0),
            weeklyChests: state.weeklyChests + (earned.weekly ? 1 : 0),
          };
        }),
      completeLesson: (lessonId) =>
        set((state) => ({
          completedLessonIds: state.completedLessonIds.includes(lessonId)
            ? state.completedLessonIds
            : [...state.completedLessonIds, lessonId],
        })),
      openChest: (kind) => {
        const state = get();
        const waiting =
          kind === "daily" ? state.dailyChests : state.weeklyChests;
        if (waiting <= 0) return null;

        const reward = buildReward(MASCOTS, state.mascotParts, kind);
        set({
          dailyChests: state.dailyChests - (kind === "daily" ? 1 : 0),
          weeklyChests: state.weeklyChests - (kind === "weekly" ? 1 : 0),
          mascotParts: state.mascotParts + reward.parts,
          // Bonus XP is a gift: it does not count as learning today
          totalXP: state.totalXP + reward.bonusXP,
        });
        return reward;
      },
      selectMascot: (mascotId) =>
        set((state) => {
          // Only mascots that are complete can be picked
          const status = getMascotStatuses(MASCOTS, state.mascotParts).find(
            (entry) => entry.mascot.id === mascotId,
          );
          return status?.isUnlocked ? { selectedMascotId: mascotId } : {};
        }),
    }),
    {
      name: "learning-storage",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      // Version 0 kept all XP in one number called "xpToday" that never
      // started over, and a streak that never changed. That number becomes
      // the total; daily XP and the streak start counting from now.
      migrate: (saved, version) => {
        const state = (saved ?? {}) as Record<string, unknown>;
        if (version < 1) {
          const { xpToday, streak, ...rest } = state;
          void streak;
          return {
            ...rest,
            totalXP: typeof xpToday === "number" ? xpToday : 0,
            xpByDay: {},
          } as unknown as LearningState;
        }
        return state as unknown as LearningState;
      },
    }
  )
);

// XP earned today
export function useTodayXP(): number {
  return useLearningStore((state) => state.xpByDay[getToday()] ?? 0);
}

// Days in a row with learning (see lib/streak.ts)
export function useStreak(): number {
  return useLearningStore((state) => getStreak(state.xpByDay, getToday()));
}

// True once the saved progress has been read from the device. Screens that
// animate changes in progress wait for this, so loading does not look like
// the learner just finished everything at once.
export function useLearningHydrated(): boolean {
  const [hydrated, setHydrated] = useState(
    useLearningStore.persist.hasHydrated(),
  );

  useEffect(() => {
    if (hydrated) return;
    if (useLearningStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useLearningStore.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);

  return hydrated;
}
