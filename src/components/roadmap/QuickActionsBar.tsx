import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Map, FileText, Package, Film, Image, BookOpen, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionsBarProps {
  hasGallery?: boolean;
  hasFilms?: boolean;
  hasEquipment?: boolean;
  mobileHighlightsButton?: React.ReactNode;
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  hasGallery = false,
  hasFilms = false,
  hasEquipment = false,
  mobileHighlightsButton
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
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pr-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const active = isActive(section.path);
          
          return (
            <Button
              key={section.id}
              variant={active ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate(section.path)}
              className={`flex-shrink-0 gap-2 ${
                active 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {section.label}
            </Button>
          );
        })}
        
        {/* Mobile Highlights Button - Visible on mobile/tablet, positioned prominently */}
        {mobileHighlightsButton && (
          <div className="lg:hidden flex-shrink-0 ml-2 pl-2 border-l border-border">
            {mobileHighlightsButton}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickActionsBar;
