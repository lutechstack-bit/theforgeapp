import React, { useState } from 'react';
import { Settings2, X, RotateCcw, Play, Calendar, Zap } from 'lucide-react';
import { useAdminTesting } from '@/contexts/AdminTestingContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const AdminTestingPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    isTestingMode,
    simulatedForgeMode,
    simulatedDayNumber,
    setSimulatedForgeMode,
    setSimulatedDayNumber,
    applyPreset,
    resetToRealTime,
  } = useAdminTesting();

  const forgeModes = [
    { key: 'PRE_FORGE' as const, label: 'Pre-Forge', icon: Calendar },
    { key: 'DURING_FORGE' as const, label: 'During', icon: Play },
    { key: 'POST_FORGE' as const, label: 'Post-Forge', icon: Zap },
  ];

  const presets = [
    { key: 'pre' as const, label: 'Pre-Forge' },
    { key: 'online-1' as const, label: 'Online Day 1' },
    { key: 'online-3' as const, label: 'Online Day 3' },
    { key: 'physical-5' as const, label: 'Physical Day 5' },
    { key: 'physical-10' as const, label: 'Physical Day 10' },
    { key: 'last-day' as const, label: 'Last Day' },
    { key: 'post' as const, label: 'Post-Forge' },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-24 right-4 z-50 p-3 rounded-full shadow-lg transition-all",
          "bg-primary text-primary-foreground hover:scale-105",
          isTestingMode && "ring-2 ring-green-500 ring-offset-2 ring-offset-background animate-pulse"
        )}
        title="Admin Testing Mode"
      >
        <Settings2 className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Admin Testing</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-muted rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Forge Mode Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Forge Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            {forgeModes.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSimulatedForgeMode(key)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium transition-all",
                  simulatedForgeMode === key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/30 border-border hover:bg-muted/50"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Day Number Slider */}
        {simulatedForgeMode === 'DURING_FORGE' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Current Day
              </label>
              <span className="text-sm font-bold text-primary">
                Day {simulatedDayNumber || 1} of 14
              </span>
            </div>
            <Slider
              value={[simulatedDayNumber || 1]}
              onValueChange={([value]) => setSimulatedDayNumber(value)}
              min={1}
              max={14}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Online (1-3)</span>
              <span>Physical (4-14)</span>
            </div>
          </div>
        )}

        {/* Quick Presets */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Quick Presets
          </label>
          <div className="flex flex-wrap gap-1.5">
            {presets.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className="px-2 py-1 text-xs rounded-md bg-muted/50 hover:bg-muted border border-border/50 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Testing Mode Indicator */}
        {isTestingMode && (
          <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-600 dark:text-green-400">
              Testing mode active — only you see simulated data
            </span>
          </div>
        )}

        {/* Reset Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={resetToRealTime}
          className="w-full gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to Real Time
        </Button>
      </div>
    </div>
  );
};

export default AdminTestingPanel;
