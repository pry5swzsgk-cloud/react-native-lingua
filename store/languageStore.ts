import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { LanguageCode } from "@/types/learning";

interface LanguageState {
  selectedLanguage: LanguageCode | null;
  // Where the learner starts per language: 1 = A1, 2 = A2, 3 = B1
  startUnitOrders: Partial<Record<LanguageCode, number>>;
  setSelectedLanguage: (code: LanguageCode) => void;
  setStartUnitOrder: (code: LanguageCode, order: number) => void;
  clearSelectedLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      selectedLanguage: null,
      startUnitOrders: {},
      setSelectedLanguage: (code) => set({ selectedLanguage: code }),
      setStartUnitOrder: (code, order) =>
        set((state) => ({
          startUnitOrders: { ...state.startUnitOrders, [code]: order },
        })),
      clearSelectedLanguage: () => set({ selectedLanguage: null }),
    }),
    {
      name: "language-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// The starting unit of the currently selected language (1 when nothing is set).
export function useStartUnitOrder(): number {
  return useLanguageStore((state) =>
    state.selectedLanguage
      ? (state.startUnitOrders[state.selectedLanguage] ?? 1)
      : 1,
  );
}
