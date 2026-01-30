import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  ArrowLeft,
  Shield,
  Sparkles,
  Map,
  ClipboardList,
  Moon,
  Package,
  PanelRight,
  UserCircle,
  Video,
  Star,
  BookOpen,
  Route,
  ListTodo,
  Megaphone,
  History,
  Building2,
  PanelLeft,
  PanelLeftClose
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/editions', icon: Calendar, label: 'Editions' },
  { to: '/admin/ky-forms', icon: ClipboardList, label: 'KY Forms' },
  { to: '/admin/journey-stages', icon: Route, label: 'Journey Stages' },
  { to: '/admin/journey-tasks', icon: ListTodo, label: 'Journey Tasks' },
  { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/admin/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/admin/roadmap-sidebar', icon: PanelRight, label: 'Roadmap Sidebar' },
  { to: '/admin/stay-locations', icon: Building2, label: 'Stay Locations' },
  { to: '/admin/equipment', icon: Package, label: 'Equipment' },
  { to: '/admin/nightly-rituals', icon: Moon, label: 'Nightly Rituals' },
  { to: '/admin/events', icon: Calendar, label: 'Events' },
  { to: '/admin/learn', icon: FileText, label: 'Learn' },
  { to: '/admin/mentors', icon: UserCircle, label: 'Mentors' },
  { to: '/admin/alumni-testimonials', icon: Video, label: 'Alumni Testimonials' },
  { to: '/admin/community-highlights', icon: Star, label: 'Community Highlights' },
  { to: '/admin/auto-updates', icon: Sparkles, label: 'Auto Updates' },
  { to: '/admin/docs', icon: BookOpen, label: 'Documentation' },
  { to: '/admin/changelog', icon: History, label: 'Changelog' },
];

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const NavItem = ({ item }: { item: typeof adminNavItems[0] }) => {
    const content = (
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-3 rounded-lg transition-all duration-200',
            'hover:bg-primary/10',
            collapsed ? 'justify-center px-3 py-3' : 'px-4 py-3',
            isActive
              ? 'bg-primary/20 text-primary font-medium'
              : 'text-muted-foreground'
          )
        }
      >
        <item.icon className="w-5 h-5 shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <span className="block">{content}</span>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="bg-popover/95 backdrop-blur-sm text-popover-foreground border-border/50 shadow-xl">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside className={cn(
          "border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col transition-all duration-300",
          collapsed ? "w-[72px]" : "w-64"
        )}>
          {/* Header */}
          <div className={cn(
            "p-4 border-b border-border/50",
            collapsed ? "flex flex-col items-center gap-3" : "flex items-center justify-between"
          )}>
            <div className={cn(
              "flex items-center gap-3",
              collapsed && "flex-col"
            )}>
              <div className="p-2 rounded-lg bg-primary/20 shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              {!collapsed && (
                <div>
                  <h1 className="font-semibold text-foreground">Admin Panel</h1>
                  <p className="text-xs text-muted-foreground">LevelUp Management</p>
                </div>
              )}
            </div>
            
            {/* Toggle Button */}
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 hover:bg-primary/20 text-muted-foreground hover:text-foreground transition-all"
                >
                  {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="bg-popover text-popover-foreground">
                  Expand sidebar
                </TooltipContent>
              )}
            </Tooltip>
          </div>

          {/* Navigation */}
          <nav className={cn(
            "flex-1 space-y-1 overflow-y-auto",
            collapsed ? "p-2" : "p-4"
          )}>
            {adminNavItems.map((item) => (
              <NavItem key={item.to} item={item} />
            ))}
          </nav>

          {/* Back to App */}
          <div className={cn(
            "border-t border-border/50",
            collapsed ? "p-2" : "p-4"
          )}>
            {collapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => navigate('/')}
                    className="flex items-center justify-center w-full p-3 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-popover text-popover-foreground">
                  Back to App
                </TooltipContent>
              </Tooltip>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to App</span>
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  );
};
