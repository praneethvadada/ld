const INDIAN_MOBILE = /^[6-9]\d{9}$/;
const ALLOWED_CHARACTERS = /^\+?[\d\s().-]+$/;

/**
 * Reduces any accepted way of writing an Indian mobile number to its 10 digits,
 * so "9876543210", "+919876543210" and "+91 98765-43210" all match one record.
 * Returns null when the input is not a valid Indian mobile number.
 */
export function normalizePhone(input) {
  if (typeof input !== 'string' && typeof input !== 'number') return null;

  const raw = String(input).trim();
  if (!raw || raw.length > 20 || !ALLOWED_CHARACTERS.test(raw)) return null;

  let digits = raw.replace(/\D/g, '');
  if (digits.length === 14 && digits.startsWith('0091')) digits = digits.slice(4);
  else if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);

  return INDIAN_MOBILE.test(digits) ? digits : null;
}
