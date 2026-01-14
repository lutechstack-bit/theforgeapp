import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Bell,
  ArrowLeft,
  Shield,
  Sparkles,
  Image,
  Map,
  ClipboardList,
  Moon,
  Package,
  PanelRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/editions', icon: Calendar, label: 'Editions' },
  { to: '/admin/ky-forms', icon: ClipboardList, label: 'KY Forms' },
  { to: '/admin/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/admin/roadmap-sidebar', icon: PanelRight, label: 'Roadmap Sidebar' },
  { to: '/admin/equipment', icon: Package, label: 'Equipment' },
  { to: '/admin/nightly-rituals', icon: Moon, label: 'Nightly Rituals' },
  { to: '/admin/auto-updates', icon: Sparkles, label: 'Auto Updates' },
  { to: '/admin/hero-banners', icon: Image, label: 'Hero Banners' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { to: '/admin/events', icon: Calendar, label: 'Events' },
  { to: '/admin/event-types', icon: FileText, label: 'Event Types' },
  { to: '/admin/past-programs', icon: Calendar, label: 'Past Programs' },
  { to: '/admin/learn', icon: FileText, label: 'Learn' },
];

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">LevelUp Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  'hover:bg-primary/10',
                  isActive
                    ? 'bg-primary/20 text-primary font-medium'
                    : 'text-muted-foreground'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Back to App */}
        <div className="p-4 border-t border-border/50">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to App</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
