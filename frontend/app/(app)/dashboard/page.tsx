'use client';
import { useEffect, useState } from 'react';
import { FiPlus, FiZap, FiShield, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import { useHabitStore } from '@/store/habitStore';
import { useAuthStore } from '@/store/authStore';
import StatCard from '@/components/ui/StatCard';
import HabitCard from '@/components/ui/HabitCard';
import HabitModal from '@/components/ui/HabitModal';
import ProgressChart from '@/components/ui/ProgressChart';
import { Habit, ChartPoint } from '@/lib/types';
import api from '@/lib/api';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { habits, isLoading, fetchHabits } = useHabitStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const [weeklyData, setWeeklyData] = useState<ChartPoint[]>([]);

  useEffect(() => {
    fetchHabits();
    api.get('/analytics/weekly').then(({ data }) => setWeeklyData(data.data)).catch(() => {});
  }, []);

  const completed = habits.filter((h) => h.todayStatus === 'COMPLETED' || h.todayStatus === 'GRACE').length;
  const total = habits.length;
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak.current), 0);
  const graceDaysUsed = habits.reduce((sum, h) => sum + (h.streak.graceUsed || 0), 0);

  const handleEdit = (habit: Habit) => {
    setEditHabit(habit);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditHabit(null);
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gd-text">
            Good {getGreeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-sm text-gd-muted mt-0.5">{today}</p>
        </div>
        <button
          onClick={() => { setEditHabit(null); setModalOpen(true); }}
          className="btn-primary flex-shrink-0"
        >
          <FiPlus size={15} />
          <span className="hidden sm:inline">Add Habit</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Today's Progress"
          value={`${completed}/${total}`}
          sub={`${completionPct}% complete`}
          accent="green"
          icon={<FiCheckCircle size={14} />}
        />
        <StatCard
          label="Current Streak"
          value={`${bestStreak}d`}
          sub="Best active streak"
          accent="blue"
          icon={<FiZap size={14} />}
        />
        <StatCard
          label="Grace Days Used"
          value={graceDaysUsed}
          sub="This month"
          accent="amber"
          icon={<FiShield size={14} />}
        />
        <StatCard
          label="Habits Active"
          value={total}
          sub={`${habits.filter(h => h.hasGraceDay).length} with grace`}
          accent="default"
          icon={<FiTrendingUp size={14} />}
        />
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gd-muted font-medium">Today's completion</span>
            <span className="text-xs font-semibold text-gd-accent">{completionPct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completionPct}%` }} />
          </div>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Today's habits */}
        <div className="card">
          <div className="card-title">
            <span className="flex items-center gap-2">
              Today's Habits
              {completed > 0 && (
                <span className="badge-streak">{completed} done</span>
              )}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-gd-surface2 animate-pulse" />
              ))}
            </div>
          ) : habits.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-gd-surface2 flex items-center justify-center mx-auto mb-3">
                <FiPlus size={20} className="text-gd-muted" />
              </div>
              <p className="text-sm text-gd-muted">No habits yet</p>
              <button
                onClick={() => setModalOpen(true)}
                className="mt-3 text-xs text-gd-accent hover:underline"
              >
                Create your first habit
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {habits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} onEdit={handleEdit} />
              ))}
            </div>
          )}
        </div>

        {/* Weekly chart + streak heatmap */}
        <div className="space-y-5">
          <div className="card">
            <div className="card-title">Weekly Progress</div>
            <ProgressChart data={weeklyData} type="bar" height={160} />
          </div>

          {/* Streak overview */}
          <div className="card">
            <div className="card-title">Streak Overview</div>
            <div className="space-y-3">
              {habits.length === 0 ? (
                <p className="text-sm text-gd-muted text-center py-4">No habits tracked yet</p>
              ) : (
                habits.map((h) => (
                  <div key={h.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gd-text truncate max-w-[160px]">{h.name}</span>
                      <span className="text-gd-muted flex-shrink-0 ml-2">
                        {h.streak.current}d · best {h.streak.longest}d
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.min(100, (h.streak.current / Math.max(h.streak.longest, 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <HabitModal open={modalOpen} onClose={handleCloseModal} habit={editHabit} />
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
