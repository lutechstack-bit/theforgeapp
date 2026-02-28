import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Sparkles, Bug, Wrench, Zap, Check, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { EmptyState } from '@/components/shared/EmptyState';

const categoryIcons: Record<string, React.ReactNode> = {
  Feature: <Sparkles className="h-4 w-4" />,
  'Bug Fix': <Bug className="h-4 w-4" />,
  Improvement: <Zap className="h-4 w-4" />,
  Maintenance: <Wrench className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
  Feature: 'bg-primary/10 text-primary',
  'Bug Fix': 'bg-red-500/10 text-red-400',
  Improvement: 'bg-blue-500/10 text-blue-400',
  Maintenance: 'bg-muted text-muted-foreground',
};

const statusColors: Record<string, string> = {
  Completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  'In Progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Planned: 'bg-muted text-muted-foreground border-border',
};

const Updates: React.FC = () => {
  const [filter, setFilter] = useState('all');

  const { data: changelog = [], isLoading } = useQuery({
    queryKey: ['app_changelog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_changelog')
        .select('*')
        .order('date_added', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const filtered = changelog.filter(
    (entry) => filter === 'all' || entry.category === filter
  );

  // Group by version
  const grouped = filtered.reduce((acc: Record<string, typeof filtered>, entry) => {
    const key = entry.version;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  return (
    <div className="page-container max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-2">Updates</h1>
          <p className="text-muted-foreground text-sm">
            What's new and improved in the app
          </p>
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="space-y-4">
        <TabsList className="w-full bg-secondary/50 flex-wrap h-auto p-1">
          <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
          <TabsTrigger value="Feature" className="flex-1">Features</TabsTrigger>
          <TabsTrigger value="Bug Fix" className="flex-1">Bug Fixes</TabsTrigger>
          <TabsTrigger value="Improvement" className="flex-1">Improvements</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No updates yet"
            description="New updates will appear here as features are shipped."
          />
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([version, entries]) => (
              <div key={version}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-bold text-foreground bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                    v{version}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(entries[0].date_added), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="space-y-2 pl-2 border-l-2 border-border/50 ml-3">
                  {entries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="p-4 rounded-xl border border-border/50 bg-card hover:border-border transition-all animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${categoryColors[entry.category] || categoryColors.Maintenance}`}>
                          {categoryIcons[entry.category] || <Wrench className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-medium text-foreground">{entry.title}</h3>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${statusColors[entry.status] || statusColors.Planned}`}>
                              {entry.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {entry.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default Updates;
