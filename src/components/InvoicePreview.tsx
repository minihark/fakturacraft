import React from 'react';
import { Invoice } from '../types';
import { calculateInvoiceTotals, formatCurrency, formatDate } from '../utils/currency';
import { SwishQRCode } from './SwishQRCode';
import { ShieldCheck } from 'lucide-react';

interface InvoicePreviewProps {
  invoice: Invoice;
  isPro: boolean;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, isPro }) => {
  const totals = calculateInvoiceTotals(invoice.items);

  const getTemplateClasses = () => {
    switch (invoice.template) {
      case 'classic-bank':
        return 'font-sans text-slate-900 border-t-8 border-slate-700';
      case 'modern-studio':
        return 'font-sans text-slate-900 border-t-8 border-emerald-600';
      case 'nordic-clean':
      default:
        return 'font-sans text-slate-900 border-t-8 border-slate-900';
    }
  };

  return (
    <div className="w-full max-w-[820px] mx-auto bg-white text-slate-900 shadow-invoice rounded-xl p-8 sm:p-12 print:p-0 print:shadow-none print:rounded-none print:max-w-none text-xs leading-relaxed transition-all">
      
      {/* Top Banner / Logo & Header */}
      <div className={`pt-2 pb-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-4 ${getTemplateClasses()}`}>
        <div>
          {invoice.sender.logoUrl ? (
            <img
              src={invoice.sender.logoUrl}
              alt={invoice.sender.name}
              className="max-h-16 max-w-[200px] object-contain mb-3"
            />
          ) : (
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {invoice.sender.name || 'Ditt Företag'}
            </h1>
          )}

          <div className="mt-1 space-y-0.5 text-slate-600 text-[11px]">
            {invoice.sender.address && <div>{invoice.sender.address}</div>}
            {invoice.sender.zipCity && <div>{invoice.sender.zipCity}</div>}
            {invoice.sender.email && <div>{invoice.sender.email}</div>}
            {invoice.sender.phone && <div>{invoice.sender.phone}</div>}
          </div>
        </div>

        <div className="text-right sm:self-start">
          <div className="text-3xl font-black tracking-tight text-slate-900 uppercase">
            Faktura
          </div>
          <div className="text-slate-500 text-xs font-mono mt-0.5">
            Nr: #{invoice.invoiceNumber || '1001'}
          </div>

          {invoice.sender.fSkatt && (
            <div className="inline-flex items-center gap-1 mt-2.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-semibold">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Godkänd för F-skatt</span>
            </div>
          )}
        </div>
      </div>

      {/* Recipient & Key Metadata Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-b border-slate-100">
        {/* Recipient */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Faktureras till
          </div>
          <div className="text-sm font-bold text-slate-900">
            {invoice.recipient.name || 'Kundnamn AB'}
          </div>
          {invoice.recipient.contactPerson && (
            <div className="text-slate-700 text-xs mt-0.5">
              Att: {invoice.recipient.contactPerson}
            </div>
          )}
          <div className="text-slate-600 text-xs mt-1 space-y-0.5">
            {invoice.recipient.address && <div>{invoice.recipient.address}</div>}
            {invoice.recipient.zipCity && <div>{invoice.recipient.zipCity}</div>}
            {invoice.recipient.orgNr && (
              <div className="text-[11px] font-mono text-slate-500 mt-1">
                Org.nr: {invoice.recipient.orgNr}
              </div>
            )}
            {invoice.recipient.email && <div>{invoice.recipient.email}</div>}
          </div>
        </div>

        {/* Invoice Metadata Box */}
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-3 text-[11px]">
          <div>
            <div className="text-[10px] font-medium text-slate-400 uppercase">Fakturadatum</div>
            <div className="font-semibold text-slate-800 font-mono mt-0.5">
              {formatDate(invoice.issueDate, invoice.language)}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-medium text-slate-400 uppercase">Förfallodatum</div>
            <div className="font-semibold text-red-600 font-mono mt-0.5">
              {formatDate(invoice.dueDate, invoice.language)}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-medium text-slate-400 uppercase">OCR / Referens</div>
            <div className="font-semibold text-slate-800 font-mono mt-0.5">
              {invoice.ocr || invoice.invoiceNumber}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-medium text-slate-400 uppercase">Betalningsvillkor</div>
            <div className="font-semibold text-slate-800 mt-0.5">
              {invoice.paymentTermsDays} dagar netto
            </div>
          </div>

          {invoice.ourReference && (
            <div>
              <div className="text-[10px] font-medium text-slate-400 uppercase">Vår referens</div>
              <div className="text-slate-700 mt-0.5">{invoice.ourReference}</div>
            </div>
          )}

          {invoice.yourReference && (
            <div>
              <div className="text-[10px] font-medium text-slate-400 uppercase">Er referens</div>
              <div className="text-slate-700 mt-0.5">{invoice.yourReference}</div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Line Items Table */}
      <div className="py-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-800 text-[10px] uppercase font-bold text-slate-600 tracking-wider">
              <th className="py-2.5 px-2">Beskrivning</th>
              <th className="py-2.5 px-2 text-right">Antal</th>
              <th className="py-2.5 px-2 text-right">À-pris</th>
              <th className="py-2.5 px-2 text-right">Moms</th>
              <th className="py-2.5 px-2 text-right">Belopp ({invoice.currency})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items.map((item) => {
              const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
              return (
                <tr key={item.id} className="text-slate-800">
                  <td className="py-3 px-2">
                    <div className="font-medium text-slate-900">{item.description}</div>
                    {item.rotRut && item.rotRut !== 'none' && (
                      <span className="inline-block mt-0.5 text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        {item.rotRut.toUpperCase()}-avdrag tillämpas
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-slate-700">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-slate-700">
                    {formatCurrency(item.unitPrice, invoice.currency, invoice.language)}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-slate-700">
                    {item.vatRate}%
                  </td>
                  <td className="py-3 px-2 text-right font-mono font-semibold text-slate-900">
                    {formatCurrency(lineTotal, invoice.currency, invoice.language)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary & Swish Row */}
      <div className="py-6 border-t-2 border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
        {/* Left: Swish QR or Notes */}
        <div className="space-y-4">
          {invoice.showSwishQR && invoice.sender.swishNumber && (
            <div className="flex items-start gap-4">
              <SwishQRCode
                params={{
                  payee: invoice.sender.swishNumber,
                  amount: totals.total,
                  message: invoice.swishMessage || `Faktura ${invoice.invoiceNumber}`,
                }}
              />
              <div className="text-[11px] text-slate-600 space-y-1.5 pt-1">
                <div className="font-bold text-slate-800">Snabb betalning via Swish</div>
                <div>Öppna Swish på mobilen, skanna QR-koden så fylls mottagare, belopp och meddelande i direkt.</div>
                <div className="font-mono text-xs text-slate-800 font-semibold mt-1">
                  Mottagare: {invoice.sender.swishNumber}
                </div>
              </div>
            </div>
          )}

          {invoice.notes && (
            <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="font-bold text-slate-800 mb-0.5">Notering:</div>
              <div>{invoice.notes}</div>
            </div>
          )}
        </div>

        {/* Right: Calculations breakdown */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 space-y-2 text-slate-700 text-xs">
          <div className="flex justify-between">
            <span>Netto (exkl. moms)</span>
            <span className="font-mono">{formatCurrency(totals.subtotal, invoice.currency, invoice.language)}</span>
          </div>

          {/* Moms specifikation */}
          <div className="py-2 border-y border-slate-200/80 space-y-1 text-[11px] text-slate-600">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Momsdeklaration</div>
            {Object.entries(totals.vatBreakdown).map(([rate, data]) => {
              if (data.base <= 0) return null;
              return (
                <div key={rate} className="flex justify-between">
                  <span>Moms {rate}% (av {formatCurrency(data.base, invoice.currency, invoice.language)})</span>
                  <span className="font-mono">{formatCurrency(data.vat, invoice.currency, invoice.language)}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between font-medium">
            <span>Total moms</span>
            <span className="font-mono">{formatCurrency(totals.totalVat, invoice.currency, invoice.language)}</span>
          </div>

          {totals.rotRutDeduction > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>ROT/RUT-skattereduktion</span>
              <span className="font-mono">-{formatCurrency(totals.rotRutDeduction, invoice.currency, invoice.language)}</span>
            </div>
          )}

          {totals.rounding !== 0 && (
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Öresavrundning</span>
              <span className="font-mono">{formatCurrency(totals.rounding, invoice.currency, invoice.language)}</span>
            </div>
          )}

          <div className="pt-3 border-t-2 border-slate-800 flex justify-between items-baseline text-slate-950 font-bold">
            <span className="text-sm uppercase tracking-tight">Totalt att betala</span>
            <span className="text-xl font-mono text-emerald-700">
              {formatCurrency(totals.total, invoice.currency, invoice.language)}
            </span>
          </div>
        </div>
      </div>

      {/* Swedish Bankgiro Payment Slip / Bottom Footer */}
      <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] text-slate-600">
        <div>
          <div className="font-bold text-slate-800 mb-0.5">Avsändare</div>
          <div>{invoice.sender.name}</div>
          <div className="font-mono">Org.nr: {invoice.sender.orgNr || '-'}</div>
          {invoice.sender.vatNr && <div className="font-mono">Moms: {invoice.sender.vatNr}</div>}
        </div>

        <div>
          <div className="font-bold text-slate-800 mb-0.5">Bankgiro / Postgiro</div>
          {invoice.sender.bankgiro ? (
            <div className="font-mono font-semibold text-slate-800">BG: {invoice.sender.bankgiro}</div>
          ) : (
            <div>Inget BG angivet</div>
          )}
          {invoice.sender.plusgiro && (
            <div className="font-mono">PG: {invoice.sender.plusgiro}</div>
          )}
          {invoice.sender.swishNumber && (
            <div className="font-mono text-slate-700">Swish: {invoice.sender.swishNumber}</div>
          )}
        </div>

        <div>
          <div className="font-bold text-slate-800 mb-0.5">Internationellt</div>
          <div className="font-mono">{invoice.sender.iban || 'IBAN ej angivet'}</div>
          <div className="font-mono">BIC: {invoice.sender.bic || '-'}</div>
        </div>

        <div>
          <div className="font-bold text-slate-800 mb-0.5">Betalningsvillkor</div>
          <div>{invoice.paymentTermsDays} dagar netto</div>
          <div>Dröjsmålsränta: {invoice.lateInterestRate}%</div>
          <div className="text-emerald-700 font-semibold mt-0.5">
            {invoice.sender.fSkatt ? 'Godkänd för F-skatt' : 'Ej F-skatt'}
          </div>
        </div>
      </div>

      {/* Watermark badge (Free tier only) */}
      {!isPro && (
        <div className="mt-8 pt-4 border-t border-dashed border-slate-200 text-center text-[10px] text-slate-400 print:text-slate-300">
          Skapad med <span className="font-semibold text-emerald-700">FakturaCraft</span> — Blixtsnabb fakturering utan abonnemang (fakturacraft.apps.harkco.se)
        </div>
      )}
    </div>
  );
};
