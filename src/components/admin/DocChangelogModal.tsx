import React from 'react';
import { format } from 'date-fns';
import { FileText, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DocVersion } from '@/hooks/useDocVersions';

interface DocChangelogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versions: DocVersion[];
}

export const DocChangelogModal: React.FC<DocChangelogModalProps> = ({
  open,
  onOpenChange,
  versions,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Changelog History
          </DialogTitle>
          <DialogDescription>
            Complete history of documentation changes across all versions.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {versions.map((version, index) => (
              <div key={version.id}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-lg font-bold">
                        v{version.version}
                      </span>
                      {version.is_current && (
                        <Badge variant="default">Current</Badge>
                      )}
                    </div>
                    <h4 className="font-medium">{version.title}</h4>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{format(new Date(version.created_at), 'MMMM d, yyyy')}</p>
                    {version.creator_name && (
                      <p className="flex items-center justify-end gap-1 mt-1">
                        <User className="w-3 h-3" />
                        {version.creator_name}
                      </p>
                    )}
                  </div>
                </div>

                {version.release_notes && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {version.release_notes}
                  </p>
                )}

                {version.changelog ? (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {version.changelog.split('\n').map((line, i) => {
                        if (line.startsWith('- ')) {
                          return (
                            <p key={i} className="flex items-start gap-2 mb-1">
                              <span className="text-primary">•</span>
                              <span>{line.slice(2)}</span>
                            </p>
                          );
                        }
                        if (line.startsWith('### ')) {
                          return (
                            <h5 key={i} className="font-semibold mt-3 mb-1">
                              {line.slice(4)}
                            </h5>
                          );
                        }
                        if (line.startsWith('## ')) {
                          return (
                            <h4 key={i} className="font-bold mt-4 mb-2">
                              {line.slice(3)}
                            </h4>
                          );
                        }
                        if (line.trim()) {
                          return <p key={i} className="mb-1">{line}</p>;
                        }
                        return null;
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No changelog provided for this version.
                  </p>
                )}

                {index < versions.length - 1 && (
                  <Separator className="mt-6" />
                )}
              </div>
            ))}

            {versions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No versions created yet.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
