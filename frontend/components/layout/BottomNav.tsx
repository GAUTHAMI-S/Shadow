'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiGrid, FiCalendar, FiBarChart2, FiSettings } from 'react-icons/fi';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { href: '/calendar',  label: 'Calendar',  icon: FiCalendar },
  { href: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { href: '/settings',  label: 'Settings',  icon: FiSettings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gd-surface border-t border-gd-border flex items-center">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-all duration-150 ${
              active ? 'text-gd-accent' : 'text-gd-muted hover:text-gd-text'
            }`}
          >
            <Icon size={18} />
            <span className="font-medium">{label}</span>
            {active && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-gd-accent rounded-t-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
