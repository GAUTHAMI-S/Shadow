'use client';
import { useEffect, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';
import CalendarGrid from '@/components/ui/CalendarGrid';
import StatCard from '@/components/ui/StatCard';
import { CalendarData } from '@/lib/types';
import api from '@/lib/api';

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState({ completed: 0, missed: 0, grace: 0 });

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  useEffect(() => {
    loadCalendar();
  }, [year, month]);

  const loadCalendar = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/habits/calendar?year=${year}&month=${month}`);
      setCalendarData(data.data.calendar);

      // Compute summary
      const cal: CalendarData = data.data.calendar;
      let completed = 0, missed = 0, grace = 0;
      Object.values(cal).forEach((day) => {
        completed += day.completed;
        missed += day.missed;
        grace += day.grace;
      });
      setSummary({ completed, missed, grace });
    } catch {
      setCalendarData({});
    } finally {
      setIsLoading(false);
    }
  };

  const changeMonth = (dir: number) => {
    let m = month + dir;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1)  { m = 12; y--; }
    setMonth(m);
    setYear(y);
  };

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gd-text flex items-center gap-2">
            <FiCalendar size={18} className="text-gd-blue" />
            Calendar
          </h1>
          <p className="text-sm text-gd-muted mt-0.5">Your habit history at a glance</p>
        </div>
        {/* Month navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="w-8 h-8 rounded-lg border border-gd-border text-gd-muted hover:text-gd-text hover:bg-white/5 flex items-center justify-center transition-all"
          >
            <FiChevronLeft size={15} />
          </button>
          <span className="text-sm font-medium text-gd-text min-w-[120px] text-center">
            {MONTHS[month - 1]} {year}
          </span>
          <button
            onClick={() => changeMonth(1)}
            disabled={isCurrentMonth}
            className="w-8 h-8 rounded-lg border border-gd-border text-gd-muted hover:text-gd-text hover:bg-white/5 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FiChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Completed" value={summary.completed} sub="log entries" accent="green" />
        <StatCard label="Missed"    value={summary.missed}    sub="log entries" accent="red" />
        <StatCard label="Grace days" value={summary.grace}   sub="streak saved" accent="amber" />
      </div>

      {/* Calendar */}
      <div className="card">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-gd-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <CalendarGrid year={year} month={month} calendarData={calendarData} />
        )}
      </div>

      {/* Tip */}
      <div className="flex items-start gap-3 p-3 rounded-xl bg-gd-blue/5 border border-gd-blue/15 text-xs text-gd-muted">
        <span className="text-gd-blue mt-0.5">💡</span>
        <p>
          <span className="text-gd-text font-medium">Shadow</span> appear in amber — they protect your streak
          when you miss a scheduled day. Each grace-enabled habit gets one grace day per streak.
        </p>
      </div>
    </div>
  );
}
