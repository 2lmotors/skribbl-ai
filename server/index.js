import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { RoomManager } from './game/RoomManager.js';
import { guessDrawingWithAI } from './game/aiGuesser.js';
import { WORD_CATEGORIES } from './game/words.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Détection de l'adresse IP locale Wi-Fi / Réseau pour les smartphones
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Filtrer les adresses IPv4 internes (127.0.0.1) et les passerelles virtuelles
      if (iface.family === 'IPv4' && !iface.internal) {
        if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.') || iface.address.startsWith('172.')) {
          return iface.address;
        }
      }
    }
  }
  return 'localhost';
}

const PORT = process.env.PORT || 3000;
const LOCAL_IP = getLocalIpAddress();

// Configuration Socket.io avec support CORS tous domaines pour faciliter l'accès mobile et web
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  maxHttpBufferSize: 5e6, // 5MB pour les snapshots d'images
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Gestionnaire des salons
const roomManager = new RoomManager(io);

// API REST Informations & Santé
app.get('/api/info', (req, res) => {
  res.json({
    status: 'online',
    appName: 'LaPlume',
    localIp: LOCAL_IP,
    port: PORT,
    localUrl: `http://${LOCAL_IP}:${PORT}`,
    categories: Object.keys(WORD_CATEGORIES),
  });
});

// API pour analyse directe par IA (Mode Solo ou requêtes HTTP)
app.post('/api/ai/guess', async (req, res) => {
  try {
    const { imageBase64, currentWord, apiKey } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image manquante' });
    }
    const result = await guessDrawingWithAI({ imageBase64, currentWord, apiKey });
    res.json(result);
  } catch (error) {
    console.error('Erreur API /api/ai/guess:', error);
    res.status(500).json({ error: 'Erreur lors de l\'analyse IA' });
  }
});

// Servir le build de l'application cliente si présent (mode production autonome)
const clientDistPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Skribbl AI Server</title><meta charset="utf-8"></head>
          <body style="background:#1e1b4b;color:#fff;font-family:sans-serif;padding:40px;text-align:center;">
            <h1>🎨 Serveur Skribbl AI en ligne !</h1>
            <p>Le serveur est prêt. Pour lancer le client en mode développement :</p>
            <pre style="background:#0f172a;display:inline-block;padding:12px;border-radius:8px;">cd client && npm run dev</pre>
            <p>Ou pour construire l'application finale autonome :</p>
            <pre style="background:#0f172a;display:inline-block;padding:12px;border-radius:8px;">npm run build:client</pre>
          </body>
        </html>
      `);
    }
  });
});

// Gestion des connexions WebSockets (temps réel)
io.on('connection', (socket) => {
  // Créer un salon
  socket.on('create_room', (hostInfo) => {
    const room = roomManager.createRoom(socket, hostInfo);
    socket.emit('room_created', { roomId: room.id });
  });

  // Rejoindre un salon
  socket.on('join_room', ({ roomId, playerInfo }) => {
    const cleanCode = (roomId || '').trim().toUpperCase();
    const room = roomManager.addPlayer(cleanCode, socket, playerInfo);
    if (!room) {
      socket.emit('join_error', { message: 'Salon introuvable ou partie déjà terminée !' });
    }
  });

  // Mettre à jour les paramètres du salon (hôte uniquement)
  socket.on('update_settings', ({ roomId, settings }) => {
    roomManager.updateSettings(roomId, socket.id, settings);
  });

  // Lancer la partie
  socket.on('start_game', ({ roomId }) => {
    roomManager.startGame(roomId, socket.id);
  });

  // Choix du mot par le dessinateur
  socket.on('select_word', ({ roomId, word }) => {
    roomManager.confirmWordChoice(roomId, socket.id, word);
  });

  // Action de dessin (tracé, gomme, pot de peinture, effacer)
  socket.on('draw_action', ({ roomId, action }) => {
    roomManager.handleDrawAction(roomId, socket.id, action);
  });

  // Message de chat / devinette
  socket.on('send_chat', ({ roomId, text }) => {
    roomManager.handleChatMessage(roomId, socket.id, text);
  });

  // Demande d'analyse par l'IA en temps réel (Mode Solo)
  socket.on('solo_ai_guess', async ({ imageBase64, currentWord, apiKey }) => {
    const result = await guessDrawingWithAI({ imageBase64, currentWord, apiKey });
    socket.emit('solo_ai_result', result);
  });

  // Déconnexion
  socket.on('disconnect', () => {
    roomManager.removePlayer(socket);
  });
});

// Lancement du serveur sur 0.0.0.0 pour écouter sur tout le réseau local
server.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log(`🪶 LAPLUME EST EN LIGNE !`);
  console.log(`💻 Accès Local PC  : http://localhost:${PORT}`);
  console.log(`📱 Accès Mobile/Wi-Fi: http://${LOCAL_IP}:${PORT}`);
  console.log(`🌍 Prêt pour Internet et Smartphones (Android / iOS)`);
  console.log('====================================================');
});
