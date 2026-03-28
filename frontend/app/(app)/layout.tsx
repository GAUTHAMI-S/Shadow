import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get('gd_token')?.value;
  if (!token) redirect('/login');
  return <AppShell>{children}</AppShell>;
}
