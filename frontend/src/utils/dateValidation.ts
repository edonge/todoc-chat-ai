/**
 * Validates if a string is in YYYY-MM-DD format
 * @param dateString - The date string to validate
 * @returns true if valid YYYY-MM-DD format, false otherwise
 */
export function isValidYYYYMMDD(dateString: string): boolean {
  // Check if the string matches YYYY-MM-DD pattern
  const yyyyMMddPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!yyyyMMddPattern.test(dateString)) {
    return false;
  }

  // Parse the date components
  const parts = dateString.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  // Check if year, month, and day are valid numbers
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return false;
  }

  // Check if month is between 1-12
  if (month < 1 || month > 12) {
    return false;
  }

  // Check if day is between 1-31 (basic check)
  if (day < 1 || day > 31) {
    return false;
  }

  // Check if the date is actually valid (e.g., not Feb 30)
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false;
  }

  return true;
}

/**
 * Validates if a YYYY-MM-DD date string is in the past
 * @param dateString - The date string in YYYY-MM-DD format
 * @returns true if the date is in the past, false otherwise
 */
export function isDateInPast(dateString: string): boolean {
  if (!isValidYYYYMMDD(dateString)) {
    return false;
  }

  const [year, month, day] = dateString.split('-').map(Number);
  const inputDate = new Date(year, month - 1, day);
  const today = new Date();
  
  // Reset time to compare dates only
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);
  
  return inputDate <= today;
}

/**
 * Formats a date string to ensure it's in YYYY-MM-DD format
 * @param dateString - The date string to format
 * @returns Formatted date string or empty string if invalid
 */
export function formatToYYYYMMDD(dateString: string): string {
  // Remove any whitespace
  const cleaned = dateString.trim();
  
  // If already in YYYY-MM-DD format, return as is
  if (isValidYYYYMMDD(cleaned)) {
    return cleaned;
  }
  
  return '';
}

