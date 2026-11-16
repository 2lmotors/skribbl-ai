import React, { useEffect, useState } from 'react';
import { Trophy, Award, CheckCircle2, Paintbrush, Clock } from 'lucide-react';

export default function RoundLeaderboardModal({ data, onClose, myId }) {
  if (!data) return null;

  const {
    word = '',
    drawerNickname = '',
    drawerAvatar = '🎨',
    leaderboard = [],
    currentRound = 1,
    maxRounds = 3,
    delaySeconds = 3,
  } = data;

  const [timeLeft, setTimeLeft] = useState(delaySeconds);

  useEffect(() => {
    setTimeLeft(delaySeconds);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onClose) onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [data, delaySeconds, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-indigo-500/80 rounded-3xl p-5 sm:p-6 text-white text-center shadow-2xl relative overflow-hidden">
        {/* Barre de progression du compte à rebours en haut */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / delaySeconds) * 100}%` }}
          />
        </div>

        {/* Mot révélé */}
        <div className="mb-4 pt-1">
          <span className="text-xs uppercase font-extrabold text-slate-400 tracking-widest block mb-1">
            Le mot secret était :
          </span>
          <div className="inline-block py-2 px-6 bg-gradient-to-r from-emerald-500/20 via-indigo-500/20 to-pink-500/20 border border-emerald-400/40 rounded-2xl">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 uppercase tracking-widest drop-shadow-sm">
              {word}
            </span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-2">
            <Paintbrush className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dessiné par <strong className="text-white">{drawerAvatar} {drawerNickname}</strong></span>
          </div>
        </div>

        {/* Titre du Classement Provisoire */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 px-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-extrabold text-white uppercase tracking-wide">
              Classement Provisoire
            </span>
          </div>
          <span className="text-xs font-semibold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-800/40">
            Manche {currentRound} / {maxRounds}
          </span>
        </div>

        {/* Liste des joueurs et scores */}
        <div className="space-y-2 max-h-[260px] overflow-y-auto mb-4 pr-1">
          {leaderboard.map((player, idx) => {
            const isMe = player.id === myId;
            const rank = idx + 1;

            return (
              <div
                key={player.id}
                className={`p-2.5 rounded-2xl flex items-center justify-between transition border ${
                  isMe
                    ? 'bg-indigo-950/60 border-indigo-500/60 ring-1 ring-indigo-500/50'
                    : 'bg-slate-800/60 border-slate-700/60'
                }`}
              >
                {/* Rang + Avatar + Nom */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 text-center font-mono font-black text-xs shrink-0">
                    {rank === 1 ? (
                      <span className="text-amber-400 text-sm">🥇</span>
                    ) : rank === 2 ? (
                      <span className="text-slate-300 text-sm">🥈</span>
                    ) : rank === 3 ? (
                      <span className="text-amber-600 text-sm">🥉</span>
                    ) : (
                      <span className="text-slate-500">#{rank}</span>
                    )}
                  </div>

                  <span className="text-2xl shrink-0 select-none">
                    {player.avatar || '🎨'}
                  </span>

                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-bold truncate max-w-[130px] sm:max-w-[170px] ${
                        isMe ? 'text-indigo-300' : 'text-white'
                      }`}>
                        {player.nickname}
                      </span>
                      {isMe && (
                        <span className="text-[10px] bg-indigo-600/50 text-indigo-200 px-1.5 py-0.2 rounded font-semibold">
                          Moi
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score gagné cette manche + Score total */}
                <div className="flex items-center gap-3 shrink-0 text-right">
                  {player.roundScore > 0 ? (
                    <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-lg animate-bounce-short">
                      +{player.roundScore} pts
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500 px-2 py-0.5">
                      +0 pt
                    </span>
                  )}

                  <span className="text-sm font-black font-mono text-white min-w-[65px] text-right">
                    {player.score} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compte à rebours avant la manche suivante */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 bg-slate-950/70 py-2.5 px-4 rounded-xl border border-slate-800">
          <Clock className="w-4 h-4 text-indigo-400 animate-spin" />
          <span>Prochain tour dans <strong className="text-amber-400 font-mono text-sm">{timeLeft}s</strong>...</span>
        </div>
      </div>
    </div>
  );
}
