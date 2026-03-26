import { Response, NextFunction } from 'express';
import { PrismaClient, LogStatus, FrequencyType } from '@prisma/client';
import { validationResult } from 'express-validator';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../types';
import { calculateStreak, getCompletionHistory } from '../services/streak.service';

const prisma = new PrismaClient();

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.userId!, isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const habitsWithStreak = await Promise.all(
      habits.map(async (habit) => {
        const streak = await calculateStreak(habit.id);
        const todayLog = await prisma.habitLog.findUnique({
          where: { habitId_date: { habitId: habit.id, date: today } },
        });
        return { ...habit, streak, todayStatus: todayLog?.status ?? null };
      })
    );

    res.json({ success: true, data: { habits: habitsWithStreak } });
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const habit = await prisma.habit.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });
    if (!habit) { next(new AppError('Habit not found', 404)); return; }

    const streak = await calculateStreak(habit.id);
    const history = await getCompletionHistory(habit.id, 30);

    res.json({ success: true, data: { habit: { ...habit, streak, history } } });
  } catch (err) {
    next(err);
  }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ success: false, errors: errors.array() }); return; }

    const { name, description, frequencyType, customDays, hasGraceDay } = req.body;

    if (frequencyType === 'CUSTOM' && (!customDays || customDays.length === 0)) {
      next(new AppError('Custom days required for custom frequency', 400));
      return;
    }

    const habit = await prisma.habit.create({
      data: {
        userId: req.userId!,
        name,
        description,
        frequencyType: frequencyType as FrequencyType,
        customDays: customDays ?? [],
        hasGraceDay: hasGraceDay ?? false,
      },
    });

    res.status(201).json({ success: true, data: { habit } });
  } catch (err) {
    next(err);
  }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.habit.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });
    if (!existing) { next(new AppError('Habit not found', 404)); return; }

    const { name, description, frequencyType, customDays, hasGraceDay } = req.body;

    const habit = await prisma.habit.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(frequencyType !== undefined && { frequencyType }),
        ...(customDays !== undefined && { customDays }),
        ...(hasGraceDay !== undefined && { hasGraceDay }),
      },
    });

    res.json({ success: true, data: { habit } });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.habit.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });
    if (!existing) { next(new AppError('Habit not found', 404)); return; }

    // Soft delete
    await prisma.habit.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json({ success: true, message: 'Habit deleted' });
  } catch (err) {
    next(err);
  }
};

export const logCompletion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const habit = await prisma.habit.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });
    if (!habit) { next(new AppError('Habit not found', 404)); return; }

    const { date, status } = req.body;
    if (!['COMPLETED', 'MISSED', 'GRACE'].includes(status)) {
      next(new AppError('Status must be COMPLETED, MISSED, or GRACE', 400));
      return;
    }

    // Validate grace day usage
    if (status === 'GRACE' && !habit.hasGraceDay) {
      next(new AppError('This habit does not have grace day enabled', 400));
      return;
    }

    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    const log = await prisma.habitLog.upsert({
      where: { habitId_date: { habitId: habit.id, date: logDate } },
      create: { habitId: habit.id, date: logDate, status },
      update: { status },
    });

    const streak = await calculateStreak(habit.id);
    res.json({ success: true, data: { log, streak } });
  } catch (err) {
    next(err);
  }
};

export const getStreak = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const habit = await prisma.habit.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });
    if (!habit) { next(new AppError('Habit not found', 404)); return; }

    const streak = await calculateStreak(habit.id);
    const history = await getCompletionHistory(habit.id, 90);
    res.json({ success: true, data: { streak, history } });
  } catch (err) {
    next(err);
  }
};

export const getCalendar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { year, month } = req.query;
    const y = parseInt(year as string) || new Date().getFullYear();
    const m = parseInt(month as string) || new Date().getMonth() + 1;

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0);

    const habits = await prisma.habit.findMany({
      where: { userId: req.userId!, isActive: true },
    });

    const logs = await prisma.habitLog.findMany({
      where: {
        habit: { userId: req.userId! },
        date: { gte: startDate, lte: endDate },
      },
      include: { habit: { select: { name: true } } },
    });

    // Build day-by-day summary
    const dayMap: Record<string, { completed: number; missed: number; grace: number; total: number }> = {};
    logs.forEach((log) => {
      const key = log.date.toISOString().slice(0, 10);
      if (!dayMap[key]) dayMap[key] = { completed: 0, missed: 0, grace: 0, total: 0 };
      dayMap[key].total++;
      if (log.status === LogStatus.COMPLETED) dayMap[key].completed++;
      else if (log.status === LogStatus.MISSED) dayMap[key].missed++;
      else if (log.status === LogStatus.GRACE) dayMap[key].grace++;
    });

    res.json({ success: true, data: { calendar: dayMap, habits: habits.length } });
  } catch (err) {
    next(err);
  }
};
