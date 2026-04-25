import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * Minimal shell for /mentor routes. Phase 3 will expand this with the full
 * student rail, sticky header, and command palette. For now it's just a
 * top bar + <Outlet /> so the route scaffolding is in place.
 */
const navItems = [
  { to: '/mentor', label: 'My students', end: true },
  // Phase 3+: { to: '/mentor/submissions', label: 'Submissions' },
  // Phase 3+: { to: '/mentor/doubts', label: 'Doubts' },
];

export const MentorLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/85 px-6 backdrop-blur">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold tracking-wide">the forge</span>
          <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            Mentor
          </span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'transition-colors hover:text-foreground',
                  isActive && 'text-foreground font-medium'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
