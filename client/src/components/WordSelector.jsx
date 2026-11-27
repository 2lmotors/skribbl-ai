import React, { useState, useEffect } from 'react';
import { Palette, Clock } from 'lucide-react';

export default function WordSelector({ choices, timeout = 20, timeRemaining, onSelect }) {
  const [selectedWord, setSelectedWord] = useState(null);

  useEffect(() => {
    setSelectedWord(null);
  }, [choices]);

  if (!choices || choices.length === 0) return null;

  const displaySeconds = typeof timeRemaining === 'number' ? timeRemaining : timeout;

  const handlePick = (word) => {
    if (selectedWord) return; // Empêcher les double-clics
    setSelectedWord(word);
    onSelect(word);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border-2 border-indigo-500 rounded-3xl p-6 text-white text-center shadow-2xl">
        <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Palette className="w-8 h-8 text-white" />
        </div>

        <h3 className="text-2xl font-black mb-1">C'est ton tour de dessiner !</h3>
        <p className="text-sm text-slate-300 mb-6">Choisis un mot parmi les 3 propositions :</p>

        <div className="grid gap-3 mb-6">
          {choices.map((word, idx) => (
            <button
              key={word || idx}
              type="button"
              disabled={Boolean(selectedWord)}
              onClick={() => handlePick(word)}
              className={`py-4 px-6 border rounded-2xl text-lg font-bold capitalize transition duration-150 shadow-md flex items-center justify-between group ${
                selectedWord === word
                  ? 'bg-indigo-600 border-indigo-400 scale-98'
                  : 'bg-slate-800 hover:bg-indigo-600 active:scale-98 border-slate-700 hover:border-indigo-400 hover:shadow-indigo-500/20 disabled:opacity-50'
              }`}
            >
              <span className="flex items-center gap-1">
                {word.split('-').map((part, i, arr) => (
                  <React.Fragment key={i}>
                    <span>{part}</span>
                    {i < arr.length - 1 && (
                      <span className="text-rose-500 font-black text-xl px-0.5 animate-pulse drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]">
                        -
                      </span>
                    )}
                  </React.Fragment>
                ))}
                {word.includes('-') && (
                  <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/50">
                    avec tiret -
                  </span>
                )}
              </span>
              <span className="text-xs text-slate-400 group-hover:text-white uppercase font-mono px-2 py-1 bg-slate-900/50 rounded-lg">
                {word.length} lettres
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-amber-400 font-medium">
          <Clock className="w-4 h-4 animate-spin" />
          <span>Choix automatique dans {displaySeconds}s si tu n'en sélectionnes aucun</span>
        </div>
      </div>
    </div>
  );
}
