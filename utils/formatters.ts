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
 * Formats a number as a currency value with a given symbol.
 * @param amount The number to format.
 * @param currencySymbol The currency symbol to append (e.g., 'ج.م', 'ر.س', '$').
 * @param showSymbol Whether to show the currency symbol. Defaults to true.
 * @returns A formatted currency string.
 */
export const formatCurrency = (amount: number, currencySymbol: string, showSymbol: boolean = true): string => {
  const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  return showSymbol ? `${formattedNumber} ${currencySymbol}` : formattedNumber;
};


/**
 * Extracts the time part from a datetime string (e.g., "2024-07-20 09:15 ص").
 * @param dateTimeString The full datetime string.
 * @param lang The current language ('ar' or 'en') for AM/PM localization.
 * @returns The time part of the string (e.g., "09:15 ص" or "09:15 AM").
 */
export const extractTime = (dateTimeString: string, lang: 'ar' | 'en' = 'ar'): string => {
  if (!dateTimeString) return '';
  const parts = dateTimeString.split(' ');
  if (parts.length > 1) {
    let timePart = parts[1]; // HH:MM
    let ampmPart = parts.length > 2 ? parts[2].toLowerCase() : ''; // ص or م
    
    if (lang === 'en') {
        if (ampmPart.includes('ص')) ampmPart = 'AM';
        else if (ampmPart.includes('م')) ampmPart = 'PM';
    } else {
        if (ampmPart.includes('am')) ampmPart = 'ص';
        else if (ampmPart.includes('pm')) ampmPart = 'م';
    }
    
    return `${timePart} ${ampmPart}`.trim();
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

/**
 * Formats a number as a currency value in SAR.
 * @param amount The number to format.
 * @param showSymbol Whether to show the currency symbol. Defaults to true.
 * @returns A formatted currency string in SAR.
 */
export const formatCurrencySAR = (amount: number, showSymbol: boolean = true): string => {
    return formatCurrency(amount, 'ر.س', showSymbol);
};