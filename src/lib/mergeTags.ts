// Shared merge-tag catalog + resolver used by the admin email UI.
//
// The authoritative resolver lives in the edge functions (send-email,
// preview-email) so the server never trusts client-side rendering. This file
// exists for three reasons:
//   1. The admin preview iframe needs to render instantly on every keystroke
//      without a network round-trip.
//   2. The template editor's "insert tag" chips need a single list to read.
//   3. Pre-send validation (warning UI) can flag unresolved tags before the
//      user clicks Send.

export interface MergeTagDescriptor {
  key: string;
  label: string;
  example: string;
  category: 'user' | 'edition' | 'app' | 'custom';
}

export const MERGE_TAGS: MergeTagDescriptor[] = [
  // User ------------------------------------------------------------------
  { key: 'user.first_name', label: 'First name', example: 'Nasar', category: 'user' },
  { key: 'user.last_name', label: 'Last name', example: 'Muhammed Nabeel', category: 'user' },
  { key: 'user.full_name', label: 'Full name', example: 'Nasar Muhammed Nabeel', category: 'user' },
  { key: 'user.email', label: 'Email', example: 'nasarmuhammed@gmail.com', category: 'user' },
  { key: 'user.phone', label: 'Phone', example: '+91 93449 65017', category: 'user' },
  { key: 'user.city', label: 'City', example: 'Goa', category: 'user' },
  // Edition ---------------------------------------------------------------
  { key: 'edition.name', label: 'Edition name', example: 'Forge Filmmaking Bootcamp – E17', category: 'edition' },
  { key: 'edition.cohort_type', label: 'Cohort type', example: 'FORGE', category: 'edition' },
  { key: 'edition.city', label: 'Edition city', example: 'Goa', category: 'edition' },
  { key: 'edition.forge_start_date', label: 'Forge start date', example: 'Apr 26, 2026', category: 'edition' },
  { key: 'edition.forge_end_date', label: 'Forge end date', example: 'May 09, 2026', category: 'edition' },
  { key: 'edition.days_until_start', label: 'Days until start', example: '7', category: 'edition' },
  // App -------------------------------------------------------------------
  { key: 'app.login_url', label: 'Login URL', example: 'https://app.forgebylevelup.com/auth', category: 'app' },
  { key: 'app.name', label: 'App name', example: 'The Forge', category: 'app' },
  // Custom / send-time ----------------------------------------------------
  {
    key: 'user.temp_password',
    label: 'Temp password',
    example: 'Nasar@Forge!',
    category: 'custom',
  },
];

export const MERGE_TAG_KEYS = MERGE_TAGS.map((t) => t.key);

/**
 * Pulls every `{{ tag }}` reference out of a template body. Keys must be
 * alphanumeric + `_` + `.`.
 */
export function extractTags(template: string): string[] {
  const tags = new Set<string>();
  const regex = /\{\{\s*([a-z_.]+)\s*\}\}/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(template)) !== null) tags.add(m[1]);
  return Array.from(tags);
}

/** First-word + Title-case — same helper as the SQL password reset logic. */
function firstNameFrom(fullName?: string | null): string {
  if (!fullName) return '';
  const raw = fullName.trim().split(/\s+/)[0] || '';
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase() : '';
}

function lastNameFrom(fullName?: string | null): string {
  if (!fullName) return '';
  return fullName.trim().split(/\s+/).slice(1).join(' ');
}

function formatDate(iso?: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function daysUntil(iso?: string | null): string {
  if (!iso) return '';
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
  return String(days);
}

/**
 * Builds the full merge-value map given a profile row + edition row (either
 * can be null). Overrides win over computed defaults — used for per-recipient
 * temp passwords at send time.
 */
export function buildMergeValues(
  profile: {
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    city?: string | null;
  } | null,
  edition: {
    name?: string | null;
    cohort_type?: string | null;
    city?: string | null;
    forge_start_date?: string | null;
    forge_end_date?: string | null;
  } | null,
  overrides: Record<string, string | null | undefined> = {}
): Record<string, string> {
  const fullName = profile?.full_name || '';
  const values: Record<string, string> = {
    'user.first_name': firstNameFrom(fullName),
    'user.last_name': lastNameFrom(fullName),
    'user.full_name': fullName,
    'user.email': profile?.email || '',
    'user.phone': profile?.phone || '',
    'user.city': profile?.city || '',
    'user.temp_password': '',
    'edition.name': edition?.name || '',
    'edition.cohort_type': edition?.cohort_type || '',
    'edition.city': edition?.city || '',
    'edition.forge_start_date': formatDate(edition?.forge_start_date),
    'edition.forge_end_date': formatDate(edition?.forge_end_date),
    'edition.days_until_start': daysUntil(edition?.forge_start_date),
    'app.login_url': 'https://app.forgebylevelup.com/auth',
    'app.name': 'The Forge',
  };
  for (const [k, v] of Object.entries(overrides)) {
    if (v !== undefined && v !== null) values[k] = String(v);
  }
  return values;
}

/**
 * Replaces `{{ tag }}` occurrences using `values`. Tags that don't resolve
 * become empty strings and are listed in `unresolvedTags` (only tags the
 * template actually references are ever flagged).
 */
export function resolveMergeTags(
  template: string,
  values: Record<string, string | null | undefined>
): { rendered: string; unresolvedTags: string[] } {
  const unresolvedTags: string[] = [];
  const rendered = template.replace(/\{\{\s*([a-z_.]+)\s*\}\}/gi, (_, key) => {
    const v = values[key];
    if (v === undefined || v === null || v === '') {
      unresolvedTags.push(key);
      return '';
    }
    return String(v);
  });
  return { rendered, unresolvedTags };
}
