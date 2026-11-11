import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { getToday } from "@/lib/dates";
import { getStreak, XPByDay } from "@/lib/streak";

interface LearningState {
  dailyGoal: number;
  completedLessonIds: string[];
  // XP earned on each day, by local date: { "2026-11-11": 30 }.
  // Today's XP and the streak are worked out from this.
  xpByDay: XPByDay;
  totalXP: number;
  longestStreak: number;
  addXP: (amount: number) => void;
  completeLesson: (lessonId: string) => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set) => ({
      dailyGoal: 20,
      completedLessonIds: [],
      xpByDay: {},
      totalXP: 0,
      longestStreak: 0,
      addXP: (amount) =>
        set((state) => {
          const today = getToday();
          const xpByDay = {
            ...state.xpByDay,
            [today]: (state.xpByDay[today] ?? 0) + amount,
          };
          return {
            xpByDay,
            totalXP: state.totalXP + amount,
            longestStreak: Math.max(
              state.longestStreak,
              getStreak(xpByDay, today),
            ),
          };
        }),
      completeLesson: (lessonId) =>
        set((state) => ({
          completedLessonIds: state.completedLessonIds.includes(lessonId)
            ? state.completedLessonIds
            : [...state.completedLessonIds, lessonId],
        })),
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
