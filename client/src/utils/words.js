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
    "neige", "echelle", "roue", "cloche", "oeuf", "fourchette", "bougie", "glace", "toboggan", "balancoire",
    "bateau", "avion", "poire", "fraise", "biberon", "poupee", "doudou"
  ],
  kids_7_9: [
    "chateau", "dauphin", "helicoptere", "astronaute", "pirate", "licorne", "dinosaure", "requin", "tambour", "volcan",
    "montre", "parapluie", "telescope", "guitare", "couronne", "sabre", "tresor", "boussole", "kangourou", "girafe",
    "panda", "hibou", "magicien", "princesse", "chevalier", "monstre", "fantome", "robot", "sirene", "fusee",
    "phare", "tente", "skateboard", "jumelles", "labyrinthe", "cartable", "microscope", "parachute", "sous-marin", "igloo",
    "montgolfiere", "moulin", "cascade", "arc-en-ciel", "patins", "flute", "accordeon", "violon", "pizza", "hamburger",
    "croissant", "crepe", "baguette magique", "tapis volant", "dragon", "bouclier", "epee", "potion", "chameau", "perroquet"
  ],
  teens_10_14: [
    "manette", "trottinette", "youtubeur", "selfie", "casque audio", "smartphone", "manga", "streaming", "hoverboard", "sneakers",
    "hoodie", "smoothie", "kebab", "emoji", "wifi", "drone", "cosplay", "console", "clavier gamer", "microphone",
    "pixel", "bluetooth", "skateboard", "roller", "bubble tea", "popcorn", "streamer", "challenge", "playlist", "avatar",
    "escape game", "laser game", "roller coaster", "street art", "graffiti", "beatbox", "casquette", "airpods", "carte graphique",
    "powerbank", "stickers", "tatouage", "sweat", "anime", "pikachu", "spiderman", "batman", "sabrelaser", "mario", "minecraft"
  ],
  adults: [
    "pendule", "hypotheque", "nostalgie", "somnambule", "labyrinthe", "crepuscule", "eclipse", "sablier", "boussole", "bousculade",
    "thermometre", "cafetiere", "kaleidoscope", "trampoline", "sarcophage", "parachute", "telecommande", "boomerang", "origami", "karaoke",
    "saxophone", "clarinette", "contrebasse", "barometre", "girouette", "rond-point", "sommelier", "vitrail", "amphitheatre", "catacombes",
    "tour eiffel", "arc de triomphe", "colisee", "pyramide", "sphinx", "tour de pise", "big ben", "taj mahal", "gondole", "embouteillage"
  ],
  professionnel: [
    "stethoscope", "scalpel", "architecte", "echafaudage", "brancard", "chirurgien", "mecanicien", "electricien", "plombier", "geometre",
    "soudeur", "apiculteur", "archeologue", "veterinaire", "ebeniste", "notaire", "comptable", "pilote de ligne", "aiguilleur", "grutier",
    "macon", "traducteur", "sommelier", "torrefacteur", "joaillier", "taxidermiste", "cardiologue", "anesthesiste", "topographe", "horloger"
  ],
  scientifique: [
    "microscope", "telescope", "molecule", "atome", "eprouvette", "gravite", "cellule", "sismographe", "centrifugeuse", "fossile",
    "superconducteur", "accelerateur de particules", "asteroide", "comete", "magnetisme", "chromosome", "adn", "prisme", "diffraction", "equation",
    "pipette", "becher", "bec bunsen", "thermometre", "electrode", "cristal", "photosynthese", "bioluminescence", "antimatiere", "laser"
  ],
  coquin: [
    "lingerie", "dentelle", "jarretiere", "menottes", "porte-jarretelles", "decollete", "baiser passionne", "preliminaires", "massage sensuel", "caresse",
    "lit a baldaquin", "draps de satin", "nuisette", "string", "boxer", "bikini", "sauna", "jacuzzi", "huile de massage", "plume de caresse",
    "bandeau sur les yeux", "bougie parfumee", "fessee coquine", "calin fougueux", "frisson", "rouge a levres", "talons aiguilles", "deshabille", "strip-tease", "pole dance"
  ]
};

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
  return list[Math.floor(Math.random() * list.length)];
}
