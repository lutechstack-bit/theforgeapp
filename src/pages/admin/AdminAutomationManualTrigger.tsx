import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase as supabaseTyped } from '@/integrations/supabase/client';
const supabase = supabaseTyped as any;
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2, XCircle, Loader2, Zap, AlertTriangle, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ProductMapping {
  product: string;
  edition_id: string;
  edition_name: string;
  cohort_type: string;
  is_active: boolean;
}

interface TriggerResult {
  success: boolean;
  status: 'success' | 'duplicate' | 'failed' | 'skipped';
  action?: 'created' | 'updated';
  user_id?: string;
  edition?: { id: string; name: string; cohort_type: string };
  email_sent?: boolean;
  message?: string;
  error?: string;
  hint?: string;
}

const EMPTY_FORM = {
  student_id: '',
  full_name: '',
  email: '',
  phone: '',
  city: '',
  product: '',
  batch: '',
  payment_amount: '15000',
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminAutomationManualTrigger() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState<TriggerResult | null>(null);

  const update = (k: keyof typeof EMPTY_FORM) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // ── Load available product mappings ────────────────────────────────────

  const { data: mappings = [] } = useQuery<ProductMapping[]>({
    queryKey: ['automation-product-mappings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_automation_config')
        .select('product_mappings, is_enabled')
        .single();
      if (error) throw error;
      return ((data?.product_mappings || []) as ProductMapping[]).filter((m) => m.is_active);
    },
  });

  // ── Trigger mutation ───────────────────────────────────────────────────

  const triggerMutation = useMutation({
    mutationFn: async () => {
      if (!form.full_name.trim()) throw new Error('Full name is required');
      if (!form.email.trim()) throw new Error('Email is required');
      if (!form.product) throw new Error('Product is required');

      const student_id = form.student_id.trim() || `MANUAL-${Date.now()}`;

      // Call the edge function using the admin's JWT (manual_admin path).
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const supabaseUrl = (supabase as any).supabaseUrl as string;
      const fnUrl = `${supabaseUrl}/functions/v1/forge-onboard-student`;

      const res = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id,
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim() || undefined,
          city: form.city.trim() || undefined,
          product: form.product,
          batch: form.batch.trim() || undefined,
          payment_amount: parseFloat(form.payment_amount) || 15000,
        }),
      });

      const json = await res.json();

      // Always return the body — the mutation onSuccess/onError reads result.success.
      return json as TriggerResult;
    },
    onSuccess: (data) => {
      setResult(data);
      if (data.success) {
        toast.success(data.action === 'created' ? 'Student account created!' : 'Existing account updated');
        setForm(EMPTY_FORM);
      } else {
        if (data.status === 'duplicate') {
          toast.info('Student already onboarded (duplicate)');
        } else {
          toast.error(data.error || 'Onboarding failed');
        }
      }
    },
    onError: (e: Error) => {
      toast.error(e.message);
      setResult({ success: false, status: 'failed', error: e.message });
    },
  });

  // ── Result card ────────────────────────────────────────────────────────

  const ResultCard = () => {
    if (!result) return null;

    const isSuccess = result.success || result.status === 'duplicate';
    const isDuplicate = result.status === 'duplicate';

    return (
      <Card className={isSuccess ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-red-500/40 bg-red-500/5'}>
        <CardContent className="py-4 px-5 space-y-2">
          <div className="flex items-center gap-2">
            {isSuccess
              ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              : <XCircle className="h-5 w-5 text-red-400 shrink-0" />}
            <p className="font-semibold text-sm">
              {isDuplicate ? 'Already onboarded' : isSuccess ? 'Onboarding successful' : 'Onboarding failed'}
            </p>
          </div>

          {result.message && (
            <p className="text-xs text-muted-foreground">{result.message}</p>
          )}
          {result.edition && (
            <p className="text-xs">
              Edition: <span className="font-medium">{result.edition.name}</span>
              <Badge variant="outline" className="ml-2 text-[10px]">{result.edition.cohort_type}</Badge>
            </p>
          )}
          {result.user_id && (
            <p className="text-[11px] font-mono text-muted-foreground">
              User ID: {result.user_id}
            </p>
          )}
          {result.email_sent !== undefined && (
            <p className="text-xs text-muted-foreground">
              Welcome email: {result.email_sent ? '✅ sent' : '⏭️ not sent'}
            </p>
          )}
          {result.error && (
            <p className="text-xs text-red-400">{result.error}</p>
          )}
          {result.hint && (
            <p className="text-xs text-amber-400">{result.hint}</p>
          )}
          {result.user_id && (
            <a
              href={`/admin/users?search=${result.user_id}`}
              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
            >
              View in Users <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </CardContent>
      </Card>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-5 max-w-xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          Manual Onboarding
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manually onboard a student — uses the same edge function as Google Sheets automation.
          A temp password is generated and emailed to the student.
        </p>
      </div>

      {/* No active mappings warning */}
      {mappings.length === 0 && (
        <Card className="border-amber-500/30 bg-amber-500/8">
          <CardContent className="py-3 px-4 flex items-start gap-2 text-xs text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              No active product mappings found.{' '}
              <a href="/admin/automation-product-mapping" className="underline underline-offset-2">
                Add a mapping
              </a>{' '}
              before triggering onboarding.
            </span>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Student Details</CardTitle>
          <CardDescription className="text-xs">
            Fields marked * are required. Student ID auto-generates if left blank.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Row 1: name + email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Full name *</Label>
              <Input
                value={form.full_name}
                onChange={update('full_name')}
                placeholder="Rahul Kumar"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={update('email')}
                placeholder="rahul@example.com"
              />
            </div>
          </div>

          {/* Row 2: phone + city */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={update('phone')}
                placeholder="9876543210"
              />
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input
                value={form.city}
                onChange={update('city')}
                placeholder="Mumbai"
              />
            </div>
          </div>

          <Separator />

          {/* Row 3: product + batch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Product *</Label>
              <Select
                value={form.product}
                onValueChange={(v) => setForm((f) => ({ ...f, product: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product…" />
                </SelectTrigger>
                <SelectContent>
                  {mappings.length > 0 ? (
                    mappings.map((m) => (
                      <SelectItem key={m.product} value={m.product}>
                        <span className="font-mono font-semibold">{m.product}</span>
                        <span className="ml-2 text-[10px] text-muted-foreground truncate">
                          {m.edition_name}
                        </span>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__none__" disabled>
                      No active mappings
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {form.product && (
                <p className="text-[11px] text-muted-foreground">
                  → {mappings.find((m) => m.product === form.product)?.edition_name ?? ''}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Batch / Sheet ID</Label>
              <Input
                value={form.batch}
                onChange={update('batch')}
                placeholder="E14"
              />
            </div>
          </div>

          {/* Row 4: student ID + payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Student ID <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                value={form.student_id}
                onChange={update('student_id')}
                placeholder="auto-generated"
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Payment amount (₹)</Label>
              <Input
                type="number"
                value={form.payment_amount}
                onChange={update('payment_amount')}
                placeholder="15000"
                className="font-mono"
              />
            </div>
          </div>

          <Button
            className="w-full gap-2"
            onClick={() => { setResult(null); triggerMutation.mutate(); }}
            disabled={triggerMutation.isPending || mappings.length === 0}
          >
            {triggerMutation.isPending
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Onboarding…</>
              : <><Zap className="h-4 w-4" /> Onboard Student</>}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      <ResultCard />
    </div>
  );
}
