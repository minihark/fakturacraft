import React from 'react';
import { Invoice, InvoiceTemplate, Currency } from '../types';
import { PRESETS } from '../utils/defaultData';
import { downloadSIE4File } from '../utils/sie4';
import { 
  Printer, 
  Sparkles, 
  Check, 
  FileCode2,
  FolderOpen,
  Eye,
  Edit3
} from 'lucide-react';

interface NavbarProps {
  invoice: Invoice;
  onChange: (updated: Invoice) => void;
  isPro: boolean;
  onOpenProModal: () => void;
  activeView: 'editor' | 'preview';
  onToggleView: (view: 'editor' | 'preview') => void;
  onOpenDrawer: () => void;
  savedInvoicesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  invoice,
  onChange,
  isPro,
  onOpenProModal,
  activeView,
  onToggleView,
  onOpenDrawer,
  savedInvoicesCount,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSIE4 = () => {
    if (!isPro) {
      onOpenProModal();
      return;
    }
    downloadSIE4File(invoice);
  };

  const handleApplyPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      onChange({
        ...invoice,
        ...preset,
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-md border-b border-ink-border px-4 py-3 print:hidden">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Brand & Drawer Access */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            {/* The Tactile Stamp Mark */}
            <div className="w-8 h-8 rounded bg-fakt-600 flex items-center justify-center text-white font-serif font-black text-lg shadow-sm select-none">
              F
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base text-ink tracking-tight">
                  Fakt
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-fakt-50 border border-fakt-200 text-fakt-700 font-mono font-semibold">
                  v1.2
                </span>
              </div>
              <div className="text-[10px] text-ink-muted">
                Tidlös svensk fakturastudio
              </div>
            </div>
          </div>

          {/* Archive / Saved Invoices Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenDrawer}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-ink-border bg-paper hover:bg-paper-desk text-ink text-xs font-medium transition-colors"
            title="Öppna sparade fakturor"
          >
            <FolderOpen className="w-3.5 h-3.5 text-fakt-600" />
            <span className="hidden md:inline">Arkiv</span>
            <span className="text-[10px] bg-paper-dark text-ink-light px-1.5 py-0.2 rounded-full font-mono font-bold">
              {savedInvoicesCount}
            </span>
          </button>

          {/* Mobile view toggle */}
          <div className="flex sm:hidden bg-paper-dark p-0.5 rounded border border-ink-border text-xs">
            <button
              onClick={() => onToggleView('editor')}
              className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                activeView === 'editor' ? 'bg-paper-card text-ink font-semibold shadow-xs' : 'text-ink-muted'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Formulär</span>
            </button>
            <button
              onClick={() => onToggleView('preview')}
              className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                activeView === 'preview' ? 'bg-paper-card text-ink font-semibold shadow-xs' : 'text-ink-muted'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Dokument</span>
            </button>
          </div>
        </div>

        {/* Action Controls & Document Settings */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end text-xs">
          
          {/* Preset Selector */}
          <select
            onChange={(e) => {
              if (e.target.value) handleApplyPreset(e.target.value);
            }}
            defaultValue=""
            className="bg-paper-card border border-ink-border hover:border-ink-muted text-ink rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-fakt-500 cursor-pointer shadow-xs"
          >
            <option value="" disabled>Ladda bransch-mall...</option>
            <option value="consulting">IT- & Managementkonsult</option>
            <option value="rotCraft">Hantverkare (ROT Arbete/Material)</option>
            <option value="freelanceDesign">Formgivare / Kreatör</option>
            <option value="euReverseCharge">EU Utlandskund (Reverse Charge)</option>
          </select>

          {/* Template Style */}
          <select
            value={invoice.template}
            onChange={(e) => onChange({ ...invoice, template: e.target.value as InvoiceTemplate })}
            className="bg-paper-card border border-ink-border hover:border-ink-muted text-ink rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-fakt-500 cursor-pointer shadow-xs"
          >
            <option value="editorial-paper">Typografi: Editorial Paper</option>
            <option value="nordic-clean">Typografi: Nordic Clean</option>
            <option value="classic-bank">Typografi: Bankgiro Blankett</option>
          </select>

          {/* Currency */}
          <select
            value={invoice.currency}
            onChange={(e) => onChange({ ...invoice, currency: e.target.value as Currency })}
            className="bg-paper-card border border-ink-border hover:border-ink-muted text-ink rounded px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-fakt-500 cursor-pointer shadow-xs"
          >
            <option value="SEK">SEK (kr)</option>
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
          </select>

          {/* SIE4 Export Button */}
          <button
            type="button"
            onClick={handleDownloadSIE4}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-paper-card hover:bg-paper-desk border border-ink-border text-ink rounded transition-colors font-medium shadow-xs"
            title="Ladda ner SIE4-bokföringsverifikat för Fortnox, Bokio och Visma"
          >
            <FileCode2 className="w-3.5 h-3.5 text-fakt-600" />
            <span>SIE4</span>
            {!isPro && (
              <span className="text-[9px] bg-fakt-50 border border-fakt-200 text-fakt-700 px-1 rounded font-bold">
                PRO
              </span>
            )}
          </button>

          {/* Print / PDF Button with Tactile Stamp Action */}
          <button
            type="button"
            onClick={handlePrint}
            className="btn-stamp inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-fakt-600 hover:bg-fakt-700 text-white rounded font-medium shadow-stamp transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Skriv ut / PDF</span>
          </button>

          {/* Pro Pill / Activation */}
          {isPro ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pro</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenProModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-paper-card hover:bg-paper border border-amber-warm/40 text-ink font-semibold text-xs shadow-xs transition-all hover:border-amber-warm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-warm fill-amber-warm/30" />
              <span>Pro (99 kr)</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
