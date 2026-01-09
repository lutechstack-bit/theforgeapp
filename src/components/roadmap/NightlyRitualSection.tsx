import React from 'react';
import { useNightlyRitual } from '@/hooks/useNightlyRitual';
import { useAuth } from '@/contexts/AuthContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Moon, 
  BookOpen, 
  Sunrise, 
  Heart,
  Flame,
  Sparkles,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface NightlyRitualSectionProps {
  currentDayNumber: number;
}

const categoryConfig = {
  reflect: {
    label: 'Reflect',
    icon: BookOpen,
    gradient: 'from-amber-500/20 to-yellow-500/10',
    borderColor: 'border-amber-500/30',
    iconColor: 'text-amber-400',
    checkColor: 'data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500',
  },
  prepare: {
    label: 'Prepare for Tomorrow',
    icon: Sunrise,
    gradient: 'from-orange-500/20 to-amber-500/10',
    borderColor: 'border-orange-500/30',
    iconColor: 'text-orange-400',
    checkColor: 'data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500',
  },
  wellness: {
    label: 'Wellness',
    icon: Heart,
    gradient: 'from-emerald-500/20 to-green-500/10',
    borderColor: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
    checkColor: 'data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500',
  },
};

const NightlyRitualSection: React.FC<NightlyRitualSectionProps> = ({ currentDayNumber }) => {
  const { edition, forgeMode } = useAuth();
  const { 
    groupedItems, 
    completedIds, 
    progress, 
    streak, 
    isLoading, 
    toggleItem,
    isToggling 
  } = useNightlyRitual(currentDayNumber);

  // Only show during forge mode
  if (!forgeMode || forgeMode === 'PRE_FORGE' || forgeMode === 'POST_FORGE') {
    return null;
  }

  // Don't render if no items
  const hasItems = Object.values(groupedItems).some(items => items.length > 0);
  if (!hasItems && !isLoading) {
    return null;
  }

  // Get dynamic icon component
  const getIconComponent = (iconName: string | null): React.ComponentType<{ className?: string }> => {
    if (!iconName) return Moon;
    const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
    const IconComponent = icons[iconName];
    return IconComponent || Moon;
  };

  const allCompleted = progress.percent === 100;

  return (
    <section className="mb-8">
      {/* Premium Header with gradient background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800/50">
        {/* Subtle star pattern overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-4 left-8 w-1 h-1 bg-white rounded-full animate-pulse" />
          <div className="absolute top-12 right-16 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-300" />
          <div className="absolute top-8 right-32 w-1 h-1 bg-amber-300 rounded-full animate-pulse delay-500" />
          <div className="absolute bottom-16 left-24 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-700" />
          <div className="absolute bottom-8 right-8 w-1 h-1 bg-white rounded-full animate-pulse delay-1000" />
        </div>

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/20">
                <Moon className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Tonight's Ritual
                </h2>
                <p className="text-sm text-slate-400">
                  Wind down and prepare for Day {currentDayNumber + 1}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-slate-400">Day {currentDayNumber}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6 p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-300">
                {allCompleted ? (
                  <span className="flex items-center gap-2 text-amber-400">
                    <CheckCircle2 className="w-4 h-4" />
                    All done for tonight!
                  </span>
                ) : (
                  `${progress.completed}/${progress.total} completed`
                )}
              </span>
              <span className="text-sm font-bold text-amber-400">{progress.percent}%</span>
            </div>
            <Progress 
              value={progress.percent} 
              className="h-2 bg-slate-800"
            />
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
          ) : (
            <>
              {/* Category Groups */}
              <div className="space-y-4">
                {(['reflect', 'prepare', 'wellness'] as const).map(category => {
                  const items = groupedItems[category];
                  if (!items || items.length === 0) return null;

                  const config = categoryConfig[category];
                  const CategoryIcon = config.icon;

                  return (
                    <div 
                      key={category}
                      className={cn(
                        "rounded-xl border p-4 bg-gradient-to-r",
                        config.gradient,
                        config.borderColor
                      )}
                    >
                      {/* Category Header */}
                      <div className="flex items-center gap-2 mb-3">
                        <CategoryIcon className={cn("w-4 h-4", config.iconColor)} />
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                          {config.label}
                        </h3>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {items.map(item => {
                          const isCompleted = completedIds.has(item.id);
                          const ItemIcon = getIconComponent(item.icon);

                          return (
                            <label
                              key={item.id}
                              className={cn(
                                "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200",
                                "hover:bg-white/5",
                                isCompleted && "bg-white/5"
                              )}
                            >
                              <Checkbox
                                checked={isCompleted}
                                onCheckedChange={() => toggleItem(item.id)}
                                disabled={isToggling}
                                className={cn(
                                  "mt-0.5 border-slate-600 data-[state=checked]:text-white",
                                  config.checkColor
                                )}
                              />
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  "text-sm font-medium transition-all duration-200",
                                  isCompleted 
                                    ? "text-slate-400 line-through" 
                                    : "text-white"
                                )}>
                                  {item.title}
                                </p>
                                {item.description && (
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              <ItemIcon className={cn(
                                "w-4 h-4 flex-shrink-0 mt-0.5",
                                isCompleted ? "text-slate-600" : "text-slate-500"
                              )} />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Streak Badge */}
              {streak > 0 && (
                <div className="mt-6 flex items-center justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30">
                    <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                    <span className="text-sm font-semibold text-orange-300">
                      {streak}-Night Streak!
                    </span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
              )}

              {/* Celebration State */}
              {allCompleted && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-slate-400">
                    ✨ Sweet dreams! You're all set for tomorrow.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default NightlyRitualSection;
