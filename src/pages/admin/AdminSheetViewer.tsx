import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase as supabaseTyped } from '@/integrations/supabase/client';
const supabase = supabaseTyped as any;
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  RefreshCw, Search, AlertTriangle, Download,
  FileSpreadsheet, Info,
} from 'lucide-react';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────────────────────

interface SheetRow {
  [key: string]: string;
}

interface SheetData {
  headers: string[];
  rows: SheetRow[];
  total: number;
  error?: string;
  hint?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const SUPABASE_URL = (supabase as any).supabaseUrl as string;

async function fetchSheetData(): Promise<SheetData> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');

  const res = await fetch(`${SUPABASE_URL}/functions/v1/get-sheet-data`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  const json = await res.json();

  if (!res.ok || json.error) {
    throw Object.assign(new Error(json.error || 'Failed to load sheet'), { hint: json.hint });
  }

  return json as SheetData;
}

// Guess if a column is a "phone" column
const isPhoneCol = (h: string) => /phone|mobile|contact/i.test(h);
const isEmailCol = (h: string) => /email|mail/i.test(h);
const isAmountCol = (h: string) => /amount|payment|price|fee/i.test(h);
const isNameCol = (h: string) => /name/i.test(h);

function formatCell(value: string, header: string): React.ReactNode {
  if (!value) return <span className="text-muted-foreground/40">—</span>;

  if (isAmountCol(header) && /^\d+(\.\d+)?$/.test(value.replace(/[,₹]/g, ''))) {
    const n = parseFloat(value.replace(/[,₹]/g, ''));
    return <span className="font-mono text-emerald-400">₹{n.toLocaleString('en-IN')}</span>;
  }

  if (isEmailCol(header)) {
    return (
      <a
        href={`mailto:${value}`}
        className="text-primary hover:underline truncate max-w-[200px] block"
        onClick={e => e.stopPropagation()}
      >
        {value}
      </a>
    );
  }

  if (isPhoneCol(header)) {
    return <span className="font-mono text-sm">{value}</span>;
  }

  return value;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminSheetViewer() {
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, isLoading, error, isFetching } = useQuery<SheetData, Error>({
    queryKey: ['sheet-data', refreshKey],
    queryFn: fetchSheetData,
    staleTime: 60_000,
    retry: 1,
  });

  const headers = data?.headers ?? [];
  const allRows = data?.rows ?? [];

  const filteredRows = useMemo(() => {
    if (!search.trim()) return allRows;
    const q = search.toLowerCase();
    return allRows.filter(row =>
      Object.values(row).some(v => v.toLowerCase().includes(q))
    );
  }, [allRows, search]);

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

  // ── Error state ─────────────────────────────────────────────────────────────

  if (error && !isLoading) {
    const errMsg = error.message;
    const hint = (error as any).hint as string | undefined;
    const isNotConfigured = errMsg.includes('GOOGLE_SHEET_ID secret not set');
    const isAccessDenied = errMsg.includes('Cannot access');

    return (
      <div className="p-6 space-y-5 max-w-2xl mx-auto">
        <PageHeader />

        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <p className="font-semibold text-sm text-amber-300">
                  {isNotConfigured ? 'Sheet ID not configured' : isAccessDenied ? 'Cannot access the sheet' : 'Error loading sheet'}
                </p>
                <p className="text-xs text-muted-foreground">{errMsg}</p>
                {hint && <p className="text-xs text-amber-400/80">{hint}</p>}
              </div>
            </div>

            {isNotConfigured && (
              <SetupInstructions />
            )}
            {isAccessDenied && (
              <div className="text-xs text-muted-foreground bg-background/50 rounded p-3 space-y-1">
                <p className="font-medium text-foreground">To fix this:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Open your Google Sheet</li>
                  <li>Click <strong>Share</strong> (top right)</li>
                  <li>Change to <strong>"Anyone with the link can view"</strong></li>
                  <li>Click Done, then refresh here</li>
                </ol>
              </div>
            )}

            <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Loading state ───────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="p-6 space-y-5 max-w-5xl mx-auto">
        <PageHeader />
        <Card>
          <CardContent className="p-8 flex items-center justify-center gap-3 text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="text-sm">Fetching sheet data…</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────────

  if (!data || headers.length === 0) {
    return (
      <div className="p-6 space-y-5 max-w-2xl mx-auto">
        <PageHeader />
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <p className="text-sm text-muted-foreground">
              Sheet is empty or has no rows.
            </p>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </CardContent>
        </Card>
        <SetupInstructions />
      </div>
    );
  }

  // ── Main view ───────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-6 space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-emerald-400" />
            Google Sheet Viewer
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Live view of your 15K payment Google Sheet
            <span className="ml-2 text-muted-foreground/60 text-xs">
              — {allRows.length} rows total
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
        <Badge variant="secondary" className="text-xs font-mono">
          {filteredRows.length} / {allRows.length} rows
        </Badge>
        <Badge variant="secondary" className="text-xs font-mono">
          {headers.length} columns
        </Badge>
        {search && (
          <Badge variant="outline" className="text-xs text-amber-400 border-amber-500/30">
            Filtered by "{search}"
          </Badge>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search all columns…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-center text-muted-foreground font-normal text-xs">#</TableHead>
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
                    No rows match your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/30">
                    <TableCell className="text-center text-xs text-muted-foreground/60 font-mono">
                      {idx + 1}
                    </TableCell>
                    {headers.map(h => (
                      <TableCell key={h} className="text-sm max-w-[220px] truncate">
                        {formatCell(row[h] ?? '', h)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Info footer */}
      <p className="text-[11px] text-muted-foreground/50 flex items-center gap-1.5">
        <Info className="h-3 w-3" />
        Data is fetched live from Google Sheets. Click Refresh to get the latest rows.
        Sheet must be shared as "Anyone with the link can view".
      </p>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <FileSpreadsheet className="h-6 w-6 text-emerald-400" />
        Google Sheet Viewer
      </h1>
      <p className="text-muted-foreground text-sm mt-0.5">
        View student data from your 15K payment Google Sheet
      </p>
    </div>
  );
}

function SetupInstructions() {
  return (
    <Card className="border-blue-500/20 bg-blue-500/5">
      <CardContent className="p-4 space-y-3">
        <p className="text-sm font-semibold flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-400" />
          One-time setup required
        </p>
        <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
          <li>
            Open your Google Sheet, copy the Sheet ID from the URL:
            <br />
            <code className="text-[11px] bg-background/50 px-1.5 py-0.5 rounded font-mono text-blue-300 mt-1 inline-block">
              docs.google.com/spreadsheets/d/<strong>THIS-PART</strong>/edit
            </code>
          </li>
          <li>
            Make sure the sheet is shared as{' '}
            <strong className="text-foreground">"Anyone with the link can view"</strong>
          </li>
          <li>
            Go to your Supabase dashboard → <strong>Edge Functions</strong> → <strong>Secrets</strong>
          </li>
          <li>
            Add a new secret:
            <br />
            <code className="text-[11px] bg-background/50 px-1.5 py-0.5 rounded font-mono text-emerald-300 mt-1 inline-block">
              GOOGLE_SHEET_ID = your-sheet-id-here
            </code>
          </li>
          <li>Also deploy the <code className="font-mono">get-sheet-data</code> edge function from your codebase</li>
        </ol>
      </CardContent>
    </Card>
  );
}
