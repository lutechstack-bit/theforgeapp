import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Map, FileText, Package, Film, Image, BookOpen, CheckSquare
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
    { id: 'tasks', path: '/roadmap/tasks', label: 'Tasks', icon: CheckSquare },
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
    <div className="-mx-3 sm:-mx-4 px-3 sm:px-4 py-2.5 sm:py-3 mb-4 sm:mb-6">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {sections.map((section) => {
          const Icon = section.icon;
          const active = isActive(section.path);
          
          return (
            <button
              key={section.id}
              onClick={() => navigate(section.path)}
              className={cn(
                "flex-shrink-0 flex items-center justify-center gap-1.5",
                "px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-sm font-medium",
                "border transition-all duration-200",
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-transparent text-muted-foreground border-border/50 hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {section.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsBar;
