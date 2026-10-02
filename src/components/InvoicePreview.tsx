import React from 'react';
import { Invoice } from '../types';
import { calculateInvoiceTotals, formatCurrency, formatDate } from '../utils/currency';
import { formatOcr } from '../utils/luhn';
import { SwishQRCode } from './SwishQRCode';
import { ShieldCheck } from 'lucide-react';

interface InvoicePreviewProps {
  invoice: Invoice;
  isPro: boolean;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, isPro }) => {
  const totals = calculateInvoiceTotals(invoice.items, !!invoice.isReverseCharge);

  const getTemplateStyles = () => {
    switch (invoice.template) {
      case 'classic-bank':
        return {
          wrapper: 'font-sans border-t-4 border-ink',
          titleFont: 'font-sans font-black tracking-tight uppercase',
          tableHeader: 'border-b-2 border-ink text-ink font-bold',
        };
      case 'nordic-clean':
        return {
          wrapper: 'font-sans border-t-2 border-fakt-500',
          titleFont: 'font-sans font-bold tracking-widest uppercase text-fakt-700',
          tableHeader: 'border-b border-fakt-200 text-fakt-700 font-semibold',
        };
      case 'editorial-paper':
      default:
        return {
          wrapper: 'font-sans border-t-4 border-fakt-600',
          titleFont: 'font-serif font-bold tracking-tight text-ink',
          tableHeader: 'border-b border-ink text-ink font-semibold',
        };
    }
  };

  const style = getTemplateStyles();
  const ocrFormatted = formatOcr(invoice.ocr || invoice.invoiceNumber);

  return (
    <div 
      className={`w-full max-w-[820px] mx-auto bg-white text-ink shadow-sheet rounded-sm border border-ink-border/80 p-8 sm:p-12 print-clean-shadow text-xs leading-relaxed transition-all ${style.wrapper}`}
      style={{ minHeight: '1050px' }} // Approximate A4 aspect ratio preview
    >
      
      {/* 1. Masthead Letterhead Row */}
      <div className="pt-2 pb-8 border-b border-ink-rule flex flex-col sm:flex-row justify-between items-start gap-6">
        <div>
          {invoice.sender.logoUrl ? (
            <img
              src={invoice.sender.logoUrl}
              alt={invoice.sender.name}
              className="max-h-16 max-w-[220px] object-contain mb-3"
            />
          ) : (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded bg-fakt-600 flex items-center justify-center text-white font-serif font-black text-sm select-none">
                {invoice.sender.name ? invoice.sender.name.charAt(0).toUpperCase() : 'F'}
              </div>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-ink">
                {invoice.sender.name || 'Ditt Företag'}
              </h1>
            </div>
          )}

          <div className="mt-1 space-y-0.5 text-ink-muted text-[11px]">
            {invoice.sender.orgNr && (
              <div className="font-mono">Org.nr: {invoice.sender.orgNr}</div>
            )}
            {invoice.sender.vatNr && (
              <div className="font-mono">Momsreg.nr: {invoice.sender.vatNr}</div>
            )}
            {invoice.sender.address && <div>{invoice.sender.address}</div>}
            {invoice.sender.zipCity && <div>{invoice.sender.zipCity}</div>}
            {invoice.sender.email && <div>{invoice.sender.email}</div>}
            {invoice.sender.phone && <div>{invoice.sender.phone}</div>}
          </div>
        </div>

        {/* Right side invoice headline */}
        <div className="text-left sm:text-right sm:self-start">
          <div className={`text-3xl ${style.titleFont}`}>
            Faktura
          </div>
          <div className="text-ink-light text-xs font-mono mt-1 font-semibold tabular-nums">
            Nr: #{invoice.invoiceNumber || '1001'}
          </div>

          {invoice.sender.fSkatt && (
            <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded bg-paper-desk border border-ink-border text-ink-light text-[10px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-fakt-600" />
              <span>Godkänd för F-skatt</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Customer & Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-b border-ink-rule">
        {/* Recipient Party */}
        <div>
          <div className="text-[10px] font-bold text-taupe uppercase tracking-wider mb-2">
            Faktureras till
          </div>
          <div className="text-base font-serif font-bold text-ink">
            {invoice.recipient.name || 'Kund AB'}
          </div>
          {invoice.recipient.contactPerson && (
            <div className="text-ink-light text-xs mt-0.5">
              Att: {invoice.recipient.contactPerson}
            </div>
          )}
          <div className="text-ink-muted text-xs mt-1.5 space-y-0.5">
            {invoice.recipient.address && <div>{invoice.recipient.address}</div>}
            {invoice.recipient.zipCity && (
              <div>{invoice.recipient.zipCity} {invoice.recipient.country && `· ${invoice.recipient.country}`}</div>
            )}
            {invoice.recipient.orgNr && (
              <div className="text-[11px] font-mono text-ink-light mt-1">
                Org.nr: {invoice.recipient.orgNr}
              </div>
            )}
            {invoice.recipient.vatNr && (
              <div className="text-[11px] font-mono text-fakt-700 font-semibold">
                EU VAT: {invoice.recipient.vatNr}
              </div>
            )}
            {invoice.recipient.email && <div>{invoice.recipient.email}</div>}
          </div>
        </div>

        {/* Ledger Metadata Box */}
        <div className="bg-paper p-4 rounded border border-ink-border/80 grid grid-cols-2 gap-3 text-[11px]">
          <div>
            <div className="text-[10px] font-medium text-taupe uppercase">Fakturadatum</div>
            <div className="font-semibold text-ink font-mono mt-0.5 tabular-nums">
              {formatDate(invoice.issueDate, invoice.language)}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-medium text-taupe uppercase">Förfallodatum</div>
            <div className="font-semibold text-stamp font-mono mt-0.5 tabular-nums">
              {formatDate(invoice.dueDate, invoice.language)}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-medium text-taupe uppercase">OCR / Referensnr</div>
            <div className="font-bold text-ink font-mono mt-0.5 tabular-nums tracking-wide">
              {ocrFormatted}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-medium text-taupe uppercase">Betalningsvillkor</div>
            <div className="font-semibold text-ink mt-0.5">
              {invoice.paymentTermsDays} dagar netto
            </div>
          </div>

          {invoice.ourReference && (
            <div>
              <div className="text-[10px] font-medium text-taupe uppercase">Vår referens</div>
              <div className="text-ink-light mt-0.5">{invoice.ourReference}</div>
            </div>
          )}

          {invoice.yourReference && (
            <div>
              <div className="text-[10px] font-medium text-taupe uppercase">Er referens</div>
              <div className="text-ink-light mt-0.5">{invoice.yourReference}</div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Reverse Charge Alert banner if active */}
      {invoice.isReverseCharge && (
        <div className="my-4 p-3 rounded bg-fakt-50/70 border border-fakt-200 text-[11px] text-fakt-800 leading-relaxed font-sans">
          <div className="font-bold mb-0.5">Omvänd skattskyldighet / Reverse Charge</div>
          <div>
            {invoice.reverseChargeText || 'Reverse charge: Supply of services subject to the reverse charge mechanism according to Article 196 of Council Directive 2006/112/EC. VAT to be accounted for by the recipient.'}
          </div>
        </div>
      )}

      {/* 4. Line Items Table */}
      <div className="py-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`text-[10px] uppercase font-bold tracking-wider ${style.tableHeader}`}>
              <th className="py-2.5 px-2">Beskrivning</th>
              <th className="py-2.5 px-2 text-right">Antal</th>
              <th className="py-2.5 px-2 text-right">À-pris</th>
              <th className="py-2.5 px-2 text-right">Moms</th>
              <th className="py-2.5 px-2 text-right">Belopp ({invoice.currency})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-rule">
            {invoice.items.map((item) => {
              const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
              const effectiveVat = invoice.isReverseCharge ? 0 : item.vatRate;

              return (
                <tr key={item.id} className="text-ink">
                  <td className="py-3 px-2">
                    <div className="font-medium text-ink">{item.description}</div>
                    
                    {/* Item type badge & ROT/RUT notation */}
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.rotRut && item.rotRut !== 'none' && !invoice.isReverseCharge && (
                        <span className="inline-block text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-300">
                          {item.rotRut.toUpperCase()}-avdrag (Arbetskostnad)
                        </span>
                      )}
                      {item.itemType === 'material' && (
                        <span className="inline-block text-[9px] font-medium text-ink-muted">
                          (Material/Utlägg)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-ink-light tabular-nums">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-ink-light tabular-nums">
                    {formatCurrency(item.unitPrice, invoice.currency, invoice.language)}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-ink-light tabular-nums">
                    {effectiveVat}%
                  </td>
                  <td className="py-3 px-2 text-right font-mono font-semibold text-ink tabular-nums">
                    {formatCurrency(lineTotal, invoice.currency, invoice.language)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 5. Summary & Payment Row */}
      <div className="py-6 border-t border-ink-rule grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
        {/* Left Column: Swish QR or Notes */}
        <div className="space-y-4">
          {invoice.showSwishQR && invoice.sender.swishNumber && (
            <div className="flex items-start gap-4 p-4 rounded bg-paper border border-ink-border/80">
              <SwishQRCode
                params={{
                  payee: invoice.sender.swishNumber,
                  amount: totals.total,
                  message: invoice.swishMessage || `Faktura ${invoice.invoiceNumber}`,
                }}
              />
              <div className="text-[11px] text-ink-light space-y-1.5 pt-1">
                <div className="font-serif font-bold text-ink text-sm">
                  Betala direkt via Swish
                </div>
                <p className="text-[11px] text-ink-muted leading-relaxed">
                  Öppna Swish på mobilen och skanna QR-koden. Mottagare, belopp och referens fylls i automatiskt.
                </p>
                <div className="font-mono text-xs text-ink font-semibold pt-1">
                  Mottagare: {invoice.sender.swishNumber}
                </div>
              </div>
            </div>
          )}

          {invoice.notes && (
            <div className="text-[11px] text-ink-muted bg-paper p-3.5 rounded border border-ink-rule">
              <div className="font-serif font-semibold text-ink mb-1">Meddelande:</div>
              <div className="leading-relaxed whitespace-pre-wrap">{invoice.notes}</div>
            </div>
          )}
        </div>

        {/* Right Column: Financial Calculations breakdown */}
        <div className="bg-paper p-5 rounded border border-ink-border/80 space-y-2 text-ink-light text-xs">
          <div className="flex justify-between">
            <span className="text-ink-muted">Netto (exkl. moms)</span>
            <span className="font-mono font-medium text-ink tabular-nums">
              {formatCurrency(totals.subtotal, invoice.currency, invoice.language)}
            </span>
          </div>

          {/* Moms Breakdown specification */}
          <div className="py-2 border-y border-ink-rule space-y-1 text-[11px] text-ink-muted">
            <div className="text-[10px] font-bold text-taupe uppercase tracking-wider">Momsdeklaration</div>
            {invoice.isReverseCharge ? (
              <div className="flex justify-between text-fakt-700 italic">
                <span>Omvänd skattskyldighet (0%)</span>
                <span className="font-mono tabular-nums">0,00 kr</span>
              </div>
            ) : (
              Object.entries(totals.vatBreakdown).map(([rate, data]) => {
                if (data.base <= 0) return null;
                return (
                  <div key={rate} className="flex justify-between">
                    <span>Moms {rate}% (underlag {formatCurrency(data.base, invoice.currency, invoice.language)})</span>
                    <span className="font-mono tabular-nums text-ink-light">
                      {formatCurrency(data.vat, invoice.currency, invoice.language)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-between font-medium text-ink">
            <span>Total moms</span>
            <span className="font-mono tabular-nums">
              {formatCurrency(totals.totalVat, invoice.currency, invoice.language)}
            </span>
          </div>

          {totals.rotRutDeduction > 0 && (
            <div className="flex justify-between text-stamp font-medium">
              <span>Avgår ROT/RUT-skattereduktion</span>
              <span className="font-mono tabular-nums">
                -{formatCurrency(totals.rotRutDeduction, invoice.currency, invoice.language)}
              </span>
            </div>
          )}

          {totals.rounding !== 0 && (
            <div className="flex justify-between text-ink-muted text-[11px]">
              <span>Öresavrundning</span>
              <span className="font-mono tabular-nums">
                {formatCurrency(totals.rounding, invoice.currency, invoice.language)}
              </span>
            </div>
          )}

          <div className="pt-3 border-t-2 border-ink flex justify-between items-baseline text-ink font-bold">
            <span className="text-sm font-serif uppercase tracking-tight">Totalt att betala</span>
            <span className="text-2xl font-mono text-fakt-700 tabular-nums">
              {formatCurrency(totals.total, invoice.currency, invoice.language)}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Swedish Bankgiro Payment Slip / Bottom Footer */}
      <div className="mt-8 pt-6 border-t-2 border-ink grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] text-ink-muted">
        <div>
          <div className="font-serif font-bold text-ink text-xs mb-1">Avsändare</div>
          <div className="font-medium text-ink">{invoice.sender.name}</div>
          <div className="font-mono">Org.nr: {invoice.sender.orgNr || '-'}</div>
          {invoice.sender.vatNr && <div className="font-mono">Moms: {invoice.sender.vatNr}</div>}
        </div>

        <div>
          <div className="font-serif font-bold text-ink text-xs mb-1">Betalningskanaler</div>
          {invoice.sender.bankgiro && (
            <div className="font-mono font-semibold text-ink">BG: {invoice.sender.bankgiro}</div>
          )}
          {invoice.sender.plusgiro && (
            <div className="font-mono">PG: {invoice.sender.plusgiro}</div>
          )}
          {invoice.sender.bankAccount && (
            <div className="font-mono text-ink-light">{invoice.sender.bankAccount}</div>
          )}
          {invoice.sender.swishNumber && (
            <div className="font-mono text-ink font-medium">Swish: {invoice.sender.swishNumber}</div>
          )}
        </div>

        <div>
          <div className="font-serif font-bold text-ink text-xs mb-1">Internationell betalning</div>
          <div className="font-mono">{invoice.sender.iban || 'IBAN ej angivet'}</div>
          <div className="font-mono">BIC/Swift: {invoice.sender.bic || '-'}</div>
        </div>

        <div>
          <div className="font-serif font-bold text-ink text-xs mb-1">Villkor & Skattestatus</div>
          <div>{invoice.paymentTermsDays} dagar netto</div>
          <div>Dröjsmålsränta: {invoice.lateInterestRate}%</div>
          <div className="text-fakt-700 font-semibold mt-0.5">
            {invoice.sender.fSkatt ? 'Innehar F-skattsedel' : 'Ej godkänd för F-skatt'}
          </div>
        </div>
      </div>

      {/* Watermark badge (Free tier only) */}
      {!isPro && (
        <div className="mt-8 pt-4 border-t border-dashed border-ink-rule text-center text-[10px] text-ink-faint print:text-ink-muted">
          Skapad med <span className="font-serif font-semibold text-fakt-700">Fakt</span> — Tidlös fakturastudio för svenska frilansare (fakt.apps.harkco.se)
        </div>
      )}
    </div>
  );
};
