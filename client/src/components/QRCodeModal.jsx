import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Smartphone, QrCode } from 'lucide-react';

export default function QRCodeModal({ isOpen, onClose, roomId }) {
  const [qrSrc, setQrSrc] = useState('');
  const [copied, setCopied] = useState(false);

  // Construire l'URL partageable
  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?room=${roomId}`
    : `http://localhost:3000/?room=${roomId}`;

  useEffect(() => {
    if (isOpen && roomId) {
      QRCode.toDataURL(joinUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrSrc(url))
        .catch((err) => console.error('Erreur génération QR code:', err));
    }
  }, [isOpen, roomId, joinUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 text-white text-center relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 mx-auto mb-3 bg-indigo-600/30 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/30">
          <Smartphone className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold mb-1">Rejoindre sur Smartphone</h3>
        <p className="text-xs text-slate-400 mb-4">
          Scanne ce QR code avec l'appareil photo de ton téléphone (Android / iPhone)
        </p>

        {/* QR Code */}
        <div className="bg-white p-3 rounded-2xl inline-block shadow-inner mb-4">
          {qrSrc ? (
            <img src={qrSrc} alt="QR Code" className="w-56 h-56 rounded-lg mx-auto" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-600">
              Génération du QR Code...
            </div>
          )}
        </div>

        {/* Code de salon */}
        <div className="mb-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Code du salon
          </span>
          <div className="font-mono text-3xl font-extrabold tracking-widest text-amber-400 bg-slate-950/80 py-2 px-4 rounded-xl border border-slate-800 inline-block">
            {roomId}
          </div>
        </div>

        {/* Bouton Copier le lien */}
        <button
          onClick={handleCopy}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Lien copié dans le presse-papier !' : 'Copier le lien d\'invitation'}
        </button>
      </div>
    </div>
  );
}
