import { PrismaClient, LogStatus } from '@prisma/client';
import { StreakData } from '../types';

const prisma = new PrismaClient();

/**
 * Determines if a given date is a scheduled day for the habit.
 */
export function isScheduledDay(date: Date, frequencyType: string, customDays: string[]): boolean {
  if (frequencyType === 'DAILY') return true;
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return customDays.includes(dayNames[date.getDay()]);
}

/**
 * Calculates current streak, longest streak, and grace days used this month
 * for a given habit. Grace day logic: one missed scheduled day can be skipped
 * per streak without breaking it, if the habit has hasGraceDay = true.
 */
export async function calculateStreak(habitId: string): Promise<StreakData> {
  const habit = await prisma.habit.findUnique({ where: { id: habitId } });
  if (!habit) return { current: 0, longest: 0, graceUsed: 0 };

  const logs = await prisma.habitLog.findMany({
    where: { habitId },
    orderBy: { date: 'desc' },
  });

  const logMap = new Map<string, LogStatus>();
  logs.forEach((l) => {
    logMap.set(l.date.toISOString().slice(0, 10), l.status);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let current = 0;
  let longest = 0;
  let temp = 0;
  let graceAvailable = habit.hasGraceDay;
  let countingCurrent = true;
  let graceUsedThisMonth = 0;

  // Walk backwards up to 365 days
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toISOString().slice(0, 10);

    if (!isScheduledDay(date, habit.frequencyType, habit.customDays)) {
      continue; // Not a scheduled day — skip, don't break streak
    }

    const status = logMap.get(key);

    if (status === LogStatus.COMPLETED || status === LogStatus.GRACE) {
      temp++;
      if (status === LogStatus.GRACE) {
        const thisMonth = new Date().getMonth();
        if (date.getMonth() === thisMonth) graceUsedThisMonth++;
      }
    } else if (!status && i === 0) {
      // Today not yet logged — don't penalise
      continue;
    } else {
      // Missed
      if (graceAvailable && habit.hasGraceDay) {
        graceAvailable = false; // Use grace day once per streak run
        temp++;
      } else {
        longest = Math.max(longest, temp);
        if (countingCurrent) {
          current = temp;
          countingCurrent = false;
        }
        temp = 0;
        graceAvailable = habit.hasGraceDay; // Reset grace for next streak
      }
    }
  }

  longest = Math.max(longest, temp);
  if (countingCurrent) current = temp;

  return { current, longest, graceUsed: graceUsedThisMonth };
}

/**
 * Returns per-day completion data for the last N days (for heatmap/charts).
 */
export async function getCompletionHistory(
  habitId: string,
  days: number = 30
): Promise<{ date: string; status: string | null }[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const since = new Date(today);
  since.setDate(today.getDate() - days + 1);

  const logs = await prisma.habitLog.findMany({
    where: { habitId, date: { gte: since } },
  });

  const logMap = new Map(logs.map((l) => [l.date.toISOString().slice(0, 10), l.status]));
  const result = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, status: logMap.get(key) ?? null });
  }

  return result;
}
