import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

import {
  useSendMentorCard,
  MENTOR_CARD_TEMPLATES,
} from '@/hooks/useTargetedCards';

type DeliveryMode = 'both' | 'push' | 'card';

/**
 * Mentor's "Send notification / card" composer.
 *
 * Opens from the student detail pane. Lets the mentor pick a template,
 * edit title/body/CTA, choose delivery channels, and see a live preview
 * of both the push and the home card the student will receive.
 */
export const SendMentorCardDialog: React.FC<{
  open: boolean;
  onOpenChange: (v: boolean) => void;
  studentUserId: string;
  studentFirstName: string;
  mentorName: string;
}> = ({ open, onOpenChange, studentUserId, studentFirstName, mentorName }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [icon, setIcon] = useState<string>('💬');
  const [templateKey, setTemplateKey] = useState<string>('blank');
  const [delivery, setDelivery] = useState<DeliveryMode>('both');

  const send = useSendMentorCard();

  const reset = () => {
    setTitle('');
    setBody('');
    setCtaLabel('');
    setCtaUrl('');
    setIcon('💬');
    setTemplateKey('blank');
    setDelivery('both');
  };

  const applyTemplate = (key: string) => {
    const t = MENTOR_CARD_TEMPLATES.find((x) => x.key === key);
    if (!t) return;
    setTemplateKey(key);
    setTitle(t.title);
    setBody(t.body);
    setCtaLabel(t.ctaLabel);
    setCtaUrl(t.ctaUrl);
    setIcon(t.icon || '💬');
  };

  const canSend =
    title.trim().length > 0 &&
    title.length <= 80 &&
    body.trim().length > 0 &&
    body.length <= 300 &&
    ctaLabel.length <= 30;

  const onSubmit = async () => {
    try {
      await send.mutateAsync({
        targetUserId: studentUserId,
        title,
        body,
        ctaLabel: ctaLabel.trim() || null,
        ctaUrl: ctaUrl.trim() || null,
        icon,
        templateKey: templateKey === 'blank' ? null : templateKey,
        linkedFormKey:
          MENTOR_CARD_TEMPLATES.find((t) => t.key === templateKey)?.linkedFormKey ??
          null,
        deliveredAsPush: delivery === 'both' || delivery === 'push',
        deliveredAsCard: delivery === 'both' || delivery === 'card',
      });
      const bits: string[] = [];
      if (delivery !== 'card') bits.push('push');
      if (delivery !== 'push') bits.push('home card');
      toast.success(
        `Sent to ${studentFirstName}${bits.length ? ` · ${bits.join(' + ')}` : ''}`,
      );
      reset();
      onOpenChange(false);
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="mb-1 inline-block rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            Mentor · {mentorName}
          </div>
          <DialogTitle>Send to {studentFirstName}</DialogTitle>
          <DialogDescription>
            Only {studentFirstName} will see this — logged as a mentor-triggered event.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 md:grid-cols-2">
          {/* LEFT — compose */}
          <div className="space-y-4">
            <div>
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Deliver as
              </Label>
              <div className="mt-1.5 grid grid-cols-3 gap-1.5 rounded-lg border border-border p-1">
                <DeliveryBtn
                  active={delivery === 'both'}
                  onClick={() => setDelivery('both')}
                >
                  ⚡ Both
                </DeliveryBtn>
                <DeliveryBtn
                  active={delivery === 'push'}
                  onClick={() => setDelivery('push')}
                >
                  📱 Push only
                </DeliveryBtn>
                <DeliveryBtn
                  active={delivery === 'card'}
                  onClick={() => setDelivery('card')}
                >
                  ◈ Card only
                </DeliveryBtn>
              </div>
            </div>

            <div>
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Quick templates
              </Label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {MENTOR_CARD_TEMPLATES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => applyTemplate(t.key)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      templateKey === t.key
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="mc-title" className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Title
              </Label>
              <Input
                id="mc-title"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 80))}
                placeholder="e.g. Good work on Draft 1 — here's what's next"
                className="mt-1.5"
              />
              <div
                className={`mt-1 text-right text-[11px] ${
                  title.length >= 80 ? 'text-destructive' : title.length >= 70 ? 'text-orange-500' : 'text-muted-foreground'
                }`}
              >
                {title.length} / 80
              </div>
            </div>

            <div>
              <Label htmlFor="mc-body" className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Body
              </Label>
              <Textarea
                id="mc-body"
                value={body}
                onChange={(e) => setBody(e.target.value.slice(0, 300))}
                placeholder={`A short note to ${studentFirstName} — under 300 characters.`}
                className="mt-1.5 min-h-24 resize-none"
              />
              <div
                className={`mt-1 text-right text-[11px] ${
                  body.length >= 300 ? 'text-destructive' : body.length >= 260 ? 'text-orange-500' : 'text-muted-foreground'
                }`}
              >
                {body.length} / 300
              </div>
            </div>

            {delivery !== 'push' && (
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Card CTA (optional)
                </Label>
                <Input
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value.slice(0, 30))}
                  placeholder="e.g. Book a 1:1 →"
                />
                <Input
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="https://…"
                />
                <div
                  className={`text-right text-[11px] ${
                    ctaLabel.length >= 30 ? 'text-destructive' : 'text-muted-foreground'
                  }`}
                >
                  {ctaLabel.length} / 30
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — preview */}
          <div className="space-y-4">
            <div>
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Push notification
              </Label>
              <div
                className={`mt-1.5 rounded-xl border border-primary/30 bg-[#1a1916] p-3 shadow-md ${
                  delivery === 'card' ? 'opacity-40' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="grid h-5 w-5 place-items-center rounded-md bg-primary text-[11px] text-black">
                    🔥
                  </div>
                  <div className="text-[11px] font-medium">the Forge</div>
                  <div className="ml-auto text-[10px] text-muted-foreground">now</div>
                </div>
                <div className="mt-2 text-[13px] font-semibold text-foreground">
                  {title || 'Notification title'}
                </div>
                <div className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                  {body || 'Message preview…'}
                </div>
              </div>
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Home card
              </Label>
              <div
                className={`mt-1.5 flex min-h-32 overflow-hidden rounded-xl border border-border bg-card ${
                  delivery === 'push' ? 'opacity-40' : ''
                }`}
              >
                <div className="grid w-24 shrink-0 place-items-center bg-gradient-to-br from-amber-900/30 to-amber-950/5 text-3xl">
                  {icon}
                </div>
                <div className="flex-1 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    From your mentor · {mentorName}
                  </div>
                  <div className="mt-1 text-[13px] font-semibold leading-snug">
                    {title || 'Card title'}
                  </div>
                  <div className="mt-1 text-[12px] leading-snug text-muted-foreground">
                    {body || "Card body shown on student's home"}
                  </div>
                  {ctaLabel && (
                    <div className="mt-2 inline-block rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-black">
                      {ctaLabel}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-3 gap-2 sm:gap-2">
          <div className="mr-auto text-[11px] text-muted-foreground">
            Sending to <span className="font-medium text-foreground">{studentFirstName}</span> ·
            source tracked as <span className="font-medium text-foreground">Mentor · {mentorName}</span>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!canSend || send.isPending}>
            {send.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Send →'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeliveryBtn: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors ${
      active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    {children}
  </button>
);
