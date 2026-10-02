import { GAME_CONFIG, GAME_STATES, PLAYER_STATES, SCORING } from '../utils/constants.js';
import { generateRoomCode } from '../utils/helpers.js';

export class GameRoom {
  constructor(isPublic = false, host = null) {
    this.roomCode = generateRoomCode();
    this.isPublic = isPublic;
    this.host = host;
    this.players = new Map();
    this.gameState = GAME_STATES.LOBBY;
    this.settings = {
      rounds: GAME_CONFIG.DEFAULT_ROUNDS,
      roundTime: GAME_CONFIG.DEFAULT_ROUND_TIME,
      maxPlayers: GAME_CONFIG.MAX_PLAYERS,
    };
    this.currentRound = 0;
    this.currentDrawer = null;
    this.currentWord = null;
    this.wordChoices = [];
    this.drawingData = [];
    this.revealedHintIndices = [];
    this.roundStartTime = null;
    this.roundTimer = null;
    this.playerOrder = [];
    this.roundScores = new Map();
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
  }

  addPlayer(socketId, playerData) {
    const player = {
      id: socketId,
      name: playerData.name,
      avatar: playerData.avatar || this.getRandomAvatar(),
      score: 0,
      state: PLAYER_STATES.WAITING,
      hasGuessedCorrectly: false,
      isHost: this.players.size === 0,
    };

    this.players.set(socketId, player);

    if (this.players.size === 1) {
      this.host = socketId;
    }

    this.lastActivity = Date.now();
    return player;
  }

  removePlayer(socketId) {
    const player = this.players.get(socketId);
    this.players.delete(socketId);

    // Reassign host if needed
    if (this.host === socketId && this.players.size > 0) {
      const newHost = this.players.keys().next().value;
      this.host = newHost;
      const newHostPlayer = this.players.get(newHost);
      if (newHostPlayer) {
        newHostPlayer.isHost = true;
      }
    }

    this.lastActivity = Date.now();
    return player;
  }

  getPlayer(socketId) {
    return this.players.get(socketId);
  }

  getPlayers() {
    return Array.from(this.players.values());
  }

  updateSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    this.lastActivity = Date.now();
  }

  startGame() {
    if (this.players.size < GAME_CONFIG.MIN_PLAYERS) {
      return false;
    }

    this.gameState = GAME_STATES.CHOOSING_WORD;
    this.currentRound = 1;
    this.playerOrder = Array.from(this.players.keys());
    this.shufflePlayerOrder();
    this.currentDrawer = this.playerOrder[0];

    // Update player states
    this.players.forEach((player, id) => {
      player.state = id === this.currentDrawer
        ? PLAYER_STATES.DRAWING
        : PLAYER_STATES.GUESSING;
      player.hasGuessedCorrectly = false;
    });

    this.lastActivity = Date.now();
    return true;
  }

  selectWord(word) {
    this.currentWord = word;
    this.wordChoices = [];
    this.gameState = GAME_STATES.DRAWING;
    this.roundStartTime = Date.now();
    this.revealedHintIndices = [];
    this.roundScores = new Map();
    this.lastActivity = Date.now();
  }

  addDrawingData(data) {
    this.drawingData.push(data);
    this.lastActivity = Date.now();
  }

  clearDrawing() {
    this.drawingData = [];
    this.lastActivity = Date.now();
  }

  processCorrectGuess(playerId) {
    const player = this.players.get(playerId);
    if (!player || player.hasGuessedCorrectly || player.id === this.currentDrawer) {
      return null;
    }

    player.hasGuessedCorrectly = true;
    player.state = PLAYER_STATES.GUESSED_CORRECTLY;

    const timeElapsed = (Date.now() - this.roundStartTime) / 1000;
    const points = this.calculateGuesserPoints(timeElapsed);

    player.score += points;
    this.roundScores.set(playerId, points);

    this.lastActivity = Date.now();
    return points;
  }

  calculateGuesserPoints(timeElapsed) {
    const timeRatio = 1 - (timeElapsed / this.settings.roundTime);
    const points = Math.floor(
      SCORING.MIN_GUESSER_POINTS +
      (SCORING.MAX_GUESSER_POINTS - SCORING.MIN_GUESSER_POINTS) * Math.max(0, timeRatio)
    );
    return Math.max(SCORING.MIN_GUESSER_POINTS, Math.min(SCORING.MAX_GUESSER_POINTS, points));
  }

  calculateDrawerPoints() {
    const correctGuesses = Array.from(this.players.values())
      .filter(p => p.hasGuessedCorrectly && p.id !== this.currentDrawer)
      .length;

    return SCORING.BASE_DRAWER_POINTS + (correctGuesses * SCORING.DRAWER_POINTS_PER_GUESS);
  }

  endRound() {
    const drawerPoints = this.calculateDrawerPoints();
    const drawer = this.players.get(this.currentDrawer);
    if (drawer) {
      drawer.score += drawerPoints;
    }

    const roundResults = {
      word: this.currentWord,
      drawerPoints,
      scores: Array.from(this.roundScores.entries()).map(([id, points]) => ({
        playerId: id,
        playerName: this.players.get(id)?.name,
        points,
      })),
    };

    this.gameState = GAME_STATES.ROUND_END;
    this.lastActivity = Date.now();

    return roundResults;
  }

  nextRound() {
    this.currentRound++;

    if (this.currentRound > this.settings.rounds) {
      this.gameState = GAME_STATES.GAME_END;
      this.lastActivity = Date.now();
      return false;
    }

    const currentDrawerIndex = this.playerOrder.indexOf(this.currentDrawer);
    const nextDrawerIndex = (currentDrawerIndex + 1) % this.playerOrder.length;
    this.currentDrawer = this.playerOrder[nextDrawerIndex];

    this.currentWord = null;
    this.wordChoices = [];
    this.drawingData = [];
    this.revealedHintIndices = [];
    this.roundScores = new Map();
    this.gameState = GAME_STATES.CHOOSING_WORD;

    // Reset player states
    this.players.forEach((player, id) => {
      player.state = id === this.currentDrawer
        ? PLAYER_STATES.DRAWING
        : PLAYER_STATES.GUESSING;
      player.hasGuessedCorrectly = false;
    });

    this.lastActivity = Date.now();
    return true;
  }

  endGame() {
    const finalScores = Array.from(this.players.values())
      .map(player => ({
        id: player.id,
        name: player.name,
        score: player.score,
        avatar: player.avatar,
      }))
      .sort((a, b) => b.score - a.score);

    this.gameState = GAME_STATES.GAME_END;
    this.lastActivity = Date.now();

    return finalScores;
  }

  resetGame() {
    this.gameState = GAME_STATES.LOBBY;
    this.currentRound = 0;
    this.currentDrawer = null;
    this.currentWord = null;
    this.wordChoices = [];
    this.drawingData = [];
    this.revealedHintIndices = [];
    this.roundStartTime = null;
    this.playerOrder = [];
    this.roundScores = new Map();

    this.players.forEach(player => {
      player.score = 0;
      player.state = PLAYER_STATES.WAITING;
      player.hasGuessedCorrectly = false;
    });

    this.lastActivity = Date.now();
  }

  shufflePlayerOrder() {
    for (let i = this.playerOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.playerOrder[i], this.playerOrder[j]] = [this.playerOrder[j], this.playerOrder[i]];
    }
  }

  getRandomAvatar() {
    const avatars = ['😀', '😎', '🤓', '😊', '🥳', '🤠', '🦊', '🐶', '🐱', '🐼', '🦁', '🐯'];
    return avatars[Math.floor(Math.random() * avatars.length)];
  }

  canStart() {
    return this.players.size >= GAME_CONFIG.MIN_PLAYERS &&
           this.gameState === GAME_STATES.LOBBY;
  }

  isFull() {
    return this.players.size >= this.settings.maxPlayers;
  }

  isEmpty() {
    return this.players.size === 0;
  }

  toJSON() {
    return {
      roomCode: this.roomCode,
      isPublic: this.isPublic,
      host: this.host,
      players: this.getPlayers(),
      gameState: this.gameState,
      settings: this.settings,
      currentRound: this.currentRound,
      currentDrawer: this.currentDrawer,
      playerCount: this.players.size,
    };
  }
}

export default GameRoom;
