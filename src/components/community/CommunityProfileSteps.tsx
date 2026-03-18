import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OccupationPillSelector } from './OccupationPillSelector';
import { FloatingInput } from '@/components/ui/floating-input';
import { FloatingTextarea } from '@/components/ui/floating-textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Briefcase, Globe, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepProps {
  formData: Record<string, any>;
  updateField: (key: string, value: any) => void;
}

const PORTFOLIO_TYPES = ['Portfolio', 'Reel', 'Website', 'YouTube'];

export const CommunityProfileStep1: React.FC<StepProps> = ({ formData, updateField }) => {
  const { profile } = useAuth();
  const tagline = formData.tagline || '';
  const intro = formData.intro || '';

  return (
    <div className="space-y-4 py-2">
      <div>
        <h3 className="text-lg font-bold text-foreground">The Basics</h3>
        <p className="text-xs text-muted-foreground mt-1">Your cinematic elevator pitch</p>
      </div>
      <FloatingInput label="Full Name" value={profile?.full_name || ''} disabled className="opacity-60 bg-secondary/50" />
      <FloatingInput label="City" value={profile?.city || ''} disabled className="opacity-60 bg-secondary/50" />
      <div className="space-y-1">
        <FloatingTextarea
          label="Tagline — the soul of your story *"
          value={tagline}
          onChange={(e) => updateField('tagline', e.target.value.slice(0, 100))}
          className="min-h-[70px] bg-secondary/50"
        />
        <p className="text-[11px] text-muted-foreground text-right">{tagline.length}/100</p>
      </div>
      <div className="space-y-1">
        <FloatingTextarea
          label="Quick intro — what do you do?"
          value={intro}
          onChange={(e) => updateField('intro', e.target.value.slice(0, 100))}
          className="min-h-[60px] bg-secondary/50"
        />
        <p className="text-[11px] text-muted-foreground text-right">{intro.length}/100</p>
      </div>
    </div>
  );
};

export const CommunityProfileStep2: React.FC<StepProps> = ({ formData, updateField }) => {
  const { edition } = useAuth();
  const occupations = formData.occupations || [];
  const about = formData.about || '';

  return (
    <div className="space-y-4 py-2">
      <div>
        <h3 className="text-lg font-bold text-foreground">Your Professional Soul</h3>
        <p className="text-xs text-muted-foreground mt-1">Select what you do — up to 4 roles</p>
      </div>
      <OccupationPillSelector selected={occupations} onChange={(v) => updateField('occupations', v)} />
      {edition && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-border/30 bg-card/50">
          <Briefcase className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{edition.cohort_type.replace(/_/g, ' ')}</span>
          <span className="text-[10px] text-muted-foreground ml-auto">{edition.city}</span>
        </div>
      )}
      <div className="space-y-1">
        <FloatingTextarea
          label="About your work"
          value={about}
          onChange={(e) => updateField('about', e.target.value.slice(0, 500))}
          className="min-h-[80px] bg-secondary/50"
        />
        <p className="text-[11px] text-muted-foreground text-right">{about.length}/500</p>
      </div>
    </div>
  );
};

export const CommunityProfileStep3: React.FC<StepProps> = ({ formData, updateField }) => {
  const availableForHire = formData.available_for_hire || false;
  const openToRemote = formData.open_to_remote || false;
  const portfolioUrl = formData.portfolio_url || '';
  const portfolioType = formData.portfolio_type || 'Portfolio';

  return (
    <div className="space-y-4 py-2">
      <div>
        <h3 className="text-lg font-bold text-foreground">Connect & Share</h3>
        <p className="text-xs text-muted-foreground mt-1">Let people know how to reach you</p>
      </div>
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/30 bg-card/50">
        <div>
          <Label className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" /> Available for hire
          </Label>
          <p className="text-[11px] text-muted-foreground mt-0.5">Show a badge on your profile</p>
        </div>
        <Switch checked={availableForHire} onCheckedChange={(v) => updateField('available_for_hire', v)} />
      </div>
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/30 bg-card/50">
        <div>
          <Label className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" /> Open to remote
          </Label>
          <p className="text-[11px] text-muted-foreground mt-0.5">Collaborate from anywhere</p>
        </div>
        <Switch checked={openToRemote} onCheckedChange={(v) => updateField('open_to_remote', v)} />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><LinkIcon className="w-3 h-3" /> Portfolio Link</p>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {PORTFOLIO_TYPES.map(t => (
            <button key={t} onClick={() => updateField('portfolio_type', t)}
              className={cn('px-3 py-1.5 rounded-full text-[11px] font-medium border shrink-0 active:scale-95 transition-all',
                portfolioType === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border/30'
              )}>
              {t}
            </button>
          ))}
        </div>
        <FloatingInput
          label={`${portfolioType} URL`}
          value={portfolioUrl}
          onChange={(e) => updateField('portfolio_url', e.target.value)}
          className="bg-secondary/50"
        />
      </div>
    </div>
  );
};
