// Edition display helpers.
//
// Editions are stored with a short name (e.g. "E7") and a `cohort_type`
// (FFM/FW/FC/FAI). The cohort carries the program, so for display we combine
// them into "Forge Writing Retreat - E7" — short to manage, clear to read.

export const COHORT_FULL_NAMES: Record<string, string> = {
  FFM: 'Forge Filmmaking Bootcamp',
  FW: 'Forge Writing Retreat',
  FC: 'Forge Creator Residency',
  FAI: 'Forge AI Residency',
};

export const COHORT_SHORT_NAMES: Record<string, string> = {
  FFM: 'Forge Filmmaking',
  FW: 'Forge Writing',
  FC: 'Forge Creators',
  FAI: 'Forge AI',
};

/**
 * "Forge Writing Retreat - E7" (cohort + short edition name).
 * Robust against both states: if the stored name still contains the full program
 * text (pre-rename, e.g. "Forge Creator Residency - E6") it's returned as-is, so
 * we never double-prefix.
 */
export function editionLabel(
  edition?: { name?: string | null; cohort_type?: string | null } | null,
): string {
  if (!edition) return '';
  const cohort = COHORT_FULL_NAMES[edition.cohort_type || ''] || '';
  const name = (edition.name || '').trim();
  if (!name) return cohort || 'Edition';
  // Name already has a program/cohort prefix → don't prepend again.
  if (!cohort || /forge/i.test(name)) return name;
  return `${cohort} - ${name}`;
}
