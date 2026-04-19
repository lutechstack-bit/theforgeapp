import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { History, Search, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const STATUSES = ['queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'failed'] as const;

const statusStyle: Record<string, string> = {
  queued:     'bg-muted/40 text-muted-foreground border-border',
  sent:       'bg-blue-500/15 text-blue-400 border-blue-500/30',
  delivered:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  opened:     'bg-primary/15 text-primary border-primary/30',
  clicked:    'bg-violet-500/15 text-violet-400 border-violet-500/30',
  bounced:    'bg-red-500/15 text-red-400 border-red-500/30',
  complained: 'bg-red-500/15 text-red-400 border-red-500/30',
  failed:     'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function AdminEmailHistory() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: templates = [] } = useQuery({
    queryKey: ['admin-email-templates-names'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates').select('id, name').order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['admin-email-history', statusFilter, templateFilter],
    queryFn: async () => {
      let q = supabase
        .from('email_sends')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (statusFilter !== 'all') q = q.eq('status', statusFilter);
      if (templateFilter !== 'all') q = q.eq('template_id', templateFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });

  const templatesById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const t of templates) m[t.id as string] = t.name as string;
    return m;
  }, [templates]);

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(r =>
      (r.recipient_email || '').toLowerCase().includes(q) ||
      (r.subject_rendered || '').toLowerCase().includes(q)
    );
  }, [rows, search]);

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <History className="h-6 w-6 text-primary" /> Email History
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Every send logged. Click a row for merge values, timestamps, and errors.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipient or subject…"
            className="pl-8 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={templateFilter} onValueChange={setTemplateFilter}>
          <SelectTrigger className="w-[200px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All templates</SelectItem>
            {templates.map(t => <SelectItem key={t.id} value={t.id as string}>{t.name as string}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">Loading…</CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            No sends found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(r => (
            <Collapsible
              key={r.id}
              open={expanded === r.id}
              onOpenChange={(open) => setExpanded(open ? r.id : null)}
            >
              <Card className="hover:border-primary/30 transition-colors">
                <CollapsibleTrigger asChild>
                  <CardContent className="py-2.5 px-4 flex items-center gap-3 cursor-pointer">
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expanded === r.id ? 'rotate-90' : ''}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {r.subject_rendered || templatesById[r.template_id as string] || '—'}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        → {r.recipient_email} · {templatesById[r.template_id as string] || '—'}
                      </p>
                    </div>
                    <Badge variant="outline" className={statusStyle[r.status] || statusStyle.queued}>
                      {r.status}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground w-32 text-right">
                      {format(new Date(r.created_at), 'MMM d, HH:mm')}
                    </span>
                  </CardContent>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-12 pb-3 pt-1 text-xs space-y-2 border-t border-border/30">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <TimeStat label="Created" value={r.created_at} />
                      <TimeStat label="Sent" value={r.sent_at} />
                      <TimeStat label="Delivered" value={r.delivered_at} />
                      <TimeStat label="Opened" value={r.opened_at} />
                      <TimeStat label="Clicked" value={r.clicked_at} />
                      <TimeStat label="Bounced" value={r.bounced_at} />
                    </div>
                    {r.error_message && (
                      <div className="rounded border border-red-500/30 bg-red-500/10 px-2 py-1.5 text-red-300">
                        <strong>Error:</strong> {r.error_message}
                      </div>
                    )}
                    {r.resend_message_id && (
                      <p className="text-muted-foreground">
                        <strong>Resend ID:</strong> <span className="font-mono">{r.resend_message_id}</span>
                      </p>
                    )}
                    {r.variables_used && (
                      <details className="text-muted-foreground">
                        <summary className="cursor-pointer">Merge values used</summary>
                        <pre className="mt-1 p-2 rounded bg-muted/30 text-[10px] overflow-auto">
                          {JSON.stringify(r.variables_used, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}

const TimeStat: React.FC<{ label: string; value: string | null }> = ({ label, value }) => (
  <div>
    <p className="text-[10px] uppercase text-muted-foreground/70">{label}</p>
    <p className="font-mono">{value ? format(new Date(value), 'MMM d HH:mm:ss') : '—'}</p>
  </div>
);
