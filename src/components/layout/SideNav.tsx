import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, BookOpen, Map, Calendar, Gift, Settings, Info, PanelLeftClose, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import forgeLogo from '@/assets/forge-logo.png';
import forgeIcon from '@/assets/forge-icon.png';
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

  const NavItem = ({ to, icon: Icon, label, isActive }: { to: string; icon: React.ElementType; label: string; isActive: boolean }) => {
    const content = (
      <NavLink
        to={to}
        className={cn(
          "flex items-center gap-3 rounded-xl transition-all duration-200 text-[15px] font-medium",
          collapsed ? "justify-center p-3" : "px-4 py-3",
          isActive
            ? "bg-sidebar-accent text-sidebar-foreground"
            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        )}
      >
        <Icon className="shrink-0 h-5 w-5" />
        {!collapsed && <span>{label}</span>}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="bg-popover text-popover-foreground">
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
          "hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-sidebar transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Logo + Toggle */}
        <div className={cn(
          "flex items-center justify-between py-5",
          collapsed ? "px-4" : "px-5"
        )}>
          <div className="flex items-center gap-3 overflow-hidden">
            <img 
              src={collapsed ? forgeIcon : forgeLogo} 
              alt="Forge" 
              className={cn("shrink-0 transition-all duration-300", collapsed ? "h-7 w-7" : "h-8")}
            />
          </div>
          
          {/* Toggle Button */}
          <button
            onClick={toggle}
            className={cn(
              "flex items-center justify-center rounded-lg bg-sidebar-accent/80 hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-all duration-200",
              collapsed ? "w-9 h-9" : "w-8 h-8"
            )}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
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
