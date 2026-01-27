import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Map, CheckCircle, Bell, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FloatingActionButtonProps {
  onMarkAsReviewed?: () => void;
  currentStageName?: string;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onMarkAsReviewed,
  currentStageName,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleSetReminder = async () => {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      toast.error('Notifications are not supported in your browser');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast.success('Reminder notifications enabled!');
    } else if (permission === 'denied') {
      toast.error('Notification permission denied');
    }
    setIsExpanded(false);
  };

  const handleMarkAsReviewed = () => {
    onMarkAsReviewed?.();
    toast.success(`${currentStageName || 'Stage'} marked as reviewed`);
    setIsExpanded(false);
  };

  const handleGoToRoadmap = () => {
    navigate('/roadmap');
    setIsExpanded(false);
  };

  const actions = [
    {
      icon: Bell,
      label: 'Set Reminder',
      onClick: handleSetReminder,
    },
    {
      icon: CheckCircle,
      label: 'Mark Reviewed',
      onClick: handleMarkAsReviewed,
    },
    {
      icon: Map,
      label: 'Roadmap',
      onClick: handleGoToRoadmap,
    },
  ];

  return (
    <div className={cn('fixed bottom-24 right-4 z-40 md:bottom-8 md:right-8', className)}>
      {/* Action buttons */}
      <div
        className={cn(
          'flex flex-col items-end gap-2 mb-3 transition-all duration-300',
          isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        {actions.map((action, index) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-full',
              'bg-card border border-border shadow-lg',
              'text-sm font-medium text-foreground',
              'hover:bg-muted transition-all duration-200',
              'animate-in fade-in-0 slide-in-from-right-2',
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span>{action.label}</span>
            <action.icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center',
          'bg-primary text-primary-foreground shadow-lg',
          'hover:shadow-xl hover:scale-105 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          isExpanded && 'rotate-45'
        )}
      >
        {isExpanded ? (
          <X className="w-6 h-6" />
        ) : (
          <Plus className="w-6 h-6" />
        )}
      </button>

      {/* Backdrop when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};
