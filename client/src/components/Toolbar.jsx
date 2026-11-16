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
  { label: 'Moy', value: 9 },
  { label: 'Ép.', value: 18 },
  { label: 'Gros', value: 30 },
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
      <div className="py-1.5 px-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-center text-[11px] text-slate-400 gap-2 shadow-inner">
        <span>👁️ Mode devineur — Ouvre l'œil et tape ta réponse dans le chat !</span>
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
    <div className="bg-slate-900/95 backdrop-blur border border-slate-700/80 rounded-xl p-1.5 sm:p-2 shadow-lg flex items-center justify-between gap-1.5 sm:gap-3 select-none overflow-x-auto">
      {/* Outils principaux */}
      <div className="flex items-center gap-1 bg-slate-950/60 p-0.5 sm:p-1 rounded-lg border border-slate-800 shrink-0">
        <button
          title="Pinceau"
          onClick={() => handleToolSelect('brush')}
          className={`p-1.5 sm:p-2 rounded-lg transition ${
            activeTool === 'brush'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Paintbrush className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          title="Gomme"
          onClick={() => handleToolSelect('eraser')}
          className={`p-1.5 sm:p-2 rounded-lg transition ${
            activeTool === 'eraser'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Eraser className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          title="Pot de peinture"
          onClick={() => handleToolSelect('bucket')}
          className={`p-1.5 sm:p-2 rounded-lg transition ${
            activeTool === 'bucket'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <PaintBucket className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Palette de couleurs */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => handleColorSelect(c)}
            style={{ backgroundColor: c }}
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border transition-transform active:scale-90 flex items-center justify-center shrink-0 ${
              activeColor.toLowerCase() === c.toLowerCase() && activeTool !== 'eraser'
                ? 'scale-110 border-white ring-2 ring-indigo-500 shadow-sm'
                : 'border-slate-700 hover:scale-105'
            }`}
          >
            {activeColor.toLowerCase() === c.toLowerCase() && activeTool !== 'eraser' ? (
              <Check className={`w-3 h-3 ${c === '#ffffff' || c === '#eab308' ? 'text-black' : 'text-white'}`} />
            ) : null}
          </button>
        ))}

        {/* Sélecteur libre */}
        <label
          title="Couleur personnalisée"
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-dashed border-slate-500 hover:border-white cursor-pointer flex items-center justify-center bg-gradient-to-tr from-pink-500 via-amber-400 to-indigo-500 overflow-hidden shrink-0"
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
      <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-950/60 p-0.5 sm:p-1 rounded-lg border border-slate-800 shrink-0">
        {SIZES.map((s) => (
          <button
            key={s.value}
            onClick={() => {
              setBrushSize(s.value);
              sound.playPop();
            }}
            className={`px-1.5 py-1 rounded-md text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition ${
              brushSize === s.value ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span
              className="rounded-full bg-current inline-block"
              style={{ width: Math.max(3, s.value / 3.5), height: Math.max(3, s.value / 3.5) }}
            />
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Actions (Annuler & Effacer tout) */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          title="Annuler le dernier trait"
          onClick={() => {
            onUndo();
            sound.playPop();
          }}
          className="p-1.5 sm:p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition border border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <button
          title="Tout effacer"
          onClick={() => {
            onClear();
            sound.playPop();
          }}
          className="p-1.5 sm:p-2 text-rose-400 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 rounded-lg transition border border-rose-900/40"
        >
          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}
