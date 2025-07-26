const express = require('express');
const router = express.Router();
const StockfishService = require('../services/stockfish');

let stockfishService = null;

// Initialize Stockfish service
const initializeStockfish = async () => {
  if (!stockfishService) {
    try {
      console.log('Creating new Stockfish service...');
      stockfishService = new StockfishService();
      await stockfishService.initialize();
      console.log('Stockfish service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Stockfish:', error);
      stockfishService = null;
      throw error;
    }
  }
  
  // Double-check that the service is ready
  if (!stockfishService || !stockfishService.isReady) {
    console.error('Stockfish service not ready, reinitializing...');
    stockfishService = null;
    try {
      stockfishService = new StockfishService();
      await stockfishService.initialize();
      console.log('Stockfish service reinitialized successfully');
    } catch (error) {
      console.error('Failed to reinitialize Stockfish:', error);
      stockfishService = null;
      throw error;
    }
  }
  
  return stockfishService;
};

// Get best move from Stockfish
router.post('/best-move', async (req, res) => {
  try {
    const { fen, depth = 10 } = req.body;
    
    console.log('Stockfish best-move request:', { fen, depth });
    
    if (!fen) {
      return res.status(400).json({
        success: false,
        message: 'FEN string is required'
      });
    }

    const service = await initializeStockfish();
    if (!service) {
      return res.status(500).json({
        success: false,
        message: 'Stockfish service not available'
      });
    }

    console.log('Getting best move from Stockfish...');
    const bestMove = await service.getBestMove(fen, depth);
    console.log('Stockfish returned move:', bestMove);
    
    res.json({
      success: true,
      move: bestMove
    });
  } catch (error) {
    console.error('Stockfish error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get best move from Stockfish',
      error: error.message
    });
  }
});

// Evaluate position
router.post('/evaluate', async (req, res) => {
  try {
    const { fen } = req.body;
    
    if (!fen) {
      return res.status(400).json({
        success: false,
        message: 'FEN string is required'
      });
    }

    const service = await initializeStockfish();
    if (!service) {
      return res.status(500).json({
        success: false,
        message: 'Stockfish service not available'
      });
    }

    const evaluation = await service.evaluatePosition(fen);
    
    res.json({
      success: true,
      evaluation
    });
  } catch (error) {
    console.error('Stockfish error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to evaluate position',
      error: error.message
    });
  }
});

module.exports = router; 