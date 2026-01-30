import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Map, FileText, Package, Film, Image, BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <div className={cn(
        "flex items-center justify-between gap-2",
        "sm:justify-start sm:gap-2"
      )}>
        {sections.map((section) => {
          const Icon = section.icon;
          const active = isActive(section.path);
          
          return (
            <button
              key={section.id}
              onClick={() => navigate(section.path)}
              className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-1.5",
                "px-3 py-2.5 rounded-full text-xs sm:text-sm font-medium",
                "border transition-all duration-200",
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-transparent text-foreground border-border hover:bg-secondary/50"
              )}
            >
              <Icon className="hidden sm:block h-4 w-4" />
              {section.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsBar;
