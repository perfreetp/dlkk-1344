import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Trip, Medication, MenuPlan } from '@/types';
import { generateId } from '@/utils/storage';

interface ScheduleState {
  trips: Trip[];
  medications: Medication[];
  menuPlan: MenuPlan | null;
  addTrip: (trip: Omit<Trip, 'id'>) => void;
  updateTrip: (id: string, trip: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  toggleTripChecklist: (tripId: string, itemId: string) => void;
  addMedication: (medication: Omit<Medication, 'id'>) => void;
  updateMedication: (id: string, medication: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  setMenuPlan: (plan: MenuPlan) => void;
  updateMeal: (day: number, type: 'breakfast' | 'lunch' | 'dinner', dishes: string[]) => void;
}

const defaultTrips: Trip[] = [
  {
    id: 'trip-1',
    name: '暑假海边之旅',
    startDate: '2025-07-15',
    endDate: '2025-07-20',
    destination: '青岛',
    budget: 5000,
    checklist: [
      { id: 'c1', text: '泳衣', done: false },
      { id: 'c2', text: '防晒霜', done: true },
      { id: 'c3', text: '身份证', done: false },
    ],
    note: '全家一起去海边度假',
  },
];

const defaultMedications: Medication[] = [
  {
    id: 'med-1',
    name: '维生素D',
    memberId: 'member-3',
    dosage: '1粒',
    times: ['08:00'],
    frequency: 'daily',
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    note: '每天早上吃',
  },
];

const defaultMenuPlan: MenuPlan = {
  weekStart: '2024-01-01',
  meals: [],
};

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      trips: defaultTrips,
      medications: defaultMedications,
      menuPlan: defaultMenuPlan,
      addTrip: (trip) =>
        set((state) => ({
          trips: [...state.trips, { ...trip, id: generateId() }],
        })),
      updateTrip: (id, trip) =>
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === id ? { ...t, ...trip } : t
          ),
        })),
      deleteTrip: (id) =>
        set((state) => ({
          trips: state.trips.filter((t) => t.id !== id),
        })),
      toggleTripChecklist: (tripId, itemId) =>
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === tripId
              ? {
                  ...t,
                  checklist: t.checklist.map((c) =>
                    c.id === itemId ? { ...c, done: !c.done } : c
                  ),
                }
              : t
          ),
        })),
      addMedication: (medication) =>
        set((state) => ({
          medications: [...state.medications, { ...medication, id: generateId() }],
        })),
      updateMedication: (id, medication) =>
        set((state) => ({
          medications: state.medications.map((m) =>
            m.id === id ? { ...m, ...medication } : m
          ),
        })),
      deleteMedication: (id) =>
        set((state) => ({
          medications: state.medications.filter((m) => m.id !== id),
        })),
      setMenuPlan: (plan) =>
        set(() => ({
          menuPlan: plan,
        })),
      updateMeal: (day, type, dishes) =>
        set((state) => {
          if (!state.menuPlan) return state;
          const existingIndex = state.menuPlan.meals.findIndex(
            (m) => m.day === day && m.type === type
          );
          let newMeals = [...state.menuPlan.meals];
          if (existingIndex >= 0) {
            newMeals[existingIndex] = { day, type, dishes };
          } else {
            newMeals.push({ day, type, dishes });
          }
          return {
            menuPlan: { ...state.menuPlan, meals: newMeals },
          };
        }),
    }),
    {
      name: 'family-space-schedule',
    }
  )
);
