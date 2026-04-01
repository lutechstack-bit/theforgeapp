import React from 'react';
import { MapPin, Clock, DollarSign, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export interface GigData {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  gig_type: string | null;
  pay_type: string | null;
  budget: string | null;
  duration: string | null;
  location: string | null;
  roles_needed: string[];
  contact_info: string | null;
  visibility: string | null;
  status: string | null;
  user_id: string;
  created_at: string | null;
  poster_name: string | null;
  poster_avatar: string | null;
}

interface GigCardProps {
  gig: GigData;
}

const payTypeLabel: Record<string, string> = {
  paid: 'Paid',
  revenue_share: 'Revenue Share',
  credit_only: 'Credit Only',
};

export const GigCard: React.FC<GigCardProps> = ({ gig }) => {
  const initials = (gig.poster_name || 'U').charAt(0).toUpperCase();

  return (
    <div className="p-4 rounded-xl border border-border/30 bg-card hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-foreground line-clamp-1">{gig.title}</h3>
        {gig.pay_type && (
          <span className={cn(
            'px-2 py-0.5 text-[10px] font-semibold rounded-full shrink-0',
            gig.pay_type === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
          )}>
            {payTypeLabel[gig.pay_type] || gig.pay_type}
          </span>
        )}
      </div>

      {gig.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{gig.description}</p>
      )}

      {gig.roles_needed.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {gig.roles_needed.map(role => (
            <span key={role} className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">
              {role}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          {gig.location && (
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{gig.location}</span>
          )}
          {gig.budget && (
            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{gig.budget}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Avatar className="w-5 h-5">
            <AvatarImage src={gig.poster_avatar || undefined} />
            <AvatarFallback className="text-[8px] bg-muted">{initials}</AvatarFallback>
          </Avatar>
          <span>{gig.poster_name}</span>
        </div>
      </div>
    </div>
  );
};
