import { Currency, InvoiceItem, InvoiceTotals } from '../types';

export function formatCurrency(amount: number, currency: Currency = 'SEK', language: 'sv' | 'en' = 'sv'): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  
  if (currency === 'SEK') {
    const formatted = new Intl.NumberFormat(language === 'sv' ? 'sv-SE' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
    return `${formatted} kr`;
  }

  return new Intl.NumberFormat(language === 'sv' ? 'sv-SE' : 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

export function calculateInvoiceTotals(items: InvoiceItem[]): InvoiceTotals {
  let subtotal = 0;
  let totalVat = 0;
  const vatBreakdown: { [rate: number]: { base: number; vat: number } } = {
    25: { base: 0, vat: 0 },
    12: { base: 0, vat: 0 },
    6: { base: 0, vat: 0 },
    0: { base: 0, vat: 0 },
  };

  let rotRutDeduction = 0;

  for (const item of items) {
    const lineNet = (item.quantity || 0) * (item.unitPrice || 0);
    const vatRate = item.vatRate || 0;
    const lineVat = lineNet * (vatRate / 100);

    subtotal += lineNet;
    totalVat += lineVat;

    if (!vatBreakdown[vatRate]) {
      vatBreakdown[vatRate] = { base: 0, vat: 0 };
    }
    vatBreakdown[vatRate].base += lineNet;
    vatBreakdown[vatRate].vat += lineVat;

    // ROT deduction: 30% of labor net
    // RUT deduction: 50% of labor net
    if (item.rotRut === 'rot') {
      rotRutDeduction += (lineNet + lineVat) * 0.30;
    } else if (item.rotRut === 'rut') {
      rotRutDeduction += (lineNet + lineVat) * 0.50;
    }
  }

  const rawTotal = subtotal + totalVat - rotRutDeduction;
  const roundedTotal = Math.round(rawTotal);
  const rounding = +(roundedTotal - rawTotal).toFixed(2);

  return {
    subtotal: +subtotal.toFixed(2),
    totalVat: +totalVat.toFixed(2),
    vatBreakdown,
    rotRutDeduction: +rotRutDeduction.toFixed(2),
    rounding,
    total: roundedTotal,
  };
}

export function addDays(dateString: string, days: number): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function formatDate(dateString: string, language: 'sv' | 'en' = 'sv'): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  if (language === 'sv') {
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
