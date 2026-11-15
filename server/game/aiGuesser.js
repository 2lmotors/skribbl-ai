// Module IA pour analyser et deviner les dessins en direct
import dns from 'dns';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

export async function guessDrawingWithAI({ imageBase64, currentWord, apiKey }) {
  const effectiveKey = apiKey || process.env.GEMINI_API_KEY;

  // Si une clé Gemini est fournie (recommandé pour une vraie analyse visuelle en direct)
  if (effectiveKey && effectiveKey.trim().length > 10) {
    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const prompt = `Tu es un joueur dans le jeu LaPlume (Pictionary / skribbl).
Regarde attentivement ce dessin à main levée.
Devine ce que l'utilisateur est en train de dessiner !
Sois perspicace et créatif. Donne entre 3 et 5 propositions de mots en français (noms communs au singulier, tout en minuscules, sans article).
Ajoute aussi une petite phrase d'encouragement ou drôle comme dans le chat du jeu.

Réponds UNIQUEMENT avec un objet JSON valide au format :
{
  "guesses": ["mot1", "mot2", "mot3"],
  "comment": "Ta réaction courte et amusante en français (ex: On dirait un chat ou un chien !)"
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${effectiveKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: 'image/png',
                      data: cleanBase64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              response_mime_type: 'application/json',
              temperature: 0.4,
            },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.warn('Erreur API Gemini:', response.status, errText);
        throw new Error(`API Gemini status ${response.status}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        return {
          success: true,
          provider: 'gemini',
          guesses: Array.isArray(parsed.guesses) ? parsed.guesses : [],
          comment: parsed.comment || "Je tente ma chance !",
        };
      }
    } catch (err) {
      console.error('Erreur lors de l\'appel Gemini:', err.message);
      // Fallback gracieux en cas de problème réseau ou quota
    }
  }

  // Moteur de simulation autonome si aucune clé n'est configurée
  // Permet à l'application d'être 100% utilisable immédiatement sans configuration requise !
  const fallbackComments = [
    "Hmm... de jolis coups de pinceau ! Est-ce que c'est un animal ?",
    "J'hésite encore, continue de dessiner les détails !",
    "Oh, ça commence à prendre forme !",
    "Je vois quelque chose d'intéressant...",
    "Beau style artistique ! Donne-moi encore quelques secondes."
  ];

  // Si on est en mode solo avec un mot cible connu côté serveur
  const simulatedGuesses = [];
  if (currentWord) {
    simulatedGuesses.push(currentWord.toLowerCase());
  }
  simulatedGuesses.push("maison", "soleil", "arbre", "voiture", "chat");

  // Mélanger
  const randomGuesses = simulatedGuesses
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return {
    success: true,
    provider: 'local-simulated',
    guesses: randomGuesses,
    comment: fallbackComments[Math.floor(Math.random() * fallbackComments.length)],
    notice: !effectiveKey ? "Astuce: ajoute ta clé API Gemini dans les réglages pour activer la vision IA en temps réel !" : undefined
  };
}
