const { spawn } = require('child_process');

class StockfishService {
  constructor() {
    this.process = null;
    this.isReady = false;
    this.callbacks = new Map();
    this.callbackId = 0;
    this.pendingRequests = new Map();
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      try {
        console.log('Initializing Stockfish...');
        
        // Spawn Stockfish process
        this.process = spawn('stockfish');
        
        let uciReceived = false;
        let readyReceived = false;
        
        this.process.stdout.on('data', (data) => {
          const output = data.toString();
          console.log('Stockfish raw output:', output);
          
          // Split by lines and process each line
          const lines = output.split('\n');
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            
            console.log('Processing line:', trimmedLine);
            
            if (trimmedLine === 'uciok') {
              console.log('Stockfish UCI ready, sending isready...');
              uciReceived = true;
              this.process.stdin.write('isready\n');
            } else if (trimmedLine === 'readyok') {
              console.log('Stockfish is ready!');
              readyReceived = true;
              this.isReady = true;
              resolve();
            } else if (trimmedLine.startsWith('bestmove')) {
              console.log('Stockfish bestmove received:', trimmedLine);
              // Parse best move
              const parts = trimmedLine.split(' ');
              const move = parts[1];
              
              // Find the pending request
              const requestId = Array.from(this.pendingRequests.keys())[0];
              if (requestId && this.pendingRequests.has(requestId)) {
                const { resolve: resolveRequest } = this.pendingRequests.get(requestId);
                this.pendingRequests.delete(requestId);
                resolveRequest(move);
              }
            } else if (trimmedLine.startsWith('info')) {
              // Ignore info messages
              continue;
            }
          }
        });

        this.process.stderr.on('data', (data) => {
          console.error('Stockfish stderr:', data.toString());
        });

        this.process.on('error', (error) => {
          console.error('Stockfish process error:', error);
          reject(error);
        });

        this.process.on('exit', (code) => {
          console.log('Stockfish process exited with code:', code);
        });

        // Set a timeout for initialization
        const initTimeout = setTimeout(() => {
          if (!this.isReady) {
            console.error('Stockfish initialization timeout');
            reject(new Error('Stockfish initialization timeout'));
          }
        }, 15000);

        // Initialize UCI
        console.log('Sending UCI command to Stockfish...');
        this.process.stdin.write('uci\n');
        
        // Override resolve to clear timeout
        const originalResolve = resolve;
        resolve = () => {
          clearTimeout(initTimeout);
          originalResolve();
        };
        
      } catch (error) {
        console.error('Error initializing Stockfish:', error);
        reject(error);
      }
    });
  }

  async getBestMove(fen, depth = 10) {
    return new Promise((resolve, reject) => {
      if (!this.isReady) {
        console.error('Stockfish not ready');
        reject(new Error('Stockfish not ready'));
        return;
      }

      const requestId = this.callbackId++;
      console.log(`Requesting best move for FEN: ${fen}, depth: ${depth}, requestId: ${requestId}`);
      
      this.pendingRequests.set(requestId, { resolve, reject });

      // Set a timeout
      const timeout = setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Stockfish request timeout'));
        }
      }, 10000);

      // Set position and get best move
      console.log('Sending position command to Stockfish...');
      this.process.stdin.write(`position fen ${fen}\n`);
      console.log('Sending go command to Stockfish...');
      this.process.stdin.write(`go depth ${depth} movetime 1000\n`);
      
      // Override resolve to clear timeout
      const originalResolve = resolve;
      this.pendingRequests.set(requestId, { 
        resolve: (move) => {
          clearTimeout(timeout);
          console.log(`Resolving request ${requestId} with move: ${move}`);
          originalResolve(move);
        }, 
        reject: (error) => {
          clearTimeout(timeout);
          console.log(`Rejecting request ${requestId} with error: ${error}`);
          reject(error);
        }
      });
    });
  }

  async evaluatePosition(fen) {
    return new Promise((resolve, reject) => {
      if (!this.isReady) {
        reject(new Error('Stockfish not ready'));
        return;
      }

      const requestId = this.callbackId++;
      this.pendingRequests.set(requestId, { resolve, reject });

      // Set position and evaluate
      this.process.stdin.write(`position fen ${fen}\n`);
      this.process.stdin.write('eval\n');
    });
  }

  close() {
    if (this.process) {
      console.log('Closing Stockfish process...');
      this.process.stdin.write('quit\n');
      this.process.kill();
    }
  }
}

module.exports = StockfishService; 