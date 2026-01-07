import React from 'react';
import { 
  Map, FileText, Package, Film, Image, BookOpen, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionsBarProps {
  activeSection: string;
  onSectionClick: (section: string) => void;
  hasGallery?: boolean;
  hasFilms?: boolean;
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  activeSection,
  onSectionClick,
  hasGallery = false,
  hasFilms = false
}) => {
  const sections = [
    { id: 'journey', label: 'Journey', icon: Map },
    { id: 'prep', label: 'Prep', icon: FileText },
    { id: 'rules', label: 'Rules', icon: BookOpen },
    ...(hasGallery ? [{ id: 'gallery', label: 'Gallery', icon: Image }] : []),
    ...(hasFilms ? [{ id: 'films', label: 'Films', icon: Film }] : []),
  ];

  const scrollToSection = (sectionId: string) => {
    onSectionClick(sectionId);
    const element = document.getElementById(`roadmap-${sectionId}`);
    if (element) {
      const offset = 80; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="sticky top-16 z-30 -mx-4 px-4 py-3 mb-6 glass-nav">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <Button
              key={section.id}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => scrollToSection(section.id)}
              className={`flex-shrink-0 gap-2 ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {section.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsBar;
