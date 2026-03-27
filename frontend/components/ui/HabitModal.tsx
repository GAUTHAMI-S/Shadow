'use client';
import { useState, useEffect } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import { Habit, HabitFormData, FrequencyType } from '@/lib/types';
import { useHabitStore } from '@/store/habitStore';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface HabitModalProps {
  open: boolean;
  onClose: () => void;
  habit?: Habit | null;
}

const defaultForm = (): HabitFormData => ({
  name: '',
  description: '',
  frequencyType: 'DAILY',
  customDays: [],
  hasGraceDay: false,
});

export default function HabitModal({ open, onClose, habit }: HabitModalProps) {
  const { createHabit, updateHabit } = useHabitStore();
  const [form, setForm] = useState<HabitFormData>(defaultForm());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (habit) {
      setForm({
        name: habit.name,
        description: habit.description ?? '',
        frequencyType: habit.frequencyType,
        customDays: habit.customDays,
        hasGraceDay: habit.hasGraceDay,
      });
    } else {
      setForm(defaultForm());
    }
    setError('');
  }, [habit, open]);

  if (!open) return null;

  const toggleDay = (day: string) => {
    setForm((f) => ({
      ...f,
      customDays: f.customDays.includes(day)
        ? f.customDays.filter((d) => d !== day)
        : [...f.customDays, day],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Habit name is required'); return; }
    if (form.frequencyType === 'CUSTOM' && form.customDays.length === 0) {
      setError('Please select at least one day'); return;
    }
    setLoading(true);
    try {
      if (habit) {
        await updateHabit(habit.id, form);
      } else {
        await createHabit(form);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-gd-surface border border-gd-border rounded-2xl p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gd-text">
            {habit ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gd-muted hover:text-gd-text hover:bg-white/5 transition-all">
            <FiX size={16} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-gd-red/10 border border-gd-red/20 text-gd-red text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="form-label">Habit name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Morning meditation"
              maxLength={80}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Description <span className="normal-case text-gd-muted/70">(optional)</span></label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Why this habit matters…"
              maxLength={200}
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="form-label">Frequency</label>
            <div className="flex gap-2">
              {(['DAILY', 'CUSTOM'] as FrequencyType[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setForm((s) => ({ ...s, frequencyType: f }))}
                  className={`flex-1 py-2 rounded-lg text-sm border transition-all duration-150 ${
                    form.frequencyType === f
                      ? 'bg-gd-accent/15 border-gd-accent text-gd-accent'
                      : 'border-gd-border text-gd-muted hover:text-gd-text hover:border-gd-border/60'
                  }`}
                >
                  {f === 'DAILY' ? 'Every day' : 'Custom days'}
                </button>
              ))}
            </div>
          </div>

          {/* Custom days picker */}
          {form.frequencyType === 'CUSTOM' && (
            <div className="animate-fade-in">
              <label className="form-label">Select days</label>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`w-10 h-10 rounded-lg text-xs font-medium border transition-all duration-150 ${
                      form.customDays.includes(day)
                        ? 'bg-gd-accent/15 border-gd-accent text-gd-accent'
                        : 'border-gd-border text-gd-muted hover:text-gd-text'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grace day toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gd-surface2 border border-gd-border">
            <div>
              <p className="text-sm font-medium text-gd-text">Grace Day</p>
              <p className="text-xs text-gd-muted mt-0.5">Missing one day won't break your streak</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, hasGraceDay: !f.hasGraceDay }))}
              className={`toggle ${form.hasGraceDay ? 'on' : ''}`}
              role="switch"
              aria-checked={form.hasGraceDay}
            >
              <span className="toggle-thumb" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center disabled:opacity-60">
              {loading ? (
                <span className="w-4 h-4 border-2 border-gd-bg/30 border-t-gd-bg rounded-full animate-spin" />
              ) : (
                <>
                  <FiCheck size={14} />
                  {habit ? 'Save Changes' : 'Create Habit'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
