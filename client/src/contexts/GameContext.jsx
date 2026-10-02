import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSocket } from '../utils/socket';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [socket] = useState(() => getSocket());
  const [gameState, setGameState] = useState('HOME');
  const [player, setPlayer] = useState(null);
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(3);
  const [currentDrawer, setCurrentDrawer] = useState(null);
  const [currentWord, setCurrentWord] = useState(null);
  const [maskedWord, setMaskedWord] = useState('');
  const [roundTime, setRoundTime] = useState(80);
  const [timeRemaining, setTimeRemaining] = useState(80);
  const [chatMessages, setChatMessages] = useState([]);
  const [drawingData, setDrawingData] = useState([]);
  const [error, setError] = useState(null);
  const [wordChoices, setWordChoices] = useState([]);

  useEffect(() => {
    // Socket event listeners
    socket.on('room-created', (data) => {
      setPlayer(data.player);
      setRoom(data.room);
      setPlayers(data.room.players);
      setGameState('LOBBY');
    });

    socket.on('room-joined', (data) => {
      setPlayer(data.player);
      setRoom(data.room);
      setPlayers(data.room.players);
      setDrawingData(data.drawingData || []);
      setGameState('LOBBY');
    });

    socket.on('player-joined', (data) => {
      setPlayers(data.players);
      addSystemMessage(`${data.player.name} joined the game`);
    });

    socket.on('player-left', (data) => {
      setPlayers(data.players);
      addSystemMessage(`${data.playerName} left the game`);

      // Update host if changed
      if (data.newHost && player && data.newHost === player.id) {
        setPlayer(prev => ({ ...prev, isHost: true }));
      }
    });

    socket.on('settings-updated', (data) => {
      setRoom(prev => ({ ...prev, settings: data.settings }));
    });

    socket.on('game-started', (data) => {
      setGameState(data.gameState);
      setCurrentRound(data.currentRound);
      setTotalRounds(data.totalRounds);
      setCurrentDrawer(data.currentDrawer);
      setPlayers(data.players);
      setChatMessages([]);
      setDrawingData([]);
      addSystemMessage('Game started! Round 1 beginning...');
    });

    socket.on('choose-word', (data) => {
      setWordChoices(data.words);
      setGameState('CHOOSING_WORD');
    });

    socket.on('round-started', (data) => {
      setGameState('DRAWING');
      setRoundTime(data.roundTime);
      setTimeRemaining(data.roundTime);
      setMaskedWord(data.maskedWord);
      setCurrentWord(null);
      setWordChoices([]);
      addSystemMessage('Round started! Start drawing or guessing!');
    });

    socket.on('drawing-started', (data) => {
      setCurrentWord(data.word);
    });

    socket.on('drawing-update', (data) => {
      setDrawingData(prev => [...prev, data.drawData]);
    });

    socket.on('canvas-cleared', () => {
      setDrawingData([]);
    });

    socket.on('chat-message', (data) => {
      setChatMessages(prev => [...prev, {
        type: 'message',
        playerId: data.playerId,
        playerName: data.playerName,
        message: data.message,
        timestamp: data.timestamp,
      }]);
    });

    socket.on('correct-guess', (data) => {
      setPlayers(data.players);
      addSystemMessage(`${data.playerName} guessed correctly! +${data.points} points`);
    });

    socket.on('close-guess', (data) => {
      addSystemMessage(data.message, 'warning');
    });

    socket.on('hint-revealed', (data) => {
      setMaskedWord(data.maskedWord);
      addSystemMessage('Hint revealed!');
    });

    socket.on('round-ended', (data) => {
      setGameState('ROUND_END');
      setCurrentWord(data.word);
      setPlayers(data.players);
      addSystemMessage(`Round ended! The word was: ${data.word}`);
    });

    socket.on('next-round', (data) => {
      setGameState(data.gameState);
      setCurrentRound(data.currentRound);
      setCurrentDrawer(data.currentDrawer);
      setPlayers(data.players);
      setDrawingData([]);
      setCurrentWord(null);
      setMaskedWord('');
      addSystemMessage(`Round ${data.currentRound} starting...`);
    });

    socket.on('game-ended', (data) => {
      setGameState('GAME_END');
      addSystemMessage('Game ended!');
    });

    socket.on('error', (data) => {
      setError(data.message);
      setTimeout(() => setError(null), 5000);
    });

    return () => {
      socket.off('room-created');
      socket.off('room-joined');
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('settings-updated');
      socket.off('game-started');
      socket.off('choose-word');
      socket.off('round-started');
      socket.off('drawing-started');
      socket.off('drawing-update');
      socket.off('canvas-cleared');
      socket.off('chat-message');
      socket.off('correct-guess');
      socket.off('close-guess');
      socket.off('hint-revealed');
      socket.off('round-ended');
      socket.off('next-round');
      socket.off('game-ended');
      socket.off('error');
    };
  }, [socket, player]);

  // Timer countdown
  useEffect(() => {
    if (gameState === 'DRAWING' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, timeRemaining]);

  const addSystemMessage = (message, type = 'system') => {
    setChatMessages(prev => [...prev, {
      type,
      message,
      timestamp: Date.now(),
    }]);
  };

  const createRoom = (playerName, avatar, isPublic = false) => {
    socket.emit('create-room', { playerName, avatar, isPublic });
  };

  const joinRoom = (roomCode, playerName, avatar) => {
    socket.emit('join-room', { roomCode, playerName, avatar });
  };

  const updateSettings = (settings) => {
    if (room) {
      socket.emit('update-settings', { roomCode: room.roomCode, settings });
    }
  };

  const startGame = () => {
    if (room) {
      socket.emit('start-game', { roomCode: room.roomCode });
    }
  };

  const selectWord = (word) => {
    if (room) {
      socket.emit('select-word', { roomCode: room.roomCode, word });
    }
  };

  const sendDrawData = (drawData) => {
    if (room) {
      socket.emit('draw', { roomCode: room.roomCode, drawData });
    }
  };

  const clearCanvas = () => {
    if (room) {
      socket.emit('clear-canvas', { roomCode: room.roomCode });
    }
  };

  const sendMessage = (message) => {
    if (room && message.trim()) {
      socket.emit('send-message', { roomCode: room.roomCode, message: message.trim() });
    }
  };

  const isCurrentDrawer = player && currentDrawer === player.id;

  const value = {
    socket,
    gameState,
    player,
    room,
    players,
    currentRound,
    totalRounds,
    currentDrawer,
    currentWord,
    maskedWord,
    roundTime,
    timeRemaining,
    chatMessages,
    drawingData,
    error,
    wordChoices,
    isCurrentDrawer,
    createRoom,
    joinRoom,
    updateSettings,
    startGame,
    selectWord,
    sendDrawData,
    clearCanvas,
    sendMessage,
    setGameState,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameContext;
