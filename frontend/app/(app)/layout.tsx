'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { fetchMe, user } = useAuthStore();

  useEffect(() => {
    if (!user) fetchMe();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gd-bg">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="max-w-6xl mx-auto p-4 md:p-6 animate-slide-up">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
