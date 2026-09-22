/**
 * Swedish Luhn (Modulus 10) Checksum Algorithm
 * Standard for Swedish OCR-nummer, Personnummer and Organisationsnummer
 */

export function calculateLuhnCheckDigit(input: string): number {
  const sanitized = input.replace(/\D/g, '');
  let sum = 0;
  let alternate = true;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let n = parseInt(sanitized.charAt(i), 10);
    if (alternate) {
      n *= 2;
      if (n > 9) {
        n = (n % 10) + 1;
      }
    }
    sum += n;
    alternate = !alternate;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit;
}

export function isValidLuhn(input: string): boolean {
  const sanitized = input.replace(/\D/g, '');
  if (sanitized.length < 2) return false;
  const body = sanitized.slice(0, -1);
  const expectedCheck = parseInt(sanitized.slice(-1), 10);
  return calculateLuhnCheckDigit(body) === expectedCheck;
}

/**
 * Generate a Swedish OCR reference from invoice number (and optional customer number)
 * Uses Bankgirot Level 2 standard: [Invoice Number][Length Digit][Luhn Check Digit]
 */
export function generateSwedishOcr(invoiceNum: string): string {
  const cleanNum = invoiceNum.replace(/\D/g, '') || '1001';
  // Standard format: base number + total length digit + check digit
  // Length is (cleanNum.length + 2) % 10
  const lengthDigit = (cleanNum.length + 2) % 10;
  const baseWithLength = `${cleanNum}${lengthDigit}`;
  const checkDigit = calculateLuhnCheckDigit(baseWithLength);
  return `${baseWithLength}${checkDigit}`;
}

/**
 * Formats a Swedish Organization Number (e.g. 556123-4567)
 */
export function formatOrgNr(input: string): string {
  const clean = input.replace(/\D/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 6)}-${clean.slice(6)}`;
  }
  if (clean.length === 12) {
    return `${clean.slice(2, 8)}-${clean.slice(8)}`;
  }
  return input;
}

/**
 * Generates Momsregistreringsnummer from Swedish Org.nr (SE + 10 digits + 01)
 */
export function orgNrToVat(orgNr: string): string {
  const clean = orgNr.replace(/\D/g, '');
  if (clean.length === 10) {
    return `SE${clean}01`;
  }
  if (clean.length === 12) {
    return `SE${clean.slice(2)}01`;
  }
  return '';
}
