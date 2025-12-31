import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, BookOpen, Map, Calendar, Gift, Settings, Info, PanelLeftClose, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { useTheme } from '@/contexts/ThemeContext';
import forgeLogo from '@/assets/forge-logo.png';
import forgeIcon from '@/assets/forge-icon.png';
import forgeWritingLogo from '@/assets/forge-writing-logo.png';
import forgeCreatorsLogo from '@/assets/forge-creators-logo.png';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/perks', icon: Gift, label: 'Perks' },
  { to: '/learn', icon: BookOpen, label: 'Learn' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
];

const bottomItems = [
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/updates', icon: Info, label: 'About Forge' },
];

export const SideNav: React.FC = () => {
  const { collapsed, toggle } = useSidebar();
  const location = useLocation();
  const { profile } = useAuth();
  const { cohortType } = useTheme();

  // Get the appropriate logo based on cohort type
  const getLogo = () => {
    switch (cohortType) {
      case 'FORGE_WRITING':
        return forgeWritingLogo;
      case 'FORGE_CREATORS':
        return forgeCreatorsLogo;
      default:
        return forgeLogo;
    }
  };

  const currentLogo = getLogo();

  const NavItem = ({ to, icon: Icon, label, isActive }: { to: string; icon: React.ElementType; label: string; isActive: boolean }) => {
    const content = (
      <NavLink
        to={to}
        className={cn(
          "group relative flex items-center gap-3.5 rounded-xl transition-all duration-300 ease-out text-[15px] font-medium",
          collapsed ? "justify-center p-3" : "px-4 py-3",
          isActive
            ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-[0_0_20px_-5px_hsl(var(--primary)/0.4)]"
            : "text-sidebar-foreground/50 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        )}
      >
        {/* Active indicator bar */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary shadow-[0_0_8px_2px_hsl(var(--primary)/0.5)]" />
        )}
        
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
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
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
          <div className="flex items-center justify-center overflow-hidden">
            <img 
              src={collapsed ? forgeIcon : currentLogo} 
              alt="Forge" 
              className={cn(
                "shrink-0 transition-all duration-300 object-contain",
                collapsed ? "h-8 w-8" : "h-10 max-w-[180px]"
              )}
            />
          </div>
          
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

          {/* Settings */}
          <NavItem 
            to="/profile" 
            icon={Settings} 
            label="Settings" 
            isActive={location.pathname === '/profile'} 
          />

          {/* User Profile */}
          <div className={cn(
            "flex items-center gap-3 pt-3 border-t border-sidebar-border mt-3",
            collapsed ? "justify-center" : "px-2"
          )}>
            {collapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <NavLink to="/profile" className="block">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary overflow-hidden">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'
                      )}
                    </div>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-popover text-popover-foreground">
                  {profile?.full_name || 'Profile'}
                </TooltipContent>
              </Tooltip>
            ) : (
              <NavLink 
                to="/profile" 
                className="flex items-center gap-3 py-2 w-full hover:opacity-80 transition-opacity"
              >
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary shrink-0 overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'
                  )}
                </div>
                <span className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.full_name || 'Profile'}
                </span>
              </NavLink>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
};
