import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface LearningState {
  xpToday: number;
  dailyGoal: number;
  streak: number;
  completedLessonIds: string[];
  addXP: (amount: number) => void;
  completeLesson: (lessonId: string) => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set) => ({
      xpToday: 0,
      dailyGoal: 20,
      streak: 0,
      completedLessonIds: [],
      addXP: (amount) =>
        set((state) => ({
          xpToday: state.xpToday + amount,
        })),
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
    }
  )
);

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
