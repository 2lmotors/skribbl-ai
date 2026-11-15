# 🪶 LaPlume

Une application de dessin et de devinettes multijoueur en temps réel avec **Mode Solo Défi IA**, intégration **Gemini Vision**, support **tactile smartphone (Android / iOS)** et **QR Code d'invitation instantanée**.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/2lmotors/skribbl-ai)

---

## 🌟 Fonctionnalités Principales

### 1. 👥 Mode Multijoueur Classique
- **Salons privés ou publics** : création en un clic avec code à 6 lettres ou lien d'invitation.
- **📱 QR Code d'accès rapide** : les amis peuvent scanner l'écran avec leur smartphone (iPhone / Android) pour rejoindre instantanément sans rien installer !
- **Tableau de dessin fluide (60 FPS)** :
  - Outils : Pinceau, Gomme, Pot de peinture (*Flood Fill*), Annuler, Tout effacer.
  - Palette de 12 couleurs éclatantes + sélecteur de couleur hexadécimal libre.
  - 4 épaisseurs de trait (fin, moyen, épais, gros).
  - Lissage par courbes quadratiques pour un tracé propre au doigt ou à la souris.
- **Boucle de jeu complète** :
  - Choix entre 3 mots secrets pour le dessinateur.
  - Révélation progressive des lettres au fil du chronomètre (`_ _ _ _`).
  - Détection automatique des fautes légères ("Tu chauffes !" si à 1 lettre près).
  - Attribution des points selon la vitesse de réponse + points pour le dessinateur.
- **Classement & Podium final** :
  - Podium animé (1er, 2e, 3e) avec pluie de confettis et fanfares sonores.
- **🤖 Bot Gemini IA dans les salons** :
  - Vous pouvez activer un joueur virtuel "Gemini IA" qui participe aux devinettes avec vous !

### 2. 🤖 Mode Solo Défi IA
- Tu dessines seul face à l'intelligence artificielle !
- Le système analyse ton dessin en direct avec **Gemini 1.5 Flash** (ou son moteur autonome intégré) et tente de deviner ce que tu représentes.
- Dialogues vivants sous forme de bulles humoristiques.

### 3. 🔊 Effets Sonores 100% Autonomes
- Sons générés en temps réel via l'API Web Audio (aucun fichier MP3 externe à télécharger, 0 latence, fonctionne hors-ligne).
- Jingle de bonne réponse, avertissement "tu chauffes", tic-tac sous pression, fanfare de victoire.

---

## 🚀 Lancement Rapide

### Sur Windows :
Double-cliquez simplement sur le fichier :
```
start.bat
```
Il s'occupe de vérifier les dépendances, de compiler le projet et d'ouvrir automatiquement votre navigateur !

---

### En Ligne de Commande :

1. **Installer les dépendances :**
   ```bash
   npm run install:all
   ```

2. **Compiler le client :**
   ```bash
   npm run build:client
   ```

3. **Démarrer le serveur :**
   ```bash
   npm start
   ```
   L'application sera accessible sur :
   - Sur votre PC : `http://localhost:3000`
   - Sur votre smartphone (même Wi-Fi) : `http://<VOTRE-IP-LOCALE>:3000` *(l'adresse exacte s'affiche dans le terminal au lancement)*

---

## 📱 Jouer depuis son Smartphone (Android / iOS)

1. Assurez-vous que votre téléphone est connecté au même réseau Wi-Fi que l'ordinateur qui héberge le jeu.
2. Cliquez sur l'icône **QR Code** dans l'application.
3. Scannez le QR Code avec l'appareil photo de votre iPhone ou Android : vous êtes instantanément dans la partie !

---

## 🌐 Déploiement 100% Autonome sur Internet

L'application est conçue pour être déployée gratuitement en 1 clic sur n'importe quelle plateforme cloud :
- **Render.com** (Web Service Node.js avec Docker ou `npm start`)
- **Railway.app**
- **Fly.io** (`fly launch`)
- **VPS / Docker** : un `Dockerfile` optimisé multi-étapes est fourni à la racine.

### Variables d'environnement (Optionnel) :
- `PORT` : Port d'écoute (par défaut `3000`).
- `GEMINI_API_KEY` : Clé API Google Gemini (gratuite sur [Google AI Studio](https://aistudio.google.com/app/apikey)). *Note : les joueurs peuvent aussi saisir leur clé directement dans l'interface via le menu Réglages.*

---

## 🛠️ Architecture Technique

- **Frontend** : React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti, QRcode.
- **Backend** : Node.js, Express, Socket.io (WebSockets haute fréquence), dictionnaire français par thèmes.
- **IA** : API Gemini 1.5 Flash + simulateur heuristique autonome de secours.
