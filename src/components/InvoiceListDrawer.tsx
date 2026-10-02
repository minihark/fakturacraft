import React from 'react';
import { Invoice, InvoiceStatus } from '../types';
import { formatCurrency, formatDate, calculateInvoiceTotals } from '../utils/currency';
import { 
  X, 
  Plus, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  Send, 
  FileEdit,
  FolderOpen
} from 'lucide-react';

interface InvoiceListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  activeInvoiceId: string;
  onSelectInvoice: (id: string) => void;
  onCreateNew: () => void;
  onDuplicate: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: InvoiceStatus) => void;
}

export const InvoiceListDrawer: React.FC<InvoiceListDrawerProps> = ({
  isOpen,
  onClose,
  invoices,
  activeInvoiceId,
  onSelectInvoice,
  onCreateNew,
  onDuplicate,
  onDelete,
  onUpdateStatus,
}) => {
  if (!isOpen) return null;

  // Calculate quick summary metrics
  const totalSum = invoices.reduce((acc, inv) => {
    const totals = calculateInvoiceTotals(inv.items, !!inv.isReverseCharge);
    return acc + totals.total;
  }, 0);

  const getStatusBadge = (status: InvoiceStatus = 'draft') => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Betald
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-fakt-600 bg-fakt-50 px-2 py-0.5 rounded-full border border-fakt-200">
            <Send className="w-2.5 h-2.5" />
            Skickad
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted bg-paper-desk px-2 py-0.5 rounded-full border border-ink-border">
            <FileEdit className="w-2.5 h-2.5" />
            Utkast
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex print:hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity"
      />

      {/* Drawer Panel */}
      <aside 
        id="invoice-drawer"
        className="relative w-full max-w-md bg-paper-card border-r border-ink-border shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-left duration-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-ink-border flex items-center justify-between bg-paper">
          <div>
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-fakt-600" />
              <h3 className="font-serif text-lg font-semibold tracking-tight text-ink">
                Fakturaarkiv
              </h3>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              {invoices.length} {invoices.length === 1 ? 'sparad faktura' : 'sparade fakturor'} lokalt i webbläsaren
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-paper-desk text-ink-muted hover:text-ink transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick action bar */}
        <div className="p-4 bg-paper-desk/60 border-b border-ink-border flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onCreateNew();
              onClose();
            }}
            className="btn-stamp flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-fakt-600 hover:bg-fakt-700 text-white rounded text-xs font-semibold shadow-stamp"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Skapa ny faktura</span>
          </button>
          
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-taupe tracking-wider">Totalt belopp</div>
            <div className="font-mono text-xs font-bold text-ink tabular-nums">
              {formatCurrency(totalSum, 'SEK')}
            </div>
          </div>
        </div>

        {/* Invoice List */}
        <div className="flex-1 overflow-y-auto divide-y divide-ink-rule">
          {invoices.length === 0 ? (
            <div className="p-8 text-center text-xs text-ink-muted">
              Inga sparade fakturor ännu.
            </div>
          ) : (
            invoices.map((inv) => {
              const totals = calculateInvoiceTotals(inv.items, !!inv.isReverseCharge);
              const isActive = inv.id === activeInvoiceId;

              return (
                <div
                  key={inv.id}
                  className={`p-4 transition-colors ${
                    isActive 
                      ? 'bg-fakt-50/70 border-l-4 border-fakt-600' 
                      : 'hover:bg-paper-desk/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div 
                      onClick={() => {
                        onSelectInvoice(inv.id);
                        onClose();
                      }}
                      className="cursor-pointer flex-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-ink tracking-tight">
                          #{inv.invoiceNumber || '---'}
                        </span>
                        {getStatusBadge(inv.status)}
                      </div>
                      
                      <div className="font-medium text-xs text-ink mt-1 truncate">
                        {inv.recipient.name || 'Namnlös mottagare'}
                      </div>
                      
                      <div className="flex items-center gap-3 text-[11px] text-ink-muted mt-1 font-mono">
                        <span>{formatDate(inv.issueDate)}</span>
                        <span>•</span>
                        <span className="font-bold text-ink tabular-nums">
                          {formatCurrency(totals.total, inv.currency, inv.language)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {/* Status Selector */}
                      <select
                        value={inv.status || 'draft'}
                        onChange={(e) => onUpdateStatus(inv.id, e.target.value as InvoiceStatus)}
                        className="text-[10px] bg-paper border border-ink-border rounded px-1.5 py-0.5 text-ink-light focus:outline-none focus:border-fakt-500 cursor-pointer"
                        title="Ändra status"
                      >
                        <option value="draft">Utkast</option>
                        <option value="sent">Skickad</option>
                        <option value="paid">Betald</option>
                      </select>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onDuplicate(inv)}
                          className="p-1 rounded text-ink-muted hover:text-ink hover:bg-paper-desk transition-colors"
                          title="Duplicera denna faktura"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        
                        {invoices.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Vill du ta bort faktura #${inv.invoiceNumber}?`)) {
                                onDelete(inv.id);
                              }
                            }}
                            className="p-1 rounded text-ink-muted hover:text-stamp hover:bg-stamp-faint transition-colors"
                            title="Ta bort faktura"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-ink-border bg-paper text-[10px] text-ink-faint text-center">
          Fakt · Alla ändringar sparas automatiskt i din webbläsare
        </div>
      </aside>
    </div>
  );
};
