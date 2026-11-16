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
    <header className="bg-slate-900/95 backdrop-blur border border-slate-700/80 rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 shadow-lg flex items-center justify-between gap-1.5 sm:gap-3">
      {/* Manche & Timer */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Info Manche */}
        <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg sm:rounded-xl text-center">
          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block leading-none mb-0.5">
            Manche
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-white">
            {currentRound}/{maxRounds}
          </span>
        </div>

        {/* Chronomètre */}
        <div className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border flex items-center gap-1 sm:gap-2 font-mono font-black text-sm sm:text-lg ${timerColor}`}>
          <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isUrgent ? 'animate-spin' : ''}`} />
          <span>{timeRemaining}s</span>
        </div>
      </div>

      {/* Mot à deviner / Masque */}
      <div className="flex-1 text-center px-1 min-w-0">
        {state === 'SELECTING_WORD' ? (
          <span className="text-xs sm:text-sm font-medium text-amber-300 animate-pulse truncate block">
            Choix du mot...
          </span>
        ) : state === 'ROUND_OVER' ? (
          <div className="animate-fadeIn">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 block leading-none">
              Le mot était :
            </span>
            <span className="text-xs sm:text-lg font-black uppercase tracking-widest break-words leading-tight block">
              {(secretWord || '').split('-').map((part, i, arr) => (
                <React.Fragment key={i}>
                  <span className="text-emerald-400">{part}</span>
                  {i < arr.length - 1 && (
                    <span className="text-rose-500 font-black text-sm sm:text-2xl px-1 animate-pulse drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]">
                      -
                    </span>
                  )}
                </React.Fragment>
              ))}
            </span>
          </div>
        ) : isDrawer && secretWord ? (
          <div>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-indigo-400 block font-semibold leading-none">
              Tu dessines :
            </span>
            <span className="text-xs sm:text-lg font-black uppercase tracking-wider break-words leading-tight block">
              {secretWord.split('-').map((part, i, arr) => (
                <React.Fragment key={i}>
                  <span className="text-white">{part}</span>
                  {i < arr.length - 1 && (
                    <span className="text-rose-500 font-black text-sm sm:text-2xl px-1 animate-pulse drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]">
                      -
                    </span>
                  )}
                </React.Fragment>
              ))}
            </span>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center flex-wrap gap-1 leading-none">
              {hintMask ? (
                hintMask.split(' ').map((token, i) => {
                  if (token === '-') {
                    return (
                      <span
                        key={i}
                        className="text-rose-500 font-black text-base sm:text-2xl px-1 animate-pulse drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]"
                        title="Trait d'union"
                      >
                        -
                      </span>
                    );
                  }
                  return (
                    <span
                      key={i}
                      className="text-sm sm:text-2xl font-black font-mono text-white tracking-wider"
                    >
                      {token}
                    </span>
                  );
                })
              ) : (
                <span className="text-sm sm:text-2xl font-black font-mono tracking-[0.2em] sm:tracking-[0.3em] text-white">
                  _ _ _ _
                </span>
              )}
            </div>
            <span className="text-[9px] text-slate-400 block leading-none mt-0.5">
              {hintMask ? `${hintMask.replace(/[^A-Za-zÀ-ÿ_]/g, '').length} lettres` : ''}
              {hintMask && hintMask.includes('-') && (
                <span className="ml-1 text-rose-400 font-bold">(avec trait d'union -)</span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Boutons d'actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onOpenQR}
          title="Inviter des amis (QR Code smartphone)"
          className="p-1.5 sm:p-2 text-indigo-300 hover:text-white bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-700/40 rounded-lg sm:rounded-xl transition shadow-sm"
        >
          <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={onOpenSettings}
          title="Réglages"
          className="p-1.5 sm:p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg sm:rounded-xl transition"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={onLeaveRoom}
          title="Quitter la partie"
          className="p-1.5 sm:p-2 text-rose-400 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-900/40 rounded-lg sm:rounded-xl transition"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </header>
  );
}
