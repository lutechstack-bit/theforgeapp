import React, { useState } from 'react';
import { ArrowUp, GitBranch, Tag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FloatingInput } from '@/components/ui/floating-input';
import { FloatingTextarea } from '@/components/ui/floating-textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

type VersionType = 'major' | 'minor' | 'patch';

interface CreateDocVersionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    version: string;
    title: string;
    changelog: string;
    release_notes: string;
  }) => void;
  suggestVersion: (type: VersionType) => string;
  isLoading?: boolean;
}

export const CreateDocVersionModal: React.FC<CreateDocVersionModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  suggestVersion,
  isLoading,
}) => {
  const [versionType, setVersionType] = useState<VersionType>('minor');
  const [version, setVersion] = useState(suggestVersion('minor'));
  const [title, setTitle] = useState('');
  const [changelog, setChangelog] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');

  const handleVersionTypeChange = (type: VersionType) => {
    setVersionType(type);
    setVersion(suggestVersion(type));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      version,
      title,
      changelog,
      release_notes: releaseNotes,
    });
  };

  const versionTypes = [
    {
      value: 'patch' as const,
      label: 'Patch',
      description: 'Bug fixes, typos',
      example: '0.0.X',
    },
    {
      value: 'minor' as const,
      label: 'Minor',
      description: 'New features, sections',
      example: '0.X.0',
    },
    {
      value: 'major' as const,
      label: 'Major',
      description: 'Breaking changes, rewrites',
      example: 'X.0.0',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Create New Version
          </DialogTitle>
          <DialogDescription>
            Create a snapshot of the current documentation with version info and changelog.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Version Type Selection */}
          <div className="space-y-2">
            <Label>Version Type</Label>
            <RadioGroup
              value={versionType}
              onValueChange={(v) => handleVersionTypeChange(v as VersionType)}
              className="grid grid-cols-3 gap-2"
            >
              {versionTypes.map((type) => (
                <label
                  key={type.value}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-colors",
                    versionType === type.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value={type.value} className="sr-only" />
                  <span className="font-semibold text-sm">{type.label}</span>
                  <span className="text-xs text-muted-foreground">{type.example}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          <FloatingInput
            id="version"
            label="Version Number"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="font-mono"
            required
          />

          <FloatingInput
            id="title"
            label="Version Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <FloatingTextarea
            id="changelog"
            label="Changelog (Markdown supported)"
            value={changelog}
            onChange={(e) => setChangelog(e.target.value)}
            rows={4}
          />

          <FloatingInput
            id="release-notes"
            label="Release Notes (Brief summary)"
            value={releaseNotes}
            onChange={(e) => setReleaseNotes(e.target.value)}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                'Creating...'
              ) : (
                <>
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Create v{version}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
