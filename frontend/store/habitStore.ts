import { create } from 'zustand';
import api from '@/lib/api';
import { Habit, HabitFormData, LogStatus } from '@/lib/types';
import { format } from 'date-fns';

interface HabitState {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;
  fetchHabits: () => Promise<void>;
  createHabit: (data: HabitFormData) => Promise<void>;
  updateHabit: (id: string, data: Partial<HabitFormData>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  logHabit: (id: string, status: LogStatus, date?: Date) => Promise<void>;
  clearError: () => void;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  isLoading: false,
  error: null,

  fetchHabits: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/habits');
      set({ habits: data.data.habits, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to load habits', isLoading: false });
    }
  },

  createHabit: async (formData) => {
    const { data } = await api.post('/habits', formData);
    const streak = { current: 0, longest: 0, graceUsed: 0 };
    set((state) => ({
      habits: [...state.habits, { ...data.data.habit, streak, todayStatus: null }],
    }));
  },

  updateHabit: async (id, formData) => {
    const { data } = await api.patch(`/habits/${id}`, formData);
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === id ? { ...h, ...data.data.habit } : h
      ),
    }));
  },

  deleteHabit: async (id) => {
    await api.delete(`/habits/${id}`);
    set((state) => ({ habits: state.habits.filter((h) => h.id !== id) }));
  },

  logHabit: async (id, status, date = new Date()) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const { data } = await api.post(`/habits/${id}/log`, { date: dateStr, status });
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === id
          ? { ...h, todayStatus: status, streak: data.data.streak }
          : h
      ),
    }));
  },

  clearError: () => set({ error: null }),
}));
