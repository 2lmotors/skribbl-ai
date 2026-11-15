import { io } from 'socket.io-client';

// En mode développement Vite, on cible le serveur Express (port 3000)
// En production, on utilise l'hôte courant (window.location.origin)
const getSocketUrl = () => {
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL;
  }
  if (typeof window !== 'undefined') {
    // Si on tourne sur le port 5173 de Vite, rediriger vers 3000
    if (window.location.port === '5173') {
      return `http://${window.location.hostname}:3000`;
    }
    return window.location.origin;
  }
  return 'http://localhost:3000';
};

export const socket = io(getSocketUrl(), {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});
