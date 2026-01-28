export type ForgeMode = 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';

interface ForgeModeOptions {
  simulatedMode?: ForgeMode | null;
  simulatedDate?: Date | null;
}

export function calculateForgeMode(
  forgeStartDate: string | null | undefined,
  forgeEndDate: string | null | undefined,
  options?: ForgeModeOptions
): ForgeMode {
  // If admin has simulation active, use that mode directly
  if (options?.simulatedMode) {
    return options.simulatedMode;
  }

  if (!forgeStartDate) {
    return 'PRE_FORGE';
  }

  // Use simulated date if provided, otherwise use real time
  const now = options?.simulatedDate || new Date();
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
