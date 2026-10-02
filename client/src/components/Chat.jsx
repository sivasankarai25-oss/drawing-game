import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import './Chat.css';

const Chat = () => {
  const { chatMessages, sendMessage, isCurrentDrawer, gameState } = useGame();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const canSendMessage = gameState === 'LOBBY' || !isCurrentDrawer;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>💬 Chat</h3>
      </div>

      <div className="chat-messages">
        {chatMessages.length === 0 ? (
          <div className="empty-chat">
            <p>No messages yet. Start chatting!</p>
          </div>
        ) : (
          chatMessages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.type}`}>
              {msg.type === 'message' ? (
                <>
                  <span className="message-author">{msg.playerName}:</span>
                  <span className="message-text">{msg.message}</span>
                </>
              ) : (
                <span className="system-message">{msg.message}</span>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-input"
          placeholder={
            isCurrentDrawer && gameState === 'DRAWING'
              ? "Drawer can't send messages..."
              : 'Type your guess or message...'
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={200}
          disabled={!canSendMessage}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!message.trim() || !canSendMessage}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
