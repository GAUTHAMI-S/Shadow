'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiZap, FiGrid, FiCalendar, FiBarChart2, FiSettings, FiLogOut, FiBell } from 'react-icons/fi';
import { useAuthStore } from '@/store/authStore';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { href: '/calendar',  label: 'Calendar',  icon: FiCalendar },
  { href: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { href: '/settings',  label: 'Settings',  icon: FiSettings },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-gd-surface border-b border-gd-border h-14 flex items-center justify-between px-5 gap-3 flex-shrink-0 z-40">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-1 mr-4">
        {/* <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gd-accent to-gd-blue flex items-center justify-center flex-shrink-0">
          <FiZap size={14} className="text-gd-bg" />
        </div> */}
          <img src="/logo.png" alt="logo" className="w-12 h-12" />
        <span className="font-bold text-md text-gd-text hidden sm:block">Shadow</span>
      </Link>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-150 ${
                active
                  ? 'text-gd-text border-b-2 border-gd-accent rounded-none pb-[5px]'
                  : 'text-gd-muted hover:text-gd-text hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              {label}
            </Link>
          );
        })}
      </nav>

     

      {/* Right side */}
      <div className="flex items-center gap-2">
    
        <div className="flex items-center gap-2 pl-2 border-l border-gd-border">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gd-blue to-gd-purple flex items-center justify-center text-md font-semibold text-white flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-md text-gd-muted hidden sm:block max-w-[100px] truncate">{user?.name}</span>
          <button
            onClick={logout}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gd-muted hover:text-gd-red hover:bg-gd-red/10 transition-all ml-1"
            title="Sign out"
          >
            <FiLogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
