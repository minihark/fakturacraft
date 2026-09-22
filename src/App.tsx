import React, { useState, useEffect } from 'react';
import { Invoice } from './types';
import { SAMPLE_INVOICE } from './utils/defaultData';
import { Navbar } from './components/Navbar';
import { InvoiceEditor } from './components/InvoiceEditor';
import { InvoicePreview } from './components/InvoicePreview';
import { ProUpgradeModal } from './components/ProUpgradeModal';
import { RotateCcw, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [invoice, setInvoice] = useState<Invoice>(() => {
    const saved = localStorage.getItem('fakturacraft_invoice');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return SAMPLE_INVOICE;
      }
    }
    return SAMPLE_INVOICE;
  });

  const [isPro, setIsPro] = useState<boolean>(() => {
    return localStorage.getItem('fakturacraft_pro') === 'true';
  });

  const [isProModalOpen, setIsProModalOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'editor' | 'preview'>('editor');

  useEffect(() => {
    localStorage.setItem('fakturacraft_invoice', JSON.stringify(invoice));
  }, [invoice]);

  const handleReset = () => {
    if (window.confirm('Vill du återställa till standardmallen? Dina ändringar försvinner.')) {
      setInvoice(SAMPLE_INVOICE);
    }
  };

  const handleUpgradeSuccess = () => {
    setIsPro(true);
    setIsProModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar
        invoice={invoice}
        onChange={setInvoice}
        isPro={isPro}
        onOpenProModal={() => setIsProModalOpen(true)}
        activeView={activeView}
        onToggleView={setActiveView}
      />

      {/* Main Dual-Pane Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Invoice Editor */}
          <div className={`lg:col-span-6 space-y-4 ${activeView === 'preview' ? 'hidden lg:block' : 'block'}`}>
            <div className="flex items-center justify-between pb-2">
              <div>
                <h2 className="text-base font-bold text-slate-100">Faktureringsuppgifter</h2>
                <p className="text-xs text-slate-400">
                  Fyll i detaljerna nedan. Förhandsgranskningen uppdateras i realtid.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors p-1"
                title="Återställ formulär"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Återställ</span>
              </button>
            </div>

            <InvoiceEditor
              invoice={invoice}
              onChange={setInvoice}
              isPro={isPro}
              onOpenProModal={() => setIsProModalOpen(true)}
            />
          </div>

          {/* Right Column: Live Printable Invoice Preview */}
          <div className={`lg:col-span-6 ${activeView === 'editor' ? 'hidden lg:block' : 'block'}`}>
            <div className="sticky top-20 space-y-4">
              <div className="flex items-center justify-between pb-2 print:hidden">
                <div>
                  <h2 className="text-base font-bold text-slate-100">Förhandsgranskning (A4)</h2>
                  <p className="text-xs text-slate-400">
                    Exakt hur din faktura och Swish QR ser ut vid utskrift eller sparad PDF.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Preview
                  </span>
                </div>
              </div>

              {/* Printable Invoice Component */}
              <div className="overflow-x-auto pb-4">
                <InvoicePreview invoice={invoice} isPro={isPro} />
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Feature & Privacy Assurance Footer */}
      <footer className="bg-slate-900/50 border-t border-slate-800 py-6 px-4 mt-12 print:hidden text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              <strong>100% Klient-integritet:</strong> Inga kunduppgifter eller fakturabelopp skickas till externa servrar. Allt sparas lokalt.
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Swish QR enl. Getswish standard</span>
            <span>•</span>
            <span>SIE4-export för Bokio & Fortnox</span>
            <span>•</span>
            <span>Harkco Lab</span>
          </div>
        </div>
      </footer>

      {/* Pro Upgrade Modal */}
      <ProUpgradeModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        onUpgradeSuccess={handleUpgradeSuccess}
        isPro={isPro}
      />

    </div>
  );
};

export default App;
