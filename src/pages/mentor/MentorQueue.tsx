import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  ExternalLink,
  Clock,
  ArrowRight,
  FileText,
  MessageSquare,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { useMentorQueue, type QueueItem } from '@/hooks/useMentorQueue';
import { FORM_LABELS } from '@/hooks/useSubmissions';

type Filter = 'all' | 'submissions' | 'doubts';

const initials = (name: string | null | undefined) =>
  (name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const formatRelative = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
};

const ageInDays = (iso: string): number =>
  (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);

const QueueRow: React.FC<{ item: QueueItem; onOpen: (studentId: string) => void }> = ({
  item,
  onOpen,
}) => {
  const stale = ageInDays(item.created_at) >= 2;

  // Type-specific bits
  const isSubmission = item.kind === 'submission';
  const typePill = isSubmission ? FORM_LABELS[item.form_key].short : 'Doubt';
  const typeIcon = isSubmission ? <FileText className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />;
  const typeTone = isSubmission
    ? 'bg-primary/10 text-primary border-primary/30'
    : 'bg-purple-400/10 text-purple-400 border-purple-400/30';
  const headline = isSubmission
    ? item.title || FORM_LABELS[item.form_key].long
    : item.question;

  const tallyHref =
    isSubmission && item.tally_form_id && item.tally_response_id
      ? `https://tally.so/forms/${item.tally_form_id}/submissions/${item.tally_response_id}`
      : null;

  return (
    <Card
      className={`flex items-start gap-3 p-4 transition-colors hover:bg-muted/30 ${
        stale ? 'border-l-2 border-l-orange-500' : ''
      }`}
    >
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={item.student?.avatar_url ?? undefined} />
        <AvatarFallback className="bg-gradient-to-br from-amber-800/30 to-transparent text-xs font-semibold text-primary">
          {initials(item.student?.full_name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold truncate">
            {item.student?.full_name ?? 'Student'}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${typeTone}`}
          >
            {typeIcon}
            {typePill}
          </span>
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
            <Clock className="h-3 w-3" />
            {formatRelative(item.created_at)}
          </span>
        </div>
        <div className="mt-1 line-clamp-2 text-[13px] leading-snug text-foreground/90">
          {headline}
        </div>
      </div>

      <div className="ml-2 flex shrink-0 flex-col gap-1.5">
        {tallyHref && (
          <Button variant="outline" size="sm" asChild>
            <a href={tallyHref} target="_blank" rel="noreferrer">
              Tally <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        )}
        <Button size="sm" onClick={() => onOpen(item.student_user_id)}>
          Open <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
};

const FilterChip: React.FC<{
  value: Filter;
  current: Filter;
  onClick: (v: Filter) => void;
  count: number;
  children: React.ReactNode;
}> = ({ value, current, onClick, count, children }) => (
  <button
    onClick={() => onClick(value)}
    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
      value === current
        ? 'border-primary/40 bg-primary/10 text-primary'
        : 'border-border text-muted-foreground hover:text-foreground'
    }`}
  >
    {children}
    {count > 0 && (
      <span
        className={`rounded-full px-1.5 text-[10px] tabular-nums ${
          value === current ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground/70'
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

const MentorQueue: React.FC = () => {
  const navigate = useNavigate();
  const { data: items = [], isLoading, error } = useMentorQueue();
  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(() => {
    const s = items.filter((i) => i.kind === 'submission').length;
    const d = items.filter((i) => i.kind === 'doubt').length;
    return { all: items.length, submissions: s, doubts: d };
  }, [items]);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'submissions') return items.filter((i) => i.kind === 'submission');
    return items.filter((i) => i.kind === 'doubt');
  }, [items, filter]);

  const onOpen = (studentId: string) => navigate(`/mentor/students/${studentId}`);

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
          <Inbox className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-tight">Your queue</h1>
          <p className="text-sm text-muted-foreground">
            Pending submissions and open doubts across all your students. Oldest first — anything
            past 2 days is highlighted.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-b border-border pb-4">
        <FilterChip value="all" current={filter} onClick={setFilter} count={counts.all}>
          All
        </FilterChip>
        <FilterChip
          value="submissions"
          current={filter}
          onClick={setFilter}
          count={counts.submissions}
        >
          Submissions
        </FilterChip>
        <FilterChip value="doubts" current={filter} onClick={setFilter} count={counts.doubts}>
          Doubts
        </FilterChip>
      </div>

      <div className="mt-4 space-y-2">
        {isLoading && (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        )}
        {error && (
          <Card className="p-6 text-sm text-destructive">
            Failed to load queue: {String(error)}
          </Card>
        )}
        {!isLoading && !error && filtered.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {items.length === 0
                ? "✓ All caught up. Nothing's waiting on you right now."
                : 'Nothing matches this filter.'}
            </p>
          </Card>
        )}
        {filtered.map((item) => (
          <QueueRow
            key={`${item.kind}-${item.id}`}
            item={item}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  );
};

export default MentorQueue;
