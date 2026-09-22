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
      <div className={`p-4 border border-dashed border-slate-300 rounded-lg text-center text-xs text-slate-500 ${className}`}>
        Ange Swish-nummer för att visa QR-kod
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm ${className}`}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-1">
        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
        <span className="text-red-600 font-bold">Swish</span>
        <span>Betalning</span>
      </div>

      <div className="relative w-36 h-36 flex items-center justify-center bg-slate-50 rounded-lg p-1.5 border border-slate-100">
        {loading ? (
          <div className="flex flex-col items-center text-slate-400 gap-1 text-xs">
            <QrCode className="w-8 h-8 animate-spin" />
            <span>Skapar QR...</span>
          </div>
        ) : dataUrl ? (
          <img
            src={dataUrl}
            alt={`Swish QR-kod till ${params.payee}`}
            className="w-full h-full object-contain rounded"
          />
        ) : (
          <span className="text-xs text-slate-400">Kunde inte skapa QR</span>
        )}
      </div>

      <div className="mt-1.5 text-center">
        <div className="text-[11px] font-mono font-medium text-slate-700 flex items-center justify-center gap-1">
          <Smartphone className="w-3 h-3 text-slate-400" />
          {params.payee}
        </div>
        <div className="text-[10px] text-slate-500">
          Skanna direkt i Swish-appen
        </div>
      </div>
    </div>
  );
};
