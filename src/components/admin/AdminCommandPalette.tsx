import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard, Users, Calendar, FileText, Map, ClipboardList, Moon,
  Package, PanelRight, UserCircle, Star, BookOpen, Route, ListTodo,
  Megaphone, History, Home, Target, Gift, Handshake, ExternalLink, Film,
  CreditCard, Activity, Sparkles, Plus, Download, Search
} from 'lucide-react';

const adminPages = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'User Activity', path: '/admin/activity', icon: Activity },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Editions', path: '/admin/editions', icon: Calendar },
  { label: 'KY Forms', path: '/admin/ky-forms', icon: ClipboardList },
  { label: 'Payments', path: '/admin/payments', icon: CreditCard },
  { label: 'Homepage', path: '/admin/homepage', icon: Home },
  { label: "Today's Focus", path: '/admin/todays-focus', icon: Target },
  { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
  { label: 'Perks', path: '/admin/perks', icon: Gift },
  { label: 'Events', path: '/admin/events', icon: Calendar },
  { label: 'Roadmap', path: '/admin/roadmap', icon: Map },
  { label: 'Roadmap Sidebar', path: '/admin/roadmap-sidebar', icon: PanelRight },
  { label: 'Equipment', path: '/admin/equipment', icon: Package },
  { label: 'Nightly Rituals', path: '/admin/nightly-rituals', icon: Moon },
  { label: 'Journey Stages', path: '/admin/journey-stages', icon: Route },
  { label: 'Journey Tasks', path: '/admin/journey-tasks', icon: ListTodo },
  { label: 'Learn', path: '/admin/learn', icon: FileText },
  { label: 'Network', path: '/admin/network', icon: Handshake },
  { label: 'Community Highlights', path: '/admin/community-highlights', icon: Star },
  { label: 'Alumni Showcase', path: '/admin/alumni-showcase', icon: Film },
  { label: 'Mentors', path: '/admin/mentors', icon: UserCircle },
  { label: 'Explore Programs', path: '/admin/explore-programs', icon: ExternalLink },
  { label: 'Auto Updates', path: '/admin/auto-updates', icon: Sparkles },
  { label: 'Documentation', path: '/admin/docs', icon: BookOpen },
  { label: 'Changelog', path: '/admin/changelog', icon: History },
];

const quickActions = [
  { label: 'Create User', path: '/admin/users?action=create', icon: Plus },
  { label: 'Create Edition', path: '/admin/editions?action=create', icon: Plus },
];

interface AdminCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdminCommandPalette: React.FC<AdminCommandPaletteProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: users } = useQuery({
    queryKey: ['admin-cmd-users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .order('full_name');
      return data || [];
    },
    enabled: open,
  });

  const handleSelect = useCallback((path: string) => {
    onOpenChange(false);
    setSearch('');
    navigate(path);
  }, [navigate, onOpenChange]);

  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  const filteredUsers = (users || []).filter(u => 
    search.length >= 2 && (
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    )
  ).slice(0, 8);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages, users, actions..." value={search} onValueChange={setSearch} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Pages">
          {adminPages.map(page => (
            <CommandItem key={page.path} onSelect={() => handleSelect(page.path)} className="gap-2">
              <page.icon className="w-4 h-4 text-muted-foreground" />
              <span>{page.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          {quickActions.map(action => (
            <CommandItem key={action.path} onSelect={() => handleSelect(action.path)} className="gap-2">
              <action.icon className="w-4 h-4 text-muted-foreground" />
              <span>{action.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {filteredUsers.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Users">
              {filteredUsers.map(user => (
                <CommandItem key={user.id} onSelect={() => handleSelect(`/admin/users`)} className="gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback className="text-[8px]">{(user.full_name || '?').slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{user.full_name || 'Unnamed'}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{user.email}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};
