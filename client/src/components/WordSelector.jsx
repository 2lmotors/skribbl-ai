import React from 'react';
import { Palette, Clock } from 'lucide-react';

export default function WordSelector({ choices, timeout = 15, onSelect }) {
  if (!choices || choices.length === 0) return null;

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
              key={idx}
              onClick={() => onSelect(word)}
              className="py-4 px-6 bg-slate-800 hover:bg-indigo-600 active:scale-98 border border-slate-700 hover:border-indigo-400 rounded-2xl text-lg font-bold capitalize transition duration-150 shadow-md hover:shadow-indigo-500/20 flex items-center justify-between group"
            >
              <span>{word}</span>
              <span className="text-xs text-slate-400 group-hover:text-white uppercase font-mono px-2 py-1 bg-slate-900/50 rounded-lg">
                {word.length} lettres
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-amber-400 font-medium">
          <Clock className="w-4 h-4 animate-spin" />
          <span>Choix automatique si tu n'en sélectionnes aucun</span>
        </div>
      </div>
    </div>
  );
}
