// Dictionnaire de mots en français classés par tranches d'âge, thématiques et difficultés
// Algorithme anti-répétition et normalisation avancée (accents, traits d'union, casse)

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
    "bateau", "avion", "poire", "fraise", "biberon", "poupee", "doudou", "brosse a dents", "savon", "serviette",
    "souris", "lapin", "poule", "poussin", "caneton", "fromage", "soupe", "salade", "tomate", "patate",
    "camion", "tracteur", "moto", "brouette", "seau", "pelle", "château de sable", "cerf-volant", "bonnet",
    "echarpe", "bottes", "parapluie", "tapis", "horloge", "miroir", "peigne", "biberon", "berceau", "chuchotement"
  ],

  // 2. Tranche d'âge 7 à 9 ans (Juniors, un peu plus recherché, contes, aventure)
  kids_7_9: [
    "chateau", "dauphin", "helicoptere", "astronaute", "pirate", "licorne", "dinosaure", "requin", "tambour", "volcan",
    "montre", "parapluie", "telescope", "guitare", "couronne", "sabre", "tresor", "boussole", "kangourou", "girafe",
    "panda", "hibou", "magicien", "princesse", "chevalier", "monstre", "fantome", "robot", "sirene", "fusee",
    "phare", "tente", "skateboard", "jumelles", "labyrinthe", "cartable", "microscope", "parachute", "sous-marin", "igloo",
    "montgolfiere", "moulin", "cascade", "arc-en-ciel", "patins", "flute", "accordeon", "violon", "pizza", "hamburger",
    "croissant", "crepe", "baguette magique", "tapis volant", "dragon", "bouclier", "epee", "potion", "chameau", "perroquet",
    "koala", "cameleon", "ecureuil", "herisson", "castor", "flamant rose", "hippopotame", "crocodile", "chauve-souris", "loup",
    "porte-monnaie", "château-fort", "pique-nique", "casse-noisette", "taille-crayon", "lance-pierre", "garde-boue", "cloche-pied",
    "fer-a-cheval", "arc-et-fleche", "balle de tennis", "raquette", "panier de basket", "but de foot", "medaille", "trophée",
    "patinoire", "trampoline", "boule de neige", "bonhomme de neige", "igloo", "feu de camp", "marshmallow", "cabane dans les arbres"
  ],

  // 3. Tranche d'âge 10 à 14 ans (Ados, tech, pop-culture, gaming, jargon)
  teens_10_14: [
    "manette", "trottinette", "youtubeur", "selfie", "casque audio", "smartphone", "manga", "streaming", "hoverboard", "sneakers",
    "hoodie", "smoothie", "kebab", "emoji", "wifi", "drone", "cosplay", "console", "clavier gamer", "microphone",
    "pixel", "bluetooth", "skateboard", "roller", "bubble tea", "popcorn", "streamer", "challenge", "playlist", "avatar",
    "escape game", "laser game", "roller coaster", "street art", "graffiti", "beatbox", "casquette", "airpods", "carte graphique",
    "powerbank", "stickers", "tatouage", "piercing", "sweat", "anime", "pikachu", "spiderman", "batman", "superman",
    "iron man", "star wars", "sabrelaser", "zelda", "mario", "minecraft", "creeper", "sonic", "fortnite", "battle royale",
    "ninja", "samourai", "viking", "zombie", "alien", "cyborg", "vaisseau spatial", "hologramme", "auto-tamponneuse", "casque-vr",
    "trottinette-electrique", "roller-blade", "parc d attraction", "salle d arcade", "karaoke", "ring de boxe", "skatepark",
    "fond vert", "ring light", "carte sim", "cle usb", "disque dur", "ecran incurve", "fauteuil gamer", "t-shirt oversize"
  ],

  // 4. Adultes - Général & Varié (Facile à difficile, quotidien, monuments, culture)
  adults: [
    "pendule", "hypotheque", "nostalgie", "somnambule", "labyrinthe", "crepuscule", "eclipse", "sablier", "boussole", "bousculade",
    "thermometre", "cafetiere", "kaleidoscope", "trampoline", "sarcophage", "parachute", "telecommande", "boomerang", "origami", "karaoke",
    "saxophone", "clarinette", "contrebasse", "barometre", "girouette", "rond-point", "sommelier", "vitrail", "amphitheatre", "catacombes",
    "statue de la liberte", "tour eiffel", "arc de triomphe", "colisee", "pyramide", "sphinx", "tour de pise", "big ben", "taj mahal", "gondole",
    "embouteillage", "parcmetre", "brouette", "tondeuse", "tronconneuse", "perceuse", "echafaudage", "gruyere", "raclette", "fondue",
    "caviar", "champagne", "cocktail", "mojito", "cigare", "pipe", "narguile", "brouillard", "avalanche", "tsunami",
    "tornade", "seisme", "meteorite", "aurore boreale", "constellation", "voie lactee", "galaxie", "trou noir", "horloge comtoise", "gramophone",
    "croque-monsieur", "tire-bouchon", "court-circuit", "abat-jour", "coffre-fort", "essuie-glace", "gratte-ciel", "porte-cles",
    "garde-manger", "wagon-lit", "garde-fou", "tourne-disque", "haut-parleur", "micro-ondes", "seche-cheveux", "rouge-gorge", "poisson-clown",
    "machine a laver", "fer a repasser", "aspirateur robot", "presse-agrumes", "grille-pain", "bouilloire", "planche a decouper",
    "tirelire", "porte-documents", "carte bleue", "distributeur de billets", "roulette de casino", "jeton de poker", "billard americain"
  ],

  // 5. Professionnel & Métiers techniques
  professionnel: [
    "stethoscope", "scalpel", "architecte", "echafaudage", "brancard", "chirurgien", "mecanicien", "electricien", "plombier", "geometre",
    "soudeur", "apiculteur", "archeologue", "veterinaire", "ebeniste", "notaire", "comptable", "pilote de ligne", "aiguilleur du ciel", "grutier",
    "macon", "traducteur", "sommelier", "torrefacteur", "joaillier", "taxidermiste", "cardiologue", "anesthesiste", "topographe", "serrurier",
    "cordonnier", "horloger", "opticien", "pharmacien", "radiologue", "meteorologue", "oceanographe", "astronome", "paleontologue", "geologue",
    "sapeur-pompier", "garde-forestier", "aide-soignant", "sage-femme", "chirurgien-dentiste", "chef-cuisinier", "conducteur de train",
    "capitaine de navire", "avocat general", "juge d instruction", "greffier", "maitre nageur", "professeur de yoga", "instructeur de ski",
    "paysagiste", "viticulteur", "brasseur", "boulanger", "patissier", "chocolatier", "boucher", "poissonnier", "fleuriste", "antiquaire"
  ],

  // 6. Scientifique & Recherche (Précis, stimulant)
  scientifique: [
    "microscope", "telescope", "molecule", "atome", "eprouvette", "gravite", "cellule", "sismographe", "centrifugeuse", "fossile",
    "superconducteur", "accelerateur de particules", "asteroide", "comete", "magnetisme", "chromosome", "adn", "prisme", "diffraction", "equation",
    "pipette", "becher", "bec bunsen", "thermometre", "electrode", "cristal", "photosynthese", "bioluminescence", "antimatiere", "laser",
    "spectrometre", "radiographie", "ultrason", "infrarouge", "table periodique", "champ magnetique", "fusion nucleaire", "conducteur",
    "pendule de foucault", "nanoparticule", "rayon-x", "trou-noir", "super-nova", "etoile-filante", "micro-organisme", "anti-matiere",
    "catalyseur", "reaction en chaine", "chambre a vide", "spectre lumineux", "faisceau laser", "pression atmospherique", "densite"
  ],

  // 7. Coquin & Érotique (+18 sensuel, chic, osé mais correct et bon enfant)
  coquin: [
    "lingerie", "dentelle", "jarretiere", "menottes", "porte-jarretelles", "decollete", "baiser passionne", "preliminaires", "massage sensuel", "caresse",
    "lit a baldaquin", "draps de satin", "nuisette", "string", "boxer", "bikini", "sauna", "jacuzzi", "huile de massage", "plume de caresse",
    "bandeau sur les yeux", "bougie parfumee", "fessee coquine", "calin fougueux", "frisson", "rouge a levres", "talons aiguilles", "deshabille",
    "peignoir de soie", "bain moussant", "strip-tease", "pole dance", "chuchotement", "morsure", "regard de braise", "dessous coquins", "corset",
    "guepiere", "collants resille", "body en dentelle", "pommade", "ice cube", "plumeau", "baiser dans le cou", "masque venitien", "douche a deux"
  ]
};

// Normalise une chaîne de manière stricte (supprime accents, tirets, espaces, ponctuation)
// Permet d'accepter "arc en ciel", "arc-en-ciel", "arcenciel", "château", "chateau", etc.
export function normalizeStrict(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/[^a-z0-9]/g, "")       // Ne garde que les lettres et chiffres
    .trim();
}

// Normalise avec espaces simples pour Levenshtein
export function normalizeLoose(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Fonction de rétrocompatibilité
export function normalizeWord(str) {
  return normalizeLoose(str);
}

// Vérifie si la proposition du joueur correspond au mot secret
// Tolère l'absence d'accents, l'absence de traits d'union, ou des espaces à la place des tirets
export function isWordMatch(guess, secret) {
  if (!guess || !secret) return false;

  const strictGuess = normalizeStrict(guess);
  const strictSecret = normalizeStrict(secret);

  if (strictGuess && strictGuess === strictSecret) return true;

  const looseGuess = normalizeLoose(guess);
  const looseSecret = normalizeLoose(secret);

  if (looseGuess && looseGuess === looseSecret) return true;

  return false;
}

// Algorithme de sélection de mots sans répétition
export function getRandomWordChoices(category = "all", customWords = [], usedWordsSet = null) {
  let pool = [];
  
  if (customWords && customWords.length > 0) {
    pool = [...customWords];
  } else if (category === "all" || !WORD_CATEGORIES[category]) {
    pool = Object.entries(WORD_CATEGORIES)
      .filter(([key]) => key !== 'coquin')
      .map(([, words]) => words)
      .flat();
  } else {
    pool = [...WORD_CATEGORIES[category]];
  }

  // Nettoyer et dédoublonner
  pool = Array.from(new Set(pool.map(w => w.trim().toLowerCase()).filter(Boolean)));
  
  // Filtrer les mots déjà apparus récemment si le pool est suffisant
  let availablePool = pool;
  if (usedWordsSet && usedWordsSet.size > 0) {
    const unused = pool.filter(w => !usedWordsSet.has(normalizeStrict(w)));
    if (unused.length >= 3) {
      availablePool = unused;
    } else {
      // Si on a épuisé presque tous les mots, on réinitialise l'historique pour un nouveau cycle frais
      usedWordsSet.clear();
      availablePool = pool;
    }
  }

  // Mélanger selon Fisher-Yates
  const shuffled = [...availablePool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, 3);
}

// Obtenir un mot unique aléatoire pour une catégorie avec mémoire anti-répétition
export function getRandomWord(category = "all", usedWordsSet = null) {
  const choices = getRandomWordChoices(category, [], usedWordsSet);
  const chosen = choices[Math.floor(Math.random() * choices.length)];
  if (usedWordsSet && chosen) {
    usedWordsSet.add(normalizeStrict(chosen));
  }
  return chosen;
}

// Distance de Levenshtein pour détecter si la réponse est très proche ("Tu chauffes !")
export function getLevenshteinDistance(a, b) {
  const normA = normalizeStrict(a);
  const normB = normalizeStrict(b);

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
