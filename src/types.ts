export type Currency = 'SEK' | 'EUR' | 'USD' | 'GBP';
export type Language = 'sv' | 'en';
export type InvoiceTemplate = 'editorial-paper' | 'nordic-clean' | 'classic-bank';
export type RotRutType = 'none' | 'rot' | 'rut';
export type LineItemType = 'labor' | 'material' | 'standard';
export type InvoiceStatus = 'draft' | 'sent' | 'paid';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatRate: number; // 25, 12, 6, 0
  itemType?: LineItemType;
  rotRut?: RotRutType;
}

export interface SenderInfo {
  name: string;
  orgNr: string;
  vatNr: string;
  address: string;
  zipCity: string;
  country: string;
  email: string;
  phone: string;
  fSkatt: boolean;
  bankgiro: string;
  plusgiro: string;
  swishNumber: string;
  bankAccount?: string; // Clearing & kontonummer
  iban: string;
  bic: string;
  logoUrl?: string;
}

export interface RecipientInfo {
  name: string;
  orgNr: string;
  vatNr?: string; // EU VAT number for reverse charge
  contactPerson: string;
  address: string;
  zipCity: string;
  country: string;
  email: string;
  customerNumber?: string;
}

export interface InvoiceTotals {
  subtotal: number;
  totalVat: number;
  vatBreakdown: { [rate: number]: { base: number; vat: number } };
  rotRutDeduction: number;
  laborTotal: number;
  materialTotal: number;
  rounding: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  ocr: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paymentTermsDays: number;
  lateInterestRate: number;
  currency: Currency;
  language: Language;
  template: InvoiceTemplate;
  sender: SenderInfo;
  recipient: RecipientInfo;
  items: InvoiceItem[];
  notes: string;
  showSwishQR: boolean;
  swishMessage: string;
  isReverseCharge?: boolean;
  reverseChargeText?: string;
  ourReference?: string;
  yourReference?: string;
  projectNumber?: string;
  createdAt: string;
  updatedAt: string;
}

