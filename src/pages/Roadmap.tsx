import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Lock, MapPin, Clock, Calendar, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface RoadmapDay {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  date?: Date;
  location?: string;
  callTime?: string;
  checklist?: string[];
  status: 'completed' | 'current' | 'upcoming' | 'locked';
}

const roadmapDays: RoadmapDay[] = [
  {
    id: '1',
    dayNumber: 0,
    title: 'Pre-Forge Preparation',
    description: 'Complete your profile, join the community, and get ready for the experience',
    status: 'current',
    checklist: ['Complete KYF form', 'Join community chat', 'Review welcome materials'],
  },
  {
    id: '2',
    dayNumber: 1,
    title: 'Day 1: Orientation & Foundations',
    description: 'Meet your cohort, understand the journey ahead, and set your intentions',
    date: new Date('2025-02-15'),
    location: 'Mumbai Hub',
    callTime: '8:00 AM',
    status: 'upcoming',
  },
  {
    id: '3',
    dayNumber: 2,
    title: 'Day 2: Creative Deep Dive',
    description: 'Explore your creative identity and start developing your unique voice',
    date: new Date('2025-02-16'),
    location: 'Mumbai Hub',
    callTime: '8:30 AM',
    status: 'upcoming',
  },
  {
    id: '4',
    dayNumber: 3,
    title: 'Day 3: Mentorship Sessions',
    description: 'One-on-one and group sessions with industry mentors',
    date: new Date('2025-02-17'),
    location: 'Mumbai Hub',
    callTime: '9:00 AM',
    status: 'upcoming',
  },
  {
    id: '5',
    dayNumber: 4,
    title: 'Day 4: Project Kickoff',
    description: 'Begin work on your Forge project with guidance from mentors',
    date: new Date('2025-02-18'),
    location: 'Mumbai Hub',
    callTime: '8:30 AM',
    status: 'upcoming',
  },
  {
    id: '6',
    dayNumber: 5,
    title: 'Day 5: Showcase & Celebration',
    description: 'Present your work, celebrate achievements, and launch into the alumni network',
    date: new Date('2025-02-19'),
    location: 'Mumbai Hub',
    callTime: '10:00 AM',
    status: 'upcoming',
  },
];

const Roadmap: React.FC = () => {
  const { isDuringForge, profile } = useAuth();

  const getStatusIcon = (status: RoadmapDay['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-6 w-6 text-primary" />;
      case 'current':
        return (
          <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center shadow-glow animate-pulse-soft">
            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
          </div>
        );
      case 'upcoming':
        return <Circle className="h-6 w-6 text-muted-foreground" />;
      case 'locked':
        return <Lock className="h-6 w-6 text-muted-foreground" />;
    }
  };

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Your Forge Roadmap</h1>
        <p className="text-muted-foreground">
          {isDuringForge 
            ? 'Your daily guide through the Forge experience'
            : 'Preview your journey to Forge and beyond'}
        </p>
      </div>

      {/* Progress Overview */}
      <div className="mb-8 p-5 rounded-xl bg-card border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">Your Progress</span>
          <span className="text-sm font-medium text-primary">1 of {roadmapDays.length}</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div 
            className="h-full gradient-primary transition-all duration-500"
            style={{ width: `${(1 / roadmapDays.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Line */}
        <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-4">
          {roadmapDays.map((day, index) => (
            <div
              key={day.id}
              className="relative pl-12 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Status Icon */}
              <div className="absolute left-0 top-1 bg-background p-0.5">
                {getStatusIcon(day.status)}
              </div>

              {/* Card */}
              <div className={`p-4 rounded-xl border transition-all ${
                day.status === 'current'
                  ? 'bg-gradient-to-br from-card to-primary/5 border-primary/30 shadow-glow'
                  : day.status === 'completed'
                  ? 'bg-card border-primary/20'
                  : 'bg-card border-border/50 hover:border-border'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {day.dayNumber > 0 && (
                        <span className="text-xs font-medium text-primary">
                          Day {day.dayNumber}
                        </span>
                      )}
                      {day.status === 'current' && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                          Current
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{day.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{day.description}</p>

                    {/* Operational Details (only shown during Forge) */}
                    {isDuringForge && day.date && (
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(day.date, 'MMM d, yyyy')}
                        </span>
                        {day.callTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {day.callTime}
                          </span>
                        )}
                        {day.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {day.location}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Preview Mode - Show basic date */}
                    {!isDuringForge && day.date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Calendar className="h-4 w-4" />
                        {format(day.date, 'MMMM d, yyyy')}
                      </div>
                    )}

                    {/* Checklist (shown during Forge or for current) */}
                    {day.checklist && (day.status === 'current' || isDuringForge) && (
                      <div className="space-y-2">
                        {day.checklist.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded border border-border flex items-center justify-center">
                              {i === 0 && <CheckCircle2 className="h-3 w-3 text-primary" />}
                            </div>
                            <span className={`text-sm ${i === 0 ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {day.status !== 'locked' && (
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note for Pre-Forge */}
      {!isDuringForge && (
        <div className="mt-8 p-4 rounded-xl bg-secondary/50 border border-border/50">
          <p className="text-sm text-muted-foreground text-center">
            Detailed schedules, locations, and checklists will become available once Forge begins.
          </p>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
