import { getRandomWordChoices, checkWordMatch, isWordMatch, normalizeStrict, normalizeLoose, getLevenshteinDistance } from './words.js';
import { guessDrawingWithAI, detectTextInDrawing } from './aiGuesser.js';

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
    const userId = hostInfo.userId || socket.id;
    const room = {
      id: roomId,
      hostId: socket.id,
      hostUserId: userId,
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
      emptyRoomTimeout: null,
      drawerReconnectTimeout: null,
      usedWords: new Set(),
      messageRateLimits: new Map(),
    };

    this.rooms.set(roomId, room);
    this.addPlayer(roomId, socket, { ...hostInfo, userId }, true);
    return room;
  }

  addPlayer(roomId, socket, playerInfo = {}, isHost = false) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const userId = playerInfo.userId || socket.id;

    // Si un délai de suppression du salon était armé, l'annuler
    if (room.emptyRoomTimeout) {
      clearTimeout(room.emptyRoomTimeout);
      room.emptyRoomTimeout = null;
    }

    // Vérifier si un joueur avec ce userId existe déjà (reconnexion après WhatsApp/verrouillage)
    let existingPlayer = null;
    for (const [key, p] of room.players.entries()) {
      if (p.userId && p.userId === userId) {
        existingPlayer = p;
        if (key !== socket.id) {
          room.players.delete(key);
        }
        break;
      }
    }

    if (existingPlayer) {
      const prevSocketId = existingPlayer.id;
      existingPlayer.id = socket.id;
      existingPlayer.connected = true;
      if (playerInfo.nickname) existingPlayer.nickname = playerInfo.nickname.trim().slice(0, 18);
      if (playerInfo.avatar) existingPlayer.avatar = playerInfo.avatar;

      if (isHost || room.hostUserId === userId) {
        existingPlayer.isHost = true;
        room.hostId = socket.id;
        room.hostUserId = userId;
      }

      // Si ce joueur était le dessinateur en cours, annuler le délai de déconnexion et réassigner son ID
      if (room.currentDrawerId === prevSocketId || room.currentDrawerId === existingPlayer.id) {
        if (room.drawerReconnectTimeout) {
          clearTimeout(room.drawerReconnectTimeout);
          room.drawerReconnectTimeout = null;
        }
        room.currentDrawerId = socket.id;
      }

      room.players.set(socket.id, existingPlayer);
      socket.join(roomId);
      socket.roomId = roomId;

      // Si le joueur réintégré est le dessinateur pendant le tour de dessin, lui renvoyer discrètement son mot
      if (room.currentDrawerId === socket.id && room.state === 'DRAWING' && room.currentWord) {
        socket.emit('your_secret_word', { word: room.currentWord });
      }

      // Renvoyer l'historique complet du tableau pour resynchroniser instantanément son écran sans perte de paquets
      if (room.canvasActions && room.canvasActions.length > 0) {
        socket.emit('draw_history', room.canvasActions);
      }

      this.checkAndAddAiBot(room);
      this.broadcastRoomState(roomId);

      this.broadcastChat(roomId, {
        sender: 'Système',
        text: `${existingPlayer.nickname} est de retour ! 👋`,
        type: 'player_join',
      });

      return room;
    }

    const player = {
      id: socket.id,
      userId,
      nickname: (playerInfo.nickname || `Joueur ${room.players.size + 1}`).trim().slice(0, 18),
      avatar: playerInfo.avatar || '🎨',
      score: 0,
      roundScore: 0,
      isHost: isHost || room.hostUserId === userId,
      hasGuessed: false,
      isAi: false,
      connected: true,
    };

    if (player.isHost) {
      room.hostId = socket.id;
      room.hostUserId = userId;
    }

    room.players.set(socket.id, player);
    socket.join(roomId);
    socket.roomId = roomId;

    // Si la partie est déjà en cours et qu'il y a un dessin, l'envoyer immédiatement au nouveau joueur
    if (room.canvasActions && room.canvasActions.length > 0) {
      socket.emit('draw_history', room.canvasActions);
    }

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
        userId: BOT_ID,
        nickname: 'Gemini IA 🤖',
        avatar: '🤖',
        score: 0,
        roundScore: 0,
        isHost: false,
        hasGuessed: false,
        isAi: true,
        connected: true,
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

    // Marquer comme déconnecté sans supprimer immédiatement pour supporter la mise en veille / WhatsApp
    player.connected = false;
    player.disconnectedAt = Date.now();

    // Message bleu alertant immédiatement les autres joueurs
    this.broadcastChat(roomId, {
      sender: 'Système',
      text: `Le joueur ${player.nickname} a quitté la partie`,
      type: 'player_leave',
    });

    // Vérifier s'il reste des vrais joueurs connectés
    const connectedRealPlayers = Array.from(room.players.values()).filter(p => !p.isAi && p.connected !== false);

    if (connectedRealPlayers.length === 0) {
      // Aucun joueur actif en ce moment (ex: l'hôte est sur WhatsApp pour envoyer le lien d'invitation)
      // On garde le salon bien vivant pendant 10 minutes !
      if (room.emptyRoomTimeout) clearTimeout(room.emptyRoomTimeout);
      room.emptyRoomTimeout = setTimeout(() => {
        const stillConnected = Array.from(room.players.values()).filter(p => !p.isAi && p.connected !== false);
        if (stillConnected.length === 0) {
          if (room.timer) clearInterval(room.timer);
          this.rooms.delete(roomId);
          console.log(`[RoomManager] Salon ${roomId} libéré après inactivité prolongée.`);
        }
      }, 10 * 60 * 1000);
      return;
    }

    // Réassigner l'hôte si l'hôte est déconnecté et qu'il reste d'autres vrais joueurs connectés
    if (player.isHost && connectedRealPlayers.length > 0) {
      connectedRealPlayers[0].isHost = true;
      room.hostId = connectedRealPlayers[0].id;
      room.hostUserId = connectedRealPlayers[0].userId;
    }

    // Si le joueur qui s'est déconnecté était le dessinateur en cours :
    // On offre une période de grâce de 20 secondes pour lui permettre de revenir sans perdre son tour !
    if (room.currentDrawerId === socket.id && (room.state === 'DRAWING' || room.state === 'SELECTING_WORD')) {
      if (room.drawerReconnectTimeout) clearTimeout(room.drawerReconnectTimeout);
      room.drawerReconnectTimeout = setTimeout(() => {
        const d = room.players.get(socket.id);
        if (!d || d.connected === false) {
          this.endTurn(roomId, 'Le dessinateur a perdu sa connexion.');
        }
      }, 20000);
    }

    this.broadcastRoomState(roomId);
  }

  updateSettings(roomId, socketId, newSettings) {
    const room = this.rooms.get(roomId);
    if (!room || room.state !== 'LOBBY') return;
    if (room.hostId !== socketId && room.hostUserId !== newSettings.userId) return;

    room.settings = { ...room.settings, ...newSettings };
    this.checkAndAddAiBot(room);
    this.broadcastRoomState(roomId);
  }

  updateProfile(roomId, socketId, { nickname, avatar, userId }) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    let player = room.players.get(socketId);
    if (!player && userId) {
      for (const p of room.players.values()) {
        if (p.userId === userId) {
          player = p;
          break;
        }
      }
    }
    if (!player) return;

    if (nickname && typeof nickname === 'string') {
      player.nickname = nickname.trim().slice(0, 18);
    }
    if (avatar && typeof avatar === 'string') {
      player.avatar = avatar;
    }

    this.broadcastRoomState(roomId);
  }

  startGame(roomId, socketId, userId) {
    const room = this.rooms.get(roomId);
    if (!room || room.state !== 'LOBBY') return;
    if (room.hostId !== socketId && room.hostUserId !== userId) return;

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
    room.antiCheatLastCheck = 0;
    room.antiCheatLastPenalty = 0;
    room.antiCheatInProgress = false;
    room.state = 'SELECTING_WORD';
    room.timeRemaining = 20; // 20 secondes pour choisir

    // Effacer immédiatement le dessin chez tous les joueurs pour le nouveau tour
    this.io.to(roomId).emit('draw_event', { type: 'clear' });

    // Mots au choix sans répétition
    room.wordChoices = getRandomWordChoices(room.settings.category, room.settings.customWords, room.usedWords);
    room.currentWord = '';
    room.hintMask = '';

    this.broadcastRoomState(roomId);
    this.io.to(drawer.id).emit('choose_word_prompt', { choices: room.wordChoices, timeout: 20 });

    // Timer de sélection
    room.timer = setInterval(() => {
      room.timeRemaining--;
      if (room.timeRemaining <= 0) {
        clearInterval(room.timer);
        // Choix automatique si non répondu
        const autoWord = room.wordChoices[Math.floor(Math.random() * room.wordChoices.length)];
        this.confirmWordChoice(roomId, drawer.id, autoWord, drawer.userId);
      } else {
        this.io.to(roomId).emit('timer_tick', { timeRemaining: room.timeRemaining });
      }
    }, 1000);
  }

  confirmWordChoice(roomId, socketId, word, userId = null) {
    const room = this.rooms.get(roomId);
    if (!room || room.state !== 'SELECTING_WORD') return;

    const currentDrawer = room.players.get(room.currentDrawerId);
    const isSameSocket = room.currentDrawerId === socketId;
    const isSameUser = Boolean(userId && currentDrawer && currentDrawer.userId === userId);
    if (!isSameSocket && !isSameUser) return;

    const activeDrawerId = isSameSocket ? socketId : currentDrawer.id;

    if (room.timer) clearInterval(room.timer);

    // Garantir que le mot retenu fait bien partie des 3 propositions du tour
    const chosenWord = (room.wordChoices && room.wordChoices.includes(word))
      ? word
      : (room.wordChoices?.[0] || word);

    room.currentWord = chosenWord;
    if (room.usedWords && chosenWord) {
      room.usedWords.add(normalizeStrict(chosenWord));
    }
    room.state = 'DRAWING';
    room.timeRemaining = room.settings.roundDuration;
    room.hintMask = this.generateHintMask(chosenWord, 0);

    // Effacer à nouveau pour être certain que la toile est vierge pour le nouveau mot
    this.io.to(roomId).emit('draw_event', { type: 'clear' });

    // Synchroniser impérativement le mot secret exact côté dessinateur
    this.io.to(activeDrawerId).emit('your_secret_word', { word: chosenWord });

    this.broadcastRoomState(roomId);
    this.broadcastChat(roomId, {
      sender: 'Système',
      text: `${room.players.get(activeDrawerId)?.nickname} est en train de dessiner ! 🎨`,
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

      // Anti-triche visuel : détection de lettres ou mots sur le dessin toutes les 4s
      if (room.lastImageSnapshot && room.canvasActions.length >= 2 && room.timeRemaining % 4 === 0) {
        this.checkAntiCheatDrawing(room);
      }

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

  async checkAntiCheatDrawing(room) {
    if (!room || room.state !== 'DRAWING' || !room.lastImageSnapshot || room.antiCheatInProgress) return;
    const now = Date.now();
    // Cooldown 15s après une pénalité pour laisser le temps d'effacer sans double sanction immédiate
    if (room.antiCheatLastPenalty && now - room.antiCheatLastPenalty < 15000) return;
    if (room.antiCheatLastCheck && now - room.antiCheatLastCheck < 3500) return;

    room.antiCheatInProgress = true;
    room.antiCheatLastCheck = now;

    try {
      const result = await detectTextInDrawing({
        imageBase64: room.lastImageSnapshot,
        secretWord: room.currentWord,
        apiKey: process.env.GEMINI_API_KEY,
      });

      if (result.hasText && room.state === 'DRAWING') {
        room.antiCheatLastPenalty = Date.now();
        const drawer = room.players.get(room.currentDrawerId);
        if (drawer) {
          drawer.score -= 100;
          drawer.roundScore = (drawer.roundScore || 0) - 100;
        }

        // Avertissement direct au dessinateur
        this.io.to(room.currentDrawerId).emit('anti_cheat_warning', {
          message: 'des lettres ou un mot ont était detecté sur votre dessin une penalitée de -100 point vous sera soumise',
          detectedText: result.detectedText || '',
          penalty: 100,
        });

        // Message dans le chat pour informer la table et mise à jour des scores
        this.broadcastChat(room.id, {
          sender: 'Anti-triche',
          text: `🚨 Anti-triche : Des lettres ou un mot ont été détectés sur le dessin de ${drawer?.nickname || 'le dessinateur'} ! (-100 pts)`,
          type: 'system',
        });

        this.broadcastRoomState(room.id);
      }
    } catch (e) {
      // Ignorer silencieusement en cas d'erreur réseau
    } finally {
      room.antiCheatInProgress = false;
    }
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
    } else if (action.type === 'undo') {
      // Retirer le dernier tracé, forme ou remplissage de l'historique
      let lastStartIndex = -1;
      for (let i = room.canvasActions.length - 1; i >= 0; i--) {
        const actType = room.canvasActions[i].type;
        if (actType === 'start' || actType === 'shape' || actType === 'fill') {
          lastStartIndex = i;
          break;
        }
      }
      if (lastStartIndex !== -1) {
        room.canvasActions.splice(lastStartIndex);
      } else if (room.canvasActions.length > 0) {
        room.canvasActions.pop();
      }

      // Diffuser l'historique mis à jour à TOUS les joueurs du salon (dessinateur + concurrents)
      // Garantit 100% d'effacement synchrone sur tous les écrans
      this.io.to(roomId).emit('draw_history', room.canvasActions);
      return;
    } else if (action.type === 'shape_preview') {
      // Prévisualisation temporaire de forme en direct (déplacement / mise à l'échelle) :
      // On retransmet aux autres joueurs pour qu'ils voient la forme bouger en direct, sans polluer l'historique permanent
      this.io.to(roomId).emit('draw_event', action);
      return;
    } else if (action.type === 'snapshot') {
      // Capture d'image pour l'anti-triche / IA : ne pas diffuser ni stocker dans l'historique des traits
      if (action.snapshot) {
        room.lastImageSnapshot = action.snapshot;
      }
      return;
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

    // Anti-triche 1 : Rate limiting des propositions pour contrer les bots / spam
    const now = Date.now();
    if (!room.messageRateLimits) room.messageRateLimits = new Map();
    const timestamps = (room.messageRateLimits.get(socketId) || []).filter(t => now - t < 1500);
    if (timestamps.length >= 3) {
      this.io.to(socketId).emit('chat_message', {
        sender: 'Système',
        text: 'Doucement sur les propositions ! (Anti-triche / anti-spam) ⏳',
        type: 'system',
      });
      return;
    }
    timestamps.push(now);
    room.messageRateLimits.set(socketId, timestamps);

    // Si on est en phase de jeu (DRAWING)
    if (room.state === 'DRAWING') {
      const isDrawer = room.currentDrawerId === socketId;

      // Anti-triche 2 : Le dessinateur ne peut pas écrire le mot secret ni une sous-partie
      if (isDrawer && room.currentWord) {
        const strictText = normalizeStrict(text);
        const strictSecret = normalizeStrict(room.currentWord);
        const tokens = strictSecret.split(/[^a-z0-9]/).filter(t => t.length >= 3);
        const leaksSecret = strictText.includes(strictSecret) || tokens.some(t => strictText.includes(t));

        if (leaksSecret) {
          this.io.to(socketId).emit('chat_message', {
            sender: 'Système',
            text: 'Ne donnez pas d\'indice sur le mot secret dans le chat ! 🤫 (Anti-triche)',
            type: 'system',
          });
          return;
        }
      }

      // Si le joueur a déjà trouvé le mot : message visible UNIQUEMENT par ceux qui ont déjà trouvé + le dessinateur
      if (player.hasGuessed) {
        room.players.forEach((p) => {
          if ((p.hasGuessed || p.id === room.currentDrawerId) && !p.isAi) {
            this.io.to(p.id).emit('chat_message', {
              sender: player.nickname,
              text,
              type: 'guessed_chat',
            });
          }
        });
        return;
      }

      // Vérification intelligente de la réponse (exacte OU approximative / faute d'orthographe / singulier-pluriel)
      const matchResult = checkWordMatch(text, room.currentWord);
      if (matchResult.match && !isDrawer) {
        // Bonne réponse acceptée !
        player.hasGuessed = true;

        // Calcul des points basé sur la rapidité
        const timeRatio = Math.max(0.1, room.timeRemaining / room.settings.roundDuration);
        const baseGuesserPoints = Math.round(100 + timeRatio * 400);
        let guesserPoints = baseGuesserPoints;
        let drawerPoints = Math.round(baseGuesserPoints * 0.35);
        const isExact = matchResult.exact;

        // RÈGLE PÉNALITÉ / BONUS :
        // Si mot trouvé mais mal orthographié (ex: cangourou au lieu de kangourou, bote au lieu de botte, singulier au lieu de pluriel):
        // On déduit 20 points au joueur qui a deviné, et on ajoute ces 20 points au dessinateur en bonus !
        if (!isExact) {
          guesserPoints = Math.max(10, baseGuesserPoints - 20);
          drawerPoints += 20;
        }

        player.score += guesserPoints;
        player.roundScore = guesserPoints;

        // Points pour le dessinateur
        const drawer = room.players.get(room.currentDrawerId);
        if (drawer) {
          drawer.score += drawerPoints;
          drawer.roundScore = (drawer.roundScore || 0) + drawerPoints;
        }

        // Notification générale adaptée
        if (isExact) {
          this.broadcastChat(roomId, {
            sender: 'Système',
            text: `🎉 ${player.nickname} a trouvé le mot ! (+${guesserPoints} pts)`,
            type: 'guessed',
          });
        } else {
          this.broadcastChat(roomId, {
            sender: 'Système',
            text: `🎉 ${player.nickname} a trouvé ! (Orthographe imprécise : -20 pts | +20 pts bonus pour le dessinateur 🎁)`,
            type: 'guessed_approx',
          });
        }

        this.io.to(socketId).emit('you_guessed_correctly', { points: guesserPoints, isExact });
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
      const distance = getLevenshteinDistance(text, room.currentWord);
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
      delaySeconds: 3,
    });

    // Passer au tour suivant après 3.5 secondes pour un enchaînement dynamique
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
    }, 3500);
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
      userId: p.userId,
      nickname: p.nickname,
      avatar: p.avatar,
      score: p.score,
      isHost: p.isHost,
      hasGuessed: p.hasGuessed,
      isAi: p.isAi,
      connected: p.connected !== false,
    }));

    // Cacher le mot aux joueurs qui ne sont pas le dessinateur
    this.io.to(roomId).emit('room_state', {
      roomId: room.id,
      state: room.state,
      hostId: room.hostId,
      hostUserId: room.hostUserId,
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
