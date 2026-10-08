const INDIAN_MOBILE = /^[6-9]\d{9}$/;

// Room for a full "0091" + 10 digits while it is still being typed.
const MAX_DIGITS = 14;

/**
 * Keeps only the digits of whatever was typed or pasted, and drops the country
 * or trunk prefix once the full number is there, so "+91 98765 43210" and
 * "098765-43210" both become "9876543210".
 */
export function toNationalDigits(value) {
  const digits = String(value).replace(/\D/g, '').slice(0, MAX_DIGITS);

  if (digits.length === 14 && digits.startsWith('0091')) return digits.slice(4);
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);

  return digits;
}

/** Returns a message for the visitor, or an empty string when the number is valid. */
export function validatePhone(digits) {
  if (!digits) return 'Please enter your registered mobile number.';
  if (digits.length < 10) return 'Please enter all 10 digits of your mobile number.';
  if (digits.length > 10) return 'A mobile number has 10 digits. Please check the number and try again.';
  if (!INDIAN_MOBILE.test(digits)) {
    return 'Please enter a valid mobile number. Indian mobile numbers start with 6, 7, 8 or 9.';
  }
  return '';
}

/** "9876543210" -> "+91 ******3210" */
export function maskPhone(digits) {
  return `+91 ******${digits.slice(-4)}`;
}
