import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface StreakHistory {
  date: string;
  status: string | null;
}

export function useStreak(habitId: string | null) {
  const [history, setHistory] = useState<StreakHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!habitId) return;
    setIsLoading(true);
    api
      .get(`/habits/${habitId}/streak`)
      .then(({ data }) => setHistory(data.data.history))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [habitId]);

  return { history, isLoading };
}
