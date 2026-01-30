import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, ClipboardList, ChevronRight, Sparkles } from 'lucide-react';

interface KYFormQuickAccessProps {
  isCompleted: boolean;
  cohortType: 'FORGE' | 'FORGE_WRITING' | 'FORGE_CREATORS' | null;
}

export const KYFormQuickAccess: React.FC<KYFormQuickAccessProps> = ({ isCompleted, cohortType }) => {
  const navigate = useNavigate();
  
  const getFormRoute = () => {
    switch (cohortType) {
      case 'FORGE_WRITING': return '/kyw-form';
      case 'FORGE_CREATORS': return '/kyc-form';
      default: return '/kyf-form';
    }
  };
  
  const getFormLabel = () => {
    switch (cohortType) {
      case 'FORGE_WRITING': return 'Know Your Writer';
      case 'FORGE_CREATORS': return 'Know Your Creator';
      default: return 'Know Your Filmmaker';
    }
  };
  
  const handleClick = () => {
    if (isCompleted) {
      navigate('/my-kyform');
    } else {
      navigate(getFormRoute());
    }
  };
  
  return (
    <button onClick={handleClick} className="block w-full text-left">
      <div className="relative flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 hover:border-primary/40 transition-all group overflow-hidden active:scale-[0.98]">
        {/* Decorative sparkle */}
        <div className="absolute top-1 right-12 opacity-30 group-hover:opacity-60 transition-opacity">
          <Sparkles className="h-3 w-3 text-primary" />
        </div>
        
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 group-hover:from-primary group-hover:to-primary/80 group-hover:border-transparent transition-all">
          {isCompleted ? (
            <ClipboardCheck className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
          ) : (
            <ClipboardList className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm">{getFormLabel()}</h3>
          <p className="text-xs text-muted-foreground">
            {isCompleted ? 'View your submitted details' : 'Complete your form to unlock access'}
          </p>
        </div>
        {!isCompleted && (
          <span className="relative flex h-2 w-2 mr-1">
            <span className="animate-ping absolute h-full w-full rounded-full bg-primary opacity-75" />
            <span className="rounded-full h-2 w-2 bg-primary" />
          </span>
        )}
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  );
};
