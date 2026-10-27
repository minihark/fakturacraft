import { Invoice } from '../types';
import { calculateInvoiceTotals } from './currency';

function escapeXml(str: string | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cleanOrgNr(orgNr: string): string {
  return (orgNr || '').replace(/\D/g, '');
}

export function generatePeppolXml(invoice: Invoice): string {
  const totals = calculateInvoiceTotals(invoice.items, invoice.isReverseCharge);
  const supplierOrg = cleanOrgNr(invoice.sender.orgNr) || '5560000000';
  const customerOrg = cleanOrgNr(invoice.recipient.orgNr) || '5569999999';
  const currency = invoice.currency || 'SEK';

  const linesXml = invoice.items
    .map((item, idx) => {
      const lineExt = ((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2);
      const vatRate = invoice.isReverseCharge ? 0 : item.vatRate || 0;
      const vatCat = vatRate === 0 ? (invoice.isReverseCharge ? 'AE' : 'Z') : 'S';
      return [
        `  <cac:InvoiceLine>`,
        `    <cbc:ID>${idx + 1}</cbc:ID>`,
        `    <cbc:InvoicedQuantity unitCode="EA">${item.quantity}</cbc:InvoicedQuantity>`,
        `    <cbc:LineExtensionAmount currencyID="${currency}">${lineExt}</cbc:LineExtensionAmount>`,
        `    <cac:Item>`,
        `      <cbc:Name>${escapeXml(item.description)}</cbc:Name>`,
        `      <cac:ClassifiedTaxCategory>`,
        `        <cbc:ID>${vatCat}</cbc:ID>`,
        `        <cbc:Percent>${vatRate}</cbc:Percent>`,
        `        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>`,
        `      </cac:ClassifiedTaxCategory>`,
        `    </cac:Item>`,
        `    <cac:Price>`,
        `      <cbc:PriceAmount currencyID="${currency}">${(item.unitPrice || 0).toFixed(2)}</cbc:PriceAmount>`,
        `    </cac:Price>`,
        `  </cac:InvoiceLine>`,
      ].join('\n');
    })
    .join('\n');

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"`,
    `         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"`,
    `         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">`,
    `  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>`,
    `  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>`,
    `  <cbc:ID>${escapeXml(invoice.invoiceNumber)}</cbc:ID>`,
    `  <cbc:IssueDate>${escapeXml(invoice.issueDate)}</cbc:IssueDate>`,
    `  <cbc:DueDate>${escapeXml(invoice.dueDate)}</cbc:DueDate>`,
    `  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>`,
    `  <cbc:DocumentCurrencyCode>${currency}</cbc:DocumentCurrencyCode>`,
    `  <cbc:BuyerReference>${escapeXml(invoice.yourReference || invoice.recipient.contactPerson || 'Ref')}</cbc:BuyerReference>`,
    `  <cac:AccountingSupplierParty>`,
    `    <cac:Party>`,
    `      <cbc:EndpointID schemeID="0007">${supplierOrg}</cbc:EndpointID>`,
    `      <cac:PartyName><cbc:Name>${escapeXml(invoice.sender.name)}</cbc:Name></cac:PartyName>`,
    `      <cac:PostalAddress>`,
    `        <cbc:StreetName>${escapeXml(invoice.sender.address)}</cbc:StreetName>`,
    `        <cbc:CityName>${escapeXml(invoice.sender.zipCity)}</cbc:CityName>`,
    `        <cac:Country><cbc:IdentificationCode>SE</cbc:IdentificationCode></cac:Country>`,
    `      </cac:PostalAddress>`,
    `      <cac:PartyTaxScheme>`,
    `        <cbc:CompanyID>${escapeXml(invoice.sender.vatNr || `SE${supplierOrg}01`)}</cbc:CompanyID>`,
    `        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>`,
    `      </cac:PartyTaxScheme>`,
    `    </cac:Party>`,
    `  </cac:AccountingSupplierParty>`,
    `  <cac:AccountingCustomerParty>`,
    `    <cac:Party>`,
    `      <cbc:EndpointID schemeID="0007">${customerOrg}</cbc:EndpointID>`,
    `      <cac:PartyName><cbc:Name>${escapeXml(invoice.recipient.name)}</cbc:Name></cac:PartyName>`,
    `      <cac:PostalAddress>`,
    `        <cbc:StreetName>${escapeXml(invoice.recipient.address)}</cbc:StreetName>`,
    `        <cbc:CityName>${escapeXml(invoice.recipient.zipCity)}</cbc:CityName>`,
    `        <cac:Country><cbc:IdentificationCode>SE</cbc:IdentificationCode></cac:Country>`,
    `      </cac:PostalAddress>`,
    `    </cac:Party>`,
    `  </cac:AccountingCustomerParty>`,
    `  <cac:PaymentMeans>`,
    `    <cbc:PaymentMeansCode>30</cbc:PaymentMeansCode>`,
    `    <cbc:PaymentID>${escapeXml(invoice.ocr || invoice.invoiceNumber)}</cbc:PaymentID>`,
    `    <cac:PayeeFinancialAccount>`,
    `      <cbc:ID>${escapeXml(invoice.sender.bankgiro || invoice.sender.iban || '')}</cbc:ID>`,
    `    </cac:PayeeFinancialAccount>`,
    `  </cac:PaymentMeans>`,
    `  <cac:TaxTotal>`,
    `    <cbc:TaxAmount currencyID="${currency}">${totals.totalVat.toFixed(2)}</cbc:TaxAmount>`,
    `  </cac:TaxTotal>`,
    `  <cac:LegalMonetaryTotal>`,
    `    <cbc:LineExtensionAmount currencyID="${currency}">${totals.subtotal.toFixed(2)}</cbc:LineExtensionAmount>`,
    `    <cbc:TaxExclusiveAmount currencyID="${currency}">${totals.subtotal.toFixed(2)}</cbc:TaxExclusiveAmount>`,
    `    <cbc:TaxInclusiveAmount currencyID="${currency}">${(totals.subtotal + totals.totalVat).toFixed(2)}</cbc:TaxInclusiveAmount>`,
    `    <cbc:PayableRoundingAmount currencyID="${currency}">${totals.rounding.toFixed(2)}</cbc:PayableRoundingAmount>`,
    `    <cbc:PayableAmount currencyID="${currency}">${totals.total.toFixed(2)}</cbc:cbc:PayableAmount>`.replace('</cbc:cbc:PayableAmount>', '</cbc:PayableAmount>'),
    `  </cac:LegalMonetaryTotal>`,
    linesXml,
    `</Invoice>`,
  ].join('\n');
}

export function downloadPeppolXmlFile(invoice: Invoice): void {
  const xml = generatePeppolXml(invoice);
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `peppol-faktura-${invoice.invoiceNumber}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface LateFeeCalculation {
  principal: number;
  annualRatePct: number;
  daysLate: number;
  interestAmount: number;
  statutoryFee: number;
  totalWithLateFee: number;
  dailyInterestSek: number;
}

export function calculateSwedishLateFee(
  principal: number,
  annualRatePct: number,
  daysLate: number,
  feeKind: 'b2b_450' | 'reminder_60' | 'none'
): LateFeeCalculation {
  const safePrincipal = Math.max(0, principal);
  const safeRate = Math.max(0, annualRatePct);
  const safeDays = Math.max(0, daysLate);

  const interestAmount = +(safePrincipal * (safeRate / 100) * (safeDays / 365)).toFixed(2);
  const dailyInterestSek = +(safePrincipal * (safeRate / 100) * (1 / 365)).toFixed(2);
  const statutoryFee = feeKind === 'b2b_450' ? 450 : feeKind === 'reminder_60' ? 60 : 0;
  const totalWithLateFee = Math.round(safePrincipal + interestAmount + statutoryFee);

  return {
    principal: safePrincipal,
    annualRatePct: safeRate,
    daysLate: safeDays,
    interestAmount,
    statutoryFee,
    totalWithLateFee,
    dailyInterestSek,
  };
}
