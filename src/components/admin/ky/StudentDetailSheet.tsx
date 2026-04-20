import React from 'react';
import {
  User, AtSign, MapPin, Briefcase, PhoneCall, Film, Sparkles, Coffee, Camera,
  Brain, Target, FileCheck, ExternalLink, Copy, Check, X, Mail, Phone, Instagram,
  type LucideIcon,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { StudentRow } from '@/hooks/useStudentKYData';
import {
  KY_SECTIONS,
  KY_FIELD_BY_KEY,
  extraKeys,
  formatKyValueForDisplay,
  stripUrlTokens,
  type KyField,
} from '@/lib/kyFieldSchema';

/**
 * StudentDetailSheet — opens when an admin clicks a row in AdminKYForms.
 *
 * Replaces the old flat key-value dump with grouped sections driven by
 * `KY_SECTIONS` in src/lib/kyFieldSchema.ts. Photos render as thumbnails,
 * booleans as chips, lists as badges, and the hero area shows the student's
 * avatar + headline stats (completion %, MBTI, cohort) at a glance.
 */

const ICONS: Record<string, LucideIcon> = {
  User, AtSign, MapPin, Briefcase, PhoneCall, Film, Sparkles,
  Coffee, Camera, Brain, Target, FileCheck,
};

const COHORT_LABELS: Record<string, string> = {
  FORGE: 'Filmmaking',
  FORGE_WRITING: 'Writing',
  FORGE_CREATORS: 'Creators',
};

interface Props {
  student: StudentRow | null;
  onClose: () => void;
}

export const StudentDetailSheet: React.FC<Props> = ({ student, onClose }) => {
  return (
    <Sheet open={!!student} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
        {student && <StudentDetailBody student={student} />}
      </SheetContent>
    </Sheet>
  );
};

const StudentDetailBody: React.FC<{ student: StudentRow }> = ({ student }) => {
  const kyData = (student.kyData || {}) as Record<string, unknown>;

  // Count how many schema-defined fields are filled (gives a completion %)
  const filledFields = KY_SECTIONS.flatMap(s => s.fields).filter(f => {
    const v = kyData[f.key];
    return v !== null && v !== undefined && v !== '';
  });
  const totalFields = KY_SECTIONS.flatMap(s => s.fields).length;
  const completionPct = totalFields > 0 ? Math.round((filledFields.length / totalFields) * 100) : 0;

  const extras = extraKeys(kyData);

  const avatarPhoto = (kyData.photo_favorite_url || kyData.headshot_front_url) as string | undefined;

  // ------------------------------------------------------------------------
  return (
    <div>
      {/* Hero */}
      <SheetHeader className="p-6 border-b border-border/40 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-muted border border-border/40">
            {avatarPhoto ? (
              <img
                src={String(avatarPhoto)}
                alt={student.full_name || ''}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                {(student.full_name || '?').slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <SheetTitle className="text-xl font-bold truncate">
              {student.full_name || '—'}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-0.5 truncate">
              {student.email || '—'}
            </SheetDescription>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {student.cohort_type && (
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                  {COHORT_LABELS[student.cohort_type] || student.cohort_type}
                </Badge>
              )}
              {student.edition_name && (
                <Badge variant="outline" className="text-[10px]">{student.edition_name}</Badge>
              )}
              {student.city && (
                <Badge variant="outline" className="text-[10px]">{student.city}</Badge>
              )}
              {student.mbti_type && (
                <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-300 border-violet-500/30">
                  {student.mbti_type}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Top strip: completion stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <StatPill
            label="KY form"
            value={student.ky_form_completed ? 'Complete' : 'Incomplete'}
            good={student.ky_form_completed}
          />
          <StatPill
            label="Community"
            value={student.has_collaborator_profile ? 'Created' : 'Missing'}
            good={student.has_collaborator_profile}
          />
          <StatPill
            label="Fields filled"
            value={`${filledFields.length}/${totalFields} · ${completionPct}%`}
            good={completionPct >= 80}
          />
        </div>
      </SheetHeader>

      <div className="p-6 space-y-5">
        {KY_SECTIONS.map((section) => {
          const visibleFields = section.fields.filter(f => {
            const v = kyData[f.key];
            return v !== null && v !== undefined && v !== '';
          });
          if (visibleFields.length === 0) return null;

          const Icon = ICONS[section.icon] || User;

          return (
            <section key={section.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold tracking-tight">{section.title}</h3>
                <div className="h-px flex-1 bg-border/40" />
              </div>

              {section.id === 'photos' ? (
                <PhotoGrid fields={visibleFields} data={kyData} />
              ) : (
                <div className={section.twoCol ? 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3' : 'space-y-3'}>
                  {visibleFields.map(field => (
                    <FieldRow key={field.key} field={field} value={kyData[field.key]} />
                  ))}
                </div>
              )}
            </section>
          );
        })}

        {/* Community profile */}
        {student.collabData && Object.keys(student.collabData).length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold tracking-tight">Community profile</h3>
              <div className="h-px flex-1 bg-border/40" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {['tagline', 'occupations', 'about', 'intro', 'portfolio_url', 'portfolio_type'].map(k => {
                const value = (student.collabData as any)?.[k];
                if (value === null || value === undefined || value === '') return null;
                return (
                  <FieldRow
                    key={k}
                    field={{
                      key: k,
                      label: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                      render: k === 'portfolio_url' ? 'url' : Array.isArray(value) ? 'list' : 'text',
                    }}
                    value={value}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Extras — fields not yet in the canonical schema */}
        {extras.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold tracking-tight text-muted-foreground">Other fields</h3>
              <div className="h-px flex-1 bg-border/40" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {extras.map(k => (
                <FieldRow
                  key={k}
                  field={{
                    key: k,
                    label: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                    render: Array.isArray(kyData[k]) ? 'list' : 'text',
                  }}
                  value={kyData[k]}
                />
              ))}
            </div>
          </section>
        )}

        {filledFields.length === 0 && extras.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No KY responses submitted yet.
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────── Subcomponents ──────────────────────────────────

const StatPill: React.FC<{ label: string; value: string; good?: boolean }> = ({ label, value, good }) => (
  <div className={`rounded-lg border px-3 py-2 ${good
    ? 'border-emerald-500/30 bg-emerald-500/10'
    : 'border-border/40 bg-muted/30'}`}>
    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className={`text-xs font-semibold mt-0.5 flex items-center gap-1 ${good ? 'text-emerald-300' : 'text-foreground'}`}>
      {good ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 text-muted-foreground" />}
      {value}
    </p>
  </div>
);

const FieldRow: React.FC<{ field: KyField; value: unknown }> = ({ field, value }) => {
  const displayed = formatKyValueForDisplay(value, field.render);

  // Special-case renderers
  switch (field.render) {
    case 'boolean':
      return (
        <KVPair label={field.label}>
          <Badge variant="outline" className={`text-[10px] ${value === true || value === 'true'
            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            : 'bg-muted/30 text-muted-foreground'}`}>
            {value === true || value === 'true' ? 'Yes' : 'No'}
          </Badge>
        </KVPair>
      );

    case 'list': {
      const items = Array.isArray(value)
        ? value.filter(Boolean)
        : typeof value === 'string'
          ? value.split(',').map(s => s.trim()).filter(Boolean)
          : [];
      return (
        <KVPair label={field.label}>
          <div className="flex flex-wrap gap-1">
            {items.map((it, i) => (
              <Badge key={i} variant="outline" className="text-[10px]">{String(it)}</Badge>
            ))}
          </div>
        </KVPair>
      );
    }

    case 'level': {
      const str = String(value);
      const tone =
        /just getting started|theoretical/i.test(str) ? 'beginner' :
        /simple|struggling|short videos/i.test(str) ? 'novice' :
        /short film|block or stage|smaller/i.test(str) ? 'intermediate' :
        /feature|pitched|professional software|know how/i.test(str) ? 'advanced' :
        'neutral';
      const toneClass = {
        beginner: 'bg-muted/40 text-muted-foreground border-border/40',
        novice: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
        intermediate: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        advanced: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        neutral: 'bg-muted/40 text-muted-foreground border-border/40',
      }[tone];
      return (
        <KVPair label={field.label}>
          <Badge variant="outline" className={`text-[10px] font-normal whitespace-normal h-auto py-1 px-2 ${toneClass}`}>
            {str}
          </Badge>
        </KVPair>
      );
    }

    case 'email':
      return (
        <KVPair label={field.label}>
          <div className="flex items-center gap-1.5">
            <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
            <a href={`mailto:${displayed}`} className="text-xs text-primary hover:underline truncate">
              {displayed}
            </a>
            <CopyButton value={displayed} />
          </div>
        </KVPair>
      );

    case 'phone':
      return (
        <KVPair label={field.label}>
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
            <a href={`tel:${displayed}`} className="text-xs text-primary hover:underline">
              {displayed}
            </a>
            <CopyButton value={displayed} />
          </div>
        </KVPair>
      );

    case 'long_text':
      return (
        <div className="col-span-full">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{field.label}</p>
          <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed bg-muted/20 rounded-md p-3 border border-border/30">
            {displayed}
          </p>
        </div>
      );

    case 'url':
      return (
        <KVPair label={field.label}>
          <a href={String(value)} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1 truncate">
            {displayed}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        </KVPair>
      );

    default:
      return <KVPair label={field.label}><span className="text-xs font-medium">{displayed}</span></KVPair>;
  }
};

const KVPair: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="min-w-0">
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <div className="mt-1 min-w-0">{children}</div>
  </div>
);

const CopyButton: React.FC<{ value: string }> = ({ value }) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      navigator.clipboard.writeText(value).then(
        () => toast.success('Copied'),
        () => toast.error('Copy failed')
      );
    }}
    className="p-0.5 rounded hover:bg-muted/50 text-muted-foreground"
    title="Copy"
  >
    <Copy className="h-3 w-3" />
  </button>
);

const PhotoGrid: React.FC<{ fields: KyField[]; data: Record<string, unknown> }> = ({ fields, data }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
    {fields.map(field => {
      const url = data[field.key] as string | undefined;
      if (!url) return null;
      const cleaned = stripUrlTokens(url);
      return (
        <a
          key={field.key}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="group relative aspect-square rounded-lg overflow-hidden border border-border/40 bg-muted"
        >
          <img
            src={url}
            alt={field.label}
            loading="lazy"
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2">
            <p className="text-[9px] text-white/90 font-medium truncate">{field.label}</p>
            <p className="text-[8px] text-white/60 truncate" title={cleaned}>
              {cleaned.split('/').pop()}
            </p>
          </div>
          <ExternalLink className="absolute top-1.5 right-1.5 h-3 w-3 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      );
    })}
  </div>
);

export default StudentDetailSheet;
