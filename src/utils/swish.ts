import QRCode from 'qrcode';

export interface SwishQrParams {
  payee: string; // Phone number or Swish Företagsnummer (e.g. 123 456 78 90 or 0701234567)
  amount: number; // Amount in SEK
  message: string; // Reference, e.g. OCR or "Faktura 1001"
}

/**
 * Format payee number for Swish: clean all non-digits
 * If starting with '0', Swedish local mobile, else e.g. 123...
 */
export function formatSwishPayee(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('46')) {
    return '0' + digits.slice(2);
  }
  return digits;
}

/**
 * Builds standard Swish QR payload.
 * Getswish specification v1 JSON payload recognized by Swedish banking apps.
 */
export function buildSwishQrData(params: SwishQrParams): string {
  const payee = formatSwishPayee(params.payee);
  const cleanAmount = Math.max(0, Math.round(params.amount));
  const safeMessage = (params.message || '').trim().slice(0, 50);

  const payload = {
    version: 1,
    payee: {
      value: payee,
    },
    amount: {
      value: cleanAmount,
      editable: false,
    },
    message: {
      value: safeMessage,
      editable: false,
    },
  };

  return JSON.stringify(payload);
}

/**
 * Generates an SVG or PNG data URL for the Swish QR code
 */
export async function generateSwishQrDataUrl(params: SwishQrParams): Promise<string> {
  if (!params.payee) return '';

  const qrData = buildSwishQrData(params);

  try {
    const dataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 280,
      color: {
        dark: '#0f172a', // Slate-900 for high-contrast crisp readability
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate Swish QR:', err);
    return '';
  }
}
