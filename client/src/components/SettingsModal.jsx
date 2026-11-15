import React, { useState, useEffect } from 'react';
import { X, Key, Volume2, VolumeX, Sparkles, Check } from 'lucide-react';
import { sound } from '../utils/sound.js';

export default function SettingsModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [isMuted, setIsMuted] = useState(!sound.enabled);

  useEffect(() => {
    const stored = localStorage.getItem('GEMINI_API_KEY') || '';
    setApiKey(stored);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleToggleSound = () => {
    const newState = sound.toggle();
    setIsMuted(!newState);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-indigo-400">
          <Sparkles className="w-6 h-6 text-amber-400" />
          Réglages & Options
        </h3>

        <div className="space-y-5">
          {/* Audio */}
          <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700">
            <span className="font-medium flex items-center gap-2">
              {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
              Effets sonores
            </span>
            <button
              onClick={handleToggleSound}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                !isMuted ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {!isMuted ? 'Activé' : 'Désactivé'}
            </button>
          </div>

          {/* Clé Gemini API */}
          <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-3">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              <label className="font-semibold text-sm">Clé API Google Gemini (Optionnelle)</label>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pour que l'IA analyse visuellement tes dessins avec le modèle <span className="text-indigo-300 font-mono">Gemini 1.5 Flash</span> en direct. Sans clé, un simulateur intelligent autonome prend le relais.
            </p>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
            <div className="flex items-center justify-between pt-1">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-400 hover:underline"
              >
                Obtenir une clé gratuite (Google AI Studio) &rarr;
              </a>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
              >
                {saved ? <Check className="w-4 h-4 text-emerald-300" /> : null}
                {saved ? 'Enregistré !' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 font-medium rounded-xl text-sm transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
