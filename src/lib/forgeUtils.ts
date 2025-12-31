type ForgeMode = 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';

export function calculateForgeMode(
  forgeStartDate: string | null | undefined,
  forgeEndDate: string | null | undefined
): ForgeMode {
  if (!forgeStartDate) {
    return 'PRE_FORGE';
  }

  const now = new Date();
  const startDate = new Date(forgeStartDate);
  
  // Set start date to beginning of day for comparison
  startDate.setHours(0, 0, 0, 0);
  
  if (now < startDate) {
    return 'PRE_FORGE';
  }

  if (forgeEndDate) {
    const endDate = new Date(forgeEndDate);
    // Set end date to end of day for comparison
    endDate.setHours(23, 59, 59, 999);
    
    if (now > endDate) {
      return 'POST_FORGE';
    }
  }

  return 'DURING_FORGE';
}
