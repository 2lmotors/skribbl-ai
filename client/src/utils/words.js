// Catégories et tranches d'âge disponibles dans LaPlume

export const AGE_CATEGORIES = [
  { id: 'all', label: '🌟 Tous les styles mélangés', age: 'Tout public' },
  { id: 'kids_4_6', label: '👶 4 à 6 ans (Tout-petits)', age: 'Mots très simples et visuels' },
  { id: 'kids_7_9', label: '🧒 7 à 9 ans (Juniors)', age: 'Objets du quotidien & contes' },
  { id: 'teens_10_14', label: '🎧 10 à 14 ans (Ados & Pop)', age: 'Gaming, tech, réseaux, jargon' },
  { id: 'adults', label: '🧑 Adultes (Général & Varié)', age: 'Culture générale, facile à relevé' },
  { id: 'professionnel', label: '💼 Métiers & Professionnel', age: 'Outils spécialisés & carrières' },
  { id: 'scientifique', label: '🔬 Scientifique & Expert', age: 'Laboratoire, espace, physique' },
  { id: 'coquin', label: '🔞 Coquin & Sensuel (+18)', age: 'Séduction, chic et coquin (correct)' },
];

export const CLIENT_WORDS = {
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
  teens_10_14: [
    "manette", "trottinette", "youtubeur", "selfie", "casque audio", "smartphone", "manga", "streaming", "hoverboard", "sneakers",
    "hoodie", "smoothie", "kebab", "emoji", "wifi", "drone", "cosplay", "console", "clavier gamer", "microphone",
    "pixel", "bluetooth", "skateboard", "roller", "bubble tea", "popcorn", "streamer", "challenge", "playlist", "avatar",
    "escape game", "laser game", "roller coaster", "street art", "graffiti", "beatbox", "casquette", "airpods", "carte graphique",
    "powerbank", "stickers", "tatouage", "piercing", "sweat", "anime", "pikachu", "spiderman", "batman", "superman",
    "iron man", "star wars", "sabrelaser", "zelda", "mario", "minecraft", "creeper", "sonic", "fortnite", "battle royale",
    "ninja", "samourai", "viking", "zombie", "alien", "cyborg", "vaisseau spatial", "hologramme", "auto-tamponneuse", "casque-vr",
    "trottinette-electrique", "roller-blade", "parc d attraction", "salle d arcade", "karaoke", "ring de boxe", "skatepark"
  ],
  adults: [
    "pendule", "hypotheque", "nostalgie", "somnambule", "labyrinthe", "crepuscule", "eclipse", "sablier", "boussole", "bousculade",
    "thermometre", "cafetiere", "kaleidoscope", "trampoline", "sarcophage", "parachute", "telecommande", "boomerang", "origami", "karaoke",
    "saxophone", "clarinette", "contrebasse", "barometre", "girouette", "rond-point", "sommelier", "vitrail", "amphitheatre", "catacombes",
    "statue de la liberte", "tour eiffel", "arc de triomphe", "colisee", "pyramide", "sphinx", "tour de pise", "big ben", "taj mahal", "gondole",
    "embouteillage", "parcmetre", "brouette", "tondeuse", "tronconneuse", "perceuse", "echafaudage", "gruyere", "raclette", "fondue",
    "caviar", "champagne", "cocktail", "mojito", "cigare", "pipe", "narguile", "brouillard", "avalanche", "tsunami",
    "tornade", "seisme", "meteorite", "aurore boreale", "constellation", "voie lactee", "galaxie", "trou noir", "horloge comtoise", "gramophone",
    "croque-monsieur", "tire-bouchon", "court-circuit", "abat-jour", "coffre-fort", "essuie-glace", "gratte-ciel", "porte-cles",
    "garde-manger", "wagon-lit", "garde-fou", "tourne-disque", "haut-parleur", "micro-ondes", "seche-cheveux", "rouge-gorge", "poisson-clown"
  ],
  professionnel: [
    "stethoscope", "scalpel", "architecte", "echafaudage", "brancard", "chirurgien", "mecanicien", "electricien", "plombier", "geometre",
    "soudeur", "apiculteur", "archeologue", "veterinaire", "ebeniste", "notaire", "comptable", "pilote de ligne", "aiguilleur du ciel", "grutier",
    "macon", "traducteur", "sommelier", "torrefacteur", "joaillier", "taxidermiste", "cardiologue", "anesthesiste", "topographe", "serrurier",
    "sapeur-pompier", "garde-forestier", "aide-soignant", "sage-femme", "chirurgien-dentiste", "chef-cuisinier", "conducteur de train"
  ],
  scientifique: [
    "microscope", "telescope", "molecule", "atome", "eprouvette", "gravite", "cellule", "sismographe", "centrifugeuse", "fossile",
    "superconducteur", "accelerateur de particules", "asteroide", "comete", "magnetisme", "chromosome", "adn", "prisme", "diffraction", "equation",
    "pipette", "becher", "bec bunsen", "thermometre", "electrode", "cristal", "photosynthese", "bioluminescence", "antimatiere", "laser",
    "rayon-x", "trou-noir", "super-nova", "etoile-filante", "micro-organisme", "anti-matiere"
  ],
  coquin: [
    "lingerie", "dentelle", "jarretiere", "menottes", "porte-jarretelles", "decollete", "baiser passionne", "preliminaires", "massage sensuel", "caresse",
    "lit a baldaquin", "draps de satin", "nuisette", "string", "boxer", "bikini", "sauna", "jacuzzi", "huile de massage", "plume de caresse",
    "bandeau sur les yeux", "bougie parfumee", "fessee coquine", "calin fougueux", "frisson", "rouge a levres", "talons aiguilles", "deshabille",
    "peignoir de soie", "bain moussant", "strip-tease", "pole dance", "chuchotement", "morsure", "regard de braise", "dessous coquins", "corset"
  ]
};

// Ensemble de mots déjà tirés pour le mode Solo pour éviter les répétitions
const usedSoloWords = new Set();

export function getWordForCategory(categoryId = 'all') {
  let list = [];
  if (categoryId === 'all' || !CLIENT_WORDS[categoryId]) {
    list = Object.entries(CLIENT_WORDS)
      .filter(([k]) => k !== 'coquin')
      .map(([, v]) => v)
      .flat();
  } else {
    list = CLIENT_WORDS[categoryId];
  }

  // Filtrer les mots déjà apparus
  let available = list.filter(w => !usedSoloWords.has(w.toLowerCase()));
  if (available.length === 0) {
    usedSoloWords.clear();
    available = list;
  }

  const chosen = available[Math.floor(Math.random() * available.length)];
  usedSoloWords.add(chosen.toLowerCase());
  return chosen;
}
