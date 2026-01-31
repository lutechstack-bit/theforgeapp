import React from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Clock, MapPin, Users, Lightbulb, Calendar,
  CheckCircle2, Target, ChevronRight, Backpack, Trophy, Sparkles, Globe
} from 'lucide-react';
import { getDayIcon, getScheduleIcon } from '@/lib/roadmapIcons';
import SessionMeetingCard from './SessionMeetingCard';
import type { CohortType } from '@/lib/roadmapIcons';

interface ScheduleItem {
  time: string;
  activity: string;
  icon?: string;
}

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
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
    theme_name?: string | null;
    objective?: string | null;
    schedule?: ScheduleItem[];
    what_youll_learn?: string[] | null;
    gear_materials?: string[] | null;
    expected_outcomes?: string[] | null;
    pro_tips?: string[] | null;
    // Virtual meeting fields
    is_virtual?: boolean;
    meeting_url?: string | null;
    meeting_id?: string | null;
    meeting_passcode?: string | null;
    session_start_time?: string | null;
    session_duration_hours?: number | null;
  };
  status: 'completed' | 'current' | 'upcoming' | 'locked';
  cohortType: CohortType;
  forgeMode: 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';
}

const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  onClose,
  day,
  status,
  cohortType,
  forgeMode,
}) => {
  const schedule = day.schedule || [];

  // Calculate if we should show meeting credentials (48 hours before session or during forge)
  const sessionDate = day.date ? new Date(day.date) : null;
  const hoursUntilSession = sessionDate 
    ? (sessionDate.getTime() - Date.now()) / (1000 * 60 * 60) 
    : Infinity;
  
  // Show meeting card if: During Forge OR session is within 48 hours
  const showMeetingCard = forgeMode === 'DURING_FORGE' || (hoursUntilSession <= 48 && hoursUntilSession > -24);
  
  // Show "coming soon" message if: Pre-Forge AND session is more than 48 hours away
  const showMeetingComingSoon = forgeMode === 'PRE_FORGE' && hoursUntilSession > 48;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden glass-premium border-primary/20">
        {/* Header with gradient */}
        <div className="relative p-6 pb-4 gradient-subtle border-b border-border/30">
          {/* Status badge */}
          <div className="flex items-center gap-2 mb-3">
            <Badge 
              variant={status === 'completed' ? 'default' : status === 'current' ? 'default' : 'secondary'}
              className={status === 'current' ? 'animate-pulse-soft' : ''}
            >
              {day.day_number === 0 ? 'Pre-Forge' : `Day ${day.day_number}`}
            </Badge>
            {status === 'current' && (
              <span className="flex items-center gap-1 text-xs text-primary font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                LIVE NOW
              </span>
            )}
            {status === 'completed' && (
              <span className="flex items-center gap-1 text-xs text-primary">
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </span>
            )}
          </div>

          {/* Theme name (movie name) */}
          {day.theme_name && (
            <p className="text-xs text-primary/80 font-medium mb-1 tracking-wider uppercase">
              {day.theme_name}
            </p>
          )}

          {/* Title with icon */}
          <DialogHeader className="p-0">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow text-primary-foreground">
                {getDayIcon(cohortType, day.activity_type, day.day_number, 'md')}
              </div>
              <span>{day.title}</span>
            </DialogTitle>
          </DialogHeader>

          {/* Objective */}
          {day.objective && (
            <p className="mt-3 text-sm text-muted-foreground flex items-start gap-2">
              <Target className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
              {day.objective}
            </p>
          )}

          {/* Quick info row */}
          <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
            {day.date && (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/50">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(day.date), 'EEEE, MMMM d')}
              </span>
            )}
            {day.call_time && (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/50">
                <Clock className="w-3.5 h-3.5" />
                {day.call_time}
              </span>
            )}
            {day.is_virtual && cohortType !== 'FORGE_WRITING' ? (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 text-blue-400">
                <Globe className="w-3.5 h-3.5" />
                Online Session
              </span>
            ) : day.location ? (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/50">
                <MapPin className="w-3.5 h-3.5" />
                {day.location}
              </span>
            ) : null}
            {day.duration_hours && (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/50">
                <Clock className="w-3.5 h-3.5" />
                {day.duration_hours}h
              </span>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <ScrollArea className="max-h-[50vh]">
          <div className="p-6 space-y-6">
            {/* Virtual Meeting Card - Show for virtual sessions (48h before or during forge, not for FORGE_WRITING) */}
            {day.is_virtual && day.meeting_url && showMeetingCard && cohortType !== 'FORGE_WRITING' && (
              <SessionMeetingCard
                meetingUrl={day.meeting_url}
                meetingId={day.meeting_id}
                meetingPasscode={day.meeting_passcode}
                sessionTitle={day.title}
                sessionDate={day.date ? new Date(day.date) : null}
                sessionStartTime={day.session_start_time}
                sessionDurationHours={day.session_duration_hours}
                isLive={status === 'current'}
              />
            )}

            {/* Virtual Meeting Info - Show countdown when session is coming soon (not for FORGE_WRITING) */}
            {day.is_virtual && showMeetingComingSoon && cohortType !== 'FORGE_WRITING' && (
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                <Globe className="w-8 h-8 mx-auto mb-2 text-blue-400/70" />
                <p className="text-sm text-muted-foreground">
                  Meeting details will be available 48 hours before the session
                </p>
                {sessionDate && (
                  <p className="text-xs text-blue-400/80 mt-1">
                    Session starts: {format(sessionDate, 'EEEE, MMMM d')} at {day.session_start_time || day.call_time || 'TBA'}
                  </p>
                )}
              </div>
            )}
            {/* Description */}
            {day.description && (
              <div>
                <p className="text-sm text-muted-foreground leading-relaxed">{day.description}</p>
              </div>
            )}

            {/* Schedule Timeline */}
            {schedule.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Day Schedule
                </h4>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-border" />
                  
                  <div className="space-y-4">
                    {schedule.map((item, index) => (
                      <div key={index} className="relative flex items-start gap-4 pl-2">
                        {/* Timeline dot */}
                        <div className="w-6 h-6 rounded-full bg-secondary border-2 border-border flex items-center justify-center z-10 text-muted-foreground">
                          {getScheduleIcon(item.activity, 'sm')}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 pb-2">
                          <span className="text-xs text-primary font-semibold">{item.time}</span>
                          <p className="text-sm text-foreground">{item.activity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Mentors */}
            {day.mentors && day.mentors.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Mentors
                </h4>
                <div className="flex flex-wrap gap-2">
                  {day.mentors.map((mentor, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1.5 rounded-full text-sm bg-primary/10 text-foreground border border-primary/20"
                    >
                      {mentor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* What You'll Learn */}
            {day.what_youll_learn && day.what_youll_learn.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  What You'll Learn
                </h4>
                <ul className="space-y-2">
                  {day.what_youll_learn.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Learnings (from previous cohorts) */}
            {day.key_learnings && day.key_learnings.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  Key Takeaways
                </h4>
                <ul className="space-y-2">
                  {day.key_learnings.map((learning, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                      <span>{learning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gear & Materials */}
            {day.gear_materials && day.gear_materials.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Backpack className="w-4 h-4 text-primary" />
                  Bring With You
                </h4>
                <div className="flex flex-wrap gap-2">
                  {day.gear_materials.map((item, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1.5 rounded-full text-xs bg-secondary/70 text-foreground border border-border/50"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Expected Outcomes */}
            {day.expected_outcomes && day.expected_outcomes.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  Expected Outcomes
                </h4>
                <ul className="space-y-2">
                  {day.expected_outcomes.map((outcome, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pro Tips */}
            {day.pro_tips && day.pro_tips.length > 0 && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Pro Tips
                </h4>
                <ul className="space-y-2">
                  {day.pro_tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary">💡</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Checklist for current day */}
            {status === 'current' && day.checklist && day.checklist.length > 0 && forgeMode === 'DURING_FORGE' && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Today's Tasks
                </h4>
                <ul className="space-y-2">
                  {day.checklist.map((task, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-4 h-4 rounded border border-border flex-shrink-0" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DayDetailModal;