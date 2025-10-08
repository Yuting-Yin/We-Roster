// src/lib/dateValidation.ts
/**
 * Check if a date is before the current date (ignoring time)
 * @param date - The date to check
 * @returns true if the date is before today, false otherwise
 */
export const isDateInPast = (date: Date | undefined | null): boolean => {
  if (!date) return false; // If date is undefined/null, consider it not in the past
  
  const today = new Date();
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const checkDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  return checkDateOnly < todayDateOnly;
};

/**
 * Check if a date string (YYYY-MM-DD format) is before the current date
 * @param dateString - The date string to check
 * @returns true if the date is before today, false otherwise
 */
export const isDateStringInPast = (dateString: string | undefined | null): boolean => {
  if (!dateString) return false; // If dateString is undefined/null, consider it not in the past
  
  const date = new Date(dateString + 'T00:00:00.000Z');
  return isDateInPast(date);
};

/**
 * Get a user-friendly error message for past date requests
 * @param date - The invalid date
 * @returns Error message string
 */
export const getPastDateErrorMessage = (date: Date): string => {
  const today = new Date();
  const todayStr = today.toLocaleDateString();
  const dateStr = date.toLocaleDateString();
  
  return `Cannot submit requests for past dates. Selected date: ${dateStr}, Today: ${todayStr}`;
};
