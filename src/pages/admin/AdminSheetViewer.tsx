import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  RefreshCw, Search, AlertTriangle, Download,
  FileSpreadsheet, Info, Settings, ExternalLink, CheckCircle2,
  XCircle, Clock, MinusCircle,
} from 'lucide-react';
import { toast } from 'sonner';

// ── Constants ──────────────────────────────────────────────────────────────────

const SHEET_ID_KEY = 'forge_sheet_id';
const SHEET_NAME_KEY = 'forge_sheet_name';

// ── Types ──────────────────────────────────────────────────────────────────────

interface SheetRow {
  [key: string]: string;
}

interface SheetData {
  headers: string[];
  rows: SheetRow[];
}

// ── Google Sheets gviz JSON parser ─────────────────────────────────────────────
// gviz returns a JS callback wrapper: google.visualization.Query.setResponse({...});
// We strip the wrapper, parse the inner JSON, then map cols/rows.

function parseGvizResponse(text: string): SheetData {
  // Strip JSONP wrapper
  const stripped = text
    .replace(/^[^(]*\(/, '')  // Remove everything up to first (
    .replace(/\);?\s*$/, ''); // Remove trailing );

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
      const header = headers[i] ?? `col${i}`;
      if (!cell || cell.v === null || cell.v === undefined) {
        obj[header] = '';
      } else if (typeof cell.v === 'string' && cell.v.startsWith('Date(')) {
        // Parse Date(year, month0, day)
        const parts = cell.v.replace('Date(', '').replace(')', '').split(',').map(Number);
        const d = new Date(parts[0], parts[1], parts[2]);
        obj[header] = cell.f ?? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      } else {
        obj[header] = cell.f ?? String(cell.v);
      }
    });
    return obj;
  });

  // Drop completely empty rows
  const nonEmpty = parsed.filter(r => Object.values(r).some(v => v.trim() !== ''));

  return { headers, rows: nonEmpty };
}

async function fetchSheetData(sheetId: string, sheetName: string): Promise<SheetData> {
  const params = new URLSearchParams({ tqx: 'out:json' });
  if (sheetName) params.set('sheet', sheetName);

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?${params.toString()}`;

  const res = await fetch(url);

  if (!res.ok) {
    if (res.status === 302 || res.status === 401 || res.status === 403) {
      throw new Error('Access denied — make sure the sheet is shared as "Anyone with the link can view"');
    }
    throw new Error(`Google Sheets returned ${res.status}`);
  }

  const text = await res.text();

  if (text.includes('__LOGIN__') || text.includes('accounts.google.com')) {
    throw new Error('Sheet is private — change sharing to "Anyone with the link can view"');
  }

  return parseGvizResponse(text);
}

// ── Status badge ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  completed:  { label: 'Completed',  className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  deferred:   { label: 'Deferred',   className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',      icon: Clock },
  'drop-out': { label: 'Drop-Out',   className: 'bg-red-500/15 text-red-400 border-red-500/30',            icon: XCircle },
  dnp:        { label: 'DNP',        className: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',         icon: MinusCircle },
};

function StatusBadge({ value }: { value: string }) {
  const key = value.toLowerCase().trim();
  const cfg = STATUS_CONFIG[key];
  if (!cfg) return <span className="text-sm">{value || '—'}</span>;
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={`gap-1 text-[11px] font-medium ${cfg.className}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}

// ── Cell renderer ───────────────────────────────────────────────────────────────

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

  if (isEmailCol(header)) {
    return (
      <a href={`mailto:${value}`} className="text-primary hover:underline text-sm" onClick={e => e.stopPropagation()}>
        {value}
      </a>
    );
  }

  if (isPhoneCol(header)) {
    return <span className="font-mono text-sm">{value}</span>;
  }

  return <span className="text-sm">{value}</span>;
}

// ── Sheet ID config panel ───────────────────────────────────────────────────────

function SheetConfig({ sheetId, sheetName, onSave }: {
  sheetId: string; sheetName: string;
  onSave: (id: string, name: string) => void;
}) {
  const [id, setId] = useState(sheetId);
  const [name, setName] = useState(sheetName);

  return (
    <Card className="border-blue-500/20 bg-blue-500/5">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-blue-400" />
          <p className="font-semibold text-sm">Connect your Google Sheet</p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Sheet ID <span className="text-muted-foreground">(from the URL)</span></Label>
            <Input
              value={id}
              onChange={e => setId(e.target.value.trim())}
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
              className="font-mono text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              From: docs.google.com/spreadsheets/d/<strong className="text-blue-400">THIS-PART</strong>/edit
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Tab name <span className="text-muted-foreground">(optional — leave blank for first tab)</span></Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Sheet1"
              className="text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-amber-400/80">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Sheet must be shared as "Anyone with the link can view" for this to work
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => onSave(id, name)} disabled={!id.trim()}>
            Connect Sheet
          </Button>
          <a
            href="https://support.google.com/docs/answer/183965"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            How to share? <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

const ALL = '__all__';

export default function AdminSheetViewer() {
  const [sheetId, setSheetId]     = useState(() => localStorage.getItem(SHEET_ID_KEY) ?? '');
  const [sheetName, setSheetName] = useState(() => localStorage.getItem(SHEET_NAME_KEY) ?? '');
  const [showConfig, setShowConfig] = useState(!localStorage.getItem(SHEET_ID_KEY));
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [refreshKey, setRefreshKey] = useState(0);

  const canFetch = !!sheetId.trim();

  const { data, isLoading, error, isFetching } = useQuery<SheetData, Error>({
    queryKey: ['sheet-data', sheetId, sheetName, refreshKey],
    queryFn: () => fetchSheetData(sheetId, sheetName),
    enabled: canFetch,
    staleTime: 120_000,
    retry: 1,
  });

  const headers = data?.headers ?? [];
  const allRows = data?.rows ?? [];

  // Find the status column name (case-insensitive)
  const statusHeader = headers.find(h => isStatusCol(h));

  // Unique statuses for filter dropdown
  const uniqueStatuses = useMemo(() => {
    if (!statusHeader) return [];
    const set = new Set(allRows.map(r => (r[statusHeader] ?? '').trim()).filter(Boolean));
    return Array.from(set).sort();
  }, [allRows, statusHeader]);

  const filteredRows = useMemo(() => {
    let rows = allRows;
    if (statusFilter !== ALL && statusHeader) {
      rows = rows.filter(r => (r[statusHeader] ?? '').trim().toLowerCase() === statusFilter.toLowerCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(r => Object.values(r).some(v => v.toLowerCase().includes(q)));
    }
    return rows;
  }, [allRows, statusHeader, statusFilter, search]);

  const handleSaveConfig = (id: string, name: string) => {
    localStorage.setItem(SHEET_ID_KEY, id);
    localStorage.setItem(SHEET_NAME_KEY, name);
    setSheetId(id);
    setSheetName(name);
    setShowConfig(false);
    setRefreshKey(k => k + 1);
  };

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
    toast.info('Refreshing sheet data…');
  };

  const handleDownloadCSV = () => {
    if (!headers.length) return;
    const csvLines = [
      headers.join(','),
      ...filteredRows.map(row =>
        headers.map(h => `"${(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
      ),
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forge-sheet-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Status count chips
  const statusCounts = useMemo(() => {
    if (!statusHeader) return {};
    const counts: Record<string, number> = {};
    allRows.forEach(r => {
      const s = (r[statusHeader] ?? '').trim();
      if (s) counts[s] = (counts[s] ?? 0) + 1;
    });
    return counts;
  }, [allRows, statusHeader]);

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
            Live view of your 15K payment Google Sheet
            {allRows.length > 0 && (
              <span className="ml-2 text-muted-foreground/60 text-xs">— {allRows.length} total students</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfig(v => !v)}
            className="gap-2"
          >
            <Settings className="h-3.5 w-3.5" />
            {sheetId ? 'Change Sheet' : 'Connect Sheet'}
          </Button>
          {canFetch && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCSV}
                disabled={filteredRows.length === 0}
                className="gap-2"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isFetching}
                className="gap-2"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Config panel */}
      {showConfig && (
        <SheetConfig sheetId={sheetId} sheetName={sheetName} onSave={handleSaveConfig} />
      )}

      {/* No sheet configured */}
      {!canFetch && !showConfig && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center space-y-3">
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground">Connect your Google Sheet to get started</p>
            <Button size="sm" onClick={() => setShowConfig(true)} className="gap-2">
              <Settings className="h-3.5 w-3.5" />
              Connect Sheet
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {isLoading && canFetch && (
        <Card>
          <CardContent className="p-8 flex items-center justify-center gap-3 text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="text-sm">Fetching sheet data…</span>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && !isLoading && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-sm text-amber-300">Could not load sheet</p>
                <p className="text-xs text-muted-foreground">{error.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
                <RefreshCw className="h-3.5 w-3.5" /> Try again
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowConfig(true)} className="gap-2">
                <Settings className="h-3.5 w-3.5" /> Change Sheet ID
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status summary chips */}
      {Object.keys(statusCounts).length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter(ALL)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              statusFilter === ALL
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-foreground/30'
            }`}
          >
            All ({allRows.length})
          </button>
          {uniqueStatuses.map(s => {
            const key = s.toLowerCase().trim();
            const cfg = STATUS_CONFIG[key];
            const count = statusCounts[s] ?? 0;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? ALL : s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  statusFilter === s
                    ? (cfg?.className ?? 'bg-primary/20 border-primary/40') + ' font-semibold'
                    : 'border-border text-muted-foreground hover:border-foreground/30'
                }`}
              >
                {s} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Search + filters */}
      {canFetch && !isLoading && data && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name, email, phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {search && (
            <Badge variant="outline" className="text-xs text-amber-400 border-amber-500/30">
              {filteredRows.length} match{filteredRows.length !== 1 ? 'es' : ''}
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
                  <TableHead className="w-10 text-center text-muted-foreground font-normal text-xs sticky left-0 bg-muted/50">#</TableHead>
                  {headers.map(h => (
                    <TableHead key={h} className="whitespace-nowrap text-xs font-semibold">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={headers.length + 1} className="text-center text-muted-foreground py-12 text-sm">
                      No rows match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/30">
                      <TableCell className="text-center text-xs text-muted-foreground/50 font-mono sticky left-0 bg-background">
                        {idx + 1}
                      </TableCell>
                      {headers.map(h => (
                        <TableCell key={h} className="max-w-[220px] truncate">
                          <CellValue value={row[h] ?? ''} header={h} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="px-4 py-2 border-t text-[11px] text-muted-foreground/50 flex items-center gap-1.5">
            <Info className="h-3 w-3" />
            Showing {filteredRows.length} of {allRows.length} rows · Data fetched live from Google Sheets
          </div>
        </Card>
      )}
    </div>
  );
}
