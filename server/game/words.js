// Dictionnaire de mots en français classés par tranches d'âge, thématiques et difficultés
// Algorithme anti-répétition par "Sac de tirage sans remise" (Fisher-Yates deck)
// Normalisation avancée & Fuzzy matching (reconnaissance des fautes d'orthographe, pluriel/singulier, phonétique)

export const WORD_CATEGORIES = {
  // 1. Tranche d'âge 4 à 6 ans (Très simple, visuel, quotidien) - ~200 mots
  kids_4_6: [
    "soleil", "chat", "chien", "pomme", "banane", "fleur", "maison", "lit", "arbre", "voiture",
    "ballon", "table", "chaise", "poisson", "oiseau", "bebe", "porte", "livre", "etoile", "lune",
    "chaussure", "chapeau", "brosse", "bonbon", "papa", "maman", "bus", "train", "velo", "eau",
    "nez", "yeux", "main", "gateau", "jus", "carotte", "lait", "pain", "boite", "tasse",
    "bol", "cuillere", "fenetre", "sac", "robe", "pantalon", "canard", "vache", "cochon", "mouton",
    "cheval", "singe", "tortue", "grenouille", "papillon", "coeur", "crayon", "bague", "nuage", "pluie",
    "neige", "echelle", "roue", "cloche", "oeuf", "fourchette", "bougie", "glace", "toboggan", "balancoire",
    "bateau", "avion", "poire", "fraise", "biberon", "poupee", "doudou", "brosse a dents", "savon", "serviette",
    "souris", "lapin", "poule", "poussin", "caneton", "fromage", "soupe", "salade", "tomate", "patate",
    "camion", "tracteur", "moto", "brouette", "seau", "pelle", "chateau de sable", "cerf-volant", "bonnet",
    "echarpe", "bottes", "parapluie", "tapis", "horloge", "miroir", "peigne", "berceau", "chuchotement",
    "sucette", "chocolat", "orange", "cerise", "citron", "raisin", "ananas", "pasteque", "champignon",
    "escargot", "abeille", "coccinelle", "fourmi", "araignee", "chenille", "herbe", "feuille", "foret",
    "montagne", "mer", "plage", "vague", "sable", "ile", "etoile de mer", "crabe", "coquillage", "dauphin",
    "baleine", "requin", "bavoir", "pyjama", "chaussettes", "mouchoir", "lunettes", "montre", "collier",
    "clef", "cadenas", "marteau", "scie", "ciseaux", "peinture", "pinceau", "gomme", "feutre", "cahier",
    "horloge", "reveil", "lampe", "coussin", "couverture", "armoire", "tiroir", "lavabo", "baignoire",
    "douche", "robinet", "brosse a cheveux", "dentifrice", "biscuit", "croissant", "crepe", "gaufre",
    "confiture", "miel", "yaourt", "beurre", "oeuf au plat", "frites", "pizza", "sandwich", "hamburger"
  ],

  // 2. Tranche d'âge 7 à 9 ans (Juniors, contes, aventure, nature) - ~200 mots
  kids_7_9: [
    "chateau", "dauphin", "helicoptere", "astronaute", "pirate", "licorne", "dinosaure", "requin", "tambour", "volcan",
    "montre", "parapluie", "telescope", "guitare", "couronne", "sabre", "tresor", "boussole", "kangourou", "girafe",
    "panda", "hibou", "magicien", "princesse", "chevalier", "monstre", "fantome", "robot", "sirene", "fusee",
    "phare", "tente", "skateboard", "jumelles", "labyrinthe", "cartable", "microscope", "parachute", "sous-marin", "igloo",
    "montgolfiere", "moulin", "cascade", "arc-en-ciel", "patins", "flute", "accordeon", "violon", "pizza", "hamburger",
    "croissant", "crepe", "baguette magique", "tapis volant", "dragon", "bouclier", "epee", "potion", "chameau", "perroquet",
    "koala", "cameleon", "ecureuil", "herisson", "castor", "flamant rose", "hippopotame", "crocodile", "chauve-souris", "loup",
    "porte-monnaie", "chateau-fort", "pique-nique", "casse-noisette", "taille-crayon", "lance-pierre", "garde-boue", "cloche-pied",
    "fer-a-cheval", "arc-et-fleche", "balle de tennis", "raquette", "panier de basket", "but de foot", "medaille", "trophee",
    "patinoire", "trampoline", "boule de neige", "bonhomme de neige", "feu de camp", "marshmallow", "cabane dans les arbres",
    "canne a peche", "hamecon", "chaloupe", "boussole de poche", "baleinier", "ancre de marine", "coffre a jouets",
    "chistera", "boomerang", "lasso", "pepite d or", "carte au tresor", "perle rare", "diademe", "sceptre royal",
    "carrosse", "armure", "casque de chevalier", "catapulte", "pont-levis", "donjon", "creneau", "arbalete",
    "gargouille", "grimoire", "boule de cristal", "chaudron magique", "balai de sorciere", "baguette d etoile",
    "luciole", "libellule", "colibri", "toucan", "panthere", "tigre", "lion", "guepard", "ours polaire", "morse",
    "pingouin", "manchot", "orque", "meduse", "poulpe", "pieuvre", "calmar", "hippocampe", "raie manta", "corail",
    "cactus", "bambou", "palmier", "nenuphar", "lotus", "tournesol", "orchidee", "rose", "tulipe", "pissenlit"
  ],

  // 3. Tranche d'âge 10 à 14 ans (Ados, pop-culture, gaming, tech, urbain) - ~200 mots
  teens_10_14: [
    "manette", "trottinette", "youtubeur", "selfie", "casque audio", "smartphone", "manga", "streaming", "hoverboard", "sneakers",
    "hoodie", "smoothie", "kebab", "emoji", "wifi", "drone", "cosplay", "console", "clavier gamer", "microphone",
    "pixel", "bluetooth", "skateboard", "roller", "bubble tea", "popcorn", "streamer", "challenge", "playlist", "avatar",
    "escape game", "laser game", "roller coaster", "street art", "graffiti", "beatbox", "casquette", "airpods", "carte graphique",
    "powerbank", "stickers", "tatouage", "piercing", "sweat", "anime", "pikachu", "spiderman", "batman", "superman",
    "iron man", "star wars", "sabrelaser", "zelda", "mario", "minecraft", "creeper", "sonic", "fortnite", "battle royale",
    "ninja", "samourai", "viking", "zombie", "alien", "cyborg", "vaisseau spatial", "hologramme", "auto-tamponneuse", "casque-vr",
    "trottinette-electrique", "roller-blade", "parc d attraction", "salle d arcade", "karaoke", "ring de boxe", "skatepark",
    "fond vert", "ring light", "carte sim", "cle usb", "disque dur", "ecran incurve", "fauteuil gamer", "t-shirt oversize",
    "carte mere", "processeur", "refroidissement liquide", "webcam", "micro sur perche", "streameuse", "chaine twitch",
    "tiktok", "discord", "serveur vocal", "reseau social", "story instagram", "filtre photo", "camera embarquee",
    "gopro", "drone de course", "casque de moto", "rampe de skate", "halfpipe", "figure acrobatique", "parkour",
    "casque antibruit", "enceinte sans fil", "chargeur a induction", "montre connectee", "lunettes de soleil pilote",
    "veste en jean", "sweat a capuche", "baskets montantes", "bonnet oversize", "sac banane", "pochette bandouliere",
    "gourde inox", "tasse isotherme", "badge personalise", "poster lumineux", "guirlande led", "neon decoratif"
  ],

  // 4. Adultes - Général & Varié (Culture générale, objets, monuments, gastronomie) - ~220 mots
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
    "tirelire", "porte-documents", "carte bleue", "distributeur de billets", "roulette de casino", "jeton de poker", "billard americain",
    "deboucheur", "escabeau", "niveau a bulle", "cle molette", "rabot", "etabli", "boite a outils", "brouette a moteur",
    "pulverisateur", "arrosoir", "serpette", "secateur", "rateau", "beche", "faux", "meuleuse", "visseuse",
    "ventilateur de plafond", "climatiseur", "deshumidificateur", "radiateur en fonte", "cheminee", "poele a bois",
    "lustre en cristal", "applique murale", "lampadaire halogene", "fauteuil a bascule", "canape d angle", "table basse"
  ],

  // 5. Professionnel & Métiers techniques - ~200 mots
  professionnel: [
    "stethoscope", "scalpel", "architecte", "echafaudage", "brancard", "chirurgien", "mecanicien", "electricien", "plombier", "geometre",
    "soudeur", "apiculteur", "archeologue", "veterinaire", "ebeniste", "notaire", "comptable", "pilote de ligne", "aiguilleur du ciel", "grutier",
    "macon", "traducteur", "sommelier", "torrefacteur", "joaillier", "taxidermiste", "cardiologue", "anesthesiste", "topographe", "serrurier",
    "cordonnier", "horloger", "opticien", "pharmacien", "radiologue", "meteorologue", "oceanographe", "astronome", "paleontologue", "geologue",
    "sapeur-pompier", "garde-forestier", "aide-soignant", "sage-femme", "chirurgien-dentiste", "chef-cuisinier", "conducteur de train",
    "capitaine de navire", "avocat general", "juge d instruction", "greffier", "maitre nageur", "professeur de yoga", "instructeur de ski",
    "paysagiste", "viticulteur", "brasseur", "boulanger", "patissier", "chocolatier", "boucher", "poissonnier", "fleuriste", "antiquaire",
    "commissaire-priseur", "restaurateur d art", "luthier", "relieur", "vitrier", "couvreur", "charpentier", "platrier",
    "peintre en batiment", "carreleur", "chaudronnier", "tuyauteur", "ajusteur-monteur", "dessinateur industriel", "urbaniste",
    "ingénieur du son", "regisseur lumiere", "cadreur", "perchiste", "maquilleur de cinema", "costumier", "cascadeur",
    "douanier", "garde-cote", "policier scientifique", "enqueteur", "gendarme motocycliste", "convoyeur de fonds"
  ],

  // 6. Scientifique & Recherche - ~180 mots
  scientifique: [
    "microscope", "telescope", "molecule", "atome", "eprouvette", "gravite", "cellule", "sismographe", "centrifugeuse", "fossile",
    "superconducteur", "accelerateur de particules", "asteroide", "comete", "magnetisme", "chromosome", "adn", "prisme", "diffraction", "equation",
    "pipette", "becher", "bec bunsen", "thermometre", "electrode", "cristal", "photosynthese", "bioluminescence", "antimatiere", "laser",
    "spectrometre", "radiographie", "ultrason", "infrarouge", "table periodique", "champ magnetique", "fusion nucleaire", "conducteur",
    "pendule de foucault", "nanoparticule", "rayon-x", "trou-noir", "super-nova", "etoile-filante", "micro-organisme", "anti-matiere",
    "catalyseur", "reaction en chaine", "chambre a vide", "spectre lumineux", "faisceau laser", "pression atmospherique", "densite",
    "fission nucleaire", "conductivite", "semi-conducteur", "diode", "transistor", "oscilloscope", "generateur van de graaff",
    "bobine de tesla", "effet doppler", "theorie de la relativite", "entropie", "energie cinetique", "force centrifuge",
    "refraction", "polarisation", "interferences", "chambre a brouillard", "compteur geiger", "barreau aimante",
    "reacteur a fusion", "satellite orbital", "sonde spatiale", "bouclier thermique", "capsule spatiale", "rover martien"
  ],

  // 7. Coquin & Érotique (+18 chic, sensuel, bon enfant) - ~120 mots
  coquin: [
    "lingerie", "dentelle", "jarretiere", "menottes", "porte-jarretelles", "decollete", "baiser passionne", "preliminaires", "massage sensuel", "caresse",
    "lit a baldaquin", "draps de satin", "nuisette", "string", "boxer", "bikini", "sauna", "jacuzzi", "huile de massage", "plume de caresse",
    "bandeau sur les yeux", "bougie parfumee", "fessee coquine", "calin fougueux", "frisson", "rouge a levres", "talons aiguilles", "deshabille",
    "peignoir de soie", "bain moussant", "strip-tease", "pole dance", "chuchotement", "morsure", "regard de braise", "dessous coquins", "corset",
    "guepiere", "collants resille", "body en dentelle", "pommade", "ice cube", "plumeau", "baiser dans le cou", "masque venitien", "douche a deux",
    "porte-jarretelle", "nuiteuse", "caraco", "porte-bonheur", "chuchotis", "ruban de satin", "volupte", "tentation", "extase"
  ]
};

// ─────────────────────────────────────────────────────────────────
// GESTION DU "SAC DE TIRAGE SANS REMISE" (Deck / Shuffle Bag)
// Garantit ZERO répétition jusqu'à épuisement complet de la catégorie
// ─────────────────────────────────────────────────────────────────
const categoryDecks = new Map(); // categoryKey -> string[]
const globalRecentlyUsed = new Set(); // Mots récemment joués sur tout le serveur (dernier 250 mots)

function getDeckForCategory(category) {
  let deck = categoryDecks.get(category);
  if (!deck || deck.length < 3) {
    let pool = [];
    if (category === "all" || !WORD_CATEGORIES[category]) {
      pool = Object.entries(WORD_CATEGORIES)
        .filter(([key]) => key !== 'coquin')
        .map(([, words]) => words)
        .flat();
    } else {
      pool = [...WORD_CATEGORIES[category]];
    }

    // Dédupliquer et nettoyer
    const cleanPool = Array.from(new Set(pool.map(w => w.trim()).filter(Boolean)));

    // Mélange Fisher-Yates aléatoire robuste
    deck = [...cleanPool];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // Éviter les mots du globalRecentlyUsed au début du nouveau paquet
    if (globalRecentlyUsed.size > 0 && deck.length > 20) {
      const front = [];
      const back = [];
      for (const w of deck) {
        if (globalRecentlyUsed.has(normalizeStrict(w))) {
          back.push(w);
        } else {
          front.push(w);
        }
      }
      deck = [...front, ...back];
    }

    categoryDecks.set(category, deck);
  }
  return deck;
}

// ─────────────────────────────────────────────────────────────────
// NORMALISATION STRICTE & LOOSE
// ─────────────────────────────────────────────────────────────────

// Supprime les articles courants français ("le", "la", "les", "l'", "un", "une", "des", "du")
export function stripFrenchArticles(str) {
  if (!str) return "";
  let s = str.trim().toLowerCase();
  s = s.replace(/^(le|la|les|l'|un|une|des|du|de la|d')\s+/i, "");
  s = s.replace(/^l'/i, "");
  s = s.replace(/^d'/i, "");
  return s.trim();
}

export function normalizeStrict(str) {
  return stripFrenchArticles(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/[^a-z0-9]/g, "")       // Lettres et chiffres uniquement
    .trim();
}

export function normalizeLoose(str) {
  return stripFrenchArticles(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeWord(str) {
  return normalizeLoose(str);
}

// Normalisation du singulier / pluriel (enlève 's' ou 'x' final pour comparer la racine)
function normalizePlural(str) {
  const s = normalizeStrict(str);
  if (s.length > 3 && (s.endsWith('s') || s.endsWith('x'))) {
    return s.slice(0, -1);
  }
  return s;
}

// Simplification phonétique courante en français pour rattraper les fautes
function phoneticSimplify(str) {
  let s = normalizeStrict(str);
  // Réduire les consonnes doubles en simples (ex: "botte" -> "bote", "ballon" -> "balon")
  s = s.replace(/([bcdfghjklmnpqrstvwxz])\1+/g, '$1');
  // Équivalences phonétiques fréquentes
  s = s.replace(/qu/g, 'k');
  s = s.replace(/c(?=[aou])/g, 'k'); // c dur -> k (ex: cangourou -> kangourou)
  s = s.replace(/ph/g, 'f');         // dauphin -> daufin
  s = s.replace(/y/g, 'i');
  return s;
}

// ─────────────────────────────────────────────────────────────────
// DISTANCE DE LEVENSHTEIN
// ─────────────────────────────────────────────────────────────────
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
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[normB.length][normA.length];
}

// ─────────────────────────────────────────────────────────────────
// VÉRIFICATION AVANCÉE DU MOT (EXACT vs FUZZY/ORTHOGRAPHE)
// Retourne:
// { match: false }
// { match: true, exact: true }
// { match: true, exact: false, reason: 'orthographe' | 'pluriel' | 'phonetique' }
// ─────────────────────────────────────────────────────────────────
export function checkWordMatch(guess, secret) {
  if (!guess || !secret) return { match: false };

  const sGuess = normalizeStrict(guess);
  const sSecret = normalizeStrict(secret);

  // 1. Match parfait (sans accent, sans article)
  if (sGuess === sSecret) {
    return { match: true, exact: true };
  }

  // Match avec tirets/espaces normalisés
  const lGuess = normalizeLoose(guess);
  const lSecret = normalizeLoose(secret);
  if (lGuess === lSecret) {
    return { match: true, exact: true };
  }

  // 2. Différence Singulier / Pluriel (ex: "bottes" vs "botte", "cheval" vs "chevaux")
  const pGuess = normalizePlural(sGuess);
  const pSecret = normalizePlural(sSecret);
  if (pGuess === pSecret) {
    return { match: true, exact: false, reason: 'pluriel' };
  }

  // Cas particuliers français pluriels irréguliers
  if (
    (sGuess === 'yeux' && sSecret === 'oeil') || (sGuess === 'oeil' && sSecret === 'yeux') ||
    (sGuess === 'chevaux' && sSecret === 'cheval') || (sGuess === 'cheval' && sSecret === 'chevaux') ||
    (sGuess === 'oiseaux' && sSecret === 'oiseau') || (sGuess === 'oiseau' && sSecret === 'oiseaux')
  ) {
    return { match: true, exact: false, reason: 'pluriel' };
  }

  // 3. Fautes d'orthographe reconnues par simplification phonétique (ex: "cangourou" vs "kangourou", "bote" vs "botte")
  const phonGuess = phoneticSimplify(sGuess);
  const phonSecret = phoneticSimplify(sSecret);
  if (phonGuess === phonSecret) {
    return { match: true, exact: false, reason: 'orthographe' };
  }

  // 4. Tolérance Levenshtein sur petites erreurs de frappe
  const dist = getLevenshteinDistance(sGuess, sSecret);
  const minLen = Math.min(sGuess.length, sSecret.length);

  // Pour mots courts (>= 4 lettres), tolérer 1 coquille (ex: "rabot" -> "robot" non, mais "kangouro" -> "kangourou" oui)
  if (minLen >= 4 && dist === 1) {
    return { match: true, exact: false, reason: 'orthographe' };
  }
  // Pour mots longs (>= 7 lettres), tolérer 2 coquilles (ex: "helecoptere" -> "helicoptere")
  if (minLen >= 7 && dist <= 2) {
    return { match: true, exact: false, reason: 'orthographe' };
  }

  return { match: false };
}

// Fonction rétro-compatible simple
export function isWordMatch(guess, secret) {
  const res = checkWordMatch(guess, secret);
  return res.match;
}

// ─────────────────────────────────────────────────────────────────
// ALGORITHME DE SÉLECTION DE MOTS SANS RÉPÉTITION (3 CHOIX)
// Tire 3 mots depuis le paquet non-répété
// ─────────────────────────────────────────────────────────────────
export function getRandomWordChoices(category = "all", customWords = [], roomUsedWords = null) {
  // Si mots personnalisés fournis par l'hôte
  if (customWords && customWords.length >= 3) {
    const shuffled = [...customWords];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 3);
  }

  const deck = getDeckForCategory(category);
  const picked = [];

  // Piocher 3 mots distincts qui n'ont pas été utilisés dans ce salon
  let attempts = 0;
  while (picked.length < 3 && deck.length > 0 && attempts < 50) {
    attempts++;
    const candidate = deck.pop();
    const strictCand = normalizeStrict(candidate);

    if (roomUsedWords && roomUsedWords.has(strictCand)) {
      // Déjà joué dans cette partie, on le replace au début du deck
      deck.unshift(candidate);
      continue;
    }

    picked.push(candidate);
    globalRecentlyUsed.add(strictCand);
    if (globalRecentlyUsed.size > 250) {
      // Nettoyer les plus anciens pour garder le cache à 250
      const firstItem = globalRecentlyUsed.values().next().value;
      globalRecentlyUsed.delete(firstItem);
    }
  }

  // Si le deck s'est vidé en cours de route, le recharger
  if (picked.length < 3) {
    categoryDecks.delete(category);
    const freshDeck = getDeckForCategory(category);
    while (picked.length < 3 && freshDeck.length > 0) {
      const c = freshDeck.pop();
      if (!picked.includes(c)) picked.push(c);
    }
  }

  return picked;
}

// Obtenir 1 mot unique pour mode Solo
export function getRandomWord(category = "all", usedWordsSet = null) {
  const choices = getRandomWordChoices(category, [], usedWordsSet);
  const chosen = choices[Math.floor(Math.random() * choices.length)];
  if (usedWordsSet && chosen) {
    usedWordsSet.add(normalizeStrict(chosen));
  }
  return chosen;
}
