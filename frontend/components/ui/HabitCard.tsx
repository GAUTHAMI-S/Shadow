'use client';
import { useState } from 'react';
import { FiCheck, FiRefreshCw, FiEdit2, FiTrash2, FiZap, FiShield } from 'react-icons/fi';
import { Habit, LogStatus } from '@/lib/types';
import { useHabitStore } from '@/store/habitStore';

interface HabitCardProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
}

export default function HabitCard({ habit, onEdit }: HabitCardProps) {
  const { logHabit, deleteHabit } = useHabitStore();
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isDone = habit.todayStatus === 'COMPLETED' || habit.todayStatus === 'GRACE';

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isDone) {
        await logHabit(habit.id, 'MISSED');
      } else {
        await logHabit(habit.id, 'COMPLETED');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGrace = async () => {
    setLoading(true);
    try {
      await logHabit(habit.id, 'GRACE');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); return; }
    await deleteHabit(habit.id);
  };

  const freqLabel =
    habit.frequencyType === 'DAILY'
      ? 'Daily'
      : habit.customDays.join(', ');

  const statusColor = isDone
    ? 'border-gd-accent/30 bg-gd-accent/5'
    : habit.todayStatus === 'MISSED'
    ? 'border-gd-red/30 bg-gd-red/5'
    : 'border-gd-border';

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${statusColor} animate-fade-in`}>
      {/* Check button */}
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          isDone
            ? 'bg-gd-accent border-gd-accent text-gd-bg hover:bg-gd-accent/80'
            : 'border-gd-border text-transparent hover:border-gd-accent hover:text-gd-accent'
        } ${loading ? 'opacity-50' : ''}`}
      >
        {loading ? (
          <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
        ) : isDone ? (
          <FiCheck size={13} strokeWidth={3} />
        ) : (
          <FiCheck size={13} />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isDone ? 'line-through text-gd-muted' : 'text-gd-text'}`}>
          {habit.name}
        </p>
        <p className="text-xs text-gd-muted truncate mt-0.5">
          {freqLabel}
          {habit.description && ` · ${habit.description}`}
        </p>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {habit.streak.current > 0 && (
          <span className="badge-streak flex items-center gap-1">
            <FiZap size={9} />
            {habit.streak.current}d
          </span>
        )}
        {habit.hasGraceDay && (
          <span className="badge-grace flex items-center gap-1" title="Grace day enabled">
            <FiShield size={9} />
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Grace day button — only show if not done and habit supports grace */}
        {!isDone && habit.hasGraceDay && habit.todayStatus !== 'GRACE' && (
          <button
            onClick={handleGrace}
            disabled={loading}
            title="Use grace day"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gd-amber hover:bg-gd-amber/10 transition-all disabled:opacity-50"
          >
            <FiShield size={13} />
          </button>
        )}
        {isDone && (
          <button
            onClick={handleToggle}
            disabled={loading}
            title="Undo"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gd-muted hover:text-gd-text hover:bg-white/5 transition-all"
          >
            <FiRefreshCw size={12} />
          </button>
        )}
        <button
          onClick={() => onEdit(habit)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gd-muted hover:text-gd-blue hover:bg-gd-blue/10 transition-all"
        >
          <FiEdit2 size={12} />
        </button>
        <button
          onClick={handleDelete}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            confirmDelete
              ? 'text-gd-red bg-gd-red/15'
              : 'text-gd-muted hover:text-gd-red hover:bg-gd-red/10'
          }`}
          title={confirmDelete ? 'Click again to confirm' : 'Delete habit'}
        >
          <FiTrash2 size={12} />
        </button>
      </div>
    </div>
  );
}
