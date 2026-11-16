import React, { useState, useEffect } from 'react';
import { 
  Feather,
  Palette, 
  Users, 
  Bot, 
  Play, 
  PlusCircle, 
  Settings, 
  Sparkles, 
  Dice5,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { sound } from '../utils/sound.js';
import { AGE_CATEGORIES } from '../utils/words.js';

const AVATARS = ['🪶', '🎨', '🦊', '🐱', '🐶', '🦁', '🐼', '🦄', '🚀', '👾', '🍕', '⚡'];
const RANDOM_NAMES = ['Picasso', 'Monet', 'DaVinci', 'Gribouilleur', 'VanGogh', 'DoodlePro', 'ArtisteNinja', 'DessinateurFou'];

export default function Lobby({
  onCreateRoom,
  onJoinRoom,
  onStartSoloAI,
  onOpenSettings,
  defaultRoomCode = '',
}) {
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🪶');
  const [roomCode, setRoomCode] = useState(defaultRoomCode);
  const [activeTab, setActiveTab] = useState('multi'); // 'multi' | 'create'
  
  // Paramètres personnalisés de salon multijoueur
  const [maxRounds, setMaxRounds] = useState(3);
  const [roundDuration, setRoundDuration] = useState(80);
  const [category, setCategory] = useState('all');
  const [customWordsText, setCustomWordsText] = useState('');
  const [enableAiPlayer, setEnableAiPlayer] = useState(true);

  // Paramètres personnalisés du Mode Solo IA
  const [soloCategory, setSoloCategory] = useState('all');
  const [soloRounds, setSoloRounds] = useState(3);
  const [soloDuration, setSoloDuration] = useState(60);
  const [showSoloConfig, setShowSoloConfig] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('SKRIBBL_NICKNAME');
    if (savedName) {
      setNickname(savedName);
    } else {
      randomizeName();
    }
  }, []);

  const randomizeName = () => {
    const random = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)] + Math.floor(Math.random() * 90 + 10);
    setNickname(random);
    setSelectedAvatar(AVATARS[Math.floor(Math.random() * AVATARS.length)]);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const cleanNick = nickname.trim() || 'Artiste';
    localStorage.setItem('SKRIBBL_NICKNAME', cleanNick);

    const customWords = customWordsText
      .split(/[\n,;]+/)
      .map(w => w.trim())
      .filter(w => w.length > 1);

    onCreateRoom({
      nickname: cleanNick,
      avatar: selectedAvatar,
      maxRounds,
      roundDuration,
      category,
      customWords,
      enableAiPlayer,
    });
    sound.playPop();
  };

  const handleJoin = (e) => {
    e.preventDefault();
    const cleanNick = nickname.trim() || 'Artiste';
    const cleanCode = roomCode.trim().toUpperCase();
    if (!cleanCode) return;

    localStorage.setItem('SKRIBBL_NICKNAME', cleanNick);
    onJoinRoom(cleanCode, {
      nickname: cleanNick,
      avatar: selectedAvatar,
    });
    sound.playPop();
  };

  const handleLaunchSolo = () => {
    const cleanNick = nickname.trim() || 'Artiste';
    localStorage.setItem('SKRIBBL_NICKNAME', cleanNick);
    sound.playPop();
    onStartSoloAI({
      category: soloCategory,
      rounds: soloRounds,
      duration: soloDuration,
    });
  };

  return (
    <div className="max-w-xl mx-auto py-3 sm:py-6 px-3 sm:px-4">
      {/* Logo & Titre */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-pink-500 via-indigo-600 to-amber-400 p-0.5 shadow-2xl shadow-indigo-500/30 mb-2 sm:mb-3">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
            <Feather className="w-8 h-8 sm:w-9 sm:h-9 text-indigo-400" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white flex items-center justify-center gap-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-indigo-300 to-amber-300">
            LaPlume
          </span>
          <span className="text-2xl select-none">🪶</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Le jeu de dessin & devinettes multijoueur avec IA intégrée
        </p>
      </div>

      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5">
        {/* Profil du joueur (Pseudo & Avatar) */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Ton Profil
          </label>
          <div className="flex items-center gap-2.5">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Ton pseudo..."
                maxLength={18}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-white font-bold placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={randomizeName}
                title="Nom aléatoire"
                className="absolute right-3 top-3 text-slate-400 hover:text-white transition"
              >
                <Dice5 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center text-xl sm:text-2xl shadow-inner shrink-0 select-none">
              {selectedAvatar}
            </div>
          </div>

          {/* Sélecteur d'avatars */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1">
            {AVATARS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setSelectedAvatar(av)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition shrink-0 ${
                  selectedAvatar === av
                    ? 'bg-indigo-600 ring-2 ring-indigo-400 scale-105'
                    : 'bg-slate-800/80 hover:bg-slate-700'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* 🤖 DÉFI SOLO CONTRE L'IA (Bouton et cadre parfaitement ajustés et centrés) */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-indigo-950/90 via-purple-950/90 to-slate-900 border border-indigo-500/40 rounded-2xl shadow-lg space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-indigo-500 flex items-center justify-center text-slate-950 shrink-0 shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                  <span>Défi Solo contre l'IA</span>
                  <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] font-extrabold rounded uppercase">
                    Auto-check
                  </span>
                </h4>
                <p className="text-[11px] text-slate-300">L'IA analyse tes dessins en direct à chaque trait !</p>
              </div>
            </div>

            {/* Bouton Démarrer Défi Solo (Ajusté & Centré) */}
            <button
              type="button"
              onClick={handleLaunchSolo}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-pink-600 via-indigo-600 to-indigo-500 hover:from-pink-500 hover:to-indigo-400 active:scale-95 text-white font-extrabold text-xs rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Jouer en Solo</span>
            </button>
          </div>

          {/* Déroulant de réglages Solo (Tranches d'âge, manches, chrono) */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowSoloConfig(!showSoloConfig)}
              className="text-[11px] text-indigo-300 hover:text-white font-semibold flex items-center gap-1 transition mx-auto sm:mx-0"
            >
              <Sliders className="w-3 h-3" />
              <span>Paramètres Solo (Tranche d'âge, manches, temps)</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showSoloConfig ? 'rotate-180' : ''}`} />
            </button>

            {showSoloConfig && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2.5 text-xs animate-fadeIn">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Tranche d'âge / Style
                  </label>
                  <select
                    value={soloCategory}
                    onChange={(e) => setSoloCategory(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                  >
                    {AGE_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Manches
                  </label>
                  <select
                    value={soloRounds}
                    onChange={(e) => setSoloRounds(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                  >
                    {[1, 3, 5, 8, 10].map(n => (
                      <option key={n} value={n}>{n} manche{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Temps par tour
                  </label>
                  <select
                    value={soloDuration}
                    onChange={(e) => setSoloDuration(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                  >
                    <option value={30}>30s (Ultra rapide)</option>
                    <option value={45}>45s (Dynamique)</option>
                    <option value={60}>60s (Classique)</option>
                    <option value={80}>80s (Détente)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Onglets Multijoueur : Rejoindre / Créer */}
        <div>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl mb-4 border border-slate-800">
            <button
              onClick={() => setActiveTab('multi')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'multi'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              Rejoindre un Salon
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'create'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Créer un Salon
            </button>
          </div>

          {/* Formulaire : Rejoindre */}
          {activeTab === 'multi' ? (
            <form onSubmit={handleJoin} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Code du salon (6 lettres)
                </label>
                <input
                  type="text"
                  placeholder="EX: ABC123"
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-white font-mono font-black text-center text-lg tracking-widest placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={!roomCode.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/30 text-sm active:scale-98"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Entrer dans la partie</span>
              </button>
            </form>
          ) : (
            /* Formulaire : Créer Salon avec tranches d'âge */
            <form onSubmit={handleCreate} className="space-y-3.5">
              {/* Thème & Tranche d'âge */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Tranche d'âge & Thématique
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                >
                  {AGE_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label} ({cat.age})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Nombre de manches */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Manches ({maxRounds})
                  </label>
                  <select
                    value={maxRounds}
                    onChange={(e) => setMaxRounds(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 8, 10].map(n => (
                      <option key={n} value={n}>{n} manche{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                {/* Temps de dessin */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Temps ({roundDuration}s)
                  </label>
                  <select
                    value={roundDuration}
                    onChange={(e) => setRoundDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value={45}>45 secondes (Rapide)</option>
                    <option value={60}>60 secondes</option>
                    <option value={80}>80 secondes (Classique)</option>
                    <option value={120}>120 secondes (Détendu)</option>
                  </select>
                </div>
              </div>

              {/* Option Bot IA */}
              <label className="flex items-center gap-3 p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-950 transition">
                <input
                  type="checkbox"
                  checked={enableAiPlayer}
                  onChange={(e) => setEnableAiPlayer(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-slate-800 border-slate-600"
                />
                <div className="text-xs">
                  <span className="font-bold text-white flex items-center gap-1">
                    <Bot className="w-4 h-4 text-amber-400" />
                    Ajouter le Bot "Gemini IA" dans la partie
                  </span>
                  <span className="text-slate-400 text-[11px] block">L'IA participe aux devinettes avec les joueurs</span>
                </div>
              </label>

              {/* Mots personnalisés */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Mots personnalisés (Optionnel)
                </label>
                <textarea
                  placeholder="Séparer par des virgules (ex: voiture, fusee, pizza...)"
                  rows={2}
                  value={customWordsText}
                  onChange={(e) => setCustomWordsText(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/30 text-sm active:scale-98"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Créer le Salon & Inviter</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Pied de page & Réglages */}
      <div className="flex items-center justify-between text-xs text-slate-500 mt-3 px-2">
        <span>LaPlume • Smartphone Android, iOS & PC</span>
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition"
        >
          <Settings className="w-4 h-4" />
          <span>Réglages / Clé IA</span>
        </button>
      </div>
    </div>
  );
}
