# Drawing Game - Multiplayer Drawing & Guessing

A real-time multiplayer drawing and guessing game inspired by Skribbl.io, built with React, Node.js, Express, and Socket.IO.

## Features

- **Real-time Multiplayer**: Play with friends in private rooms or join public games
- **Drawing Canvas**: Smooth drawing with multiple tools, colors, and brush sizes
- **Word Selection**: Choose from three secret words each turn
- **Live Chat & Guessing**: Real-time chat with automatic answer detection
- **Scoring System**: Points awarded based on guess speed
- **Game Lobby**: Create or join rooms with room codes
- **Player Avatars**: Customizable player appearance
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Real-time Communication**: Socket.IO
- **Drawing**: HTML Canvas API
- **Styling**: CSS

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone or extract the project

2. Install dependencies for all packages:
```bash
npm run install:all
```

Or manually:
```bash
npm install
cd client && npm install
cd ../server && npm install
```

3. Configure environment variables:
```bash
# Copy the example file
cp .env.example .env

# Edit .env if needed (default values work for local development)
```

### Running the Application

#### Development Mode (Recommended)

Start both frontend and backend simultaneously:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend dev server on http://localhost:5173

#### Manual Start

Start backend:
```bash
npm run server
```

Start frontend (in a separate terminal):
```bash
npm run client
```

### Building for Production

```bash
npm run build
```

## How to Play

1. **Enter Your Name**: Type your player name on the home screen
2. **Create or Join Room**: 
   - Create a private room and share the room code
   - Join an existing room with a code
   - Or join a public room
3. **Wait in Lobby**: Wait for other players to join
4. **Start Game**: Host clicks "Start Game"
5. **Drawing Turn**: 
   - When it's your turn, choose one of three words
   - Draw the word on the canvas
   - Other players will try to guess
6. **Guessing**: 
   - Type your guesses in the chat
   - Correct guesses earn points based on speed
   - Hints appear as the round progresses
7. **Win**: Player with the most points after all rounds wins!

## Game Rules

- Each player takes turns drawing
- Drawer selects a secret word and draws it
- Other players guess by typing in chat
- Faster correct guesses earn more points
- The drawer earns points when others guess correctly
- Letter hints are revealed over time
- Game ends after configured number of rounds

## Testing Multiplayer

To test multiplayer functionality:

1. Start the application with `npm run dev`
2. Open http://localhost:5173 in multiple browser windows or tabs
3. Create a room in one window and note the room code
4. Join the same room from other windows using the room code
5. Start the game and test drawing, guessing, and scoring

## Project Structure

```
drawing-game/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── handlers/      # Socket.IO event handlers
│   │   ├── models/        # Game state models
│   │   ├── utils/         # Utility functions
│   │   ├── words/         # Word lists
│   │   └── server.js      # Entry point
│   └── package.json
└── package.json           # Root package.json

```

## Configuration

### Game Settings

Default game settings can be modified in `server/src/utils/constants.js`:
- Round duration
- Number of rounds
- Points for correct guesses
- Hint reveal timing
- Maximum players per room

## Security Features

- Server-authoritative game state
- Secret words never sent to non-drawing clients
- Input validation and sanitization
- Rate limiting on chat and guesses
- Score validation on server
- Room capacity limits

## Troubleshooting

### Port Already in Use

If port 3001 or 5173 is already in use:
1. Change the PORT in `.env` file
2. Update VITE_SERVER_URL in `.env` to match the new backend port
3. Restart the servers

### Connection Issues

- Ensure both frontend and backend are running
- Check that firewall allows connections on the configured ports
- Verify VITE_SERVER_URL in `.env` matches the backend URL

### Canvas Not Syncing

- Check browser console for Socket.IO connection errors
- Verify network tab shows Socket.IO polling/websocket connection
- Try refreshing the page or rejoining the room

## License

MIT

## Credits

Inspired by Skribbl.io - created as an educational project.
