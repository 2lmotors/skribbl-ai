// Dictionnaire de mots en français classés par tranches d'âge, thématiques et difficultés

export const WORD_CATEGORIES = {
  // 1. Tranche d'âge 4 à 6 ans (Très simple, visuel, quotidien)
  kids_4_6: [
    "soleil", "chat", "chien", "pomme", "banane", "fleur", "maison", "lit", "arbre", "voiture",
    "ballon", "table", "chaise", "poisson", "oiseau", "bebe", "porte", "livre", "etoile", "lune",
    "chaussure", "chapeau", "brosse", "bonbon", "papa", "maman", "bus", "train", "velo", "eau",
    "nez", "yeux", "main", "gateau", "jus", "carotte", "lait", "pain", "boite", "tasse",
    "bol", "cuillere", "fenetre", "sac", "robe", "pantalon", "canard", "vache", "cochon", "mouton",
    "cheval", "singe", "tortue", "grenouille", "papillon", "coeur", "crayon", "bague", "nuage", "pluie",
    "neige", "echelle", "roue", "cloche", "oeuf", "fourchette", "bougie", "glace", "toboggan", "balançoire",
    "bateau", "avion", "chapeau", "poire", "fraise", "biberon", "poupee", "doudou"
  ],

  // 2. Tranche d'âge 7 à 9 ans (Juniors, un peu plus recherché, imagination)
  kids_7_9: [
    "chateau", "dauphin", "helicoptere", "astronaute", "pirate", "licorne", "dinosaure", "requin", "tambour", "volcan",
    "montre", "parapluie", "telescope", "guitare", "couronne", "sabre", "tresor", "boussole", "kangourou", "girafe",
    "panda", "hibou", "magicien", "princesse", "chevalier", "monstre", "fantome", "robot", "sirene", "fusee",
    "phare", "tente", "skateboard", "jumelles", "labyrinthe", "cartable", "microscope", "parachute", "sous-marin", "igloo",
    "montgolfiere", "moulin", "cascade", "arc-en-ciel", "patins", "flute", "accordeon", "violon", "pizza", "hamburger",
    "croissant", "crepe", "baguette magique", "tapis volant", "dragon", "bouclier", "epee", "potion", "chameau", "perroquet",
    "koala", "cameleon", "ecureuil", "herisson", "castor", "flamant rose", "hippopotame", "crocodile", "chauve-souris", "loup"
  ],

  // 3. Tranche d'âge 10 à 14 ans (Ados, tech, pop-culture, gaming, jargon)
  teens_10_14: [
    "manette", "trottinette", "youtubeur", "selfie", "casque audio", "smartphone", "manga", "streaming", "hoverboard", "sneakers",
    "hoodie", "smoothie", "kebab", "emoji", "wifi", "drone", "cosplay", "console", "clavier gamer", "microphone",
    "pixel", "bluetooth", "skateboard", "roller", "bubble tea", "popcorn", "streamer", "challenge", "playlist", "avatar",
    "escape game", "laser game", "roller coaster", "street art", "graffiti", "beatbox", "casquette", "trottinette electrique", "airpods", "carte graphique",
    "powerbank", "stickers", "tatouage", "piercing", "sweat", "anime", "pikachu", "spiderman",
    "batman", "superman", "iron man", "star wars", "sabrelaser", "zelda", "mario", "minecraft", "creeper", "sonic",
    "fortnite", "battle royale", "ninja", "samourai", "viking", "zombie", "alien", "cyborg", "vaisseau spatial", "hologramme"
  ],

  // 4. Adultes - Général & Varié (Facile à difficile, quotidien, culture)
  adults: [
    "pendule", "hypotheque", "nostalgie", "somnambule", "labyrinthe", "crepuscule", "eclipse", "sablier", "boussole", "bousculade",
    "thermomètre", "cafetiere", "kaleidoscope", "trampoline", "sarcophage", "parachute", "telecommande", "boomerang", "origami", "karaoke",
    "saxophone", "clarinette", "contrebasse", "barometre", "girouette", "rond-point", "sommelier", "vitrail", "amphitheatre", "catacombes",
    "statue de la liberte", "tour eiffel", "arc de triomphe", "colisee", "pyramide", "sphinx", "tour de pise", "big ben", "taj mahal", "gondole",
    "embouteillage", "parcmètre", "brouette", "tondeuse", "tronçonneuse", "perceuse", "echafaudage", "gruyere", "raclette", "fondue",
    "caviar", "champagne", "cocktail", "mojito", "cigare", "pipe", "narguilé", "brouillard", "avalanche", "tsunami",
    "tornade", "seisme", "meteorite", "aurore boreale", "constellation", "voie lactee", "galaxie", "trou noir", "horloge comtoise", "gramophone"
  ],

  // 5. Professionnel & Métiers techniques
  professionnel: [
    "stethoscophe", "scalpel", "architecte", "echafaudage", "brancard", "chirurgien", "mecanicien", "electricien", "plombier", "geometre",
    "soudeur", "apiculteur", "archeologue", "veterinaire", "ebeniste", "notaire", "comptable", "pilote de ligne", "aiguilleur du ciel", "grutier",
    "macon", "traducteur", "sommelier", "torrefacteur", "joaillier", "taxidermiste", "cardiologue", "anesthesiste", "topographe", "serrurier",
    "cordonnier", "horloger", "opticien", "pharmacien", "radiologue", "meteorologue", "oceanographe", "astronome", "paleontologue", "geologue"
  ],

  // 6. Scientifique & Recherche (Précis, stimulant)
  scientifique: [
    "microscope", "telescope", "molecule", "atome", "eprouvette", "gravite", "cellule", "sismographe", "centrifugeuse", "fossile",
    "superconducteur", "accelerateur de particules", "asteroide", "comete", "magnetisme", "chromosome", "adn", "prisme", "diffraction", "equation",
    "pipette", "becher", "bec bunsen", "thermometre", "electrode", "cristal", "photosynthese", "bioluminescence", "antimatiere", "laser",
    "spectrometre", "radiographie", "ultrason", "infrarouge", "table periodique", "champ magnetique", "fusion nucleaire", "conducteur", "pendule de foucault", "nanoparticule"
  ],

  // 7. Coquin & Érotique (+18 sensuel, chic, osé mais correct et bon enfant)
  coquin: [
    "lingerie", "dentelle", "jarretiere", "menottes", "porte-jarretelles", "decollete", "baiser passionne", "preliminaires", "massage sensuel", "caresse",
    "lit a baldaquin", "draps de satin", "nuisette", "string", "boxer", "bikini", "sauna", "jacuzzi", "huile de massage", "plume de caresse",
    "bandeau sur les yeux", "bougie parfumee", "fessee coquine", "calin fougueux", "frisson", "rouge a levres", "talons aiguilles", "deshabille", "peignoir de soie", "bain moussant",
    "strip-tease", "pole dance", "chuchotement", "morsure", "regard de braise", "dessous coquins", "corset", "guêpiere", "collants resille", "body en dentelle",
    "pommade", "ice cube", "plumeau", "baiser dans le cou", "masque venitien", "chambre d hotel", "douche a deux", "baie vitree", "coupe de champagne", "fraise chantilly"
  ]
};

// Obtenir des mots pour les choix du dessinateur ou le mode solo
export function getRandomWordChoices(category = "all", customWords = []) {
  let pool = [];
  
  if (customWords && customWords.length > 0) {
    pool = [...customWords];
  } else if (category === "all" || !WORD_CATEGORIES[category]) {
    // Si 'all', on mélange tout sauf 'coquin' par sécurité (sauf si coquin est explicitement choisi)
    pool = Object.entries(WORD_CATEGORIES)
      .filter(([key]) => key !== 'coquin')
      .map(([, words]) => words)
      .flat();
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

// Obtenir un mot unique aléatoire pour une catégorie
export function getRandomWord(category = "all") {
  const choices = getRandomWordChoices(category);
  return choices[Math.floor(Math.random() * choices.length)];
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
