import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FloatingInput } from '@/components/ui/floating-input';
import { FloatingTextarea } from '@/components/ui/floating-textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserWork, CreateWorkInput } from '@/hooks/useUserWorks';

interface AddWorkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CreateWorkInput) => Promise<void>;
  editingWork?: UserWork | null;
}

const workTypes = [
  { value: 'short_film', label: 'Short Film' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'personal', label: 'Personal Project' },
  { value: 'showcase', label: 'Showcase' },
  { value: 'other', label: 'Other' },
];

const mediaTypes = [
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Image' },
  { value: 'pdf', label: 'PDF' },
  { value: 'link', label: 'External Link' },
];

export const AddWorkModal: React.FC<AddWorkModalProps> = ({
  open,
  onOpenChange,
  onSave,
  editingWork,
}) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreateWorkInput>({
    title: editingWork?.title || '',
    description: editingWork?.description || '',
    type: editingWork?.type || 'personal',
    media_type: editingWork?.media_type || 'link',
    thumbnail_url: editingWork?.thumbnail_url || '',
    media_url: editingWork?.media_url || '',
    award_tags: editingWork?.award_tags || [],
  });
  const [awardInput, setAwardInput] = useState('');

  React.useEffect(() => {
    if (editingWork) {
      setFormData({
        title: editingWork.title,
        description: editingWork.description || '',
        type: editingWork.type,
        media_type: editingWork.media_type,
        thumbnail_url: editingWork.thumbnail_url || '',
        media_url: editingWork.media_url || '',
        award_tags: editingWork.award_tags || [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'personal',
        media_type: 'link',
        thumbnail_url: '',
        media_url: '',
        award_tags: [],
      });
    }
    setAwardInput('');
  }, [editingWork, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSaving(true);
    await onSave(formData);
    setSaving(false);
    onOpenChange(false);
  };

  const addAwardTag = () => {
    if (awardInput.trim() && !formData.award_tags?.includes(awardInput.trim())) {
      setFormData({
        ...formData,
        award_tags: [...(formData.award_tags || []), awardInput.trim()],
      });
      setAwardInput('');
    }
  };

  const removeAwardTag = (tag: string) => {
    setFormData({
      ...formData,
      award_tags: formData.award_tags?.filter((t) => t !== tag) || [],
    });
  };

  const mediaUrlLabel = (() => {
    switch (formData.media_type) {
      case 'video': return 'Video URL (YouTube, Vimeo, etc.)';
      case 'image': return 'Image URL';
      case 'pdf': return 'PDF URL';
      default: return 'External Link';
    }
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingWork ? 'Edit Work' : 'Add New Work'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FloatingInput
            id="title"
            label="Title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          {/* Type */}
          <div className="space-y-2">
            <Label>Project Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {workTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Media Type */}
          <div className="space-y-2">
            <Label>Media Type</Label>
            <Select
              value={formData.media_type}
              onValueChange={(value) => setFormData({ ...formData, media_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mediaTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <FloatingInput
            id="media_url"
            label={mediaUrlLabel}
            value={formData.media_url}
            onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
          />

          <FloatingInput
            id="thumbnail_url"
            label="Thumbnail URL (optional)"
            value={formData.thumbnail_url}
            onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
          />

          <FloatingTextarea
            id="description"
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="min-h-[80px] resize-none"
          />

          {/* Award Tags */}
          <div className="space-y-2">
            <Label>Awards & Recognition</Label>
            <div className="flex gap-2">
              <Input
                value={awardInput}
                onChange={(e) => setAwardInput(e.target.value)}
                placeholder="e.g., Best Film, Finalist"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAwardTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addAwardTag}>
                Add
              </Button>
            </div>
            {formData.award_tags && formData.award_tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.award_tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeAwardTag(tag)}
                      className="hover:text-primary-foreground"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving || !formData.title.trim()}>
              {saving ? 'Saving...' : editingWork ? 'Update' : 'Add Work'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
