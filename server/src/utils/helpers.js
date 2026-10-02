import { ROOM_CONFIG, HINTS } from './constants.js';

// Generate a random room code
export function generateRoomCode() {
  let code = '';
  for (let i = 0; i < ROOM_CONFIG.CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * ROOM_CONFIG.CODE_CHARSET.length);
    code += ROOM_CONFIG.CODE_CHARSET[randomIndex];
  }
  return code;
}

// Calculate similarity between two strings (for "close guess" detection)
export function calculateSimilarity(str1, str2) {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;

  // Check if one is contained in the other
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.8;
  }

  // Calculate Levenshtein distance
  const matrix = [];

  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
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

  const distance = matrix[s2.length][s1.length];
  const maxLength = Math.max(s1.length, s2.length);
  return 1 - distance / maxLength;
}

// Check if a guess is correct
export function isCorrectGuess(guess, word) {
  return guess.toLowerCase().trim() === word.toLowerCase().trim();
}

// Check if a guess is close
export function isCloseGuess(guess, word) {
  const similarity = calculateSimilarity(guess, word);
  return similarity >= 0.6 && similarity < 1;
}

// Create a masked version of the word (e.g., "apple" -> "_ _ _ _ _")
export function getMaskedWord(word, revealedIndices = []) {
  return word.split('').map((char, index) => {
    if (char === ' ') return ' ';
    if (revealedIndices.includes(index)) return char;
    return '_';
  }).join(' ');
}

// Get indices of letters to reveal as hints
export function getHintIndices(word, revealPercent) {
  const lettersOnly = [];
  word.split('').forEach((char, index) => {
    if (char !== ' ') {
      lettersOnly.push(index);
    }
  });

  const numToReveal = Math.max(1, Math.floor(lettersOnly.length * revealPercent));
  const shuffled = [...lettersOnly].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, numToReveal);
}

// Calculate points for a guesser based on time remaining
export function calculateGuesserPoints(timeElapsed, totalTime, baseMax, baseMin) {
  const timeRatio = 1 - (timeElapsed / totalTime);
  const points = Math.floor(baseMin + (baseMax - baseMin) * timeRatio);
  return Math.max(baseMin, Math.min(baseMax, points));
}

// Calculate when to reveal hints during a round
export function getHintTimings(roundDuration) {
  return HINTS.REVEAL_INTERVALS.map(interval =>
    Math.floor(roundDuration * (1 - interval))
  );
}

// Sanitize user input
export function sanitizeInput(input, maxLength) {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

// Validate player name
export function isValidPlayerName(name) {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 20;
}

// Validate room settings
export function validateRoomSettings(settings) {
  const validated = {};

  if (settings.rounds && Number.isInteger(settings.rounds)) {
    validated.rounds = Math.max(1, Math.min(10, settings.rounds));
  }

  if (settings.roundTime && Number.isInteger(settings.roundTime)) {
    validated.roundTime = Math.max(30, Math.min(180, settings.roundTime));
  }

  if (settings.maxPlayers && Number.isInteger(settings.maxPlayers)) {
    validated.maxPlayers = Math.max(2, Math.min(12, settings.maxPlayers));
  }

  return validated;
}

export default {
  generateRoomCode,
  calculateSimilarity,
  isCorrectGuess,
  isCloseGuess,
  getMaskedWord,
  getHintIndices,
  calculateGuesserPoints,
  getHintTimings,
  sanitizeInput,
  isValidPlayerName,
  validateRoomSettings,
};
