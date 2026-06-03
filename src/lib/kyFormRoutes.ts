/**
 * Shared utility for KY form routing.
 * Maps cohort types to their first section key in the new unified flow.
 */

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
