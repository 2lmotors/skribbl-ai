import { getRandomWordChoices, normalizeWord, getLevenshteinDistance } from './words.js';
import { guessDrawingWithAI } from './aiGuesser.js';

export class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // roomId -> Room
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(socket, hostInfo = {}) {
    const roomId = this.generateRoomCode();
    const room = {
      id: roomId,
      hostId: socket.id,
      state: 'LOBBY', // LOBBY, SELECTING_WORD, DRAWING, ROUND_OVER, GAME_OVER
      settings: {
        maxRounds: hostInfo.maxRounds || 3,
        roundDuration: hostInfo.roundDuration || 80,
        category: hostInfo.category || 'all',
        customWords: hostInfo.customWords || [],
        enableAiPlayer: !!hostInfo.enableAiPlayer,
      },
      players: new Map(),
      currentRound: 1,
      currentDrawerIndex: 0,
      currentWord: '',
      wordChoices: [],
      hintMask: '',
      timeRemaining: 0,
      timer: null,
      canvasActions: [], // Historique des tracés pour resynchroniser
      chat: [],
      lastImageSnapshot: null,
      aiLastGuessTime: 0,
    };

    this.rooms.set(roomId, room);
    this.addPlayer(roomId, socket, hostInfo, true);
    return room;
  }

  addPlayer(roomId, socket, playerInfo = {}, isHost = false) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = {
      id: socket.id,
      nickname: (playerInfo.nickname || `Joueur ${room.players.size + 1}`).trim().slice(0, 18),
      avatar: playerInfo.avatar || '🎨',
      score: 0,
      roundScore: 0,
      isHost,
      hasGuessed: false,
      isAi: false,
    };

    room.players.set(socket.id, player);
    socket.join(roomId);
    socket.roomId = roomId;

    // Si le bot IA est activé et n'est pas encore dans la liste
    this.checkAndAddAiBot(room);

    this.broadcastRoomState(roomId);
    this.broadcastChat(roomId, {
      sender: 'Système',
      text: `${player.nickname} a rejoint la partie ! 👋`,
      type: 'system',
    });

    return room;
  }

  checkAndAddAiBot(room) {
    const BOT_ID = `bot_${room.id}`;
    if (room.settings.enableAiPlayer && !room.players.has(BOT_ID)) {
      room.players.set(BOT_ID, {
        id: BOT_ID,
        nickname: 'Gemini IA 🤖',
        avatar: '🤖',
        score: 0,
        roundScore: 0,
        isHost: false,
        hasGuessed: false,
        isAi: true,
      });
    } else if (!room.settings.enableAiPlayer && room.players.has(BOT_ID)) {
      room.players.delete(BOT_ID);
    }
  }

  removePlayer(socket) {
    const roomId = socket.roomId;
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (!player) return;

    room.players.delete(socket.id);
    this.broadcastChat(roomId, {
      sender: 'Système',
      text: `${player.nickname} a quitté la partie. 🚪`,
      type: 'system',
    });

    // Nettoyer si plus de vrais joueurs
    const realPlayers = Array.from(room.players.values()).filter(p => !p.isAi);
    if (realPlayers.length === 0) {
      if (room.timer) clearInterval(room.timer);
      this.rooms.delete(roomId);
      return;
    }

    // Réassigner l'hôte si besoin
    if (player.isHost && realPlayers.length > 0) {
      realPlayers[0].isHost = true;
      room.hostId = realPlayers[0].id;
    }

    // Si le joueur qui est parti était le dessinateur en cours
    const playerList = Array.from(room.players.values()).filter(p => !p.isAi);
    const currentDrawer = playerList[room.currentDrawerIndex % playerList.length];
    if (currentDrawer && currentDrawer.id === socket.id && (room.state === 'DRAWING' || room.state === 'SELECTING_WORD')) {
      this.endTurn(roomId, 'Le dessinateur a quitté la partie !');
    } else {
      this.broadcastRoomState(roomId);
    }
  }

  updateSettings(roomId, socketId, newSettings) {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== socketId || room.state !== 'LOBBY') return;

    room.settings = { ...room.settings, ...newSettings };
    this.checkAndAddAiBot(room);
    this.broadcastRoomState(roomId);
  }

  updateProfile(roomId, socketId, { nickname, avatar }) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(socketId);
    if (!player) return;

    if (nickname && typeof nickname === 'string') {
      player.nickname = nickname.trim().slice(0, 18);
    }
    if (avatar && typeof avatar === 'string') {
      player.avatar = avatar;
    }

    this.broadcastRoomState(roomId);
  }

  startGame(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== socketId || room.state !== 'LOBBY') return;

    const activePlayers = Array.from(room.players.values()).filter(p => !p.isAi);
    if (activePlayers.length < 1) return; // Permet de tester même seul !

    // Réinitialiser les scores
    room.players.forEach(p => {
      p.score = 0;
      p.roundScore = 0;
    });

    room.currentRound = 1;
    room.currentDrawerIndex = 0;
    this.startTurn(roomId);
  }

  startTurn(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    if (room.timer) clearInterval(room.timer);

    const activePlayers = Array.from(room.players.values()).filter(p => !p.isAi);
    if (activePlayers.length === 0) return;

    const drawer = activePlayers[room.currentDrawerIndex % activePlayers.length];
    room.currentDrawerId = drawer.id;

    // Réinitialiser l'état du tour
    room.players.forEach(p => {
      p.hasGuessed = false;
      p.roundScore = 0;
    });
    room.canvasActions = [];
    room.lastImageSnapshot = null;
    room.state = 'SELECTING_WORD';
    room.timeRemaining = 15; // 15 secondes pour choisir

    // Mots au choix
    room.wordChoices = getRandomWordChoices(room.settings.category, room.settings.customWords);
    room.currentWord = '';
    room.hintMask = '';

    this.broadcastRoomState(roomId);
    this.io.to(drawer.id).emit('choose_word_prompt', { choices: room.wordChoices, timeout: 15 });

    // Timer de sélection
    room.timer = setInterval(() => {
      room.timeRemaining--;
      if (room.timeRemaining <= 0) {
        clearInterval(room.timer);
        // Choix automatique si non répondu
        const autoWord = room.wordChoices[Math.floor(Math.random() * room.wordChoices.length)];
        this.confirmWordChoice(roomId, drawer.id, autoWord);
      } else {
        this.io.to(roomId).emit('timer_tick', { timeRemaining: room.timeRemaining });
      }
    }, 1000);
  }

  confirmWordChoice(roomId, socketId, word) {
    const room = this.rooms.get(roomId);
    if (!room || room.currentDrawerId !== socketId || room.state !== 'SELECTING_WORD') return;

    if (room.timer) clearInterval(room.timer);

    room.currentWord = word;
    room.state = 'DRAWING';
    room.timeRemaining = room.settings.roundDuration;
    room.hintMask = this.generateHintMask(word, 0);

    this.broadcastRoomState(roomId);
    this.broadcastChat(roomId, {
      sender: 'Système',
      text: `${room.players.get(socketId)?.nickname} est en train de dessiner ! 🎨`,
      type: 'system',
    });

    // Timer de dessin
    room.timer = setInterval(() => {
      room.timeRemaining--;

      // Révéler des indices au fil du chrono
      const halfTime = Math.floor(room.settings.roundDuration / 2);
      const quarterTime = Math.floor(room.settings.roundDuration / 4);

      if (room.timeRemaining === halfTime) {
        room.hintMask = this.generateHintMask(room.currentWord, 1);
        this.io.to(roomId).emit('hint_updated', { hintMask: room.hintMask });
      } else if (room.timeRemaining === quarterTime) {
        room.hintMask = this.generateHintMask(room.currentWord, 2);
        this.io.to(roomId).emit('hint_updated', { hintMask: room.hintMask });
      }

      this.io.to(roomId).emit('timer_tick', { timeRemaining: room.timeRemaining });

      // Si le bot IA participe, tenter une devinette
      if (room.settings.enableAiPlayer && room.lastImageSnapshot && room.timeRemaining % 7 === 0) {
        this.triggerAiBotGuess(room);
      }

      if (room.timeRemaining <= 0) {
        clearInterval(room.timer);
        this.endTurn(roomId, 'Temps écoulé !');
      }
    }, 1000);
  }

  async triggerAiBotGuess(room) {
    const BOT_ID = `bot_${room.id}`;
    const bot = room.players.get(BOT_ID);
    if (!bot || bot.hasGuessed || !room.lastImageSnapshot) return;

    try {
      const result = await guessDrawingWithAI({
        imageBase64: room.lastImageSnapshot,
        currentWord: room.currentWord,
        apiKey: process.env.GEMINI_API_KEY,
      });

      if (result && result.guesses) {
        for (const guess of result.guesses) {
          const match = normalizeWord(guess) === normalizeWord(room.currentWord);
          if (match) {
            this.handleChatMessage(room.id, BOT_ID, guess);
            break;
          } else {
            // Afficher une tentative du bot dans le chat
            this.handleChatMessage(room.id, BOT_ID, guess);
          }
        }
      }
    } catch (e) {
      // Ignorer silencieusement pour le bot
    }
  }

  generateHintMask(word, revealCount = 0) {
    const chars = Array.from(word);
    const lettersIndices = [];
    
    chars.forEach((c, idx) => {
      if (c !== ' ' && c !== '-') lettersIndices.push(idx);
    });

    const revealedSet = new Set();
    const countToReveal = Math.min(revealCount, Math.floor(lettersIndices.length / 2));
    
    for (let i = 0; i < countToReveal; i++) {
      const targetIndex = lettersIndices[(i * 3 + 1) % lettersIndices.length];
      revealedSet.add(targetIndex);
    }

    return chars.map((c, idx) => {
      if (c === ' ') return '  ';
      if (c === '-') return '-';
      if (revealedSet.has(idx)) return c.toUpperCase();
      return '_';
    }).join(' ');
  }

  handleDrawAction(roomId, socketId, action) {
    const room = this.rooms.get(roomId);
    if (!room || room.state !== 'DRAWING' || room.currentDrawerId !== socketId) return;

    if (action.type === 'clear') {
      room.canvasActions = [];
    } else {
      room.canvasActions.push(action);
    }

    // Sauvegarder la dernière capture pour l'IA si envoyée
    if (action.snapshot) {
      room.lastImageSnapshot = action.snapshot;
    }

    // Retransmission instantanée aux autres joueurs du salon
    this.io.to(roomId).emit('draw_event', action);
  }

  handleChatMessage(roomId, socketId, rawText) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(socketId);
    if (!player) return;

    const text = (rawText || '').trim();
    if (!text) return;

    // Si on est en phase de jeu (DRAWING)
    if (room.state === 'DRAWING') {
      const isDrawer = room.currentDrawerId === socketId;

      // Le dessinateur ne peut pas écrire le mot secret
      if (isDrawer) {
        if (normalizeWord(text).includes(normalizeWord(room.currentWord))) {
          this.io.to(socketId).emit('chat_message', {
            sender: 'Système',
            text: 'Ne donnez pas d\'indice sur le mot ! 🤫',
            type: 'system',
          });
          return;
        }
      }

      // Si le joueur a déjà trouvé le mot
      if (player.hasGuessed) {
        // Message réservé aux autres joueurs ayant déjà trouvé
        this.io.to(roomId).emit('chat_message', {
          sender: player.nickname,
          text,
          type: 'guessed_chat',
        });
        return;
      }

      // Vérification de la réponse
      const normalizedGuess = normalizeWord(text);
      const normalizedSecret = normalizeWord(room.currentWord);

      if (normalizedGuess === normalizedSecret && !isDrawer) {
        // Bonne réponse !
        player.hasGuessed = true;

        // Calcul des points basé sur la rapidité
        const timeRatio = Math.max(0.1, room.timeRemaining / room.settings.roundDuration);
        const guesserPoints = Math.round(100 + timeRatio * 400);
        const drawerPoints = Math.round(guesserPoints * 0.35);

        player.score += guesserPoints;
        player.roundScore = guesserPoints;

        // Points pour le dessinateur
        const drawer = room.players.get(room.currentDrawerId);
        if (drawer) {
          drawer.score += drawerPoints;
          drawer.roundScore = (drawer.roundScore || 0) + drawerPoints;
        }

        // Notification générale de réussite
        this.broadcastChat(roomId, {
          sender: 'Système',
          text: `🎉 ${player.nickname} a trouvé le mot ! (+${guesserPoints} pts)`,
          type: 'guessed',
        });

        this.io.to(socketId).emit('you_guessed_correctly', { points: guesserPoints });
        this.broadcastRoomState(roomId);

        // Vérifier si tous les devineurs ont trouvé
        const guessers = Array.from(room.players.values()).filter(
          p => p.id !== room.currentDrawerId && !p.isAi
        );
        const allGuessed = guessers.length > 0 && guessers.every(p => p.hasGuessed);

        if (allGuessed) {
          if (room.timer) clearInterval(room.timer);
          this.endTurn(roomId, 'Tous les joueurs ont trouvé ! 🏆');
        }
        return;
      }

      // Détection de proximité ("Tu chauffes !")
      const distance = getLevenshteinDistance(normalizedGuess, normalizedSecret);
      if (distance === 1 && !isDrawer) {
        this.io.to(socketId).emit('chat_message', {
          sender: 'Système',
          text: `"${text}" est très proche ! 🔥`,
          type: 'close',
        });
        return;
      }
    }

    // Message de chat normal
    this.broadcastChat(roomId, {
      sender: player.nickname,
      text,
      type: 'chat',
    });
  }

  endTurn(roomId, reason = '') {
    const room = this.rooms.get(roomId);
    if (!room) return;

    if (room.timer) clearInterval(room.timer);

    room.state = 'ROUND_OVER';
    this.broadcastRoomState(roomId);

    const drawer = room.players.get(room.currentDrawerId);
    const sortedLeaderboard = Array.from(room.players.values())
      .map(p => ({
        id: p.id,
        nickname: p.nickname,
        avatar: p.avatar,
        roundScore: p.roundScore || 0,
        score: p.score,
        hasGuessed: p.hasGuessed,
        isDrawer: p.id === room.currentDrawerId,
        isAi: p.isAi,
      }))
      .sort((a, b) => b.score - a.score);

    this.broadcastChat(roomId, {
      sender: 'Système',
      text: `${reason} Le mot était : "${room.currentWord.toUpperCase()}".`,
      type: 'system',
    });

    this.io.to(roomId).emit('round_ended', {
      word: room.currentWord,
      reason,
      drawerNickname: drawer?.nickname || 'Inconnu',
      drawerAvatar: drawer?.avatar || '🎨',
      leaderboard: sortedLeaderboard,
      currentRound: room.currentRound,
      maxRounds: room.settings.maxRounds,
      delaySeconds: 6,
    });

    // Passer au tour suivant après 6.5 secondes pour afficher le classement provisoire
    setTimeout(() => {
      const activePlayers = Array.from(room.players.values()).filter(p => !p.isAi);
      if (activePlayers.length === 0) return;

      room.currentDrawerIndex++;

      // Fin d'un round complet si tous les joueurs ont dessiné
      if (room.currentDrawerIndex >= activePlayers.length) {
        room.currentDrawerIndex = 0;
        room.currentRound++;

        if (room.currentRound > room.settings.maxRounds) {
          this.endGame(roomId);
          return;
        }
      }

      this.startTurn(roomId);
    }, 4500);
  }

  endGame(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.state = 'GAME_OVER';
    const rankedPlayers = Array.from(room.players.values())
      .filter(p => !p.isAi)
      .sort((a, b) => b.score - a.score);

    this.broadcastRoomState(roomId);
    this.io.to(roomId).emit('game_over', { podium: rankedPlayers });

    // Retour au lobby après 12 secondes
    setTimeout(() => {
      if (this.rooms.has(roomId)) {
        room.state = 'LOBBY';
        this.broadcastRoomState(roomId);
      }
    }, 12000);
  }

  broadcastRoomState(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const sanitizedPlayers = Array.from(room.players.values()).map(p => ({
      id: p.id,
      nickname: p.nickname,
      avatar: p.avatar,
      score: p.score,
      isHost: p.isHost,
      hasGuessed: p.hasGuessed,
      isAi: p.isAi,
    }));

    // Cacher le mot aux joueurs qui ne sont pas le dessinateur
    this.io.to(roomId).emit('room_state', {
      roomId: room.id,
      state: room.state,
      hostId: room.hostId,
      settings: room.settings,
      players: sanitizedPlayers,
      currentRound: room.currentRound,
      currentDrawerId: room.currentDrawerId,
      hintMask: room.hintMask,
      timeRemaining: room.timeRemaining,
      // Le mot complet n'est envoyé qu'au dessinateur ou en fin de manche
      secretWord: room.state === 'ROUND_OVER' || room.state === 'GAME_OVER' ? room.currentWord : undefined,
    });

    // Envoyer le mot secret en privé au dessinateur
    if (room.currentDrawerId && room.state === 'DRAWING') {
      this.io.to(room.currentDrawerId).emit('your_secret_word', { word: room.currentWord });
    }
  }

  broadcastChat(roomId, message) {
    this.io.to(roomId).emit('chat_message', message);
  }
}
