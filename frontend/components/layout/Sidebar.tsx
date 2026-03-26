'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiGrid, FiCheckSquare, FiCalendar, FiBarChart2, FiSettings } from 'react-icons/fi';

const LINKS = [
  { href: '/dashboard', label: 'Overview',      icon: FiGrid },
  { href: '/dashboard', label: "Today's Habits", icon: FiCheckSquare },
  { href: '/calendar',  label: 'Calendar',       icon: FiCalendar },
  { href: '/analytics', label: 'Analytics',      icon: FiBarChart2 },
  { href: '/settings',  label: 'Settings',       icon: FiSettings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-52 bg-gd-surface border-r border-gd-border py-4 px-2 flex-shrink-0">
      <nav className="flex flex-col gap-1">
        {LINKS.map(({ href, label, icon: Icon }, i) => {
          const active = pathname.startsWith(href) && (href !== '/dashboard' || i < 2);
          return (
            <Link
              key={`${href}-${i}`}
              href={href}
              className={`nav-link ${active ? 'active' : ''}`}
            >
              <Icon size={15} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* PWA toggle indicator */}
      <div className="px-3 py-2 flex items-center gap-2">
        <div className="w-8 h-4 rounded-full bg-gd-accent/20 border border-gd-accent flex items-center px-0.5">
          <div className="w-3 h-3 rounded-full bg-gd-accent translate-x-3.5" />
        </div>
        <span className="text-xs text-gd-muted">PWA Enabled</span>
      </div>
    </aside>
  );
}
