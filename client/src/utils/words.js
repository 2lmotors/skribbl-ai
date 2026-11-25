// Client-side dictionary & shuffle deck for Solo AI mode & local preview
import { WORD_CATEGORIES, getRandomWordChoices as serverChoices, normalizeStrict, normalizeLoose, checkWordMatch } from '../../../server/game/words.js';

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

export const CLIENT_WORDS = WORD_CATEGORIES;

const usedSoloWords = new Set();

export function getWordForCategory(categoryId = 'all') {
  const choices = serverChoices(categoryId, [], usedSoloWords);
  const word = choices[0] || 'soleil';
  usedSoloWords.add(normalizeStrict(word));
  if (usedSoloWords.size > 200) {
    usedSoloWords.clear();
  }
  return word;
}

export { checkWordMatch, normalizeStrict, normalizeLoose };
