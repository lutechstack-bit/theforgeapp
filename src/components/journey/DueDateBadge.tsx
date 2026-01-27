import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { differenceInDays } from 'date-fns';

interface DueDateBadgeProps {
  dueDaysOffset: number | null;
  forgeStartDate: string | null;
  isCompleted?: boolean;
  compact?: boolean;
  className?: string;
}

export const DueDateBadge: React.FC<DueDateBadgeProps> = ({
  dueDaysOffset,
  forgeStartDate,
  isCompleted = false,
  compact = false,
  className,
}) => {
  // If no due date or task is completed, don't show badge
  if (dueDaysOffset === null || !forgeStartDate || isCompleted) {
    return null;
  }

  // Calculate actual due date: forge_start_date - dueDaysOffset
  const forgeStart = new Date(forgeStartDate);
  const dueDate = new Date(forgeStart);
  dueDate.setDate(dueDate.getDate() - dueDaysOffset);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const daysUntilDue = differenceInDays(dueDate, today);

  // Determine urgency level and styling
  let urgencyClass = '';
  let Icon = Clock;
  let label = '';

  if (daysUntilDue < 0) {
    // Overdue
    urgencyClass = 'bg-red-100 text-red-700 border-red-200';
    Icon = AlertCircle;
    label = compact ? `${Math.abs(daysUntilDue)}d late` : `${Math.abs(daysUntilDue)} days overdue`;
  } else if (daysUntilDue === 0) {
    // Due today
    urgencyClass = 'bg-red-100 text-red-700 border-red-200';
    Icon = AlertCircle;
    label = compact ? 'Today!' : 'Due today!';
  } else if (daysUntilDue === 1) {
    // Due tomorrow
    urgencyClass = 'bg-orange-100 text-orange-700 border-orange-200';
    Icon = AlertTriangle;
    label = compact ? 'Tomorrow' : 'Due tomorrow';
  } else if (daysUntilDue <= 3) {
    // 2-3 days
    urgencyClass = 'bg-orange-100 text-orange-700 border-orange-200';
    Icon = AlertTriangle;
    label = compact ? `${daysUntilDue}d` : `Due in ${daysUntilDue} days`;
  } else if (daysUntilDue <= 7) {
    // 4-7 days
    urgencyClass = 'bg-amber-100 text-amber-700 border-amber-200';
    Icon = Clock;
    label = compact ? `${daysUntilDue}d` : `Due in ${daysUntilDue} days`;
  } else {
    // 7+ days
    urgencyClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
    Icon = CheckCircle;
    label = compact ? `${daysUntilDue}d` : `Due in ${daysUntilDue} days`;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border shrink-0',
        urgencyClass,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </span>
  );
};
