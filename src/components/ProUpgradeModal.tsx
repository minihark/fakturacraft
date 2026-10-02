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
      localStorage.setItem('fakt_pro', 'true');
      localStorage.setItem('fakt_pro_key', 'HARKCO-SWISH-PRO-LIFETIME');
      onUpgradeSuccess();
    }, 1000);
  };

  const handleApplyKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = licenseKey.trim().toUpperCase();
    if (!cleanKey) return;

    if (cleanKey.includes('PRO') || cleanKey.startsWith('HARKCO') || cleanKey.includes('FAKT') || cleanKey.length >= 8) {
      setLicenseError('');
      triggerConfetti();
      localStorage.setItem('fakt_pro', 'true');
      localStorage.setItem('fakt_pro_key', cleanKey);
      onUpgradeSuccess();
    } else {
      setLicenseError('Ogiltig licensnyckel. Testa t.ex. "FAKT-PRO-2026" eller "HARKCO-PRO"');
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#2C4A6E', '#C53B27', '#8C7E6B', '#1A1A1A'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-paper-card border border-ink-border rounded-lg shadow-2xl overflow-hidden text-ink">
        
        {/* Header decoration banner */}
        <div className="bg-fakt-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md mb-2">
            <Sparkles className="w-3 h-3 text-amber-200" />
            <span>Engångsköp • Livstidslicens</span>
          </div>

          <h2 className="font-serif text-2xl font-bold tracking-tight">Fakt Pro</h2>
          <p className="text-fakt-100 text-xs mt-1 max-w-md leading-relaxed">
            Byggd för svenska konsulter, frilansare och kreatörer som vill slippa abonnemang och onödigt krångliga affärssystem.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Pricing Highlight */}
          <div className="flex items-baseline justify-between p-4 rounded bg-paper border border-fakt-200">
            <div>
              <div className="text-[10px] font-bold text-taupe uppercase tracking-wider">Engångspris</div>
              <div className="text-2xl font-serif font-bold text-ink">
                99 kr <span className="text-xs font-normal font-sans text-ink-muted">inkl. moms</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-ink-faint line-through">199 kr</div>
              <div className="text-xs font-semibold text-fakt-700">0 kr/månad för alltid</div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded bg-paper-desk/50 border border-ink-rule">
              <ShieldCheck className="w-4 h-4 text-fakt-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-ink">100% Vattenstämpelfritt</div>
                <div className="text-[11px] text-ink-muted">Ren PDF utan 'Skapad med'-märkning.</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded bg-paper-desk/50 border border-ink-rule">
              <FileSpreadsheet className="w-4 h-4 text-fakt-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-ink">Obegränsad SIE4-export</div>
                <div className="text-[11px] text-ink-muted">Direkt import till Bokio, Fortnox & Visma.</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded bg-paper-desk/50 border border-ink-rule">
              <Image className="w-4 h-4 text-fakt-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-ink">Egen Företagslogotyp</div>
                <div className="text-[11px] text-ink-muted">Placera ditt varumärke högst upp på fakturan.</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded bg-paper-desk/50 border border-ink-rule">
              <Lock className="w-4 h-4 text-fakt-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-ink">100% Privat & Lokalt</div>
                <div className="text-[11px] text-ink-muted">All information lagras uteslutande i din webbläsare.</div>
              </div>
            </div>
          </div>

          {/* Payment Selection */}
          {!isPro ? (
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('swish')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded border font-medium text-xs transition-all ${
                    selectedMethod === 'swish'
                      ? 'bg-swish/5 border-swish text-swish font-bold'
                      : 'bg-paper border-ink-border text-ink-muted hover:text-ink'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-swish" />
                  <span>Swish (99 kr)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded border font-medium text-xs transition-all ${
                    selectedMethod === 'card'
                      ? 'bg-fakt-50 border-fakt-500 text-fakt-700 font-bold'
                      : 'bg-paper border-ink-border text-ink-muted hover:text-ink'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-fakt-600" />
                  <span>Kort / Apple Pay</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSimulatedPayment}
                disabled={isProcessing}
                className="btn-stamp w-full py-3 px-4 rounded bg-fakt-600 hover:bg-fakt-700 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-stamp transition-all disabled:opacity-60"
              >
                {isProcessing ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Aktiverar din licens...</span>
                  </span>
                ) : (
                  <>
                    <span>Aktivera Pro Direkt (99 kr engångsköp)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* License key input */}
              <div className="pt-2 border-t border-ink-rule">
                <form onSubmit={handleApplyKey} className="flex gap-2">
                  <input
                    type="text"
                    value={licenseKey}
                    onChange={(e) => {
                      setLicenseKey(e.target.value);
                      setLicenseError('');
                    }}
                    placeholder="Har du en licensnyckel? (t.ex. FAKT-PRO-2026)"
                    className="flex-1 bg-paper border border-ink-border rounded px-3 py-1.5 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:border-fakt-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-paper hover:bg-paper-desk border border-ink-border text-xs font-medium text-ink rounded transition-colors"
                  >
                    Aktivera
                  </button>
                </form>
                {licenseError && (
                  <p className="text-stamp text-[11px] mt-1.5">{licenseError}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <div className="inline-flex p-2 rounded-full bg-emerald-100 text-emerald-700">
                <Check className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-emerald-900 text-sm">Du har Fakt Pro aktiverat!</h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Alla funktioner är upplåsta. Inga vattenstämplar, obegränsad SIE4-export och full företagsanpassning.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
