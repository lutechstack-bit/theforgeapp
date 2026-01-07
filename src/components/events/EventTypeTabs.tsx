import React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import * as LucideIcons from 'lucide-react';

interface EventType {
  id: string;
  name: string;
  icon: string;
}

interface EventTypeTabsProps {
  eventTypes: EventType[];
  selectedTypeId: string | null;
  onSelectType: (typeId: string | null) => void;
  className?: string;
}

export const EventTypeTabs: React.FC<EventTypeTabsProps> = ({
  eventTypes,
  selectedTypeId,
  onSelectType,
  className,
}) => {
  const getIcon = (iconName: string) => {
    const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
    const Icon = icons[iconName];
    return Icon ? <Icon className="h-4 w-4" /> : <LucideIcons.Calendar className="h-4 w-4" />;
  };

  return (
    <ScrollArea className={cn("w-full", className)}>
      <div className="flex gap-2 pb-2">
        <button
          onClick={() => onSelectType(null)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
            selectedTypeId === null
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              : "bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50"
          )}
        >
          <LucideIcons.LayoutGrid className="h-4 w-4" />
          All Events
        </button>
        
        {eventTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelectType(type.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
              selectedTypeId === type.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50"
            )}
          >
            {getIcon(type.icon)}
            {type.name}
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
