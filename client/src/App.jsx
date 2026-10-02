import React from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import Home from './components/Home';
import Lobby from './components/Lobby';
import Game from './components/Game';
import './App.css';

const AppContent = () => {
  const { gameState } = useGame();

  return (
    <div className="app">
      {gameState === 'HOME' && <Home />}
      {gameState === 'LOBBY' && <Lobby />}
      {(gameState === 'CHOOSING_WORD' || gameState === 'DRAWING' || gameState === 'ROUND_END' || gameState === 'GAME_END') && <Game />}
    </div>
  );
};

const App = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

export default App;
