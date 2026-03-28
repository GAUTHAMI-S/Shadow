import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get('gd_token')?.value;
  if (token) redirect('/dashboard');
  return (
    <div className="min-h-screen bg-gd-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-scale-in">
        {children}
      </div>
    </div>
  );
}
