import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setUser: (user) => set({ user }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          const { user, token } = data.data;
          Cookies.set('gd_token', token, { expires: 7, sameSite: 'strict' });
          set({ user, token, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      signup: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/signup', { name, email, password });
          const { user, token } = data.data;
          Cookies.set('gd_token', token, { expires: 7, sameSite: 'strict' });
          set({ user, token, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        Cookies.remove('gd_token');
        set({ user: null, token: null });
        window.location.href = '/login';
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.data.user });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: 'gd-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
