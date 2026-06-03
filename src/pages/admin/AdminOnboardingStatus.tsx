import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase as supabaseTyped } from '@/integrations/supabase/client';
const supabase = supabaseTyped as any;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Search, Users, MailCheck, MailX, Clock } from 'lucide-react';

// ── Display helpers ──────────────────────────────────────────────────────────

const PAYMENT_LABEL: Record<string, string> = {
  CONFIRMED_15K: '₹15k confirmed',
  BALANCE_PAID: 'Balance paid',
};

function paymentBadge(status: string) {
  const isPaid = status === 'BALANCE_PAID';
  return (
    <Badge
      variant="outline"
      className={isPaid
        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        : 'bg-forge-yellow/15 text-forge-yellow border-forge-yellow/30'}
    >
      {PAYMENT_LABEL[status] || status}
    </Badge>
  );
}

const EMAIL_STATUS_STYLE: Record<string, string> = {
  opened: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  clicked: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  delivered: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  sent: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  queued: 'bg-muted text-muted-foreground border-border',
  bounced: 'bg-red-500/15 text-red-400 border-red-500/30',
  complained: 'bg-red-500/15 text-red-400 border-red-500/30',
  failed: 'bg-red-500/15 text-red-400 border-red-500/30',
};

function emailBadge(status: string | null) {
  if (!status) {
    return <span className="text-xs text-muted-foreground">Not sent</span>;
  }
  return (
    <Badge variant="outline" className={EMAIL_STATUS_STYLE[status] || 'bg-muted text-muted-foreground'}>
      {status}
    </Badge>
  );
}

const ONBOARD_STYLE: Record<string, string> = {
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  duplicate: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  skipped: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  failed: 'bg-red-500/15 text-red-400 border-red-500/30',
};

// Rank email statuses so the "latest meaningful" one wins when a recipient has
// multiple sends for the welcome template.
const EMAIL_RANK: Record<string, number> = {
  queued: 1, sent: 2, delivered: 3, opened: 4, clicked: 5,
  bounced: 3, complained: 3, failed: 1,
};

export default function AdminOnboardingStatus() {
  const [search, setSearch] = useState('');
  const [editionFilter, setEditionFilter] = useState('all');
  const [emailFilter, setEmailFilter] = useState('all');

  // Students (non-admin profiles)
  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ['onboarding-status-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, payment_status, edition_id, kyf_completed')
        .eq('is_admin', false)
        .order('full_name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: editions = [] } = useQuery({
    queryKey: ['onboarding-status-editions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('editions').select('id, name');
      if (error) throw error;
      return data || [];
    },
  });

  // The welcome template id (slug = student-welcome)
  const { data: welcomeTemplate } = useQuery({
    queryKey: ['onboarding-status-welcome-template'],
    queryFn: async () => {
      const { data } = await supabase
        .from('email_templates')
        .select('id')
        .eq('slug', 'student-welcome')
        .maybeSingle();
      return data;
    },
  });

  // Welcome-email sends for that template
  const { data: emailSends = [] } = useQuery({
    queryKey: ['onboarding-status-email-sends', welcomeTemplate?.id],
    enabled: !!welcomeTemplate?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_sends')
        .select('recipient_email, recipient_user_id, status, sent_at')
        .eq('template_id', welcomeTemplate.id);
      if (error) throw error;
      return data || [];
    },
  });

  // Onboarding automation logs
  const { data: logs = [] } = useQuery({
    queryKey: ['onboarding-status-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_automation_logs')
        .select('student_email, created_profile_id, status, email_sent, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Index lookups
  const editionName = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of editions) m.set(e.id, e.name);
    return m;
  }, [editions]);

  // Best email status per recipient (by user id or email)
  const emailByRecipient = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of emailSends) {
      const keys = [s.recipient_user_id, (s.recipient_email || '').toLowerCase()].filter(Boolean);
      for (const k of keys) {
        const prev = m.get(k);
        if (!prev || (EMAIL_RANK[s.status] ?? 0) >= (EMAIL_RANK[prev] ?? 0)) m.set(k, s.status);
      }
    }
    return m;
  }, [emailSends]);

  // Latest onboarding log per student email (logs already sorted desc)
  const logByEmail = useMemo(() => {
    const m = new Map<string, any>();
    for (const l of logs) {
      const k = (l.student_email || '').toLowerCase();
      if (k && !m.has(k)) m.set(k, l);
    }
    return m;
  }, [logs]);

  const rows = useMemo(() => {
    return profiles.map((p: any) => {
      const email = (p.email || '').toLowerCase();
      const emailStatus = emailByRecipient.get(p.id) || emailByRecipient.get(email) || null;
      const log = logByEmail.get(email);
      const isPaid = p.payment_status === 'CONFIRMED_15K' || p.payment_status === 'BALANCE_PAID';
      const isWaitlisted = !p.edition_id && isPaid;
      return {
        ...p,
        editionLabel: p.edition_id ? (editionName.get(p.edition_id) || 'Unknown') : null,
        emailStatus,
        onboardStatus: log?.status || null,
        isWaitlisted,
      };
    });
  }, [profiles, emailByRecipient, logByEmail, editionName]);

  const filtered = useMemo(() => {
    return rows.filter((r: any) => {
      if (editionFilter !== 'all') {
        if (editionFilter === 'waitlist' ? !r.isWaitlisted : r.edition_id !== editionFilter) return false;
      }
      if (emailFilter !== 'all') {
        if (emailFilter === 'none' ? r.emailStatus : r.emailStatus !== emailFilter) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!(`${r.full_name || ''} ${r.email || ''}`.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [rows, editionFilter, emailFilter, search]);

  // Summary stats
  const stats = useMemo(() => {
    const total = rows.length;
    const mailed = rows.filter((r: any) => r.emailStatus && r.emailStatus !== 'failed').length;
    const notMailed = rows.filter((r: any) => !r.emailStatus).length;
    const waitlist = rows.filter((r: any) => r.isWaitlisted).length;
    return { total, mailed, notMailed, waitlist };
  }, [rows]);

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Onboarding &amp; Email Status</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Who's onboarded, who got the welcome email, and who's waitlisted — in one place.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Students" value={stats.total} />
        <StatCard icon={MailCheck} label="Welcome sent" value={stats.mailed} tone="emerald" />
        <StatCard icon={MailX} label="Not emailed" value={stats.notMailed} tone="amber" />
        <StatCard icon={Clock} label="Waitlisted" value={stats.waitlist} tone="sky" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="pl-8"
          />
        </div>
        <Select value={editionFilter} onValueChange={setEditionFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All editions</SelectItem>
            <SelectItem value="waitlist">Waitlisted</SelectItem>
            {editions.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={emailFilter} onValueChange={setEmailFilter}>
          <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any email status</SelectItem>
            <SelectItem value="none">Not sent</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="opened">Opened</SelectItem>
            <SelectItem value="bounced">Bounced</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {loadingProfiles ? 'Loading…' : `${filtered.length} student${filtered.length === 1 ? '' : 's'}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Edition</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Onboarded</TableHead>
                <TableHead>Welcome email</TableHead>
                <TableHead>KYF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium">{r.full_name || '—'}</div>
                    <div className="text-xs text-muted-foreground">{r.email}</div>
                  </TableCell>
                  <TableCell>
                    {r.editionLabel
                      ? <span className="text-sm">{r.editionLabel}</span>
                      : r.isWaitlisted
                        ? <Badge variant="outline" className="bg-sky-500/15 text-sky-400 border-sky-500/30">Waitlist</Badge>
                        : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>{paymentBadge(r.payment_status)}</TableCell>
                  <TableCell>
                    {r.onboardStatus
                      ? <Badge variant="outline" className={ONBOARD_STYLE[r.onboardStatus] || 'bg-muted text-muted-foreground'}>{r.onboardStatus}</Badge>
                      : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>{emailBadge(r.emailStatus)}</TableCell>
                  <TableCell>
                    {r.kyf_completed
                      ? <Badge variant="outline" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Done</Badge>
                      : <span className="text-xs text-muted-foreground">Pending</span>}
                  </TableCell>
                </TableRow>
              ))}
              {!loadingProfiles && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    No students match these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, tone = 'default',
}: { icon: React.ElementType; label: string; value: number; tone?: 'default' | 'emerald' | 'amber' | 'sky' }) {
  const toneClass = {
    default: 'text-foreground',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    sky: 'text-sky-400',
  }[tone];
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <Icon className={`h-5 w-5 ${toneClass}`} />
        <div>
          <div className={`text-2xl font-bold ${toneClass}`}>{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
