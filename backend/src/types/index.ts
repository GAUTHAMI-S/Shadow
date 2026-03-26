import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface StreakData {
  current: number;
  longest: number;
  graceUsed: number;
}

export interface HabitWithStreak {
  id: string;
  name: string;
  description: string | null;
  frequencyType: string;
  customDays: string[];
  hasGraceDay: boolean;
  isActive: boolean;
  createdAt: Date;
  streak: StreakData;
  todayStatus: string | null;
}
