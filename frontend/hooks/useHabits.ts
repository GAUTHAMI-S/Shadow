import { useEffect } from 'react';
import { useHabitStore } from '@/store/habitStore';

export function useHabits() {
  const store = useHabitStore();

  useEffect(() => {
    if (store.habits.length === 0 && !store.isLoading) {
      store.fetchHabits();
    }
  }, []);

  const todayHabits = store.habits;
  const completed = todayHabits.filter(
    (h) => h.todayStatus === 'COMPLETED' || h.todayStatus === 'GRACE'
  );
  const pending = todayHabits.filter(
    (h) => h.todayStatus !== 'COMPLETED' && h.todayStatus !== 'GRACE'
  );

  return {
    ...store,
    todayHabits,
    completed,
    pending,
    completionPct:
      todayHabits.length > 0
        ? Math.round((completed.length / todayHabits.length) * 100)
        : 0,
  };
}
