// Word lists for different difficulty levels
export const EASY_WORDS = [
  'cat', 'dog', 'sun', 'moon', 'star', 'tree', 'fish', 'bird', 'car', 'book',
  'apple', 'house', 'smile', 'heart', 'cloud', 'rain', 'snow', 'fire', 'water', 'pizza',
  'chair', 'table', 'phone', 'clock', 'door', 'window', 'flower', 'grass', 'ball', 'cake',
  'hat', 'shoe', 'sock', 'pants', 'shirt', 'hand', 'foot', 'eye', 'nose', 'mouth',
  'guitar', 'piano', 'drum', 'butterfly', 'rainbow', 'mountain', 'beach', 'ocean', 'island', 'bridge',
];

export const MEDIUM_WORDS = [
  'elephant', 'giraffe', 'penguin', 'dolphin', 'octopus', 'squirrel', 'raccoon', 'hedgehog', 'flamingo', 'peacock',
  'volcano', 'lighthouse', 'castle', 'pyramid', 'fountain', 'statue', 'telescope', 'microscope', 'compass', 'anchor',
  'painting', 'sculpture', 'photograph', 'camera', 'microphone', 'keyboard', 'monitor', 'laptop', 'tablet', 'printer',
  'sandwich', 'hamburger', 'spaghetti', 'cupcake', 'donut', 'pretzel', 'popcorn', 'broccoli', 'carrot', 'tomato',
  'skateboard', 'bicycle', 'motorcycle', 'airplane', 'helicopter', 'rocket', 'submarine', 'sailboat', 'parachute', 'umbrella',
];

export const HARD_WORDS = [
  'astronaut', 'scientist', 'architect', 'conductor', 'magician', 'detective', 'journalist', 'firefighter', 'veterinarian', 'librarian',
  'tornado', 'earthquake', 'avalanche', 'constellation', 'eclipse', 'glacier', 'stalactite', 'thunderstorm', 'whirlpool', 'quicksand',
  'chandelier', 'trampoline', 'xylophone', 'harmonica', 'accordion', 'tambourine', 'maracas', 'bongos', 'clarinet', 'saxophone',
  'kangaroo', 'platypus', 'armadillo', 'chameleon', 'porcupine', 'walrus', 'narwhal', 'meerkat', 'lemur', 'koala',
  'hieroglyphics', 'labyrinth', 'constellation', 'boomerang', 'sphinx', 'catapult', 'guillotine', 'windmill', 'scarecrow', 'gingerbread',
];

// Get random words from all difficulty levels
export function getRandomWords(count = 3) {
  const allWords = [...EASY_WORDS, ...MEDIUM_WORDS, ...HARD_WORDS];
  const shuffled = allWords.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Get words from specific difficulty
export function getWordsByDifficulty(difficulty = 'medium', count = 3) {
  let wordList;
  switch (difficulty.toLowerCase()) {
    case 'easy':
      wordList = EASY_WORDS;
      break;
    case 'hard':
      wordList = HARD_WORDS;
      break;
    default:
      wordList = MEDIUM_WORDS;
  }

  const shuffled = [...wordList].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default {
  EASY_WORDS,
  MEDIUM_WORDS,
  HARD_WORDS,
  getRandomWords,
  getWordsByDifficulty,
};
