import React from 'react';
import { format } from 'date-fns';
import { Check, Clock, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DocVersion } from '@/hooks/useDocVersions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DocVersionHistoryProps {
  versions: DocVersion[];
  selectedVersionId: string | null;
  onSelectVersion: (version: DocVersion) => void;
  onSetCurrent: (versionId: string) => void;
  onDelete: (versionId: string) => void;
  onCreateNew: () => void;
}

export const DocVersionHistory: React.FC<DocVersionHistoryProps> = ({
  versions,
  selectedVersionId,
  onSelectVersion,
  onSetCurrent,
  onDelete,
  onCreateNew,
}) => {
  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm mb-2">Version History</h3>
        <Button onClick={onCreateNew} size="sm" className="w-full">
          + New Version
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {versions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No versions yet. Create your first version.
            </p>
          ) : (
            versions.map((version) => (
              <div
                key={version.id}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-colors group relative",
                  selectedVersionId === version.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted"
                )}
                onClick={() => onSelectVersion(version)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-sm font-semibold">
                    v{version.version}
                  </span>
                  {version.is_current && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Current
                    </Badge>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground truncate mb-1">
                  {version.title}
                </p>
                
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  {format(new Date(version.created_at), 'MMM d, yyyy')}
                </div>
                
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  {!version.is_current && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetCurrent(version.id);
                        }}
                        title="Set as current"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-destructive"
                            onClick={(e) => e.stopPropagation()}
                            title="Delete version"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Version?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete v{version.version}. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(version.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
