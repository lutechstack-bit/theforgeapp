import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import forgeLogo from '@/assets/forge-logo.png';

export const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 md:left-56 z-50 glass border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 md:hidden">
          <img src={forgeLogo} alt="Forge" className="h-8 w-auto" />
        </Link>
        <div className="hidden md:block" />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/updates')}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
          >
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover"
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
