import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Bot, 
  Sparkles, 
  RotateCw, 
  CheckCircle2, 
  ArrowLeft, 
  Settings, 
  Lightbulb,
  SendHorizontal
} from 'lucide-react';
import Canvas from './Canvas.jsx';
import Toolbar from './Toolbar.jsx';
import { sound } from '../utils/sound.js';
import { socket } from '../utils/socket.js';

const SOLO_WORDS = [
  "chat", "pizza", "maison", "avion", "guitare", "fusée", "voiture", "pomme",
  "chien", "soleil", "arbre", "vélo", "chapeau", "lunettes", "poisson", "bateau",
  "papillon", "dinosaure", "montagne", "robot", "hamburger", "football", "cloche"
];

export default function SoloAIMode({ onBack, onOpenSettings }) {
  const [currentWord, setCurrentWord] = useState('');
  const [activeTool, setActiveTool] = useState('brush');
  const [activeColor, setActiveColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(8);
  const [lastSnapshot, setLastSnapshot] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiGuesses, setAiGuesses] = useState([]);
  const [aiComment, setAiComment] = useState('Dessine quelque chose, je suis prêt à deviner !');
  const [hasWon, setHasWon] = useState(false);
  const [clearTrigger, setClearTrigger] = useState(0);
  const [attempts, setAttempts] = useState(0);

  // Choisir un mot au hasard au démarrage
  const pickRandomWord = () => {
    const word = SOLO_WORDS[Math.floor(Math.random() * SOLO_WORDS.length)];
    setCurrentWord(word);
    setHasWon(false);
    setAiGuesses([]);
    setAiComment('C\'est parti ! Commence à dessiner ton mot.');
    setAttempts(0);
    setClearTrigger(prev => prev + 1);
  };

  useEffect(() => {
    pickRandomWord();
  }, []);

  // Écouter les résultats de l'IA venant du serveur
  useEffect(() => {
    const handleAiResult = (result) => {
      setIsAnalyzing(false);
      if (!result) return;

      const guesses = result.guesses || [];
      setAiGuesses(guesses);
      if (result.comment) {
        setAiComment(result.comment);
      }

      // Vérifier si l'IA a trouvé le mot
      const normalizedSecret = currentWord.toLowerCase().trim();
      const found = guesses.some(g => g.toLowerCase().trim() === normalizedSecret);

      if (found) {
        setHasWon(true);
        sound.playCorrect();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        sound.playPop();
      }
    };

    socket.on('solo_ai_result', handleAiResult);
    return () => {
      socket.off('solo_ai_result', handleAiResult);
    };
  }, [currentWord]);

  // Demander à l'IA d'analyser le dessin
  const triggerAiGuess = () => {
    if (!lastSnapshot || isAnalyzing || hasWon) return;

    setIsAnalyzing(true);
    setAttempts(prev => prev + 1);

    const apiKey = localStorage.getItem('GEMINI_API_KEY') || '';

    socket.emit('solo_ai_guess', {
      imageBase64: lastSnapshot,
      currentWord,
      apiKey,
    });
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-3 min-h-[90vh]">
      {/* En-tête du Mode Solo */}
      <header className="bg-slate-900/95 backdrop-blur border border-slate-700/80 rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
            title="Retour au menu"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Défi Solo contre l'IA</h2>
            </div>
            <p className="text-[11px] text-slate-400">L'IA essaie de deviner ce que tu dessines</p>
          </div>
        </div>

        {/* Mot à dessiner */}
        <div className="bg-indigo-950/60 border border-indigo-500/40 px-4 py-1.5 rounded-xl text-center">
          <span className="text-[10px] uppercase font-bold text-indigo-400 block">
            Mot à dessiner
          </span>
          <span className="text-base md:text-xl font-black text-white uppercase tracking-wider">
            {currentWord}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={pickRandomWord}
            title="Changer de mot"
            className="p-2 text-indigo-300 hover:text-white bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-700/40 rounded-xl transition flex items-center gap-1 text-xs font-semibold"
          >
            <RotateCw className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau mot</span>
          </button>
          <button
            onClick={onOpenSettings}
            title="Réglages"
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition border border-slate-700"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Zone de jeu : Canvas + Panneau IA */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 flex-1">
        {/* Canvas et Outils */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          <Canvas
            key={clearTrigger}
            isDrawer={true}
            activeTool={activeTool}
            activeColor={activeColor}
            brushSize={brushSize}
            onSnapshotReady={(snap) => setLastSnapshot(snap)}
          />

          <Toolbar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            activeColor={activeColor}
            setActiveColor={setActiveColor}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            onUndo={() => {}}
            onClear={() => setClearTrigger(prev => prev + 1)}
            isDrawer={true}
          />
        </div>

        {/* Panneau latéral de l'IA */}
        <div className="flex flex-col gap-3">
          <div className="bg-slate-900/95 backdrop-blur border border-slate-700/80 rounded-2xl p-4 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              {/* Statut IA */}
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Gemini Vision AI</h4>
                  <span className="text-[11px] text-emerald-400 font-medium">
                    {isAnalyzing ? 'Analyse du dessin en cours...' : 'Prête à deviner'}
                  </span>
                </div>
              </div>

              {/* Bulle de dialogue de l'IA */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 mb-4 relative text-sm text-slate-200 leading-relaxed shadow-inner">
                <div className="text-xs font-semibold text-amber-400 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Réaction de l'IA :
                </div>
                <p className="italic">"{aiComment}"</p>
              </div>

              {/* Dernières propositions */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Ses propositions :
                </span>
                {aiGuesses.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {aiGuesses.map((g, idx) => {
                      const isMatch = g.toLowerCase().trim() === currentWord.toLowerCase().trim();
                      return (
                        <span
                          key={idx}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition shadow-sm ${
                            isMatch
                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 animate-bounce'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {g} {isMatch ? '🎯 (Trouvé !)' : ''}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Aucune proposition pour l'instant. Fais un premier tracé !
                  </p>
                )}
              </div>
            </div>

            {/* Victoire ou Bouton Deviner */}
            <div className="pt-4 border-t border-slate-800">
              {hasWon ? (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-center space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-300 font-black text-base">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    L'IA a trouvé ton dessin ! 🏆
                  </div>
                  <p className="text-xs text-emerald-400/80">En seulement {attempts} tentative{attempts > 1 ? 's' : ''} !</p>
                  <button
                    onClick={pickRandomWord}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition"
                  >
                    Dessin suivant &rarr;
                  </button>
                </div>
              ) : (
                <button
                  onClick={triggerAiGuess}
                  disabled={!lastSnapshot || isAnalyzing}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-40 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/30 text-sm active:scale-98"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isAnalyzing ? 'L\'IA réfléchit...' : 'Faire deviner à l\'IA !'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
