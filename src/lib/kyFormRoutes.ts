/**
 * Shared utility for KY form routing.
 * Maps cohort types to their first section key in the new unified flow.
 */

export const getKYFormSectionRoute = (cohortType?: string | null): string => {
  switch (cohortType) {
    case 'FORGE':
      return '/ky-section/filmmaker_profile';
    case 'FORGE_CREATORS':
      return '/ky-section/creator_profile';
    case 'FORGE_WRITING':
      return '/ky-section/writer_profile';
    default:
      return '/ky-section/filmmaker_profile';
  }
};

export const getKYFormName = (cohortType?: string | null): string => {
  switch (cohortType) {
    case 'FORGE':
      return 'Know Your Filmmaker';
    case 'FORGE_CREATORS':
      return 'Know Your Creator';
    case 'FORGE_WRITING':
      return 'Know Your Writer';
    default:
      return 'Complete KY Form';
  }
};

export const getKYFormShortName = (cohortType?: string | null): string => {
  switch (cohortType) {
    case 'FORGE_CREATORS':
      return 'KYC Form';
    case 'FORGE_WRITING':
      return 'KYW Form';
    default:
      return 'KYF Form';
  }
};
