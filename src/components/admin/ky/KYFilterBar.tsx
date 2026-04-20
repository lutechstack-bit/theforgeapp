import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Sliders, X } from 'lucide-react';
import type { StudentRow } from '@/hooks/useStudentKYData';

// ─────────────────────────── Types ────────────────────────────────────────

export type TriState = 'any' | 'yes' | 'no';
export type CompletionFilter = 'all' | 'complete' | 'incomplete';

export interface KYFilters {
  // Primary (always visible)
  cohort: string | null;              // FORGE | FORGE_WRITING | FORGE_CREATORS | null
  edition: string;                    // edition_name OR 'all'
  completion: CompletionFilter;
  search: string;
  // Advanced (behind popover)
  cities: string[];
  gender: string;                     // 'any' | 'Male' | 'Female' | 'Other'
  ageMin: string;
  ageMax: string;
  mbti: string[];
  meal: string;                       // 'any' | 'Vegetarian' | 'Non-Vegetarian'
  chronotype: string;                 // 'any' | 'Early bird' | 'Night owl'
  tshirtSizes: string[];
  hasLaptop: TriState;
  languages: string[];
  hasPhotos: TriState;                // any | yes | no
  hasCommunity: TriState;             // any | yes | no
  submittedFrom: string;              // yyyy-mm-dd
  submittedTo: string;                // yyyy-mm-dd
}

export const EMPTY_KY_FILTERS: KYFilters = {
  cohort: null,
  edition: 'all',
  completion: 'all',
  search: '',
  cities: [],
  gender: 'any',
  ageMin: '',
  ageMax: '',
  mbti: [],
  meal: 'any',
  chronotype: 'any',
  tshirtSizes: [],
  hasLaptop: 'any',
  languages: [],
  hasPhotos: 'any',
  hasCommunity: 'any',
  submittedFrom: '',
  submittedTo: '',
};

// ─────────────────────────── Predicate ────────────────────────────────────

const PHOTO_KEYS = [
  'photo_favorite_url',
  'headshot_front_url',
  'headshot_left_url',
  'headshot_right_url',
  'full_body_url',
];

function hasAnyPhoto(kyData: Record<string, any> | null | undefined): boolean {
  if (!kyData) return false;
  return PHOTO_KEYS.some(k => kyData[k]);
}

/** Strip any emoji suffix (e.g. "Vegetarian 🌱" -> "Vegetarian"). */
function normalizeMeal(raw: unknown): string {
  const s = String(raw || '').split(/\s/)[0].toLowerCase();
  return s.startsWith('veg') ? 'Vegetarian' : s.startsWith('non-veg') ? 'Non-Vegetarian' : String(raw || '');
}

export function applyKyFilters(rows: StudentRow[], f: KYFilters): StudentRow[] {
  return rows.filter(s => {
    // Primary
    if (f.edition !== 'all' && s.edition_name !== f.edition) return false;
    if (f.completion === 'complete' && !s.ky_form_completed) return false;
    if (f.completion === 'incomplete' && s.ky_form_completed) return false;
    if (f.search) {
      const q = f.search.toLowerCase();
      if (
        !s.full_name?.toLowerCase().includes(q) &&
        !s.email?.toLowerCase().includes(q) &&
        !s.edition_name?.toLowerCase().includes(q)
      ) return false;
    }

    const ky = s.kyData || {};
    const cityVal = (ky as any).city || s.city || '';
    const mbtiVal = (ky as any).mbti_type || s.mbti_type || '';
    const genderVal = (ky as any).gender || '';
    const ageVal = (ky as any).age;
    const mealVal = normalizeMeal((ky as any).meal_preference);
    const chronoVal = String((ky as any).chronotype || '');
    const tshirtVal = String((ky as any).tshirt_size || '');
    const laptopVal = (ky as any).has_editing_laptop;
    const langVal: string[] = Array.isArray((ky as any).languages_known)
      ? (ky as any).languages_known
      : typeof (ky as any).languages_known === 'string'
        ? String((ky as any).languages_known).split(/,\s*/)
        : [];
    const photosOk = hasAnyPhoto(ky);
    const createdAt = (ky as any).created_at;

    if (f.cities.length > 0 && !f.cities.includes(cityVal)) return false;
    if (f.gender !== 'any' && genderVal !== f.gender) return false;
    if (f.ageMin) {
      const n = Number(ageVal);
      if (!Number.isFinite(n) || n < Number(f.ageMin)) return false;
    }
    if (f.ageMax) {
      const n = Number(ageVal);
      if (!Number.isFinite(n) || n > Number(f.ageMax)) return false;
    }
    if (f.mbti.length > 0 && !f.mbti.includes(mbtiVal)) return false;
    if (f.meal !== 'any' && mealVal !== f.meal) return false;
    if (f.chronotype !== 'any' && chronoVal !== f.chronotype) return false;
    if (f.tshirtSizes.length > 0 && !f.tshirtSizes.includes(tshirtVal)) return false;
    if (f.hasLaptop !== 'any') {
      const v = laptopVal === true || laptopVal === 'true' || laptopVal === 'Yes' || laptopVal === 'yes';
      if (f.hasLaptop === 'yes' && !v) return false;
      if (f.hasLaptop === 'no' && v) return false;
    }
    if (f.languages.length > 0) {
      if (!f.languages.every(lang => langVal.some(l => l.toLowerCase().includes(lang.toLowerCase())))) return false;
    }
    if (f.hasPhotos !== 'any') {
      if (f.hasPhotos === 'yes' && !photosOk) return false;
      if (f.hasPhotos === 'no' && photosOk) return false;
    }
    if (f.hasCommunity !== 'any') {
      if (f.hasCommunity === 'yes' && !s.has_collaborator_profile) return false;
      if (f.hasCommunity === 'no' && s.has_collaborator_profile) return false;
    }
    if (f.submittedFrom && createdAt) {
      if (new Date(createdAt) < new Date(f.submittedFrom + 'T00:00:00')) return false;
    }
    if (f.submittedTo && createdAt) {
      if (new Date(createdAt) > new Date(f.submittedTo + 'T23:59:59')) return false;
    }

    return true;
  });
}

/** Only counts advanced filters — primary (cohort/edition/status/search) excluded. */
export function countAdvancedFilters(f: KYFilters): number {
  let n = 0;
  if (f.cities.length > 0) n++;
  if (f.gender !== 'any') n++;
  if (f.ageMin || f.ageMax) n++;
  if (f.mbti.length > 0) n++;
  if (f.meal !== 'any') n++;
  if (f.chronotype !== 'any') n++;
  if (f.tshirtSizes.length > 0) n++;
  if (f.hasLaptop !== 'any') n++;
  if (f.languages.length > 0) n++;
  if (f.hasPhotos !== 'any') n++;
  if (f.hasCommunity !== 'any') n++;
  if (f.submittedFrom || f.submittedTo) n++;
  return n;
}

/** Any filter is active (primary OR advanced). */
export function anyFilterActive(f: KYFilters): boolean {
  if (f.cohort) return true;
  if (f.edition !== 'all') return true;
  if (f.completion !== 'all') return true;
  if (f.search) return true;
  return countAdvancedFilters(f) > 0;
}

/**
 * Short slug tokens summarising the active filter scope — used by the CSV
 * filename so admins can tell exports apart at a glance. Keep tokens short
 * so the filename doesn't explode.
 */
export function describeActiveFilters(f: KYFilters): string[] {
  const parts: string[] = [];
  if (f.cities.length > 0) {
    parts.push(
      f.cities.length === 1 ? `city-${slugify(f.cities[0])}` : `cities-${f.cities.length}`
    );
  }
  if (f.gender !== 'any') parts.push(`gender-${f.gender.toLowerCase()}`);
  if (f.ageMin || f.ageMax) parts.push(`age-${f.ageMin || '0'}-${f.ageMax || '99'}`);
  if (f.mbti.length > 0) parts.push(f.mbti.length === 1 ? `mbti-${f.mbti[0]}` : `mbti-${f.mbti.length}`);
  if (f.meal !== 'any') parts.push(f.meal === 'Vegetarian' ? 'veg' : 'non-veg');
  if (f.chronotype !== 'any') parts.push(slugify(f.chronotype));
  if (f.tshirtSizes.length > 0) parts.push(`size-${f.tshirtSizes.join(',').toLowerCase()}`);
  if (f.hasLaptop !== 'any') parts.push(`laptop-${f.hasLaptop}`);
  if (f.languages.length > 0) parts.push(`lang-${f.languages.length}`);
  if (f.hasPhotos !== 'any') parts.push(f.hasPhotos === 'yes' ? 'has-photos' : 'no-photos');
  if (f.hasCommunity !== 'any') parts.push(f.hasCommunity === 'yes' ? 'has-community' : 'no-community');
  if (f.submittedFrom || f.submittedTo) parts.push(`dates-${f.submittedFrom || 'start'}-${f.submittedTo || 'now'}`);
  return parts;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// ─────────────────────────── UI ───────────────────────────────────────────

const COHORT_TYPES = [
  { value: 'FORGE', label: 'Filmmaking' },
  { value: 'FORGE_CREATORS', label: 'Creators' },
  { value: 'FORGE_WRITING', label: 'Writing' },
];

const KNOWN_LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada'];
const TSHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const MEAL_OPTIONS = ['any', 'Vegetarian', 'Non-Vegetarian'];
const CHRONO_OPTIONS = ['any', 'Early bird', 'Night owl'];
const GENDER_OPTIONS = ['any', 'Male', 'Female', 'Other'];

interface KYFilterBarProps {
  filters: KYFilters;
  onChange: (next: KYFilters) => void;
  /** Post-cohort-filter students — used to build context-aware option lists. */
  students: StudentRow[];
  /** Students after all filters — used for the count label. */
  visibleCount: number;
  /** Number of checked rows in the table. */
  selectedCount: number;
  /** Export button click handler. */
  onExport: () => void;
  /** Label shown on the export button. */
  exportLabel: string;
  /** Disable export (e.g. when visibleCount === 0). */
  exportDisabled?: boolean;
}

export const KYFilterBar: React.FC<KYFilterBarProps> = ({
  filters, onChange, students, visibleCount, selectedCount,
  onExport, exportLabel, exportDisabled,
}) => {
  // Build option lists from the current (post-cohort-filter) student set so
  // the dropdowns only offer values that actually appear in the data.
  const options = useMemo(() => {
    const cities = new Set<string>();
    const mbti = new Set<string>();
    const editions = new Set<string>();
    students.forEach(s => {
      const c = (s.kyData as any)?.city || s.city;
      if (c) cities.add(String(c));
      const m = (s.kyData as any)?.mbti_type || s.mbti_type;
      if (m) mbti.add(String(m));
      if (s.edition_name) editions.add(s.edition_name);
    });
    return {
      cities: Array.from(cities).sort(),
      mbti: Array.from(mbti).sort(),
      editions: Array.from(editions).sort((a, b) => {
        const ai = parseInt(a.match(/(\d+)$/)?.[1] || '', 10);
        const bi = parseInt(b.match(/(\d+)$/)?.[1] || '', 10);
        if (!Number.isNaN(ai) && !Number.isNaN(bi)) return bi - ai;
        return a.localeCompare(b);
      }),
    };
  }, [students]);

  const advancedCount = countAdvancedFilters(filters);
  const anyActive = anyFilterActive(filters);

  const set = <K extends keyof KYFilters>(key: K, value: KYFilters[K]) => {
    const next = { ...filters, [key]: value };
    // Reset edition filter when cohort changes (cohort-scoped dropdown).
    if (key === 'cohort') next.edition = 'all';
    onChange(next);
  };

  const toggleInArray = <K extends keyof KYFilters>(key: K, value: string) => {
    const current = filters[key] as unknown as string[];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next } as KYFilters);
  };

  const clearAdvanced = () => {
    onChange({
      ...filters,
      cities: [], gender: 'any', ageMin: '', ageMax: '', mbti: [], meal: 'any',
      chronotype: 'any', tshirtSizes: [], hasLaptop: 'any', languages: [],
      hasPhotos: 'any', hasCommunity: 'any', submittedFrom: '', submittedTo: '',
    });
  };

  return (
    <div className="space-y-3">
      {/* Row 1 — cohort pills + primary export */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1">Cohort</span>
          <Badge
            variant={!filters.cohort ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => set('cohort', null)}
          >
            All
          </Badge>
          {COHORT_TYPES.map(c => (
            <Badge
              key={c.value}
              variant={filters.cohort === c.value ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => set('cohort', c.value)}
            >
              {c.label}
            </Badge>
          ))}
        </div>

        <Button
          size="sm"
          className="gap-1.5 h-9 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onExport}
          disabled={exportDisabled}
          title="Exports only the students matching every active filter"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {exportLabel}
        </Button>
      </div>

      {/* Row 2 — edition / status / search / advanced / clear / count */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Edition</span>
          <Select value={filters.edition} onValueChange={v => set('edition', v)}>
            <SelectTrigger className="h-8 text-xs w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All editions</SelectItem>
              {options.editions.map(name => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</span>
          <Select value={filters.completion} onValueChange={v => set('completion', v as CompletionFilter)}>
            <SelectTrigger className="h-8 text-xs w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any status</SelectItem>
              <SelectItem value="complete">KY completed</SelectItem>
              <SelectItem value="incomplete">KY incomplete</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search name, email, edition…"
            value={filters.search}
            onChange={e => set('search', e.target.value)}
            className="pl-8 h-8 text-xs w-[260px]"
          />
        </div>

        {/* Advanced filters popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <Sliders className="w-3 h-3" /> More filters
              {advancedCount > 0 && (
                <Badge variant="outline" className="h-4 px-1 text-[9px] bg-primary/20 text-primary border-primary/40">
                  {advancedCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[540px] max-w-[calc(100vw-2rem)] p-0" align="end">
            <AdvancedFiltersPanel
              filters={filters}
              options={options}
              set={set}
              toggleInArray={toggleInArray}
              clearAdvanced={clearAdvanced}
            />
          </PopoverContent>
        </Popover>

        {anyActive && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground gap-1"
            onClick={() => onChange(EMPTY_KY_FILTERS)}
          >
            <X className="w-3 h-3" /> Clear filters
          </Button>
        )}

        <div className="ml-auto text-[11px] text-muted-foreground">
          {visibleCount} {visibleCount === 1 ? 'student' : 'students'}
          {selectedCount > 0 && ` · ${selectedCount} selected`}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────── Advanced panel ───────────────────────────────

interface AdvOptions {
  cities: string[];
  mbti: string[];
  editions: string[];
}

const AdvancedFiltersPanel: React.FC<{
  filters: KYFilters;
  options: AdvOptions;
  set: <K extends keyof KYFilters>(key: K, value: KYFilters[K]) => void;
  toggleInArray: <K extends keyof KYFilters>(key: K, value: string) => void;
  clearAdvanced: () => void;
}> = ({ filters, options, set, toggleInArray, clearAdvanced }) => {
  return (
    <div>
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">More filters</p>
          <p className="text-[11px] text-muted-foreground">All filters stack on top of the cohort + edition above.</p>
        </div>
        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={clearAdvanced}>
          Reset
        </Button>
      </div>

      <ScrollArea className="max-h-[70vh]">
        <div className="p-4 space-y-5">
          {/* People */}
          <FilterGroup title="People">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Gender</Label>
                <Select value={filters.gender} onValueChange={v => set('gender', v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map(g => <SelectItem key={g} value={g}>{g === 'any' ? 'Any' : g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Age range</Label>
                <div className="flex gap-1.5">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.ageMin}
                    onChange={e => set('ageMin', e.target.value)}
                    className="h-8 text-xs"
                    min={0}
                    max={120}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.ageMax}
                    onChange={e => set('ageMax', e.target.value)}
                    className="h-8 text-xs"
                    min={0}
                    max={120}
                  />
                </div>
              </div>
            </div>
          </FilterGroup>

          {/* Location */}
          <FilterGroup title="Location">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Cities</Label>
            <CheckboxGrid
              options={options.cities}
              selected={filters.cities}
              onToggle={v => toggleInArray('cities', v)}
              empty="No cities yet in this cohort."
            />
          </FilterGroup>

          {/* Preferences */}
          <FilterGroup title="Preferences">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Meal preference</Label>
                <Select value={filters.meal} onValueChange={v => set('meal', v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MEAL_OPTIONS.map(m => <SelectItem key={m} value={m}>{m === 'any' ? 'Any' : m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Chronotype</Label>
                <Select value={filters.chronotype} onValueChange={v => set('chronotype', v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CHRONO_OPTIONS.map(c => <SelectItem key={c} value={c}>{c === 'any' ? 'Any' : c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1 mt-3">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">T-shirt size</Label>
              <div className="flex flex-wrap gap-1.5">
                {TSHIRT_SIZES.map(sz => (
                  <Badge
                    key={sz}
                    variant={filters.tshirtSizes.includes(sz) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleInArray('tshirtSizes', sz)}
                  >
                    {sz}
                  </Badge>
                ))}
              </div>
            </div>
          </FilterGroup>

          {/* Equipment */}
          <FilterGroup title="Equipment">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Bringing a laptop</Label>
              <Select value={filters.hasLaptop} onValueChange={v => set('hasLaptop', v as TriState)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="yes">Yes — has laptop</SelectItem>
                  <SelectItem value="no">No — needs one</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FilterGroup>

          {/* Creative */}
          <FilterGroup title="Creative">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">MBTI types</Label>
              <CheckboxGrid
                options={options.mbti}
                selected={filters.mbti}
                onToggle={v => toggleInArray('mbti', v)}
                empty="No MBTI values yet in this cohort."
              />
            </div>
            <div className="space-y-2 mt-3">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Languages known</Label>
              <div className="flex flex-wrap gap-1.5">
                {KNOWN_LANGUAGES.map(lang => (
                  <Badge
                    key={lang}
                    variant={filters.languages.includes(lang) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleInArray('languages', lang)}
                  >
                    {lang}
                  </Badge>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">
                A student matches only if they know ALL selected languages.
              </p>
            </div>
          </FilterGroup>

          {/* Completeness */}
          <FilterGroup title="Completeness">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Photos uploaded</Label>
                <Select value={filters.hasPhotos} onValueChange={v => set('hasPhotos', v as TriState)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="yes">Has photos</SelectItem>
                    <SelectItem value="no">Missing photos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Community profile</Label>
                <Select value={filters.hasCommunity} onValueChange={v => set('hasCommunity', v as TriState)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="yes">Created</SelectItem>
                    <SelectItem value="no">Missing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Submitted from</Label>
                <Input
                  type="date"
                  value={filters.submittedFrom}
                  onChange={e => set('submittedFrom', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Submitted to</Label>
                <Input
                  type="date"
                  value={filters.submittedTo}
                  onChange={e => set('submittedTo', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </FilterGroup>
        </div>
      </ScrollArea>
    </div>
  );
};

// ─────────────────────────── Small bits ───────────────────────────────────

const FilterGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-2">
    <p className="text-xs font-semibold text-foreground">{title}</p>
    <div>{children}</div>
  </div>
);

const CheckboxGrid: React.FC<{
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  empty?: string;
}> = ({ options, selected, onToggle, empty }) => {
  if (options.length === 0) {
    return <p className="text-[11px] text-muted-foreground italic">{empty || 'No values.'}</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
      {options.map(opt => (
        <label
          key={opt}
          className="flex items-center gap-2 cursor-pointer hover:bg-muted/30 rounded px-1.5 py-0.5"
        >
          <Checkbox
            checked={selected.includes(opt)}
            onCheckedChange={() => onToggle(opt)}
            className="h-3.5 w-3.5"
          />
          <span className="text-xs truncate">{opt}</span>
        </label>
      ))}
    </div>
  );
};
