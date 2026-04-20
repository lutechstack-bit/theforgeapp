/**
 * kyFieldSchema — the single source of truth for how KY form responses are
 * presented in the admin UI and exported to CSV.
 *
 * Why this exists
 * ────────────────
 * The underlying Supabase tables (kyf_responses / kyc_responses / kyw_responses
 * and the newer ky_dynamic_responses.responses JSON) use snake_case keys that
 * are useless to humans. We historically rendered them with a naive
 * `formatLabel` that turned `proficiency_cinematography` into
 * "Proficiency Cinematography" — correct but ugly, and the CSV inherited the
 * same raw keys as headers.
 *
 * This module defines:
 *  1. `KY_SECTIONS`: ordered sections grouping related fields for the detail
 *     panel (Identity, Contact, Address, Skills, ...).
 *  2. Human labels for every field, matching the original Tally form CSV the
 *     team knows from E17 (e.g. "Full name (as you want it on your
 *     certificate)").
 *  3. Per-field renderer hints (`photo`, `level`, `boolean`, `list`, ...) so
 *     the detail panel can show thumbnails, badges, or progress labels
 *     instead of raw strings.
 *  4. `toCsvRows` + `toCsvHeaders` helpers that produce a clean, ordered
 *     export using the same labels.
 */

// ─────────────────────────── Field rendering types ────────────────────────

export type KyFieldRender =
  | 'text'
  | 'long_text'
  | 'email'
  | 'phone'
  | 'url'
  | 'photo'
  | 'number'
  | 'date'
  | 'boolean'
  | 'list'           // string[] — render as chips / join with '; '
  | 'level'          // skill level strings like "I am just getting started"
  | 'enum';          // pre-defined options we can badge

export interface KyField {
  /** Supabase column name (matches kyf/kyc/kyw table). */
  key: string;
  /** Human label — used for both detail panel and CSV header. */
  label: string;
  /** Short label (optional) for the table header in the list view. */
  shortLabel?: string;
  render: KyFieldRender;
  /** If true, the value is a URL we should shorten for display / export. */
  stripTokens?: boolean;
}

export interface KySection {
  id: string;
  title: string;
  /** Lucide icon name as string — component resolves this at render time. */
  icon: string;
  /** If true, fields render in a 2-col grid; else stacked. */
  twoCol?: boolean;
  fields: KyField[];
}

// ─────────────────────────── The canonical schema ─────────────────────────
// Order here IS the order columns appear in CSV and sections appear in the
// detail panel. Any field on kyf/kyc/kyw that we don't list here still shows
// at the bottom under "Additional fields" — but it won't be cleanly labeled
// until we add it here.

export const KY_SECTIONS: KySection[] = [
  {
    id: 'identity',
    title: 'Identity',
    icon: 'User',
    twoCol: true,
    fields: [
      { key: 'certificate_name', label: 'Full name (as you want it on your certificate)', shortLabel: 'Certificate name', render: 'text' },
      { key: 'age', label: 'Age', render: 'number' },
      { key: 'date_of_birth', label: 'Date of birth', render: 'date' },
      { key: 'gender', label: 'Gender', render: 'text' },
      { key: 'tshirt_size', label: 'T-shirt size', render: 'text' },
      { key: 'height_ft', label: 'Height (ft)', render: 'text' },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    icon: 'AtSign',
    twoCol: true,
    fields: [
      { key: 'email', label: 'Email', render: 'email' },
      { key: 'whatsapp_number', label: 'WhatsApp number', render: 'phone' },
      { key: 'instagram_id', label: 'Instagram ID', render: 'text' },
    ],
  },
  {
    id: 'address',
    title: 'Address',
    icon: 'MapPin',
    twoCol: true,
    fields: [
      { key: 'address_line_1', label: 'Address line 1', render: 'text' },
      { key: 'address_line_2', label: 'Address line 2', render: 'text' },
      { key: 'city', label: 'City', render: 'text' },
      { key: 'state', label: 'State', render: 'text' },
      { key: 'pincode', label: 'Pincode', render: 'text' },
      { key: 'country', label: 'Country', render: 'text' },
    ],
  },
  {
    id: 'current',
    title: 'Current status',
    icon: 'Briefcase',
    fields: [
      { key: 'current_occupation', label: 'What are you currently doing?', render: 'long_text' },
      // creators / writers variants
      { key: 'current_status', label: 'Current status', render: 'long_text' },
    ],
  },
  {
    id: 'emergency',
    title: 'Emergency contact',
    icon: 'PhoneCall',
    twoCol: true,
    fields: [
      { key: 'emergency_contact_name', label: 'Emergency contact name', render: 'text' },
      { key: 'emergency_contact_number', label: 'Emergency contact number', render: 'phone' },
    ],
  },
  {
    id: 'skills',
    title: 'Self-assessed skill levels',
    icon: 'Film',
    twoCol: true,
    fields: [
      { key: 'proficiency_screenwriting', label: 'Screenwriting', render: 'level' },
      { key: 'proficiency_direction', label: 'Film Direction', render: 'level' },
      { key: 'proficiency_cinematography', label: 'Cinematography', render: 'level' },
      { key: 'proficiency_editing', label: 'Editing', render: 'level' },
      // creators variants
      { key: 'proficiency_content_creation', label: 'Content creation', render: 'level' },
      { key: 'proficiency_storytelling', label: 'Storytelling', render: 'level' },
      { key: 'proficiency_video_production', label: 'Video production', render: 'level' },
      // writers variants
      { key: 'proficiency_writing', label: 'Writing', render: 'level' },
      { key: 'proficiency_story_voice', label: 'Story voice', render: 'level' },
    ],
  },
  {
    id: 'favourites',
    title: 'Favourites & taste',
    icon: 'Sparkles',
    fields: [
      { key: 'top_3_movies', label: 'Top 3 movies', render: 'list' },
      { key: 'top_3_creators', label: 'Top 3 creators', render: 'list' },
      { key: 'top_3_writers_books', label: 'Top 3 writers/books', render: 'list' },
      { key: 'primary_platform', label: 'Primary platform', render: 'text' },
      { key: 'primary_language', label: 'Primary language', render: 'text' },
      { key: 'writing_types', label: 'Writing types', render: 'list' },
    ],
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle',
    icon: 'Coffee',
    twoCol: true,
    fields: [
      { key: 'chronotype', label: 'Early bird / Night owl', render: 'text' },
      { key: 'meal_preference', label: 'Meal preference', render: 'text' },
      { key: 'food_allergies', label: 'Food allergies', render: 'long_text' },
      { key: 'medication_support', label: 'Medication support needs', render: 'long_text' },
      { key: 'languages_known', label: 'Languages known', render: 'list' },
      { key: 'has_editing_laptop', label: 'Will bring editing laptop', render: 'boolean' },
    ],
  },
  {
    id: 'photos',
    title: 'Photos',
    icon: 'Camera',
    fields: [
      { key: 'photo_favorite_url', label: 'A photo you love', render: 'photo', stripTokens: true },
      { key: 'headshot_front_url', label: 'Headshot — front', render: 'photo', stripTokens: true },
      { key: 'headshot_right_url', label: 'Headshot — right', render: 'photo', stripTokens: true },
      { key: 'headshot_left_url', label: 'Headshot — left', render: 'photo', stripTokens: true },
      { key: 'full_body_url', label: 'Full body shot', render: 'photo', stripTokens: true },
    ],
  },
  {
    id: 'personality',
    title: 'Personality',
    icon: 'Brain',
    twoCol: true,
    fields: [
      { key: 'mbti_type', label: 'Myers-Briggs type (MBTI)', render: 'text' },
    ],
  },
  {
    id: 'motivation',
    title: 'What they want from the Forge',
    icon: 'Target',
    fields: [
      { key: 'forge_intent_selection', label: 'Main intent', render: 'text' },
      { key: 'forge_intent_other', label: 'Other details / context', render: 'long_text' },
    ],
  },
  {
    id: 'terms',
    title: 'Terms',
    icon: 'FileCheck',
    twoCol: true,
    fields: [
      { key: 'terms_accepted', label: 'Terms accepted', render: 'boolean' },
      { key: 'terms_accepted_at', label: 'Accepted at', render: 'date' },
    ],
  },
];

/** Flat list of every field in schema order. */
export const KY_FIELDS_ORDERED: KyField[] = KY_SECTIONS.flatMap(s => s.fields);

/** Map from field key → field meta, for O(1) lookup. */
export const KY_FIELD_BY_KEY: Record<string, KyField> = Object.fromEntries(
  KY_FIELDS_ORDERED.map(f => [f.key, f])
);

const SKIP_KEYS = new Set(['id', 'user_id', 'created_at', 'updated_at']);

/** Fields present in raw kyData but not in the schema — rendered under "Other". */
export function extraKeys(kyData: Record<string, unknown> | null | undefined): string[] {
  if (!kyData) return [];
  return Object.keys(kyData)
    .filter(k => !SKIP_KEYS.has(k) && !KY_FIELD_BY_KEY[k]);
}

// ─────────────────────────── Value formatters ─────────────────────────────

/**
 * Photo URLs that come from Tally storage have very long signed tokens. For
 * the CSV we keep the full URL (so admins can still open the asset) but strip
 * the noisy querystring for clickable links in the detail panel.
 */
export function stripUrlTokens(url: string): string {
  try {
    const u = new URL(url);
    // Remove tracking/signing params but keep the path so the filename is visible.
    return `${u.protocol}//${u.host}${u.pathname}`;
  } catch {
    return url;
  }
}

/** Human-readable display for any value. */
export function formatKyValueForDisplay(
  value: unknown,
  render: KyFieldRender
): string {
  if (value === null || value === undefined || value === '') return '—';
  switch (render) {
    case 'boolean':
      return value === true || value === 'true' ? 'Yes' : 'No';
    case 'list':
      if (Array.isArray(value)) return value.filter(Boolean).join(', ');
      if (typeof value === 'string') return value;
      return String(value);
    case 'date':
      try {
        const d = new Date(String(value));
        if (!Number.isNaN(d.getTime())) {
          return d.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
        }
      } catch { /* fallthrough */ }
      return String(value);
    case 'photo':
    case 'url':
      return stripUrlTokens(String(value));
    default:
      if (Array.isArray(value)) return value.join(', ');
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
  }
}

/** CSV-escape a single cell. */
export function escapeCsv(val: unknown): string {
  if (val === null || val === undefined) return '';
  let str: string;
  if (typeof val === 'boolean') str = val ? 'Yes' : 'No';
  else if (Array.isArray(val)) str = val.filter(Boolean).join('; ');
  else if (typeof val === 'object') str = JSON.stringify(val);
  else str = String(val);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

// ─────────────────────────── CSV builder ──────────────────────────────────

export interface CsvStudentRow {
  full_name: string | null;
  email: string | null;
  city: string | null;
  edition_name: string | null;
  cohort_type: string | null;
  ky_form_completed: boolean;
  has_collaborator_profile: boolean;
  mbti_type: string | null;
  kyData: Record<string, unknown> | null | undefined;
  collabData: Record<string, unknown> | null | undefined;
}

/** Baseline profile columns that every row has, even without a KY submission. */
const PROFILE_COLUMNS: { key: string; label: string; get: (s: CsvStudentRow) => unknown }[] = [
  { key: 'full_name', label: 'Full name', get: s => s.full_name },
  { key: 'email', label: 'Email', get: s => s.email },
  { key: 'edition_name', label: 'Edition', get: s => s.edition_name },
  { key: 'cohort_type', label: 'Cohort type', get: s => s.cohort_type },
  { key: 'city_profile', label: 'City (profile)', get: s => s.city },
  { key: 'ky_form_completed', label: 'KY form completed', get: s => s.ky_form_completed },
  { key: 'has_collaborator_profile', label: 'Has community profile', get: s => s.has_collaborator_profile },
];

const COMMUNITY_COLUMNS: { key: string; label: string; get: (s: CsvStudentRow) => unknown }[] = [
  { key: 'collab_tagline', label: 'Community: tagline', get: s => s.collabData?.tagline },
  { key: 'collab_occupations', label: 'Community: occupations', get: s => s.collabData?.occupations },
  { key: 'collab_about', label: 'Community: about', get: s => s.collabData?.about },
  { key: 'collab_intro', label: 'Community: intro', get: s => s.collabData?.intro },
  { key: 'collab_portfolio_url', label: 'Community: portfolio URL', get: s => s.collabData?.portfolio_url },
  { key: 'collab_open_to_remote', label: 'Community: open to remote', get: s => s.collabData?.open_to_remote },
  { key: 'collab_available_for_hire', label: 'Community: available for hire', get: s => s.collabData?.available_for_hire },
];

export interface CsvExport {
  headers: string[];
  rows: string[][];
}

export function buildCsvExport(rows: CsvStudentRow[]): CsvExport {
  // Collect any "extra" keys (fields not yet in the schema) so nothing's lost.
  const extraKeysSet = new Set<string>();
  rows.forEach(r => extraKeys(r.kyData).forEach(k => extraKeysSet.add(k)));
  const extras = Array.from(extraKeysSet).sort();

  const headers = [
    ...PROFILE_COLUMNS.map(c => c.label),
    ...KY_FIELDS_ORDERED.map(f => f.label),
    ...COMMUNITY_COLUMNS.map(c => c.label),
    ...extras.map(k => `Other: ${k.replace(/_/g, ' ')}`),
  ];

  const csvRows = rows.map(s =>
    [
      ...PROFILE_COLUMNS.map(c => escapeCsv(c.get(s))),
      ...KY_FIELDS_ORDERED.map(f => {
        const raw = s.kyData?.[f.key];
        // For photos keep the full URL (with token) so admins can open the
        // asset directly from a spreadsheet — only displayed/stripped for UI.
        if (f.render === 'photo' || f.render === 'url') {
          return escapeCsv(raw);
        }
        if (f.render === 'boolean') {
          const v = raw === true || raw === 'true';
          return escapeCsv(v);
        }
        return escapeCsv(raw);
      }),
      ...COMMUNITY_COLUMNS.map(c => escapeCsv(c.get(s))),
      ...extras.map(k => escapeCsv(s.kyData?.[k])),
    ]
  );

  return { headers, rows: csvRows };
}

/** Triggers a download of the CSV in the browser. */
export function downloadCsv(filename: string, exp: CsvExport) {
  const body = [exp.headers.join(','), ...exp.rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([body], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
