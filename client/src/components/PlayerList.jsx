import React from 'react';
import { Crown, Paintbrush, Check, Bot } from 'lucide-react';

export default function PlayerList({
  players = [],
  currentDrawerId,
  myId,
}) {
  // Trier par score décroissant
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-slate-900/95 backdrop-blur border border-slate-700/80 rounded-2xl p-3 shadow-xl">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1 flex items-center justify-between">
        <span>Joueurs ({players.length})</span>
        <span className="text-[10px] text-slate-500">Classement</span>
      </div>

      <div className="space-y-1.5 max-h-[220px] md:max-h-[300px] overflow-y-auto">
        {sortedPlayers.map((player, idx) => {
          const isMe = player.id === myId || (player.userId && player.userId === myId);
          const isDrawer = player.id === currentDrawerId;

          return (
            <div
              key={player.id}
              className={`p-2 rounded-xl flex items-center justify-between transition border ${
                player.hasGuessed
                  ? 'bg-emerald-950/40 border-emerald-500/40'
                  : isDrawer
                  ? 'bg-indigo-950/50 border-indigo-500/50 shadow-sm'
                  : 'bg-slate-800/50 border-slate-700/50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {/* Rang */}
                <span className="text-xs font-mono font-bold text-slate-500 w-4 text-center shrink-0">
                  #{idx + 1}
                </span>

                {/* Avatar */}
                <span className="text-xl shrink-0 select-none">
                  {player.avatar || '🎨'}
                </span>

                {/* Nom */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-bold truncate ${isMe ? 'text-indigo-400' : 'text-white'}`}>
                      {player.nickname}
                    </span>
                    {player.isHost && (
                      <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" title="Hôte de la partie" />
                    )}
                    {player.isAi && (
                      <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] rounded font-semibold shrink-0">
                        IA
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {player.score} pts
                  </div>
                </div>
              </div>

              {/* Statut du tour */}
              <div className="flex items-center gap-1 shrink-0">
                {isDrawer && (
                  <div className="p-1 bg-indigo-500 text-white rounded-lg animate-pulse" title="En train de dessiner">
                    <Paintbrush className="w-3.5 h-3.5" />
                  </div>
                )}
                {player.hasGuessed && (
                  <div className="p-1 bg-emerald-500 text-white rounded-lg shadow-sm" title="A trouvé le mot !">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
