import { Invoice } from '../types';
import { calculateInvoiceTotals } from './currency';

/**
 * Generates a standard Swedish SIE4 (Standard Import Export v4) accounting file.
 * Compatible with Fortnox, Bokio, Visma Spcs, Wint, and Björn Lundén.
 */
export function generateSIE4(invoice: Invoice): string {
  const totals = calculateInvoiceTotals(invoice.items);
  const now = new Date();
  const genDate = now.toISOString().slice(0, 10).replace(/-/g, '');
  const invoiceDateStr = (invoice.issueDate || '').replace(/-/g, '') || genDate;
  
  const senderName = invoice.sender.name || 'Företaget';
  const orgNr = (invoice.sender.orgNr || '').replace(/\D/g, '');
  const invoiceNumber = invoice.invoiceNumber || '1001';
  const recipientName = invoice.recipient.name || 'Kund';

  const lines: string[] = [
    '#FLAGGA 0',
    '#PROGRAM "FakturaCraft" 1.0',
    '#FORMAT PC8',
    `#GEN ${genDate}`,
    '#SIETYP 4',
    `#FNAMN "${escapeSie(senderName)}"`,
  ];

  if (orgNr) {
    lines.push(`#ORGNR "${orgNr}"`);
  }

  // Account standard declarations (BAS-kontoplan)
  lines.push('#KONTO 1510 "Kundfordringar"');
  if (totals.vatBreakdown[25]?.base > 0) {
    lines.push('#KONTO 3001 "Försäljning tjänster 25% moms"');
    lines.push('#KONTO 2611 "Utgående moms 25%"');
  }
  if (totals.vatBreakdown[12]?.base > 0) {
    lines.push('#KONTO 3002 "Försäljning tjänster 12% moms"');
    lines.push('#KONTO 2621 "Utgående moms 12%"');
  }
  if (totals.vatBreakdown[6]?.base > 0) {
    lines.push('#KONTO 3003 "Försäljning tjänster 6% moms"');
    lines.push('#KONTO 2631 "Utgående moms 6%"');
  }
  if (totals.vatBreakdown[0]?.base > 0) {
    lines.push('#KONTO 3040 "Försäljning tjänster 0% moms"');
  }
  if (totals.rotRutDeduction > 0) {
    lines.push('#KONTO 1513 "Kundfordran ROT/RUT Skatteverket"');
  }
  if (totals.rounding !== 0) {
    lines.push('#KONTO 3740 "Öres- och kronutjämning"');
  }

  // Voucher entry: Series A, Number = invoiceNumber
  const verText = `Kundfaktura ${invoiceNumber} - ${recipientName}`.slice(0, 50);
  lines.push(`#VER A "${invoiceNumber}" ${invoiceDateStr} "${escapeSie(verText)}"`);
  lines.push('{');

  // 1. Debit: 1510 Kundfordringar (What customer must pay)
  lines.push(`   #TRANS 1510 {} ${totals.total.toFixed(2)} ${invoiceDateStr} "${escapeSie('Faktura ' + invoiceNumber)}"`);

  // 2. Debit: 1513 ROT/RUT receivable from Skatteverket if applicable
  if (totals.rotRutDeduction > 0) {
    lines.push(`   #TRANS 1513 {} ${totals.rotRutDeduction.toFixed(2)} ${invoiceDateStr} "ROT/RUT begäran"`);
  }

  // 3. Credit: Revenue accounts (negative in accounting entry)
  if (totals.vatBreakdown[25]?.base > 0) {
    lines.push(`   #TRANS 3001 {} -${totals.vatBreakdown[25].base.toFixed(2)} ${invoiceDateStr} "Försäljning 25%"`);
    lines.push(`   #TRANS 2611 {} -${totals.vatBreakdown[25].vat.toFixed(2)} ${invoiceDateStr} "Utg moms 25%"`);
  }
  if (totals.vatBreakdown[12]?.base > 0) {
    lines.push(`   #TRANS 3002 {} -${totals.vatBreakdown[12].base.toFixed(2)} ${invoiceDateStr} "Försäljning 12%"`);
    lines.push(`   #TRANS 2621 {} -${totals.vatBreakdown[12].vat.toFixed(2)} ${invoiceDateStr} "Utg moms 12%"`);
  }
  if (totals.vatBreakdown[6]?.base > 0) {
    lines.push(`   #TRANS 3003 {} -${totals.vatBreakdown[6].base.toFixed(2)} ${invoiceDateStr} "Försäljning 6%"`);
    lines.push(`   #TRANS 2631 {} -${totals.vatBreakdown[6].vat.toFixed(2)} ${invoiceDateStr} "Utg moms 6%"`);
  }
  if (totals.vatBreakdown[0]?.base > 0) {
    lines.push(`   #TRANS 3040 {} -${totals.vatBreakdown[0].base.toFixed(2)} ${invoiceDateStr} "Försäljning 0%"`);
  }

  // 4. Rounding adjustment
  if (totals.rounding !== 0) {
    // If rounding was added, revenue decreases (credit) or vice versa
    const roundingEntry = -totals.rounding;
    lines.push(`   #TRANS 3740 {} ${roundingEntry.toFixed(2)} ${invoiceDateStr} "Öresavrundning"`);
  }

  lines.push('}');
  lines.push('');

  return lines.join('\r\n'); // Windows CRLF standard for Swedish financial systems
}

function escapeSie(str: string): string {
  return str.replace(/"/g, "'").trim();
}

/**
 * Trigger file download in browser for SIE4 file
 */
export function downloadSIE4File(invoice: Invoice) {
  const content = generateSIE4(invoice);
  const blob = new Blob([content], { type: 'text/plain;charset=ibm437' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Faktura_${invoice.invoiceNumber || '1001'}_verifikat.si`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
