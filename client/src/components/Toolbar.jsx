import React from 'react';
import { 
  Paintbrush, 
  Eraser, 
  PaintBucket, 
  RotateCcw, 
  Trash2,
  Check
} from 'lucide-react';
import { sound } from '../utils/sound.js';

const PALETTE = [
  '#000000', '#ffffff', '#64748b', '#ef4444', 
  '#f97316', '#eab308', '#22c55e', '#06b6d4', 
  '#3b82f6', '#8b5cf6', '#ec4899', '#78350f'
];

const SIZES = [
  { label: 'Fin', value: 4 },
  { label: 'Moyen', value: 9 },
  { label: 'Épais', value: 18 },
  { label: 'Gros', value: 32 },
];

export default function Toolbar({
  activeTool,
  setActiveTool,
  activeColor,
  setActiveColor,
  brushSize,
  setBrushSize,
  onUndo,
  onClear,
  isDrawer,
}) {
  if (!isDrawer) {
    return (
      <div className="py-2.5 px-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-center text-xs text-slate-400 gap-2 shadow-inner">
        <span>👁️ Mode spectateur & devineur — Ouvre l'œil et tape ta réponse dans le chat !</span>
      </div>
    );
  }

  const handleToolSelect = (tool) => {
    setActiveTool(tool);
    sound.playPop();
  };

  const handleColorSelect = (color) => {
    setActiveColor(color);
    if (activeTool === 'eraser') {
      setActiveTool('brush');
    }
    sound.playPop();
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur border border-slate-700/80 rounded-2xl p-2.5 shadow-xl flex flex-wrap items-center justify-between gap-3 select-none">
      {/* Outils principaux */}
      <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
        <button
          title="Pinceau"
          onClick={() => handleToolSelect('brush')}
          className={`p-2 rounded-lg transition ${
            activeTool === 'brush'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Paintbrush className="w-5 h-5" />
        </button>

        <button
          title="Gomme"
          onClick={() => handleToolSelect('eraser')}
          className={`p-2 rounded-lg transition ${
            activeTool === 'eraser'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Eraser className="w-5 h-5" />
        </button>

        <button
          title="Pot de peinture"
          onClick={() => handleToolSelect('bucket')}
          className={`p-2 rounded-lg transition ${
            activeTool === 'bucket'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <PaintBucket className="w-5 h-5" />
        </button>
      </div>

      {/* Palette de couleurs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => handleColorSelect(c)}
            style={{ backgroundColor: c }}
            className={`w-7 h-7 rounded-full border-2 transition-transform active:scale-90 flex items-center justify-center ${
              activeColor.toLowerCase() === c.toLowerCase() && activeTool !== 'eraser'
                ? 'scale-110 border-white shadow-md ring-2 ring-indigo-500'
                : 'border-slate-700 hover:scale-105'
            }`}
          >
            {activeColor.toLowerCase() === c.toLowerCase() && activeTool !== 'eraser' ? (
              <Check className={`w-3.5 h-3.5 ${c === '#ffffff' || c === '#eab308' ? 'text-black' : 'text-white'}`} />
            ) : null}
          </button>
        ))}

        {/* Sélecteur de couleur personnalisé */}
        <label
          title="Couleur personnalisée"
          className="w-7 h-7 rounded-full border-2 border-dashed border-slate-500 hover:border-white cursor-pointer flex items-center justify-center bg-gradient-to-tr from-pink-500 via-amber-400 to-indigo-500 overflow-hidden"
        >
          <input
            type="color"
            value={activeColor}
            onChange={(e) => handleColorSelect(e.target.value)}
            className="opacity-0 w-0 h-0 cursor-pointer"
          />
        </label>
      </div>

      {/* Épaisseur de trait */}
      <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
        {SIZES.map((s) => (
          <button
            key={s.value}
            onClick={() => {
              setBrushSize(s.value);
              sound.playPop();
            }}
            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              brushSize === s.value ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span
              className="rounded-full bg-current inline-block"
              style={{ width: Math.max(4, s.value / 2.5), height: Math.max(4, s.value / 2.5) }}
            />
            {s.label}
          </button>
        ))}
      </div>

      {/* Actions (Annuler & Effacer tout) */}
      <div className="flex items-center gap-1.5">
        <button
          title="Annuler le dernier trait"
          onClick={() => {
            onUndo();
            sound.playPop();
          }}
          className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition border border-slate-700"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          title="Tout effacer"
          onClick={() => {
            onClear();
            sound.playPop();
          }}
          className="p-2 text-rose-400 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 rounded-xl transition border border-rose-900/40"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
