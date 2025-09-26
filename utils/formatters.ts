// A file with helper functions for formatting

/**
 * Converts a string or number to its string representation.
 * The original function converted numbers to Eastern Arabic numerals, but this has been reverted.
 * @param input The string or number to convert.
 * @returns A string representation of the input.
 */
export const toArabic = (input: string | number): string => {
  if (input === null || input === undefined) return '';
  return String(input);
};

/**
 * Formats a number as a Saudi Riyal currency value, with English numerals.
 * @param amount The number to format.
 * @param showSymbol Whether to show the "ريال" currency symbol. Defaults to true.
 * @returns A formatted currency string.
 */
export const formatCurrencySAR = (amount: number, showSymbol: boolean = true): string => {
  const formattedNumber = new Intl.NumberFormat('en-US', { // Use 'en-US' for consistent comma separation
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  return showSymbol ? `${formattedNumber} ريال` : formattedNumber;
};

/**
 * Extracts the time part from a datetime string (e.g., "2024-07-20 09:15 ص").
 * @param dateTimeString The full datetime string.
 * @returns The time part of the string (e.g., "09:15 ص").
 */
export const extractTime = (dateTimeString: string): string => {
  if (!dateTimeString) return '';
  const parts = dateTimeString.split(' ');
  if (parts.length > 1) {
    return parts.slice(1).join(' ');
  }
  return '';
};

/**
 * Extracts the date part from a datetime string (e.g., "2024-07-20 09:15 ص").
 * @param dateTimeString The full datetime string.
 * @returns The date part of the string (e.g., "2024-07-20").
 */
export const extractDate = (dateTimeString: string): string => {
  if (!dateTimeString) return '';
  return dateTimeString.split(' ')[0];
};