import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { AVATARS } from '../utils/constants';
import './Home.css';

const Home = () => {
  const { createRoom, joinRoom, error } = useGame();
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [roomCode, setRoomCode] = useState('');
  const [showJoinRoom, setShowJoinRoom] = useState(false);

  const handleCreateRoom = () => {
    if (playerName.trim()) {
      createRoom(playerName, selectedAvatar, false);
    }
  };

  const handleJoinRoom = () => {
    if (playerName.trim() && roomCode.trim()) {
      joinRoom(roomCode.toUpperCase(), playerName, selectedAvatar);
    }
  };

  return (
    <div className="home-container fade-in">
      <div className="home-card card">
        <div className="home-header">
          <h1 className="game-title">🎨 Drawing Game</h1>
          <p className="game-subtitle">Draw, Guess, and Have Fun!</p>
        </div>

        <div className="home-content">
          {/* Player Name Input */}
          <div className="input-group">
            <label>Your Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              autoFocus
            />
          </div>

          {/* Avatar Selection */}
          <div className="input-group">
            <label>Choose Your Avatar</label>
            <div className="avatar-grid">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  className={`avatar-btn ${selectedAvatar === avatar ? 'selected' : ''}`}
                  onClick={() => setSelectedAvatar(avatar)}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          {!showJoinRoom ? (
            <div className="button-group">
              <button
                className="btn-primary full-width"
                onClick={handleCreateRoom}
                disabled={!playerName.trim()}
              >
                Create Private Room
              </button>
              <button
                className="btn-secondary full-width"
                onClick={() => setShowJoinRoom(true)}
              >
                Join Room
              </button>
            </div>
          ) : (
            <div className="join-room-section">
              <div className="input-group">
                <label>Room Code</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
              </div>
              <div className="button-group">
                <button
                  className="btn-primary full-width"
                  onClick={handleJoinRoom}
                  disabled={!playerName.trim() || !roomCode.trim()}
                >
                  Join Game
                </button>
                <button
                  className="btn-secondary full-width"
                  onClick={() => setShowJoinRoom(false)}
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="home-footer">
          <p>Play with friends in real-time!</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
