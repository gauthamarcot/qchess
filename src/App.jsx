import React, { useState, useEffect } from 'react';

// --- Custom Piece Data Structure ---
// { id, type, color, positions: [square, ...], entangledWith: [id, ...] }

const initialBoard = () => {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const pieces = [];
  // Pawns
  for (let i = 0; i < 8; i++) {
    pieces.push({ id: `w_p${i}`, type: 'p', color: 'w', positions: [`${files[i]}2`], entangledWith: [], hasMoved: false });
    pieces.push({ id: `b_p${i}`, type: 'p', color: 'b', positions: [`${files[i]}7`], entangledWith: [], hasMoved: false });
  }
  // Rooks
  pieces.push({ id: 'w_r0', type: 'r', color: 'w', positions: ['a1'], entangledWith: [] });
  pieces.push({ id: 'w_r1', type: 'r', color: 'w', positions: ['h1'], entangledWith: [] });
  pieces.push({ id: 'b_r0', type: 'r', color: 'b', positions: ['a8'], entangledWith: [] });
  pieces.push({ id: 'b_r1', type: 'r', color: 'b', positions: ['h8'], entangledWith: [] });
  // Knights
  pieces.push({ id: 'w_n0', type: 'n', color: 'w', positions: ['b1'], entangledWith: [] });
  pieces.push({ id: 'w_n1', type: 'n', color: 'w', positions: ['g1'], entangledWith: [] });
  pieces.push({ id: 'b_n0', type: 'n', color: 'b', positions: ['b8'], entangledWith: [] });
  pieces.push({ id: 'b_n1', type: 'n', color: 'b', positions: ['g8'], entangledWith: [] });
  // Bishops
  pieces.push({ id: 'w_b0', type: 'b', color: 'w', positions: ['c1'], entangledWith: [] });
  pieces.push({ id: 'w_b1', type: 'b', color: 'w', positions: ['f1'], entangledWith: [] });
  pieces.push({ id: 'b_b0', type: 'b', color: 'b', positions: ['c8'], entangledWith: [] });
  pieces.push({ id: 'b_b1', type: 'b', color: 'b', positions: ['f8'], entangledWith: [] });
  // Queens
  pieces.push({ id: 'w_q', type: 'q', color: 'w', positions: ['d1'], entangledWith: [] });
  pieces.push({ id: 'b_q', type: 'q', color: 'b', positions: ['d8'], entangledWith: [] });
  // Kings
  pieces.push({ id: 'w_k', type: 'k', color: 'w', positions: ['e1'], entangledWith: [] });
  pieces.push({ id: 'b_k', type: 'k', color: 'b', positions: ['e8'], entangledWith: [] });
  return pieces;
};

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

const PieceIcon = ({ type, color }) => {
  const pieces = {
    'w_p': '♙', 'w_r': '♖', 'w_n': '♘', 'w_b': '♗', 'w_q': '♕', 'w_k': '♔',
    'b_p': '♟', 'b_r': '♜', 'b_n': '♞', 'b_b': '♝', 'b_q': '♛', 'b_k': '♚'
  };
  const key = `${color}_${type}`;
  return <span className="text-3xl font-bold">{pieces[key] || '?'}</span>;
};

// --- Move History Component ---
const MoveHistory = ({ moves, currentMoveIndex, onMoveClick }) => {
  const formatMove = (move) => {
    if (move.type === 'classical') {
      return `${move.piece} ${move.from} → ${move.to}`;
    } else if (move.type === 'superposition') {
      return `⚛️ ${move.piece} → ${move.destinations.join(' & ')}`;
    } else if (move.type === 'entanglement') {
      return `🔗 ${move.piece1} ↔ ${move.piece2}`;
    } else if (move.type === 'measurement') {
      return `📊 ${move.piece} → ${move.collapsedTo}`;
    }
    return 'Unknown move';
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-4 w-80 max-h-96 overflow-y-auto">
      <h3 className="text-xl font-bold text-white mb-4">Move History</h3>
      {moves.length === 0 ? (
        <div className="text-gray-400 text-sm italic">No moves yet</div>
      ) : (
        <div className="space-y-2">
          {moves.map((move, index) => (
            <div
              key={index}
              onClick={() => onMoveClick(index)}
              className={`p-2 rounded-lg cursor-pointer transition-all duration-200 text-sm ${
                index === currentMoveIndex
                  ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-200'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-mono">{Math.floor(index / 2) + 1}.{index % 2 === 0 ? '' : '..'}</span>
                <span className="text-xs opacity-70">{move.color === 'w' ? '⚪' : '⚫'}</span>
              </div>
              <div className="mt-1 font-medium">{formatMove(move)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Animated Background Component ---
const AnimatedBackground = () => {
  return (
      <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-30 animate-pan"></div>
          <style>{`
              @keyframes pan { 0% { background-position: 0% 0%; } 100% { background-position: 100% 100%; } }
              .bg-grid-pattern {
                  background-image: linear-gradient(to right, rgba(0, 255, 255, 0.2) 1px, transparent 1px),
                                  linear-gradient(to bottom, rgba(0, 255, 255, 0.2) 1px, transparent 1px);
                  background-size: 3rem 3rem;
              }
              .animate-pan { animation: pan 60s linear infinite; }
          `}</style>
      </div>
  );
};

const AnimatedHero = () => {
  return (
      <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-30 animate-pan"></div>
          <style>{`
              @keyframes pan { 0% { background-position: 0% 0%; } 100% { background-position: 100% 100%; } }
              .bg-grid-pattern {
                  background-image: linear-gradient(to right, rgba(0, 255, 255, 0.2) 1px, transparent 1px),
                                  linear-gradient(to bottom, rgba(0, 255, 255, 0.2) 1px, transparent 1px);
                  background-size: 3rem 3rem;
              }
              .animate-pan { animation: pan 60s linear infinite; }
          `}</style>
      </div>
  );
};

const SuperpositionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-5-4v4m-5-2v2m10-12V4M7 8V4m5 4V4M7 16a5 5 0 015-5h0a5 5 0 015 5v0" /></svg>;
const EntanglementIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const MeasurementIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;

// --- Hero Section Component ---
const HeroSection = ({ onStartGame }) => {
  const cards = [
    { icon: <SuperpositionIcon />, title: "Superposition", text: "A piece can exist in multiple squares at once. Its true location is unknown until measured." },
    { icon: <EntanglementIcon />, title: "Entanglement", text: "Link two pieces. If one is measured, the state of the other is instantly affected, no matter the distance." },
    { icon: <MeasurementIcon />, title: "Measurement", text: "Attempting a move on a superpositioned piece forces it to collapse into a single, definite state." }
];

return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 text-white overflow-hidden bg-black">
        <AnimatedHero />
        <div className="relative z-10 flex flex-col items-center text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-cyan-300 drop-shadow-[0_0_15px_rgba(0,255,255,0.4)]">
                Quantum Chess
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl">
                Where strategy meets probability. Bend the rules of reality and outmaneuver your opponent in a game of infinite possibilities.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button onClick={onStartGame} className="px-8 py-3 rounded-md bg-cyan-600 hover:bg-cyan-700 transition-all duration-300 text-white font-bold text-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transform hover:scale-105">
                    Play Now
                </button>
                <button disabled className="px-8 py-3 rounded-md bg-gray-700 text-gray-400 font-bold text-lg cursor-not-allowed">
                    Create Account (Soon)
                </button>
            </div>
        </div>

        <div className="relative z-10 mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
            {cards.map(card => (
                <div key={card.title} className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700 text-center flex flex-col items-center">
                    {card.icon}
                    <h3 className="mt-4 text-2xl font-bold text-cyan-400">{card.title}</h3>
                    <p className="mt-2 text-gray-400">{card.text}</p>
                </div>
            ))}
        </div>
    </div>
  );
};



// --- Board Renderer ---
function Board({ pieces, selected, possibleMoves, onSquareClick, quantumMode, entangleCandidate }) {
  // Find all pieces on a square (can be >1 for superposition)
  const getPiecesOnSquare = (square) => pieces.filter(p => p.positions.includes(square));
  const isSuperposed = (square) => getPiecesOnSquare(square).some(p => p.positions.length > 1);
  const isEntangled = (square) => getPiecesOnSquare(square).some(p => p.entangledWith.length > 0);
  
  return (
    <div className="relative">
      <div className="absolute -top-6 left-0 right-0 flex justify-between text-xs text-gray-300 font-medium">
        {files.map(file => <span key={file} className="w-[62.5px] text-center">{file}</span>)}
      </div>
      <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-300 font-medium">
        {ranks.map(rank => <span key={rank} className="h-[62.5px] flex items-center">{rank}</span>)}
      </div>
      <div className="w-[500px] h-[500px] border-4 border-amber-600 bg-gradient-to-br from-amber-800 to-amber-900 rounded-xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-8 h-full">
          {ranks.map(rank => files.map(file => {
            const square = `${file}${rank}`;
            const piecesOnSquare = getPiecesOnSquare(square);
            const isSelected = selected === square;
            const isPossible = possibleMoves.includes(square);
            return (
              <div
                key={square}
                className={`relative w-[62.5px] h-[62.5px] flex items-center justify-center cursor-pointer transition-all duration-200
                  ${(file.charCodeAt(0) + rank.charCodeAt(0)) % 2 === 0 ? 'bg-amber-200' : 'bg-amber-100'}
                  ${isSelected ? 'bg-blue-500 shadow-lg scale-105' : ''}
                  ${isPossible ? 'bg-green-400 shadow-lg' : ''}
                  ${isSuperposed(square) ? 'bg-cyan-400 shadow-lg' : ''}
                  ${isEntangled(square) ? 'bg-pink-400 shadow-lg' : ''}
                  hover:bg-amber-300 hover:shadow-md active:scale-95`}
                onClick={() => onSquareClick(square)}
              >
                {piecesOnSquare.map((piece, idx) => (
                  <div
                    key={piece.id + idx}
                    className={`w-[50px] h-[50px] flex items-center justify-center rounded-full transition-all duration-200
                      ${isSelected ? 'bg-blue-600 text-white shadow-xl' : ''}
                      ${isPossible ? 'bg-green-600 text-white shadow-xl' : ''}
                      ${piece.positions.length > 1 ? 'bg-cyan-600 text-white shadow-xl animate-pulse' : ''}
                      ${piece.entangledWith.length > 0 ? 'bg-pink-600 text-white shadow-xl' : ''}`}
                  >
                    <PieceIcon type={piece.type} color={piece.color} />
                  </div>
                ))}
                {isPossible && piecesOnSquare.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 bg-green-500 rounded-full opacity-80 animate-pulse"></div>
                  </div>
                )}
                {isSuperposed(square) && piecesOnSquare.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 bg-cyan-500 rounded-full opacity-80 animate-pulse"></div>
                  </div>
                )}
              </div>
            );
          }))}
        </div>
      </div>
    </div>
  );
}

// --- Main App ---
export default function App() {
  const [showHero, setShowHero] = useState(true);
  const [pieces, setPieces] = useState(initialBoard());
  const [turn, setTurn] = useState('w');
  const [selected, setSelected] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [quantumMode, setQuantumMode] = useState(null);
  const [quantumStep, setQuantumStep] = useState(null);
  const [quantumSelection, setQuantumSelection] = useState(null);
  const [entangleCandidate, setEntangleCandidate] = useState(null);
  const [message, setMessage] = useState('');
  const [moveHistory, setMoveHistory] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);

  // --- Improved Move Generation ---
  function getLegalMoves(piece, from) {
    const moves = [];
    const fileIdx = files.indexOf(from[0]);
    const rankIdx = ranks.indexOf(from[1]);
    
    if (piece.type === 'p') {
      const dir = piece.color === 'w' ? -1 : 1; // White moves up (decreasing rank), Black moves down
      const startRank = piece.color === 'w' ? '2' : '7';
      
      // Forward move
      const nextRank = ranks[rankIdx + dir];
      if (nextRank) {
        const dest = `${from[0]}${nextRank}`;
        if (!pieces.some(p => p.positions.includes(dest))) {
          moves.push(dest);
          
          // Double move from starting position
          if (from[1] === startRank) {
            const doubleRank = ranks[rankIdx + 2 * dir];
            if (doubleRank) {
              const doubleDest = `${from[0]}${doubleRank}`;
              if (!pieces.some(p => p.positions.includes(doubleDest))) {
                moves.push(doubleDest);
              }
            }
          }
        }
      }
      
      // Diagonal captures
      const leftFile = files[fileIdx - 1];
      const rightFile = files[fileIdx + 1];
      if (leftFile) {
        const leftDest = `${leftFile}${nextRank}`;
        if (pieces.some(p => p.positions.includes(leftDest) && p.color !== piece.color)) {
          moves.push(leftDest);
        }
      }
      if (rightFile) {
        const rightDest = `${rightFile}${nextRank}`;
        if (pieces.some(p => p.positions.includes(rightDest) && p.color !== piece.color)) {
          moves.push(rightDest);
        }
      }
    } else if (piece.type === 'r') {
      // Rook moves: horizontal and vertical
      for (let i = 0; i < 8; i++) {
        if (i !== fileIdx) moves.push(`${files[i]}${from[1]}`);
        if (i !== rankIdx) moves.push(`${from[0]}${ranks[i]}`);
      }
    } else if (piece.type === 'n') {
      // Knight moves: L-shape
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      knightMoves.forEach(([df, dr]) => {
        const newFileIdx = fileIdx + df;
        const newRankIdx = rankIdx + dr;
        if (newFileIdx >= 0 && newFileIdx < 8 && newRankIdx >= 0 && newRankIdx < 8) {
          const dest = `${files[newFileIdx]}${ranks[newRankIdx]}`;
          const targetPiece = pieces.find(p => p.positions.includes(dest));
          if (!targetPiece || targetPiece.color !== piece.color) {
            moves.push(dest);
          }
        }
      });
    } else if (piece.type === 'b') {
      // Bishop moves: diagonal
      for (let i = 1; i < 8; i++) {
        const directions = [[i, i], [i, -i], [-i, i], [-i, -i]];
        directions.forEach(([df, dr]) => {
          const newFileIdx = fileIdx + df;
          const newRankIdx = rankIdx + dr;
          if (newFileIdx >= 0 && newFileIdx < 8 && newRankIdx >= 0 && newRankIdx < 8) {
            const dest = `${files[newFileIdx]}${ranks[newRankIdx]}`;
            const targetPiece = pieces.find(p => p.positions.includes(dest));
            if (!targetPiece) {
              moves.push(dest);
            } else if (targetPiece.color !== piece.color) {
              moves.push(dest);
            }
          }
        });
      }
    } else if (piece.type === 'q') {
      // Queen moves: combination of rook and bishop
      // Horizontal and vertical
      for (let i = 0; i < 8; i++) {
        if (i !== fileIdx) moves.push(`${files[i]}${from[1]}`);
        if (i !== rankIdx) moves.push(`${from[0]}${ranks[i]}`);
      }
      // Diagonal
      for (let i = 1; i < 8; i++) {
        const directions = [[i, i], [i, -i], [-i, i], [-i, -i]];
        directions.forEach(([df, dr]) => {
          const newFileIdx = fileIdx + df;
          const newRankIdx = rankIdx + dr;
          if (newFileIdx >= 0 && newFileIdx < 8 && newRankIdx >= 0 && newRankIdx < 8) {
            const dest = `${files[newFileIdx]}${ranks[newRankIdx]}`;
            const targetPiece = pieces.find(p => p.positions.includes(dest));
            if (!targetPiece) {
              moves.push(dest);
            } else if (targetPiece.color !== piece.color) {
              moves.push(dest);
            }
          }
        });
      }
    } else if (piece.type === 'k') {
      // King moves: one square in any direction
      for (let df = -1; df <= 1; df++) {
        for (let dr = -1; dr <= 1; dr++) {
          if (df === 0 && dr === 0) continue;
          const newFileIdx = fileIdx + df;
          const newRankIdx = rankIdx + dr;
          if (newFileIdx >= 0 && newFileIdx < 8 && newRankIdx >= 0 && newRankIdx < 8) {
            const dest = `${files[newFileIdx]}${ranks[newRankIdx]}`;
            const targetPiece = pieces.find(p => p.positions.includes(dest));
            if (!targetPiece || targetPiece.color !== piece.color) {
              moves.push(dest);
            }
          }
        }
      }
    }
    
    return moves;
  }

  // --- Add Move to History ---
  function addMoveToHistory(move) {
    setMoveHistory(prev => [...prev, move]);
    setCurrentMoveIndex(prev => prev + 1);
  }

  // --- Handle Move History Click ---
  function handleMoveHistoryClick(index) {
    // For now, just highlight the move
    setCurrentMoveIndex(index);
    // TODO: Implement move replay functionality
  }

  // --- Logging Helper ---
  function logBoardState(label) {
    console.log(`\n=== ${label} ===`);
    pieces.forEach(p => {
      console.log(`Piece ${p.id} (${p.color} ${p.type}) at [${p.positions.join(', ')}]${p.entangledWith.length ? ' entangled with ' + p.entangledWith.join(',') : ''}`);
    });
    console.log('Turn:', turn);
  }

  // --- Board Click Handler ---
  function handleSquareClick(square) {
    setMessage('');
    if (quantumMode === 'superposition') {
      handleSuperposition(square);
      return;
    }
    if (quantumMode === 'entanglement') {
      handleEntanglement(square);
      return;
    }
    // Classical move
    const piece = pieces.find(p => p.positions.includes(square) && p.color === turn && p.positions.length === 1);
    if (!selected) {
      if (piece) {
        setSelected(square);
        setPossibleMoves(getLegalMoves(piece, square));
        console.log(`[SELECT] ${turn === 'w' ? 'White' : 'Black'} selected ${piece.type} at ${square}`);
      } else {
        setMessage('No selectable piece here.');
        console.log('[ERROR] No selectable piece at', square);
      }
    } else {
      if (possibleMoves.includes(square)) {
        const movedPiece = pieces.find(p => p.positions.includes(selected) && p.color === turn && p.positions.length === 1);
        setPieces(prev => prev.map(p =>
          p.positions.includes(selected) && p.color === turn && p.positions.length === 1
            ? { ...p, positions: [square], hasMoved: true }
            : p
        ));
        
        // Add move to history
        addMoveToHistory({
          type: 'classical',
          color: turn,
          piece: movedPiece.type,
          from: selected,
          to: square,
          timestamp: Date.now()
        });
        
        setTurn(turn === 'w' ? 'b' : 'w');
        setMessage('Move complete.');
        console.log(`[MOVE] ${turn === 'w' ? 'White' : 'Black'} moved from ${selected} to ${square}`);
        logBoardState('After Move');
      } else {
        setMessage('Invalid move.');
        console.log('[ERROR] Invalid move to', square);
      }
      setSelected(null);
      setPossibleMoves([]);
    }
  }

  // --- Quantum Superposition ---
  function handleSuperposition(square) {
    setMessage('');
    const piece = pieces.find(p => p.positions.includes(square) && p.color === turn && p.positions.length === 1);
    if (!quantumSelection) {
      if (piece) {
        setQuantumSelection({ piece, from: square });
        setQuantumStep('dest1');
        setMessage('Select first destination for superposition.');
        console.log(`[Q-SUPER] Selected ${piece.type} at ${square} for superposition.`);
      } else {
        setMessage('Select a valid piece for superposition.');
        console.log('[ERROR] No valid piece for superposition at', square);
      }
    } else if (quantumStep === 'dest1') {
      if (square !== quantumSelection.from) {
        setQuantumSelection(prev => ({ ...prev, dest1: square }));
        setQuantumStep('dest2');
        setMessage('Select second destination for superposition.');
        console.log(`[Q-SUPER] First destination: ${square}`);
      } else {
        setMessage('Choose a different square.');
        console.log('[ERROR] Superposition destination same as origin.');
      }
    } else if (quantumStep === 'dest2') {
      if (square !== quantumSelection.from && square !== quantumSelection.dest1) {
        // Create superposed piece
        setPieces(prev => prev.map(p =>
          p.id === quantumSelection.piece.id
            ? { ...p, positions: [quantumSelection.dest1, square] }
            : p
        ));
        
        // Add move to history
        addMoveToHistory({
          type: 'superposition',
          color: turn,
          piece: quantumSelection.piece.type,
          from: quantumSelection.from,
          destinations: [quantumSelection.dest1, square],
          timestamp: Date.now()
        });
        
        setQuantumMode(null);
        setQuantumStep(null);
        setQuantumSelection(null);
        setTurn(turn === 'w' ? 'b' : 'w');
        setMessage('Superposition created.');
        console.log(`[Q-SUPER] Superposed ${quantumSelection.piece.type} to ${quantumSelection.dest1} and ${square}`);
        logBoardState('After Superposition');
      } else {
        setMessage('Choose a different square.');
        console.log('[ERROR] Superposition destination invalid.');
      }
    }
  }

  // --- Quantum Entanglement ---
  function handleEntanglement(square) {
    setMessage('');
    const piece = pieces.find(p => p.positions.includes(square) && p.positions.length > 1);
    if (!entangleCandidate) {
      if (piece) {
        setEntangleCandidate(piece.id);
        setMessage('Select another superposed piece to entangle.');
        console.log(`[Q-ENTANGLE] Selected ${piece.type} (${piece.id}) for entanglement.`);
      } else {
        setMessage('Select a superposed piece.');
        console.log('[ERROR] No superposed piece at', square);
      }
    } else {
      if (piece && piece.id !== entangleCandidate) {
        setPieces(prev => prev.map(p =>
          p.id === piece.id || p.id === entangleCandidate
            ? { ...p, entangledWith: [...new Set([...(p.entangledWith || []), entangleCandidate, piece.id].filter(Boolean))] }
            : p
        ));
        
        // Add move to history
        addMoveToHistory({
          type: 'entanglement',
          color: turn,
          piece1: piece.type,
          piece2: pieces.find(p => p.id === entangleCandidate)?.type || 'unknown',
          timestamp: Date.now()
        });
        
        setQuantumMode(null);
        setEntangleCandidate(null);
        setTurn(turn === 'w' ? 'b' : 'w');
        setMessage('Entanglement created.');
        console.log(`[Q-ENTANGLE] Entangled ${piece.id} with ${entangleCandidate}`);
        logBoardState('After Entanglement');
      } else {
        setMessage('Select a different superposed piece.');
        console.log('[ERROR] Invalid entanglement selection.');
      }
    }
  }

  // --- Quantum Measurement (collapse) ---
  function handleMeasure() {
    setMessage('');
    // Collapse a random superposed piece
    const superposed = pieces.filter(p => p.positions.length > 1);
    if (superposed.length === 0) {
      setMessage('No superposed pieces to measure.');
      console.log('[ERROR] No superposed pieces to measure.');
      return;
    }
    const idx = Math.floor(Math.random() * superposed.length);
    const piece = superposed[idx];
    const pos = piece.positions[Math.floor(Math.random() * piece.positions.length)];
    setPieces(prev => prev.map(p =>
      p.id === piece.id ? { ...p, positions: [pos], entangledWith: [] } : p
    ));
    
    // Add move to history
    addMoveToHistory({
      type: 'measurement',
      color: turn,
      piece: piece.type,
      collapsedTo: pos,
      timestamp: Date.now()
    });
    
    setMessage(`Measured: ${piece.type} collapsed to ${pos}`);
    console.log(`[Q-MEASURE] Collapsed ${piece.id} to ${pos}`);
    logBoardState('After Measurement');
  }

  // --- Reset Game ---
  function resetGame() {
    setPieces(initialBoard());
    setTurn('w');
    setSelected(null);
    setPossibleMoves([]);
    setQuantumMode(null);
    setQuantumStep(null);
    setQuantumSelection(null);
    setEntangleCandidate(null);
    setMessage('');
    setMoveHistory([]);
    setCurrentMoveIndex(-1);
  }

  if (showHero) {
    return <HeroSection onStartGame={() => setShowHero(false)} />;
  }

  // --- Game UI ---
  return (
    <div className="min-h-screen bg-cyan-900 from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
      <AnimatedHero />
      <div className="relative z-10 max-w-7xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Quantum Chess
          </h1>
          <p className="text-gray-300 text-lg">Experience chess through quantum mechanics</p>
        </div>
        
        <div className="flex flex-row items-start justify-center gap-8">
          {/* Quantum Controls - Left Side */}
          <div className="flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 w-80">
              <h3 className="text-2xl font-bold text-white mb-4">Quantum Controls</h3>
              
              <button
                onClick={() => { 
                  setQuantumMode(quantumMode === 'superposition' ? null : 'superposition'); 
                  setQuantumStep(null); 
                  setQuantumSelection(null); 
                  setMessage(''); 
                }}
                className={`w-full py-3 px-4 rounded-xl font-semibold mb-3 transition-all duration-300 ${
                  quantumMode === 'superposition' 
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                ⚛️ Superposition
              </button>
              
              <button
                onClick={() => { 
                  setQuantumMode(quantumMode === 'entanglement' ? null : 'entanglement'); 
                  setEntangleCandidate(null); 
                  setMessage(''); 
                }}
                className={`w-full py-3 px-4 rounded-xl font-semibold mb-3 transition-all duration-300 ${
                  quantumMode === 'entanglement' 
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/50' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                🔗 Entanglement
              </button>
              
              <button
                onClick={handleMeasure}
                className="w-full py-3 px-4 rounded-xl font-semibold bg-yellow-500 text-white mb-3 hover:bg-yellow-400 transition-all duration-300 shadow-lg shadow-yellow-500/50"
              >
                📊 Measure
              </button>
              
              <button
                onClick={resetGame}
                className="w-full py-3 px-4 rounded-xl font-semibold bg-red-500 text-white mb-4 hover:bg-red-400 transition-all duration-300 shadow-lg shadow-red-500/50"
              >
                🔄 Reset Game
              </button>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Turn:</span>
                  <span className={`font-bold ${turn === 'w' ? 'text-white' : 'text-gray-400'}`}>
                    {turn === 'w' ? '⚪ White' : '⚫ Black'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Mode:</span>
                  <span className="text-cyan-400 font-semibold">
                    {quantumMode ? quantumMode.charAt(0).toUpperCase() + quantumMode.slice(1) : 'Classical'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Moves:</span>
                  <span className="text-gray-300 font-mono">{moveHistory.length}</span>
                </div>
                {message && (
                  <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-xs">
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Chess Board - Center */}
          <div className="flex-shrink-0">
            <Board
              pieces={pieces}
              selected={selected}
              possibleMoves={possibleMoves}
              onSquareClick={handleSquareClick}
              quantumMode={quantumMode}
              entangleCandidate={entangleCandidate}
            />
          </div>
          
          {/* Move History - Right Side */}
          <div className="flex-shrink-0">
            <MoveHistory 
              moves={moveHistory}
              currentMoveIndex={currentMoveIndex}
              onMoveClick={handleMoveHistoryClick}
            />
          </div>
        </div>
        
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>Click a piece to select, then a destination. Use quantum controls for superposition and entanglement.</p>
          <button 
            onClick={() => setShowHero(true)}
            className="mt-4 px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
          >
            ← Back to Hero
          </button>
        </div>
      </div>
    </div>
  );
}
