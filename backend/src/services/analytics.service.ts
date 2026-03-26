import { PrismaClient, LogStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function getWeeklyAnalytics(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = [];

  for (let weekOffset = 3; weekOffset >= 0; weekOffset--) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() - weekOffset * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const logs = await prisma.habitLog.findMany({
      where: {
        habit: { userId, isActive: true },
        date: { gte: weekStart, lte: weekEnd },
      },
    });

    const completed = logs.filter((l) => l.status === LogStatus.COMPLETED || l.status === LogStatus.GRACE).length;
    const total = logs.length;

    result.push({
      label: `W${4 - weekOffset}`,
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  }

  return result;
}

export async function getMonthlyAnalytics(userId: string) {
  const today = new Date();
  const result = [];

  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const d = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

    const logs = await prisma.habitLog.findMany({
      where: {
        habit: { userId, isActive: true },
        date: { gte: monthStart, lte: monthEnd },
      },
    });

    const completed = logs.filter((l) => l.status === LogStatus.COMPLETED || l.status === LogStatus.GRACE).length;
    const total = logs.length;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    result.push({
      label: months[d.getMonth()],
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  }

  return result;
}

export async function getDashboardStats(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const habits = await prisma.habit.findMany({ where: { userId, isActive: true } });

  const todayLogs = await prisma.habitLog.findMany({
    where: {
      habit: { userId },
      date: today,
    },
  });

  const completedToday = todayLogs.filter(
    (l) => l.status === LogStatus.COMPLETED || l.status === LogStatus.GRACE
  ).length;

  // This month completion
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthLogs = await prisma.habitLog.findMany({
    where: {
      habit: { userId, isActive: true },
      date: { gte: monthStart, lte: today },
    },
  });

  const monthCompleted = monthLogs.filter(
    (l) => l.status === LogStatus.COMPLETED || l.status === LogStatus.GRACE
  ).length;

  const monthTotal = monthLogs.length;
  const graceUsed = monthLogs.filter((l) => l.status === LogStatus.GRACE).length;

  return {
    totalHabits: habits.length,
    completedToday,
    monthCompletionRate: monthTotal > 0 ? Math.round((monthCompleted / monthTotal) * 100) : 0,
    graceUsedThisMonth: graceUsed,
  };
}
