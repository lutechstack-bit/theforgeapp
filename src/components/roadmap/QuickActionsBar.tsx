import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Map, FileText, Package, Film, Image, BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface QuickActionsBarProps {
  hasGallery?: boolean;
  hasFilms?: boolean;
  hasEquipment?: boolean;
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  hasGallery = false,
  hasFilms = false,
  hasEquipment = false
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const sections = [
    { id: 'journey', path: '/roadmap', label: 'Journey', icon: Map },
    { id: 'prep', path: '/roadmap/prep', label: 'Prep', icon: FileText },
    ...(hasEquipment ? [{ id: 'equipment', path: '/roadmap/equipment', label: 'Equipment', icon: Package }] : []),
    { id: 'rules', path: '/roadmap/rules', label: 'Rules', icon: BookOpen },
    ...(hasGallery ? [{ id: 'gallery', path: '/roadmap/gallery', label: 'Gallery', icon: Image }] : []),
    ...(hasFilms ? [{ id: 'films', path: '/roadmap/films', label: 'Films', icon: Film }] : []),
  ];

  const isActive = (path: string) => {
    if (path === '/roadmap') {
      return location.pathname === '/roadmap';
    }
    return location.pathname === path;
  };

  return (
    <div className="sticky top-16 z-30 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2.5 sm:py-3 mb-4 sm:mb-6 glass-nav">
      <ScrollArea className="w-full">
        <div className="flex items-center gap-2 pb-2">
          {sections.map((section) => {
            const Icon = section.icon;
            const active = isActive(section.path);
            
            return (
              <button
                key={section.id}
                onClick={() => navigate(section.path)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300",
                  active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="opacity-0" />
      </ScrollArea>
    </div>
  );
};

export default QuickActionsBar;
