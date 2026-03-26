export type FrequencyType = 'DAILY' | 'CUSTOM';
export type LogStatus = 'COMPLETED' | 'MISSED' | 'GRACE';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface StreakData {
  current: number;
  longest: number;
  graceUsed: number;
}

export interface Habit {
  id: string;
  name: string;
  description: string | null;
  frequencyType: FrequencyType;
  customDays: string[];
  hasGraceDay: boolean;
  isActive: boolean;
  createdAt: string;
  streak: StreakData;
  todayStatus: LogStatus | null;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  status: LogStatus;
  createdAt: string;
}

export interface HabitFormData {
  name: string;
  description?: string;
  frequencyType: FrequencyType;
  customDays: string[];
  hasGraceDay: boolean;
}

export interface CalendarDay {
  completed: number;
  missed: number;
  grace: number;
  total: number;
}

export type CalendarData = Record<string, CalendarDay>;

export interface DashboardStats {
  totalHabits: number;
  completedToday: number;
  monthCompletionRate: number;
  graceUsedThisMonth: number;
}

export interface ChartPoint {
  label: string;
  completed: number;
  total: number;
  percentage: number;
}
