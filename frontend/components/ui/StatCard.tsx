import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'default';
  icon?: ReactNode;
}

const accentMap = {
  green:   'text-gd-accent',
  blue:    'text-gd-blue',
  amber:   'text-gd-amber',
  red:     'text-gd-red',
  purple:  'text-gd-purple',
  default: 'text-gd-text',
};

export default function StatCard({ label, value, sub, accent = 'default', icon }: StatCardProps) {
  return (
    <div className="stat-card flex flex-col gap-1">
      <div className="flex items-start justify-between">
        <p className="text-[11px] text-gd-muted uppercase tracking-wider font-medium">{label}</p>
        {icon && <span className="text-gd-muted">{icon}</span>}
      </div>
      <p className={`text-2xl font-semibold leading-none mt-1 ${accentMap[accent]}`}>{value}</p>
      {sub && <p className="text-[11px] text-gd-muted mt-0.5">{sub}</p>}
    </div>
  );
}
