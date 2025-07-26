require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('../config/database');

// Import routes
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/games');
const stockfishRoutes = require('./routes/stockfish');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5174",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
connectDB();

// Socket.IO connection handling
const connectedUsers = new Map();
const games = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user login
  socket.on('login', (data) => {
    const { username } = data;
    connectedUsers.set(socket.id, { username, socketId: socket.id });
    console.log(`User logged in: ${username}`);
    
    // Emit available games to the user
    const availableGames = Array.from(games.values()).filter(game => game.status === 'waiting');
    socket.emit('availableGames', availableGames);
  });

  // Handle game creation
  socket.on('createGame', (data) => {
    const { username } = data;
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const game = {
      id: gameId,
      creator: username,
      players: [{ username, socketId: socket.id, color: 'w' }],
      status: 'waiting',
      createdAt: new Date()
    };
    
    games.set(gameId, game);
    socket.join(gameId);
    socket.emit('gameCreated', { gameId, game });
    
    // Broadcast available games to all users
    const availableGames = Array.from(games.values()).filter(game => game.status === 'waiting');
    io.emit('availableGames', availableGames);
  });

  // Handle joining a game
  socket.on('joinGame', (data) => {
    const { gameId, username } = data;
    const game = games.get(gameId);
    
    if (game && game.status === 'waiting' && game.players.length < 2) {
      game.players.push({ username, socketId: socket.id, color: 'b' });
      game.status = 'ready';
      socket.join(gameId);
      
      socket.emit('gameJoined', { gameId, game });
      
      // Notify both players that game is ready to start
      io.to(gameId).emit('gameReady', { gameId, game });
      
      // Update available games
      const availableGames = Array.from(games.values()).filter(game => game.status === 'waiting');
      io.emit('availableGames', availableGames);
    }
  });

  // Handle game start
  socket.on('startGame', (data) => {
    const { gameId } = data;
    const game = games.get(gameId);
    
    if (game && game.players.length === 2) {
      game.status = 'playing';
      game.startedAt = new Date();
      
      io.to(gameId).emit('gameStarted', { gameId, game });
    }
  });

  // Handle move made
  socket.on('moveMade', (data) => {
    const { gameId, move, player } = data;
    const game = games.get(gameId);
    
    if (game) {
      io.to(gameId).emit('moveMade', { move, player });
    }
  });

  // Handle quick match
  socket.on('findMatch', (data) => {
    const { username } = data;
    const waitingGame = Array.from(games.values()).find(game => 
      game.status === 'waiting' && game.players.length === 1
    );
    
    if (waitingGame) {
      // Join existing game
      socket.emit('joinGame', { gameId: waitingGame.id, username });
    } else {
      // Create new game
      socket.emit('createGame', { username });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      console.log(`User disconnected: ${user.username}`);
      connectedUsers.delete(socket.id);
      
      // Find and update games where this user was playing
      for (const [gameId, game] of games.entries()) {
        const playerIndex = game.players.findIndex(p => p.socketId === socket.id);
        if (playerIndex !== -1) {
          game.status = 'abandoned';
          io.to(gameId).emit('opponentLeft', { gameId, username: user.username });
          break;
        }
      }
    }
  });
});

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Quantum Chess API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/stockfish', stockfishRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5050;

const server = httpServer.listen(PORT, () => {
  console.log(`🚀 Quantum Chess API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🎮 Socket.IO server ready for multiplayer`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;