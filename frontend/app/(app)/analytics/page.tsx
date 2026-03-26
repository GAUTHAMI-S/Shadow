"use client";
import { useEffect, useState } from "react";
import { FiBarChart2, FiTrendingUp, FiZap, FiShield } from "react-icons/fi";
import ProgressChart from "@/components/ui/ProgressChart";
import StatCard from "@/components/ui/StatCard";
import { ChartPoint } from "@/lib/types";
import { useHabitStore } from "@/store/habitStore";
import api from "@/lib/api";

interface StreakEntry {
  habitId: string;
  habitName: string;
  current: number;
  longest: number;
  graceUsed: number;
}

export default function AnalyticsPage() {
  const { habits, fetchHabits } = useHabitStore();
  const [weeklyData, setWeeklyData] = useState<ChartPoint[]>([]);
  const [monthlyData, setMonthlyData] = useState<ChartPoint[]>([]);
  const [streaks, setStreaks] = useState<StreakEntry[]>([]);
  const [dashStats, setDashStats] = useState({
    monthCompletionRate: 0,
    graceUsedThisMonth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHabits();
    Promise.all([
      api.get("/analytics/weekly"),
      api.get("/analytics/monthly"),
      api.get("/analytics/streaks"),
      api.get("/analytics/dashboard"),
    ])
      .then(([weekly, monthly, strksRes, dash]) => {
        setWeeklyData(weekly.data.data);
        setMonthlyData(monthly.data.data);
        setStreaks(strksRes.data.data.streaks);
        setDashStats(dash.data.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const bestStreak = streaks.reduce((m, s) => Math.max(m, s.current), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-7 h-7 border-2 border-gd-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-gd-text flex items-center gap-2">
          <FiBarChart2 size={18} className="text-gd-blue" />
          Analytics
        </h1>
        <p className="text-sm text-gd-muted mt-0.5">
          Track your long-term progress
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Month Rate"
          value={`${dashStats.monthCompletionRate}%`}
          sub="completion"
          accent="green"
          icon={<FiTrendingUp size={14} />}
        />
        <StatCard
          label="Best Streak"
          value={`${bestStreak}d`}
          sub="currently active"
          accent="blue"
          icon={<FiZap size={14} />}
        />
        <StatCard
          label="Total Habits"
          value={habits.length}
          sub="being tracked"
          accent="default"
        />
        <StatCard
          label="Grace Used"
          value={dashStats.graceUsedThisMonth}
          sub="this month"
          accent="amber"
          icon={<FiShield size={14} />}
        />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="card">
          <div className="card-title">Weekly Completion %</div>
          <ProgressChart
            data={weeklyData}
            type="bar"
            color="#3fb950"
            height={180}
          />
          <p className="text-xs text-gd-muted mt-3">
            Last 4 weeks, all habits combined
          </p>
        </div>
        <div className="card">
          <div className="card-title">Monthly Trend</div>
          <ProgressChart
            data={monthlyData}
            type="line"
            color="#58a6ff"
            height={180}
          />
          <p className="text-xs text-gd-muted mt-3">
            Last 6 months completion rate
          </p>
        </div>
      </div>

      {/* Per-habit performance */}
      <div className="card">
        <div className="card-title">Habit Performance</div>
        {streaks.length === 0 ? (
          <p className="text-sm text-gd-muted text-center py-8">
            No habits tracked yet
          </p>
        ) : (
          <div className="space-y-4">
            {streaks.map((s) => {
              const pct = Math.min(
                100,
                s.longest > 0 ? Math.round((s.current / s.longest) * 100) : 0,
              );
              const barColor =
                s.current >= 14
                  ? "#3fb950"
                  : s.current >= 7
                    ? "#58a6ff"
                    : s.current >= 3
                      ? "#d29922"
                      : "#f85149";
              return (
                <div key={s.habitId}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gd-text truncate max-w-[200px]">
                      {s.habitName}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-xs text-gd-muted">
                        Best: {s.longest}d
                      </span>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded"
                        style={{ color: barColor, background: `${barColor}18` }}
                      >
                        {s.current}d streak
                      </span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: barColor }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-gd-muted mt-1">
                    <span>{s.graceUsed} grace days used</span>
                    <span>{pct}% of best streak</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
