/**
 * South African Identity & Phone Validation Utilities
 */

export function validateSAID(idNumber: string): boolean {
  if (!idNumber || idNumber.length !== 13 || isNaN(Number(idNumber))) return false;

  const year = idNumber.substring(0, 2);
  const month = idNumber.substring(2, 4);
  const day = idNumber.substring(4, 6);

  const m = parseInt(month);
  const d = parseInt(day);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;

  let sum = 0;
  for (let i = 0; i < 13; i++) {
    let digit = parseInt(idNumber[i]);
    if (i % 2 !== 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/**
 * Strict Phone Validation: 10 digits starting with 0
 */
export function isValidSAPhone(phone: string): boolean {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 10 && cleaned.startsWith("0");
}

export function formatSAPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned; // Return as 10 digits
}
