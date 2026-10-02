export const AVATARS = [
  '😀', '😎', '🤓', '😊', '🥳', '🤠', '😺', '🦊',
  '🐶', '🐱', '🐼', '🐨', '🦁', '🐯', '🐸', '🐰',
  '🦄', '🐷', '🐵', '🦉', '🐙', '🦋', '🐝', '🦖'
];

export const COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FF6B6B', '#4ECDC4',
  '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE',
  '#85C1E2', '#F8B739', '#52B788', '#E76F51', '#2A9D8F'
];

export const BRUSH_SIZES = [2, 5, 10, 15, 20];

export const GAME_STATES = {
  HOME: 'HOME',
  LOBBY: 'LOBBY',
  CHOOSING_WORD: 'CHOOSING_WORD',
  DRAWING: 'DRAWING',
  ROUND_END: 'ROUND_END',
  GAME_END: 'GAME_END',
};

export const PLAYER_STATES = {
  WAITING: 'WAITING',
  DRAWING: 'DRAWING',
  GUESSING: 'GUESSING',
  GUESSED_CORRECTLY: 'GUESSED_CORRECTLY',
};

export default {
  AVATARS,
  COLORS,
  BRUSH_SIZES,
  GAME_STATES,
  PLAYER_STATES,
};
