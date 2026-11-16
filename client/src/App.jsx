import React, { useState, useEffect } from 'react';
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
import { Play, Copy, Check, Users } from 'lucide-react';

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

  // Modales
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Code de salon dans l'URL (ex: ?room=ABC123)
  const [urlRoomCode, setUrlRoomCode] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('room');
    if (code) {
      setUrlRoomCode(code.toUpperCase());
    }
  }, []);

  // Écouteurs Socket.io
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connecté au serveur Socket.io avec ID:', socket.id);
    });

    socket.on('room_created', ({ roomId }) => {
      // Salon créé, on attend le premier room_state
    });

    socket.on('room_state', (state) => {
      setRoom(state);
      setView('game');
      setErrorMsg('');

      if (state.state === 'ROUND_OVER') {
        if (state.secretWord) {
          setSecretWord(state.secretWord);
        }
      }
    });

    socket.on('chat_message', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
      if (msg.type === 'guessed') {
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
      setErrorMsg(message);
      sound.playClose();
    });

    return () => {
      socket.off('connect');
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
    socket.emit('create_room', hostInfo);
  };

  const handleJoinRoom = (roomId, playerInfo) => {
    socket.emit('join_room', { roomId, playerInfo });
  };

  const handleStartGame = () => {
    if (room && room.roomId) {
      socket.emit('start_game', { roomId: room.roomId });
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
    window.location.href = '/';
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

      {/* 1. VUE LOBBY / ACCUEIL */}
      {view === 'lobby' && (
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
          <div className="bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs uppercase font-bold text-indigo-400 block">
                  Salon d'attente
                </span>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <span>Code :</span>
                  <span className="font-mono text-amber-400 tracking-wider bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                    {room.roomId}
                  </span>
                </h2>
              </div>

              <button
                onClick={() => setIsQrOpen(true)}
                className="py-2 px-3 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                📱 QR Code Smartphone
              </button>
            </div>

            {/* Liste des joueurs dans le salon */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  Joueurs prêts ({room.players?.length || 0})
                </span>
                <span>{room.settings?.maxRounds} manches • {room.settings?.roundDuration}s</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {room.players?.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-800/60 border border-slate-700 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{p.avatar || '🎨'}</span>
                      <span className="font-bold text-sm text-white truncate max-w-[140px]">
                        {p.nickname}
                      </span>
                    </div>
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
                ))}
              </div>
            </div>

            {/* Bouton Lancer la partie (Hôte) ou message d'attente */}
            <div className="pt-2">
              {room.hostId === socket.id ? (
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

      {/* 4. VUE EN JEU MULTIJOUEUR */}
      {view === 'game' && room && room.state !== 'LOBBY' && (
        <div className="h-[100dvh] max-h-[100dvh] w-full max-w-6xl mx-auto flex flex-col justify-between overflow-hidden p-1 sm:p-2.5">
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
          <div className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 overflow-hidden">
            {/* Colonne Gauche (Desktop uniquement) : Liste des Joueurs */}
            <div className="hidden md:block md:col-span-1 overflow-y-auto">
              <PlayerList
                players={room.players || []}
                currentDrawerId={room.currentDrawerId}
                myId={socket.id}
              />
            </div>

            {/* Colonne Centrale : Canvas & Toolbar */}
            <div className="flex-1 min-h-0 md:col-span-3 lg:col-span-3 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 min-h-0 max-h-[46vh] sm:max-h-[58vh] flex items-center justify-center">
                <Canvas
                  isDrawer={room.currentDrawerId === socket.id && room.state === 'DRAWING'}
                  activeTool={activeTool}
                  activeColor={activeColor}
                  brushSize={brushSize}
                  onDrawAction={handleDrawAction}
                  externalAction={externalDrawAction}
                />
              </div>

              <div className="shrink-0 my-1">
                <Toolbar
                  activeTool={activeTool}
                  setActiveTool={setActiveTool}
                  activeColor={activeColor}
                  setActiveColor={setActiveColor}
                  brushSize={brushSize}
                  setBrushSize={setBrushSize}
                  onUndo={() => {}}
                  onClear={() => {
                    handleDrawAction({ type: 'clear' });
                  }}
                  isDrawer={room.currentDrawerId === socket.id && room.state === 'DRAWING'}
                />
              </div>

              {/* Version Mobile : Onglets [Chat] et [Joueurs] pour tout garder sur 1 seul écran */}
              <div className="md:hidden flex-1 min-h-[140px] max-h-[30vh] flex flex-col overflow-hidden">
                <div className="flex items-center gap-1 mb-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                  <button
                    onClick={() => setMobileTab('chat')}
                    className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      mobileTab === 'chat'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>💬 Chat & Réponses</span>
                  </button>
                  <button
                    onClick={() => setMobileTab('players')}
                    className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      mobileTab === 'players'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>👥 Joueurs ({room.players?.length || 0})</span>
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden">
                  {mobileTab === 'chat' ? (
                    <Chat
                      messages={chatMessages}
                      onSendMessage={handleSendMessage}
                      isDrawer={room.currentDrawerId === socket.id && room.state === 'DRAWING'}
                      hasGuessed={room.players?.find((p) => p.id === socket.id)?.hasGuessed}
                      disabled={room.state !== 'DRAWING'}
                    />
                  ) : (
                    <div className="h-full overflow-y-auto">
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
            setView('lobby');
          }}
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
