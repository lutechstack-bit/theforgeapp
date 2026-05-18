import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase as supabaseTyped } from '@/integrations/supabase/client';
const supabase = supabaseTyped as any;
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ClipboardList, Download, Search, ChevronRight,
  CheckCircle2, XCircle, AlertTriangle, SkipForward, Mail,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────────────────

type LogStatus = 'success' | 'failed' | 'duplicate' | 'skipped';
type TriggerSource = 'google_sheet' | 'manual_admin';

interface LogEntry {
  id: string;
  student_id: string | null;
  student_name: string | null;
  student_email: string | null;
  student_phone: string | null;
  sheet_product: string | null;
  sheet_batch: string | null;
  payment_amount: number | null;
  matched_edition_id: string | null;
  matched_edition_name: string | null;
  matched_cohort_type: string | null;
  status: LogStatus;
  error_message: string | null;
  error_details: Record<string, unknown> | null;
  created_user_id: string | null;
  created_profile_id: string | null;
  email_sent: boolean;
  email_message_id: string | null;
  trigger_source: TriggerSource | null;
  triggered_by: string | null;
  created_at: string;
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<LogStatus, {
  label: string;
  icon: React.ReactNode;
  className: string;
}> = {
  success: {
    label: 'Success',
    icon: <CheckCircle2 className="h-3 w-3" />,
    className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  },
  failed: {
    label: 'Failed',
    icon: <XCircle className="h-3 w-3" />,
    className: 'bg-red-500/10 text-red-400 border-red-500/30',
  },
  duplicate: {
    label: 'Duplicate',
    icon: <AlertTriangle className="h-3 w-3" />,
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  skipped: {
    label: 'Skipped',
    icon: <SkipForward className="h-3 w-3" />,
    className: 'bg-muted/60 text-muted-foreground border-border',
  },
};

function StatusBadge({ status }: { status: LogStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.skipped;
  return (
    <Badge variant="outline" className={`gap-1 text-[10px] ${cfg.className}`}>
      {cfg.icon}
      {cfg.label}
    </Badge>
  );
}

// ── Stat summary pill ─────────────────────────────────────────────────────────

function StatPill({ label, count, className }: { label: string; count: number; className: string }) {
  return (
    <div className={`rounded-md border px-3 py-1.5 text-center ${className}`}>
      <p className="text-lg font-bold leading-none">{count}</p>
      <p className="text-[10px] mt-0.5 opacity-80">{label}</p>
    </div>
  );
}

// ── Detail modal ──────────────────────────────────────────────────────────────

function DetailModal({ log, onClose }: { log: LogEntry | null; onClose: () => void }) {
  if (!log) return null;

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex gap-2 py-1.5 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground text-xs w-36 shrink-0">{label}</span>
      <span className="text-xs break-all">{value ?? '—'}</span>
    </div>
  );

  return (
    <Dialog open={!!log} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StatusBadge status={log.status} />
            <span className="font-normal text-sm">{log.student_name ?? log.student_email ?? 'Unknown student'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* Student info */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Student</p>
            <Row label="ID" value={log.student_id} />
            <Row label="Name" value={log.student_name} />
            <Row label="Email" value={log.student_email} />
            <Row label="Phone" value={log.student_phone} />
            <Row label="Product" value={<span className="font-mono">{log.sheet_product}</span>} />
            <Row label="Batch" value={log.sheet_batch} />
            <Row label="Payment" value={log.payment_amount != null ? `₹${log.payment_amount.toLocaleString('en-IN')}` : null} />
          </div>

          {/* Matched edition */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Matched Edition</p>
            <Row label="Edition" value={log.matched_edition_name} />
            <Row label="Cohort type" value={log.matched_cohort_type} />
            <Row label="Edition ID" value={<span className="font-mono text-[10px]">{log.matched_edition_id}</span>} />
          </div>

          {/* Result */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Result</p>
            <Row label="Status" value={<StatusBadge status={log.status} />} />
            {log.created_user_id && (
              <Row label="User ID created" value={<span className="font-mono text-[10px]">{log.created_user_id}</span>} />
            )}
            <Row
              label="Email sent"
              value={
                log.email_sent
                  ? <span className="flex items-center gap-1 text-emerald-500"><Mail className="h-3 w-3" /> Sent ({log.email_message_id ?? 'no ID'})</span>
                  : 'No'
              }
            />
            <Row label="Trigger" value={log.trigger_source === 'manual_admin' ? 'Manual (admin)' : 'Google Sheet'} />
            <Row label="Logged at" value={format(new Date(log.created_at), 'MMM d, yyyy · h:mm a')} />
          </div>

          {/* Error details */}
          {log.error_message && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Error</p>
              <div className="rounded-md bg-red-500/8 border border-red-500/20 px-3 py-2 text-xs text-red-400 font-mono whitespace-pre-wrap">
                {log.error_message}
              </div>
              {log.error_details && (
                <Collapsible className="mt-2">
                  <CollapsibleTrigger className="text-[11px] text-muted-foreground flex items-center gap-1 hover:text-foreground">
                    <ChevronRight className="h-3 w-3" /> Stack trace
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <pre className="mt-1 text-[10px] font-mono bg-muted/40 rounded p-2 overflow-auto max-h-40 text-muted-foreground">
                      {JSON.stringify(log.error_details, null, 2)}
                    </pre>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

const STATUSES: LogStatus[] = ['success', 'failed', 'duplicate', 'skipped'];

export default function AdminAutomationHistory() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  // ── Data ──────────────────────────────────────────────────────────────

  const { data: logs = [], isLoading } = useQuery<LogEntry[]>({
    queryKey: ['automation-history', statusFilter],
    queryFn: async () => {
      let q = supabase
        .from('onboarding_automation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (statusFilter !== 'all') q = q.eq('status', statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as LogEntry[];
    },
  });

  // ── Client-side search ────────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase();
    return logs.filter(
      (l) =>
        l.student_email?.toLowerCase().includes(q) ||
        l.student_name?.toLowerCase().includes(q) ||
        l.student_id?.toLowerCase().includes(q) ||
        l.sheet_product?.toLowerCase().includes(q)
    );
  }, [logs, search]);

  // ── Stat counts ───────────────────────────────────────────────────────

  const stats = useMemo(
    () => ({
      total: logs.length,
      success: logs.filter((l) => l.status === 'success').length,
      failed: logs.filter((l) => l.status === 'failed').length,
      duplicate: logs.filter((l) => l.status === 'duplicate').length,
      skipped: logs.filter((l) => l.status === 'skipped').length,
    }),
    [logs]
  );

  // ── CSV export ────────────────────────────────────────────────────────

  const exportCSV = () => {
    try {
      const headers = [
        'Date', 'Student ID', 'Name', 'Email', 'Phone',
        'Product', 'Batch', 'Edition', 'Status', 'Error', 'Trigger',
      ];
      const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const rows = filtered.map((l) => [
        format(new Date(l.created_at), 'yyyy-MM-dd HH:mm:ss'),
        l.student_id,
        l.student_name,
        l.student_email,
        l.student_phone,
        l.sheet_product,
        l.sheet_batch,
        l.matched_edition_name,
        l.status,
        l.error_message,
        l.trigger_source,
      ].map(escape).join(','));

      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `onboarding-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${filtered.length} rows`);
    } catch (e) {
      toast.error('CSV export failed');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Onboarding History
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Every auto-onboarding attempt — last 500 records.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCSV}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      {/* Stat pills */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <StatPill label="Total" count={stats.total} className="border-border text-foreground" />
          <StatPill label="Success" count={stats.success} className="border-emerald-500/30 text-emerald-500" />
          <StatPill label="Failed" count={stats.failed} className="border-red-500/30 text-red-400" />
          <StatPill label="Duplicate" count={stats.duplicate} className="border-amber-500/30 text-amber-400" />
          <StatPill label="Skipped" count={stats.skipped} className="border-border text-muted-foreground" />
        </div>
      )}

      {/* Filters row */}
      <div className="flex gap-2 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name, email, student ID, product…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>

      {/* Table card */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-14 text-muted-foreground gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <ClipboardList className="h-10 w-10 opacity-25" />
              <p className="font-medium">
                {logs.length === 0 ? 'No onboarding attempts logged yet.' : 'No results match your filters.'}
              </p>
              {logs.length > 0 && (
                <button
                  onClick={() => { setStatusFilter('all'); setSearch(''); }}
                  className="text-xs text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="w-[70px]">Product</TableHead>
                    <TableHead className="hidden sm:table-cell w-[130px]">Edition</TableHead>
                    <TableHead className="w-[110px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((log) => (
                    <TableRow
                      key={log.id}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => setSelectedLog(log)}
                    >
                      <TableCell className="text-xs text-muted-foreground tabular-nums">
                        <div>{format(new Date(log.created_at), 'MMM d, yyyy')}</div>
                        <div className="text-[10px]">{format(new Date(log.created_at), 'h:mm a')}</div>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium text-sm leading-none">
                          {log.student_name ?? '—'}
                        </div>
                        {log.student_id && (
                          <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                            {log.student_id}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {log.student_email ?? '—'}
                      </TableCell>

                      <TableCell>
                        <span className="font-mono text-xs font-semibold">
                          {log.sheet_product ?? '—'}
                        </span>
                      </TableCell>

                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground truncate max-w-[130px]">
                        {log.matched_edition_name ?? '—'}
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <StatusBadge status={log.status} />
                          {log.status === 'failed' && log.error_message && (
                            <p className="text-[10px] text-red-400/80 leading-tight line-clamp-1">
                              {log.error_message}
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Row count footer */}
              <div className="px-4 py-2.5 border-t border-border/50 text-xs text-muted-foreground">
                Showing {filtered.length} of {logs.length} record{logs.length !== 1 ? 's' : ''}
                {statusFilter !== 'all' || search ? ' (filtered)' : ''}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail modal */}
      <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
}
