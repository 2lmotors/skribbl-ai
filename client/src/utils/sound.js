// Synthétiseur d'effets sonores utilisant l'API Web Audio (100% autonome, zéro dépendance externe)

class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Petit son de clic / pop
  playPop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // Bonne réponse trouvée (jingle joyeux)
  playCorrect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // Do, Mi, Sol, Do aigu

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.value = freq;

      const startTime = now + idx * 0.08;
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  }

  // Réponse très proche ("Tu chauffes !")
  playClose() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(750, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  // Tic-tac du chrono sous haute pression (< 10s) qui s'accélère et monte en fréquence
  playTick(secondsLeft = 10) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const clampedSec = Math.max(1, Math.min(10, secondsLeft));

    // La fréquence monte de 600 Hz (à 10s) jusqu'à 1300 Hz (à 1s)
    const baseFreq = 600 + (10 - clampedSec) * 75;

    // Nombre de battements rapprochés par seconde pour simuler l'accélération
    let pulses = [0];
    if (clampedSec <= 5 && clampedSec > 3) {
      // 2 battements rapides ("tic-tac")
      pulses = [0, 0.22];
    } else if (clampedSec <= 3 && clampedSec > 1) {
      // 3 battements rapides ("tic-tac-tic")
      pulses = [0, 0.16, 0.32];
    } else if (clampedSec <= 1) {
      // Alerte maximale : 4 battements ultra rapides
      pulses = [0, 0.12, 0.24, 0.36];
    }

    pulses.forEach((offset, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'square' : 'triangle';
      // Le deuxième battement est légèrement plus aigu pour le son classique d'horloge
      osc.frequency.setValueAtTime(baseFreq + (idx * 120), now + offset);

      const volume = clampedSec <= 3 ? 0.22 : 0.14;
      gain.gain.setValueAtTime(volume, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.04);
    });
  }

  // Fanfare de fin de partie
  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const chords = [
      { freq: 440, time: 0 },
      { freq: 554.37, time: 0.15 },
      { freq: 659.25, time: 0.3 },
      { freq: 880, time: 0.45 },
    ];

    chords.forEach(({ freq, time }) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.value = freq;

      const start = this.ctx.currentTime + time;
      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.6);
    });
  }
}

export const sound = new SoundFX();
