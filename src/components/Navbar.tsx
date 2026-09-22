import React from 'react';
import { Invoice, InvoiceTemplate, Currency } from '../types';
import { PRESETS } from '../utils/defaultData';
import { downloadSIE4File } from '../utils/sie4';
import { 
  FileText, 
  Printer, 
  Sparkles, 
  Check, 
  FileCode2,
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
}

export const Navbar: React.FC<NavbarProps> = ({
  invoice,
  onChange,
  isPro,
  onOpenProModal,
  activeView,
  onToggleView,
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
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 print:hidden">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/40">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm text-slate-100 tracking-tight">
                <span>FakturaCraft</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-semibold">
                  1.0
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                Svensk fakturastudio med Swish QR
              </div>
            </div>
          </div>

          {/* Mobile view toggle */}
          <div className="flex sm:hidden bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => onToggleView('editor')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${
                activeView === 'editor' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Redigera</span>
            </button>
            <button
              onClick={() => onToggleView('preview')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${
                activeView === 'preview' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Faktura</span>
            </button>
          </div>
        </div>

        {/* Action Controls & Menus */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end text-xs">
          
          {/* Preset Selector */}
          <select
            onChange={(e) => {
              if (e.target.value) handleApplyPreset(e.target.value);
            }}
            defaultValue=""
            className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="" disabled>Ladda exempel-mall...</option>
            <option value="consulting">Konsult / IT-utveckling</option>
            <option value="rotCraft">Hantverkare (ROT 30%)</option>
            <option value="freelanceDesign">Designer / Kreatör</option>
          </select>

          {/* Template Style */}
          <select
            value={invoice.template}
            onChange={(e) => onChange({ ...invoice, template: e.target.value as InvoiceTemplate })}
            className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="nordic-clean">Mall: Nordic Clean</option>
            <option value="classic-bank">Mall: Bankgiro Classic</option>
            <option value="modern-studio">Mall: Modern Studio</option>
          </select>

          {/* Currency */}
          <select
            value={invoice.currency}
            onChange={(e) => onChange({ ...invoice, currency: e.target.value as Currency })}
            className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-emerald-500"
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 rounded-lg transition-colors font-medium"
            title="Ladda ner SIE4-bokföringsverifikat för Fortnox, Bokio och Visma"
          >
            <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>SIE4 Bokföring</span>
            {!isPro && (
              <span className="text-[9px] bg-emerald-950 border border-emerald-500/40 text-emerald-400 px-1 rounded font-bold">
                PRO
              </span>
            )}
          </button>

          {/* Print / PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-semibold shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Skriv ut / PDF</span>
          </button>

          {/* Pro Pill */}
          {isPro ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-semibold text-xs">
              <Check className="w-3.5 h-3.5" />
              <span>Pro Aktiv</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenProModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold shadow-md transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Uppgradera Pro (99 kr)</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
