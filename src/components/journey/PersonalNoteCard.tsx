import React, { useState, useRef, useEffect } from 'react';
import { usePersonalNote } from '@/hooks/usePersonalNote';
import { useAuth } from '@/contexts/AuthContext';
import { StickyNote, Pencil, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

interface PersonalNoteCardProps {
  className?: string;
  compact?: boolean;
}

export const PersonalNoteCard: React.FC<PersonalNoteCardProps> = ({ 
  className,
  compact = false 
}) => {
  const { user } = useAuth();
  const { 
    note, 
    localContent, 
    updateLocalContent, 
    saveNote, 
    isLoading, 
    isSaving 
  } = usePersonalNote();
  
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  // Auto-save with debounce
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    updateLocalContent(newContent);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new debounced save
    saveTimeoutRef.current = setTimeout(() => {
      saveNote(newContent);
    }, 1000);
  };

  // Save on blur
  const handleBlur = () => {
    // Clear any pending debounced save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Save immediately
    if (localContent !== note?.content) {
      saveNote(localContent);
    }
    
    setIsEditing(false);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      // Reset to saved content
      updateLocalContent(note?.content || '');
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleBlur();
    }
  };

  if (!user) return null;

  const lastUpdated = note?.updated_at 
    ? formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })
    : null;

  const characterCount = localContent.length;
  const maxCharacters = 500;

  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden transition-all duration-200',
        'bg-rose-500/10 border-2 border-rose-500/30',
        'hover:border-rose-500/50',
        isEditing && 'border-rose-500/60 ring-2 ring-rose-500/20',
        compact ? 'p-3' : 'p-4',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-rose-500" />
          <span className="text-sm font-medium text-foreground">My Notes</span>
        </div>
        
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg hover:bg-rose-500/20 transition-colors group"
            aria-label="Edit note"
          >
            <Pencil className="w-3.5 h-3.5 text-muted-foreground group-hover:text-rose-500" />
          </button>
        )}
        
        {isEditing && (
          <div className="flex items-center gap-1">
            {isSaving && (
              <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
            )}
            <button
              onClick={handleBlur}
              className="p-1.5 rounded-lg hover:bg-rose-500/20 transition-colors group"
              aria-label="Save note"
            >
              <Check className="w-3.5 h-3.5 text-muted-foreground group-hover:text-rose-500" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="h-16 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        </div>
      ) : isEditing ? (
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            value={localContent}
            onChange={handleContentChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Write a quick note to yourself..."
            className={cn(
              'resize-none border-none bg-transparent p-0 text-sm',
              'focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0',
              'placeholder:text-muted-foreground/50',
              compact ? 'min-h-[60px]' : 'min-h-[80px]'
            )}
            maxLength={maxCharacters}
          />
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span className="opacity-60">
              {characterCount}/{maxCharacters}
            </span>
            <span className="opacity-60">Press Esc to cancel, ⌘+Enter to save</span>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          className="cursor-pointer"
        >
          {localContent ? (
            <p className={cn(
              'text-sm text-foreground/90 whitespace-pre-wrap break-words',
              compact ? 'line-clamp-3' : 'line-clamp-5'
            )}>
              {localContent}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground/60 italic">
              Tap to add a personal note...
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      {!isEditing && lastUpdated && localContent && (
        <p className="text-xs text-muted-foreground/60 mt-2">
          Updated {lastUpdated}
        </p>
      )}
    </div>
  );
};
