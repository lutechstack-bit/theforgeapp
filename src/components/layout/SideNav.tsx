import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { Home, Users, BookOpen, Map, Calendar, Gift, Settings, Info, PanelLeftClose, PanelLeft, ChevronRight, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import forgeLogo from '@/assets/forge-logo.png';
import forgeIcon from '@/assets/forge-icon.png';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/perks', icon: Gift, label: 'Perks' },
  { to: '/learn', icon: BookOpen, label: 'Learn' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/profile', icon: Settings, label: 'Profile' },
];

const bottomItems = [
  { to: '/updates', icon: Info, label: 'About Forge' },
];

export const SideNav: React.FC = () => {
  const { collapsed, toggle } = useSidebar();
  const location = useLocation();
  const { profile, edition } = useAuth();
  const { isAdmin } = useAdminCheck();

  const NavItem = ({ to, icon: Icon, label, isActive }: { to: string; icon: React.ElementType; label: string; isActive: boolean }) => {
    const content = (
      <NavLink
        to={to}
        className={cn(
          "group relative flex items-center gap-3.5 rounded-xl transition-all duration-300 ease-out text-[15px] font-medium",
          collapsed ? "justify-center p-3" : "px-4 py-3 justify-between",
          isActive
            ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-[0_0_20px_-5px_hsl(var(--primary)/0.4)]"
            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        )}
      >
        {/* Active indicator bar */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary shadow-[0_0_8px_2px_hsl(var(--primary)/0.5)]" />
        )}
        
        <span className="flex items-center gap-3.5">
          {/* Icon container with premium glow effect */}
          <span className={cn(
            "relative shrink-0 flex items-center justify-center transition-all duration-300",
            isActive && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]"
          )}>
            <Icon className={cn(
              "h-[22px] w-[22px] transition-transform duration-300 ease-out",
              "group-hover:scale-110",
              isActive && "text-primary"
            )} strokeWidth={isActive ? 2.2 : 1.8} />
          </span>
          
          {!collapsed && (
            <span className={cn(
              "transition-all duration-300",
              isActive && "font-semibold"
            )}>{label}</span>
          )}
        </span>

        {/* Chevron for expanded mode */}
        {!collapsed && (
          <ChevronRight className={cn(
            "h-4 w-4 transition-all duration-300",
            isActive ? "text-primary" : "text-sidebar-foreground/30 group-hover:text-sidebar-foreground/60"
          )} />
        )}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <span className="block w-full">{content}</span>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="bg-popover/95 backdrop-blur-sm text-popover-foreground border-border/50 shadow-xl">
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
          collapsed ? "w-[72px]" : "w-64"
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
          
          {/* Toggle Button */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={toggle}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-sidebar-accent/80 hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-all duration-200"
              >
                {collapsed ? (
                  <PanelLeft className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
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
        <nav className={cn("flex-1 space-y-1", collapsed ? "px-3" : "px-3")}>
          {navItems.map(({ to, icon, label }) => (
            <NavItem 
              key={to} 
              to={to} 
              icon={icon} 
              label={label} 
              isActive={location.pathname === to} 
            />
          ))}
        </nav>

        {/* Bottom Section */}
        <div className={cn("space-y-1 pb-4", collapsed ? "px-3" : "px-3")}>
          {bottomItems.map(({ to, icon, label }) => (
            <NavItem 
              key={to} 
              to={to} 
              icon={icon} 
              label={label} 
              isActive={location.pathname === to} 
            />
          ))}

          {/* Admin Link - Only visible to admins */}
          {isAdmin && (
            <NavItem 
              to="/admin" 
              icon={Shield} 
              label="Admin" 
              isActive={location.pathname.startsWith('/admin')} 
            />
          )}


          {/* User Display - Navigates to Profile */}
          <NavLink
            to="/profile"
            className={cn(
              "group flex items-center gap-3 pt-4 pb-2 border-t border-sidebar-border mt-3 rounded-xl transition-all duration-200 cursor-pointer hover:bg-sidebar-accent/60",
              collapsed ? "justify-center px-2" : "px-3",
              location.pathname === '/profile' && "bg-primary/10"
            )}
          >
            {collapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <span className="block">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary overflow-hidden ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'
                      )}
                    </div>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-popover text-popover-foreground">
                  Go to Profile
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary shrink-0 overflow-hidden ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-sidebar-foreground truncate max-w-[120px]">
                      {profile?.full_name || 'User'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-sidebar-foreground/30 group-hover:text-sidebar-foreground/60 transition-colors" />
              </div>
            )}
          </NavLink>
        </div>
      </aside>
    </TooltipProvider>
  );
};
