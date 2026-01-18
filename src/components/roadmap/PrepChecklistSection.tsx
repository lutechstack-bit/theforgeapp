import React from 'react';
import { 
  CheckCircle2, Circle, FileText, Wrench, Brain, Package,
  Clock, AlertCircle, BookOpen, Video
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { differenceInDays } from 'date-fns';

interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  description?: string | null;
  due_days_before?: number | null;
  is_required: boolean;
}

interface PrepChecklistSectionProps {
  items: ChecklistItem[];
  completedIds: Set<string>;
  onToggle: (itemId: string, completed: boolean) => void;
  forgeStartDate?: Date | null;
}

const categoryConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  script_prep: { 
    label: 'Script Preparation', 
    icon: <FileText className="w-5 h-5" />,
    color: 'text-primary'
  },
  writing_prep: { 
    label: 'Writing Preparation', 
    icon: <BookOpen className="w-5 h-5" />,
    color: 'text-primary'
  },
  content_prep: { 
    label: 'Content Preparation', 
    icon: <Video className="w-5 h-5" />,
    color: 'text-primary'
  },
  technical: { 
    label: 'Technical Setup', 
    icon: <Wrench className="w-5 h-5" />,
    color: 'text-accent'
  },
  mindset: { 
    label: 'Mindset & Wellness', 
    icon: <Brain className="w-5 h-5" />,
    color: 'text-green-500'
  },
  packing: { 
    label: 'Packing Essentials', 
    icon: <Package className="w-5 h-5" />,
    color: 'text-blue-500'
  },
};

const PrepChecklistSection: React.FC<PrepChecklistSectionProps> = ({
  items,
  completedIds,
  onToggle,
  forgeStartDate
}) => {
  if (!items || items.length === 0) {
    return (
      <section className="py-8">
        <div className="text-center glass-card rounded-xl py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No prep checklist items yet</p>
        </div>
      </section>
    );
  }

  // Group by category
  const groupedItems = items.reduce((acc, item) => {
    const cat = item.category || 'packing';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  // Calculate overall progress
  const totalItems = items.length;
  const completedCount = items.filter(item => completedIds.has(item.id)).length;
  const progressPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  const getDueStatus = (item: ChecklistItem) => {
    if (!forgeStartDate || item.due_days_before === null || item.due_days_before === undefined) {
      return null;
    }
    const daysUntilForge = differenceInDays(forgeStartDate, new Date());
    const dueInDays = daysUntilForge - item.due_days_before;
    
    if (dueInDays < 0) return { label: 'Overdue', urgent: true };
    if (dueInDays === 0) return { label: 'Due today', urgent: true };
    if (dueInDays <= 3) return { label: `Due in ${dueInDays}d`, urgent: false };
    return null;
  };

  return (
    <section className="py-8">
      {/* Header with progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">Prep Checklist</h2>
            <p className="text-sm text-muted-foreground">Get ready for your Forge experience</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold gradient-text">{progressPercent}%</p>
            <p className="text-xs text-muted-foreground">{completedCount}/{totalItems} done</p>
          </div>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Category sections */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, categoryItems]) => {
          const config = categoryConfig[category] || categoryConfig.packing;
          const categoryCompleted = categoryItems.filter(item => completedIds.has(item.id)).length;
          
          return (
            <Card key={category} className="glass-card overflow-hidden">
              {/* Category Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/30 bg-secondary/30">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-secondary ${config.color}`}>
                    {config.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{config.label}</h3>
                    <p className="text-xs text-muted-foreground">
                      {categoryCompleted}/{categoryItems.length} completed
                    </p>
                  </div>
                </div>
                <Progress 
                  value={categoryItems.length > 0 ? (categoryCompleted / categoryItems.length) * 100 : 0} 
                  className="w-20 h-1.5"
                />
              </div>

              {/* Items */}
              <div className="divide-y divide-border/20">
                {categoryItems.map((item) => {
                  const isCompleted = completedIds.has(item.id);
                  const dueStatus = getDueStatus(item);

                  return (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-secondary/30 transition-colors ${
                        isCompleted ? 'opacity-60' : ''
                      }`}
                      onClick={() => onToggle(item.id, !isCompleted)}
                    >
                      {/* Checkbox */}
                      <button className="mt-0.5 flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-medium ${
                            isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                          }`}>
                            {item.title}
                          </span>
                          {item.is_required && !isCompleted && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium">
                              Required
                            </span>
                          )}
                          {dueStatus && !isCompleted && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${
                              dueStatus.urgent 
                                ? 'bg-destructive/10 text-destructive' 
                                : 'bg-primary/10 text-primary'
                            }`}>
                              {dueStatus.urgent ? <AlertCircle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                              {dueStatus.label}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default PrepChecklistSection;
