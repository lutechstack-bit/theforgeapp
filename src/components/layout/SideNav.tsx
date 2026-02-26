import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { House, Users, BookOpen, Compass, CalendarDays, Gift, Settings, Info, ChevronsLeft, ChevronsRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import forgeLogo from '@/assets/forge-logo.png';
import forgeIcon from '@/assets/forge-icon.png';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const navItems = [
  { to: '/', icon: House, label: 'Home' },
  { to: '/roadmap', icon: Compass, label: 'Roadmap' },
  { to: '/perks', icon: Gift, label: 'Perks' },
  { to: '/learn', icon: BookOpen, label: 'Learn' },
  { to: '/events', icon: CalendarDays, label: 'Events' },
  { to: '/community', icon: Users, label: 'Community' },
];

const bottomItems = [
  { to: '/updates', icon: Info, label: 'Updates' },
];

export const SideNav: React.FC = () => {
  const { collapsed, toggle } = useSidebar();
  const location = useLocation();
  const { profile } = useAuth();
  const { isAdmin } = useAdminCheck();

  const NavItem = ({ to, icon: Icon, label, isActive }: { to: string; icon: React.ElementType; label: string; isActive: boolean }) => {
    const content = (
      <NavLink
        to={to}
        className={cn(
          "group flex items-center gap-3.5 rounded-2xl transition-colors duration-200 text-base font-medium",
          collapsed ? "justify-center p-3" : "px-4 py-3.5",
          isActive
            ? "bg-white/[0.08] text-sidebar-foreground"
            : "text-sidebar-foreground/50 hover:bg-white/[0.04] hover:text-sidebar-foreground/80"
        )}
      >
        <Icon className="h-5 w-5 shrink-0" strokeWidth={isActive ? 2 : 1.75} />
        {!collapsed && <span>{label}</span>}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <span className="block w-full">{content}</span>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="bg-popover/95 backdrop-blur-sm text-popover-foreground border-border/50">
            {label}
          </TooltipContent>
        </Tooltip>
      );
    }
    return content;
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-72"
        )}
      >
        {/* Logo + Toggle */}
        <div className={cn(
          "flex py-5 transition-all duration-300",
          collapsed ? "flex-col items-center gap-4 px-3" : "flex-row items-center justify-between px-5"
        )}>
          <Link to="/" className="flex items-center justify-center overflow-hidden" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img
              src={collapsed ? forgeIcon : forgeLogo}
              alt="Forge"
              className={cn(
                "shrink-0 transition-all duration-300 object-contain cursor-pointer",
                collapsed ? "h-8 w-8" : "h-10 max-w-[180px]"
              )}
            />
          </Link>

          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={toggle}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground/80 transition-colors duration-200"
              >
                {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="bg-popover text-popover-foreground">
                Expand sidebar
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Main Navigation */}
        <nav className={cn("flex-1 space-y-2 mt-2", collapsed ? "px-3" : "px-3")}>
          {navItems.map(({ to, icon, label }) => {
            const isActive = to === '/'
              ? location.pathname === '/'
              : location.pathname === to || location.pathname.startsWith(to + '/');
            return <NavItem key={to} to={to} icon={icon} label={label} isActive={isActive} />;
          })}
        </nav>

        {/* Bottom Section */}
        <div className={cn("space-y-2 pb-4", collapsed ? "px-3" : "px-3")}>
          {bottomItems.map(({ to, icon, label }) => (
            <NavItem
              key={to}
              to={to}
              icon={icon}
              label={label}
              isActive={location.pathname === to || location.pathname.startsWith(to + '/')}
            />
          ))}

          {isAdmin && (
            <NavItem
              to="/admin"
              icon={ShieldCheck}
              label="Admin"
              isActive={location.pathname.startsWith('/admin')}
            />
          )}

          {/* User Profile */}
          <NavLink
            to="/profile"
            className={cn(
              "group flex items-center gap-3 pt-4 pb-2 border-t border-sidebar-border/50 mt-3 rounded-xl transition-colors duration-200 cursor-pointer hover:bg-white/[0.04]",
              collapsed ? "justify-center px-2" : "px-3",
              location.pathname === '/profile' && "bg-white/[0.06]"
            )}
          >
            {collapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <span className="block">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary overflow-hidden border-2 border-border/40">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile?.full_name || 'Profile'} className="w-full h-full object-cover" />
                      ) : (
                        profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'
                      )}
                    </div>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-popover text-popover-foreground">
                  Profile
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary shrink-0 overflow-hidden border-2 border-border/40">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile?.full_name || 'Profile'} className="w-full h-full object-cover" />
                    ) : (
                      profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'
                    )}
                  </div>
                  <span className="text-sm font-medium text-sidebar-foreground truncate max-w-[120px]">
                    {profile?.full_name || 'User'}
                  </span>
                </div>
                <Settings className="h-4 w-4 text-sidebar-foreground/30 group-hover:text-sidebar-foreground/60 transition-colors" />
              </div>
            )}
          </NavLink>
        </div>
      </aside>
    </TooltipProvider>
  );
};
