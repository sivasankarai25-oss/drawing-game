# 🎨 Drawing Game - Quick Start Guide

## ✅ Installation Complete!

Your multiplayer drawing and guessing game is ready to play!

## 🚀 Starting the Game

### Option 1: Start Both Servers Together (Recommended)
```bash
npm run dev
```

### Option 2: Start Servers Separately

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend Client:**
```bash
cd client
npm run dev
```

## 🌐 Access the Game

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

## 🎮 How to Play

1. **Open your browser** to http://localhost:5173
2. **Enter your name** and choose an avatar
3. **Create a private room** or **join an existing room** with a room code
4. **Wait for players** (minimum 2 players required)
5. **Host starts the game**
6. **Take turns drawing** - when it's your turn, choose a word and draw it
7. **Guess the drawings** - type your guesses in the chat
8. **Earn points** for correct guesses (faster = more points!)

## 🧪 Testing Multiplayer

To test the multiplayer functionality:

1. Open http://localhost:5173 in **multiple browser tabs or windows**
2. Create a room in the first tab
3. Copy the room code
4. Join the same room from other tabs using the room code
5. Start the game and test drawing/guessing

## ⚙️ Game Features

- ✏️ **Drawing Tools**: Pen, eraser, multiple colors, brush sizes
- 💬 **Live Chat**: Real-time messaging and guessing
- 🎯 **Smart Guessing**: Detects correct answers and close guesses
- 🏆 **Scoring System**: Points based on guess speed
- 🕒 **Round Timer**: Configurable time limits
- 💡 **Hints**: Letters revealed progressively
- 🎨 **Word Selection**: Choose from 3 words each turn
- 👥 **Player List**: Live scoreboard with rankings

## 🛠️ Configuration

Edit game settings in `server/src/utils/constants.js`:
- Round duration
- Number of rounds
- Points distribution
- Hint timing
- Maximum players

## 📁 Project Structure

```
drawing-game/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # Game state management
│   │   ├── utils/         # Utilities and Socket.IO
│   │   └── App.jsx        # Main app
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── handlers/      # Socket.IO event handlers
│   │   ├── models/        # Game room model
│   │   ├── utils/         # Helper functions
│   │   ├── words/         # Word lists
│   │   └── server.js      # Server entry point
│   └── package.json
└── package.json           # Root workspace
```

## 🔧 Troubleshooting

### Port Already in Use
If you see "port already in use" error:
1. Stop any running instances
2. Change ports in `.env` file
3. Restart servers

### Connection Issues
- Ensure both frontend and backend are running
- Check that firewall allows connections
- Verify `.env` file has correct URLs

### Canvas Not Syncing
- Refresh the page
- Check browser console for errors
- Ensure Socket.IO connection is established

## 🎯 Game Rules

1. **Drawing Phase**: One player draws while others guess
2. **No Text Allowed**: Drawer cannot write letters or numbers
3. **Scoring**:
   - Guessers: 50-150 points based on speed
   - Drawer: 50 base + 25 per correct guess
4. **Hints**: Letters revealed at 25%, 50%, and 75% of round time
5. **Winner**: Player with most points after all rounds

## 🌟 Tips for Best Experience

- **Use a mouse or stylus** for better drawing control
- **Test with at least 3 players** for the full experience
- **Draw clear, recognizable images**
- **Type guesses quickly** to maximize points
- **Use different colors** to make drawings more expressive

## 🛑 Stopping the Servers

Press `Ctrl + C` in each terminal window running the servers.

## 📝 Next Steps

- Add more words to `server/src/words/wordLists.js`
- Customize colors in `client/src/utils/constants.js`
- Adjust scoring in `server/src/utils/constants.js`
- Deploy to a hosting service for online multiplayer

## 🎉 Have Fun!

Your drawing game is fully functional and ready for multiplayer action. Enjoy drawing and guessing with friends!
