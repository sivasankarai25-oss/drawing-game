import React from 'react';
import { useGame } from '../contexts/GameContext';
import Canvas from './Canvas';
import Chat from './Chat';
import PlayerList from './PlayerList';
import GameInfo from './GameInfo';
import './Game.css';

const Game = () => {
  const { gameState, wordChoices, selectWord, isCurrentDrawer, currentWord } = useGame();

  if (gameState === 'CHOOSING_WORD' && isCurrentDrawer) {
    return (
      <div className="word-selection-container fade-in">
        <div className="word-selection-card card">
          <h2>Choose a word to draw:</h2>
          <div className="word-choices">
            {wordChoices.map((word, index) => (
              <button
                key={index}
                className="word-choice-btn"
                onClick={() => selectWord(word)}
              >
                {word}
              </button>
            ))}
          </div>
          <p className="word-hint">Choose wisely! Others will try to guess your drawing.</p>
        </div>
      </div>
    );
  }

  if (gameState === 'CHOOSING_WORD' && !isCurrentDrawer) {
    return (
      <div className="waiting-drawer-container fade-in">
        <div className="waiting-drawer-card card">
          <div className="waiting-spinner">⏳</div>
          <h2>Waiting for drawer to choose a word...</h2>
          <p>Get ready to guess!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container fade-in">
      <div className="game-layout">
        {/* Left Sidebar - Players */}
        <div className="game-sidebar left">
          <PlayerList />
        </div>

        {/* Main Game Area */}
        <div className="game-main">
          <GameInfo />
          <div className="canvas-section">
            <Canvas />
          </div>
        </div>

        {/* Right Sidebar - Chat */}
        <div className="game-sidebar right">
          <Chat />
        </div>
      </div>
    </div>
  );
};

export default Game;
