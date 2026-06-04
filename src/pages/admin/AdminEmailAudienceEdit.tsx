import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase as supabaseTyped } from '@/integrations/supabase/client';
const supabase = supabaseTyped as any;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronDown, ChevronUp, Loader2, Save, Users, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

// ── Types ─────────────────────────────────────────────────────────────────────

interface FilterCriteria {
  edition_ids?: string[];
  cohort_types?: string[];
  forge_modes?: string[];
  onboarding_completed?: boolean;
  ky_completed?: boolean;
  has_photo?: boolean;
  cities?: string[];
}

type TriState = 'any' | 'yes' | 'no';

const COHORT_OPTIONS = [
  { value: 'FFM', label: 'Forge Filmmaking' },
  { value: 'FW', label: 'Forge Writing' },
  { value: 'FC', label: 'Forge Creators' },
  { value: 'FAI', label: 'Forge AI' },
];

const FORGE_MODE_OPTIONS = [
  { value: 'PRE_FORGE', label: 'Pre-Forge' },
  { value: 'DURING_FORGE', label: 'During Forge' },
  { value: 'POST_FORGE', label: 'Post-Forge' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function toggleItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

function triFromBool(v: boolean | undefined): TriState {
  if (v === true) return 'yes';
  if (v === false) return 'no';
  return 'any';
}

function boolFromTri(v: TriState): boolean | undefined {
  if (v === 'yes') return true;
  if (v === 'no') return false;
  return undefined;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function BadgeToggle({
  options,
  selected,
  onChange,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <Badge
          key={opt.value}
          variant="outline"
          onClick={() => onChange(toggleItem(selected, opt.value))}
          className={`cursor-pointer select-none py-1 px-2.5 transition-colors ${
            selected.includes(opt.value)
              ? 'bg-primary/20 text-primary border-primary/50'
              : 'hover:bg-muted/50'
          }`}
        >
          {opt.label}
        </Badge>
      ))}
    </div>
  );
}

function TriRadio({
  value,
  onChange,
  id,
  labels = ['Any', 'Yes', 'No'],
}: {
  value: TriState;
  onChange: (v: TriState) => void;
  id: string;
  labels?: [string, string, string];
}) {
  return (
    <RadioGroup value={value} onValueChange={(v) => onChange(v as TriState)} className="flex gap-4">
      {(['any', 'yes', 'no'] as TriState[]).map((v, i) => (
        <div key={v} className="flex items-center gap-1.5">
          <RadioGroupItem value={v} id={`${id}-${v}`} />
          <Label htmlFor={`${id}-${v}`} className="text-sm font-normal cursor-pointer">
            {labels[i]}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}

function AudiencePreview({ criteria }: { criteria: FilterCriteria }) {
  const [expanded, setExpanded] = useState(false);

  const hasFilter = useMemo(() => {
    return (
      (criteria.edition_ids?.length ?? 0) > 0 ||
      (criteria.cohort_types?.length ?? 0) > 0 ||
      (criteria.forge_modes?.length ?? 0) > 0 ||
      criteria.onboarding_completed !== undefined ||
      criteria.ky_completed !== undefined ||
      criteria.has_photo !== undefined ||
      (criteria.cities?.length ?? 0) > 0
    );
  }, [criteria]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['audience-preview', JSON.stringify(criteria)],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('resolve-audience', {
        body: { filter_criteria: criteria, preview: true },
      });
      if (error) throw error;
      return data as { count: number; users: { id: string; email: string; full_name: string | null }[] };
    },
    enabled: hasFilter,
    staleTime: 30_000,
    retry: false,
  });

  const loading = (isLoading || isFetching) && hasFilter;

  return (
    <div className="rounded-lg border border-border/50 bg-muted/10 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {!hasFilter ? (
              <span className="text-muted-foreground">Add at least one filter to see a count</span>
            ) : loading ? (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Computing…
              </span>
            ) : (
              <span>
                <strong className="text-foreground">{data?.count ?? 0}</strong>{' '}
                student{(data?.count ?? 0) === 1 ? '' : 's'} match this audience
              </span>
            )}
          </span>
        </div>
        {(data?.users?.length ?? 0) > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => setExpanded((p) => !p)}
          >
            {expanded ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {expanded ? 'Hide' : 'Preview'} recipients
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        )}
      </div>

      {expanded && data?.users && (
        <div className="space-y-0">
          {data.users.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 text-xs py-1.5 border-b border-border/30 last:border-0"
            >
              <span className="font-medium w-36 truncate shrink-0">{u.full_name || '—'}</span>
              <span className="text-muted-foreground truncate">{u.email}</span>
            </div>
          ))}
          {(data.count ?? 0) > data.users.length && (
            <p className="text-xs text-muted-foreground pt-2">
              …and {data.count - data.users.length} more (showing first 20)
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminEmailAudienceEdit() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Filter state
  const [editionIds, setEditionIds] = useState<string[]>([]);
  const [cohortTypes, setCohortTypes] = useState<string[]>([]);
  const [forgeModes, setForgeModes] = useState<string[]>([]);
  const [onboardingState, setOnboardingState] = useState<TriState>('any');
  const [kyState, setKyState] = useState<TriState>('any');
  const [photoState, setPhotoState] = useState<TriState>('any');
  const [cities, setCities] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load existing audience for edit
  const { data: audienceData, isLoading: loadingAudience } = useQuery({
    queryKey: ['admin-email-audience', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_audiences')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
    staleTime: Infinity,
  });

  // Populate form once data arrives
  useEffect(() => {
    if (!audienceData || initialized) return;
    setName(audienceData.name || '');
    setDescription(audienceData.description || '');
    const c: FilterCriteria = audienceData.filter_criteria || {};
    setEditionIds(c.edition_ids || []);
    setCohortTypes(c.cohort_types || []);
    setForgeModes(c.forge_modes || []);
    setOnboardingState(triFromBool(c.onboarding_completed));
    setKyState(triFromBool(c.ky_completed));
    setPhotoState(triFromBool(c.has_photo));
    setCities(c.cities || []);
    setInitialized(true);
  }, [audienceData, initialized]);

  // Reference data
  const { data: editions = [] } = useQuery({
    queryKey: ['admin-editions-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editions')
        .select('id, name, cohort_type')
        .eq('is_archived', false)
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: distinctCities = [] } = useQuery({
    queryKey: ['admin-distinct-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('city')
        .not('city', 'is', null)
        .eq('is_admin', false);
      if (error) throw error;
      const unique = Array.from(
        new Set((data || []).map((r: any) => r.city as string))
      )
        .filter(Boolean)
        .sort() as string[];
      return unique;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Build filter_criteria from local state
  const filterCriteria = useMemo<FilterCriteria>(() => {
    const c: FilterCriteria = {};
    if (editionIds.length) c.edition_ids = editionIds;
    if (cohortTypes.length) c.cohort_types = cohortTypes;
    if (forgeModes.length) c.forge_modes = forgeModes;
    const ob = boolFromTri(onboardingState);
    if (ob !== undefined) c.onboarding_completed = ob;
    const ky = boolFromTri(kyState);
    if (ky !== undefined) c.ky_completed = ky;
    const ph = boolFromTri(photoState);
    if (ph !== undefined) c.has_photo = ph;
    if (cities.length) c.cities = cities;
    return c;
  }, [editionIds, cohortTypes, forgeModes, onboardingState, kyState, photoState, cities]);

  // Debounce criteria before passing to live preview (avoids rapid-fire calls)
  const debouncedCriteria = useDebounce(filterCriteria, 600);

  // Save
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error('Name is required');
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        filter_criteria: filterCriteria,
      };
      if (isNew) {
        const { error } = await supabase.from('email_audiences').insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_audiences')
          .update(payload)
          .eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-email-audiences'] });
      if (!isNew) queryClient.invalidateQueries({ queryKey: ['admin-email-audience', id] });
      toast.success(isNew ? 'Audience created' : 'Audience saved');
      navigate('/admin/email/audiences');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!isNew && loadingAudience) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
      </div>
    );
  }

  const editionOptions = (editions as any[]).map((e) => ({
    value: e.id,
    label: `${e.name}`,
  }));

  const cityOptions = (distinctCities as string[]).map((c) => ({ value: c, label: c }));

  return (
    <div className="p-6 space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/email/audiences')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{isNew ? 'New Audience' : 'Edit Audience'}</h1>
          <p className="text-muted-foreground text-sm">
            Define filters — resolves to matching students at send time.
          </p>
        </div>
      </div>

      {/* Name & description */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. E17 Filmmaking Students"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Who is this audience for?"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Filter builder */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Editions
            </Label>
            {editionOptions.length === 0 ? (
              <p className="text-xs text-muted-foreground">No active editions found</p>
            ) : (
              <BadgeToggle options={editionOptions} selected={editionIds} onChange={setEditionIds} />
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Cohort Type
            </Label>
            <BadgeToggle options={COHORT_OPTIONS} selected={cohortTypes} onChange={setCohortTypes} />
          </div>

          <Separator />

          {/* Advanced filters — hidden by default to keep the common case (pick a
              cohort / edition) clean. */}
          <button
            type="button"
            onClick={() => setShowAdvanced((s) => !s)}
            className="text-xs font-medium text-primary hover:underline"
          >
            {showAdvanced ? '− Hide advanced filters' : '+ Show advanced filters (Forge mode, onboarding, KY form, photo, city)'}
          </button>

          {showAdvanced && (
          <>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Forge Mode
            </Label>
            <BadgeToggle options={FORGE_MODE_OPTIONS} selected={forgeModes} onChange={setForgeModes} />
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Onboarding
              </Label>
              <TriRadio
                id="onboarding"
                value={onboardingState}
                onChange={setOnboardingState}
                labels={['Any', 'Completed', 'Incomplete']}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                KY Form
              </Label>
              <TriRadio
                id="ky"
                value={kyState}
                onChange={setKyState}
                labels={['Any', 'Submitted', 'Pending']}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Profile Photo
              </Label>
              <TriRadio
                id="photo"
                value={photoState}
                onChange={setPhotoState}
                labels={['Any', 'Uploaded', 'Missing']}
              />
            </div>
          </div>

          {cityOptions.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  City
                </Label>
                <BadgeToggle options={cityOptions} selected={cities} onChange={setCities} />
              </div>
            </>
          )}
          </>
          )}
        </CardContent>
      </Card>

      {/* Live preview */}
      <AudiencePreview criteria={debouncedCriteria} />

      {/* Actions */}
      <div className="flex justify-end gap-3 pb-6">
        <Button variant="outline" onClick={() => navigate('/admin/email/audiences')}>
          Cancel
        </Button>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || !name.trim()}
          className="gap-2"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isNew ? 'Create Audience' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
