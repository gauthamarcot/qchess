const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
  createGame,
  getGameHistory,
  getUserStats,
  joinGame,
  getGame,
  generateGameInvite
} = require('../controllers/gameController');

const router = express.Router();

// Validation middleware
const validateCreateGame = [
  body('opponentEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('settings.timeLimit')
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage('Time limit must be between 1 and 120 minutes'),
  body('settings.quantumMode')
    .optional()
    .isBoolean()
    .withMessage('Quantum mode must be a boolean'),
  body('settings.allowSpectators')
    .optional()
    .isBoolean()
    .withMessage('Allow spectators must be a boolean')
];

const validateJoinGame = [
  body('inviteCode')
    .notEmpty()
    .isLength({ min: 12, max: 12 })
    .withMessage('Invalid invite code format')
];

// Routes
router.post('/', authenticateToken, validateCreateGame, createGame);
router.get('/history', authenticateToken, getGameHistory);
router.get('/stats', authenticateToken, getUserStats);
router.post('/join', authenticateToken, validateJoinGame, joinGame);
router.get('/:gameId', authenticateToken, getGame);
router.post('/:gameId/invite', authenticateToken, generateGameInvite);

module.exports = router; 