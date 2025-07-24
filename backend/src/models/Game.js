const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  // Game identification
  gameId: {
    type: String,
    required: false,
    unique: true
  },
  
  // Players
  players: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    color: {
      type: String,
      enum: ['w', 'b'],
      required: true
    },
    isWinner: {
      type: Boolean,
      default: false
    },
    quantumMovesUsed: {
      type: Number,
      default: 0
    },
    classicalMovesUsed: {
      type: Number,
      default: 0
    }
  }],
  
  // Game state
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Game details
  startTime: {
    type: Date,
    default: Date.now
  },
  
  endTime: {
    type: Date
  },
  
  duration: {
    type: Number, // in seconds
    default: 0
  },
  
  // Move history
  moves: [{
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moveType: {
      type: String,
      enum: ['classical', 'superposition', 'entanglement', 'measurement'],
      required: true
    },
    piece: String,
    from: String,
    to: String,
    destinations: [String], // for superposition moves
    entangledWith: String, // for entanglement moves
    timestamp: {
      type: Date,
      default: Date.now
    },
    moveNumber: Number
  }],
  
  // Game statistics
  stats: {
    totalMoves: {
      type: Number,
      default: 0
    },
    quantumMoves: {
      type: Number,
      default: 0
    },
    classicalMoves: {
      type: Number,
      default: 0
    },
    superpositions: {
      type: Number,
      default: 0
    },
    entanglements: {
      type: Number,
      default: 0
    },
    measurements: {
      type: Number,
      default: 0
    }
  },
  
  // Invite system
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  },
  
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  isPublic: {
    type: Boolean,
    default: false
  },
  
  // Game settings
  settings: {
    timeLimit: Number, // in minutes
    quantumMode: {
      type: Boolean,
      default: true
    },
    allowSpectators: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
gameSchema.index({ gameId: 1 });
gameSchema.index({ 'players.userId': 1 });
gameSchema.index({ status: 1 });
gameSchema.index({ inviteCode: 1 });
gameSchema.index({ createdAt: -1 });

// Generate game ID
gameSchema.pre('save', function(next) {
  if (!this.gameId) {
    const crypto = require('crypto');
    this.gameId = crypto.randomBytes(8).toString('hex');
  }
  next();
});

// Ensure gameId is always set before validation
gameSchema.pre('validate', function(next) {
  if (!this.gameId) {
    const crypto = require('crypto');
    this.gameId = crypto.randomBytes(8).toString('hex');
  }
  next();
});

// Generate invite code
gameSchema.methods.generateInviteCode = function() {
  const crypto = require('crypto');
  this.inviteCode = crypto.randomBytes(6).toString('hex');
  return this.inviteCode;
};

// Add move to game
gameSchema.methods.addMove = function(moveData) {
  this.moves.push({
    ...moveData,
    moveNumber: this.moves.length + 1
  });
  
  // Update stats
  this.stats.totalMoves++;
  if (moveData.moveType === 'classical') {
    this.stats.classicalMoves++;
  } else {
    this.stats.quantumMoves++;
  }
  
  switch (moveData.moveType) {
    case 'superposition':
      this.stats.superpositions++;
      break;
    case 'entanglement':
      this.stats.entanglements++;
      break;
    case 'measurement':
      this.stats.measurements++;
      break;
  }
  
  return this.save();
};

// End game
gameSchema.methods.endGame = function(winnerId) {
  this.status = 'completed';
  this.winner = winnerId;
  this.endTime = new Date();
  this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  
  // Update player stats
  this.players.forEach(player => {
    if (player.userId.toString() === winnerId.toString()) {
      player.isWinner = true;
    }
  });
  
  return this.save();
};

// Get game summary
gameSchema.methods.getSummary = function() {
  return {
    gameId: this.gameId,
    status: this.status,
    players: this.players.map(p => ({
      name: p.name,
      color: p.color,
      isWinner: p.isWinner,
      quantumMovesUsed: p.quantumMovesUsed,
      classicalMovesUsed: p.classicalMovesUsed
    })),
    duration: this.duration,
    stats: this.stats,
    inviteCode: this.inviteCode,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('Game', gameSchema); 