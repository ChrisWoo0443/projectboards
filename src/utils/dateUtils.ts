/**
 * Utility functions for date parsing and validation
 */

export interface DateParseResult {
  isValid: boolean;
  date?: Date;
  error?: string;
}

/**
 * Parse a date string in MM/DD/YYYY format
 * @param dateString - The date string to parse
 * @returns Object containing validation result and parsed date
 */
export const parseDateString = (dateString: string): DateParseResult => {
  if (!dateString || dateString.length !== 10) {
    return { isValid: false, error: "Date must be in MM/DD/YYYY format" };
  }

  const dateParts = dateString.split('/');
  
  if (dateParts.length !== 3) {
    return { isValid: false, error: "Please enter a valid date in MM/DD/YYYY format" };
  }

  const month = parseInt(dateParts[0]);
  const day = parseInt(dateParts[1]);
  const year = parseInt(dateParts[2]);

  // Validate date components
  if (isNaN(month) || isNaN(day) || isNaN(year)) {
    return { isValid: false, error: "Please enter a valid date in MM/DD/YYYY format" };
  }

  if (month < 1 || month > 12) {
    return { isValid: false, error: "Month must be between 1 and 12" };
  }

  if (day < 1 || day > 31) {
    return { isValid: false, error: "Day must be between 1 and 31" };
  }

  if (year < 2000 || year > 2100) {
    return { isValid: false, error: "Year must be between 2000 and 2100" };
  }

  // Create date object using timezone-aware format to avoid timezone issues
  // Use yyyy/mm/dd HH:MM:SS format which JavaScript interprets as local time
  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  const date = new Date(`${year}/${monthStr}/${dayStr} 12:00:00`);

  
  // Check if the date is valid (handles cases like February 30th)
  if (isNaN(date.getTime()) || 
      date.getFullYear() !== year || 
      date.getMonth() !== month - 1 || 
      date.getDate() !== day) {
    return { isValid: false, error: "Please enter a valid date" };
  }

  return { isValid: true, date };
};

/**
 * Format a Date object to MM/DD/YYYY string
 * @param date - The date to format
 * @returns Formatted date string
 */
export const formatDateToString = (date: Date): string => {
  if (!date || isNaN(date.getTime())) {
    return '';
  }
  
  // Create a new date at noon to avoid timezone issues when formatting
  const normalizedDate = new Date(date);
  normalizedDate.setHours(12, 0, 0, 0);
  
  const month = (normalizedDate.getMonth() + 1).toString().padStart(2, '0');
  const day = normalizedDate.getDate().toString().padStart(2, '0');
  const year = normalizedDate.getFullYear();
  
  return `${month}/${day}/${year}`;
};