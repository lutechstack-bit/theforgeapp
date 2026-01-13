import React, { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface AboutSectionProps {
  bio: string | null;
  isOwner?: boolean;
  onSave?: (bio: string) => Promise<void>;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  bio,
  isOwner = false,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState(bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    await onSave(editedBio);
    setSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedBio(bio || '');
    setIsEditing(false);
  };

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">About</h2>
        {isOwner && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-primary-foreground"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <Textarea
          value={editedBio}
          onChange={(e) => setEditedBio(e.target.value)}
          placeholder="Tell the community about your creative journey..."
          className="bg-secondary/50 min-h-[120px] resize-none"
        />
      ) : bio ? (
        <p className="text-muted-foreground whitespace-pre-wrap">{bio}</p>
      ) : (
        <p className="text-muted-foreground/60 italic">
          Tell the community about your creative journey...
        </p>
      )}
    </div>
  );
};
