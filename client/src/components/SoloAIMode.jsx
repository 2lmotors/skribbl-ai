import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Bot, 
  Sparkles, 
  RotateCw, 
  CheckCircle2, 
  ArrowLeft, 
  Settings, 
  Clock,
  Trophy,
  Award,
  Zap,
  RotateCcw
} from 'lucide-react';
import Canvas from './Canvas.jsx';
import Toolbar from './Toolbar.jsx';
import { sound } from '../utils/sound.js';
import { socket } from '../utils/socket.js';
import { AGE_CATEGORIES, getWordForCategory } from '../utils/words.js';

export default function SoloAIMode({ 
  onBack, 
  onOpenSettings,
  initialCategory = 'all',
  initialRounds = 3,
  initialDuration = 60
}) {
  // Paramètres de session Solo
  const [category, setCategory] = useState(initialCategory);
  const [totalRounds, setTotalRounds] = useState(initialRounds);
  const [roundDuration, setRoundDuration] = useState(initialDuration);
  
  // État du jeu
  const [currentRound, setCurrentRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isRoundActive, setIsRoundActive] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [wonRoundsCount, setWonRoundsCount] = useState(0);

  // Outils de dessin
  const [activeTool, setActiveTool] = useState('brush');
  const [activeColor, setActiveColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(8);
  const [lastSnapshot, setLastSnapshot] = useState(null);
  const [clearTrigger, setClearTrigger] = useState(0);

  // État de l'IA
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiGuesses, setAiGuesses] = useState([]);
  const [aiComment, setAiComment] = useState('Dessine ! J\'observe en direct pour deviner...');
  const [hasWonCurrentRound, setHasWonCurrentRound] = useState(false);

  const autoAnalyzeTimerRef = useRef(null);
  const isAnalyzingRef = useRef(false);
  const hasWonRef = useRef(false);
  const currentWordRef = useRef('');

  isAnalyzingRef.current = isAnalyzing;
  hasWonRef.current = hasWonCurrentRound;
  currentWordRef.current = currentWord;

  // Initialisation ou changement de manche
  const startNewRound = (roundNumber = 1) => {
    const nextWord = getWordForCategory(category);
    setCurrentWord(nextWord);
    setCurrentRound(roundNumber);
    setTimeLeft(roundDuration);
    setHasWonCurrentRound(false);
    setIsRoundActive(true);
    setRoundScore(0);
    setAiGuesses([]);
    setAiComment('C\'est parti ! Je regarde tes traits en direct...');
    setClearTrigger(prev => prev + 1);
  };

  useEffect(() => {
    startNewRound(1);
  }, [category, roundDuration]);

  // Chronomètre de manche
  useEffect(() => {
    if (!isRoundActive || hasWonCurrentRound || isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }

        // Tic-tac accéléré stressant sur les 10 dernières secondes
        if (prev - 1 <= 10) {
          sound.playTick(prev - 1);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRoundActive, hasWonCurrentRound, isGameOver]);

  // Détection du temps écoulé
  const handleTimeOut = () => {
    setIsRoundActive(false);
    setAiComment(`Temps écoulé ! Le mot à deviner était : "${currentWord.toUpperCase()}".`);
    sound.playClose();

    // Passer à la manche suivante après 3.5 secondes
    setTimeout(() => {
      if (currentRound < totalRounds) {
        startNewRound(currentRound + 1);
      } else {
        finishGame();
      }
    }, 3800);
  };

  // Fin de la partie complète
  const finishGame = () => {
    setIsGameOver(true);
    sound.playVictory();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Réception des réponses de l'IA
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
      const normalizedSecret = (currentWordRef.current || '').toLowerCase().trim();
      const found = guesses.some(g => g.toLowerCase().trim() === normalizedSecret);

      if (found && !hasWonRef.current && isRoundActive) {
        setHasWonCurrentRound(true);
        setIsRoundActive(false);

        // Calcul des points basé sur le temps restant
        const points = Math.max(120, Math.round(100 + (timeLeft / roundDuration) * 400));
        setRoundScore(points);
        setTotalScore(prev => prev + points);
        setWonRoundsCount(prev => prev + 1);

        sound.playCorrect();
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });

        // Passer à la manche suivante après 3.5 secondes
        setTimeout(() => {
          if (currentRound < totalRounds) {
            startNewRound(currentRound + 1);
          } else {
            finishGame();
          }
        }, 3600);
      }
    };

    socket.on('solo_ai_result', handleAiResult);
    return () => {
      socket.off('solo_ai_result', handleAiResult);
    };
  }, [roundDuration, timeLeft, isRoundActive, currentRound, totalRounds]);

  // Analyse automatique du dessin dès que l'utilisateur dessine
  const handleSnapshotReady = (dataUrl) => {
    setLastSnapshot(dataUrl);

    // Déclencher automatiquement l'analyse sans que le joueur ait à cliquer
    if (isAnalyzingRef.current || hasWonRef.current || !isRoundActive) return;

    if (autoAnalyzeTimerRef.current) {
      clearTimeout(autoAnalyzeTimerRef.current);
    }

    // Déclenchement automatique 1.4s après le tracé
    autoAnalyzeTimerRef.current = setTimeout(() => {
      triggerAiGuess(dataUrl);
    }, 1400);
  };

  // Fonction d'envoi vers l'IA
  const triggerAiGuess = (snap) => {
    const imageToSend = snap || lastSnapshot;
    if (!imageToSend || isAnalyzingRef.current || hasWonRef.current || !isRoundActive) return;

    setIsAnalyzing(true);
    const apiKey = localStorage.getItem('GEMINI_API_KEY') || '';

    socket.emit('solo_ai_guess', {
      imageBase64: imageToSend,
      currentWord: currentWordRef.current,
      apiKey,
    });
  };

  // Styles d'urgence du chrono
  const isUrgent = timeLeft <= 10 && timeLeft > 0;
  const isCritical = timeLeft <= 5 && timeLeft > 0;
  const timerStyle = isCritical
    ? 'text-white bg-rose-600 border-rose-400 animate-bounce ring-2 ring-rose-500'
    : isUrgent
    ? 'text-rose-400 bg-rose-950/90 border-rose-500 animate-pulse-fast'
    : timeLeft <= 20
    ? 'text-amber-400 bg-amber-950/60 border-amber-500/50'
    : 'text-indigo-300 bg-slate-900 border-slate-700';

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between overflow-hidden bg-slate-950 p-1 sm:p-2.5 select-none">
      {/* 1. HEADER ULTRA-COMPACT (Hauteur ~40px) */}
      <header className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2 shrink-0 shadow-md">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 text-slate-300 hover:text-white bg-slate-800 rounded-lg transition shrink-0"
            title="Quitter"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          {/* Manche */}
          <div className="px-2 py-0.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-bold text-slate-300 shrink-0">
            {currentRound}/{totalRounds}
          </div>

          {/* Score Virtuel */}
          <div className="px-2 py-0.5 bg-indigo-950/60 border border-indigo-500/40 rounded-lg text-[11px] font-extrabold text-indigo-300 flex items-center gap-1 shrink-0">
            <Trophy className="w-3 h-3 text-amber-400" />
            <span>{totalScore} pts</span>
          </div>
        </div>

        {/* Chronomètre & Options */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className={`px-2 py-1 rounded-lg border font-mono font-black text-xs sm:text-sm flex items-center gap-1 ${timerStyle}`}>
            <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'animate-spin' : ''}`} />
            <span>{timeLeft}s</span>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
            title="Réglages"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* BANNIÈRE DÉDIÉE PLEINE LARGEUR POUR LE MOT (Visible à 100% sur mobile sans être tronqué) */}
      <div className="bg-gradient-to-r from-pink-500/20 via-indigo-500/20 to-purple-500/20 border border-indigo-400/40 px-3 py-1 rounded-xl text-center shrink-0 shadow-sm flex items-center justify-center gap-2">
        <span className="text-[10px] sm:text-xs uppercase font-extrabold text-indigo-300 tracking-wider shrink-0">
          Mot à dessiner :
        </span>
        <span className="text-sm sm:text-xl font-black uppercase tracking-wider break-words flex items-center gap-0.5">
          {currentWord.split('-').map((part, i, arr) => (
            <React.Fragment key={i}>
              <span className="text-white">{part}</span>
              {i < arr.length - 1 && (
                <span className="text-rose-500 font-black text-base sm:text-2xl px-1 animate-pulse drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]">
                  -
                </span>
              )}
            </React.Fragment>
          ))}
        </span>
      </div>

      {/* 2. ZONE DE DESSIN CENTRALE (Flex-1, s'adapte sans dépasser) */}
      <div className="flex-1 min-h-0 flex flex-col justify-center items-center py-1 overflow-hidden">
        <div className="w-full h-full max-h-[58vh] sm:max-h-[62vh] flex items-center justify-center">
          <Canvas
            key={clearTrigger}
            isDrawer={isRoundActive && !hasWonCurrentRound}
            activeTool={activeTool}
            activeColor={activeColor}
            brushSize={brushSize}
            onSnapshotReady={handleSnapshotReady}
            onClear={() => setClearTrigger(prev => prev + 1)}
          />
        </div>
      </div>

      {/* 3. BARRE D'OUTILS COMPACTE (Hauteur ~46px) */}
      <div className="shrink-0 mb-1">
        <Toolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          activeColor={activeColor}
          setActiveColor={setActiveColor}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          onUndo={() => {}}
          onClear={() => setClearTrigger(prev => prev + 1)}
          isDrawer={isRoundActive && !hasWonCurrentRound}
        />
      </div>

      {/* 4. DOCK IA EN DIRECT (Hauteur ~68px, l'IA devine automatiquement !) */}
      <footer className="bg-slate-900/95 backdrop-blur border border-slate-800 rounded-xl p-2 shrink-0 shadow-lg">
        <div className="flex items-center gap-2">
          {/* Avatar Robot animé */}
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
            isAnalyzing ? 'bg-amber-500 animate-pulse' : 'bg-gradient-to-tr from-indigo-600 to-pink-600'
          }`}>
            <Bot className="w-5 h-5 text-white" />
          </div>

          {/* Bulle de l'IA & Propositions */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[11px] font-extrabold text-amber-300 flex items-center gap-1 truncate">
                <Sparkles className="w-3 h-3 shrink-0" />
                {isAnalyzing ? 'L\'IA analyse...' : aiComment}
              </span>

              {hasWonCurrentRound ? (
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 shrink-0">
                  +{roundScore} pts 🎯
                </span>
              ) : (
                <span className="text-[9px] text-slate-500 hidden sm:inline">
                  ⚡ Auto-détection active
                </span>
              )}
            </div>

            {/* Badges des devinettes de l'IA */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {aiGuesses.length > 0 ? (
                aiGuesses.map((guess, idx) => {
                  const isMatch = guess.toLowerCase().trim() === currentWord.toLowerCase().trim();
                  return (
                    <span
                      key={idx}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md capitalize shrink-0 ${
                        isMatch
                          ? 'bg-emerald-600 text-white animate-bounce ring-1 ring-emerald-300'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {guess} {isMatch ? '🎯' : ''}
                    </span>
                  );
                })
              ) : (
                <span className="text-[10px] text-slate-500 italic">
                  Dessine un trait pour que l'IA commence à deviner...
                </span>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* 5. MODALE DE FIN DE PARTIE SOLO */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-indigo-500 rounded-3xl p-6 text-white text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-tr from-amber-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Trophy className="w-8 h-8 text-slate-950" />
            </div>

            <h3 className="text-2xl font-black mb-1">Défi Solo Terminé !</h3>
            <p className="text-xs text-slate-400 mb-6">
              Tu as fait deviner <strong className="text-emerald-400">{wonRoundsCount}</strong> / {totalRounds} mots à l'IA
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-1">
                Score Virtuel Total
              </span>
              <span className="text-3xl font-black font-mono text-amber-400">
                {totalScore} pts
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setIsGameOver(false);
                  startNewRound(1);
                  setTotalScore(0);
                  setWonRoundsCount(0);
                }}
                className="py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition"
              >
                Rejouer
              </button>
              <button
                onClick={onBack}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition border border-slate-700"
              >
                Menu Principal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
