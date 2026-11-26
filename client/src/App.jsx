import React, { useState, useEffect, useRef } from 'react';
import { socket } from './utils/socket.js';
import { sound } from './utils/sound.js';
import Lobby from './components/Lobby.jsx';
import Canvas from './components/Canvas.jsx';
import Toolbar from './components/Toolbar.jsx';
import Chat from './components/Chat.jsx';
import PlayerList from './components/PlayerList.jsx';
import GameHeader from './components/GameHeader.jsx';
import WordSelector from './components/WordSelector.jsx';
import EndGamePodium from './components/EndGamePodium.jsx';
import RoundLeaderboardModal from './components/RoundLeaderboardModal.jsx';
import SoloAIMode from './components/SoloAIMode.jsx';
import QRCodeModal from './components/QRCodeModal.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import { Play, Copy, Check, Users, Share2, Edit2, Smartphone, Sparkles, X } from 'lucide-react';

const AVATARS = ['🪶', '🎨', '🦊', '🐱', '🐶', '🦁', '🐼', '🦄', '🚀', '👾', '🍕', '⚡'];
const RANDOM_NAMES = ['Picasso', 'Monet', 'DaVinci', 'Gribouilleur', 'VanGogh', 'DoodlePro', 'ArtisteNinja', 'DessinateurFou'];

export function getOrCreateUserId() {
  let uid = localStorage.getItem('SKRIBBL_USER_ID');
  if (!uid) {
    uid = 'u_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    localStorage.setItem('SKRIBBL_USER_ID', uid);
  }
  return uid;
}

export default function App() {
  const [view, setView] = useState('lobby'); // 'lobby' | 'game' | 'solo_ai'
  const [room, setRoom] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [externalDrawAction, setExternalDrawAction] = useState(null);
  const [wordChoices, setWordChoices] = useState([]);
  const [podium, setPodium] = useState(null);
  const [roundEndData, setRoundEndData] = useState(null);
  const [secretWord, setSecretWord] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [mobileTab, setMobileTab] = useState('chat'); // 'chat' | 'players'
  const [soloConfig, setSoloConfig] = useState({ category: 'all', rounds: 3, duration: 60 });

  // Outils de dessin
  const [activeTool, setActiveTool] = useState('brush');
  const [activeColor, setActiveColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(8);

  // Modales & Profil
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [myNickname, setMyNickname] = useState('');
  const [myAvatar, setMyAvatar] = useState('🪶');
  const [copiedLink, setCopiedLink] = useState(false);

  // Mémorisation de salon pour reconnexion mobile automatique (arrière-plan, WhatsApp)
  const currentRoomCodeRef = useRef(sessionStorage.getItem('CURRENT_ROOM_CODE') || '');
  const canvasContainerRef = useRef(null);

  // (viewportHeight supprimé — géré par resizes-visual-viewport dans le meta viewport)

  // Hauteur du clavier détectée via visualViewport (cross-browser iOS + Android)
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (view !== 'game' || !room || room.state === 'LOBBY') {
      setKeyboardHeight(0);
      return;
    }

    const update = () => {
      if (window.visualViewport) {
        // Hauteur clavier = hauteur totale fenêtre - hauteur viewport visible - offset de scroll viewport
        const kb = Math.max(0,
          window.innerHeight
          - window.visualViewport.height
          - window.visualViewport.offsetTop
        );
        setKeyboardHeight(kb);
      }
    };

    update();
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', update);
      window.visualViewport.addEventListener('scroll', update);
    }
    window.addEventListener('resize', update);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', update);
        window.visualViewport.removeEventListener('scroll', update);
      }
      window.removeEventListener('resize', update);
      setKeyboardHeight(0);
    };
  }, [view, room?.state]);

  const scrollToCanvas = () => {
    if (canvasContainerRef.current) {
      canvasContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Ajoute/retire la classe CSS in-game sur #root pour bloquer le scroll global pendant la partie
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;
    if (view === 'game' && room && room.state !== 'LOBBY') {
      root.classList.add('in-game');
    } else {
      root.classList.remove('in-game');
    }
    return () => root.classList.remove('in-game');
  }, [view, room?.state]);

  // Recommencer toujours en haut de page (0,0) à chaque entrée dans le jeu ou nouveau tour
  useEffect(() => {
    if (view === 'game') {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const root = document.getElementById('root');
      if (root) root.scrollTop = 0;
    }
  }, [view, room?.state, room?.currentRound]);

  // Connexion automatique via lien d'invitation (?room=ABC123)
  const [urlRoomCode, setUrlRoomCode] = useState('');
  const [isAutoJoining, setIsAutoJoining] = useState(false);
  const [autoJoinCode, setAutoJoinCode] = useState('');
  const hasAutoJoinedRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('room')?.trim().toUpperCase();
    if (!code || hasAutoJoinedRef.current) return;

    hasAutoJoinedRef.current = true;
    setUrlRoomCode(code);
    setAutoJoinCode(code);
    setIsAutoJoining(true);

    const savedName = localStorage.getItem('SKRIBBL_NICKNAME');
    const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)] + Math.floor(Math.random() * 90 + 10);
    const effectiveNick = (savedName && savedName.trim()) ? savedName.trim() : randomName;
    const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];

    setMyNickname(effectiveNick);
    setMyAvatar(randomAvatar);

    if (!savedName) {
      localStorage.setItem('SKRIBBL_NICKNAME', effectiveNick);
    }

    const myId = getOrCreateUserId();
    const doJoin = () => {
      currentRoomCodeRef.current = code;
      sessionStorage.setItem('CURRENT_ROOM_CODE', code);
      socket.emit('join_room', {
        roomId: code,
        playerInfo: {
          userId: myId,
          nickname: effectiveNick,
          avatar: randomAvatar,
        },
      });
      // Nettoyer l'URL discrètement sans recharger pour une expérience fluide
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {}
    };

    if (socket.connected) {
      doJoin();
    } else {
      socket.once('connect', doJoin);
    }
  }, []);

  // Empêcher la mise en veille du smartphone pendant les parties & resynchronisation automatique
  useEffect(() => {
    let wakeLockSentinel = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && document.visibilityState === 'visible') {
          wakeLockSentinel = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        // Ignorer si non supporté ou refusé par les paramètres de batterie
      }
    };

    if (view === 'game' || view === 'solo_ai') {
      requestWakeLock();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (view === 'game' || view === 'solo_ai') {
          requestWakeLock();
        }
        // Re-synchronisation immédiate de l'état du salon sans avoir à recharger la page
        const activeCode = currentRoomCodeRef.current || sessionStorage.getItem('CURRENT_ROOM_CODE');
        if (activeCode && socket.connected) {
          socket.emit('reconnect_player', {
            roomId: activeCode,
            userId: getOrCreateUserId(),
            nickname: localStorage.getItem('SKRIBBL_NICKNAME') || 'Artiste',
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, [view]);

  // Écouteurs Socket.io
  useEffect(() => {
    let disconnectTimeout = null;

    socket.on('connect', () => {
      console.log('Connecté au serveur Socket.io avec ID:', socket.id);
      if (disconnectTimeout) {
        clearTimeout(disconnectTimeout);
        disconnectTimeout = null;
      }
      // Reconnexion automatique si on était déjà dans un salon (ex: retour de WhatsApp ou mise en veille)
      const activeCode = currentRoomCodeRef.current || sessionStorage.getItem('CURRENT_ROOM_CODE');
      if (activeCode) {
        const savedNick = localStorage.getItem('SKRIBBL_NICKNAME') || 'Artiste';
        socket.emit('reconnect_player', {
          roomId: activeCode,
          userId: getOrCreateUserId(),
          nickname: savedNick,
        });
      }
    });

    // Auto-récupération sur bug de connexion : si déconnecté pendant plus de 7s en partie active, rafraîchir
    socket.on('disconnect', (reason) => {
      console.warn('Socket déconnecté:', reason);
      const activeCode = currentRoomCodeRef.current || sessionStorage.getItem('CURRENT_ROOM_CODE');
      if (activeCode) {
        if (disconnectTimeout) clearTimeout(disconnectTimeout);
        disconnectTimeout = setTimeout(() => {
          if (!socket.connected) {
            console.log('Connexion interrompue: rafraîchissement automatique pour relancer...');
            window.location.reload();
          }
        }, 7000);
      }
    });

    socket.on('room_created', ({ roomId }) => {
      currentRoomCodeRef.current = roomId;
      sessionStorage.setItem('CURRENT_ROOM_CODE', roomId);
    });

    socket.on('room_state', (state) => {
      setRoom(state);
      setView('game');
      setIsAutoJoining(false);
      setErrorMsg('');
      currentRoomCodeRef.current = state.roomId;
      sessionStorage.setItem('CURRENT_ROOM_CODE', state.roomId);

      // Fermer immédiatement le modal de fin de manche dès que le tour suivant commence
      if (state.state === 'SELECTING_WORD' || state.state === 'DRAWING') {
        setRoundEndData(null);
      }

      if (state.state === 'ROUND_OVER') {
        if (state.secretWord) {
          setSecretWord(state.secretWord);
        }
      }
    });

    socket.on('chat_message', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
      if (msg.type === 'guessed' || msg.type === 'guessed_approx') {
        sound.playCorrect();
      } else if (msg.type === 'close') {
        sound.playClose();
      }
    });

    socket.on('draw_event', (action) => {
      setExternalDrawAction(action);
    });

    socket.on('choose_word_prompt', ({ choices, timeout }) => {
      setWordChoices(choices);
      setRoundEndData(null);
      sound.playPop();
    });

    socket.on('your_secret_word', ({ word }) => {
      setSecretWord(word);
    });

    socket.on('you_guessed_correctly', ({ points }) => {
      sound.playCorrect();
    });

    socket.on('timer_tick', ({ timeRemaining }) => {
      setRoom((prev) => (prev ? { ...prev, timeRemaining } : prev));
      if (timeRemaining <= 10 && timeRemaining > 0) {
        sound.playTick(timeRemaining);
      }
    });

    socket.on('hint_updated', ({ hintMask }) => {
      setRoom((prev) => (prev ? { ...prev, hintMask } : prev));
    });

    socket.on('round_ended', (data) => {
      setSecretWord(data.word);
      setWordChoices([]);
      setRoundEndData(data);
    });

    socket.on('game_over', ({ podium }) => {
      setRoundEndData(null);
      setPodium(podium);
    });

    socket.on('join_error', ({ message }) => {
      setIsAutoJoining(false);
      setErrorMsg(message);
      setView('lobby');
      sound.playClose();
    });

    return () => {
      if (disconnectTimeout) clearTimeout(disconnectTimeout);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room_created');
      socket.off('room_state');
      socket.off('chat_message');
      socket.off('draw_event');
      socket.off('choose_word_prompt');
      socket.off('your_secret_word');
      socket.off('you_guessed_correctly');
      socket.off('timer_tick');
      socket.off('hint_updated');
      socket.off('round_ended');
      socket.off('game_over');
      socket.off('join_error');
    };
  }, []);

  // Actions utilisateur
  const handleCreateRoom = (hostInfo) => {
    const userId = getOrCreateUserId();
    socket.emit('create_room', { ...hostInfo, userId });
  };

  const handleJoinRoom = (roomId, playerInfo) => {
    const userId = getOrCreateUserId();
    currentRoomCodeRef.current = roomId;
    sessionStorage.setItem('CURRENT_ROOM_CODE', roomId);
    socket.emit('join_room', { roomId, playerInfo: { ...playerInfo, userId } });
  };

  const handleStartGame = () => {
    if (room && room.roomId) {
      socket.emit('start_game', { roomId: room.roomId, userId: getOrCreateUserId() });
      sound.playPop();
    }
  };

  const handleSelectWord = (word) => {
    if (room && room.roomId) {
      socket.emit('select_word', { roomId: room.roomId, word });
      setWordChoices([]);
      setSecretWord(word);
    }
  };

  const handleDrawAction = (action) => {
    if (room && room.roomId) {
      socket.emit('draw_action', { roomId: room.roomId, action });
    }
  };

  const handleSendMessage = (text) => {
    if (room && room.roomId) {
      socket.emit('send_chat', { roomId: room.roomId, text });
    }
  };

  const handleLeaveRoom = () => {
    currentRoomCodeRef.current = '';
    sessionStorage.removeItem('CURRENT_ROOM_CODE');
    window.location.href = '/';
  };

  const handleShareLink = async () => {
    if (!room || !room.roomId) return;
    const joinUrl = `${window.location.origin}/?room=${room.roomId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoins ma partie sur LaPlume ! 🪶',
          text: `Clique sur ce lien pour me rejoindre directement dans le salon ${room.roomId} :`,
          url: joinUrl,
        });
        return;
      } catch (err) {
        // L'utilisateur a annulé ou le partage natif a échoué, on passe au presse-papier
      }
    }

    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      sound.playPop();
    } catch (e) {
      // Ignorer
    }
  };

  const handleUpdateProfile = (e) => {
    e?.preventDefault();
    if (!room || !room.roomId) return;
    const cleanNick = myNickname.trim() || 'Artiste';
    localStorage.setItem('SKRIBBL_NICKNAME', cleanNick);
    socket.emit('update_profile', {
      roomId: room.roomId,
      nickname: cleanNick,
      avatar: myAvatar,
    });
    setIsEditingProfile(false);
    sound.playPop();
  };

  // Rendu de la vue appropriée
  return (
    <div className="min-h-screen text-slate-100 p-2 sm:p-4 select-none">
      {/* Toast d'erreur */}
      {errorMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 py-2 px-4 bg-rose-600 text-white rounded-xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-bounce">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="ml-2 font-black">&times;</button>
        </div>
      )}

      {/* Écran de chargement lors de la connexion automatique par lien d'invitation */}
      {isAutoJoining && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center flex flex-col items-center animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-600 flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/30 mb-4 animate-bounce">
              🪶
            </div>
            <h2 className="text-xl font-black text-white mb-1">Connexion au salon...</h2>
            <p className="text-sm text-slate-400 mb-5">
              Code salon : <span className="font-mono font-extrabold text-amber-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">{autoJoinCode}</span>
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 bg-indigo-950/60 px-4 py-2 rounded-xl border border-indigo-500/30">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
              <span>Connexion instantanée en cours...</span>
            </div>
          </div>
        </div>
      )}

      {/* 1. VUE LOBBY / ACCUEIL */}
      {view === 'lobby' && !isAutoJoining && (
        <Lobby
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onStartSoloAI={(cfg) => {
            if (cfg) setSoloConfig(cfg);
            setView('solo_ai');
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          defaultRoomCode={urlRoomCode}
        />
      )}

      {/* 2. VUE DÉFI SOLO IA */}
      {view === 'solo_ai' && (
        <SoloAIMode
          onBack={() => setView('lobby')}
          onOpenSettings={() => setIsSettingsOpen(true)}
          initialCategory={soloConfig.category}
          initialRounds={soloConfig.rounds}
          initialDuration={soloConfig.duration}
        />
      )}

      {/* 3. VUE SALON D'ATTENTE MULTIJOUEUR */}
      {view === 'game' && room && room.state === 'LOBBY' && (
        <div className="max-w-2xl mx-auto py-6 px-4">
          <div className="bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5">
            {/* Entête salon + Boutons d'invitation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs uppercase font-bold text-indigo-400 block">
                  Salon d'attente multijoueur
                </span>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <span>Code :</span>
                  <span className="font-mono text-amber-400 tracking-wider bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                    {room.roomId}
                  </span>
                </h2>
              </div>

              {/* Actions d'invitation directe */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareLink}
                  className="flex-1 sm:flex-none py-2 px-3.5 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                  title="Partager le lien d'invitation directement par SMS, WhatsApp, etc."
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedLink ? 'Lien copié !' : '🔗 Inviter des amis'}</span>
                </button>

                <button
                  onClick={() => setIsQrOpen(true)}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  title="Afficher le QR Code pour smartphone"
                >
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  <span className="hidden sm:inline">QR Code</span>
                </button>
              </div>
            </div>

            {/* Bannière d'invitation en 1 clic */}
            <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex items-center justify-between gap-2 shadow-inner">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-indigo-300 block">
                  Lien d'accès direct (rejoint sans taper de code) :
                </span>
                <span className="text-xs font-mono text-slate-300 truncate block select-all">
                  {typeof window !== 'undefined' ? `${window.location.origin}/?room=${room.roomId}` : ''}
                </span>
              </div>
              <button
                onClick={handleShareLink}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>

            {/* Liste des joueurs dans le salon */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Joueurs prêts ({room.players?.length || 0})
                </span>
                <span>{room.settings?.maxRounds} manches • {room.settings?.roundDuration}s</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {room.players?.map((p) => {
                  const myUserId = getOrCreateUserId();
                  const isMe = (p.userId && p.userId === myUserId) || p.id === socket.id;
                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                        isMe
                          ? 'bg-indigo-950/50 border-indigo-500/60 ring-1 ring-indigo-500/30 shadow-md'
                          : 'bg-slate-800/60 border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl shrink-0">{p.avatar || '🎨'}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-white truncate max-w-[120px]">
                              {p.nickname}
                            </span>
                            {isMe && (
                              <span className="px-1.5 py-0.2 bg-indigo-600 text-white text-[9px] font-black rounded uppercase">
                                Toi
                              </span>
                            )}
                          </div>
                          {isMe && (
                            <button
                              type="button"
                              onClick={() => {
                                setMyNickname(p.nickname);
                                setMyAvatar(p.avatar || '🎨');
                                setIsEditingProfile(true);
                              }}
                              className="text-[10px] text-indigo-300 hover:text-white underline flex items-center gap-0.5 mt-0.5"
                            >
                              <Edit2 className="w-2.5 h-2.5" /> Modifier pseudo / avatar
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {p.isHost && (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-extrabold rounded-md uppercase">
                            Hôte
                          </span>
                        )}
                        {p.isAi && (
                          <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold rounded-md uppercase">
                            Bot IA
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bouton Lancer la partie (Hôte) ou message d'attente */}
            <div className="pt-2">
              {Boolean(
                room && (
                  (room.hostUserId && room.hostUserId === getOrCreateUserId()) ||
                  room.hostId === socket.id ||
                  room.players?.some(p => (p.userId === getOrCreateUserId() || p.id === socket.id) && p.isHost)
                )
              ) ? (
                <button
                  onClick={handleStartGame}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-base rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/20 transition active:scale-98"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Lancer la Partie !</span>
                </button>
              ) : (
                <div className="py-3 px-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-center text-xs font-medium text-slate-400 animate-pulse">
                  En attente que l'hôte lance la partie...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mini-Modale de modification de profil en direct dans le salon */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 text-white relative shadow-2xl">
            <button
              onClick={() => setIsEditingProfile(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Modifier ton profil
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Ton Pseudo
                </label>
                <input
                  type="text"
                  value={myNickname}
                  onChange={(e) => setMyNickname(e.target.value)}
                  maxLength={18}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:border-indigo-500 focus:outline-none"
                  placeholder="Entre ton pseudo..."
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Choisis ton Avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setMyAvatar(av)}
                      className={`text-2xl p-2 rounded-xl transition ${
                        myAvatar === av
                          ? 'bg-indigo-600 scale-110 shadow-lg'
                          : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-600/30"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. VUE EN JEU MULTIJOUEUR */}
      {view === 'game' && room && room.state !== 'LOBBY' && (
        <div
          className="md:relative md:max-w-6xl md:mx-auto md:h-[100dvh] md:overflow-hidden md:p-2.5 flex flex-col"
          style={{
            // Mobile : position fixed couvrant toute la hauteur visible,
            // paddingBottom repousse le contenu au-dessus du clavier
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            paddingBottom: keyboardHeight,
            overflowY: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            padding: `4px 4px ${keyboardHeight}px 4px`,
          }}
        >
          {/* Header de jeu */}
          <div className="shrink-0 mb-1">
            <GameHeader
              roomId={room.roomId}
              currentRound={room.currentRound}
              maxRounds={room.settings?.maxRounds || 3}
              timeRemaining={room.timeRemaining || 0}
              hintMask={room.hintMask}
              secretWord={secretWord}
              isDrawer={room.currentDrawerId === socket.id}
              state={room.state}
              onOpenQR={() => setIsQrOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onLeaveRoom={handleLeaveRoom}
            />
          </div>

          {/* Grille Principale (Joueurs + Canvas + Chat) */}
          <div className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-3 overflow-visible sm:overflow-hidden">
            {/* Colonne Gauche (Desktop uniquement) : Liste des Joueurs */}
            <div className="hidden md:block md:col-span-1 overflow-y-auto">
              <PlayerList
                players={room.players || []}
                currentDrawerId={room.currentDrawerId}
                myId={socket.id}
              />
            </div>

            {/* Colonne Centrale : Canvas & Toolbar */}
            <div className="flex-1 min-h-0 md:col-span-3 lg:col-span-3 flex flex-col overflow-visible sm:overflow-hidden">
              <div ref={canvasContainerRef} className="shrink-0 w-full" style={{ maxHeight: '32vh' }}>
                <Canvas
                  key={`canvas_${room.currentDrawerId}_round_${room.currentRound}`}
                  isDrawer={room.currentDrawerId === socket.id && room.state === 'DRAWING'}
                  activeTool={activeTool}
                  activeColor={activeColor}
                  brushSize={brushSize}
                  onDrawAction={handleDrawAction}
                  onClear={() => handleDrawAction({ type: 'clear' })}
                />
              </div>

              {/* Toolbar : affichée UNIQUEMENT pour le dessinateur pour préserver la visibilité du dessin pour les devineurs sur mobile */}
              {(room.currentDrawerId === socket.id && room.state === 'DRAWING') && (
                <div className="shrink-0 my-1">
                  <Toolbar
                    activeTool={activeTool}
                    setActiveTool={setActiveTool}
                    activeColor={activeColor}
                    setActiveColor={setActiveColor}
                    brushSize={brushSize}
                    setBrushSize={setBrushSize}
                    onUndo={() => handleDrawAction({ type: 'undo' })}
                    onClear={() => {
                      handleDrawAction({ type: 'clear' });
                    }}
                    isDrawer={true}
                  />
                </div>
              )}

              {/* Version Mobile : Onglets [Chat] et [Joueurs] */}
              <div className="md:hidden flex-1 min-h-0 flex flex-col mt-1">
                <div className="flex items-center gap-1 mb-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800 shrink-0">
                  <button
                    onClick={() => setMobileTab('chat')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      mobileTab === 'chat'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>💬 Chat & Propositions</span>
                  </button>
                  <button
                    onClick={() => setMobileTab('players')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      mobileTab === 'players'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>👥 Joueurs ({room.players?.length || 0})</span>
                  </button>
                </div>

                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  {mobileTab === 'chat' ? (
                    <Chat
                      messages={chatMessages}
                      onSendMessage={handleSendMessage}
                      isDrawer={room.currentDrawerId === socket.id && room.state === 'DRAWING'}
                      hasGuessed={room.players?.find((p) => p.id === socket.id || (p.userId && p.userId === getOrCreateUserId()))?.hasGuessed}
                      disabled={room.state !== 'DRAWING'}
                      hintMask={room.hintMask}
                      onScrollToDrawing={scrollToCanvas}
                    />
                  ) : (
                    <div className="flex-1 min-h-0 overflow-y-auto">
                      <PlayerList
                        players={room.players || []}
                        currentDrawerId={room.currentDrawerId}
                        myId={socket.id}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Colonne Droite (Desktop uniquement) : Chat */}
            <div className="hidden md:block md:col-span-4 lg:col-span-1 h-full overflow-hidden">
              <Chat
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                isDrawer={room.currentDrawerId === socket.id && room.state === 'DRAWING'}
                hasGuessed={room.players?.find((p) => p.id === socket.id)?.hasGuessed}
                disabled={room.state !== 'DRAWING'}
                hintMask={room.hintMask}
                onScrollToDrawing={scrollToCanvas}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modale de Choix du Mot pour le dessinateur */}
      {wordChoices.length > 0 && (
        <WordSelector
          choices={wordChoices}
          onSelect={handleSelectWord}
        />
      )}

      {/* Classement Provisoire entre les manches */}
      {roundEndData && (
        <RoundLeaderboardModal
          data={roundEndData}
          onClose={() => setRoundEndData(null)}
          myId={socket.id}
        />
      )}

      {/* Podium de Fin de Partie */}
      {podium && (
        <EndGamePodium
          podium={podium}
          onReturnLobby={() => {
            setPodium(null);
            if (room) {
              setRoom((prev) => ({ ...prev, state: 'LOBBY' }));
            }
          }}
          onLeaveGame={handleLeaveRoom}
        />
      )}

      {/* Modale QR Code Smartphone */}
      <QRCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        roomId={room?.roomId}
      />

      {/* Modale Réglages */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
