import { create } from 'zustand';

interface NavigationState {
  targetRoute: string | null;
  targetParams: Record<string, string | number> | null;
  setNavigation: (route: string, params?: Record<string, string | number>) => void;
  clearNavigation: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  targetRoute: null,
  targetParams: null,
  setNavigation: (route, params) =>
    set({ targetRoute: route, targetParams: params || null }),
  clearNavigation: () => set({ targetRoute: null, targetParams: null }),
}));
