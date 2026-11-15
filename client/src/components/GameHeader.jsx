import React from 'react';
import { Clock, QrCode, Settings, LogOut, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound.js';

export default function GameHeader({
  roomId,
  currentRound,
  maxRounds,
  timeRemaining,
  hintMask,
  secretWord,
  isDrawer,
  state,
  onOpenQR,
  onOpenSettings,
  onLeaveRoom,
}) {
  // Déterminer la couleur et l'animation du timer
  const isUrgent = timeRemaining <= 10 && timeRemaining > 0;
  const isCritical = timeRemaining <= 5 && timeRemaining > 0;
  const timerColor = isCritical
    ? 'text-white bg-rose-600 border-rose-400 animate-bounce ring-4 ring-rose-500/50 shadow-lg shadow-rose-600/50'
    : isUrgent
    ? 'text-rose-400 bg-rose-950/80 border-rose-500 animate-pulse-fast ring-2 ring-rose-500/30'
    : timeRemaining <= 25
    ? 'text-amber-400 bg-amber-950/40 border-amber-500/40'
    : 'text-indigo-300 bg-slate-800/80 border-slate-700';

  return (
    <header className="bg-slate-900/95 backdrop-blur border border-slate-700/80 rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3">
      {/* Manche & Timer */}
      <div className="flex items-center gap-3">
        {/* Info Manche */}
        <div className="px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none mb-0.5">
            Manche
          </span>
          <span className="text-sm font-extrabold text-white">
            {currentRound} / {maxRounds}
          </span>
        </div>

        {/* Chronomètre */}
        <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 font-mono font-black text-lg ${timerColor}`}>
          <Clock className={`w-4 h-4 ${isUrgent ? 'animate-spin' : ''}`} />
          <span>{timeRemaining}s</span>
        </div>
      </div>

      {/* Mot à deviner / Masque */}
      <div className="flex-1 text-center px-2 min-w-0">
        {state === 'SELECTING_WORD' ? (
          <span className="text-xs md:text-sm font-medium text-amber-300 animate-pulse">
            Le dessinateur choisit un mot...
          </span>
        ) : state === 'ROUND_OVER' ? (
          <div className="animate-fadeIn">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
              Le mot était :
            </span>
            <span className="text-base md:text-xl font-black text-emerald-400 uppercase tracking-widest">
              {secretWord}
            </span>
          </div>
        ) : isDrawer && secretWord ? (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-indigo-400 block font-semibold">
              Tu dessines :
            </span>
            <span className="text-base md:text-2xl font-black text-white uppercase tracking-wider">
              {secretWord}
            </span>
          </div>
        ) : (
          <div>
            <span className="text-lg md:text-2xl font-black font-mono tracking-[0.3em] text-white">
              {hintMask || '_ _ _ _'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {hintMask ? `${hintMask.replace(/[^A-Za-zÀ-ÿ_]/g, '').length} lettres` : ''}
            </span>
          </div>
        )}
      </div>

      {/* Boutons d'actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenQR}
          title="Inviter des amis (QR Code smartphone)"
          className="p-2 text-indigo-300 hover:text-white bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-700/40 rounded-xl transition shadow-sm"
        >
          <QrCode className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenSettings}
          title="Réglages et Clé API Gemini"
          className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition"
        >
          <Settings className="w-5 h-5" />
        </button>

        <button
          onClick={onLeaveRoom}
          title="Quitter la partie"
          className="p-2 text-rose-400 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-900/40 rounded-xl transition"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
