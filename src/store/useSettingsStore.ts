import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings } from '@/types';

interface SettingsState {
  settings: AppSettings;
  isUnlocked: boolean;
  setPassword: (hash: string | null) => void;
  setTheme: (theme: 'light' | 'warm') => void;
  setLastBackup: (date: string) => void;
  setUnlocked: (unlocked: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: {
        passwordHash: null,
        theme: 'warm',
        lastBackup: null,
      },
      isUnlocked: false,
      setPassword: (hash) =>
        set((state) => ({
          settings: { ...state.settings, passwordHash: hash },
        })),
      setTheme: (theme) =>
        set((state) => ({
          settings: { ...state.settings, theme },
        })),
      setLastBackup: (date) =>
        set((state) => ({
          settings: { ...state.settings, lastBackup: date },
        })),
      setUnlocked: (unlocked) => set({ isUnlocked: unlocked }),
    }),
    {
      name: 'family-space-settings',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
