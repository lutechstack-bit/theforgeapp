import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase as supabaseTyped } from '@/integrations/supabase/client';
const supabase = supabaseTyped as any;
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2, Settings2, Bell, IndianRupee, ShieldCheck, Mail } from 'lucide-react';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AutomationConfig {
  id: string;
  is_enabled: boolean;
  min_payment: number;
  notify_on_success: boolean;
  notify_on_failure: boolean;
  notification_email: string | null;
  welcome_template_slug: string | null;
  send_welcome_email: boolean | null;
  updated_at: string | null;
}

interface FormState {
  is_enabled: boolean;
  min_payment: string;
  notify_on_success: boolean;
  notify_on_failure: boolean;
  notification_email: string;
  welcome_template_slug: string;
  send_welcome_email: boolean;
}

const DEFAULT_WELCOME_SLUG = 'student-welcome';

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminAutomationSettings() {
  const queryClient = useQueryClient();

  // Local form state — seeded from DB, editable before save.
  const [form, setForm] = useState<FormState>({
    is_enabled: true,
    min_payment: '15000',
    notify_on_success: false,
    notify_on_failure: true,
    notification_email: '',
    welcome_template_slug: DEFAULT_WELCOME_SLUG,
    send_welcome_email: true,
  });
  const [isDirty, setIsDirty] = useState(false);

  // Active email templates the admin can choose as the welcome email.
  const { data: templates = [] } = useQuery({
    queryKey: ['admin-automation-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // ── Data fetch ──────────────────────────────────────────────────────────
  const { data: config, isLoading } = useQuery<AutomationConfig>({
    queryKey: ['admin-automation-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_automation_config')
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Seed form when config loads (or changes from another tab).
  useEffect(() => {
    if (config) {
      setForm({
        is_enabled: config.is_enabled,
        min_payment: String(config.min_payment ?? 15000),
        notify_on_success: config.notify_on_success,
        notify_on_failure: config.notify_on_failure,
        notification_email: config.notification_email ?? '',
        welcome_template_slug: config.welcome_template_slug || DEFAULT_WELCOME_SLUG,
        send_welcome_email: config.send_welcome_email !== false,
      });
      setIsDirty(false);
    }
  }, [config]);

  // Track dirty state whenever form changes.
  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setIsDirty(true);
  };

  // ── Save mutation ───────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payment = parseFloat(form.min_payment);
      if (isNaN(payment) || payment < 0) {
        throw new Error('Minimum payment must be a valid positive number');
      }

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('onboarding_automation_config')
        .update({
          is_enabled: form.is_enabled,
          min_payment: payment,
          notify_on_success: form.notify_on_success,
          notify_on_failure: form.notify_on_failure,
          notification_email: form.notification_email.trim() || null,
          welcome_template_slug: form.welcome_template_slug || DEFAULT_WELCOME_SLUG,
          send_welcome_email: form.send_welcome_email,
          updated_at: new Date().toISOString(),
          updated_by: user?.id ?? null,
        })
        .eq('id', config!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Automation settings saved');
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ['admin-automation-config'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleReset = () => {
    if (!config) return;
    setForm({
      is_enabled: config.is_enabled,
      min_payment: String(config.min_payment ?? 15000),
      notify_on_success: config.notify_on_success,
      notify_on_failure: config.notify_on_failure,
      notification_email: config.notification_email ?? '',
      welcome_template_slug: config.welcome_template_slug || DEFAULT_WELCOME_SLUG,
      send_welcome_email: config.send_welcome_email !== false,
    });
    setIsDirty(false);
  };

  // ── Render ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-8 text-center text-muted-foreground">
            <p className="font-medium">Automation config not found.</p>
            <p className="text-sm mt-1">
              Run the onboarding automation migration to seed the config row.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isNotifyEmail = form.notify_on_success || form.notify_on_failure;

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-primary" />
            Onboarding Automation
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Controls automatic student onboarding triggered from Google Sheets.
          </p>
        </div>
        {config.updated_at && (
          <p className="text-[11px] text-muted-foreground shrink-0">
            Last saved{' '}
            {new Date(config.updated_at).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </p>
        )}
      </div>

      {/* ── Card 1: Automation toggle ───────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Automation Status</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                When disabled, the edge function returns 200 immediately without creating any accounts.
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className={
                form.is_enabled
                  ? 'bg-green-500/10 text-green-500 border-green-500/30'
                  : 'bg-muted text-muted-foreground'
              }
            >
              {form.is_enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Switch
              id="is-enabled"
              checked={form.is_enabled}
              onCheckedChange={(v) => updateForm('is_enabled', v)}
            />
            <Label htmlFor="is-enabled" className="cursor-pointer select-none">
              {form.is_enabled
                ? 'Onboarding automation is active'
                : 'Onboarding automation is paused'}
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* ── Card: Welcome email template ────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <Mail className="h-4 w-4" /> Welcome Email Template
          </CardTitle>
          <CardDescription className="text-xs">
            The email sent to each student when they're onboarded. Pick any active template.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Master toggle: app (Resend) email on/off */}
          <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b">
            <div>
              <Label htmlFor="send-welcome" className="cursor-pointer select-none font-medium">
                Send welcome email from the app
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
                On = the app sends the welcome email via Resend. <strong>Turn OFF</strong> if n8n
                sends the confirmation email (via Gmail) instead — prevents students getting two emails.
              </p>
            </div>
            <Switch
              id="send-welcome"
              checked={form.send_welcome_email}
              onCheckedChange={(v) => updateForm('send_welcome_email', v)}
            />
          </div>

          <Label className="text-xs text-muted-foreground">Template used when the app sends</Label>
          <Select
            value={form.welcome_template_slug}
            onValueChange={(v) => updateForm('welcome_template_slug', v)}
            <SelectTrigger className="max-w-[360px]">
              <SelectValue placeholder="Select a template…" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t: any) => (
                <SelectItem key={t.id} value={t.slug}>
                  {t.name} <span className="text-muted-foreground">({t.slug})</span>
                </SelectItem>
              ))}
              {/* Keep the saved slug selectable even if its template is inactive/missing. */}
              {form.welcome_template_slug &&
                !templates.some((t: any) => t.slug === form.welcome_template_slug) && (
                  <SelectItem value={form.welcome_template_slug}>
                    {form.welcome_template_slug} (inactive or missing)
                  </SelectItem>
                )}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground mt-2">
            Only <span className="font-medium">active</span> templates appear here. The chosen
            template must have a sender identity set, or no email is sent.
          </p>
        </CardContent>
      </Card>

      {/* ── Card 2: Payment settings ────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <IndianRupee className="h-4 w-4" /> Minimum Payment
          </CardTitle>
          <CardDescription className="text-xs">
            Students with a payment below this amount will be skipped.
            Current default: ₹15,000.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 max-w-[220px]">
            <span className="text-muted-foreground text-sm font-medium">₹</span>
            <Input
              id="min-payment"
              type="number"
              min={0}
              step={1000}
              value={form.min_payment}
              onChange={(e) => updateForm('min_payment', e.target.value)}
              className="font-mono"
              placeholder="15000"
            />
          </div>
          {form.min_payment && isNaN(parseFloat(form.min_payment)) && (
            <p className="text-xs text-destructive mt-1.5">Enter a valid number</p>
          )}
        </CardContent>
      </Card>

      {/* ── Card 3: Notifications ───────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <Bell className="h-4 w-4" /> Notifications
          </CardTitle>
          <CardDescription className="text-xs">
            Email alerts sent to the notification address below after each onboarding attempt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="notify-success"
                checked={form.notify_on_success}
                onCheckedChange={(v) => updateForm('notify_on_success', Boolean(v))}
              />
              <Label htmlFor="notify-success" className="cursor-pointer font-normal">
                Email on successful onboarding
              </Label>
            </div>
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="notify-failure"
                checked={form.notify_on_failure}
                onCheckedChange={(v) => updateForm('notify_on_failure', Boolean(v))}
              />
              <Label htmlFor="notify-failure" className="cursor-pointer font-normal">
                Email on failed / skipped onboarding
              </Label>
            </div>
          </div>

          {/* Notification email — only shown when at least one notification is on */}
          {isNotifyEmail && (
            <>
              <Separator />
              <div className="space-y-1.5">
                <Label htmlFor="notification-email">Notification email address</Label>
                <Input
                  id="notification-email"
                  type="email"
                  value={form.notification_email}
                  onChange={(e) => updateForm('notification_email', e.target.value)}
                  placeholder="admin@leveluplearning.in"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Info card ───────────────────────────────────────────────────── */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-3 px-4 text-xs text-muted-foreground flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p>
            Product → edition mappings are managed separately under{' '}
            <span className="text-primary font-medium">Automation → Product Mappings</span>.
            Changes here only affect the global on/off switch, payment threshold, and notification preferences.
          </p>
        </CardContent>
      </Card>

      {/* ── Action bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pt-1">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={!isDirty || saveMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={!isDirty || saveMutation.isPending}
        >
          {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}
