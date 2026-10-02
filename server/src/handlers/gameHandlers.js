import { GAME_CONFIG, GAME_STATES, RATE_LIMITS } from '../utils/constants.js';
import {
  isValidPlayerName,
  sanitizeInput,
  validateRoomSettings,
  isCorrectGuess,
  isCloseGuess,
  getMaskedWord,
  getHintIndices,
} from '../utils/helpers.js';
import { getRandomWords } from '../words/wordLists.js';
import GameRoom from '../models/GameRoom.js';

const rooms = new Map();
const playerRooms = new Map();
const rateLimits = new Map();

// Helper to check rate limiting
function checkRateLimit(socketId, action, delay) {
  const key = `${socketId}:${action}`;
  const now = Date.now();
  const lastAction = rateLimits.get(key);

  if (lastAction && now - lastAction < delay) {
    return false;
  }

  rateLimits.set(key, now);
  return true;
}

// Helper to get room and validate player
function validatePlayerInRoom(socket, roomCode) {
  const room = rooms.get(roomCode);
  if (!room) {
    socket.emit('error', { message: 'Room not found' });
    return null;
  }

  const player = room.getPlayer(socket.id);
  if (!player) {
    socket.emit('error', { message: 'You are not in this room' });
    return null;
  }

  return { room, player };
}

export function setupGameHandlers(io, socket) {
  // Create a new room
  socket.on('create-room', ({ playerName, avatar, isPublic = false }) => {
    try {
      if (!isValidPlayerName(playerName)) {
        socket.emit('error', { message: 'Invalid player name' });
        return;
      }

      const room = new GameRoom(isPublic);
      rooms.set(room.roomCode, room);

      const player = room.addPlayer(socket.id, { name: playerName, avatar });
      playerRooms.set(socket.id, room.roomCode);

      socket.join(room.roomCode);

      socket.emit('room-created', {
        roomCode: room.roomCode,
        player,
        room: room.toJSON(),
      });

      console.log(`Room ${room.roomCode} created by ${playerName}`);
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('error', { message: 'Failed to create room' });
    }
  });

  // Join an existing room
  socket.on('join-room', ({ roomCode, playerName, avatar }) => {
    try {
      if (!isValidPlayerName(playerName)) {
        socket.emit('error', { message: 'Invalid player name' });
        return;
      }

      const room = rooms.get(roomCode);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      if (room.isFull()) {
        socket.emit('error', { message: 'Room is full' });
        return;
      }

      if (room.gameState !== GAME_STATES.LOBBY) {
        socket.emit('error', { message: 'Game already in progress' });
        return;
      }

      const player = room.addPlayer(socket.id, { name: playerName, avatar });
      playerRooms.set(socket.id, roomCode);

      socket.join(roomCode);

      socket.emit('room-joined', {
        roomCode,
        player,
        room: room.toJSON(),
        drawingData: room.drawingData,
      });

      io.to(roomCode).emit('player-joined', {
        player,
        players: room.getPlayers(),
      });

      console.log(`${playerName} joined room ${roomCode}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Update room settings
  socket.on('update-settings', ({ roomCode, settings }) => {
    try {
      const validation = validatePlayerInRoom(socket, roomCode);
      if (!validation) return;

      const { room, player } = validation;

      if (room.host !== socket.id) {
        socket.emit('error', { message: 'Only the host can update settings' });
        return;
      }

      if (room.gameState !== GAME_STATES.LOBBY) {
        socket.emit('error', { message: 'Cannot change settings during game' });
        return;
      }

      const validatedSettings = validateRoomSettings(settings);
      room.updateSettings(validatedSettings);

      io.to(roomCode).emit('settings-updated', {
        settings: room.settings,
      });

      console.log(`Settings updated in room ${roomCode}`);
    } catch (error) {
      console.error('Error updating settings:', error);
      socket.emit('error', { message: 'Failed to update settings' });
    }
  });

  // Start the game
  socket.on('start-game', ({ roomCode }) => {
    try {
      const validation = validatePlayerInRoom(socket, roomCode);
      if (!validation) return;

      const { room } = validation;

      if (room.host !== socket.id) {
        socket.emit('error', { message: 'Only the host can start the game' });
        return;
      }

      if (!room.canStart()) {
        socket.emit('error', { message: `Need at least ${GAME_CONFIG.MIN_PLAYERS} players to start` });
        return;
      }

      room.startGame();

      const wordChoices = getRandomWords(GAME_CONFIG.WORD_CHOICES);
      room.wordChoices = wordChoices;

      io.to(roomCode).emit('game-started', {
        gameState: room.gameState,
        currentRound: room.currentRound,
        totalRounds: room.settings.rounds,
        currentDrawer: room.currentDrawer,
        players: room.getPlayers(),
      });

      // Send word choices only to the drawer
      io.to(room.currentDrawer).emit('choose-word', {
        words: wordChoices,
      });

      console.log(`Game started in room ${roomCode}`);
    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit('error', { message: 'Failed to start game' });
    }
  });

  // Word selection by drawer
  socket.on('select-word', ({ roomCode, word }) => {
    try {
      const validation = validatePlayerInRoom(socket, roomCode);
      if (!validation) return;

      const { room } = validation;

      if (room.currentDrawer !== socket.id) {
        socket.emit('error', { message: 'Only the drawer can select a word' });
        return;
      }

      if (room.gameState !== GAME_STATES.CHOOSING_WORD) {
        socket.emit('error', { message: 'Invalid game state' });
        return;
      }

      if (!room.wordChoices.includes(word)) {
        socket.emit('error', { message: 'Invalid word choice' });
        return;
      }

      room.selectWord(word);

      const maskedWord = getMaskedWord(word);

      io.to(roomCode).emit('round-started', {
        gameState: room.gameState,
        roundTime: room.settings.roundTime,
        wordLength: word.length,
        maskedWord,
      });

      // Send actual word only to drawer
      socket.emit('drawing-started', { word });

      // Start round timer
      startRoundTimer(io, room, roomCode);

      console.log(`Round started in room ${roomCode}, word: ${word}`);
    } catch (error) {
      console.error('Error selecting word:', error);
      socket.emit('error', { message: 'Failed to select word' });
    }
  });

  // Drawing data
  socket.on('draw', ({ roomCode, drawData }) => {
    try {
      const validation = validatePlayerInRoom(socket, roomCode);
      if (!validation) return;

      const { room } = validation;

      if (room.currentDrawer !== socket.id) {
        return; // Silently ignore if not the drawer
      }

      if (room.gameState !== GAME_STATES.DRAWING) {
        return;
      }

      room.addDrawingData(drawData);

      // Broadcast to all other players
      socket.to(roomCode).emit('drawing-update', { drawData });
    } catch (error) {
      console.error('Error handling draw:', error);
    }
  });

  // Clear canvas
  socket.on('clear-canvas', ({ roomCode }) => {
    try {
      const validation = validatePlayerInRoom(socket, roomCode);
      if (!validation) return;

      const { room } = validation;

      if (room.currentDrawer !== socket.id) {
        socket.emit('error', { message: 'Only the drawer can clear the canvas' });
        return;
      }

      room.clearDrawing();

      io.to(roomCode).emit('canvas-cleared');

      console.log(`Canvas cleared in room ${roomCode}`);
    } catch (error) {
      console.error('Error clearing canvas:', error);
    }
  });

  // Chat message / Guess
  socket.on('send-message', ({ roomCode, message }) => {
    try {
      if (!checkRateLimit(socket.id, 'message', RATE_LIMITS.CHAT_MESSAGE_DELAY)) {
        return; // Rate limited
      }

      const validation = validatePlayerInRoom(socket, roomCode);
      if (!validation) return;

      const { room, player } = validation;

      const sanitizedMessage = sanitizeInput(message, RATE_LIMITS.MAX_MESSAGE_LENGTH);
      if (!sanitizedMessage) return;

      // If game is in progress and not the drawer, check if it's a correct guess
      if (room.gameState === GAME_STATES.DRAWING &&
          room.currentDrawer !== socket.id &&
          !player.hasGuessedCorrectly) {

        if (isCorrectGuess(sanitizedMessage, room.currentWord)) {
          const points = room.processCorrectGuess(socket.id);

          io.to(roomCode).emit('correct-guess', {
            playerId: socket.id,
            playerName: player.name,
            points,
            players: room.getPlayers(),
          });

          // Check if all players have guessed
          const allGuessed = Array.from(room.players.values())
            .filter(p => p.id !== room.currentDrawer)
            .every(p => p.hasGuessedCorrectly);

          if (allGuessed) {
            endRound(io, room, roomCode);
          }

          console.log(`${player.name} guessed correctly in room ${roomCode}`);
          return;
        } else if (isCloseGuess(sanitizedMessage, room.currentWord)) {
          socket.emit('close-guess', {
            message: 'Your guess is close!',
          });
        }
      }

      // Regular chat message (not sent if it was a correct guess)
      // Don't show drawer's messages during drawing (to prevent giving hints)
      if (room.gameState === GAME_STATES.DRAWING && room.currentDrawer === socket.id) {
        socket.emit('error', { message: 'Drawer cannot send messages during the round' });
        return;
      }

      io.to(roomCode).emit('chat-message', {
        playerId: socket.id,
        playerName: player.name,
        message: sanitizedMessage,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    try {
      const roomCode = playerRooms.get(socket.id);
      if (!roomCode) return;

      const room = rooms.get(roomCode);
      if (!room) return;

      const player = room.removePlayer(socket.id);
      playerRooms.delete(socket.id);

      if (room.isEmpty()) {
        rooms.delete(roomCode);
        console.log(`Room ${roomCode} deleted (empty)`);
        return;
      }

      io.to(roomCode).emit('player-left', {
        playerId: socket.id,
        playerName: player?.name,
        players: room.getPlayers(),
        newHost: room.host,
      });

      // If the drawer disconnected during a round, end the round
      if (room.currentDrawer === socket.id && room.gameState === GAME_STATES.DRAWING) {
        endRound(io, room, roomCode);
      }

      console.log(`${player?.name} left room ${roomCode}`);
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
}

// Helper function to start round timer
function startRoundTimer(io, room, roomCode) {
  const roundDuration = room.settings.roundTime * 1000;
  let timeElapsed = 0;
  const hintTimings = [
    roundDuration * 0.25,
    roundDuration * 0.5,
    roundDuration * 0.75,
  ];
  let hintIndex = 0;

  room.roundTimer = setInterval(() => {
    timeElapsed += 1000;

    // Check if it's time to reveal a hint
    if (hintIndex < hintTimings.length && timeElapsed >= hintTimings[hintIndex]) {
      const newIndices = getHintIndices(room.currentWord, 0.2);
      room.revealedHintIndices = [...new Set([...room.revealedHintIndices, ...newIndices])];

      const maskedWord = getMaskedWord(room.currentWord, room.revealedHintIndices);

      io.to(roomCode).emit('hint-revealed', {
        maskedWord,
      });

      hintIndex++;
    }

    // End round when time is up
    if (timeElapsed >= roundDuration) {
      endRound(io, room, roomCode);
    }
  }, 1000);
}

// Helper function to end a round
function endRound(io, room, roomCode) {
  if (room.roundTimer) {
    clearInterval(room.roundTimer);
    room.roundTimer = null;
  }

  const roundResults = room.endRound();

  io.to(roomCode).emit('round-ended', {
    word: roundResults.word,
    drawerPoints: roundResults.drawerPoints,
    scores: roundResults.scores,
    players: room.getPlayers(),
  });

  // Wait 5 seconds before starting next round or ending game
  setTimeout(() => {
    const hasNextRound = room.nextRound();

    if (!hasNextRound) {
      const finalScores = room.endGame();

      io.to(roomCode).emit('game-ended', {
        finalScores,
      });

      console.log(`Game ended in room ${roomCode}`);
    } else {
      const wordChoices = getRandomWords(GAME_CONFIG.WORD_CHOICES);
      room.wordChoices = wordChoices;

      io.to(roomCode).emit('next-round', {
        gameState: room.gameState,
        currentRound: room.currentRound,
        totalRounds: room.settings.rounds,
        currentDrawer: room.currentDrawer,
        players: room.getPlayers(),
      });

      io.to(room.currentDrawer).emit('choose-word', {
        words: wordChoices,
      });

      console.log(`Next round started in room ${roomCode}`);
    }
  }, 5000);
}

export default setupGameHandlers;
