import React from 'react';
import { useGame } from '../contexts/GameContext';
import './PlayerList.css';

const PlayerList = () => {
  const { players, currentDrawer, gameState } = useGame();

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="player-list-container">
      <div className="player-list-header">
        <h3>Players ({players.length})</h3>
      </div>

      <div className="player-list">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`player-list-item ${currentDrawer === player.id ? 'is-drawer' : ''} ${
              player.hasGuessedCorrectly ? 'guessed' : ''
            }`}
          >
            <div className="player-rank">#{index + 1}</div>
            <div className="player-avatar-small">{player.avatar}</div>
            <div className="player-details">
              <div className="player-name-row">
                <span className="player-name">{player.name}</span>
                {currentDrawer === player.id && gameState === 'DRAWING' && (
                  <span className="drawer-badge">✏️</span>
                )}
                {player.hasGuessedCorrectly && gameState === 'DRAWING' && (
                  <span className="guessed-badge">✓</span>
                )}
              </div>
              <div className="player-score">{player.score} pts</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;
