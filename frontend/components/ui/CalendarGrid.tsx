'use client';
import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isFuture } from 'date-fns';
import { CalendarData } from '@/lib/types';

interface CalendarGridProps {
  year: number;
  month: number; // 1-based
  calendarData: CalendarData;
}

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarGrid({ year, month, calendarData }: CalendarGridProps) {
  const days = useMemo(() => {
    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(start);
    return eachDayOfInterval({ start, end });
  }, [year, month]);

  const firstDayOffset = getDay(days[0]);

  const getDayClass = (date: Date, key: string) => {
    const data = calendarData[key];
    const today = isToday(date);
    const future = isFuture(date);

    let bg = '';
    if (!future && data) {
      const { completed, total, grace, missed } = data;
      if (grace > 0 && completed === 0) bg = 'bg-gd-amber/20 text-gd-amber';
      else if (missed > 0 && completed === 0) bg = 'bg-gd-red/15 text-gd-red';
      else if (completed > 0 && completed >= total) bg = 'bg-gd-accent/20 text-gd-accent';
      else if (completed > 0) bg = 'bg-gd-blue/15 text-gd-blue'; // partial
    }

    return [
      'aspect-square flex flex-col items-center justify-center rounded-lg text-xs relative cursor-default',
      future ? 'text-gd-muted/30' : bg || 'text-gd-muted hover:bg-white/5',
      today ? 'ring-1 ring-gd-blue' : '',
    ].join(' ');
  };

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-[11px] text-gd-muted">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gd-accent/30" />Completed</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gd-red/30" />Missed</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gd-amber/30" />Grace day</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gd-blue/30" />Partial</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded ring-1 ring-gd-blue" />Today</span>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="text-center text-[11px] text-gd-muted py-1 font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-1 ">
        {/* Empty offset cells */}
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {days.map((date) => {
          const key = format(date, 'yyyy-MM-dd');
          const data = calendarData[key];

          return (
            <div key={key} className={getDayClass(date, key)} title={key}>
              <span className="font-medium">{format(date, 'd')}</span>
              {/* Dot indicator if has data */}
              {data && data.total > 0 && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current opacity-70" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
