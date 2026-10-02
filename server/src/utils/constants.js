// Game configuration constants
export const GAME_CONFIG = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 12,
  DEFAULT_ROUNDS: 3,
  DEFAULT_ROUND_TIME: 80, // seconds
  WORD_CHOICES: 3,
  MIN_WORD_LENGTH: 4,
  MAX_WORD_LENGTH: 20,
};

// Scoring configuration
export const SCORING = {
  BASE_DRAWER_POINTS: 50,
  DRAWER_POINTS_PER_GUESS: 25,
  MAX_GUESSER_POINTS: 150,
  MIN_GUESSER_POINTS: 50,
};

// Hint configuration
export const HINTS = {
  REVEAL_INTERVALS: [0.25, 0.5, 0.75], // Reveal hints at 25%, 50%, 75% of round time
  LETTERS_TO_REVEAL: 0.3, // Reveal 30% of letters as hints
};

// Rate limiting
export const RATE_LIMITS = {
  CHAT_MESSAGE_DELAY: 100, // milliseconds between messages
  GUESS_DELAY: 50, // milliseconds between guesses
  MAX_MESSAGE_LENGTH: 200,
};

// Room configuration
export const ROOM_CONFIG = {
  CODE_LENGTH: 6,
  CODE_CHARSET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  PUBLIC_ROOM_PREFIX: 'PUBLIC_',
  IDLE_TIMEOUT: 1800000, // 30 minutes in milliseconds
};

// Game states
export const GAME_STATES = {
  LOBBY: 'LOBBY',
  CHOOSING_WORD: 'CHOOSING_WORD',
  DRAWING: 'DRAWING',
  ROUND_END: 'ROUND_END',
  GAME_END: 'GAME_END',
};

// Player states
export const PLAYER_STATES = {
  WAITING: 'WAITING',
  DRAWING: 'DRAWING',
  GUESSING: 'GUESSING',
  GUESSED_CORRECTLY: 'GUESSED_CORRECTLY',
};

export default {
  GAME_CONFIG,
  SCORING,
  HINTS,
  RATE_LIMITS,
  ROOM_CONFIG,
  GAME_STATES,
  PLAYER_STATES,
};
