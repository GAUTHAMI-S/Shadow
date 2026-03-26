'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiUser, FiLock, FiPlus, FiSettings, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useAuthStore } from '@/store/authStore';
import { useHabitStore } from '@/store/habitStore';
import HabitModal from '@/components/ui/HabitModal';
import { Habit } from '@/lib/types';
import api from '@/lib/api';

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const { user, setUser } = useAuthStore();
  const { habits, fetchHabits, deleteHabit } = useHabitStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchHabits();
    if (searchParams.get('action') === 'new') setModalOpen(true);
  }, []);

  useEffect(() => {
    if (user) setProfileForm({ name: user.name });
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true); setProfileMsg('');
    try {
      const { data } = await api.patch('/auth/me', profileForm);
      setUser(data.data.user);
      setProfileMsg('Profile updated successfully');
    } catch (err: any) {
      setProfileMsg(err.response?.data?.error || 'Update failed');
    } finally {
      setProfileLoading(false);
      setTimeout(() => setProfileMsg(''), 3000);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.next !== passwordForm.confirm) { setPwMsg('Passwords do not match'); return; }
    if (passwordForm.next.length < 8) { setPwMsg('Password must be at least 8 characters'); return; }
    setPwLoading(true); setPwMsg('');
    try {
      await api.patch('/auth/me/password', {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.next,
      });
      setPwMsg('Password changed successfully');
      setPasswordForm({ current: '', next: '', confirm: '' });
    } catch (err: any) {
      setPwMsg(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPwLoading(false);
      setTimeout(() => setPwMsg(''), 3000);
    }
  };

  const handleEdit = (habit: Habit) => { setEditHabit(habit); setModalOpen(true); };
  const handleCloseModal = () => { setModalOpen(false); setEditHabit(null); };

  const handleDeleteHabit = async (id: string) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
      return;
    }
    await deleteHabit(id);
    setConfirmDelete(null);
  };

  const isSuccess = (msg: string) => msg.includes('success') || msg.includes('updated') || msg.includes('changed');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-gd-text flex items-center gap-2">
          <FiSettings size={18} className="text-gd-muted" />
          Settings
        </h1>
        <p className="text-sm text-gd-muted mt-0.5">Manage your account and habits</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Profile */}
        <div className="card">
          <div className="card-title">
            <span className="flex items-center gap-2"><FiUser size={14} /> Profile</span>
          </div>
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="form-label">Display name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ name: e.target.value })}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" value={user?.email || ''} disabled className="opacity-50 cursor-not-allowed" />
              <p className="text-[11px] text-gd-muted mt-1">Email cannot be changed</p>
            </div>
            {profileMsg && (
              <p className={`text-sm ${isSuccess(profileMsg) ? 'text-gd-accent' : 'text-gd-red'}`}>
                {profileMsg}
              </p>
            )}
            <button type="submit" disabled={profileLoading} className="btn-primary disabled:opacity-60">
              {profileLoading ? (
                <span className="w-4 h-4 border-2 border-gd-bg/30 border-t-gd-bg rounded-full animate-spin" />
              ) : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="card-title">
            <span className="flex items-center gap-2"><FiLock size={14} /> Change Password</span>
          </div>
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="form-label">Current password</label>
              <input
                type="password"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm((f) => ({ ...f, current: e.target.value }))}
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="form-label">New password</label>
              <input
                type="password"
                value={passwordForm.next}
                onChange={(e) => setPasswordForm((f) => ({ ...f, next: e.target.value }))}
                placeholder="Min 8 characters"
                required
              />
            </div>
            <div>
              <label className="form-label">Confirm new password</label>
              <input
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))}
                placeholder="Repeat new password"
                required
              />
            </div>
            {pwMsg && (
              <p className={`text-sm ${isSuccess(pwMsg) ? 'text-gd-accent' : 'text-gd-red'}`}>
                {pwMsg}
              </p>
            )}
            <button type="submit" disabled={pwLoading} className="btn-primary disabled:opacity-60">
              {pwLoading ? (
                <span className="w-4 h-4 border-2 border-gd-bg/30 border-t-gd-bg rounded-full animate-spin" />
              ) : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Habit management */}
      <div className="card">
        <div className="card-title">
          <span>All Habits ({habits.length})</span>
          <button
            onClick={() => { setEditHabit(null); setModalOpen(true); }}
            className="btn-primary"
          >
            <FiPlus size={14} />
            New Habit
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-gd-muted">No habits yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-gd-surface2 border border-gd-border"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gd-text truncate">{habit.name}</p>
                  <p className="text-xs text-gd-muted mt-0.5">
                    {habit.frequencyType === 'DAILY' ? 'Daily' : habit.customDays.join(', ')}
                    {habit.description && ` · ${habit.description}`}
                    {habit.hasGraceDay && ' · Grace enabled'}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="badge-streak text-xs">{habit.streak.current}d</span>
                  <button
                    onClick={() => handleEdit(habit)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gd-muted hover:text-gd-blue hover:bg-gd-blue/10 transition-all"
                  >
                    <FiEdit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      confirmDelete === habit.id
                        ? 'text-gd-red bg-gd-red/15'
                        : 'text-gd-muted hover:text-gd-red hover:bg-gd-red/10'
                    }`}
                    title={confirmDelete === habit.id ? 'Click again to confirm' : 'Delete'}
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PWA info */}
      <div className="p-4 rounded-xl bg-gd-accent/5 border border-gd-accent/15">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gd-accent/15 flex items-center justify-center flex-shrink-0">
            <span className="text-gd-accent text-sm">📲</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gd-text">Install Grace Day</p>
            <p className="text-xs text-gd-muted mt-1">
              Add Grace Day to your home screen for the best experience. On mobile, tap the browser menu → "Add to Home Screen". On desktop, click the install icon in the address bar.
            </p>
          </div>
        </div>
      </div>

      <HabitModal open={modalOpen} onClose={handleCloseModal} habit={editHabit} />
    </div>
  );
}
