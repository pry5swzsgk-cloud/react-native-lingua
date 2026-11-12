import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { SmartModelKey } from "@/data/smartModels";

interface SmartModeState {
  // The learner chose Smart Dax (the teacher with a language model)
  enabled: boolean;
  // Which model it uses
  modelKey: SmartModelKey;
  setEnabled: (enabled: boolean) => void;
  setModelKey: (modelKey: SmartModelKey) => void;
}

export const useSmartModeStore = create<SmartModeState>()(
  persist(
    (set) => ({
      enabled: false,
      modelKey: "standard",
      setEnabled: (enabled) => set({ enabled }),
      setModelKey: (modelKey) => set({ modelKey }),
    }),
    {
      name: "smart-mode-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
