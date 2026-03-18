import React from 'react';
import { MapPin, Clock, DollarSign, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface GigData {
  id: string;
  user_id: string;
  title: string;
  category: string | null;
  gig_type: string | null;
  description: string | null;
  roles_needed: string[];
  pay_type: string | null;
  budget: string | null;
  duration: string | null;
  location: string | null;
  visibility: string | null;
  status: string | null;
  created_at: string;
  poster_name: string | null;
  poster_avatar: string | null;
}

interface GigCardProps {
  gig: GigData;
  onClick?: () => void;
}

const payLabel = (type: string | null) => {
  switch (type) {
    case 'paid': return { text: 'Paid', cls: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' };
    case 'revenue_share': return { text: 'Revenue Share', cls: 'bg-primary/10 text-primary border-primary/20' };
    case 'credit_only': return { text: 'Credit Only', cls: 'bg-muted text-muted-foreground border-border/30' };
    default: return { text: 'Paid', cls: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' };
  }
};

export const GigCard: React.FC<GigCardProps> = ({ gig, onClick }) => {
  const pay = payLabel(gig.pay_type);

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-border/30 bg-card p-4 space-y-3 hover:border-primary/30 transition-all active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm line-clamp-2">{gig.title}</h3>
          {gig.category && <p className="text-[11px] text-primary/70 mt-0.5">{gig.category}</p>}
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${pay.cls}`}>
          {pay.text}
        </span>
      </div>

      {gig.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{gig.description}</p>
      )}

      {gig.roles_needed.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {gig.roles_needed.slice(0, 3).map((role) => (
            <span key={role} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground">
              {role}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1 border-t border-border/20">
        {gig.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{gig.location}</span>}
        {gig.budget && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{gig.budget}</span>}
        <span className="flex items-center gap-1 ml-auto">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(new Date(gig.created_at), { addSuffix: true })}
        </span>
      </div>

      {gig.visibility === 'cohort_only' && (
        <div className="flex items-center gap-1 text-[10px] font-semibold text-primary">
          <Users className="w-3 h-3" /> Cohort Only
        </div>
      )}
    </button>
  );
};
