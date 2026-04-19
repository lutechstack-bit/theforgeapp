import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PreviewIframe } from './PreviewIframe';
import { MergeTagHelper } from './MergeTagHelper';
import { buildMergeValues, extractTags, resolveMergeTags } from '@/lib/mergeTags';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface Props {
  html: string;
  onChange: (next: string) => void;
  /** Optional real profile to use for preview merges (falls back to placeholders). */
  sampleProfile?: {
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    city?: string | null;
  } | null;
  sampleEdition?: {
    name?: string | null;
    cohort_type?: string | null;
    city?: string | null;
    forge_start_date?: string | null;
    forge_end_date?: string | null;
  } | null;
  /** Extra overrides to seed into the preview (e.g. a placeholder temp password). */
  sampleOverrides?: Record<string, string>;
}

/**
 * Split-pane editor: <textarea> on the left (HTML source), live preview
 * iframe on the right. Under the textarea sits a merge-tag chip strip that
 * inserts tokens at the cursor position.
 *
 * Deliberately zero-dep — no Monaco, no CodeMirror. Upgrade path is to swap
 * out the <textarea> for `<CodeMirror>` once we hit a ceiling.
 */
export const HtmlEditorPane: React.FC<Props> = ({
  html,
  onChange,
  sampleProfile,
  sampleEdition,
  sampleOverrides,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [cursorPos, setCursorPos] = useState<number>(html.length);

  const mergeValues = useMemo(
    () =>
      buildMergeValues(
        sampleProfile || null,
        sampleEdition || null,
        {
          // Always supply a visible placeholder so the preview doesn't look
          // broken for templates that reference {{user.temp_password}}.
          'user.temp_password': sampleOverrides?.['user.temp_password'] || '[temp_password at send time]',
          ...sampleOverrides,
        }
      ),
    [sampleProfile, sampleEdition, sampleOverrides]
  );

  const { rendered, unresolvedTags } = useMemo(
    () => resolveMergeTags(html, mergeValues),
    [html, mergeValues]
  );

  const usedTags = useMemo(() => extractTags(html), [html]);

  const insertAtCursor = useCallback(
    (snippet: string) => {
      const el = textareaRef.current;
      const pos = el ? el.selectionStart ?? cursorPos : cursorPos;
      const next = html.slice(0, pos) + snippet + html.slice(pos);
      onChange(next);
      // Restore focus + cursor after state updates
      requestAnimationFrame(() => {
        if (!textareaRef.current) return;
        textareaRef.current.focus();
        const newPos = pos + snippet.length;
        textareaRef.current.setSelectionRange(newPos, newPos);
        setCursorPos(newPos);
      });
    },
    [html, cursorPos, onChange]
  );

  const handleCursorTrack = () => {
    if (textareaRef.current) {
      setCursorPos(textareaRef.current.selectionStart ?? 0);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-html">HTML body</Label>
            {unresolvedTags.length > 0 && (
              <Badge variant="outline" className="gap-1 text-amber-400 border-amber-400/40">
                <AlertCircle className="h-3 w-3" />
                {unresolvedTags.length} unresolved
              </Badge>
            )}
          </div>
          <Textarea
            id="email-html"
            ref={textareaRef}
            value={html}
            onChange={(e) => {
              onChange(e.target.value);
              handleCursorTrack();
            }}
            onKeyUp={handleCursorTrack}
            onClick={handleCursorTrack}
            placeholder="<html>…</html>"
            className="font-mono text-xs min-h-[520px] leading-relaxed"
            spellCheck={false}
          />
        </div>

        <MergeTagHelper onInsert={insertAtCursor} usedTags={usedTags} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Live preview</Label>
          <p className="text-[11px] text-muted-foreground">
            Rendered with sample data
          </p>
        </div>
        <PreviewIframe html={rendered} className="w-full h-full min-h-[580px] rounded-lg bg-white border border-border/40" />
      </div>
    </div>
  );
};

export default HtmlEditorPane;
