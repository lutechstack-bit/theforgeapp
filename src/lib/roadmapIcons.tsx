import React from 'react';
import {
  Plane, Users, Clapperboard, Camera, Film, Video,
  Scissors, Music, Mic, Projector, PartyPopper, Trophy,
  BookOpen, Pen, FileText, ScrollText, TreePine, Lightbulb,
  Palette, TrendingUp, Layers, Sparkles, Coffee, Utensils,
  Sun, Moon, Brain, Gamepad2, MessageCircle, Presentation,
  GraduationCap, Target, Heart, Star, Compass, Wrench,
  Headphones, Puzzle, Flame, Rocket, Crown, Medal
} from 'lucide-react';

export type CohortType = 'FORGE' | 'FORGE_CREATORS' | 'FORGE_WRITING';

interface IconConfig {
  icon: React.ReactNode;
  label: string;
}

// Icon mappings for FORGE (Filmmakers) cohort
const forgeIcons: Record<string, IconConfig> = {
  // Day-specific icons
  orientation: { icon: <Plane />, label: 'Arrival & Orientation' },
  meet_greet: { icon: <Users />, label: 'Meet & Greet' },
  preproduction: { icon: <Clapperboard />, label: 'Pre-production' },
  direction: { icon: <Clapperboard />, label: 'Film Direction' },
  cinematography: { icon: <Camera />, label: 'Cinematography' },
  production: { icon: <Video />, label: 'Production Day' },
  shoot: { icon: <Camera />, label: 'Shoot Day' },
  postproduction: { icon: <Scissors />, label: 'Post-production' },
  editing: { icon: <Film />, label: 'Film Editing' },
  sound: { icon: <Headphones />, label: 'Sound Design' },
  screening: { icon: <Projector />, label: 'Screening' },
  farewell: { icon: <PartyPopper />, label: 'Farewell' },
  // Activity-based icons
  workshop: { icon: <Wrench />, label: 'Workshop' },
  masterclass: { icon: <GraduationCap />, label: 'Masterclass' },
  mentorship: { icon: <MessageCircle />, label: 'Mentorship' },
  rehearsal: { icon: <Target />, label: 'Rehearsal' },
  review: { icon: <Lightbulb />, label: 'Review' },
  quiz: { icon: <Gamepad2 />, label: 'Quiz' },
  campfire: { icon: <Flame />, label: 'Campfire' },
  openmic: { icon: <Mic />, label: 'Open Mic' },
  networking: { icon: <Users />, label: 'Networking' },
  psychology: { icon: <Brain />, label: 'Psychology of Storytelling' },
};

// Icon mappings for CREATORS cohort
const creatorsIcons: Record<string, IconConfig> = {
  orientation: { icon: <Puzzle />, label: 'Creative Orientation' },
  meet_greet: { icon: <Heart />, label: 'Community Building' },
  strategy: { icon: <TrendingUp />, label: 'Content Strategy' },
  workshop: { icon: <Palette />, label: 'Creative Workshop' },
  production: { icon: <Camera />, label: 'Content Creation' },
  shoot: { icon: <Video />, label: 'Shoot Day' },
  editing: { icon: <Layers />, label: 'Edit & Polish' },
  postproduction: { icon: <Scissors />, label: 'Post-production' },
  screening: { icon: <Sparkles />, label: 'Showcase' },
  farewell: { icon: <PartyPopper />, label: 'Celebration' },
  masterclass: { icon: <Crown />, label: 'Creator Masterclass' },
  mentorship: { icon: <MessageCircle />, label: 'Creator Mentorship' },
  networking: { icon: <Users />, label: 'Creator Connect' },
  branding: { icon: <Target />, label: 'Personal Branding' },
};

// Icon mappings for WRITING cohort
const writingIcons: Record<string, IconConfig> = {
  orientation: { icon: <Pen />, label: 'Writers Welcome' },
  meet_greet: { icon: <BookOpen />, label: 'Story Circle' },
  workshop: { icon: <FileText />, label: 'Writing Workshop' },
  session: { icon: <ScrollText />, label: 'Writing Session' },
  mentorship: { icon: <MessageCircle />, label: 'Writer Mentorship' },
  nature: { icon: <TreePine />, label: 'Sacred Forest' },
  openmic: { icon: <Mic />, label: 'Open Mic' },
  reading: { icon: <BookOpen />, label: 'Reading Session' },
  feedback: { icon: <Lightbulb />, label: 'Feedback Circle' },
  farewell: { icon: <Medal />, label: 'Writers Graduation' },
  poetry: { icon: <Pen />, label: 'Poetry Session' },
  screenwriting: { icon: <FileText />, label: 'Screenwriting' },
  storytelling: { icon: <Brain />, label: 'Storytelling' },
  networking: { icon: <Users />, label: 'Writers Network' },
};

// Time-based activity icons (common across cohorts)
const timeBasedIcons: Record<string, IconConfig> = {
  arrival: { icon: <Plane />, label: 'Arrival' },
  breakfast: { icon: <Coffee />, label: 'Breakfast' },
  lunch: { icon: <Utensils />, label: 'Lunch' },
  dinner: { icon: <Utensils />, label: 'Dinner' },
  morning: { icon: <Sun />, label: 'Morning Activity' },
  evening: { icon: <Moon />, label: 'Evening Activity' },
  departure: { icon: <Rocket />, label: 'Departure' },
};

// Get the appropriate icon for a day based on cohort and activity
export function getDayIcon(
  cohortType: CohortType,
  activityType?: string | null,
  dayNumber?: number,
  size: 'sm' | 'md' | 'lg' = 'md'
): React.ReactNode {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';
  
  const iconMaps = {
    FORGE: forgeIcons,
    FORGE_CREATORS: creatorsIcons,
    FORGE_WRITING: writingIcons,
  };

  const cohortIcons = iconMaps[cohortType] || forgeIcons;
  const activity = activityType?.toLowerCase().replace(/[^a-z]/g, '') || '';
  
  // Check for matches in cohort-specific icons
  for (const [key, config] of Object.entries(cohortIcons)) {
    if (activity.includes(key) || key.includes(activity)) {
      return React.cloneElement(config.icon as React.ReactElement, { className: sizeClass });
    }
  }

  // Check for time-based activities
  for (const [key, config] of Object.entries(timeBasedIcons)) {
    if (activity.includes(key)) {
      return React.cloneElement(config.icon as React.ReactElement, { className: sizeClass });
    }
  }

  // Default icons based on day number for FORGE
  if (cohortType === 'FORGE' && dayNumber !== undefined) {
    const dayDefaults: Record<number, React.ReactNode> = {
      0: <Plane className={sizeClass} />,
      1: <Users className={sizeClass} />,
      2: <Clapperboard className={sizeClass} />,
      3: <Camera className={sizeClass} />,
      4: <Video className={sizeClass} />,
      5: <Video className={sizeClass} />,
      6: <Scissors className={sizeClass} />,
      7: <Film className={sizeClass} />,
      8: <Projector className={sizeClass} />,
    };
    return dayDefaults[dayNumber] || <Star className={sizeClass} />;
  }

  // Fallback icon
  return <Star className={sizeClass} />;
}

// Get schedule item icon for modal
export function getScheduleIcon(activity: string, size: 'sm' | 'md' = 'sm'): React.ReactNode {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const activityLower = activity.toLowerCase();

  // Common schedule activities
  const scheduleIcons: Record<string, React.ReactNode> = {
    arrival: <Plane className={sizeClass} />,
    orientation: <Compass className={sizeClass} />,
    breakfast: <Coffee className={sizeClass} />,
    lunch: <Utensils className={sizeClass} />,
    dinner: <Utensils className={sizeClass} />,
    workshop: <Wrench className={sizeClass} />,
    shoot: <Camera className={sizeClass} />,
    shooting: <Camera className={sizeClass} />,
    edit: <Scissors className={sizeClass} />,
    editing: <Scissors className={sizeClass} />,
    review: <Lightbulb className={sizeClass} />,
    feedback: <MessageCircle className={sizeClass} />,
    quiz: <Gamepad2 className={sizeClass} />,
    campfire: <Flame className={sizeClass} />,
    openmic: <Mic className={sizeClass} />,
    mic: <Mic className={sizeClass} />,
    screening: <Projector className={sizeClass} />,
    photo: <Camera className={sizeClass} />,
    networking: <Users className={sizeClass} />,
    departure: <Rocket className={sizeClass} />,
    psychology: <Brain className={sizeClass} />,
    storytelling: <Brain className={sizeClass} />,
    direction: <Clapperboard className={sizeClass} />,
    cinematography: <Camera className={sizeClass} />,
    improv: <Sparkles className={sizeClass} />,
    movement: <Sun className={sizeClass} />,
    rehearsal: <Target className={sizeClass} />,
    masterclass: <GraduationCap className={sizeClass} />,
    dubbing: <Mic className={sizeClass} />,
    sound: <Headphones className={sizeClass} />,
    rendering: <Film className={sizeClass} />,
    pitch: <Presentation className={sizeClass} />,
    intro: <Users className={sizeClass} />,
    icebreaker: <Heart className={sizeClass} />,
    game: <Gamepad2 className={sizeClass} />,
    preproduction: <Clapperboard className={sizeClass} />,
    postproduction: <Scissors className={sizeClass} />,
  };

  // Find matching icon
  for (const [key, icon] of Object.entries(scheduleIcons)) {
    if (activityLower.includes(key)) {
      return icon;
    }
  }

  return <Star className={sizeClass} />;
}