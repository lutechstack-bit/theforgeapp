import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase as supabaseTyped } from '@/integrations/supabase/client';
import { editionLabel } from '@/lib/editions';
const supabase = supabaseTyped as any;
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  RefreshCw, Search, AlertTriangle, Download, FileSpreadsheet,
  Info, Settings, ExternalLink, CheckCircle2, XCircle, Clock,
  MinusCircle, UserPlus, Mail, Loader2, ChevronRight, Zap,
} from 'lucide-react';
import { toast } from 'sonner';

// ── Constants ──────────────────────────────────────────────────────────────────

const SHEET_ID_KEY   = 'forge_sheet_id';
const SHEET_NAME_KEY = 'forge_sheet_name';

// ── Types ──────────────────────────────────────────────────────────────────────

interface SheetRow   { [key: string]: string }
interface SheetData  { headers: string[]; rows: SheetRow[] }
interface Edition    { id: string; name: string; cohort_type: string; is_archived: boolean }
interface ColMap     { name: string; email: string; phone: string; city: string }

interface OnboardResult {
  row: SheetRow;
  name: string;
  email: string;
  status: 'success' | 'failed' | 'duplicate';
  error?: string;
  userId?: string;
}

// ── gviz parser ───────────────────────────────────────────────────────────────

function parseGvizResponse(text: string): SheetData {
  const stripped = text.replace(/^[^(]*\(/, '').replace(/\);?\s*$/, '');
  const json = JSON.parse(stripped);
  if (json.status === 'error') {
    const reason = json.errors?.[0]?.detailed_message || json.errors?.[0]?.message || 'Unknown error';
    throw new Error(reason);
  }
  const cols: { label: string }[] = json.table?.cols ?? [];
  const rows: { c: ({ v: unknown; f?: string } | null)[] }[] = json.table?.rows ?? [];
  const headers = cols.map(c => c.label || '');
  const parsed: SheetRow[] = rows.map(row => {
    const obj: SheetRow = {};
    (row.c ?? []).forEach((cell, i) => {
      const h = headers[i] ?? `col${i}`;
      if (!cell || cell.v == null) { obj[h] = ''; return; }
      if (typeof cell.v === 'string' && cell.v.startsWith('Date(')) {
        const parts = cell.v.replace('Date(', '').replace(')', '').split(',').map(Number);
        const d = new Date(parts[0], parts[1], parts[2]);
        obj[h] = cell.f ?? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      } else {
        obj[h] = cell.f ?? String(cell.v);
      }
    });
    return obj;
  });
  return { headers, rows: parsed.filter(r => Object.values(r).some(v => v.trim() !== '')) };
}

async function fetchSheetData(sheetId: string, sheetName: string): Promise<SheetData> {
  const params = new URLSearchParams({ tqx: 'out:json' });
  if (sheetName) params.set('sheet', sheetName);
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Sheets returned ${res.status} — make sure it's shared publicly`);
  const text = await res.text();
  if (text.includes('__LOGIN__') || text.includes('accounts.google.com'))
    throw new Error('Sheet is private — share it as "Anyone with the link can view"');
  return parseGvizResponse(text);
}

// ── Auto-detect column mapping from headers ───────────────────────────────────

function guessColMap(headers: string[]): ColMap {
  const find = (patterns: RegExp) => headers.find(h => patterns.test(h)) ?? '';
  return {
    name:  find(/full.?name|student.?name|name/i),
    email: find(/email|mail/i),
    phone: find(/phone|mobile|contact/i),
    city:  find(/city|location|place/i),
  };
}

// ── Status badge ───────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { cls: string; icon: React.ElementType }> = {
  completed:  { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  deferred:   { cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30',       icon: Clock },
  'drop-out': { cls: 'bg-red-500/15 text-red-400 border-red-500/30',             icon: XCircle },
  dnp:        { cls: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',          icon: MinusCircle },
};

function StatusBadge({ value }: { value: string }) {
  const key = value.toLowerCase().trim();
  const cfg = STATUS_CFG[key];
  if (!cfg) return <span className="text-sm">{value || '—'}</span>;
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={`gap-1 text-[11px] ${cfg.cls}`}>
      <Icon className="h-3 w-3" />{value}
    </Badge>
  );
}

const isAmountCol = (h: string) => /amount|payment|price|fee/i.test(h);
const isEmailCol  = (h: string) => /email|mail/i.test(h);
const isPhoneCol  = (h: string) => /phone|mobile|contact/i.test(h);
const isStatusCol = (h: string) => /^status$/i.test(h.trim());

function CellValue({ value, header }: { value: string; header: string }) {
  if (isStatusCol(header)) return <StatusBadge value={value} />;
  if (!value) return <span className="text-muted-foreground/40">—</span>;
  if (isAmountCol(header)) {
    const n = parseFloat(value.replace(/[₹,\s]/g, ''));
    if (!isNaN(n)) return <span className="font-mono text-emerald-400">₹{n.toLocaleString('en-IN')}</span>;
  }
  if (isEmailCol(header)) return <a href={`mailto:${value}`} className="text-primary hover:underline text-sm" onClick={e => e.stopPropagation()}>{value}</a>;
  if (isPhoneCol(header)) return <span className="font-mono text-sm">{value}</span>;
  return <span className="text-sm">{value}</span>;
}

// ── Sheet config panel ────────────────────────────────────────────────────────

function SheetConfig({ sheetId, sheetName, onSave }: {
  sheetId: string; sheetName: string; onSave: (id: string, name: string) => void;
}) {
  const [id, setId]     = useState(sheetId);
  const [name, setName] = useState(sheetName);
  return (
    <Card className="border-blue-500/20 bg-blue-500/5">
      <CardContent className="p-5 space-y-4">
        <p className="font-semibold text-sm flex items-center gap-2">
          <Settings className="h-4 w-4 text-blue-400" /> Connect your Google Sheet
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Sheet ID</Label>
            <Input value={id} onChange={e => setId(e.target.value.trim())}
              placeholder="1BxiMVs0XRA5n…" className="font-mono text-xs" />
            <p className="text-[11px] text-muted-foreground">
              From: …/spreadsheets/d/<strong className="text-blue-400">THIS-PART</strong>/edit
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tab name <span className="text-muted-foreground">(optional)</span></Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Sheet1" className="text-xs" />
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button size="sm" onClick={() => onSave(id, name)} disabled={!id.trim()}>Connect Sheet</Button>
          <p className="text-[11px] text-amber-400/80 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Must be shared as "Anyone with the link can view"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Onboard Dialog ─────────────────────────────────────────────────────────────

function OnboardDialog({
  open, onOpenChange, selectedRows, headers, editions,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selectedRows: SheetRow[];
  headers: string[];
  editions: Edition[];
}) {
  const navigate = useNavigate();
  const [editionId, setEditionId]   = useState('');
  const [colMap, setColMap]         = useState<ColMap>(() => guessColMap(headers));
  const [results, setResults]       = useState<OnboardResult[] | null>(null);
  const [step, setStep]             = useState<'config' | 'done'>('config');

  const onboardMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const out: OnboardResult[] = [];

      for (const row of selectedRows) {
        const colVal = (col: string) => (col && col !== '__skip__' ? row[col]?.trim() : '') || '';
        const name  = colVal(colMap.name);
        const email = colVal(colMap.email).toLowerCase();
        const phone = colVal(colMap.phone);
        const city  = colVal(colMap.city);

        if (!email) {
          out.push({ row, name, email, status: 'failed', error: 'No email found in selected column' });
          continue;
        }

        // Temp password = Firstname@Forge!  (matches the welcome-email convention).
        const firstName = (name || '').trim().split(/\s+/)[0] || 'Student';
        const password = `${firstName.charAt(0).toUpperCase()}${firstName.slice(1).toLowerCase()}@Forge!`;

        try {
          const res = await supabase.functions.invoke('create-user', {
            body: {
              full_name: name,
              email,
              phone,
              city,
              password,
              edition_id: editionId || undefined,
              payment_status: 'CONFIRMED_15K',
            },
          });

          if (res.error || res.data?.error) {
            const msg = res.data?.error || res.error?.message || 'Unknown error';
            if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('exists')) {
              out.push({ row, name, email, status: 'duplicate', error: msg });
            } else {
              out.push({ row, name, email, status: 'failed', error: msg });
            }
          } else {
            out.push({ row, name, email, status: 'success', userId: res.data?.user?.id });
          }
        } catch (e: any) {
          out.push({ row, name, email, status: 'failed', error: e.message });
        }
      }

      return out;
    },
    onSuccess: (data) => {
      setResults(data);
      setStep('done');
      const success = data.filter(r => r.status === 'success').length;
      const failed  = data.filter(r => r.status === 'failed').length;
      if (success > 0) toast.success(`${success} student${success !== 1 ? 's' : ''} onboarded!`);
      if (failed  > 0) toast.error(`${failed} failed — check results`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleEmailThem = () => {
    const emails = (results || [])
      .filter(r => r.status === 'success' || r.status === 'duplicate')
      .map(r => r.email)
      .filter(Boolean)
      .join(',');
    onOpenChange(false);
    navigate(`/admin/email/send?recipientEmails=${encodeURIComponent(emails)}`);
  };

  // Reset when dialog opens
  const handleOpen = (v: boolean) => {
    if (v) { setStep('config'); setResults(null); setColMap(guessColMap(headers)); setEditionId(''); }
    onOpenChange(v);
  };

  const canProceed = colMap.email && colMap.email !== '__skip__' && editionId;

  const ColSelect = ({ field, label }: { field: keyof ColMap; label: string }) => (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={colMap[field] || '__skip__'} onValueChange={v => setColMap(prev => ({ ...prev, [field]: v === '__skip__' ? '' : v }))}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="— skip —" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__skip__">— skip —</SelectItem>
          {headers.filter(h => h.trim()).map(h => <SelectItem key={h} value={h} className="text-xs">{h}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Onboard {selectedRows.length} student{selectedRows.length !== 1 ? 's' : ''} from Sheet
          </DialogTitle>
        </DialogHeader>

        {step === 'config' && (
          <div className="space-y-5">

            {/* Column mapping */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Map sheet columns → student fields</p>
              <p className="text-xs text-muted-foreground">We auto-detected these — adjust if wrong.</p>
              <div className="grid grid-cols-2 gap-2">
                <ColSelect field="name"  label="Full name *" />
                <ColSelect field="email" label="Email *" />
                <ColSelect field="phone" label="Phone" />
                <ColSelect field="city"  label="City" />
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Preview — first selected student</p>
              <div className="bg-muted/30 rounded p-3 text-xs space-y-1 font-mono">
                {(['name','email','phone','city'] as (keyof ColMap)[]).map(f => (
                  colMap[f] && colMap[f] !== '__skip__' ? (
                    <div key={f} className="flex gap-2">
                      <span className="text-muted-foreground w-12">{f}:</span>
                      <span className="text-foreground truncate">{selectedRows[0]?.[colMap[f]] || '—'}</span>
                    </div>
                  ) : null
                ))}
              </div>
            </div>

            {/* Edition */}
            <div className="space-y-1.5">
              <Label className="text-sm">Assign to edition *</Label>
              <Select value={editionId} onValueChange={setEditionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick an edition…" />
                </SelectTrigger>
                <SelectContent>
                  {editions.filter(e => !e.is_archived).map(e => (
                    <SelectItem key={e.id} value={e.id}>{editionLabel(e)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!colMap.email && (
              <p className="text-xs text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Select the Email column — it's required.
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button
                size="sm"
                className="gap-2"
                disabled={!canProceed || onboardMutation.isPending}
                onClick={() => onboardMutation.mutate()}
              >
                {onboardMutation.isPending
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating accounts…</>
                  : <><UserPlus className="h-4 w-4" /> Onboard {selectedRows.length} student{selectedRows.length !== 1 ? 's' : ''}</>}
              </Button>
            </div>
          </div>
        )}

        {step === 'done' && results && (
          <div className="space-y-4">
            {/* Results list */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {results.map((r, i) => (
                <div key={i} className={`flex items-start gap-3 rounded p-2.5 text-sm ${
                  r.status === 'success'   ? 'bg-emerald-500/10 border border-emerald-500/20' :
                  r.status === 'duplicate' ? 'bg-amber-500/10 border border-amber-500/20' :
                  'bg-red-500/10 border border-red-500/20'
                }`}>
                  {r.status === 'success'   && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />}
                  {r.status === 'duplicate' && <Clock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />}
                  {r.status === 'failed'    && <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />}
                  <div className="min-w-0">
                    <p className="font-medium truncate">{r.name || r.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                    {r.status === 'duplicate' && <p className="text-xs text-amber-400">Already has an account</p>}
                    {r.status === 'failed'    && <p className="text-xs text-red-400">{r.error}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary + CTA */}
            <div className="flex items-center justify-between pt-1 border-t">
              <div className="text-xs text-muted-foreground">
                {results.filter(r => r.status === 'success').length} created ·{' '}
                {results.filter(r => r.status === 'duplicate').length} already exist ·{' '}
                {results.filter(r => r.status === 'failed').length} failed
              </div>
              <Button
                size="sm"
                className="gap-2"
                onClick={handleEmailThem}
                disabled={results.every(r => r.status === 'failed')}
              >
                <Mail className="h-4 w-4" />
                Email them now
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

const ALL = '__all__';

// Auto-detect columns by purpose
function guessProductCol(headers: string[]): string {
  return headers.find(h => /^product$/i.test(h.trim())) ??
         headers.find(h => /product|program|course|cohort/i.test(h)) ?? '';
}
function guessBatchCol(headers: string[]): string {
  return headers.find(h => /^batch$/i.test(h.trim())) ??
         headers.find(h => /batch|edition/i.test(h)) ?? '';
}

const PRODUCT_LABELS: Record<string, string> = {
  FFM: 'Filmmaking', FC: 'Creators', FW: 'Writing',
};
const productLabel = (code: string) => PRODUCT_LABELS[code?.toUpperCase()] ?? code;

export default function AdminSheetViewer() {
  const [sheetId, setSheetId]       = useState(() => localStorage.getItem(SHEET_ID_KEY) ?? '');
  const [sheetName, setSheetName]   = useState(() => localStorage.getItem(SHEET_NAME_KEY) ?? '');
  const [showConfig, setShowConfig] = useState(!localStorage.getItem(SHEET_ID_KEY));
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter]   = useState(ALL);
  const [editionFilter, setEditionFilter] = useState(ALL); // 'ALL' | edition_id | '__none__'
  const [productFilter, setProductFilter] = useState(ALL); // FFM / FC / FW
  const [batchFilter, setBatchFilter]     = useState(ALL); // E6 / E17 / etc.
  const [productCol, setProductCol]       = useState('');
  const [batchCol, setBatchCol]           = useState('');
  // keep cohortFilter/cohortCol as aliases for backwards-compat with filteredRows
  const cohortFilter = ALL; // unused — replaced by productFilter + batchFilter
  const cohortCol    = '';  // unused
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedIdxs, setSelectedIdxs] = useState<Set<number>>(new Set());
  const [onboardOpen, setOnboardOpen]   = useState(false);

  const canFetch = !!sheetId.trim();

  const { data, isLoading, error, isFetching } = useQuery<SheetData, Error>({
    queryKey: ['sheet-data', sheetId, sheetName, refreshKey],
    queryFn: () => fetchSheetData(sheetId, sheetName),
    enabled: canFetch,
    staleTime: 120_000,
    retry: 1,
  });

  const { data: editions = [] } = useQuery<Edition[]>({
    queryKey: ['editions-all-viewer'],
    queryFn: async () => {
      const { data, error } = await supabase.from('editions').select('id,name,cohort_type,is_archived').order('forge_start_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Load all enrolled users (email + edition_id) for cross-reference
  const { data: appUsers = [] } = useQuery<{ email: string; edition_id: string | null }[]>({
    queryKey: ['sheet-viewer-app-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('email, edition_id')
        .or('is_admin.is.null,is_admin.eq.false');
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  // Build lookup: lowercase email → edition_id
  const emailToEdition = useMemo(() => {
    const map = new Map<string, string | null>();
    appUsers.forEach(u => { if (u.email) map.set(u.email.toLowerCase().trim(), u.edition_id); });
    return map;
  }, [appUsers]);

  const headers  = data?.headers ?? [];
  const allRows  = data?.rows    ?? [];
  const statusHeader = headers.find(h => isStatusCol(h));
  const emailHeader  = headers.find(h => isEmailCol(h));

  // Auto-detect product + batch columns when headers load
  useMemo(() => {
    if (!headers.length) return;
    if (!productCol) { const d = guessProductCol(headers); if (d) setProductCol(d); }
    if (!batchCol)   { const d = guessBatchCol(headers);   if (d) setBatchCol(d); }
  }, [headers]);

  const uniqueStatuses = useMemo(() => {
    if (!statusHeader) return [];
    return [...new Set(allRows.map(r => r[statusHeader]?.trim()).filter(Boolean))].sort();
  }, [allRows, statusHeader]);

  // Unique product codes (FFM / FC / FW) and batch values (E6 / E17...)
  const uniqueProducts = useMemo(() => {
    if (!productCol) return [] as string[];
    return [...new Set(allRows.map(r => r[productCol]?.trim().toUpperCase()).filter(Boolean))].sort();
  }, [allRows, productCol]);

  const uniqueBatches = useMemo(() => {
    if (!batchCol) return [] as string[];
    // Filter by current product selection first so batches are relevant
    const base = productFilter !== ALL && productCol
      ? allRows.filter(r => r[productCol]?.trim().toUpperCase() === productFilter)
      : allRows;
    return [...new Set(base.map(r => r[batchCol]?.trim()).filter(Boolean))].sort((a, b) => {
      // Sort batch codes: numeric part ascending, then alpha
      const na = parseInt(a.replace(/\D/g, '')) || 0;
      const nb = parseInt(b.replace(/\D/g, '')) || 0;
      return na !== nb ? na - nb : a.localeCompare(b);
    });
  }, [allRows, batchCol, productCol, productFilter]);

  const filteredRows = useMemo(() => {
    let rows = allRows;

    // Edition filter — cross-reference sheet email against enrolled users
    if (editionFilter !== ALL && emailHeader) {
      if (editionFilter === '__none__') {
        // "Not in app" — email not found in any enrolled user
        rows = rows.filter(r => {
          const email = r[emailHeader]?.toLowerCase().trim();
          return email ? !emailToEdition.has(email) : true;
        });
      } else {
        rows = rows.filter(r => {
          const email = r[emailHeader]?.toLowerCase().trim();
          return email ? emailToEdition.get(email) === editionFilter : false;
        });
      }
    }

    // Status filter
    if (statusFilter !== ALL && statusHeader)
      rows = rows.filter(r => r[statusHeader]?.trim().toLowerCase() === statusFilter.toLowerCase());

    // Product filter (FFM / FC / FW)
    if (productFilter !== ALL && productCol)
      rows = rows.filter(r => r[productCol]?.trim().toUpperCase() === productFilter);
    // Batch filter (E6 / E17 / ...)
    if (batchFilter !== ALL && batchCol)
      rows = rows.filter(r => r[batchCol]?.trim() === batchFilter);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(r => Object.values(r).some(v => v.toLowerCase().includes(q)));
    }
    return rows;
  }, [allRows, emailHeader, emailToEdition, editionFilter, statusHeader, statusFilter, productCol, productFilter, batchCol, batchFilter, search]);

  // Counts per status (on the unfiltered full set)
  const statusCounts = useMemo(() => {
    if (!statusHeader) return {} as Record<string, number>;
    const c: Record<string, number> = {};
    allRows.forEach(r => { const s = r[statusHeader]?.trim(); if (s) c[s] = (c[s] ?? 0) + 1; });
    return c;
  }, [allRows, statusHeader]);

  // Counts per product/batch (on unfiltered full set)
  const productCounts = useMemo(() => {
    const c: Record<string, number> = {};
    if (productCol) allRows.forEach(r => { const s = r[productCol]?.trim().toUpperCase(); if (s) c[s] = (c[s] ?? 0) + 1; });
    return c;
  }, [allRows, productCol]);

  const batchCounts = useMemo(() => {
    const c: Record<string, number> = {};
    if (batchCol) {
      // Count within current product filter
      const base = productFilter !== ALL && productCol
        ? allRows.filter(r => r[productCol]?.trim().toUpperCase() === productFilter)
        : allRows;
      base.forEach(r => { const s = r[batchCol]?.trim(); if (s) c[s] = (c[s] ?? 0) + 1; });
    }
    return c;
  }, [allRows, batchCol, productCol, productFilter]);

  // Selection helpers — indices are relative to filteredRows
  const toggleRow = (idx: number) => {
    setSelectedIdxs(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };
  const toggleAll = () => {
    if (selectedIdxs.size === filteredRows.length && filteredRows.length > 0) {
      setSelectedIdxs(new Set());
    } else {
      setSelectedIdxs(new Set(filteredRows.map((_, i) => i)));
    }
  };
  const isAllSelected  = filteredRows.length > 0 && selectedIdxs.size === filteredRows.length;
  const isSomeSelected = selectedIdxs.size > 0 && selectedIdxs.size < filteredRows.length;
  const selectedRows   = Array.from(selectedIdxs).map(i => filteredRows[i]).filter(Boolean);

  const handleSaveConfig = (id: string, name: string) => {
    localStorage.setItem(SHEET_ID_KEY, id);
    localStorage.setItem(SHEET_NAME_KEY, name);
    setSheetId(id); setSheetName(name);
    setShowConfig(false);
    setRefreshKey(k => k + 1);
  };

  // Per-edition count of sheet rows (by email cross-reference)
  const editionRowCounts = useMemo(() => {
    if (!emailHeader) return new Map<string, number>();
    const counts = new Map<string, number>();
    counts.set('__none__', 0);
    allRows.forEach(r => {
      const email = r[emailHeader]?.toLowerCase().trim();
      const edId  = email ? emailToEdition.get(email) : undefined;
      if (edId) counts.set(edId, (counts.get(edId) ?? 0) + 1);
      else      counts.set('__none__', (counts.get('__none__') ?? 0) + 1);
    });
    return counts;
  }, [allRows, emailHeader, emailToEdition]);

  // Only show edition chips that have at least 1 matching sheet row
  const activeEditions = useMemo(
    () => editions.filter(e => (editionRowCounts.get(e.id) ?? 0) > 0),
    [editions, editionRowCounts],
  );

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
    setSelectedIdxs(new Set());
    setStatusFilter(ALL);
    setEditionFilter(ALL);
    setProductFilter(ALL);
    setBatchFilter(ALL);
    toast.info('Refreshing…');
  };;

  const handleDownloadCSV = () => {
    const csvLines = [headers.join(','), ...filteredRows.map(row =>
      headers.map(h => `"${(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
    )];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `forge-sheet-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1400px]">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-emerald-400" />
            Google Sheet Viewer
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Select students from your sheet and onboard them directly
            {allRows.length > 0 && <span className="ml-2 text-muted-foreground/50 text-xs">— {allRows.length} rows</span>}
            {sheetName && <span className="ml-2 text-blue-400/70 text-xs">tab: {sheetName}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setShowConfig(v => !v)} className="gap-2">
            <Settings className="h-3.5 w-3.5" />{sheetId ? 'Change Sheet' : 'Connect Sheet'}
          </Button>
          {canFetch && data && (
            <>
              <Button variant="outline" size="sm" onClick={handleDownloadCSV} disabled={filteredRows.length === 0} className="gap-2">
                <Download className="h-3.5 w-3.5" />Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isFetching} className="gap-2">
                <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />Refresh
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Config */}
      {showConfig && <SheetConfig sheetId={sheetId} sheetName={sheetName} onSave={handleSaveConfig} />}

      {/* No sheet */}
      {!canFetch && !showConfig && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center space-y-3">
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground">Connect your Google Sheet to get started</p>
            <Button size="sm" onClick={() => setShowConfig(true)} className="gap-2">
              <Settings className="h-3.5 w-3.5" />Connect Sheet
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {isLoading && canFetch && (
        <Card><CardContent className="p-8 flex items-center justify-center gap-3 text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin" /><span className="text-sm">Fetching sheet data…</span>
        </CardContent></Card>
      )}

      {/* Error */}
      {error && !isLoading && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div><p className="font-semibold text-sm text-amber-300">Could not load sheet</p>
                <p className="text-xs text-muted-foreground">{error.message}</p></div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2"><RefreshCw className="h-3.5 w-3.5" />Try again</Button>
              <Button variant="outline" size="sm" onClick={() => setShowConfig(true)} className="gap-2"><Settings className="h-3.5 w-3.5" />Change Sheet</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Edition filter (cross-referenced with enrolled app users) ── */}
      {canFetch && !isLoading && data && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Filter by Edition</p>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setEditionFilter(ALL)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${editionFilter === ALL ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-foreground/30'}`}>
              All ({allRows.length})
            </button>
            {activeEditions.map(e => (
              <button key={e.id} onClick={() => setEditionFilter(editionFilter === e.id ? ALL : e.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${editionFilter === e.id ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-semibold' : 'border-border text-muted-foreground hover:border-foreground/30'}`}>
                {editionLabel(e)} ({editionRowCounts.get(e.id) ?? 0})
              </button>
            ))}
            {(editionRowCounts.get('__none__') ?? 0) > 0 && (
              <button onClick={() => setEditionFilter(editionFilter === '__none__' ? ALL : '__none__')}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${editionFilter === '__none__' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold' : 'border-border text-muted-foreground hover:border-foreground/30'}`}>
                🔴 Not in app ({editionRowCounts.get('__none__') ?? 0})
              </button>
            )}
          </div>
          {activeEditions.length === 0 && emailHeader && (
            <p className="text-[11px] text-muted-foreground/60">
              None of these {allRows.length} students have app accounts yet — they all show under "Not in app".
              Once onboarded, their edition chips will appear here.
            </p>
          )}
          {!emailHeader && (
            <p className="text-[11px] text-amber-400/80">No email column detected — edition cross-reference unavailable.</p>
          )}
        </div>
      )}

      {/* ── Cohort (Product) filter ── */}
      {(uniqueProducts.length > 0 || canFetch) && !isLoading && data && (
        <div className="space-y-3">
          {/* Row 1: Cohort type */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cohort</p>
              {headers.filter(h => h.trim()).length > 0 && (
                <Select value={productCol || '__placeholder__'} onValueChange={v => { if (v !== '__placeholder__') { setProductCol(v); setProductFilter(ALL); setBatchFilter(ALL); } }}>
                  <SelectTrigger className="h-5 w-auto text-[10px] border-none bg-transparent text-muted-foreground/40 px-1 gap-0.5">
                    <SelectValue placeholder="col?" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.filter(h => h.trim()).map(h => <SelectItem key={h} value={h} className="text-xs">{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => { setProductFilter(ALL); setBatchFilter(ALL); }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${productFilter === ALL ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-foreground/30'}`}>
                All
              </button>
              {uniqueProducts.map(p => (
                <button key={p} onClick={() => { setProductFilter(productFilter === p ? ALL : p); setBatchFilter(ALL); }}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${productFilter === p ? 'bg-violet-500/20 text-violet-300 border-violet-500/40' : 'border-border text-muted-foreground hover:border-foreground/30'}`}>
                  {productLabel(p)} ({productCounts[p] ?? 0})
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Batch — only when a cohort is selected or batches exist */}
          {uniqueBatches.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Batch / Edition</p>
                {headers.filter(h => h.trim()).length > 0 && (
                  <Select value={batchCol || '__placeholder__'} onValueChange={v => { if (v !== '__placeholder__') { setBatchCol(v); setBatchFilter(ALL); } }}>
                    <SelectTrigger className="h-5 w-auto text-[10px] border-none bg-transparent text-muted-foreground/40 px-1 gap-0.5">
                      <SelectValue placeholder="col?" />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.filter(h => h.trim()).map(h => <SelectItem key={h} value={h} className="text-xs">{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => setBatchFilter(ALL)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${batchFilter === ALL ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-foreground/30'}`}>
                  All
                </button>
                {uniqueBatches.map(b => (
                  <button key={b} onClick={() => setBatchFilter(batchFilter === b ? ALL : b)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${batchFilter === b ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold' : 'border-border text-muted-foreground hover:border-foreground/30'}`}>
                    {productFilter !== ALL ? `${productLabel(productFilter)} ` : ''}{b} ({batchCounts[b] ?? 0})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Status chips ── */}
      {uniqueStatuses.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</p>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setStatusFilter(ALL)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${statusFilter === ALL ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-foreground/30'}`}>
              All
            </button>
            {uniqueStatuses.map(s => {
              const cfg = STATUS_CFG[s.toLowerCase().trim()];
              return (
                <button key={s} onClick={() => setStatusFilter(statusFilter === s ? ALL : s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${statusFilter === s ? (cfg?.cls ?? '') + ' font-semibold' : 'border-border text-muted-foreground hover:border-foreground/30'}`}>
                  {s} ({statusCounts[s] ?? 0})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search */}
      {canFetch && !isLoading && data && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input placeholder="Search name, email, phone…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          {selectedIdxs.size > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedIdxs.size} selected
            </Badge>
          )}
        </div>
      )}

      {/* Main table */}
      {canFetch && !isLoading && data && headers.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 text-center sticky left-0 bg-muted/50">
                    <Checkbox
                      checked={isAllSelected}
                      ref={el => { if (el) (el as any).indeterminate = isSomeSelected; }}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead className="w-8 text-xs text-muted-foreground font-normal">#</TableHead>
                  {headers.map(h => (
                    <TableHead key={h} className="whitespace-nowrap text-xs font-semibold">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={headers.length + 2} className="text-center text-muted-foreground py-12 text-sm">
                      No rows match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row, idx) => {
                    const selected = selectedIdxs.has(idx);
                    return (
                      <TableRow
                        key={idx}
                        className={`cursor-pointer transition-colors ${selected ? 'bg-primary/8 hover:bg-primary/12' : 'hover:bg-muted/30'}`}
                        onClick={() => toggleRow(idx)}
                      >
                        <TableCell className="text-center sticky left-0 bg-inherit" onClick={e => e.stopPropagation()}>
                          <Checkbox checked={selected} onCheckedChange={() => toggleRow(idx)} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground/50 font-mono">{idx + 1}</TableCell>
                        {headers.map(h => (
                          <TableCell key={h} className="max-w-[220px] truncate">
                            <CellValue value={row[h] ?? ''} header={h} />
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className="px-4 py-2 border-t text-[11px] text-muted-foreground/50 flex items-center gap-1.5">
            <Info className="h-3 w-3" />
            {filteredRows.length} of {allRows.length} rows · Click a row to select · Data fetched live from Google Sheets
          </div>
        </Card>
      )}

      {/* Floating action bar when rows are selected */}
      {selectedIdxs.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-card border border-border shadow-2xl animate-in slide-in-from-bottom-4">
          <span className="text-sm font-semibold">{selectedIdxs.size} student{selectedIdxs.size !== 1 ? 's' : ''} selected</span>
          <div className="w-px h-6 bg-border" />
          <Button
            size="sm"
            className="gap-2 bg-primary hover:bg-primary/90"
            onClick={() => setOnboardOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            Onboard + Email
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setSelectedIdxs(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* Onboard dialog */}
      <OnboardDialog
        open={onboardOpen}
        onOpenChange={setOnboardOpen}
        selectedRows={selectedRows}
        headers={headers}
        editions={editions}
      />
    </div>
  );
}
