import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import './Lobby.css';

const Lobby = () => {
  const { room, player, players, startGame, updateSettings } = useGame();
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    rounds: room?.settings?.rounds || 3,
    roundTime: room?.settings?.roundTime || 80,
    maxPlayers: room?.settings?.maxPlayers || 12,
  });

  const handleCopyCode = () => {
    if (room?.roomCode) {
      navigator.clipboard.writeText(room.roomCode);
    }
  };

  const handleUpdateSettings = () => {
    updateSettings(settings);
    setShowSettings(false);
  };

  const canStart = players.length >= 2 && player?.isHost;

  return (
    <div className="lobby-container fade-in">
      <div className="lobby-card card">
        <div className="lobby-header">
          <h2>Game Lobby</h2>
          <div className="room-code-section">
            <span className="room-code-label">Room Code:</span>
            <div className="room-code-display">
              <span className="room-code">{room?.roomCode}</span>
              <button className="copy-btn" onClick={handleCopyCode} title="Copy room code">
                📋
              </button>
            </div>
          </div>
        </div>

        <div className="lobby-content">
          {/* Players List */}
          <div className="players-section">
            <h3>Players ({players.length}/{room?.settings?.maxPlayers || 12})</h3>
            <div className="players-list">
              {players.map((p) => (
                <div key={p.id} className="player-item">
                  <div className="player-avatar">{p.avatar}</div>
                  <div className="player-info">
                    <span className="player-name">
                      {p.name}
                      {p.isHost && <span className="host-badge">HOST</span>}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Game Settings */}
          {player?.isHost && (
            <div className="settings-section">
              {!showSettings ? (
                <button
                  className="btn-secondary full-width"
                  onClick={() => setShowSettings(true)}
                >
                  ⚙️ Game Settings
                </button>
              ) : (
                <div className="settings-form">
                  <h3>Game Settings</h3>
                  <div className="setting-item">
                    <label>Rounds: {settings.rounds}</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={settings.rounds}
                      onChange={(e) => setSettings({ ...settings, rounds: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="setting-item">
                    <label>Round Time: {settings.roundTime}s</label>
                    <input
                      type="range"
                      min="30"
                      max="180"
                      step="10"
                      value={settings.roundTime}
                      onChange={(e) => setSettings({ ...settings, roundTime: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="setting-item">
                    <label>Max Players: {settings.maxPlayers}</label>
                    <input
                      type="range"
                      min="2"
                      max="12"
                      value={settings.maxPlayers}
                      onChange={(e) => setSettings({ ...settings, maxPlayers: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="settings-buttons">
                    <button className="btn-primary" onClick={handleUpdateSettings}>
                      Save Settings
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setShowSettings(false);
                        setSettings({
                          rounds: room?.settings?.rounds || 3,
                          roundTime: room?.settings?.roundTime || 80,
                          maxPlayers: room?.settings?.maxPlayers || 12,
                        });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Waiting Message */}
          {!player?.isHost && (
            <div className="waiting-message">
              <p>Waiting for host to start the game...</p>
            </div>
          )}

          {/* Start Game Button */}
          {player?.isHost && (
            <button
              className="btn-primary full-width start-game-btn"
              onClick={startGame}
              disabled={!canStart}
            >
              {canStart ? '🎮 Start Game' : `Need at least 2 players to start`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lobby;
