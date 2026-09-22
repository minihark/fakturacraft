import React from 'react';
import { Invoice, InvoiceItem, RotRutType } from '../types';
import { generateSwedishOcr, formatOrgNr, orgNrToVat } from '../utils/luhn';
import { addDays } from '../utils/currency';
import { 
  Building2, 
  User, 
  FileText, 
  Plus, 
  Trash2, 
  Sparkles, 
  Smartphone, 
  Upload
} from 'lucide-react';

interface InvoiceEditorProps {
  invoice: Invoice;
  onChange: (updated: Invoice) => void;
  isPro: boolean;
  onOpenProModal: () => void;
}

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({
  invoice,
  onChange,
  isPro,
  onOpenProModal,
}) => {

  const updateSender = (field: string, value: any) => {
    const updatedSender = { ...invoice.sender, [field]: value };
    if (field === 'orgNr') {
      updatedSender.orgNr = formatOrgNr(value);
      if (!invoice.sender.vatNr) {
        updatedSender.vatNr = orgNrToVat(value);
      }
    }
    onChange({ ...invoice, sender: updatedSender });
  };

  const updateRecipient = (field: string, value: any) => {
    const updatedRecipient = { ...invoice.recipient, [field]: value };
    if (field === 'orgNr') {
      updatedRecipient.orgNr = formatOrgNr(value);
    }
    onChange({ ...invoice, recipient: updatedRecipient });
  };

  const handleInvoiceNumberChange = (num: string) => {
    const newOcr = generateSwedishOcr(num);
    onChange({
      ...invoice,
      invoiceNumber: num,
      ocr: newOcr,
      swishMessage: `Faktura ${num}`,
    });
  };

  const handleTermsChange = (days: number) => {
    const newDueDate = addDays(invoice.issueDate, days);
    onChange({
      ...invoice,
      paymentTermsDays: days,
      dueDate: newDueDate,
    });
  };

  const handleIssueDateChange = (date: string) => {
    const newDueDate = addDays(date, invoice.paymentTermsDays);
    onChange({
      ...invoice,
      issueDate: date,
      dueDate: newDueDate,
    });
  };

  // Line item handlers
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: 'item-' + Date.now(),
      description: 'Ny tjänst / produkt',
      quantity: 1,
      unit: 'tim',
      unitPrice: 1000,
      vatRate: 25,
      rotRut: 'none',
    };
    onChange({ ...invoice, items: [...invoice.items, newItem] });
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const updatedItems = invoice.items.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange({ ...invoice, items: updatedItems });
  };

  const handleRemoveItem = (id: string) => {
    if (invoice.items.length <= 1) return;
    onChange({ ...invoice, items: invoice.items.filter((item) => item.id !== id) });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isPro) {
      onOpenProModal();
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateSender('logoUrl', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 text-slate-200">
      
      {/* 1. Avsändare (Ditt Företag) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-100">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>1. Ditt Företag (Avsändare)</span>
          </div>
          <label className="flex items-center gap-2 text-xs cursor-pointer select-none bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            <input
              type="checkbox"
              checked={invoice.sender.fSkatt}
              onChange={(e) => updateSender('fSkatt', e.target.checked)}
              className="rounded border-emerald-500 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
            />
            <span className="font-medium">Godkänd för F-skatt</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Företagsnamn / Namn</label>
            <input
              type="text"
              value={invoice.sender.name}
              onChange={(e) => updateSender('name', e.target.value)}
              placeholder="t.ex. Studio Nord AB"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Org.nr / Personnummer</label>
            <input
              type="text"
              value={invoice.sender.orgNr}
              onChange={(e) => updateSender('orgNr', e.target.value)}
              placeholder="556123-4567"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Momsreg.nr (VAT)</label>
            <input
              type="text"
              value={invoice.sender.vatNr}
              onChange={(e) => updateSender('vatNr', e.target.value)}
              placeholder="SE556123456701"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">E-post</label>
            <input
              type="email"
              value={invoice.sender.email}
              onChange={(e) => updateSender('email', e.target.value)}
              placeholder="ekonomi@företaget.se"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Gatuadress</label>
            <input
              type="text"
              value={invoice.sender.address}
              onChange={(e) => updateSender('address', e.target.value)}
              placeholder="Storgatan 1"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Postnummer & Ort</label>
            <input
              type="text"
              value={invoice.sender.zipCity}
              onChange={(e) => updateSender('zipCity', e.target.value)}
              placeholder="411 20 Göteborg"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Logo upload (Pro feature) */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Företagslogotyp</span>
            {!isPro && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                PRO
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {invoice.sender.logoUrl ? (
              <button
                type="button"
                onClick={() => updateSender('logoUrl', '')}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Ta bort logo
              </button>
            ) : (
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors">
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span>Ladda upp PNG/SVG</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* 2. Kund (Mottagare) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-100">
            <User className="w-4 h-4 text-emerald-400" />
            <span>2. Kund / Mottagare</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Kundnamn / Företag</label>
            <input
              type="text"
              value={invoice.recipient.name}
              onChange={(e) => updateRecipient('name', e.target.value)}
              placeholder="Kund AB"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Org.nr / Personnummer</label>
            <input
              type="text"
              value={invoice.recipient.orgNr}
              onChange={(e) => updateRecipient('orgNr', e.target.value)}
              placeholder="556000-0000"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Referensperson / Att</label>
            <input
              type="text"
              value={invoice.recipient.contactPerson}
              onChange={(e) => updateRecipient('contactPerson', e.target.value)}
              placeholder="Anna Andersson"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Kundens E-post</label>
            <input
              type="email"
              value={invoice.recipient.email}
              onChange={(e) => updateRecipient('email', e.target.value)}
              placeholder="faktura@kunden.se"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Gatuadress</label>
            <input
              type="text"
              value={invoice.recipient.address}
              onChange={(e) => updateRecipient('address', e.target.value)}
              placeholder="Kundgatan 12"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Postnummer & Ort</label>
            <input
              type="text"
              value={invoice.recipient.zipCity}
              onChange={(e) => updateRecipient('zipCity', e.target.value)}
              placeholder="111 22 Stockholm"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Fakturadetaljer & OCR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-100">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>3. Fakturainfo & Betalningsvillkor</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Fakturanummer</label>
            <input
              type="text"
              value={invoice.invoiceNumber}
              onChange={(e) => handleInvoiceNumberChange(e.target.value)}
              placeholder="1001"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400">OCR-nummer (Luhn)</label>
              <button
                type="button"
                onClick={() => onChange({ ...invoice, ocr: generateSwedishOcr(invoice.invoiceNumber) })}
                className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
              >
                <Sparkles className="w-2.5 h-2.5" /> Beräkna
              </button>
            </div>
            <input
              type="text"
              value={invoice.ocr}
              onChange={(e) => onChange({ ...invoice, ocr: e.target.value })}
              placeholder="100147"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Betalningsvillkor</label>
            <div className="flex gap-1.5">
              {[14, 30, 60].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => handleTermsChange(days)}
                  className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-medium transition-colors ${
                    invoice.paymentTermsDays === days
                      ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {days} dgr
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Fakturadatum</label>
            <input
              type="date"
              value={invoice.issueDate}
              onChange={(e) => handleIssueDateChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Förfallodatum</label>
            <input
              type="date"
              value={invoice.dueDate}
              onChange={(e) => onChange({ ...invoice, dueDate: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Dröjsmålsränta (%)</label>
            <input
              type="number"
              value={invoice.lateInterestRate}
              onChange={(e) => onChange({ ...invoice, lateInterestRate: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Fakturarader & Moms */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-100">
            <span>4. Fakturarader & Moms</span>
          </div>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lägg till rad</span>
          </button>
        </div>

        <div className="space-y-3">
          {invoice.items.map((item, index) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/90 flex flex-col gap-3 text-xs group hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-slate-500 text-[11px]">#{index + 1}</span>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                  placeholder="Beskrivning av tjänst eller vara"
                  className="flex-1 bg-transparent border-b border-slate-800 focus:border-emerald-500 pb-1 text-slate-100 font-medium focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={invoice.items.length <= 1}
                  className="p-1 rounded text-slate-500 hover:text-red-400 disabled:opacity-20 transition-colors"
                  title="Ta bort rad"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 items-center">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Antal</label>
                  <input
                    type="number"
                    step="any"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Enhet</label>
                  <select
                    value={item.unit}
                    onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="tim">tim (timmar)</option>
                    <option value="st">st (styck)</option>
                    <option value="dagar">dagar</option>
                    <option value="mån">mån</option>
                    <option value="km">km</option>
                    <option value="ord">ord</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">À-pris (exkl. moms)</label>
                  <input
                    type="number"
                    step="any"
                    value={item.unitPrice}
                    onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Moms</label>
                  <select
                    value={item.vatRate}
                    onChange={(e) => handleUpdateItem(item.id, 'vatRate', parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value={25}>25% (Standard)</option>
                    <option value={12}>12% (Mat/Logi)</option>
                    <option value={6}>6% (Kultur/Böcker)</option>
                    <option value={0}>0% (Momsfri / Export)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">ROT / RUT</label>
                  <select
                    value={item.rotRut || 'none'}
                    onChange={(e) => handleUpdateItem(item.id, 'rotRut', e.target.value as RotRutType)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="none">Ej avdrag</option>
                    <option value="rot">ROT (30%)</option>
                    <option value="rut">RUT (50%)</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Betalningsmetoder & Swish */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-100">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>5. Betalsätt & Swish QR</span>
          </div>

          <label className="flex items-center gap-2 text-xs cursor-pointer select-none bg-red-950/40 text-red-300 border border-red-500/30 px-2.5 py-1 rounded-full">
            <input
              type="checkbox"
              checked={invoice.showSwishQR}
              onChange={(e) => onChange({ ...invoice, showSwishQR: e.target.checked })}
              className="rounded border-red-500 text-red-600 focus:ring-red-500 h-3.5 w-3.5"
            />
            <span className="font-semibold">Visa Swish QR-kod</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Swish-nummer (Mobil el. Företag 123...)</label>
            <input
              type="text"
              value={invoice.sender.swishNumber}
              onChange={(e) => updateSender('swishNumber', e.target.value)}
              placeholder="123 456 78 90 eller 0701234567"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Swish-meddelande</label>
            <input
              type="text"
              value={invoice.swishMessage}
              onChange={(e) => onChange({ ...invoice, swishMessage: e.target.value })}
              placeholder="Faktura 1001"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Bankgiro</label>
            <input
              type="text"
              value={invoice.sender.bankgiro}
              onChange={(e) => updateSender('bankgiro', e.target.value)}
              placeholder="512-3456"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Plusgiro (valfritt)</label>
            <input
              type="text"
              value={invoice.sender.plusgiro}
              onChange={(e) => updateSender('plusgiro', e.target.value)}
              placeholder="12 34 56-7"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">IBAN (för utlandsbetalning)</label>
            <input
              type="text"
              value={invoice.sender.iban}
              onChange={(e) => updateSender('iban', e.target.value)}
              placeholder="SE4550000000051234567890"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">BIC / Swift</label>
            <input
              type="text"
              value={invoice.sender.bic}
              onChange={(e) => updateSender('bic', e.target.value)}
              placeholder="ESSESESS"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800">
          <label className="block text-slate-400 mb-1 text-xs">Meddelande / Anteckning på fakturan</label>
          <textarea
            rows={2}
            value={invoice.notes}
            onChange={(e) => onChange({ ...invoice, notes: e.target.value })}
            placeholder="Tack för affären! Ange fakturanummer vid betalning."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none resize-none"
          />
        </div>
      </div>

    </div>
  );
};
