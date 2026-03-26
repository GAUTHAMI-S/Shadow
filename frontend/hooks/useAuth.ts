import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { user, token, isLoading, login, signup, logout, fetchMe } = useAuthStore();
  return { user, token, isLoading, login, signup, logout, fetchMe, isAuthenticated: !!token };
}
