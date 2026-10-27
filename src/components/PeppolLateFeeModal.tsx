import React, { useState } from 'react';
import { Invoice } from '../types';
import { calculateInvoiceTotals, formatCurrency } from '../utils/currency';
import {
  generatePeppolXml,
  downloadPeppolXmlFile,
  calculateSwedishLateFee,
} from '../utils/peppol';
import {
  X,
  FileCode2,
  Calculator,
  Copy,
  Check,
  Download,
  Plus,
} from 'lucide-react';

interface PeppolLateFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onChange: (updated: Invoice) => void;
}

export const PeppolLateFeeModal: React.FC<PeppolLateFeeModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<'peppol' | 'latefee'>('peppol');
  const [copiedMode, setCopiedMode] = useState<string | null>(null);

  const totals = calculateInvoiceTotals(invoice.items, invoice.isReverseCharge);
  const [ratePct, setRatePct] = useState<number>(invoice.lateInterestRate || 11.5);
  const [daysLate, setDaysLate] = useState<number>(30);
  const [feeKind, setFeeKind] = useState<'b2b_450' | 'reminder_60' | 'none'>('b2b_450');

  if (!isOpen) return null;

  const xmlContent = generatePeppolXml(invoice);
  const lateCalc = calculateSwedishLateFee(totals.total, ratePct, daysLate, feeKind);

  const handleCopy = async (text: string, mode: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMode(mode);
      setTimeout(() => setCopiedMode(null), 2200);
    } catch {}
  };

  const handleAddLateFeeToInvoice = () => {
    const newItems = [...invoice.items];
    if (lateCalc.interestAmount > 0) {
      newItems.push({
        id: 'item-int-' + Date.now(),
        description: `Dröjsmålsränta (${ratePct}% årsränta, ${daysLate} dagar försenad)`,
        quantity: 1,
        unit: 'st',
        unitPrice: Math.round(lateCalc.interestAmount),
        vatRate: 0, // Dröjsmålsränta och påminnelseavgift är momsfria (0% moms)
        itemType: 'standard',
        rotRut: 'none',
      });
    }
    if (lateCalc.statutoryFee > 0) {
      newItems.push({
        id: 'item-fee-' + Date.now() + 1,
        description:
          feeKind === 'b2b_450'
            ? 'Lagstadgad förseningsersättning (Räntelagen B2B)'
            : 'Påminnelseavgift',
        quantity: 1,
        unit: 'st',
        unitPrice: lateCalc.statutoryFee,
        vatRate: 0,
        itemType: 'standard',
        rotRut: 'none',
      });
    }
    onChange({
      ...invoice,
      lateInterestRate: ratePct,
      items: newItems,
    });
    onClose();
  };

  const reminderSnippet = [
    `BETALNINGSPÅMINNELSE — Faktura #${invoice.invoiceNumber} (OCR: ${invoice.ocr})`,
    `Ursprungligt belopp (förfallodag ${invoice.dueDate}): ${formatCurrency(totals.total, invoice.currency)}`,
    `Dröjsmålsränta (${ratePct}% under ${daysLate} dagar): ${formatCurrency(lateCalc.interestAmount, invoice.currency)}`,
    lateCalc.statutoryFee > 0
      ? `${feeKind === 'b2b_450' ? 'Förseningsersättning (B2B)' : 'Påminnelseavgift'}: ${formatCurrency(lateCalc.statutoryFee, invoice.currency)}`
      : null,
    `ATT BETALA OMGÅENDE: ${formatCurrency(lateCalc.totalWithLateFee, invoice.currency)}`,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs overflow-y-auto print:hidden">
      <div className="relative w-full max-w-3xl bg-paper-card border border-ink-border rounded-xl shadow-2xl overflow-hidden text-ink my-6">
        {/* Header */}
        <div className="bg-fakt-700 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-fakt-100">
              Svensk E-Faktura & Räntelagen (1975:635)
            </div>
            <h2 className="font-serif text-xl font-bold">
              Peppol BIS 3.0 XML & Dröjsmålsräntekalkylator
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-ink-border bg-paper px-6 pt-3 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('peppol')}
            className={`px-4 py-2 rounded-t-lg border-t border-x flex items-center gap-1.5 transition ${
              activeTab === 'peppol'
                ? 'bg-paper-card border-ink-border text-fakt-700 -mb-px font-bold'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>Peppol BIS 3.0 (UBL 2.1 E-Faktura)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('latefee')}
            className={`px-4 py-2 rounded-t-lg border-t border-x flex items-center gap-1.5 transition ${
              activeTab === 'latefee'
                ? 'bg-paper-card border-ink-border text-fakt-700 -mb-px font-bold'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Dröjsmålsränta & Påminnelsekalkyl</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {activeTab === 'peppol' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-paper p-3.5 rounded-lg border border-ink-border text-xs">
                <div>
                  <div className="font-bold text-ink">
                    Faktura #{invoice.invoiceNumber} • EN 16931 / Peppol BIS Billing 3.0
                  </div>
                  <div className="text-ink-muted">
                    Redo för import i Fortnox, Visma, InExchange och offentlig sektor (DIGG).
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(xmlContent, 'xml')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-ink-border bg-paper-card hover:bg-paper-desk text-ink font-semibold"
                  >
                    {copiedMode === 'xml' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kopierad!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Kopiera XML</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadPeppolXmlFile(invoice)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-fakt-600 hover:bg-fakt-700 text-white font-semibold shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Ladda ner .xml</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-lg bg-[#18181B] text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-80 leading-relaxed">
                {xmlContent}
              </pre>
            </div>
          ) : (
            <div className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-lg bg-paper border border-ink-border space-y-2">
                  <div className="font-bold text-ink">1. Årsränta (%)</div>
                  <div className="flex gap-1.5">
                    {[
                      { label: '11% (Lag)', val: 11 },
                      { label: '12%', val: 12 },
                      { label: '18%', val: 18 },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setRatePct(p.val)}
                        className={`flex-1 py-1 rounded font-mono font-bold border ${
                          ratePct === p.val
                            ? 'bg-fakt-600 text-white border-fakt-600'
                            : 'bg-paper-card text-ink border-ink-border'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    step={0.5}
                    value={ratePct}
                    onChange={(e) => setRatePct(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded border border-ink-border bg-paper-card font-mono text-sm"
                  />
                </div>

                <div className="p-3.5 rounded-lg bg-paper border border-ink-border space-y-2">
                  <div className="font-bold text-ink">2. Antal dagar försenad</div>
                  <div className="flex gap-1.5">
                    {[14, 30, 60, 90].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDaysLate(d)}
                        className={`flex-1 py-1 rounded font-mono font-bold border ${
                          daysLate === d
                            ? 'bg-fakt-600 text-white border-fakt-600'
                            : 'bg-paper-card text-ink border-ink-border'
                        }`}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={daysLate}
                    onChange={(e) => setDaysLate(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded border border-ink-border bg-paper-card font-mono text-sm"
                  />
                </div>

                <div className="p-3.5 rounded-lg bg-paper border border-ink-border space-y-2">
                  <div className="font-bold text-ink">3. Lagstadgad avgift (0% moms)</div>
                  <div className="space-y-1.5">
                    {[
                      { id: 'b2b_450', label: 'Förseningsersättning B2B (450 kr)' },
                      { id: 'reminder_60', label: 'Påminnelseavgift (60 kr)' },
                      { id: 'none', label: 'Ingen avgift (0 kr)' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFeeKind(opt.id as 'b2b_450' | 'reminder_60' | 'none')}
                        className={`w-full text-left px-2.5 py-1 rounded font-medium border ${
                          feeKind === opt.id
                            ? 'bg-fakt-600 text-white border-fakt-600 font-bold'
                            : 'bg-paper-card text-ink border-ink-border'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calculation Result Summary */}
              <div className="p-4 rounded-xl bg-fakt-50 border border-fakt-200 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div>
                  <div className="text-[10px] uppercase text-ink-muted">Fakturabelopp</div>
                  <div className="text-base font-bold text-ink">
                    {formatCurrency(lateCalc.principal, invoice.currency)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-ink-muted">
                    Dröjsmålsränta ({daysLate} d)
                  </div>
                  <div className="text-base font-bold text-fakt-700">
                    +{formatCurrency(lateCalc.interestAmount, invoice.currency)}
                  </div>
                  <div className="text-[10px] text-ink-muted">
                    ({formatCurrency(lateCalc.dailyInterestSek, invoice.currency)}/dag)
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-ink-muted">Avgift (momsfri)</div>
                  <div className="text-base font-bold text-fakt-700">
                    +{formatCurrency(lateCalc.statutoryFee, invoice.currency)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-ink-muted">Nytt totalbelopp</div>
                  <div className="text-lg font-black text-ink">
                    {formatCurrency(lateCalc.totalWithLateFee, invoice.currency)}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCopy(reminderSnippet, 'reminder')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-ink-border bg-paper hover:bg-paper-desk text-ink font-semibold"
                >
                  {copiedMode === 'reminder' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Påminnelsetext kopierad!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Kopiera påminnelsetext</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleAddLateFeeToInvoice}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-fakt-600 hover:bg-fakt-700 text-white font-bold shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Lägg till ränta & avgift på fakturan</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
