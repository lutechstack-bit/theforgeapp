import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Gift, ChevronRight } from 'lucide-react';

const quickLinks = [
  { icon: BookOpen, label: 'Learn', path: '/learn', color: 'text-blue-500' },
  { icon: Calendar, label: 'Events', path: '/events', color: 'text-green-500' },
  { icon: Gift, label: 'Perks', path: '/perks', color: 'text-purple-500' },
];

export const QuickAccessBar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-2">
      {quickLinks.map((link) => (
        <button
          key={link.label}
          onClick={() => navigate(link.path)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 border border-border/30 hover:bg-secondary/80 transition-colors group"
        >
          <link.icon className={`w-4 h-4 ${link.color}`} />
          <span className="text-xs font-medium text-foreground">{link.label}</span>
          <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </button>
      ))}
    </div>
  );
};
