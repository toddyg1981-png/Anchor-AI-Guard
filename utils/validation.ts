/**
 * Input Validation Utilities
 * Provides functions for secure input validation to prevent injection attacks
 */

/**
 * Validates that input matches expected email format
 * @param email - Email string to validate
 * @returns True if valid email format
 */
export const isValidEmail = (email: string | null | undefined): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validates that input is a safe alphanumeric string
 * @param input - String to validate
 * @param maxLength - Maximum allowed length
 * @returns True if valid
 */
export const isValidAlphanumeric = (input: string | null | undefined, maxLength: number = 255): boolean => {
  if (!input || typeof input !== 'string') return false;
  
  const alphanumericRegex = /^[a-zA-Z0-9\s\-_]+$/;
  return alphanumericRegex.test(input) && input.length <= maxLength;
};

/**
 * Validates that input is a safe URL
 * @param url - URL string to validate
 * @returns True if valid HTTP(S) URL
 */
export const isValidUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Validates that input only contains safe characters
 * @param input - String to validate
 * @param maxLength - Maximum allowed length
 * @returns True if safe
 */
export const isSafeInput = (input: string | null | undefined, maxLength: number = 1000): boolean => {
  if (!input || typeof input !== 'string') return false;
  
  // Reject if too long
  if (input.length > maxLength) return false;
  
  // Reject dangerous patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<!--/i,
    /<iframe/i,
    /<object/i,
    /eval\(/i,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
};

/**
 * Validates UUID format
 * @param uuid - UUID string to validate
 * @returns True if valid UUID
 */
export const isValidUuid = (uuid: string | null | undefined): boolean => {
  if (!uuid || typeof uuid !== 'string') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validates numeric input within range
 * @param input - Value to validate
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns True if valid
 */
export const isValidNumber = (input: any, min: number = -Infinity, max: number = Infinity): boolean => {
  const num = Number(input);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Validates that input is a non-empty string
 * @param input - String to validate
 * @param minLength - Minimum length
 * @param maxLength - Maximum length
 * @returns True if valid
 */
export const isValidString = (input: string | null | undefined, minLength: number = 1, maxLength: number = 1000): boolean => {
  if (typeof input !== 'string') return false;
  return input.length >= minLength && input.length <= maxLength;
};

/**
 * Type guard for checking if object has required properties
 * @param obj - Object to validate
 * @param requiredProps - Array of required property names
 * @returns True if all required properties exist
 */
export const hasRequiredProps = (obj: any, requiredProps: string[]): boolean => {
  if (!obj || typeof obj !== 'object') return false;
  return requiredProps.every(prop => prop in obj && obj[prop] !== null && obj[prop] !== undefined);
};
