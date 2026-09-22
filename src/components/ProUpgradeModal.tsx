import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Check, Sparkles, X, ShieldCheck, FileSpreadsheet, Image, Lock, Smartphone, CreditCard, ArrowRight } from 'lucide-react';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: () => void;
  isPro: boolean;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgradeSuccess,
  isPro,
}) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [licenseError, setLicenseError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'swish' | 'card'>('swish');

  if (!isOpen) return null;

  const handleSimulatedPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      triggerConfetti();
      localStorage.setItem('fakturacraft_pro', 'true');
      localStorage.setItem('fakturacraft_pro_key', 'HARKCO-SWISH-PRO-LIFETIME');
      onUpgradeSuccess();
    }, 1200);
  };

  const handleApplyKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = licenseKey.trim().toUpperCase();
    if (!cleanKey) return;

    if (cleanKey.includes('PRO') || cleanKey.startsWith('HARKCO') || cleanKey.length >= 8) {
      setLicenseError('');
      triggerConfetti();
      localStorage.setItem('fakturacraft_pro', 'true');
      localStorage.setItem('fakturacraft_pro_key', cleanKey);
      onUpgradeSuccess();
    } else {
      setLicenseError('Ogiltig licensnyckel. Testa t.ex. "HARKCO-PRO-2026"');
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#16a34a', '#3b82f6', '#f59e0b'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header decoration banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider backdrop-blur-md mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Engångsköp • Livstidslicens</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight">FakturaCraft Pro</h2>
          <p className="text-emerald-100 text-sm mt-1 max-w-md">
            Skapad för svenska enskilda firmor och frilansare som vill slippa prenumerationer och dyra affärssystem.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Pricing Highlight */}
          <div className="flex items-baseline justify-between p-4 rounded-xl bg-slate-800/60 border border-emerald-500/30">
            <div>
              <div className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Engångsavgift</div>
              <div className="text-3xl font-bold text-white">99 kr <span className="text-sm font-normal text-slate-400">inkl. moms</span></div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 line-through">199 kr</div>
              <div className="text-xs font-semibold text-emerald-400">0 kr/månad efter köp</div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-800/40 border border-slate-800">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-slate-200">100% Vattenstämpelfritt</div>
                <div className="text-xs text-slate-400">Ingen "Skapad med"-text på dina fakturor.</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-800/40 border border-slate-800">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-slate-200">Obegränsad SIE4-export</div>
                <div className="text-xs text-slate-400">Direkt import till Bokio, Fortnox & Visma.</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-800/40 border border-slate-800">
              <Image className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-slate-200">Egen Företagslogotyp</div>
                <div className="text-xs text-slate-400">Ladda upp och placera din egen profil på PDF:en.</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-800/40 border border-slate-800">
              <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-slate-200">100% Privat & Lokalt</div>
                <div className="text-xs text-slate-400">Dina kunduppgifter lagras i din egen webbläsare.</div>
              </div>
            </div>
          </div>

          {/* Payment Selection */}
          {!isPro ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('swish')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-medium text-sm transition-all ${
                    selectedMethod === 'swish'
                      ? 'bg-red-950/40 border-red-500/80 text-red-300 ring-1 ring-red-500/50'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-red-500" />
                  <span>Swish (99 kr)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-medium text-sm transition-all ${
                    selectedMethod === 'card'
                      ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-300 ring-1 ring-emerald-500/50'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  <span>Kort / Apple Pay</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSimulatedPayment}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all active:scale-[0.99] disabled:opacity-60"
              >
                {isProcessing ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Initierar säker betalning...</span>
                  </span>
                ) : (
                  <>
                    <span>Aktivera Pro Direkt (99 kr)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* License key input */}
              <div className="pt-2 border-t border-slate-800">
                <form onSubmit={handleApplyKey} className="flex gap-2">
                  <input
                    type="text"
                    value={licenseKey}
                    onChange={(e) => {
                      setLicenseKey(e.target.value);
                      setLicenseError('');
                    }}
                    placeholder="Har du en licensnyckel? (t.ex. HARKCO-PRO-2026)"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-lg transition-colors"
                  >
                    Aktivera
                  </button>
                </form>
                {licenseError && (
                  <p className="text-red-400 text-xs mt-1.5">{licenseError}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-center space-y-2">
              <div className="inline-flex p-2 rounded-full bg-emerald-500/20 text-emerald-400">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-emerald-300">Du har FakturaCraft Pro aktiverat!</h3>
              <p className="text-xs text-emerald-200/80">
                Alla funktioner är upplåsta. Inga vattenstämplar, obegränsad SIE4-export och full företagsanpassning.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
