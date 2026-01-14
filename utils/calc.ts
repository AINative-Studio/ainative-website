// utils/calc.ts

/**
 * Calculates how many full days remain until a given ISO date.
 */
export function calculateDaysRemaining(dateStr: string): number {
    const futureDate = new Date(dateStr);
    const diff = futureDate.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
