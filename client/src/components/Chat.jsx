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
      <div className="px-3 py-1 sm:px-4 sm:py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between shrink-0">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-300">
          Chat & Propositions
        </span>
        <span className="text-[10px] sm:text-xs text-slate-500">
          {messages.length} msgs
        </span>
      </div>

      {/* Zone des messages défilants */}
      <div
        ref={chatScrollRef}
        className="flex-1 min-h-0 p-2 sm:p-3 overflow-y-auto space-y-1.5 text-xs sm:text-sm select-text"
      >
        {messages.map((msg, idx) => {
          if (msg.type === 'system') {
            return (
              <div
                key={idx}
                className="py-0.5 px-2 rounded-lg bg-indigo-950/50 border border-indigo-900/40 text-[11px] text-indigo-300 font-medium text-center"
              >
                {msg.text}
              </div>
            );
          }

          if (msg.type === 'guessed') {
            return (
              <div
                key={idx}
                className="py-1 px-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 font-bold flex items-center gap-1.5 shadow-sm animate-bounce-short"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{msg.text}</span>
              </div>
            );
          }

          if (msg.type === 'close') {
            return (
              <div
                key={idx}
                className="py-1 px-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-xs text-amber-300 font-semibold flex items-center gap-1.5"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{msg.text}</span>
              </div>
            );
          }

          if (msg.type === 'guessed_chat') {
            return (
              <div key={idx} className="text-emerald-400/80 text-[11px] font-medium pl-1">
                <span className="font-bold">{msg.sender} :</span> {msg.text}
              </div>
            );
          }

          const isAi = msg.sender && msg.sender.includes('IA');

          return (
            <div key={idx} className="leading-snug break-words pl-1">
              <span className={`font-semibold mr-1 ${isAi ? 'text-amber-400' : 'text-slate-300'}`}>
                {isAi ? '🤖 ' : ''}{msg.sender} :
              </span>
              <span className="text-white/90">{msg.text}</span>
            </div>
          );
        })}
      </div>

      {/* Barre de saisie */}
      <form onSubmit={handleSubmit} className="p-1.5 sm:p-2.5 bg-slate-950/90 border-t border-slate-800 shrink-0">
        {hasGuessed ? (
          <div className="py-1.5 px-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Bravo ! Tu as trouvé. Attends la fin du tour.</span>
          </div>
        ) : isDrawer ? (
          <div className="py-1.5 px-2.5 bg-slate-800/40 border border-slate-700/40 rounded-xl text-center text-xs text-slate-400">
            Tu es le dessinateur 🎨
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Tape ta proposition ici..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={disabled}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
              className="flex-1 px-3 py-1.5 sm:py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || disabled}
              className="p-2 sm:p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl transition shadow-md shadow-indigo-600/30 shrink-0"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
