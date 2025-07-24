const Game = require('../models/Game');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Create new game
// @route   POST /api/games
// @access  Private
const createGame = async (req, res) => {
  try {
    console.log('Creating game for user:', req.user._id);
    const { opponentEmail, settings } = req.body;
    
    // Find opponent if provided
    let opponent = null;
    if (opponentEmail) {
      opponent = await User.findOne({ email: opponentEmail });
      if (!opponent) {
        return res.status(404).json({
          success: false,
          message: 'Opponent not found'
        });
      }
    }
    
    // Create new game
    const game = new Game({
      players: [
        {
          userId: req.user._id,
          name: req.user.name,
          color: 'w' // White goes first
        }
      ],
      settings: settings || {}
    });
    
    console.log('Game object created:', game);
    
    // Add opponent if provided
    if (opponent) {
      game.players.push({
        userId: opponent._id,
        name: opponent.name,
        color: 'b'
      });
    }
    
    // Generate invite code
    game.generateInviteCode();
    
    console.log('About to save game...');
    await game.save();
    console.log('Game saved successfully:', game.gameId);
    
    res.status(201).json({
      success: true,
      message: 'Game created successfully',
      data: {
        game: game.getSummary()
      }
    });
    
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating game'
    });
  }
};

// @desc    Get user's game history
// @route   GET /api/games/history
// @access  Private
const getGameHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = {
      'players.userId': req.user._id
    };
    
    if (status) {
      query.status = status;
    }
    
    const games = await Game.find(query)
      .populate('players.userId', 'name email')
      .populate('winner', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Game.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        games: games.map(game => game.getSummary()),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalGames: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Get game history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching game history'
    });
  }
};

// @desc    Get user's game statistics
// @route   GET /api/games/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    // Get all games for the user
    const games = await Game.find({
      'players.userId': req.user._id,
      status: 'completed'
    });
    
    // Calculate statistics
    const stats = {
      totalGames: games.length,
      gamesWon: 0,
      gamesLost: 0,
      totalMoves: 0,
      quantumMoves: 0,
      classicalMoves: 0,
      averageGameDuration: 0,
      totalGameTime: 0,
      superpositions: 0,
      entanglements: 0,
      measurements: 0
    };
    
    games.forEach(game => {
      const player = game.players.find(p => p.userId.toString() === req.user._id.toString());
      
      if (player.isWinner) {
        stats.gamesWon++;
      } else {
        stats.gamesLost++;
      }
      
      stats.totalMoves += game.stats.totalMoves;
      stats.quantumMoves += game.stats.quantumMoves;
      stats.classicalMoves += game.stats.classicalMoves;
      stats.superpositions += game.stats.superpositions;
      stats.entanglements += game.stats.entanglements;
      stats.measurements += game.stats.measurements;
      stats.totalGameTime += game.duration || 0;
    });
    
    stats.averageGameDuration = stats.totalGames > 0 ? Math.round(stats.totalGameTime / stats.totalGames) : 0;
    stats.winRate = stats.totalGames > 0 ? Math.round((stats.gamesWon / stats.totalGames) * 100) : 0;
    
    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentGames = await Game.countDocuments({
      'players.userId': req.user._id,
      createdAt: { $gte: sevenDaysAgo }
    });
    
    stats.recentGames = recentGames;
    
    res.json({
      success: true,
      data: { stats }
    });
    
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user stats'
    });
  }
};

// @desc    Join game by invite code
// @route   POST /api/games/join
// @access  Private
const joinGame = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    
    if (!inviteCode) {
      return res.status(400).json({
        success: false,
        message: 'Invite code is required'
      });
    }
    
    // Find game by invite code
    const game = await Game.findOne({ inviteCode });
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite code'
      });
    }
    
    if (game.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Game is not active'
      });
    }
    
    // Check if user is already in the game
    const isAlreadyPlayer = game.players.some(p => p.userId.toString() === req.user._id.toString());
    
    if (isAlreadyPlayer) {
      return res.status(400).json({
        success: false,
        message: 'You are already in this game'
      });
    }
    
    // Add player to game
    game.players.push({
      userId: req.user._id,
      name: req.user.name,
      color: game.players.length === 1 ? 'b' : 'w' // Second player gets black
    });
    
    await game.save();
    
    res.json({
      success: true,
      message: 'Joined game successfully',
      data: {
        game: game.getSummary()
      }
    });
    
  } catch (error) {
    console.error('Join game error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error joining game'
    });
  }
};

// @desc    Get game by ID
// @route   GET /api/games/:gameId
// @access  Private
const getGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const game = await Game.findOne({ gameId })
      .populate('players.userId', 'name email')
      .populate('winner', 'name');
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }
    
    // Check if user is part of this game
    const isPlayer = game.players.some(p => p.userId._id.toString() === req.user._id.toString());
    
    if (!isPlayer && !game.settings.allowSpectators) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: {
        game: {
          ...game.getSummary(),
          moves: game.moves,
          isPlayer
        }
      }
    });
    
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching game'
    });
  }
};

// @desc    Generate game invite link
// @route   POST /api/games/:gameId/invite
// @access  Private
const generateGameInvite = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const game = await Game.findOne({ gameId });
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }
    
    // Check if user is part of this game
    const isPlayer = game.players.some(p => p.userId.toString() === req.user._id.toString());
    
    if (!isPlayer) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Generate invite link
    const inviteLink = `${process.env.FRONTEND_URL}/game/${game.inviteCode}`;
    
    res.json({
      success: true,
      message: 'Invite link generated',
      data: {
        inviteLink,
        inviteCode: game.inviteCode
      }
    });
    
  } catch (error) {
    console.error('Generate game invite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating invite'
    });
  }
};

module.exports = {
  createGame,
  getGameHistory,
  getUserStats,
  joinGame,
  getGame,
  generateGameInvite
}; 