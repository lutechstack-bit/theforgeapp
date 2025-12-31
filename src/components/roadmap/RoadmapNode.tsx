import React, { useState } from 'react';
import { CheckCircle2, Lock, Star, Trophy, Clock, Target, ChevronUp } from 'lucide-react';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type RoadmapDay = Database['public']['Tables']['roadmap_days']['Row'];

interface RoadmapNodeProps {
  day: RoadmapDay;
  status: 'completed' | 'current' | 'upcoming' | 'locked';
  position: 'left' | 'center' | 'right';
  isFirst?: boolean;
  isLast?: boolean;
  totalChecklist?: number;
  completedChecklist?: number;
}

const RoadmapNode: React.FC<RoadmapNodeProps> = ({ 
  day, 
  status, 
  position, 
  isFirst, 
  isLast,
  totalChecklist = 0,
  completedChecklist = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getTimeRemaining = () => {
    if (!day.date) return null;
    const now = new Date();
    const dayDate = new Date(day.date);
    
    if (status === 'completed') return null;
    
    const daysLeft = differenceInDays(dayDate, now);
    const hoursLeft = differenceInHours(dayDate, now);
    
    if (daysLeft > 0) return `${daysLeft} day${daysLeft > 1 ? 's' : ''} away`;
    if (hoursLeft > 0) return `${hoursLeft} hour${hoursLeft > 1 ? 's' : ''} left`;
    return 'Today';
  };

  const getProgressPercent = () => {
    if (status === 'completed') return 100;
    if (status === 'locked' || status === 'upcoming') return 0;
    if (totalChecklist === 0) return status === 'current' ? 50 : 0;
    return Math.round((completedChecklist / totalChecklist) * 100);
  };

  const nodeSize = status === 'current' ? 'w-20 h-20' : 'w-16 h-16';
  
  return (
    <div 
      className={`relative flex items-center justify-center ${
        position === 'left' ? 'justify-start ml-8' : 
        position === 'right' ? 'justify-end mr-8' : 
        'justify-center'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Node */}
      <div className="relative group cursor-pointer">
        {/* Outer glow ring for current */}
        {status === 'current' && (
          <div className="absolute inset-0 -m-2 rounded-full bg-primary/20 animate-pulse-soft" />
        )}
        
        {/* Progress ring */}
        <div className={`relative ${nodeSize} rounded-full transition-all duration-300 ${
          isHovered ? 'scale-110' : ''
        }`}>
          {/* Background circle */}
          <div className={`absolute inset-0 rounded-full ${
            status === 'completed' 
              ? 'bg-primary shadow-[0_0_30px_hsl(var(--primary)/0.4)]' 
              : status === 'current'
              ? 'bg-gradient-to-br from-primary via-primary to-accent shadow-[0_0_40px_hsl(var(--primary)/0.5)]'
              : status === 'upcoming'
              ? 'bg-secondary border-2 border-border'
              : 'bg-muted border-2 border-border/50'
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
              <Star className="w-6 h-6 text-muted-foreground" />
            )}
            {status === 'locked' && (
              <Lock className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          {/* Day number badge */}
          <div className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-xs font-bold ${
            status === 'completed' || status === 'current'
              ? 'bg-primary-foreground text-primary'
              : 'bg-border text-muted-foreground'
          }`}>
            {day.day_number === 0 ? 'P' : day.day_number}
          </div>

          {/* Trophy for last completed or current */}
          {isLast && status !== 'locked' && status !== 'upcoming' && (
            <Trophy className="absolute -top-3 -right-2 w-5 h-5 text-accent animate-float" />
          )}

          {/* Start badge for first */}
          {isFirst && status === 'current' && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-foreground text-background text-xs font-bold shadow-lg">
              START
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45" />
            </div>
          )}
        </div>

        {/* Hover tooltip */}
        <div className={`absolute z-50 transition-all duration-300 ${
          position === 'right' ? 'right-full mr-4' : 
          position === 'left' ? 'left-full ml-4' : 
          'top-full mt-4'
        } ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
          <div className="glass-premium rounded-xl p-4 min-w-[240px] shadow-elevated animate-scale-in">
            {/* Arrow */}
            <div className={`absolute w-3 h-3 bg-card rotate-45 border-l border-t border-border/40 ${
              position === 'right' ? 'right-[-6px] top-1/2 -translate-y-1/2' :
              position === 'left' ? 'left-[-6px] top-1/2 -translate-y-1/2' :
              'top-[-6px] left-1/2 -translate-x-1/2'
            }`} />
            
            {/* Content */}
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  status === 'completed' ? 'bg-primary/20 text-primary' :
                  status === 'current' ? 'bg-primary text-primary-foreground' :
                  'bg-secondary text-muted-foreground'
                }`}>
                  {day.day_number === 0 ? 'Pre-Forge' : `Day ${day.day_number}`}
                </span>
                {status === 'current' && (
                  <span className="text-xs text-primary font-medium animate-pulse">● ACTIVE</span>
                )}
              </div>
              
              <h4 className="font-bold text-foreground mb-2">{day.title}</h4>
              
              {/* Progress status */}
              <div className="space-y-2">
                {status === 'completed' ? (
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                ) : status === 'current' ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
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
                        <span>{completedChecklist}/{totalChecklist} tasks</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{getTimeRemaining() || 'Coming soon'}</span>
                  </div>
                )}
              </div>

              {/* Key action for current */}
              {status === 'current' && day.description && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground line-clamp-2">{day.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapNode;