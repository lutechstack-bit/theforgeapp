import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import forgeLogo from '@/assets/forge-logo.png';

const pageNames: Record<string, string> = {
  '/': 'Home',
  '/community': 'Community',
  '/learn': 'Learn',
  '/roadmap': 'Your Roadmap',
  '/events': 'Events',
  '/perks': 'Perks',
  '/profile': 'Profile',
  '/updates': 'Updates',
};

export const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();

  const currentPage = pageNames[location.pathname] || 'Forge';

  return (
    <header className="fixed top-0 left-0 right-0 md:left-56 z-50 glass-nav border-b border-white/10">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        {/* Mobile Logo */}
        <Link to="/" className="flex items-center gap-2 md:hidden">
          <img src={forgeLogo} alt="Forge" className="h-8 w-auto" />
        </Link>

        {/* Desktop: Page Title with accent */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <h1 className="text-lg font-semibold text-foreground">{currentPage}</h1>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <span className="text-sm text-muted-foreground">
            Welcome back, <span className="text-primary font-medium">{profile?.full_name?.split(' ')[0] || 'Forger'}</span>
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/updates')}
            className="relative glass-card hover:bg-white/10 rounded-full w-10 h-10 transition-all duration-300 hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            className="glass-card hover:bg-white/10 rounded-full w-10 h-10 transition-all duration-300 hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)] overflow-hidden"
          >
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};
