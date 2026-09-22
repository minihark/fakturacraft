export type Currency = 'SEK' | 'EUR' | 'USD' | 'GBP';
export type Language = 'sv' | 'en';
export type InvoiceTemplate = 'nordic-clean' | 'classic-bank' | 'modern-studio';
export type RotRutType = 'none' | 'rot' | 'rut';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatRate: number; // 25, 12, 6, 0
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
  iban: string;
  bic: string;
  logoUrl?: string;
}

export interface RecipientInfo {
  name: string;
  orgNr: string;
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
  rounding: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  ocr: string;
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
  ourReference?: string;
  yourReference?: string;
  projectNumber?: string;
  createdAt: string;
  updatedAt: string;
}
