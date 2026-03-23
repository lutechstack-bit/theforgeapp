import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar, FileText, ArrowLeft, Shield, Sparkles, Map,
  ClipboardList, Moon, Package, PanelRight, UserCircle, Star, BookOpen, Route,
  ListTodo, Megaphone, History, PanelLeft, PanelLeftClose, Home, Target, Gift,
  Handshake, ExternalLink, Film, CreditCard, Activity, ChevronRight, BarChart3,
  Settings, Users2, MonitorSmartphone, GraduationCap, Search, Plus, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { AdminCommandPalette } from './AdminCommandPalette';
import { AdminNotifications } from './AdminNotifications';
import { AdminActivityFeed } from './AdminActivityFeed';
import { format } from 'date-fns';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  end?: boolean;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    icon: BarChart3,
    items: [
      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/admin/activity', icon: Activity, label: 'User Activity' },
    ],
  },
  {
    label: 'Users & Data',
    icon: Users2,
    items: [
      { to: '/admin/users', icon: Users, label: 'Users' },
      { to: '/admin/editions', icon: Calendar, label: 'Editions' },
      { to: '/admin/ky-forms', icon: ClipboardList, label: 'KY Forms' },
      { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
    ],
  },
  {
    label: 'App Content',
    icon: MonitorSmartphone,
    items: [
      { to: '/admin/homepage', icon: Home, label: 'Homepage' },
      { to: '/admin/todays-focus', icon: Target, label: "Today's Focus" },
      { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
      { to: '/admin/perks', icon: Gift, label: 'Perks' },
      { to: '/admin/events', icon: Calendar, label: 'Events' },
    ],
  },
  {
    label: 'Curriculum',
    icon: GraduationCap,
    items: [
      { to: '/admin/roadmap', icon: Map, label: 'Roadmap' },
      { to: '/admin/roadmap-sidebar', icon: PanelRight, label: 'Roadmap Sidebar' },
      { to: '/admin/equipment', icon: Package, label: 'Equipment' },
      { to: '/admin/nightly-rituals', icon: Moon, label: 'Nightly Rituals' },
      { to: '/admin/journey-stages', icon: Route, label: 'Journey Stages' },
      { to: '/admin/journey-tasks', icon: ListTodo, label: 'Journey Tasks' },
      { to: '/admin/learn', icon: FileText, label: 'Learn' },
    ],
  },
  {
    label: 'Community',
    icon: Handshake,
    items: [
      { to: '/admin/network', icon: Handshake, label: 'Network' },
      { to: '/admin/community-highlights', icon: Star, label: 'Highlights' },
      { to: '/admin/alumni-showcase', icon: Film, label: 'Alumni Showcase' },
      { to: '/admin/mentors', icon: UserCircle, label: 'Mentors' },
      { to: '/admin/explore-programs', icon: ExternalLink, label: 'Explore Programs' },
    ],
  },
  {
    label: 'System',
    icon: Settings,
    items: [
      { to: '/admin/auto-updates', icon: Sparkles, label: 'Auto Updates' },
      { to: '/admin/docs', icon: BookOpen, label: 'Documentation' },
      { to: '/admin/changelog', icon: History, label: 'Changelog' },
    ],
  },
];

const STORAGE_KEY = 'admin-sidebar-groups';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  // Cmd+K keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen(o => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const getDefaultOpen = (): Record<string, boolean> => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    // Auto-expand group containing active route
    const result: Record<string, boolean> = {};
    navGroups.forEach(g => {
      result[g.label] = g.items.some(i => 
        i.end ? location.pathname === i.to : location.pathname.startsWith(i.to)
      );
    });
    return result;
  };

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(getDefaultOpen);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(openGroups));
  }, [openGroups]);

  // Auto-expand group when navigating
  useEffect(() => {
    const activeGroup = navGroups.find(g =>
      g.items.some(i => i.end ? location.pathname === i.to : location.pathname.startsWith(i.to))
    );
    if (activeGroup && !openGroups[activeGroup.label]) {
      setOpenGroups(prev => ({ ...prev, [activeGroup.label]: true }));
    }
  }, [location.pathname]);

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const NavItemLink = ({ item }: { item: NavItem }) => (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg transition-all duration-200 text-sm',
          'hover:bg-primary/10',
          collapsed ? 'justify-center px-3 py-2.5' : 'px-3 py-2.5 pl-10',
          isActive ? 'bg-primary/20 text-primary font-medium' : 'text-muted-foreground'
        )
      }
    >
      <item.icon className="w-4 h-4 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex">
        <aside className={cn(
          "border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col transition-all duration-300",
          collapsed ? "w-[72px]" : "w-64"
        )}>
          {/* Header */}
          <div className={cn(
            "p-4 border-b border-border/50",
            collapsed ? "flex flex-col items-center gap-3" : "flex items-center justify-between"
          )}>
            <div className={cn("flex items-center gap-3", collapsed && "flex-col")}>
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
          <nav className={cn("flex-1 overflow-y-auto", collapsed ? "p-2" : "p-3")}>
            {navGroups.map((group) => {
              const isOpen = openGroups[group.label] ?? false;
              const hasActive = group.items.some(i =>
                i.end ? location.pathname === i.to : location.pathname.startsWith(i.to)
              );

              if (collapsed) {
                // Collapsed: show group icon, tooltip with sub-items
                return (
                  <div key={group.label} className="mb-1">
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div className={cn(
                          "flex items-center justify-center p-3 rounded-lg cursor-default",
                          hasActive ? "text-primary" : "text-muted-foreground"
                        )}>
                          <group.icon className="w-5 h-5" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={12} className="bg-popover/95 backdrop-blur-sm text-popover-foreground border-border/50 shadow-xl p-0">
                        <div className="py-1 min-w-[160px]">
                          <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">{group.label}</p>
                          {group.items.map(item => (
                            <NavLink
                              key={item.to}
                              to={item.to}
                              end={item.end}
                              className={({ isActive }) =>
                                cn(
                                  "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                                  isActive ? "text-primary font-medium bg-primary/10" : "text-foreground hover:bg-muted/50"
                                )
                              }
                            >
                              <item.icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </NavLink>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                );
              }

              // Expanded: collapsible group
              return (
                <Collapsible key={group.label} open={isOpen} onOpenChange={() => toggleGroup(group.label)}>
                  <CollapsibleTrigger className={cn(
                    "flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    "hover:bg-primary/5",
                    hasActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    <group.icon className="w-4.5 h-4.5 shrink-0" />
                    <span className="flex-1 text-left">{group.label}</span>
                    <ChevronRight className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      isOpen && "rotate-90"
                    )} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-0.5 mt-0.5">
                    {group.items.map(item => (
                      <NavItemLink key={item.to} item={item} />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </nav>

          {/* Back to App */}
          <div className={cn("border-t border-border/50", collapsed ? "p-2" : "p-3")}>
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

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-card/20 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCmdOpen(true)}
                className="gap-2 h-8 text-xs text-muted-foreground"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border/50 bg-muted/50 px-1.5 text-[10px] font-mono text-muted-foreground">
                  ⌘K
                </kbd>
              </Button>
              <Button size="sm" variant="ghost" className="gap-1.5 h-8 text-xs" onClick={() => navigate('/admin/users?action=create')}>
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Create User</span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground hidden sm:inline">
                {format(new Date(), 'MMM d, h:mm a')}
              </span>
              <AdminNotifications />
              <AdminActivityFeed />
            </div>
          </div>

          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>

        <AdminCommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
      </div>
    </TooltipProvider>
  );
};
