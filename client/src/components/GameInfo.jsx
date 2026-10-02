import React from 'react';
import { useGame } from '../contexts/GameContext';
import './GameInfo.css';

const GameInfo = () => {
  const {
    currentRound,
    totalRounds,
    timeRemaining,
    maskedWord,
    currentWord,
    isCurrentDrawer,
    gameState,
  } = useGame();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining > 30) return 'var(--success-color)';
    if (timeRemaining > 10) return 'var(--warning-color)';
    return 'var(--danger-color)';
  };

  if (gameState !== 'DRAWING') return null;

  return (
    <div className="game-info-container">
      <div className="game-info-card">
        <div className="info-section">
          <div className="round-info">
            <span className="round-label">Round</span>
            <span className="round-value">
              {currentRound} / {totalRounds}
            </span>
          </div>
        </div>

        <div className="info-section word-section">
          {isCurrentDrawer ? (
            <div className="current-word">
              <span className="word-label">Your Word:</span>
              <span className="word-display">{currentWord}</span>
            </div>
          ) : (
            <div className="masked-word">
              <span className="word-label">Guess the word:</span>
              <span className="word-display">{maskedWord}</span>
            </div>
          )}
        </div>

        <div className="info-section">
          <div className="timer" style={{ color: getTimeColor() }}>
            <span className="timer-icon">⏱️</span>
            <span className="timer-value">{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameInfo;
