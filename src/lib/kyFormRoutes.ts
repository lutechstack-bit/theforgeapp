/**
 * Shared utility for KY form routing.
 * Maps cohort types to their first section key in the new unified flow.
 */

// Cohorts that have a built KY form. Forge AI (FAI) intentionally has NO form
// yet — its "Know Your Builder" (KYB) form isn't built, so we must NOT fall
// back to the Filmmaking form for FAI students. Gate every KY surface on this.
export const COHORTS_WITH_KY_FORM = ['FFM', 'FC', 'FW'];

export const kyFormAvailable = (cohortType?: string | null): boolean =>
  !!cohortType && COHORTS_WITH_KY_FORM.includes(cohortType);

export const getKYFormSectionRoute = (cohortType?: string | null): string => {
  switch (cohortType) {
    case 'FFM':
      return '/ky-section/filmmaker_profile';
    case 'FC':
      return '/ky-section/creator_profile';
    case 'FW':
      return '/ky-section/writer_profile';
    default:
      return '/ky-section/filmmaker_profile';
  }
};

export const getKYFormName = (cohortType?: string | null): string => {
  switch (cohortType) {
    case 'FFM':
      return 'Know Your Filmmaker';
    case 'FC':
      return 'Know Your Creator';
    case 'FW':
      return 'Know Your Writer';
    default:
      return 'Complete KY Form';
  }
};

export const getKYFormShortName = (cohortType?: string | null): string => {
  switch (cohortType) {
    case 'FC':
      return 'KYC Form';
    case 'FW':
      return 'KYW Form';
    default:
      return 'KYF Form';
  }
};
