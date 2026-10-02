import React from 'react';
import { Invoice, InvoiceItem, RotRutType, LineItemType, InvoiceStatus } from '../types';
import { generateSwedishOcr, formatOrgNr, orgNrToVat } from '../utils/luhn';
import { addDays } from '../utils/currency';
import { 
  Building2, 
  User, 
  FileText, 
  Plus, 
  Trash2, 
  Smartphone, 
  Upload,
  Globe,
  Landmark
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
      description: 'Ny konsulttimme / tjänst',
      quantity: 1,
      unit: 'tim',
      unitPrice: 1200,
      vatRate: invoice.isReverseCharge ? 0 : 25,
      itemType: 'labor',
      rotRut: 'none',
    };
    onChange({ ...invoice, items: [...invoice.items, newItem] });
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const updatedItems = invoice.items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // If switched to material, clear ROT/RUT automatically
        if (field === 'itemType' && value === 'material') {
          updated.rotRut = 'none';
        }
        return updated;
      }
      return item;
    });
    onChange({ ...invoice, items: updatedItems });
  };

  const handleRemoveItem = (id: string) => {
    if (invoice.items.length <= 1) return;
    const updatedItems = invoice.items.filter((item) => item.id !== id);
    onChange({ ...invoice, items: updatedItems });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPro) {
      onOpenProModal();
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        updateSender('logoUrl', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleReverseCharge = (enabled: boolean) => {
    const defaultText = 'Reverse charge: Supply of services subject to the reverse charge mechanism according to Article 196 of Council Directive 2006/112/EC. VAT to be accounted for by the recipient.';
    onChange({
      ...invoice,
      isReverseCharge: enabled,
      reverseChargeText: enabled ? (invoice.reverseChargeText || defaultText) : '',
    });
  };

  return (
    <div className="space-y-6 text-xs text-ink">
      
      {/* 1. Header & General Document Meta */}
      <section className="bg-paper-card p-5 rounded-lg border border-ink-border shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-ink-rule pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-fakt-600" />
            <h3 className="font-serif text-sm font-bold text-ink tracking-tight">
              1. Faktura & Betalningsvillkor
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-taupe">Status:</span>
            <select
              value={invoice.status || 'draft'}
              onChange={(e) => onChange({ ...invoice, status: e.target.value as InvoiceStatus })}
              className="bg-paper border border-ink-border rounded px-2 py-0.5 text-xs text-ink font-medium focus:outline-none focus:border-fakt-500 cursor-pointer"
            >
              <option value="draft">Utkast</option>
              <option value="sent">Skickad</option>
              <option value="paid">Betald</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
              Fakturanr
            </label>
            <input
              type="text"
              value={invoice.invoiceNumber}
              onChange={(e) => handleInvoiceNumberChange(e.target.value)}
              className="ruled-input w-full font-mono text-sm font-bold"
              placeholder="1001"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
              Fakturadatum
            </label>
            <input
              type="date"
              value={invoice.issueDate}
              onChange={(e) => handleIssueDateChange(e.target.value)}
              className="ruled-input w-full font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
              Betalningsvillkor
            </label>
            <select
              value={invoice.paymentTermsDays}
              onChange={(e) => handleTermsChange(Number(e.target.value))}
              className="ruled-input w-full font-mono text-xs cursor-pointer"
            >
              <option value="10">10 dagar netto</option>
              <option value="14">14 dagar netto</option>
              <option value="20">20 dagar netto</option>
              <option value="30">30 dagar netto</option>
              <option value="60">60 dagar netto</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
              Förfallodatum
            </label>
            <input
              type="date"
              value={invoice.dueDate}
              onChange={(e) => onChange({ ...invoice, dueDate: e.target.value })}
              className="ruled-input w-full font-mono text-xs text-stamp font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
              OCR / Referens
            </label>
            <input
              type="text"
              value={invoice.ocr}
              onChange={(e) => onChange({ ...invoice, ocr: e.target.value })}
              className="ruled-input w-full font-mono text-xs"
              placeholder="Beräknas automatiskt"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
              Vår referens
            </label>
            <input
              type="text"
              value={invoice.ourReference || ''}
              onChange={(e) => onChange({ ...invoice, ourReference: e.target.value })}
              className="ruled-input w-full text-xs"
              placeholder="Ditt namn"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
              Er referens
            </label>
            <input
              type="text"
              value={invoice.yourReference || ''}
              onChange={(e) => onChange({ ...invoice, yourReference: e.target.value })}
              className="ruled-input w-full text-xs"
              placeholder="Beställare / Att."
            />
          </div>
        </div>
      </section>

      {/* 2. Sender Information (Ditt Företag) */}
      <section className="bg-paper-card p-5 rounded-lg border border-ink-border shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-ink-rule pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-fakt-600" />
            <h3 className="font-serif text-sm font-bold text-ink tracking-tight">
              2. Avsändare (Ditt företag)
            </h3>
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
            <input
              type="checkbox"
              checked={invoice.sender.fSkatt}
              onChange={(e) => updateSender('fSkatt', e.target.checked)}
              className="rounded border-ink-border text-fakt-600 focus:ring-0"
            />
            <span className="font-medium text-ink">Godkänd för F-skatt</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
              Företagsnamn
            </label>
            <input
              type="text"
              value={invoice.sender.name}
              onChange={(e) => updateSender('name', e.target.value)}
              className="ruled-input w-full font-medium"
              placeholder="Ditt Företag AB / Enskild firma"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
                Org.nr / Personnr
              </label>
              <input
                type="text"
                value={invoice.sender.orgNr}
                onChange={(e) => updateSender('orgNr', e.target.value)}
                className="ruled-input w-full font-mono"
                placeholder="556123-4567"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
                Momsreg.nr (VAT)
              </label>
              <input
                type="text"
                value={invoice.sender.vatNr}
                onChange={(e) => updateSender('vatNr', e.target.value)}
                className="ruled-input w-full font-mono"
                placeholder="SE556123456701"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
              Gatuadress
            </label>
            <input
              type="text"
              value={invoice.sender.address}
              onChange={(e) => updateSender('address', e.target.value)}
              className="ruled-input w-full"
              placeholder="Gata 12"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
              Postnummer & Ort
            </label>
            <input
              type="text"
              value={invoice.sender.zipCity}
              onChange={(e) => updateSender('zipCity', e.target.value)}
              className="ruled-input w-full"
              placeholder="411 36 Göteborg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
              E-post
            </label>
            <input
              type="email"
              value={invoice.sender.email}
              onChange={(e) => updateSender('email', e.target.value)}
              className="ruled-input w-full"
              placeholder="kontakt@foretag.se"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
              Telefon
            </label>
            <input
              type="text"
              value={invoice.sender.phone}
              onChange={(e) => updateSender('phone', e.target.value)}
              className="ruled-input w-full"
              placeholder="070-123 45 67"
            />
          </div>
        </div>

        {/* Banking and Payout accounts */}
        <div className="pt-3 border-t border-ink-rule">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-light mb-3">
            <Landmark className="w-3.5 h-3.5 text-taupe" />
            <span>Bank- & Betalningskonton</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-medium text-taupe uppercase mb-1">Bankgiro</label>
              <input
                type="text"
                value={invoice.sender.bankgiro}
                onChange={(e) => updateSender('bankgiro', e.target.value)}
                className="ruled-input w-full font-mono text-xs"
                placeholder="512-3456"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-taupe uppercase mb-1">Plusgiro</label>
              <input
                type="text"
                value={invoice.sender.plusgiro}
                onChange={(e) => updateSender('plusgiro', e.target.value)}
                className="ruled-input w-full font-mono text-xs"
                placeholder="12 34 56-7"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-taupe uppercase mb-1">Swish-nummer</label>
              <input
                type="text"
                value={invoice.sender.swishNumber}
                onChange={(e) => updateSender('swishNumber', e.target.value)}
                className="ruled-input w-full font-mono text-xs"
                placeholder="123 456 78 90 / 070..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-taupe uppercase mb-1">Bankkonto</label>
              <input
                type="text"
                value={invoice.sender.bankAccount || ''}
                onChange={(e) => updateSender('bankAccount', e.target.value)}
                className="ruled-input w-full font-mono text-xs"
                placeholder="Clearing + Konto"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div>
              <label className="block text-[10px] font-medium text-taupe uppercase mb-1">IBAN (Utland)</label>
              <input
                type="text"
                value={invoice.sender.iban}
                onChange={(e) => updateSender('iban', e.target.value)}
                className="ruled-input w-full font-mono text-xs"
                placeholder="SE..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-taupe uppercase mb-1">BIC / Swift</label>
              <input
                type="text"
                value={invoice.sender.bic}
                onChange={(e) => updateSender('bic', e.target.value)}
                className="ruled-input w-full font-mono text-xs"
                placeholder="ESSESESS"
              />
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="pt-2 flex items-center justify-between border-t border-ink-rule text-xs">
          <div className="text-ink-muted">
            <span className="font-medium text-ink">Egen företagslogotyp: </span>
            {invoice.sender.logoUrl ? 'Uppladdad' : 'Ingen logotyp'}
          </div>
          <div>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-ink-border hover:bg-paper-desk text-ink transition-colors">
              <Upload className="w-3.5 h-3.5 text-taupe" />
              <span>{invoice.sender.logoUrl ? 'Byt logotyp' : 'Ladda upp logotyp'}</span>
              {!isPro && (
                <span className="text-[9px] bg-fakt-50 border border-fakt-200 text-fakt-700 px-1 rounded font-bold">
                  PRO
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
            {invoice.sender.logoUrl && (
              <button
                type="button"
                onClick={() => updateSender('logoUrl', '')}
                className="ml-2 text-stamp hover:underline text-[11px]"
              >
                Ta bort
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. Recipient Information (Kund) */}
      <section className="bg-paper-card p-5 rounded-lg border border-ink-border shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-ink-rule pb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-fakt-600" />
            <h3 className="font-serif text-sm font-bold text-ink tracking-tight">
              3. Mottagare (Kund)
            </h3>
          </div>

          {/* Reverse charge trigger */}
          <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
            <Globe className="w-3.5 h-3.5 text-taupe" />
            <input
              type="checkbox"
              checked={!!invoice.isReverseCharge}
              onChange={(e) => handleToggleReverseCharge(e.target.checked)}
              className="rounded border-ink-border text-fakt-600 focus:ring-0"
            />
            <span className="text-ink font-medium">EU Reverse Charge (0% moms)</span>
          </label>
        </div>

        {invoice.isReverseCharge && (
          <div className="p-3 rounded bg-fakt-50 border border-fakt-200 text-xs text-fakt-800 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <span>🏛️ Omvänd skattskyldighet aktiverad</span>
            </div>
            <p className="text-[11px] leading-relaxed text-fakt-700">
              Samtliga rader faktureras med 0% moms. Ange kundens utländska EU VAT-nummer nedan för Skatteverkets periodiska sammanställning.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
              Kundnamn / Företagsnamn
            </label>
            <input
              type="text"
              value={invoice.recipient.name}
              onChange={(e) => updateRecipient('name', e.target.value)}
              className="ruled-input w-full font-medium"
              placeholder="Kund AB"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
                Org.nr / Personnr
              </label>
              <input
                type="text"
                value={invoice.recipient.orgNr}
                onChange={(e) => updateRecipient('orgNr', e.target.value)}
                className="ruled-input w-full font-mono"
                placeholder="556789-0123"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
                {invoice.isReverseCharge ? 'EU VAT-nummer *' : 'Kundnummer'}
              </label>
              <input
                type="text"
                value={invoice.isReverseCharge ? (invoice.recipient.vatNr || '') : (invoice.recipient.customerNumber || '')}
                onChange={(e) => {
                  if (invoice.isReverseCharge) {
                    updateRecipient('vatNr', e.target.value);
                  } else {
                    updateRecipient('customerNumber', e.target.value);
                  }
                }}
                className="ruled-input w-full font-mono"
                placeholder={invoice.isReverseCharge ? 'NL882910394B01' : 'KUND-101'}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
              Kontaktperson (Att)
            </label>
            <input
              type="text"
              value={invoice.recipient.contactPerson}
              onChange={(e) => updateRecipient('contactPerson', e.target.value)}
              className="ruled-input w-full"
              placeholder="Namn på beställare"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
              E-post
            </label>
            <input
              type="email"
              value={invoice.recipient.email}
              onChange={(e) => updateRecipient('email', e.target.value)}
              className="ruled-input w-full"
              placeholder="ekonomi@kund.se"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
              Gatuadress
            </label>
            <input
              type="text"
              value={invoice.recipient.address}
              onChange={(e) => updateRecipient('address', e.target.value)}
              className="ruled-input w-full"
              placeholder="Storgatan 1"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
                Postnr & Ort
              </label>
              <input
                type="text"
                value={invoice.recipient.zipCity}
                onChange={(e) => updateRecipient('zipCity', e.target.value)}
                className="ruled-input w-full"
                placeholder="111 22 Stockholm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
                Land
              </label>
              <input
                type="text"
                value={invoice.recipient.country}
                onChange={(e) => updateRecipient('country', e.target.value)}
                className="ruled-input w-full"
                placeholder="Sverige"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Line Items Table */}
      <section className="bg-paper-card p-5 rounded-lg border border-ink-border shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-ink-rule pb-3">
          <div>
            <h3 className="font-serif text-sm font-bold text-ink tracking-tight">
              4. Rader & Tjänster
            </h3>
            <p className="text-[11px] text-ink-muted">
              Specificera timmar, produkter och ROT/RUT.
            </p>
          </div>
          
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-fakt-50 hover:bg-fakt-100 border border-fakt-200 text-fakt-700 text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lägg till rad</span>
          </button>
        </div>

        <div className="space-y-3">
          {invoice.items.map((item, index) => (
            <div 
              key={item.id}
              className="p-3 rounded-lg border border-ink-rule bg-paper/60 hover:bg-paper transition-colors space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] text-taupe font-bold">
                  RAD {index + 1}
                </span>

                <div className="flex items-center gap-2">
                  {/* Item type toggle: Arbete vs Material */}
                  <select
                    value={item.itemType || 'labor'}
                    onChange={(e) => handleUpdateItem(item.id, 'itemType', e.target.value as LineItemType)}
                    className="text-[11px] bg-paper-card border border-ink-border rounded px-2 py-0.5 text-ink cursor-pointer focus:outline-none focus:border-fakt-500"
                  >
                    <option value="labor">Arbete (ROT/RUT behörig)</option>
                    <option value="material">Material / Utlägg (Ej ROT/RUT)</option>
                    <option value="standard">Standardtjänst</option>
                  </select>

                  {/* ROT/RUT Selector (disabled if material) */}
                  {item.itemType !== 'material' && !invoice.isReverseCharge && (
                    <select
                      value={item.rotRut || 'none'}
                      onChange={(e) => handleUpdateItem(item.id, 'rotRut', e.target.value as RotRutType)}
                      className="text-[11px] bg-paper-card border border-ink-border rounded px-2 py-0.5 text-ink cursor-pointer focus:outline-none focus:border-fakt-500"
                    >
                      <option value="none">Ingen skattereduktion</option>
                      <option value="rot">ROT (30% avdrag)</option>
                      <option value="rut">RUT (50% avdrag)</option>
                    </select>
                  )}

                  {invoice.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-ink-muted hover:text-stamp p-1 transition-colors"
                      title="Ta bort rad"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Description field */}
              <div>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                  className="ruled-input w-full font-medium text-xs"
                  placeholder="Beskrivning av utfört arbete eller levererad vara"
                />
              </div>

              {/* Numerical details row */}
              <div className="grid grid-cols-4 sm:grid-cols-12 gap-2 pt-1">
                <div className="col-span-2 sm:col-span-3">
                  <label className="block text-[10px] text-taupe uppercase mb-0.5">Antal</label>
                  <input
                    type="number"
                    step="any"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="ruled-input w-full font-mono text-xs tabular-nums"
                  />
                </div>

                <div className="col-span-2 sm:col-span-2">
                  <label className="block text-[10px] text-taupe uppercase mb-0.5">Enhet</label>
                  <select
                    value={item.unit}
                    onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                    className="ruled-input w-full text-xs cursor-pointer"
                  >
                    <option value="tim">tim</option>
                    <option value="st">st</option>
                    <option value="dagar">dagar</option>
                    <option value="mån">mån</option>
                    <option value="km">km</option>
                    <option value="paket">paket</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-4">
                  <label className="block text-[10px] text-taupe uppercase mb-0.5">
                    À-pris ({invoice.currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={item.unitPrice}
                    onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="ruled-input w-full font-mono text-xs tabular-nums"
                  />
                </div>

                <div className="col-span-2 sm:col-span-3">
                  <label className="block text-[10px] text-taupe uppercase mb-0.5">Moms</label>
                  <select
                    value={invoice.isReverseCharge ? 0 : item.vatRate}
                    disabled={!!invoice.isReverseCharge}
                    onChange={(e) => handleUpdateItem(item.id, 'vatRate', Number(e.target.value))}
                    className="ruled-input w-full font-mono text-xs cursor-pointer disabled:opacity-50"
                  >
                    <option value="25">25% (Standard)</option>
                    <option value="12">12% (Livsmedel)</option>
                    <option value="6">6% (Böcker/Kultur)</option>
                    <option value="0">0% (Momsfritt)</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Swish QR & Notes */}
      <section className="bg-paper-card p-5 rounded-lg border border-ink-border shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-ink-rule pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-fakt-600" />
            <h3 className="font-serif text-sm font-bold text-ink tracking-tight">
              5. Swish QR & Fakturatext
            </h3>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
            <input
              type="checkbox"
              checked={invoice.showSwishQR}
              onChange={(e) => onChange({ ...invoice, showSwishQR: e.target.checked })}
              className="rounded border-ink-border text-fakt-600 focus:ring-0"
            />
            <span className="font-medium text-ink">Inkludera Swish QR på fakturan</span>
          </label>
        </div>

        {invoice.showSwishQR && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
                Swish-meddelande
              </label>
              <input
                type="text"
                value={invoice.swishMessage}
                onChange={(e) => onChange({ ...invoice, swishMessage: e.target.value })}
                className="ruled-input w-full font-mono text-xs"
                placeholder="Faktura 1001"
              />
              <p className="text-[10px] text-ink-muted mt-1">
                Förifylls i kundens Swish-app vid scanning.
              </p>
            </div>
            
            <div className="p-2.5 rounded bg-paper border border-ink-rule text-[11px] text-ink-muted">
              <span className="font-semibold text-ink">Getswish Standard: </span>
              QR-koden genereras enligt officiell standard för omedelbar betalning till {invoice.sender.swishNumber || 'angivet Swish-nummer'}.
            </div>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-medium text-taupe uppercase tracking-wider mb-1">
            Fakturatext / Noteringar
          </label>
          <textarea
            rows={3}
            value={invoice.notes}
            onChange={(e) => onChange({ ...invoice, notes: e.target.value })}
            className="w-full bg-paper border border-ink-border rounded p-2.5 text-xs text-ink focus:outline-none focus:border-fakt-500"
            placeholder="Tack för samarbetet! Vänligen ange fakturanummer eller OCR vid inbetalning."
          />
        </div>
      </section>

    </div>
  );
};
