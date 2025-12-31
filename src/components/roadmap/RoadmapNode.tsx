import React, { useState } from 'react';
import { 
  CheckCircle2, Lock, Star, Trophy, Clock, Target, 
  Users, Lightbulb, Zap, BookOpen, Calendar,
  MapPin, Sparkles, Eye, ChevronRight
} from 'lucide-react';
import { format, differenceInDays, differenceInHours } from 'date-fns';

interface RoadmapNodeProps {
  day: {
    id: string;
    day_number: number;
    title: string;
    description?: string | null;
    date?: string | null;
    location?: string | null;
    call_time?: string | null;
    checklist?: string[];
    mentors?: string[];
    key_learnings?: string[];
    activity_type?: string | null;
    duration_hours?: number | null;
    intensity_level?: string | null;
    teaser_text?: string | null;
    reveal_days_before?: number | null;
  };
  status: 'completed' | 'current' | 'upcoming' | 'locked';
  position: 'left' | 'center' | 'right';
  isFirst?: boolean;
  isLast?: boolean;
  totalChecklist?: number;
  completedChecklist?: number;
  forgeMode: 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';
  forgeStartDate?: Date | null;
}

const RoadmapNode: React.FC<RoadmapNodeProps> = ({ 
  day, 
  status, 
  position, 
  isFirst, 
  isLast,
  totalChecklist = 0,
  completedChecklist = 0,
  forgeMode,
  forgeStartDate
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate if content should be revealed (for pre-forge gradual reveal)
  const shouldRevealContent = () => {
    if (forgeMode !== 'PRE_FORGE') return true;
    if (!forgeStartDate) return false;
    
    const daysUntilForge = differenceInDays(forgeStartDate, new Date());
    const revealDays = day.reveal_days_before ?? 7;
    
    return daysUntilForge <= revealDays;
  };

  const isRevealed = shouldRevealContent();

  const getTimeRemaining = () => {
    if (!day.date) return null;
    const now = new Date();
    const dayDate = new Date(day.date);
    
    if (status === 'completed') return null;
    
    const daysLeft = differenceInDays(dayDate, now);
    const hoursLeft = differenceInHours(dayDate, now);
    
    if (daysLeft > 0) return `${daysLeft}d away`;
    if (hoursLeft > 0) return `${hoursLeft}h left`;
    return 'Today';
  };

  const getProgressPercent = () => {
    if (status === 'completed') return 100;
    if (status === 'locked' || status === 'upcoming') return 0;
    if (totalChecklist === 0) return status === 'current' ? 50 : 0;
    return Math.round((completedChecklist / totalChecklist) * 100);
  };

  const getIntensityIcon = () => {
    const level = day.intensity_level || 'medium';
    if (level === 'low') return <Zap className="w-3 h-3" />;
    if (level === 'high' || level === 'intense') return (
      <div className="flex">
        <Zap className="w-3 h-3" />
        <Zap className="w-3 h-3 -ml-1" />
        {level === 'intense' && <Zap className="w-3 h-3 -ml-1" />}
      </div>
    );
    return <Zap className="w-3 h-3" />;
  };

  const getActivityIcon = () => {
    const type = day.activity_type?.toLowerCase() || '';
    if (type.includes('workshop')) return <BookOpen className="w-4 h-4" />;
    if (type.includes('network')) return <Users className="w-4 h-4" />;
    if (type.includes('session')) return <Lightbulb className="w-4 h-4" />;
    if (type.includes('field')) return <MapPin className="w-4 h-4" />;
    return <Star className="w-4 h-4" />;
  };

  const nodeSize = status === 'current' ? 'w-20 h-20' : 'w-16 h-16';
  
  return (
    <div 
      className={`relative flex items-start ${
        position === 'left' ? 'justify-start pl-4 md:pl-8' : 
        position === 'right' ? 'justify-end pr-4 md:pr-8' : 
        'justify-center'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Node + Expandable Card Container */}
      <div className={`flex items-start gap-4 ${
        position === 'right' ? 'flex-row-reverse' : 'flex-row'
      }`}>
        
        {/* Main Node */}
        <div className="relative group cursor-pointer flex-shrink-0" onClick={() => setIsExpanded(!isExpanded)}>
          {/* Outer glow ring for current */}
          {status === 'current' && (
            <div className="absolute inset-0 -m-3 rounded-full bg-primary/20 animate-pulse-soft" />
          )}
          
          {/* Progress ring */}
          <div className={`relative ${nodeSize} rounded-full transition-all duration-300 ${
            isHovered || isExpanded ? 'scale-110' : ''
          }`}>
            {/* Background circle */}
            <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
              status === 'completed' 
                ? 'bg-primary shadow-[0_0_30px_hsl(var(--primary)/0.4)]' 
                : status === 'current'
                ? 'bg-gradient-to-br from-primary via-primary to-accent shadow-[0_0_40px_hsl(var(--primary)/0.5)]'
                : status === 'upcoming'
                ? 'bg-secondary border-2 border-border'
                : 'bg-muted/50 border-2 border-border/30'
            }`} />
            
            {/* Progress ring SVG */}
            {(status === 'current' || status === 'completed') && (
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="hsl(var(--primary-foreground) / 0.2)"
                  strokeWidth="3"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="hsl(var(--primary-foreground))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${getProgressPercent() * 2.83} 283`}
                  className="transition-all duration-500"
                />
              </svg>
            )}

            {/* Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              {status === 'completed' && (
                <CheckCircle2 className="w-7 h-7 text-primary-foreground" />
              )}
              {status === 'current' && (
                <Star className="w-8 h-8 text-primary-foreground fill-primary-foreground animate-pulse-soft" />
              )}
              {status === 'upcoming' && (
                isRevealed ? (
                  <Star className="w-6 h-6 text-muted-foreground" />
                ) : (
                  <Eye className="w-5 h-5 text-muted-foreground" />
                )
              )}
              {status === 'locked' && (
                <Lock className="w-5 h-5 text-muted-foreground/50" />
              )}
            </div>

            {/* Day number badge */}
            <div className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-xs font-bold transition-all ${
              status === 'completed' || status === 'current'
                ? 'bg-primary-foreground text-primary'
                : 'bg-border text-muted-foreground'
            }`}>
              {day.day_number === 0 ? 'P' : day.day_number}
            </div>

            {/* Trophy for completed last */}
            {isLast && status === 'completed' && (
              <Trophy className="absolute -top-3 -right-2 w-5 h-5 text-accent animate-float" />
            )}

            {/* Start badge for first current */}
            {isFirst && status === 'current' && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-bold shadow-lg whitespace-nowrap">
                START HERE
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45" />
              </div>
            )}
          </div>
        </div>

        {/* Expandable Detail Card */}
        <div className={`transition-all duration-300 overflow-hidden ${
          isExpanded || isHovered ? 'opacity-100 max-w-[280px] md:max-w-[320px]' : 'opacity-0 max-w-0'
        }`}>
          <div className="glass-premium rounded-xl p-4 min-w-[240px] md:min-w-[280px] shadow-elevated">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    status === 'completed' ? 'bg-primary/20 text-primary' :
                    status === 'current' ? 'bg-primary text-primary-foreground' :
                    'bg-secondary text-muted-foreground'
                  }`}>
                    {day.day_number === 0 ? 'Pre-Forge' : `Day ${day.day_number}`}
                  </span>
                  {status === 'current' && (
                    <span className="flex items-center gap-1 text-xs text-primary font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-foreground text-sm md:text-base">
                  {isRevealed ? day.title : '???'}
                </h4>
              </div>
              {day.activity_type && isRevealed && (
                <div className="p-2 rounded-lg bg-secondary/50 text-muted-foreground">
                  {getActivityIcon()}
                </div>
              )}
            </div>

            {/* PRE_FORGE: Teaser or Locked Content */}
            {forgeMode === 'PRE_FORGE' && !isRevealed && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground italic">
                  {day.teaser_text || 'Something special awaits...'}
                </p>
                <div className="flex items-center gap-2 text-xs text-primary">
                  <Sparkles className="w-3 h-3" />
                  <span>Unlocks as Forge approaches</span>
                </div>
              </div>
            )}

            {/* Revealed Content */}
            {isRevealed && (
              <div className="space-y-3">
                {/* Activity Type & Duration */}
                {(day.activity_type || day.duration_hours) && (
                  <div className="flex flex-wrap gap-2">
                    {day.activity_type && (
                      <span className="px-2 py-1 rounded-md bg-secondary/50 text-xs text-muted-foreground">
                        {day.activity_type}
                      </span>
                    )}
                    {day.duration_hours && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/50 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {day.duration_hours}h
                      </span>
                    )}
                    {day.intensity_level && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/50 text-xs text-muted-foreground">
                        {getIntensityIcon()}
                        {day.intensity_level}
                      </span>
                    )}
                  </div>
                )}

                {/* Description */}
                {day.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{day.description}</p>
                )}

                {/* Mentors */}
                {day.mentors && day.mentors.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {day.mentors.map((mentor, i) => (
                        <span key={i} className="text-xs text-foreground bg-primary/10 px-2 py-0.5 rounded-full">
                          {mentor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Learnings */}
                {day.key_learnings && day.key_learnings.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {day.key_learnings.slice(0, 3).map((learning, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-accent" />
                          <span>{learning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Progress Status (During Forge) */}
                {forgeMode === 'DURING_FORGE' && status === 'current' && (
                  <div className="pt-2 border-t border-border/30 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-primary font-semibold">{getProgressPercent()}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full gradient-primary rounded-full transition-all duration-500"
                        style={{ width: `${getProgressPercent()}%` }}
                      />
                    </div>
                    {totalChecklist > 0 && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Target className="w-3 h-3" />
                        <span>{completedChecklist}/{totalChecklist} tasks completed</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Time/Location (During Forge) */}
                {forgeMode === 'DURING_FORGE' && (day.date || day.location || day.call_time) && (
                  <div className="pt-2 border-t border-border/30 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {day.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(day.date), 'MMM d')}
                      </span>
                    )}
                    {day.call_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {day.call_time}
                      </span>
                    )}
                    {day.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {day.location}
                      </span>
                    )}
                  </div>
                )}

                {/* Post-Forge: What's Next */}
                {forgeMode === 'POST_FORGE' && status === 'completed' && (
                  <div className="pt-2 border-t border-border/30">
                    <div className="flex items-center gap-2 text-primary text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-medium">Completed</span>
                    </div>
                  </div>
                )}

                {/* Upcoming time remaining */}
                {status === 'upcoming' && getTimeRemaining() && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{getTimeRemaining()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapNode;