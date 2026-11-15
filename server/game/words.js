// Dictionnaire de mots en français classés par catégories et difficultés

export const WORD_CATEGORIES = {
  general: [
    "soleil", "maison", "arbre", "voiture", "chien", "chat", "livre", "avion", "fleur", "pomme",
    "etoile", "ballon", "porte", "chaise", "montre", "lunettes", "velo", "telephone", "cle", "chapeau",
    "bouteille", "lit", "lampe", "fenetre", "chaussure", "poisson", "nuage", "bateau", "brosse", "fourchette",
    "parapluie", "ciseaux", "tambour", "pont", "marteau", "guitare", "cloche", "cadeau", "valise", "fusée"
  ],
  animaux: [
    "chien", "chat", "lion", "elephant", "girafe", "singe", "lapin", "serpent", "tortue", "dauphin",
    "requin", "pingouin", "grenouille", "oiseau", "hibou", "panda", "ours", "loup", "cheval", "vache",
    "mouton", "cochon", "canard", "abeille", "papillon", "araignee", "crabe", "pieuvre", "souris", "kangourou"
  ],
  nourriture: [
    "pizza", "burger", "frites", "glace", "croissant", "baguette", "fromage", "chocolat", "pomme", "banane",
    "fraise", "gateau", "sushi", "spaghetti", "taco", "salade", "soupe", "oeuf", "carotte", "tomate",
    "pasteque", "raisin", "citron", "hotdog", "popcorn", "cookie", "donut", "bonbon", "ananas", "avocat"
  ],
  geek_pop: [
    "pikachu", "mario", "batman", "spiderman", "yoda", "sabrelaser", "pokeball", "manette", "casque", "robot",
    "vaisseau", "alien", "baguette magique", "dragon", "fantome", "zombie", "chateau", "couronne", "cape", "superman",
    "minecraft", "sonic", "zelda", "bouclier", "epee", "potion", "tresor", "licorne", "pirate", "carte"
  ],
  metiers: [
    "pompier", "policier", "medecin", "cuisinier", "astronaute", "professeur", "artiste", "pilote", "facteur", "jardinier",
    "magicien", "detective", "chanteur", "boulanger", "fermier", "mecanicien", "dentiste", "plongeur", "peintre", "coiffeur"
  ]
};

// Obtenir 3 mots aléatoires pour le choix du dessinateur
export function getRandomWordChoices(category = "all", customWords = []) {
  let pool = [];
  
  if (customWords && customWords.length > 0) {
    pool = [...customWords];
  } else if (category === "all" || !WORD_CATEGORIES[category]) {
    pool = Object.values(WORD_CATEGORIES).flat();
  } else {
    pool = [...WORD_CATEGORIES[category]];
  }

  // Filtrer les doublons et nettoyer
  pool = Array.from(new Set(pool.map(w => w.trim().toLowerCase()).filter(Boolean)));
  
  if (pool.length < 3) {
    pool = Object.values(WORD_CATEGORIES).flat();
  }

  // Mélanger (Fisher-Yates)
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, 3);
}

// Normalise une chaîne (sans accents, sans casse, sans espaces superflus)
export function normalizeWord(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Distance de Levenshtein pour détecter si la réponse est très proche ("Tu chauffes !")
export function getLevenshteinDistance(a, b) {
  const normA = normalizeWord(a);
  const normB = normalizeWord(b);

  if (normA === normB) return 0;
  if (!normA.length) return normB.length;
  if (!normB.length) return normA.length;

  const matrix = [];
  for (let i = 0; i <= normB.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= normA.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= normB.length; i++) {
    for (let j = 1; j <= normA.length; j++) {
      if (normB.charAt(i - 1) === normA.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // suppression
        );
      }
    }
  }

  return matrix[normB.length][normA.length];
}
