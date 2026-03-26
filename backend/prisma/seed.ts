import { PrismaClient, FrequencyType, LogStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('graceday123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@graceday.app' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@graceday.app',
      passwordHash,
    },
  });

  console.log('Created user:', user.email);

  const habits = await Promise.all([
    prisma.habit.create({
      data: {
        userId: user.id,
        name: 'Morning Meditation',
        description: '10 minutes of mindfulness',
        frequencyType: FrequencyType.DAILY,
        hasGraceDay: true,
      },
    }),
    prisma.habit.create({
      data: {
        userId: user.id,
        name: 'Read 20 Pages',
        description: 'Non-fiction only',
        frequencyType: FrequencyType.DAILY,
        hasGraceDay: true,
      },
    }),
    prisma.habit.create({
      data: {
        userId: user.id,
        name: 'Exercise',
        description: '30 min cardio or strength',
        frequencyType: FrequencyType.CUSTOM,
        customDays: ['Mon', 'Wed', 'Fri'],
        hasGraceDay: false,
      },
    }),
  ]);

  console.log(`Created ${habits.length} habits`);

  // Seed last 14 days of logs for first habit
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const status = i === 5 ? LogStatus.GRACE : LogStatus.COMPLETED;
    await prisma.habitLog.upsert({
      where: { habitId_date: { habitId: habits[0].id, date } },
      update: {},
      create: { habitId: habits[0].id, date, status },
    });
  }

  console.log('Seeding complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
