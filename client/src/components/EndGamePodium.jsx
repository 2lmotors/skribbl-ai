import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Medal, Award, RotateCcw, LogOut } from 'lucide-react';
import { sound } from '../utils/sound.js';

export default function EndGamePodium({ podium = [], onReturnLobby, onLeaveGame }) {
  useEffect(() => {
    sound.playVictory();

    // Lancer des confettis
    const duration = 4 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const first = podium[0];
  const second = podium[1];
  const third = podium[2];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-indigo-500 rounded-3xl p-6 text-white text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Trophy className="w-9 h-9 text-slate-950" />
        </div>

        <h2 className="text-3xl font-black mb-1">Partie terminée !</h2>
        <p className="text-sm text-slate-400 mb-8">Félicitations aux champions du pinceau !</p>

        {/* Podium visuel */}
        <div className="grid grid-cols-3 gap-3 items-end mb-8 pt-4">
          {/* 2ème place */}
          <div className="flex flex-col items-center">
            {second ? (
              <>
                <div className="text-2xl mb-1">{second.avatar || '🥈'}</div>
                <div className="text-xs font-bold text-slate-300 truncate max-w-full mb-1">
                  {second.nickname}
                </div>
                <div className="w-full h-24 bg-gradient-to-t from-slate-700 to-slate-600 rounded-t-2xl flex flex-col items-center justify-center border-t-2 border-slate-400 shadow-md">
                  <Medal className="w-6 h-6 text-slate-300 mb-1" />
                  <span className="text-xs font-extrabold text-white">#2</span>
                  <span className="text-[10px] text-slate-300 font-mono">{second.score} pts</span>
                </div>
              </>
            ) : (
              <div className="w-full h-24 bg-slate-800/40 rounded-t-2xl" />
            )}
          </div>

          {/* 1ère place (Vainqueur) */}
          <div className="flex flex-col items-center">
            {first ? (
              <>
                <div className="text-4xl mb-1 animate-bounce">{first.avatar || '🥇'}</div>
                <div className="text-sm font-extrabold text-amber-400 truncate max-w-full mb-1">
                  {first.nickname}
                </div>
                <div className="w-full h-32 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-2xl flex flex-col items-center justify-center border-t-2 border-amber-200 shadow-xl shadow-amber-500/20">
                  <Trophy className="w-8 h-8 text-slate-950 mb-1" />
                  <span className="text-sm font-black text-slate-950">#1 GAGNANT</span>
                  <span className="text-xs font-bold text-slate-900 font-mono">{first.score} pts</span>
                </div>
              </>
            ) : null}
          </div>

          {/* 3ème place */}
          <div className="flex flex-col items-center">
            {third ? (
              <>
                <div className="text-2xl mb-1">{third.avatar || '🥉'}</div>
                <div className="text-xs font-bold text-amber-700 truncate max-w-full mb-1">
                  {third.nickname}
                </div>
                <div className="w-full h-18 bg-gradient-to-t from-amber-900 to-amber-800 rounded-t-2xl flex flex-col items-center justify-center border-t-2 border-amber-600 shadow-md">
                  <Award className="w-5 h-5 text-amber-400 mb-1" />
                  <span className="text-xs font-extrabold text-white">#3</span>
                  <span className="text-[10px] text-amber-200 font-mono">{third.score} pts</span>
                </div>
              </>
            ) : (
              <div className="w-full h-18 bg-slate-800/40 rounded-t-2xl" />
            )}
          </div>
        </div>

        {/* Boutons d'action de fin de partie */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={onReturnLobby}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20 text-sm active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retour au salon</span>
          </button>

          <button
            onClick={onLeaveGame}
            className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition border border-slate-700 text-sm active:scale-95"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Quitter le jeu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
