// Dictionnaire 100% français classé par tranches d'âge, thématiques et difficultés
// Aucun mot d'emprunt anglais ni anglicisme (ex: "montagne russe" à la place de "roller coaster")
// Algorithme anti-répétition par "Sac de tirage sans remise" (Fisher-Yates deck)
// Vérification avancée & protection contre les faux positifs (un vrai mot différent comme "chapeau" n'est jamais accepté pour "chateau")

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
    "souris", "lapin", "poule", "poussin", "caneton", "fromage", "soupe", "salade", "tomate", "pomme de terre",
    "camion", "tracteur", "moto", "brouette", "seau", "pelle", "chateau de sable", "cerf-volant", "bonnet",
    "echarpe", "bottes", "parapluie", "tapis", "horloge", "miroir", "peigne", "berceau", "chuchotement",
    "sucette", "chocolat", "orange", "cerise", "citron", "raisin", "ananas", "pasteque", "champignon",
    "escargot", "abeille", "coccinelle", "fourmi", "araignee", "chenille", "herbe", "feuille", "foret",
    "montagne", "mer", "plage", "vague", "sable", "ile", "etoile de mer", "crabe", "coquillage", "dauphin",
    "baleine", "requin", "bavoir", "pyjama", "chaussettes", "mouchoir", "lunettes", "montre", "collier",
    "clef", "cadenas", "marteau", "scie", "ciseaux", "peinture", "pinceau", "gomme", "feutre", "cahier",
    "reveil", "lampe", "coussin", "couverture", "armoire", "tiroir", "lavabo", "baignoire",
    "douche", "robinet", "brosse a cheveux", "dentifrice", "biscuit", "croissant", "crepe", "gaufre",
    "confiture", "miel", "yaourt", "beurre", "oeuf au plat", "frites", "tartelette", "tartine", "quiche"
  ],

  // 2. Tranche d'âge 7 à 9 ans (Juniors, contes, aventure, nature) - ~200 mots
  kids_7_9: [
    "chateau", "dauphin", "helicoptere", "astronaute", "pirate", "licorne", "dinosaure", "requin", "tambour", "volcan",
    "montre", "parapluie", "telescope", "guitare", "couronne", "sabre", "tresor", "boussole", "kangourou", "girafe",
    "panda", "hibou", "magicien", "princesse", "chevalier", "monstre", "fantome", "automate", "sirene", "fusee",
    "phare", "tente", "planche a roulettes", "jumelles", "labyrinthe", "cartable", "microscope", "parachute", "sous-marin", "igloo",
    "montgolfiere", "moulin", "cascade", "arc-en-ciel", "patins a roulettes", "flute", "accordeon", "violon", "omelette", "tourte",
    "croissant", "crepe", "baguette magique", "tapis volant", "dragon", "bouclier", "epee", "potion", "chameau", "perroquet",
    "koala", "cameleon", "ecureuil", "herisson", "castor", "flamant rose", "hippopotame", "crocodile", "chauve-souris", "loup",
    "porte-monnaie", "chateau-fort", "pique-nique", "casse-noisette", "taille-crayon", "lance-pierre", "garde-boue", "cloche-pied",
    "fer-a-cheval", "arc-et-fleche", "balle de tennis", "raquette", "panier de basket", "but de football", "medaille", "trophee",
    "patinoire", "trampoline", "boule de neige", "bonhomme de neige", "feu de camp", "guimauve", "cabane dans les arbres",
    "canne a peche", "hamecon", "chaloupe", "boussole de poche", "baleinier", "ancre de marine", "coffre a jouets",
    "toupie", "corde a sauter", "pepite d or", "carte au tresor", "perle rare", "diademe", "sceptre royal",
    "carrosse", "armure", "casque de chevalier", "catapulte", "pont-levis", "donjon", "creneau", "arbalete",
    "gargouille", "grimoire", "boule de cristal", "chaudron magique", "balai de sorciere", "baguette d etoile",
    "luciole", "libellule", "colibri", "toucan", "panthere", "tigre", "lion", "guepard", "ours polaire", "morse",
    "pingouin", "manchot", "orque", "meduse", "poulpe", "pieuvre", "calmar", "hippocampe", "raie manta", "corail",
    "cactus", "bambou", "palmier", "nenuphar", "lotus", "tournesol", "orchidee", "rose", "tulipe", "pissenlit"
  ],

  // 3. Tranche d'âge 10 à 14 ans (Ados, aventures, technologie, expression) - 100% français
  teens_10_14: [
    "manette de jeu", "trottinette", "animateur", "autoportrait", "casque audio", "telephone portable", "bande dessinee", "diffusion en direct", "gyropode", "baskets",
    "sweat a capuche", "jus de fruits", "brochette de viande", "emoticon", "borne sans fil", "aeronef telecommande", "deguisement", "console de jeux", "clavier d ordinateur", "microphone",
    "mosaique", "onde radio", "planche a roulettes", "patin a roulettes", "the aux perles", "mais souffle", "presentateur", "defi", "liste de chansons", "personnage virtuel",
    "jeu d evasion", "labyrinthe laser", "montagne russe", "fresque murale", "graffiti", "bruitage vocal", "casquette", "ecouteurs sans fil", "carte graphique",
    "batterie de secours", "autocollants", "tatouage", "boucle d oreille", "chandail", "dessin anime", "super-heros", "chevalier noir", "guerrier volant", "ogre des montagnes",
    "corsaire", "archer", "centaure", "fantome errant", "sorcier", "epee laser", "chateau hante", "vaisseau spatial", "hologramme", "auto-tamponneuse", "casque immersif",
    "trottinette electrique", "patins en ligne", "parc d attraction", "salle de jeux", "orchestre", "ring de boxe", "piste de glisse",
    "fond vert", "lampe circulaire", "carte a puce", "cle memoire", "disque dur", "ecran incurve", "fauteuil de bureau", "chemise ample",
    "carte mere", "processeur", "refroidissement par eau", "camera pour ordinateur", "micro sur perche", "animatrice", "chaine video",
    "courte video", "salon de discussion", "serveur vocal", "reseau social", "album photo", "filtre photo", "camera embarquee",
    "camera portative", "drone de course", "casque de moto", "rampe acrobatique", "rampe en demi-lune", "figure acrobatique", "parcours acrobatique",
    "casque antibruit", "enceinte sans fil", "chargeur a induction", "montre connectee", "lunettes de soleil",
    "veste en jean", "baskets montantes", "bonnet en laine", "sacoche", "pochette bandouliere",
    "gourde en acier", "bouteille isotherme", "insigne en metal", "affiche lumineuse", "guirlande lumineuse", "tube lumineux"
  ],

  // 4. Adultes - Général & Varié (Culture générale, objets, monuments, gastronomie) - ~220 mots
  adults: [
    "pendule", "hypotheque", "nostalgie", "somnambule", "labyrinthe", "crepuscule", "eclipse", "sablier", "boussole", "bousculade",
    "thermometre", "cafetiere", "kaleidoscope", "trampoline", "sarcophage", "parachute", "telecommande", "art du pliage",
    "saxophone", "clarinette", "contrebasse", "barometre", "girouette", "rond-point", "sommelier", "vitrail", "amphitheatre", "catacombes",
    "statue de la liberte", "tour eiffel", "arc de triomphe", "colisee", "pyramide", "sphinx", "tour de pise", "gondole venitienne",
    "embouteillage", "horodateur", "brouette", "tondeuse", "tronconneuse", "perceuse", "echafaudage", "gruyere", "raclette", "fondue",
    "caviar", "champagne", "boisson festive", "limonade a la menthe", "cigare", "pipe", "narguile", "brouillard", "avalanche", "tsunami",
    "tornade", "seisme", "meteorite", "aurore boreale", "constellation", "voie lactee", "galaxie", "trou noir", "horloge comtoise", "gramophone",
    "croque-monsieur", "tire-bouchon", "court-circuit", "abat-jour", "coffre-fort", "essuie-glace", "gratte-ciel", "porte-cles",
    "garde-manger", "wagon-lit", "garde-fou", "tourne-disque", "haut-parleur", "four a micro-ondes", "seche-cheveux", "rouge-gorge", "poisson-clown",
    "machine a laver", "fer a repasser", "aspirateur autonome", "presse-agrumes", "grille-pain", "bouilloire", "planche a decouper",
    "tirelire", "porte-documents", "carte bancaire", "distributeur de billets", "roulette de casino", "jeton de jeu", "table de billard",
    "deboucheur", "escabeau", "niveau a bulle", "cle a molette", "rabot", "etabli", "boite a outils", "brouette a moteur",
    "pulverisateur", "arrosoir", "serpette", "secateur", "rateau", "beche", "faux", "meuleuse", "visseuse",
    "ventilateur de plafond", "climatiseur", "deshumidificateur", "radiateur en fonte", "cheminee", "poele a bois",
    "lustre en cristal", "applique murale", "lampadaire halogene", "fauteuil a bascule", "canape d angle", "table basse"
  ],

  // 5. Professionnel & Métiers techniques - 100% français
  professionnel: [
    "stethoscope", "scalpel", "architecte", "echafaudage", "brancard", "chirurgien", "mecanicien", "electricien", "plombier", "geometre",
    "soudeur", "apiculteur", "archeologue", "veterinaire", "ebeniste", "notaire", "comptable", "pilote de ligne", "aiguilleur du ciel", "grutier",
    "macon", "traducteur", "sommelier", "torrefacteur", "joaillier", "taxidermiste", "cardiologue", "anesthesiste", "topographe", "serrurier",
    "cordonnier", "horloger", "opticien", "pharmacien", "radiologue", "meteorologue", "oceanographe", "astronome", "paleontologue", "geologue",
    "sapeur-pompier", "garde-forestier", "aide-soignant", "sage-femme", "chirurgien-dentiste", "chef-cuisinier", "conducteur de train",
    "capitaine de navire", "avocat general", "juge d instruction", "greffier", "maitre-nageur", "professeur de gymnastique", "moniteur de ski",
    "paysagiste", "viticulteur", "brasseur", "boulanger", "patissier", "chocolatier", "boucher", "poissonnier", "fleuriste", "antiquaire",
    "commissaire-priseur", "restaurateur d art", "luthier", "relieur", "vitrier", "couvreur", "charpentier", "platrier",
    "peintre en batiment", "carreleur", "chaudronnier", "tuyauteur", "ajusteur-monteur", "dessinateur industriel", "urbaniste",
    "ingenieur du son", "regisseur lumiere", "cadreur", "perchiste", "maquilleur de cinema", "costumier", "cascadeur",
    "douanier", "garde-cote", "policier scientifique", "enqueteur", "gendarme motocycliste", "convoyeur de fonds"
  ],

  // 6. Scientifique & Recherche - 100% français
  scientifique: [
    "microscope", "telescope", "molecule", "atome", "eprouvette", "gravite", "cellule", "sismographe", "centrifugeuse", "fossile",
    "superconducteur", "accelerateur de particules", "asteroide", "comete", "magnetisme", "chromosome", "adn", "prisme", "diffraction", "equation",
    "pipette", "becher", "bec bunsen", "thermometre", "electrode", "cristal", "photosynthese", "bioluminescence", "antimatiere", "faisceau lumineux",
    "spectrometre", "radiographie", "ultrason", "infrarouge", "tableau periodique", "champ magnetique", "fusion nucleaire", "conducteur",
    "pendule de foucault", "nanoparticule", "rayons x", "trou noir", "supernova", "etoile filante", "micro-organisme",
    "catalyseur", "reaction en chaine", "chambre a vide", "spectre lumineux", "pression atmospherique", "densite",
    "fission nucleaire", "conductivite", "semi-conducteur", "diode", "transistor", "oscilloscope", "generateur electrostatique",
    "bobine electrique", "effet doppler", "theorie de la relativite", "entropie", "energie cinetique", "force centrifuge",
    "refraction", "polarisation", "interferences", "chambre a brouillard", "compteur de rayonnement", "barreau aimante",
    "reacteur a fusion", "satellite orbital", "sonde spatiale", "bouclier thermique", "capsule spatiale", "vehicule martien"
  ],

  // 7. Coquin & Érotique (+18 chic, sensuel, bon enfant) - 100% français
  coquin: [
    "lingerie", "dentelle", "jarretiere", "menottes", "porte-jarretelles", "decollete", "baiser passionne", "preliminaires", "massage sensuel", "caresse",
    "lit a baldaquin", "draps de satin", "nuisette", "petite culotte", "calecon", "maillot de bain", "bain de vapeur", "bain bouillonnant", "huile de massage", "plume de caresse",
    "bandeau sur les yeux", "bougie parfumee", "fessee coquine", "calin fougueux", "frisson", "rouge a levres", "talons aiguilles", "deshabille",
    "peignoir de soie", "bain moussant", "effeuillage", "danse acrobatique", "chuchotement", "morsure", "regard de braise", "dessous coquins", "corset",
    "guepiere", "collants resille", "body en dentelle", "pommade", "glacon", "plumeau", "baiser dans le cou", "masque venitien", "douche a deux",
    "nuiteuse", "caraco", "porte-bonheur", "chuchotis", "ruban de satin", "volupte", "tentation", "extase"
  ]
};

// ─────────────────────────────────────────────────────────────────
// DICTIONNAIRE DE MOTS FRANÇAIS CONNUS (Protection contre faux positifs)
// Permet de distinguer un mot mal orthographié d'un VRAI autre mot français
// (ex: "chapeau" est un vrai mot français != "chateau" -> NE PAS accepter comme faute d'orthographe)
// ─────────────────────────────────────────────────────────────────
export const COMMON_FRENCH_WORDS = new Set([
  // Mots du jeu
  ...Object.values(WORD_CATEGORIES).flat().map(w => w.trim().toLowerCase()),
  // Paires minimales et mots français très fréquents
  "chapeau", "chateau", "gateau", "bateau", "rateau", "plateau", "manteau", "coteau",
  "poisson", "poison", "boisson", "moisson", "buisson", "cuisson",
  "cousin", "coussin", "bassin", "raisin", "dessin",
  "table", "cable", "sable", "fable", "etable",
  "poule", "moule", "boule", "foule", "roule", "houle",
  "chat", "char", "rat", "plat", "mat", "pot", "mot", "sot", "lot", "rot",
  "pomme", "porte", "poste", "ponte", "pente", "perle", "tarte",
  "pain", "bain", "main", "nain", "gain", "train", "grain", "foin", "soin",
  "rabot", "robot", "sabot", "lingot", "tricot",
  "souris", "sourire", "soupir", "souche",
  "carotte", "culotte", "pelote", "calotte",
  "lit", "lot", "nid", "vis", "fil", "fer",
  "robe", "rose", "roue", "route", "roche",
  "tasse", "masse", "basse", "casse", "passe", "classe",
  "colle", "sole", "vole", "tole", "mole",
  "bebe", "tube", "cube", "globe",
  "jambe", "rampe", "lampe", "tempe",
  "singe", "linge", "ange", "lange",
  "vent", "dent", "gant", "banc", "pont", "fond", "rond", "front",
  "cheval", "cheveu", "chenil",
  "livre", "lievre", "levre", "cuivre",
  "terre", "verre", "pierre", "guerre",
  "carte", "tarte", "certe", "tente", "fente", "vente",
  "loup", "coup", "bout", "pont", "port", "porc", "parc",
  "pluie", "proie", "plaie",
  "neige", "siege", "piege",
  "fleur", "coeur", "soeur", "peur",
  "arbre", "marbre",
  "fraise", "chaise", "braise",
  "bague", "vague", "digue",
  "nuage", "cage", "page", "nage", "plage", "orage"
]);

// ─────────────────────────────────────────────────────────────────
// GESTION DU "SAC DE TIRAGE SANS REMISE" (Deck / Shuffle Bag)
// Garantit ZERO répétition jusqu'à épuisement complet de la catégorie
// ─────────────────────────────────────────────────────────────────
const categoryDecks = new Map();
const globalRecentlyUsed = new Set();

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

// Normalisation du singulier / pluriel
function normalizePlural(str) {
  const s = normalizeStrict(str);
  if (s.length > 3 && (s.endsWith('s') || s.endsWith('x'))) {
    return s.slice(0, -1);
  }
  return s;
}

// Simplification phonétique française pour rattraper les fautes de frappe réelles
function phoneticSimplify(str) {
  let s = normalizeStrict(str);
  // Réduire les consonnes doubles en simples (ex: "botte" -> "bote", "ballon" -> "balon")
  s = s.replace(/([bcdfghjklmnpqrstvwxz])\1+/g, '$1');
  // Équivalences phonétiques courantes
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
// VÉRIFICATION DU MOT (EXACT vs FUZZY/ORTHOGRAPHE vs AUTRE VRAI MOT)
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

  // Pluriels irréguliers français
  if (
    (sGuess === 'yeux' && sSecret === 'oeil') || (sGuess === 'oeil' && sSecret === 'yeux') ||
    (sGuess === 'chevaux' && sSecret === 'cheval') || (sGuess === 'cheval' && sSecret === 'chevaux') ||
    (sGuess === 'oiseaux' && sSecret === 'oiseau') || (sGuess === 'oiseau' && sSecret === 'oiseaux')
  ) {
    return { match: true, exact: false, reason: 'pluriel' };
  }

  // 3. RÈGLE CRUCIALE : Si la proposition est un AUTRE VRAI MOT FRANÇAIS connu
  // (ex: Secret = "chateau", Proposition = "chapeau" -> "chapeau" est un vrai mot qui signifie autre chose !)
  // Il ne faut EN AUCUN CAS l'accepter comme une faute d'orthographe !
  const isGuessRealWord = COMMON_FRENCH_WORDS.has(sGuess) || COMMON_FRENCH_WORDS.has(lGuess);
  if (isGuessRealWord && sGuess !== sSecret) {
    // C'est un vrai mot différent, rejeté immédiatement !
    return { match: false, close: getLevenshteinDistance(sGuess, sSecret) === 1 };
  }

  // 4. Fautes d'orthographe reconnues par simplification phonétique
  // (ex: "cangourou" vs "kangourou", "bote" vs "botte", "daufin" vs "dauphin")
  const phonGuess = phoneticSimplify(sGuess);
  const phonSecret = phoneticSimplify(sSecret);
  if (phonGuess === phonSecret) {
    return { match: true, exact: false, reason: 'orthographe' };
  }

  // 5. Coquille de frappe / Omission ou addition d'une lettre sur un mot inexistant
  // (ex: "kangouro" pour "kangourou" [omission], "chateeau" pour "chateau" [addition])
  // NE S'APPLIQUE PAS aux substitutions de lettres qui changent la racine (ex: "chapeau" != "chateau")
  const dist = getLevenshteinDistance(sGuess, sSecret);
  const lenDiff = Math.abs(sGuess.length - sSecret.length);

  // Si même longueur et dist == 1, c'est une substitution de lettre (ex: 'p' pour 't').
  // Comme ce n'est pas phonétique (déjà testé plus haut), ce n'est PAS une faute d'orthographe valide.
  if (lenDiff === 0 && dist === 1) {
    return { match: false, close: true };
  }

  // Omission ou lettre en trop sur mot d'au moins 5 lettres
  if (dist === 1 && lenDiff === 1 && sSecret.length >= 5) {
    return { match: true, exact: false, reason: 'orthographe' };
  }

  // Mot long (>= 8 lettres) avec petite coquille phonétique ou faute d'inattention
  if (dist <= 2 && sSecret.length >= 8 && !isGuessRealWord) {
    return { match: true, exact: false, reason: 'orthographe' };
  }

  return { match: false, close: dist === 1 };
}

export function isWordMatch(guess, secret) {
  const res = checkWordMatch(guess, secret);
  return res.match;
}

// ─────────────────────────────────────────────────────────────────
// ALGORITHME DE SÉLECTION DE MOTS SANS RÉPÉTITION (3 CHOIX)
// ─────────────────────────────────────────────────────────────────
export function getRandomWordChoices(category = "all", customWords = [], roomUsedWords = null) {
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

  let attempts = 0;
  while (picked.length < 3 && deck.length > 0 && attempts < 50) {
    attempts++;
    const candidate = deck.pop();
    const strictCand = normalizeStrict(candidate);

    if (roomUsedWords && roomUsedWords.has(strictCand)) {
      deck.unshift(candidate);
      continue;
    }

    picked.push(candidate);
    globalRecentlyUsed.add(strictCand);
    if (globalRecentlyUsed.size > 250) {
      const firstItem = globalRecentlyUsed.values().next().value;
      globalRecentlyUsed.delete(firstItem);
    }
  }

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

export function getRandomWord(category = "all", usedWordsSet = null) {
  const choices = getRandomWordChoices(category, [], usedWordsSet);
  const chosen = choices[Math.floor(Math.random() * choices.length)];
  if (usedWordsSet && chosen) {
    usedWordsSet.add(normalizeStrict(chosen));
  }
  return chosen;
}
