import React from 'react';
import { MERGE_TAGS, MergeTagDescriptor } from '@/lib/mergeTags';
import { Badge } from '@/components/ui/badge';

interface Props {
  onInsert: (tag: string) => void;
  /** Tags currently used in the template — highlighted in the chip row. */
  usedTags?: string[];
}

const CATEGORY_ORDER: MergeTagDescriptor['category'][] = ['user', 'edition', 'app', 'custom'];
const CATEGORY_LABEL: Record<MergeTagDescriptor['category'], string> = {
  user: 'User',
  edition: 'Edition',
  app: 'App',
  custom: 'Send-time',
};

export const MergeTagHelper: React.FC<Props> = ({ onInsert, usedTags = [] }) => {
  const usedSet = new Set(usedTags);

  return (
    <div className="rounded-lg border border-border/40 bg-card/40 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-foreground">Merge tags</p>
        <p className="text-[10px] text-muted-foreground">
          Click to insert. Use at send time via variables.
        </p>
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const tags = MERGE_TAGS.filter((t) => t.category === cat);
        if (tags.length === 0) return null;
        return (
          <div key={cat} className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
              {CATEGORY_LABEL[cat]}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => {
                const used = usedSet.has(t.key);
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => onInsert(`{{${t.key}}}`)}
                    title={`Example: ${t.example}`}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-mono transition-colors
                      ${used
                        ? 'bg-primary/20 text-primary border border-primary/40'
                        : 'bg-muted/40 text-muted-foreground hover:bg-muted border border-border/40'}`}
                  >
                    {`{{${t.key}}}`}
                    {used && <Badge variant="outline" className="ml-1 h-4 px-1 py-0 text-[9px] border-primary/40 text-primary">in use</Badge>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MergeTagHelper;
