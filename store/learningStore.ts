import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { DEFAULT_MASCOT_ID, MascotId, MASCOTS } from "@/data/mascots";
import { addDays, getToday } from "@/lib/dates";
import {
  ActivityByDay,
  buildReward,
  ChestKind,
  countLevelsOn,
  DAILY_LEVEL_GOAL,
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
  // What was done on each day: "level:<lessonId>", "training:<mode>",
  // "scene:<sceneId>". Only the last 14 days are kept.
  activityByDay: ActivityByDay;
  totalXP: number;
  longestStreak: number;
  // Reward chests that were earned and wait to be opened (lib/rewards.ts)
  dailyChests: number;
  weeklyChests: number;
  // Mascot pieces collected from chests
  mascotParts: number;
  // The mascot the learner picked in the profile
  selectedMascotId: MascotId;
  // Mistakes still to practise: "<lang>|<word or sentence>" -> times wrong
  mistakes: Record<string, number>;
  // Units the learner has mastered (Master level)
  masteredUnitIds: string[];
  // Story scenes the learner has finished
  completedSceneIds: string[];
  addXP: (amount: number) => void;
  // Notes something done today; the 3rd level of a day earns the daily chest
  recordActivity: (id: string) => void;
  completeLesson: (lessonId: string) => void;
  // Opens a waiting chest and returns what was inside (null if none waits)
  openChest: (kind: ChestKind) => Reward | null;
  selectMascot: (mascotId: MascotId) => void;
  // Counts one more mistake for this key
  recordMistake: (key: string) => void;
  // Counts one mistake less; the entry is removed at 0
  resolveMistake: (key: string) => void;
  masterUnit: (unitId: string) => void;
  completeScene: (sceneId: string) => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      dailyGoal: 20,
      completedLessonIds: [],
      xpByDay: {},
      activityByDay: {},
      totalXP: 0,
      longestStreak: 0,
      dailyChests: 0,
      weeklyChests: 0,
      mascotParts: 0,
      selectedMascotId: DEFAULT_MASCOT_ID,
      mistakes: {},
      masteredUnitIds: [],
      completedSceneIds: [],
      addXP: (amount) =>
        set((state) => {
          const today = getToday();
          const xpByDay = {
            ...state.xpByDay,
            [today]: (state.xpByDay[today] ?? 0) + amount,
          };
          // A full week of learning earns a chest
          const earned = getEarnedChests(state.xpByDay, xpByDay, today);
          return {
            xpByDay,
            totalXP: state.totalXP + amount,
            longestStreak: Math.max(
              state.longestStreak,
              getStreak(xpByDay, today),
            ),
            weeklyChests: state.weeklyChests + (earned.weekly ? 1 : 0),
          };
        }),
      recordActivity: (id) =>
        set((state) => {
          const today = getToday();
          const oldest = addDays(today, -13);
          // Keep today and the 13 days before it
          const activityByDay: ActivityByDay = {};
          for (const [day, ids] of Object.entries(state.activityByDay)) {
            if (day >= oldest) activityByDay[day] = ids;
          }
          activityByDay[today] = [...(activityByDay[today] ?? []), id];

          // The 3rd level of the day earns the daily chest (only once)
          const reachedGoal =
            id.startsWith("level:") &&
            countLevelsOn(state.activityByDay, today) === DAILY_LEVEL_GOAL - 1;
          return {
            activityByDay,
            dailyChests: state.dailyChests + (reachedGoal ? 1 : 0),
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
      recordMistake: (key) =>
        set((state) => ({
          mistakes: { ...state.mistakes, [key]: (state.mistakes[key] ?? 0) + 1 },
        })),
      resolveMistake: (key) =>
        set((state) => {
          const count = state.mistakes[key];
          if (count === undefined) return {};
          const { [key]: removed, ...rest } = state.mistakes;
          void removed;
          return { mistakes: count > 1 ? { ...rest, [key]: count - 1 } : rest };
        }),
      masterUnit: (unitId) =>
        set((state) =>
          state.masteredUnitIds.includes(unitId)
            ? {}
            : { masteredUnitIds: [...state.masteredUnitIds, unitId] },
        ),
      completeScene: (sceneId) =>
        set((state) =>
          state.completedSceneIds.includes(sceneId)
            ? {}
            : { completedSceneIds: [...state.completedSceneIds, sceneId] },
        ),
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
