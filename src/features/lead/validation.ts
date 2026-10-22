/**
 * Validation rules for the lead form.
 *
 * Kept separate from the component so Part 2 can reuse them server-side
 * or in a test suite without importing React.
 */

export interface LeadValues {
  fullName: string;
  mobile: string;
}

export type LeadErrors = Partial<Record<keyof LeadValues, string>>;

/** Letters (incl. accents), spaces, hyphens, apostrophes, dots. No digits. */
const NAME_PATTERN = /^[A-Za-z\u00C0-\u024F\u0900-\u097F]+(?:[ .'-][A-Za-z\u00C0-\u024F\u0900-\u097F]+)*$/;

/** Exactly 10 digits — the standard Indian mobile length. */
const MOBILE_DIGITS = 10;

export function validateFullName(raw: string): string | undefined {
  const value = raw.trim();

  if (!value) return "Please enter your full name.";
  if (value.length < 3) return "Name must be at least 3 characters.";
  if (value.length > 60) return "Name must be 60 characters or fewer.";
  if (/\d/.test(value)) return "Name cannot contain numbers.";
  if (!NAME_PATTERN.test(value)) return "Please enter a valid name.";

  return undefined;
}

export function validateMobile(raw: string): string | undefined {
  const value = raw.trim();

  if (!value) return "Please enter your mobile number.";

  const digits = value.replace(/[\s-]/g, "");

  if (!/^\d+$/.test(digits)) return "Mobile number can only contain digits.";
  if (digits.length !== MOBILE_DIGITS)
    return `Mobile number must be exactly ${MOBILE_DIGITS} digits.`;
  // Indian mobiles start with 6-9.
  if (!/^[6-9]/.test(digits))
    return "Mobile number must start with 6, 7, 8, or 9.";

  return undefined;
}

export function validateLead(values: LeadValues): LeadErrors {
  const errors: LeadErrors = {};

  const nameError = validateFullName(values.fullName);
  if (nameError) errors.fullName = nameError;

  const mobileError = validateMobile(values.mobile);
  if (mobileError) errors.mobile = mobileError;

  return errors;
}
