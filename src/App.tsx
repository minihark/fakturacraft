import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceStatus } from './types';
import { SAMPLE_INVOICE } from './utils/defaultData';
import { generateSwedishOcr } from './utils/luhn';
import { addDays } from './utils/currency';
import { Navbar } from './components/Navbar';
import { InvoiceEditor } from './components/InvoiceEditor';
import { InvoicePreview } from './components/InvoicePreview';
import { InvoiceListDrawer } from './components/InvoiceListDrawer';
import { ProUpgradeModal } from './components/ProUpgradeModal';
import { RotateCcw, ShieldCheck, Plus } from 'lucide-react';

export const App: React.FC = () => {
  // Load saved invoices or seed from previous/default data
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('fakt_invoices');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved invoices:', e);
      }
    }

    // Check legacy single-invoice key from FakturaCraft
    const legacy = localStorage.getItem('fakturacraft_invoice');
    if (legacy) {
      try {
        const parsedLegacy = JSON.parse(legacy);
        return [{ ...SAMPLE_INVOICE, ...parsedLegacy, id: 'inv-' + Date.now() }];
      } catch (e) {}
    }

    return [SAMPLE_INVOICE];
  });

  const [activeInvoiceId, setActiveInvoiceId] = useState<string>(() => {
    const savedId = localStorage.getItem('fakt_active_id');
    if (savedId) return savedId;
    return invoices[0]?.id || SAMPLE_INVOICE.id;
  });

  const [isPro, setIsPro] = useState<boolean>(() => {
    return localStorage.getItem('fakt_pro') === 'true' || localStorage.getItem('fakturacraft_pro') === 'true';
  });

  const [isProModalOpen, setIsProModalOpen] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'editor' | 'preview'>('editor');

  // Derive active invoice safely
  const activeInvoice: Invoice = 
    invoices.find((inv) => inv.id === activeInvoiceId) || invoices[0] || SAMPLE_INVOICE;

  // Persist invoices & active selection
  useEffect(() => {
    localStorage.setItem('fakt_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('fakt_active_id', activeInvoiceId);
  }, [activeInvoiceId]);

  // Handlers for invoices
  const handleUpdateActiveInvoice = (updated: Invoice) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : inv))
    );
  };

  const handleCreateNewInvoice = () => {
    // Generate next invoice number
    const maxNum = invoices.reduce((max, inv) => {
      const parsed = parseInt(inv.invoiceNumber.replace(/\D/g, ''), 10);
      return !isNaN(parsed) && parsed > max ? parsed : max;
    }, 1000);

    const nextNumber = String(maxNum + 1);
    const today = new Date().toISOString().slice(0, 10);

    const newInvoice: Invoice = {
      ...SAMPLE_INVOICE,
      id: 'inv-' + Date.now(),
      invoiceNumber: nextNumber,
      ocr: generateSwedishOcr(nextNumber),
      status: 'draft',
      issueDate: today,
      dueDate: addDays(today, 30),
      // Keep sender profile from current invoice
      sender: { ...activeInvoice.sender },
      recipient: {
        name: '',
        orgNr: '',
        contactPerson: '',
        address: '',
        zipCity: '',
        country: 'Sverige',
        email: '',
      },
      items: [
        {
          id: 'item-' + Date.now(),
          description: 'Konsultuppdrag / Tjänst',
          quantity: 1,
          unit: 'tim',
          unitPrice: 1200,
          vatRate: 25,
          itemType: 'labor',
          rotRut: 'none',
        },
      ],
      notes: 'Betalningsvillkor 30 dagar netto. Vänligen ange fakturanummer eller OCR vid betalning.',
      swishMessage: `Faktura ${nextNumber}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    setActiveInvoiceId(newInvoice.id);
  };

  const handleDuplicateInvoice = (invoiceToDuplicate: Invoice) => {
    const maxNum = invoices.reduce((max, inv) => {
      const parsed = parseInt(inv.invoiceNumber.replace(/\D/g, ''), 10);
      return !isNaN(parsed) && parsed > max ? parsed : max;
    }, 1000);

    const nextNumber = String(maxNum + 1);
    const today = new Date().toISOString().slice(0, 10);

    const duplicated: Invoice = {
      ...invoiceToDuplicate,
      id: 'inv-' + Date.now(),
      invoiceNumber: nextNumber,
      ocr: generateSwedishOcr(nextNumber),
      status: 'draft',
      issueDate: today,
      dueDate: addDays(today, invoiceToDuplicate.paymentTermsDays || 30),
      swishMessage: `Faktura ${nextNumber}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInvoices((prev) => [duplicated, ...prev]);
    setActiveInvoiceId(duplicated.id);
  };

  const handleDeleteInvoice = (id: string) => {
    if (invoices.length <= 1) {
      alert('Du kan inte ta bort den sista fakturan.');
      return;
    }
    const nextList = invoices.filter((inv) => inv.id !== id);
    setInvoices(nextList);
    if (activeInvoiceId === id) {
      setActiveInvoiceId(nextList[0].id);
    }
  };

  const handleUpdateStatus = (id: string, status: InvoiceStatus) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status, updatedAt: new Date().toISOString() } : inv))
    );
  };

  const handleResetActive = () => {
    if (window.confirm('Vill du återställa denna faktura till standardmallen? Dina ändringar försvinner.')) {
      handleUpdateActiveInvoice({
        ...SAMPLE_INVOICE,
        id: activeInvoice.id,
        invoiceNumber: activeInvoice.invoiceNumber,
        ocr: activeInvoice.ocr,
      });
    }
  };

  const handleUpgradeSuccess = () => {
    setIsPro(true);
    setIsProModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EFECE6] text-ink font-sans selection:bg-fakt-600 selection:text-white overflow-x-hidden">
      
      {/* 2px Subtle Top Naval Accent Line */}
      <div className="h-0.5 w-full bg-fakt-600 print:hidden" />

      {/* Navigation Desk Header */}
      <Navbar
        invoice={activeInvoice}
        onChange={handleUpdateActiveInvoice}
        isPro={isPro}
        onOpenProModal={() => setIsProModalOpen(true)}
        activeView={activeView}
        onToggleView={setActiveView}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        savedInvoicesCount={invoices.length}
      />

      {/* Main Dual-Pane Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start min-w-0">
          
          {/* Left Column: Interactive Invoice Editor */}
          <div className={`lg:col-span-6 min-w-0 w-full space-y-4 ${activeView === 'preview' ? 'hidden lg:block' : 'block'}`}>
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="font-serif text-lg font-bold text-ink tracking-tight">
                  Faktureringsuppgifter
                </h2>
                <p className="text-xs text-ink-muted">
                  Redigera fälten nedan. Dokumentet till höger uppdateras i realtid.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCreateNewInvoice}
                  className="inline-flex items-center gap-1 text-xs text-fakt-700 hover:text-fakt-800 font-medium px-2 py-1 rounded hover:bg-paper-dark/60 transition-colors"
                  title="Skapa ny tom faktura"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ny</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetActive}
                  className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink transition-colors p-1"
                  title="Återställ denna faktura"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Återställ</span>
                </button>
              </div>
            </div>

            <InvoiceEditor
              invoice={activeInvoice}
              onChange={handleUpdateActiveInvoice}
              isPro={isPro}
              onOpenProModal={() => setIsProModalOpen(true)}
            />
          </div>

          {/* Right Column: Live Printable Document Preview (The Desk) */}
          <div className={`lg:col-span-6 min-w-0 w-full ${activeView === 'editor' ? 'hidden lg:block' : 'block'}`}>
            <div className="sticky top-20 space-y-3">
              <div className="flex items-center justify-between pb-1 print:hidden">
                <div>
                  <h2 className="font-serif text-lg font-bold text-ink tracking-tight">
                    Faktura & Dokument (A4)
                  </h2>
                  <p className="text-xs text-ink-muted">
                    Exakt hur din faktura och Swish QR ser ut vid utskrift eller PDF-export.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] text-fakt-700 font-mono bg-fakt-50 px-2 py-0.5 rounded border border-fakt-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-fakt-600 animate-pulse" />
                    Live A4
                  </span>
                </div>
              </div>

              {/* Printable Invoice Component */}
              <div className="w-full max-w-full pb-4">
                <InvoicePreview invoice={activeInvoice} isPro={isPro} />
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Feature & Privacy Assurance Footer */}
      <footer className="bg-paper-desk border-t border-ink-border/80 py-6 px-4 mt-12 print:hidden text-xs text-ink-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-fakt-600 shrink-0" />
            <span>
              <strong>100% Klient-integritet:</strong> Inga kunduppgifter eller intäkter skickas till externa servrar. All information sparas lokalt.
            </span>
          </div>

          <div className="flex items-center gap-4 text-ink-faint text-[11px] font-mono">
            <span>Getswish QR</span>
            <span>•</span>
            <span>BAS 2026 SIE4</span>
            <span>•</span>
            <span>ROT/RUT</span>
            <span>•</span>
            <span>Harkco Studio</span>
          </div>
        </div>
      </footer>

      {/* Archive Drawer */}
      <InvoiceListDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        invoices={invoices}
        activeInvoiceId={activeInvoice.id}
        onSelectInvoice={setActiveInvoiceId}
        onCreateNew={handleCreateNewInvoice}
        onDuplicate={handleDuplicateInvoice}
        onDelete={handleDeleteInvoice}
        onUpdateStatus={handleUpdateStatus}
      />

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
