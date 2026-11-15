import React, { useState, useRef, useEffect } from 'react';
import { Send, CheckCircle2, Flame, Bot } from 'lucide-react';
import { sound } from '../utils/sound.js';

export default function Chat({
  messages = [],
  onSendMessage,
  isDrawer,
  hasGuessed,
  disabled,
}) {
  const [inputText, setInputText] = useState('');
  const chatScrollRef = useRef(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean) return;

    onSendMessage(clean);
    setInputText('');
    sound.playPop();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/95 backdrop-blur border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
      {/* En-tête du Chat */}
      <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Chat & Réponses
        </span>
        <span className="text-xs text-slate-500">
          {messages.length} messages
        </span>
      </div>

      {/* Zone des messages défilants */}
      <div
        ref={chatScrollRef}
        className="flex-1 p-3 overflow-y-auto space-y-2 text-sm select-text"
      >
        {messages.map((msg, idx) => {
          if (msg.type === 'system') {
            return (
              <div
                key={idx}
                className="py-1 px-2.5 rounded-lg bg-indigo-950/50 border border-indigo-900/40 text-xs text-indigo-300 font-medium text-center"
              >
                {msg.text}
              </div>
            );
          }

          if (msg.type === 'guessed') {
            return (
              <div
                key={idx}
                className="py-1.5 px-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 font-bold flex items-center gap-2 shadow-sm animate-bounce-short"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{msg.text}</span>
              </div>
            );
          }

          if (msg.type === 'close') {
            return (
              <div
                key={idx}
                className="py-1.5 px-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-xs text-amber-300 font-semibold flex items-center gap-2"
              >
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{msg.text}</span>
              </div>
            );
          }

          if (msg.type === 'guessed_chat') {
            return (
              <div key={idx} className="text-emerald-400/80 text-xs font-medium pl-1">
                <span className="font-bold">{msg.sender} :</span> {msg.text}
              </div>
            );
          }

          const isAi = msg.sender && msg.sender.includes('IA');

          return (
            <div key={idx} className="leading-snug break-words pl-1">
              <span className={`font-semibold mr-1.5 ${isAi ? 'text-amber-400' : 'text-slate-300'}`}>
                {isAi ? '🤖 ' : ''}{msg.sender} :
              </span>
              <span className="text-white/90">{msg.text}</span>
            </div>
          );
        })}
      </div>

      {/* Barre de saisie */}
      <form onSubmit={handleSubmit} className="p-2.5 bg-slate-950/80 border-t border-slate-800">
        {hasGuessed ? (
          <div className="py-2 px-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Tu as trouvé le mot ! Attends la fin du tour.
          </div>
        ) : isDrawer ? (
          <div className="py-2 px-3 bg-slate-800/40 border border-slate-700/40 rounded-xl text-center text-xs text-slate-400">
            Tu es le dessinateur — exprime-toi par le dessin ! 🎨
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Tape ta réponse ici..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={disabled}
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || disabled}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl transition shadow-md shadow-indigo-600/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
