"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ThemeState {
  isDarkMode: boolean;
  showClock: boolean;
  setDarkMode: (isDarkMode: boolean) => void;
  setShowClock: (showClock: boolean) => void;
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      showClock: false,
      setDarkMode: (isDarkMode) => set({ isDarkMode }),
      setShowClock: (showClock) => set({ showClock }),
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useThemeStore;
