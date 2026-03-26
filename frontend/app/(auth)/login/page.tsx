'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiEye, FiEyeOff, FiZap } from 'react-icons/fi';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 justify-center">
        {/* <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gd-accent to-gd-blue flex items-center justify-center">
          <FiZap size={18} className="text-gd-bg" />
        </div> */}
          <img src="/logo.png" alt="logo" className="w-10 h-10" />
        <span className="text-xl font-bold text-gd-text">Shadow</span>
      </div>

      <div className="card  animate-fade-in">
        <div className='text-center'>

        <h1 className="text-xl font-semibold text-gd-text mb-1">Welcome back</h1>
        <p className="text-lg text-gd-muted mb-6">Sign in to continue your streak</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-gd-red/10 border border-gd-red/20 text-gd-red text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Email</label>
            <div className="relative">
              <FiMail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gd-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <FiLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gd-muted" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="pl-9 pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gd-muted hover:text-gd-text"
              >
                {showPass ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full justify-center py-2.5 disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-gd-bg/30 border-t-gd-bg rounded-full animate-spin" />
                Signing in…
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gd-muted mt-5">
          No account?{' '}
          <Link href="/signup" className="text-gd-accent hover:underline">Create one</Link>
        </p>

       
      </div>
    </div>
  );
}
