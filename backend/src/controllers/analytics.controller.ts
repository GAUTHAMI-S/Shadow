import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { getWeeklyAnalytics, getMonthlyAnalytics, getDashboardStats } from '../services/analytics.service';
import { calculateStreak } from '../services/streak.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await getDashboardStats(req.userId!);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

export const getWeekly = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await getWeeklyAnalytics(req.userId!);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getMonthly = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await getMonthlyAnalytics(req.userId!);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getAllStreaks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.userId!, isActive: true },
    });

    const streaks = await Promise.all(
      habits.map(async (h) => {
        const streak = await calculateStreak(h.id);
        return { habitId: h.id, habitName: h.name, ...streak };
      })
    );

    const best = streaks.reduce((a, b) => (a.current > b.current ? a : b), streaks[0] ?? { current: 0 });
    res.json({ success: true, data: { streaks, bestActive: best } });
  } catch (err) {
    next(err);
  }
};
