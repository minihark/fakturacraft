import React, { useEffect, useState } from 'react';
import { generateSwishQrDataUrl, SwishQrParams } from '../utils/swish';
import { QrCode, Smartphone } from 'lucide-react';

interface SwishQRCodeProps {
  params: SwishQrParams;
  className?: string;
}

export const SwishQRCode: React.FC<SwishQRCodeProps> = ({ params, className = '' }) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    generateSwishQrDataUrl(params).then((url) => {
      if (isMounted) {
        setDataUrl(url);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [params.payee, params.amount, params.message]);

  if (!params.payee) {
    return (
      <div className={`p-4 border border-dashed border-ink-border rounded text-center text-xs text-ink-muted ${className}`}>
        Ange Swish-nummer för att visa QR-kod
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center bg-paper-card p-3 rounded border border-ink-border shadow-xs ${className}`}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-ink mb-1.5">
        <span className="w-2 h-2 rounded-full bg-swish" />
        <span className="text-swish font-bold">Swish</span>
        <span>Betalning</span>
      </div>

      <div className="relative w-36 h-36 flex items-center justify-center bg-white rounded p-1 border border-ink-rule">
        {loading ? (
          <div className="flex flex-col items-center text-ink-muted gap-1 text-xs">
            <QrCode className="w-7 h-7 animate-spin text-taupe" />
            <span className="text-[11px]">Skapar QR...</span>
          </div>
        ) : dataUrl ? (
          <img
            src={dataUrl}
            alt={`Swish QR-kod till ${params.payee}`}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-xs text-ink-muted">Kunde inte skapa QR</span>
        )}
      </div>

      <div className="mt-1.5 text-center">
        <div className="text-[11px] font-mono font-medium text-ink flex items-center justify-center gap-1 tabular-nums">
          <Smartphone className="w-3 h-3 text-taupe" />
          {params.payee}
        </div>
        <div className="text-[10px] text-ink-muted">
          Skanna direkt i Swish-appen
        </div>
      </div>
    </div>
  );
};
