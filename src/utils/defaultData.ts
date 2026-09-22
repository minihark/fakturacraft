import { Invoice } from '../types';
import { generateSwedishOcr } from './luhn';
import { addDays } from './currency';

export const SAMPLE_INVOICE: Invoice = {
  id: 'inv-sample-1',
  invoiceNumber: '1024',
  ocr: generateSwedishOcr('1024'),
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: addDays(new Date().toISOString().slice(0, 10), 30),
  paymentTermsDays: 30,
  lateInterestRate: 8,
  currency: 'SEK',
  language: 'sv',
  template: 'nordic-clean',
  sender: {
    name: 'Harkco Software Studio',
    orgNr: '559123-4567',
    vatNr: 'SE559123456701',
    address: 'Kungsportsavenyen 10',
    zipCity: '411 36 Göteborg',
    country: 'Sverige',
    email: 'kontakt@harkco.se',
    phone: '070-123 45 67',
    fSkatt: true,
    bankgiro: '512-3456',
    plusgiro: '',
    swishNumber: '1234567890',
    iban: 'SE4550000000051234567890',
    bic: 'ESSESESS',
    logoUrl: '',
  },
  recipient: {
    name: 'Nordic Growth Ventures AB',
    orgNr: '556789-0123',
    contactPerson: 'Elin Lindqvist',
    address: 'Sveavägen 44',
    zipCity: '111 34 Stockholm',
    country: 'Sverige',
    email: 'ekonomi@nordicgrowth.se',
    customerNumber: 'KUND-301',
  },
  items: [
    {
      id: 'item-1',
      description: 'Systemarkitektur & Fullstack Utveckling (Sprint 1-2)',
      quantity: 40,
      unit: 'tim',
      unitPrice: 1250,
      vatRate: 25,
      rotRut: 'none',
    },
    {
      id: 'item-2',
      description: 'UI/UX-granskning och interaktionsprototyper',
      quantity: 12,
      unit: 'tim',
      unitPrice: 1100,
      vatRate: 25,
      rotRut: 'none',
    },
    {
      id: 'item-3',
      description: 'Molndrift & automatiserad CI/CD pipeline setup',
      quantity: 1,
      unit: 'st',
      unitPrice: 6500,
      vatRate: 25,
      rotRut: 'none',
    },
  ],
  notes: 'Tack för ett givande samarbete! Vänligen ange fakturanummer eller OCR vid inbetalning via Bankgiro eller Swish.',
  showSwishQR: true,
  swishMessage: 'Faktura 1024',
  ourReference: 'Viktor Holmqvist',
  yourReference: 'Elin Lindqvist',
  projectNumber: 'PROJ-2026-09',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const PRESETS: { [key: string]: Partial<Invoice> } = {
  consulting: {
    items: [
      {
        id: 'c-1',
        description: 'Teknisk rådgivning & lösningsarkitektur',
        quantity: 25,
        unit: 'tim',
        unitPrice: 1350,
        vatRate: 25,
        rotRut: 'none',
      },
      {
        id: 'c-2',
        description: 'Kodgranskning & prestandaoptimering',
        quantity: 10,
        unit: 'tim',
        unitPrice: 1350,
        vatRate: 25,
        rotRut: 'none',
      }
    ],
    notes: 'Betalningsvillkor 30 dagar netto. Vid försenad betalning debiteras lagstadgad dröjsmålsränta.'
  },
  rotCraft: {
    items: [
      {
        id: 'rot-1',
        description: 'Snickeriarbete: Platsbyggd bokhylla & panelsättning (Arbetskostnad med ROT)',
        quantity: 32,
        unit: 'tim',
        unitPrice: 680,
        vatRate: 25,
        rotRut: 'rot',
      },
      {
        id: 'rot-2',
        description: 'Material & beslag (ej ROT-berättigat)',
        quantity: 1,
        unit: 'st',
        unitPrice: 8400,
        vatRate: 25,
        rotRut: 'none',
      }
    ],
    notes: 'Kunden har ansökt om ROT-avdrag (30% på arbetskostnaden). Personnummer och fastighetsbeteckning erfordras.'
  },
  freelanceDesign: {
    items: [
      {
        id: 'des-1',
        description: 'Visuell identitet & Logotypdesign paket',
        quantity: 1,
        unit: 'st',
        unitPrice: 18000,
        vatRate: 25,
        rotRut: 'none',
      },
      {
        id: 'des-2',
        description: 'Varumärkesguide (Brand Guidelines PDF)',
        quantity: 1,
        unit: 'st',
        unitPrice: 6500,
        vatRate: 25,
        rotRut: 'none',
      }
    ],
    notes: 'Alla kommersiella rättigheter överlåts i samband med erlagd full betalning.'
  }
};
