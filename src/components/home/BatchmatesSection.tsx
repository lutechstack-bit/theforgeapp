import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChevronRight } from 'lucide-react';
import forgeIcon from '@/assets/forge-icon.png';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { promiseWithTimeout } from '@/lib/promiseTimeout';
import { cn } from '@/lib/utils';

interface BatchmatesSectionProps {
  title?: string;
  subtitle?: string;
}

const BatchmatesSection: React.FC<BatchmatesSectionProps> = ({
  title = 'Your Batchmates',
  subtitle,
}) => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const { data: batchmates, isLoading } = useQuery({
    queryKey: ['batchmates', profile?.edition_id],
    queryFn: async () => {
      const result = await promiseWithTimeout(
        supabase
          .from('profiles')
          .select('id, full_name, avatar_url, city')
          .eq('edition_id', profile!.edition_id!)
          .neq('id', user!.id)
          .limit(12)
          .then(res => res),
        10000,
        'batchmates'
      );
      if (result.error) throw result.error;
      return result.data || [];
    },
    enabled: !!profile?.edition_id && !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="flex gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-16 h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!batchmates || batchmates.length === 0) return null;

  const displayMembers = batchmates.slice(0, 5);
  const remaining = batchmates.length > 5 ? batchmates.length - 5 : 0;

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={forgeIcon} alt="" className="w-4 h-4 opacity-60" />
          <div>
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/community')}
          className="text-primary hover:text-primary hover:bg-primary/10"
        >
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Avatar Grid */}
      <div className="rounded-2xl border border-[#FFBF00]/20 bg-card p-4 flex items-center gap-3 overflow-x-auto scrollbar-hide">
        {displayMembers.map((member) => (
          <div
            key={member.id}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-[64px]"
          >
            <Avatar className="w-14 h-14 border-2 border-border/30">
              <AvatarImage src={member.avatar_url || undefined} alt={member.full_name || ''} />
              <AvatarFallback className="bg-primary/15 text-primary text-sm font-bold">
                {getInitials(member.full_name)}
              </AvatarFallback>
            </Avatar>
            <p className="text-[10px] text-foreground font-medium text-center line-clamp-1 max-w-[64px]">
              {member.full_name?.split(' ')[0] || ''}
            </p>
            {member.city && (
              <p className="text-[8px] text-muted-foreground text-center line-clamp-1 -mt-1">
                {member.city}
              </p>
            )}
          </div>
        ))}

        {/* +N more */}
        {remaining > 0 && (
          <button
            onClick={() => navigate('/community')}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-[64px] group"
          >
            <div className="w-14 h-14 rounded-full bg-secondary border-2 border-border/30 flex items-center justify-center group-hover:border-primary/30 transition-colors">
              <span className="text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors">
                +{remaining}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium group-hover:text-primary transition-colors">
              more
            </p>
          </button>
        )}
      </div>
    </section>
  );
};

export default BatchmatesSection;
