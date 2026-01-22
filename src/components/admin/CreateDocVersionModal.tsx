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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

          {/* Version Number */}
          <div className="space-y-2">
            <Label htmlFor="version">Version Number</Label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0.0"
                className="pl-9 font-mono"
                required
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Version Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Initial Release, Bug Fixes, New Features"
              required
            />
          </div>

          {/* Changelog */}
          <div className="space-y-2">
            <Label htmlFor="changelog">Changelog (Markdown supported)</Label>
            <Textarea
              id="changelog"
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              placeholder="- Added new feature X&#10;- Fixed bug in Y&#10;- Updated documentation for Z"
              rows={4}
            />
          </div>

          {/* Release Notes */}
          <div className="space-y-2">
            <Label htmlFor="release-notes">Release Notes (Brief summary)</Label>
            <Input
              id="release-notes"
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              placeholder="Brief summary of this release..."
            />
          </div>

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
