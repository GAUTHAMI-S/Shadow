export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gd-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-scale-in">
        {children}
      </div>
    </div>
  );
}
