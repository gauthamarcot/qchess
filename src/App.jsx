import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import logo from './assets/logo.png';

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

// --- User Authentication Components ---
const AuthModal = ({ isOpen, onClose, onLogin, onSignup, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setName('');
      setIsLogin(initialMode === 'login');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 w-96 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {isLogin ? 'Login' : 'Create Account'}
        </h2>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          if (isLogin) {
            onLogin(email, password);
          } else {
            onSignup(email, password, name);
          }
        }}>
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                placeholder="Enter your name"
                required
              />
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-300 text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-all duration-300 mb-4"
          >
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
        
        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-cyan-400 hover:text-cyan-300 text-sm"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// --- Play Options Modal ---
const PlayOptionsModal = ({ isOpen, onClose, onLogin, onGuestPlay }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 w-96 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Choose How to Play
        </h2>
        
        <div className="space-y-4">
          <button
            onClick={onLogin}
            className="w-full py-4 px-6 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-3"
          >
            <span className="text-xl">👤</span>
            <span>Login to Play</span>
          </button>
          
          <div className="text-center text-gray-400 text-sm">
            <p>• Save your progress</p>
            <p>• Track your stats</p>
            <p>• Play with friends</p>
          </div>
          
          <div className="border-t border-white/20 my-4"></div>
          
          <button
            onClick={onGuestPlay}
            className="w-full py-4 px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-3"
          >
            <span className="text-xl">🎮</span>
            <span>Play as Guest</span>
          </button>
          
          <div className="text-center text-gray-400 text-sm">
            <p>• Start playing immediately</p>
            <p>• No account required</p>
            <p>• Progress won't be saved</p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const ProfileSection = ({ user, onLogout, onInvite, stats, onRefreshStats, onShowStats }) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  const generateInviteLink = () => {
    const link = `${window.location.origin}/invite/${btoa(inviteEmail)}`;
    setInviteLink(link);
    setShowInviteModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 w-80">
      <h3 className="text-2xl font-bold text-white mb-4">Profile</h3>
      
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <div className="text-white font-semibold">{user?.name || 'User'}</div>
            <div className="text-gray-400 text-sm">{user?.email}</div>
          </div>
          <button
            onClick={onShowStats}
            className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-all duration-300"
            title="View Stats"
          >
            📊
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setShowInviteModal(true)}
          className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-all duration-300"
        >
          🔗 Invite Friends
        </button>
        
        <button
          onClick={onLogout}
          className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300"
        >
          🚪 Logout
        </button>
      </div>

      {/* Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-96 border border-white/20 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Game Statistics</h3>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            {stats ? (
              <div className="space-y-4">
                {/* Win Rate */}
                <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg p-4 border border-green-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 font-semibold">Win Rate</span>
                    <span className="text-2xl font-bold text-green-400">{stats.winRate}%</span>
                  </div>
                  <div className="text-xs text-green-300 mt-1">
                    {stats.gamesWon}W / {stats.gamesLost}L
                  </div>
                </div>
                
                {/* Games Played */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-500/30">
                    <div className="text-blue-400 text-sm">Total Games</div>
                    <div className="text-xl font-bold text-blue-400">{stats.totalGames}</div>
                  </div>
                  <div className="bg-purple-500/20 rounded-lg p-3 border border-purple-500/30">
                    <div className="text-purple-400 text-sm">Recent (7d)</div>
                    <div className="text-xl font-bold text-purple-400">{stats.recentGames}</div>
                  </div>
                </div>
                
                {/* Moves */}
                <div className="bg-cyan-500/20 rounded-lg p-4 border border-cyan-500/30">
                  <div className="text-cyan-400 font-semibold mb-2">Moves Used</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Classical:</span>
                      <span className="text-cyan-400 font-mono">{stats.classicalMoves}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Quantum:</span>
                      <span className="text-cyan-400 font-mono">{stats.quantumMoves}</span>
                    </div>
                  </div>
                </div>
                
                {/* Quantum Moves Breakdown */}
                <div className="bg-pink-500/20 rounded-lg p-4 border border-pink-500/30">
                  <div className="text-pink-400 font-semibold mb-2">Quantum Moves</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-pink-400 font-bold">{stats.superpositions}</div>
                      <div className="text-gray-400">⚛️ Super</div>
                    </div>
                    <div className="text-center">
                      <div className="text-pink-400 font-bold">{stats.entanglements}</div>
                      <div className="text-gray-400">🔗 Entangle</div>
                    </div>
                    <div className="text-center">
                      <div className="text-pink-400 font-bold">{stats.measurements}</div>
                      <div className="text-gray-400">📊 Measure</div>
                    </div>
                  </div>
                </div>
                
                {/* Average Game Duration */}
                <div className="bg-yellow-500/20 rounded-lg p-3 border border-yellow-500/30">
                  <div className="text-yellow-400 text-sm">Avg Duration</div>
                  <div className="text-lg font-bold text-yellow-400">
                    {formatDuration(stats.averageGameDuration)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-2">📊</div>
                <div>No games played yet</div>
                <div className="text-sm mt-1">Start playing to see your stats!</div>
              </div>
            )}
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowStatsModal(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-96 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Invite Friends</h3>
            
            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-2">Email Address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                placeholder="Enter friend's email"
              />
            </div>
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={generateInviteLink}
                className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-all duration-300"
              >
                Generate Link
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
            </div>
            
            {inviteLink && (
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">Invite Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-300"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
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
const HeroSection = ({ onDirectGuestPlay, onLoginAndPlay, onCreateAccount }) => {
  const cards = [
    { icon: <SuperpositionIcon />, title: "Superposition", text: "A piece can exist in multiple squares at once. Its true location is unknown until measured." },
    { icon: <EntanglementIcon />, title: "Entanglement", text: "Link two pieces. If one is measured, the state of the other is instantly affected, no matter the distance." },
    { icon: <MeasurementIcon />, title: "Measurement", text: "Attempting a move on a superpositioned piece forces it to collapse into a single, definite state." }
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 text-white overflow-hidden bg-black">
      <AnimatedHero />
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-2">
          <img 
            src={logo} 
            alt="Quantum Chess" 
            className="h-34 md:h-64 w-auto drop-shadow-[0_0_15px_rgba(0,255,255,0.4)]"
          />
        </div>
        <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl">
          Where strategy meets probability. Bend the rules of reality and outmaneuver your opponent in a game of infinite possibilities.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onDirectGuestPlay} 
            className="px-8 py-3 rounded-md bg-green-600 hover:bg-green-700 transition-all duration-300 text-white font-bold text-lg shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transform hover:scale-105"
          >
            🎮 Play as Guest
          </button>
          <button 
            onClick={onLoginAndPlay} 
            className="px-8 py-3 rounded-md bg-cyan-600 hover:bg-cyan-700 transition-all duration-300 text-white font-bold text-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transform hover:scale-105"
          >
            🔐 Login 'n' Play
          </button>
          <button 
            onClick={onCreateAccount} 
            className="px-8 py-3 rounded-md bg-purple-600 hover:bg-purple-700 transition-all duration-300 text-white font-bold text-lg shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transform hover:scale-105"
          >
            ✨ Create Account
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-20 flex flex-row gap-8 max-w-6xl w-full justify-center">
        {cards.map(card => (
          <div key={card.title} className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700 text-center flex flex-col items-center w-80">
            {card.icon}
            <h3 className="mt-4 text-2xl font-bold text-cyan-400">{card.title}</h3>
            <p className="mt-2 text-gray-400">{card.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Ad Space Components ---
const AdSpace = ({ position, size = 'medium' }) => {
  const adStyles = {
    small: 'w-48 h-32',
    medium: 'w-64 h-48',
    large: 'w-80 h-60'
  };

  const adContent = {
    top: '🎯 Premium Chess Lessons',
    bottom: '🏆 Join Tournament',
    left: '📚 Chess Books',
    right: '🎮 Play Online'
  };

  return (
    <div className={`${adStyles[size]} bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl border border-white/20 flex items-center justify-center text-white font-bold text-center p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer`}>
      <div>
        <div className="text-2xl mb-2">💰</div>
        <div className="text-sm">{adContent[position] || 'Ad Space'}</div>
        <div className="text-xs opacity-70 mt-1">Sponsored</div>
      </div>
    </div>
  );
};

const AdBanner = ({ type = 'horizontal' }) => {
  const bannerStyles = {
    horizontal: 'w-full h-16',
    vertical: 'w-20 h-96'
  };

  return (
    <div className={`${bannerStyles[type]} bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg border border-white/20 flex items-center justify-center text-white font-bold shadow-lg`}>
      <div className="text-center">
        <div className="text-lg">🎯</div>
        <div className="text-xs">Premium Features</div>
      </div>
    </div>
  );
};

// --- Board Renderer ---
function Board({ pieces, selected, possibleMoves, onSquareClick, quantumMode, entangleCandidate, checkedKingSquare }) {
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
            const isCheckedKing = checkedKingSquare === square;
            return (
              <div
                key={square}
                className={`relative w-[62.5px] h-[62.5px] flex items-center justify-center cursor-pointer transition-all duration-200
                  ${(file.charCodeAt(0) + rank.charCodeAt(0)) % 2 === 0 ? 'bg-amber-200' : 'bg-amber-100'}
                  ${isSelected ? 'bg-blue-500 shadow-lg scale-105' : ''}
                  ${isPossible ? 'bg-green-400 shadow-lg' : ''}
                  ${isSuperposed(square) ? 'bg-cyan-400 shadow-lg' : ''}
                  ${isEntangled(square) ? 'bg-pink-400 shadow-lg' : ''}
                  ${isCheckedKing ? 'ring-4 ring-red-500' : ''}
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
      {checkedKingSquare && (
        <div className="text-red-500 font-bold text-xl mb-2">Check!</div>
      )}
    </div>
  );
}

// --- User Stats Component ---
const UserStats = ({ user, stats, onRefresh }) => {
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-white">Game Stats</h3>
        <button
          onClick={onRefresh}
          className="text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          🔄
        </button>
      </div>
      
      {stats ? (
        <div className="space-y-4">
          {/* Win Rate */}
          <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg p-4 border border-green-500/30">
            <div className="flex justify-between items-center">
              <span className="text-green-400 font-semibold">Win Rate</span>
              <span className="text-2xl font-bold text-green-400">{stats.winRate}%</span>
            </div>
            <div className="text-xs text-green-300 mt-1">
              {stats.gamesWon}W / {stats.gamesLost}L
            </div>
          </div>
          
          {/* Games Played */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-500/30">
              <div className="text-blue-400 text-sm">Total Games</div>
              <div className="text-xl font-bold text-blue-400">{stats.totalGames}</div>
            </div>
            <div className="bg-purple-500/20 rounded-lg p-3 border border-purple-500/30">
              <div className="text-purple-400 text-sm">Recent (7d)</div>
              <div className="text-xl font-bold text-purple-400">{stats.recentGames}</div>
            </div>
          </div>
          
          {/* Moves */}
          <div className="bg-cyan-500/20 rounded-lg p-4 border border-cyan-500/30">
            <div className="text-cyan-400 font-semibold mb-2">Moves Used</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Classical:</span>
                <span className="text-cyan-400 font-mono">{stats.classicalMoves}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Quantum:</span>
                <span className="text-cyan-400 font-mono">{stats.quantumMoves}</span>
              </div>
            </div>
          </div>
          
          {/* Quantum Moves Breakdown */}
          <div className="bg-pink-500/20 rounded-lg p-4 border border-pink-500/30">
            <div className="text-pink-400 font-semibold mb-2">Quantum Moves</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-pink-400 font-bold">{stats.superpositions}</div>
                <div className="text-gray-400">⚛️ Super</div>
              </div>
              <div className="text-center">
                <div className="text-pink-400 font-bold">{stats.entanglements}</div>
                <div className="text-gray-400">🔗 Entangle</div>
              </div>
              <div className="text-center">
                <div className="text-pink-400 font-bold">{stats.measurements}</div>
                <div className="text-gray-400">📊 Measure</div>
              </div>
            </div>
          </div>
          
          {/* Average Game Duration */}
          <div className="bg-yellow-500/20 rounded-lg p-3 border border-yellow-500/30">
            <div className="text-yellow-400 text-sm">Avg Duration</div>
            <div className="text-lg font-bold text-yellow-400">
              {formatDuration(stats.averageGameDuration)}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-2">📊</div>
          <div>No games played yet</div>
          <div className="text-sm mt-1">Start playing to see your stats!</div>
        </div>
      )}
    </div>
  );
};

// --- Game History Component ---
const GameHistory = ({ games, onGameClick, onLoadMore, hasMore, user }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getGameResult = (game, userId) => {
    if (!userId) return 'Unknown';
    const player = game.players.find(p => p.userId === userId);
    if (!player) return 'Unknown';
    return player.isWinner ? 'Victory' : 'Defeat';
  };

  const getGameResultColor = (result) => {
    switch (result) {
      case 'Victory': return 'text-green-400';
      case 'Defeat': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 w-80 max-h-96 overflow-y-auto">
      <h3 className="text-xl font-bold text-white mb-4">Game History</h3>
      
      {games.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-2">📜</div>
          <div>No games yet</div>
          <div className="text-sm mt-1">Your game history will appear here</div>
        </div>
      ) : (
        <div className="space-y-3">
          {games.map((game) => (
            <div
              key={game.gameId}
              onClick={() => onGameClick(game)}
              className="bg-white/5 hover:bg-white/10 rounded-lg p-3 cursor-pointer transition-all duration-200 border border-white/10 hover:border-white/20"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-semibold text-white">
                  Game #{game.gameId.slice(0, 8)}
                </div>
                <div className={`text-xs font-bold ${getGameResultColor(getGameResult(game, user?.id))}`}>
                  {getGameResult(game, user?.id)}
                </div>
              </div>
              
              <div className="text-xs text-gray-400 mb-2">
                {formatDate(game.createdAt)}
              </div>
              
              <div className="flex justify-between text-xs">
                <div className="text-gray-300">
                  <span className="text-cyan-400">⚛️</span> {game.stats.quantumMoves}
                </div>
                <div className="text-gray-300">
                  <span className="text-white">♟️</span> {game.stats.classicalMoves}
                </div>
                <div className="text-gray-300">
                  <span className="text-yellow-400">⏱️</span> {Math.floor(game.duration / 60)}m
                </div>
              </div>
            </div>
          ))}
          
          {hasMore && (
            <button
              onClick={onLoadMore}
              className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-all duration-200"
            >
              Load More Games
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// --- Game Invite Component ---
const GameInvite = ({ onInvitePlayer, onJoinGame }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [opponentEmail, setOpponentEmail] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [generatedInvite, setGeneratedInvite] = useState('');

  const handleCreateGame = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          opponentEmail: opponentEmail || undefined,
          settings: {
            quantumMode: true,
            allowSpectators: true
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedInvite(data.data.game.inviteCode);
        setShowInviteModal(true);
        setMessage('Game created successfully!');
      } else {
        setMessage(data.message || 'Failed to create game');
      }
    } catch (error) {
      setMessage('Error creating game');
    }
  };

  const handleJoinGame = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/games/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ inviteCode })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Joined game successfully!');
        setInviteCode('');
      } else {
        setMessage(data.message || 'Failed to join game');
      }
    } catch (error) {
      setMessage('Error joining game');
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/game/${generatedInvite}`;
    navigator.clipboard.writeText(inviteLink);
    setMessage('Invite link copied to clipboard!');
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 w-80">
      <h3 className="text-2xl font-bold text-white mb-4">Game Invites</h3>
      
      <div className="space-y-4">
        {/* Create Game */}
        <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg p-4 border border-green-500/30">
          <h4 className="text-green-400 font-semibold mb-3">Create New Game</h4>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Opponent email (optional)"
              value={opponentEmail}
              onChange={(e) => setOpponentEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm"
            />
            <button
              onClick={handleCreateGame}
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-300"
            >
              🎮 Create Game
            </button>
          </div>
        </div>
        
        {/* Join Game */}
        <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg p-4 border border-blue-500/30">
          <h4 className="text-blue-400 font-semibold mb-3">Join Game</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm"
            />
            <button
              onClick={handleJoinGame}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300"
            >
              🔗 Join Game
            </button>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-96 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Game Invite</h3>
            
            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-2">Invite Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={generatedInvite}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-mono"
                />
                <button
                  onClick={copyInviteLink}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Copy
                </button>
              </div>
            </div>
            
            <div className="text-center text-gray-400 text-sm mb-4">
              Share this code with your opponent to join the game
            </div>
            
            <button
              onClick={() => setShowInviteModal(false)}
              className="w-full py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

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
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [gameHistoryPage, setGameHistoryPage] = useState(1);
  const [hasMoreGames, setHasMoreGames] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isPlayOptionsModalOpen, setIsPlayOptionsModalOpen] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  // Add state for promotion
  const [pendingPromotion, setPendingPromotion] = useState(null);
  // Add state to track en passant target
  const [enPassantTarget, setEnPassantTarget] = useState(null);
  // In App component state:
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [teleportUsed, setTeleportUsed] = useState({ w: false, b: false });
  const [teleportSelection, setTeleportSelection] = useState(null);
  const [swapUsed, setSwapUsed] = useState({ w: false, b: false });
  const [swapSelection, setSwapSelection] = useState([]);
  const [cloneUsed, setCloneUsed] = useState({ w: false, b: false });
  const [cloneSelection, setCloneSelection] = useState(null);
  const [playWithAI, setPlayWithAI] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState('');

  // Lobby state
  const [showLobby, setShowLobby] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [availableGames, setAvailableGames] = useState([]);
  const [myGames, setMyGames] = useState([]);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [gameId, setGameId] = useState(null);
  const [playerColor, setPlayerColor] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showGame, setShowGame] = useState(false);

  // --- Improved Move Generation ---
  function getLegalMoves(piece, from, board = pieces, ignoreCheck = false) {
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
        if (!board.some(p => p.positions.includes(dest))) {
          moves.push(dest);
          
          // Double move from starting position
          if (from[1] === startRank) {
            const doubleRank = ranks[rankIdx + 2 * dir];
            if (doubleRank) {
              const doubleDest = `${from[0]}${doubleRank}`;
              if (!board.some(p => p.positions.includes(doubleDest))) {
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
        if (board.some(p => p.positions.includes(leftDest) && p.color !== piece.color)) {
          moves.push(leftDest);
        }
      }
      if (rightFile) {
        const rightDest = `${rightFile}${nextRank}`;
        if (board.some(p => p.positions.includes(rightDest) && p.color !== piece.color)) {
          moves.push(rightDest);
        }
      }
      // En passant
      if (enPassantTarget) {
        if (leftFile) {
          const leftEP = `${leftFile}${nextRank}`;
          if (leftEP === enPassantTarget && board.some(p => p.positions.includes(`${leftFile}${from[1]}`) && p.type === 'p' && p.color !== piece.color)) {
            moves.push(leftEP);
          }
        }
        if (rightFile) {
          const rightEP = `${rightFile}${nextRank}`;
          if (rightEP === enPassantTarget && board.some(p => p.positions.includes(`${rightFile}${from[1]}`) && p.type === 'p' && p.color !== piece.color)) {
            moves.push(rightEP);
          }
        }
      }
    } else if (piece.type === 'r') {
      // Rook moves: horizontal and vertical, stop at first piece
      // Horizontal
      for (let dir = -1; dir <= 1; dir += 2) {
        for (let i = fileIdx + dir; i >= 0 && i < 8; i += dir) {
          const dest = `${files[i]}${from[1]}`;
          const targetPiece = board.find(p => p.positions.includes(dest));
          if (!targetPiece) {
            moves.push(dest);
          } else {
            if (targetPiece.color !== piece.color) moves.push(dest);
            break;
          }
        }
      }
      // Vertical
      for (let dir = -1; dir <= 1; dir += 2) {
        for (let i = rankIdx + dir; i >= 0 && i < 8; i += dir) {
          const dest = `${from[0]}${ranks[i]}`;
          const targetPiece = board.find(p => p.positions.includes(dest));
          if (!targetPiece) {
            moves.push(dest);
          } else {
            if (targetPiece.color !== piece.color) moves.push(dest);
            break;
          }
        }
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
          const targetPiece = board.find(p => p.positions.includes(dest));
          if (!targetPiece || targetPiece.color !== piece.color) {
            moves.push(dest);
          }
        }
      });
    } else if (piece.type === 'b') {
      // Bishop moves: diagonal, stop at first piece
      const directions = [[1,1],[1,-1],[-1,1],[-1,-1]];
      for (const [df, dr] of directions) {
        let f = fileIdx + df;
        let r = rankIdx + dr;
        while (f >= 0 && f < 8 && r >= 0 && r < 8) {
          const dest = `${files[f]}${ranks[r]}`;
          const targetPiece = board.find(p => p.positions.includes(dest));
            if (!targetPiece) {
              moves.push(dest);
          } else {
            if (targetPiece.color !== piece.color) moves.push(dest);
            break;
            }
          f += df;
          r += dr;
          }
      }
    } else if (piece.type === 'q') {
      // Queen: combine rook and bishop logic
      // Rook part
      for (let dir = -1; dir <= 1; dir += 2) {
        for (let i = fileIdx + dir; i >= 0 && i < 8; i += dir) {
          const dest = `${files[i]}${from[1]}`;
          const targetPiece = board.find(p => p.positions.includes(dest));
          if (!targetPiece) {
            moves.push(dest);
          } else {
            if (targetPiece.color !== piece.color) moves.push(dest);
            break;
          }
        }
        for (let i = rankIdx + dir; i >= 0 && i < 8; i += dir) {
          const dest = `${from[0]}${ranks[i]}`;
          const targetPiece = board.find(p => p.positions.includes(dest));
            if (!targetPiece) {
              moves.push(dest);
          } else {
            if (targetPiece.color !== piece.color) moves.push(dest);
            break;
          }
        }
      }
      // Bishop part
      const directions = [[1,1],[1,-1],[-1,1],[-1,-1]];
      for (const [df, dr] of directions) {
        let f = fileIdx + df;
        let r = rankIdx + dr;
        while (f >= 0 && f < 8 && r >= 0 && r < 8) {
          const dest = `${files[f]}${ranks[r]}`;
          const targetPiece = board.find(p => p.positions.includes(dest));
          if (!targetPiece) {
              moves.push(dest);
          } else {
            if (targetPiece.color !== piece.color) moves.push(dest);
            break;
            }
          f += df;
          r += dr;
          }
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
            const targetPiece = board.find(p => p.positions.includes(dest));
            if (!targetPiece || targetPiece.color !== piece.color) {
              moves.push(dest);
            }
          }
        }
      }
      // Castling
      if (!piece.hasMoved && from === (piece.color === 'w' ? 'e1' : 'e8')) {
        // Kingside
        const rookKingside = board.find(p => p.type === 'r' && p.color === piece.color && p.positions[0] === (piece.color === 'w' ? 'h1' : 'h8') && !p.hasMoved);
        if (rookKingside) {
          const between = piece.color === 'w' ? ['f1', 'g1'] : ['f8', 'g8'];
          const empty = between.every(sq => !board.some(p => p.positions.includes(sq)));
          const safe = ['e', 'f', 'g'].every(f => {
            const sq = f + (piece.color === 'w' ? '1' : '8');
            let newBoard = board
              .map(p =>
                p.id === piece.id ? { ...p, positions: [sq] } :
                p.id === rookKingside.id ? { ...p, positions: [piece.color === 'w' ? 'f1' : 'f8'] } : p
              );
            return !isKingInCheck(newBoard, piece.color);
          });
          if (empty && safe) moves.push(piece.color === 'w' ? 'g1' : 'g8');
        }
        // Queenside
        const rookQueenside = board.find(p => p.type === 'r' && p.color === piece.color && p.positions[0] === (piece.color === 'w' ? 'a1' : 'a8') && !p.hasMoved);
        if (rookQueenside) {
          const between = piece.color === 'w' ? ['b1', 'c1', 'd1'] : ['b8', 'c8', 'd8'];
          const empty = between.every(sq => !board.some(p => p.positions.includes(sq)));
          const safe = ['e', 'd', 'c'].every(f => {
            const sq = f + (piece.color === 'w' ? '1' : '8');
            let newBoard = board
              .map(p =>
                p.id === piece.id ? { ...p, positions: [sq] } :
                p.id === rookQueenside.id ? { ...p, positions: [piece.color === 'w' ? 'd1' : 'd8'] } : p
              );
            return !isKingInCheck(newBoard, piece.color);
          });
          if (empty && safe) moves.push(piece.color === 'w' ? 'c1' : 'c8');
        }
      }
    }
    
    // At the end, filter out moves that leave king in check (unless ignoreCheck is true)
    if (!ignoreCheck) {
      return moves.filter(dest => {
        // Simulate the move
        let newBoard = board
          .filter(p => !(p.positions.includes(dest) && p.color !== piece.color))
          .map(p =>
            p.id === piece.id ? { ...p, positions: [dest], hasMoved: true } : p
          );
        // Use the simulated board for check detection
        return !isKingInCheck(newBoard, piece.color);
      });
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
    if (quantumMode === 'teleport') {
      if (!teleportSelection) {
        // Select your piece
        const piece = pieces.find(p => p.positions.includes(square) && p.color === turn && p.positions.length === 1);
        if (piece) {
          setTeleportSelection({ pieceId: piece.id, from: square });
          setMessage('Select an empty square to teleport to.');
        } else {
          setMessage('Select one of your own pieces to teleport.');
        }
        return;
      } else {
        // Select destination
        if (pieces.some(p => p.positions.includes(square))) {
          setMessage('Destination must be an empty square.');
          return;
        }
        setPieces(prev => prev.map(p =>
          p.id === teleportSelection.pieceId
            ? { ...p, positions: [square], hasMoved: true }
            : p
        ));
        setTeleportUsed(prev => ({ ...prev, [turn]: true }));
        setQuantumMode(null);
        setTeleportSelection(null);
        setTurn(turn === 'w' ? 'b' : 'w');
        setMessage('Teleported!');
        addMoveToHistory({
          type: 'teleport',
          color: turn,
          piece: pieces.find(p => p.id === teleportSelection.pieceId)?.type,
          from: teleportSelection.from,
          to: square,
          timestamp: Date.now()
        });
        return;
      }
    }
    if (quantumMode === 'swap') {
      const piece = pieces.find(p => p.positions.includes(square) && p.color === turn && p.positions.length === 1);
      if (!piece) {
        setMessage('Select one of your own pieces to swap.');
        return;
      }
      if (swapSelection.length === 0) {
        setSwapSelection([piece.id]);
        setMessage('Select another of your own pieces to swap with.');
        return;
      } else if (swapSelection.length === 1) {
        if (piece.id === swapSelection[0]) {
          setMessage('Select a different piece.');
          return;
        }
        // Swap positions
        const id1 = swapSelection[0];
        const id2 = piece.id;
        const pos1 = pieces.find(p => p.id === id1).positions[0];
        const pos2 = pieces.find(p => p.id === id2).positions[0];
        setPieces(prev => prev.map(p =>
          p.id === id1 ? { ...p, positions: [pos2], hasMoved: true } :
          p.id === id2 ? { ...p, positions: [pos1], hasMoved: true } : p
        ));
        setSwapUsed(prev => ({ ...prev, [turn]: true }));
        setQuantumMode(null);
        setSwapSelection([]);
        setTurn(turn === 'w' ? 'b' : 'w');
        setMessage('Swapped!');
        addMoveToHistory({
          type: 'swap',
          color: turn,
          piece1: pieces.find(p => p.id === id1)?.type,
          piece2: pieces.find(p => p.id === id2)?.type,
          from: pos1,
          to: pos2,
          timestamp: Date.now()
        });
        return;
      }
    }
    if (quantumMode === 'clone') {
      if (!cloneSelection) {
        // Select your piece
        const piece = pieces.find(p => p.positions.includes(square) && p.color === turn && p.positions.length === 1);
        if (piece) {
          setCloneSelection({ type: piece.type, color: piece.color });
          setMessage('Select an empty square to place the clone.');
        } else {
          setMessage('Select one of your own pieces to clone.');
        }
        return;
      } else {
        // Select destination
        if (pieces.some(p => p.positions.includes(square))) {
          setMessage('Destination must be an empty square.');
          return;
        }
        setPieces(prev => [
          ...prev,
          {
            id: `${cloneSelection.color}_${cloneSelection.type}_clone_${Date.now()}`,
            type: cloneSelection.type,
            color: cloneSelection.color,
            positions: [square],
            entangledWith: [],
            hasMoved: true
          }
        ]);
        setCloneUsed(prev => ({ ...prev, [turn]: true }));
        setQuantumMode(null);
        setCloneSelection(null);
        setTurn(turn === 'w' ? 'b' : 'w');
        setMessage('Cloned!');
        addMoveToHistory({
          type: 'clone',
          color: turn,
          piece: cloneSelection.type,
          to: square,
          timestamp: Date.now()
        });
        return;
      }
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
        setPieces(prev => {
          let newPieces = prev
            // Remove captured piece(s)
            .filter(p => !(p.positions.includes(square) && p.color !== turn));
          // Castling logic
          const moved = newPieces.find(p => p.positions.includes(selected) && p.color === turn && p.positions.length === 1);
          if (moved && moved.type === 'k') {
            // Kingside
            if ((moved.color === 'w' && selected === 'e1' && square === 'g1') || (moved.color === 'b' && selected === 'e8' && square === 'g8')) {
              // Move king
              newPieces = newPieces.map(p =>
                p.id === moved.id ? { ...p, positions: [square], hasMoved: true } :
                p.type === 'r' && p.color === moved.color && p.positions[0] === (moved.color === 'w' ? 'h1' : 'h8')
                  ? { ...p, positions: [moved.color === 'w' ? 'f1' : 'f8'], hasMoved: true }
                  : p
              );
              return newPieces;
            }
            // Queenside
            if ((moved.color === 'w' && selected === 'e1' && square === 'c1') || (moved.color === 'b' && selected === 'e8' && square === 'c8')) {
              newPieces = newPieces.map(p =>
                p.id === moved.id ? { ...p, positions: [square], hasMoved: true } :
                p.type === 'r' && p.color === moved.color && p.positions[0] === (moved.color === 'w' ? 'a1' : 'a8')
                  ? { ...p, positions: [moved.color === 'w' ? 'd1' : 'd8'], hasMoved: true }
                  : p
              );
              return newPieces;
            }
          }
          // Pawn promotion
          return newPieces.map(p => {
            if (p.positions.includes(selected) && p.color === turn && p.positions.length === 1) {
              if (p.type === 'p' && ((p.color === 'w' && square[1] === '8') || (p.color === 'b' && square[1] === '1'))) {
                setPendingPromotion({
                  pawnId: p.id,
                  to: square,
                  color: p.color
                });
                return p;
              }
              return { ...p, positions: [square], hasMoved: true };
            }
            return p;
          });
        });
        
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
        // In handleSquareClick, when a pawn moves two squares, set enPassantTarget
        if (movedPiece && movedPiece.type === 'p' && Math.abs(selected[1] - square[1]) === 2) {
          setEnPassantTarget(square);
      } else {
          setEnPassantTarget(null);
        }
      } else {
        setMessage('Invalid move. (King would be in check or move is not allowed)');
        console.log('[ERROR] Invalid move to', square);
      }
      setSelected(null);
      setPossibleMoves([]);
    }
    // In handleSquareClick, before normal move logic, check for en passant
    if (movedPiece && movedPiece.type === 'p' && enPassantTarget && square === enPassantTarget && selected[0] !== square[0]) {
      setPieces(prev => prev
        .filter(p => !(p.positions.includes(`${square[0]}${selected[1]}`) && p.type === 'p' && p.color !== movedPiece.color))
        .map(p =>
          p.positions.includes(selected) && p.color === turn && p.positions.length === 1
            ? { ...p, positions: [square], hasMoved: true }
            : p
        )
      );
      setEnPassantTarget(null);
      // Add move to history, switch turn, etc.
      addMoveToHistory({
        type: 'enpassant',
        color: turn,
        piece: movedPiece.type,
        from: selected,
        to: square,
        timestamp: Date.now()
      });
      setTurn(turn === 'w' ? 'b' : 'w');
      setMessage('En passant capture!');
      setSelected(null);
      setPossibleMoves([]);
      return;
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
        setMessage('Select a superposed piece for entanglement.');
        console.log('[ERROR] No superposed piece selected for entanglement at', square);
      }
    } else {
      const otherPiece = pieces.find(p => p.id === entangleCandidate);
      if (otherPiece && otherPiece.positions.length > 1) {
        // Create entangled piece
        setPieces(prev => prev.map(p =>
          p.id === entangleCandidate || p.id === piece.id
            ? { ...p, entangledWith: [...p.entangledWith, otherPiece.id] }
            : p
        ));
        
        // Add move to history
        addMoveToHistory({
          type: 'entanglement',
          color: turn,
          piece1: piece.type,
          piece2: otherPiece.type,
          timestamp: Date.now()
        });
        
        setEntangleCandidate(null);
        setTurn(turn === 'w' ? 'b' : 'w');
        setMessage('Entanglement created.');
        console.log(`[Q-ENTANGLE] Entangled ${piece.type} and ${otherPiece.type}`);
        logBoardState('After Entanglement');
      } else {
        setMessage('Choose a different superposed piece for entanglement.');
        console.log('[ERROR] Invalid superposed piece selected for entanglement.');
      }
    }
  }

  // --- Quantum Measurement ---
  function handleMeasure() {
    setMessage('');
    const piece = pieces.find(p => p.positions.includes(selected) && p.color === turn && p.positions.length > 1);
    if (!piece) {
      setMessage('Select a superpositioned piece to measure.');
      console.log('[ERROR] No superpositioned piece selected for measurement.');
      return;
    }

    const collapsedSquare = piece.positions[Math.floor(Math.random() * piece.positions.length)];
    
    // Update piece's positions to the collapsed one
    setPieces(prev => prev.map(p =>
      p.id === piece.id
        ? { ...p, positions: [collapsedSquare] }
        : p
    ));
    
    // Add move to history
    addMoveToHistory({
      type: 'measurement',
      color: turn,
      piece: piece.type,
      from: selected,
      collapsedTo: collapsedSquare,
      timestamp: Date.now()
    });
    
    setTurn(turn === 'w' ? 'b' : 'w');
    setMessage('Piece measured.');
    console.log(`[Q-MEASURE] Measured ${piece.type} from ${selected} to ${collapsedSquare}`);
    logBoardState('After Measurement');
  }

  // --- Game Reset ---
  function resetGame() {
    setPieces(initialBoard());
    setTurn('w');
    setSelected(null);
    setPossibleMoves([]);
    setQuantumMode(null);
    setQuantumStep(null);
    setQuantumSelection(null);
    setEntangleCandidate(null);
    setMoveHistory([]);
    setCurrentMoveIndex(-1);
    setMessage('Game reset.');
    setEnPassantTarget(null);
    setPendingPromotion(null);
    localStorage.removeItem('guestGameState');
    console.log('[RESET] Game reset.');
  }

  // --- User Authentication Handlers ---
  const handleLogin = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5050/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(data.data.user);
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        setIsAuthModalOpen(false);
        setShowHero(false);
        setShowLobby(true); // Take user to lobby after login
        setIsGuestMode(false);
        setMessage('Login successful!');
        loadUserStats();
        loadGameHistory();
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (error) {
      setMessage('Error during login');
    }
  };

  const handleSignup = async (email, password, name) => {
    try {
      const response = await fetch('http://localhost:5050/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(data.data.user);
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        setIsAuthModalOpen(false);
        setShowHero(false);
        setShowLobby(true); // Take user to lobby after signup
        setIsGuestMode(false);
        setMessage('Signup successful!');
        loadUserStats();
        loadGameHistory();
      } else {
        setMessage(data.message || 'Signup failed');
      }
    } catch (error) {
      setMessage('Error during signup');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUserStats(null);
    setGameHistory([]);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setMessage('Logged out.');
  };

  const handleShowAuth = () => {
    setIsAuthModalOpen(true);
  };

  const handleShowPlayOptions = () => {
    setIsPlayOptionsModalOpen(true);
  };

  const handleDirectGuestPlay = () => {
    setIsGuestMode(true);
    setShowHero(false);
    setShowLobby(true); // Guest users also go to lobby
  };

  const handleLoginAndPlay = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const handleCreateAccount = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleGuestPlay = () => {
    setIsGuestMode(true);
    setIsPlayOptionsModalOpen(false);
    setShowHero(false);
    setShowLobby(true); // Guest users go to lobby
  };

  const handlePlayOptionsLogin = () => {
    setIsPlayOptionsModalOpen(false);
    setIsAuthModalOpen(true);
  };

  // Lobby handlers
  const handleCreateGame = () => {
    setIsCreatingGame(true);
    const username = user ? user.name : 'Guest_' + Math.random().toString(36).substr(2, 9);
    socket.emit('createGame', { username });
  };

  const handleJoinGame = (gameId) => {
    setIsJoiningGame(true);
    const username = user ? user.name : 'Guest_' + Math.random().toString(36).substr(2, 9);
    socket.emit('joinGame', { gameId, username });
  };

  const handleQuickMatch = () => {
    setIsMatchmaking(true);
    const username = user ? user.name : 'Guest_' + Math.random().toString(36).substr(2, 9);
    socket.emit('findMatch', { username });
  };

  const handleBackToLobby = () => {
    setShowGame(false);
    setShowLobby(true);
    resetGame();
  };

  const handlePlayWithComputer = () => {
    setPlayWithAI(true);
    setShowLobby(false);
    setShowGame(true);
    resetGame();
  };

  const handleSoloPlay = () => {
    setPlayWithAI(false);
    setShowLobby(false);
    setShowGame(true);
    resetGame();
  };

  // --- API Functions ---
  const loadUserStats = async () => {
    if (!user) return;
    
    setIsLoadingStats(true);
    try {
      const response = await fetch('http://localhost:5050/api/games/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setUserStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadGameHistory = async (page = 1, append = false) => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`http://localhost:5050/api/games/history?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        if (append) {
          setGameHistory(prev => [...prev, ...data.data.games]);
        } else {
          setGameHistory(data.data.games);
        }
        setHasMoreGames(data.data.pagination.hasNext);
        setGameHistoryPage(page);
      }
    } catch (error) {
      console.error('Error loading game history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleGameClick = (game) => {
    // Navigate to game details or replay
    console.log('Game clicked:', game);
  };

  const handleLoadMoreGames = () => {
    loadGameHistory(gameHistoryPage + 1, true);
  };

  const handleRefreshStats = () => {
    loadUserStats();
  };

  // Check for existing user session on app start
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Try to validate the token and get user info
      fetch('http://localhost:5050/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setUser(data.data.user);
          setShowHero(false);
          setShowLobby(true); // Go directly to lobby if user is logged in
          setIsGuestMode(false);
        }
      })
      .catch(() => {
        // Token is invalid, clear it
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      });
    }
  }, []);

  // Load data when user logs in
  useEffect(() => {
    if (user) {
      loadUserStats();
      loadGameHistory();
    }
  }, [user]);

  // Socket connection for multiplayer
  useEffect(() => {
    if (showLobby) {
      const newSocket = io('http://localhost:3001');
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
        if (user) {
          newSocket.emit('login', { username: user.name });
        } else {
          newSocket.emit('login', { username: 'Guest_' + Math.random().toString(36).substr(2, 9) });
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      // Game events
      newSocket.on('gameCreated', (data) => {
        console.log('Game created:', data);
        setGameId(data.gameId);
        setPlayerColor(data.playerColor);
        setShowLobby(false);
        setShowGame(true);
      });

      newSocket.on('gameJoined', (data) => {
        console.log('Game joined:', data);
        setGameId(data.gameId);
        setPlayerColor(data.playerColor);
        setOpponent(data.opponent);
        setShowLobby(false);
        setShowGame(true);
      });

      newSocket.on('gameStarted', (data) => {
        console.log('Game started:', data);
        setGameStarted(true);
        setIsMyTurn(data.startingPlayer === playerColor);
      });

      newSocket.on('moveMade', (data) => {
        console.log('Move received:', data);
        setPieces(data.board);
        setTurn(data.currentPlayer);
        setIsMyTurn(data.currentPlayer === playerColor);
        setMoveHistory(data.moveHistory);
      });

      newSocket.on('opponentLeft', () => {
        alert('Your opponent has left the game');
        setShowGame(false);
        setShowLobby(true);
        resetGame();
      });

      // Lobby events
      newSocket.on('availableGames', (games) => {
        setAvailableGames(games);
      });

      newSocket.on('myGames', (games) => {
        setMyGames(games);
      });

      return () => {
        newSocket.close();
      };
    }
  }, [user, showLobby, playerColor]);

  // Request lobby data when connected
  useEffect(() => {
    if (socket && isConnected && showLobby) {
      socket.emit('getAvailableGames');
      socket.emit('getMyGames');
    }
  }, [socket, isConnected, showLobby]);

  // --- Utility: Check if king is in check ---
  function isKingInCheck(pieces, color) {
    // Find the king's position
    const king = pieces.find(p => p.type === 'k' && p.color === color);
    if (!king) return false;
    const kingSquare = king.positions[0];
    // For each enemy piece, see if it can move to the king's square
    for (const p of pieces) {
      if (p.color !== color) {
        const moves = getLegalMoves(p, p.positions[0], pieces, true); // true = ignore king check for enemy
        if (moves.includes(kingSquare)) {
          return true;
        }
      }
    }
    return false;
  }

  // Add a helper to get the checked king's square
  const checkedKingSquare = isKingInCheck(pieces, turn) ? pieces.find(p => p.type === 'k' && p.color === turn)?.positions[0] : null;

  // Add a PromotionModal component
  function PromotionModal({ isOpen, onSelect }) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 flex flex-col items-center">
          <div className="text-lg font-bold mb-4">Choose promotion</div>
          <div className="flex gap-4">
            {['q','r','b','n'].map(type => (
              <button
                key={type}
                onClick={() => onSelect(type)}
                className="w-16 h-16 bg-cyan-200 rounded-full flex items-center justify-center text-2xl font-bold hover:bg-cyan-400"
              >
                {type === 'q' ? '♛' : type === 'r' ? '♜' : type === 'b' ? '♝' : '♞'}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // On app load, restore game state from localStorage if present
  useEffect(() => {
    const saved = localStorage.getItem('guestGameState');
    if (saved) {
      const state = JSON.parse(saved);
      setPieces(state.pieces);
      setTurn(state.turn);
      setMoveHistory(state.moveHistory);
      setIsGuestMode(state.isGuestMode);
      setEnPassantTarget(state.enPassantTarget);
      setPendingPromotion(state.pendingPromotion);
    }
  }, []);
  // After every move, save game state to localStorage
  useEffect(() => {
    if (isGuestMode) {
      localStorage.setItem('guestGameState', JSON.stringify({
        pieces,
        turn,
        moveHistory,
        isGuestMode,
        enPassantTarget,
        pendingPromotion
      }));
    }
  }, [pieces, turn, moveHistory, isGuestMode, enPassantTarget, pendingPromotion]);

  // Move formatDuration to App scope
  function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Quantum Decay: after each move, superposed pieces have a 25% chance to collapse
  useEffect(() => {
    if (!isGuestMode) return; // Only for local/guest for now
    setPieces(prev => prev.map(p => {
      if (p.positions.length > 1 && Math.random() < 0.25) {
        // Collapse to a random position
        const collapsed = p.positions[Math.floor(Math.random() * p.positions.length)];
        setMessage(`Quantum decay! ${p.type.toUpperCase()} collapsed to ${collapsed}`);
        return { ...p, positions: [collapsed] };
      }
      return p;
    }));
  }, [turn]);

  // AI move effect: when it's black's turn and playWithAI is true, make a random legal move for black
  useEffect(() => {
    if (playWithAI && turn === 'b' && !showHero && !pendingPromotion) {
      // Find all black pieces with legal moves
      const movable = pieces.filter(p => p.color === 'b' && getLegalMoves(p, p.positions[0]).length > 0);
      if (movable.length === 0) return;
      const piece = movable[Math.floor(Math.random() * movable.length)];
      const moves = getLegalMoves(piece, piece.positions[0]);
      const move = moves[Math.floor(Math.random() * moves.length)];
      setTimeout(() => {
        handleSquareClick(piece.positions[0]);
        setTimeout(() => handleSquareClick(move), 300);
      }, 500);
    }
    // eslint-disable-next-line
  }, [turn, playWithAI, showHero, pendingPromotion]);

  // Add checkmate and stalemate detection after every move
  useEffect(() => {
    if (pendingPromotion) return; // Don't check until promotion is resolved
    // Find all pieces for the current player
    const playerPieces = pieces.filter(p => p.color === turn);
    let hasLegalMove = false;
    for (const p of playerPieces) {
      const moves = getLegalMoves(p, p.positions[0]);
      if (moves.length > 0) {
        hasLegalMove = true;
        break;
      }
    }
    if (!hasLegalMove) {
      if (isKingInCheck(pieces, turn)) {
        setGameOver(true);
        setGameOverMessage(`${turn === 'w' ? 'White' : 'Black'} is checkmated! Game over.`);
      } else {
        setGameOver(true);
        setGameOverMessage('Stalemate! Game over.');
      }
    } else {
      setGameOver(false);
      setGameOverMessage('');
    }
  }, [pieces, turn, pendingPromotion]);

  if (showHero) {
    return (
      <>
        <HeroSection 
          onDirectGuestPlay={handleDirectGuestPlay}
          onLoginAndPlay={handleLoginAndPlay}
          onCreateAccount={handleCreateAccount}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={handleLogin}
          onSignup={handleSignup}
          initialMode={authModalMode}
        />
      </>
    );
  }

  if (showLobby) {
    return (
      <>
        <div className="min-h-screen bg-cyan-900 from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
          <AnimatedHero />
          <div className="relative z-10 max-w-7xl w-full">
            <div className="text-center mb-8">
            <div className="flex justify-center mb-2">
                <img 
                  src={logo} 
                  alt="Quantum Chess" 
                  className="h-34 md:h-64 w-auto drop-shadow-[0_0_15px_rgba(0,255,255,0.4)]"
                />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
                Lobby
              </h1>
              <p className="text-gray-300 text-lg">Choose your game mode and start playing</p>
            </div>
            
            {/* Header with user info */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-white">
                  {user ? user.name : 'Guest Player'}
                </span>
                {user && (
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>

            {/* Connection Status */}
            {!isConnected && (
              <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
                Connecting to server...
              </div>
            )}

            <div className="flex flex-row items-start justify-center gap-8">
              {/* Left Side - User Details and Profile */}
              <div className="flex flex-col gap-6">
                {/* User Profile Section */}
                {user ? (
                  <ProfileSection 
                    user={user} 
                    onLogout={handleLogout} 
                    stats={userStats}
                    onRefreshStats={handleRefreshStats}
                    onShowStats={() => setShowStatsModal(true)}
                  />
                ) : (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 w-80">
                    <h3 className="text-2xl font-bold text-white mb-4">Guest Mode</h3>
                    <div className="mb-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                          🎮
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-semibold">Guest Player</div>
                          <div className="text-gray-400 text-sm">Playing without account</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <button
                        onClick={() => {
                          setAuthModalMode('signup');
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-all duration-300"
                      >
                        🔐 Create Account
                      </button>
                      
                      <button
                        onClick={() => {
                          setAuthModalMode('login');
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300"
                      >
                        🔑 Login
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowLobby(false);
                          setShowHero(true);
                        }}
                        className="w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-300"
                      >
                        🚪 Back to Hero
                      </button>
                    </div>
                  </div>
                )}

                {/* Connection Status */}
                {!isConnected && (
                  <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                      <span>Connecting to server...</span>
                    </div>
                  </div>
                )}

                {/* Left Side Ad */}
                <AdSpace position="left" size="medium" />
              </div>

              {/* Center - Lobby Table */}
              <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 w-96">
                <h2 className="text-2xl font-bold text-white mb-6">Available Games</h2>
                
                {/* Action Buttons */}
                <div className="space-y-4 mb-6">
                  <button
                    onClick={handleCreateGame}
                    disabled={isCreatingGame || !isConnected}
                    className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50"
                  >
                    {isCreatingGame ? 'Creating Game...' : 'Create New Game'}
                  </button>
                  
                  <button
                    onClick={handleQuickMatch}
                    disabled={isMatchmaking || !isConnected}
                    className="w-full p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50"
                  >
                    {isMatchmaking ? 'Finding Match...' : 'Quick Match'}
                  </button>
                </div>

                {/* Games Table */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {availableGames.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <div className="text-4xl mb-2">🎮</div>
                      <div>No games available</div>
                      <div className="text-sm mt-1">Create a game or wait for others to join</div>
                    </div>
                  ) : (
                    availableGames.map((game) => (
                      <div key={game.id} className="bg-white/5 rounded-lg p-4 flex justify-between items-center border border-white/10 hover:border-white/20 transition-all duration-200">
                        <div>
                          <p className="text-white font-semibold">Game #{game.id}</p>
                          <p className="text-gray-300 text-sm">Created by {game.creator}</p>
                        </div>
                        <button
                          onClick={() => handleJoinGame(game.id)}
                          disabled={isJoiningGame}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                          {isJoiningGame ? 'Joining...' : 'Join'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Side - Play Options and My Games */}
              <div className="flex flex-col gap-6">
                {/* Play Options */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 w-80">
                  <h3 className="text-2xl font-bold text-white mb-4">Play Options</h3>
                  
                  <div className="space-y-4">
                    <button
                      onClick={handleCreateGame}
                      disabled={isCreatingGame || !isConnected}
                      className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50"
                    >
                      👥 Play with Friends
                    </button>
                    
                    <button
                      onClick={handlePlayWithComputer}
                      className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                    >
                      🤖 Play with Computer
                    </button>
                    
                    <button
                      onClick={handleSoloPlay}
                      className="w-full p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
                    >
                      🎮 Solo Play
                    </button>
                    
                    <button
                      onClick={handleQuickMatch}
                      disabled={isMatchmaking || !isConnected}
                      className="w-full p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50"
                    >
                      ⚡ Quick Match
                    </button>
                  </div>
                </div>

                {/* My Games - Only show for logged in users */}
                {user && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 w-80">
                    <h3 className="text-xl font-bold text-white mb-4">My Games</h3>
                    {myGames.length === 0 ? (
                      <div className="text-center text-gray-400 py-4">
                        <div className="text-2xl mb-2">📜</div>
                        <div className="text-sm">No games created</div>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-32 overflow-y-auto">
                        {myGames.map((game) => (
                          <div key={game.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <p className="text-white font-semibold text-sm">Game #{game.id}</p>
                            <p className="text-gray-300 text-xs">
                              Status: {game.status === 'waiting' ? 'Waiting for opponent' : 'In progress'}
                            </p>
                            {game.status === 'waiting' && (
                              <button
                                onClick={() => handleJoinGame(game.id)}
                                className="mt-2 px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                              >
                                Join
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Right Side Ad */}
                <AdSpace position="right" size="medium" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Auth Modal for Lobby */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={handleLogin}
          onSignup={handleSignup}
          initialMode={authModalMode}
        />
      </>
    );
  }

  // --- Game UI ---
  if (showGame) {
  return (
    <div className="min-h-screen bg-cyan-900 from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
      <AnimatedHero />
      <div className="relative z-10 max-w-7xl w-full">
        <div className="text-center mb-8">
        <div className="flex justify-center mb-2">
          <img 
            src={logo} 
            alt="Quantum Chess" 
            className="h-24 md:h-32 w-auto drop-shadow-[0_0_15px_rgba(0,255,255,0.4)]"
          />
        </div>
          <p className="text-gray-300 text-lg">Experience chess through quantum mechanics</p>
        </div>
        
        {/* Top Ad Banner */}
        <div className="mb-6">
          <AdBanner type="horizontal" />
        </div>
        
        <div className="flex flex-row items-start justify-center gap-8">
          {/* Left Side - Controls, Profile, Stats, and Ad */}
          <div className="flex flex-col gap-6">
            {/* Quantum Controls */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 w-80">
              <h3 className="text-2xl font-bold text-white mb-4">Quantum Controls</h3>
              <button
                onClick={() => setQuantumMode(quantumMode === 'superposition' ? null : 'superposition')}
                className={`w-full py-3 px-4 rounded-xl font-semibold mb-3 transition-all duration-300 ${
                  quantumMode === 'superposition' 
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                ⚛️ Superposition
              </button>
              <button
                onClick={() => setQuantumMode(quantumMode === 'entanglement' ? null : 'entanglement')}
                className={`w-full py-3 px-4 rounded-xl font-semibold mb-3 transition-all duration-300 ${
                  quantumMode === 'entanglement' 
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/50' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                🔗 Entanglement
              </button>
              <button
                onClick={() => setQuantumMode(quantumMode === 'teleport' ? null : 'teleport')}
                disabled={teleportUsed[turn]}
                className={`w-full py-3 px-4 rounded-xl font-semibold mb-3 transition-all duration-300 ${
                  quantumMode === 'teleport'
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                    : 'bg-white/20 text-white hover:bg-white/30'
                } ${teleportUsed[turn] ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                🌀 Teleport
              </button>
              <button
                onClick={() => setQuantumMode(quantumMode === 'swap' ? null : 'swap')}
                disabled={swapUsed[turn]}
                className={`w-full py-3 px-4 rounded-xl font-semibold mb-3 transition-all duration-300 ${
                  quantumMode === 'swap'
                    ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/50'
                    : 'bg-white/20 text-white hover:bg-white/30'
                } ${swapUsed[turn] ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                🔄 Swap
              </button>
              <button
                onClick={() => setQuantumMode(quantumMode === 'clone' ? null : 'clone')}
                disabled={cloneUsed[turn]}
                className={`w-full py-3 px-4 rounded-xl font-semibold mb-3 transition-all duration-300 ${
                  quantumMode === 'clone'
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-white/20 text-white hover:bg-white/30'
                } ${cloneUsed[turn] ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                🧬 Clone
              </button>
              <button
                onClick={handleMeasure}
                className="w-full py-3 px-4 rounded-xl font-semibold bg-yellow-500 text-white mb-3 hover:bg-yellow-400 transition-all duration-300 shadow-lg shadow-yellow-500/50"
              >
                📏 Measure
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
            
            {/* Profile Section */}
            {user && (
              <ProfileSection 
                user={user} 
                onLogout={handleLogout} 
                stats={userStats} 
                onRefreshStats={handleRefreshStats}
                onShowStats={() => setShowStatsModal(true)}
              />
            )}
            
            {/* Guest Mode Indicator */}
            {isGuestMode && !user && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 w-80">
                <h3 className="text-2xl font-bold text-white mb-4">Guest Mode</h3>
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      🎮
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold">Guest Player</div>
                      <div className="text-gray-400 text-sm">Playing without account</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setAuthModalMode('signup');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-all duration-300"
                  >
                    🔐 Create Account
                  </button>
                  
                  <button
                    onClick={() => {
                      setAuthModalMode('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300"
                  >
                    🔑 Login
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsGuestMode(false);
                      setShowHero(true);
                    }}
                    className="w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-300"
                  >
                    🚪 Back to Hero
                  </button>
                </div>
              </div>
            )}
            

            
            {/* Game Invite */}
            {user && !isGuestMode && (
              <GameInvite />
            )}
            
            {/* Left Side Ad */}
            <AdSpace position="left" size="medium" />
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
              checkedKingSquare={checkedKingSquare}
            />
          </div>
          
          {/* Right Side - Move History, Game History, and Ad */}
          <div className="flex flex-col gap-6">
            {/* Move History */}
            <MoveHistory 
              moves={moveHistory}
              currentMoveIndex={currentMoveIndex}
              onMoveClick={handleMoveHistoryClick}
            />
            
            {/* Game History */}
            {(user || isGuestMode) && (
              <GameHistory 
                games={gameHistory}
                onGameClick={handleGameClick}
                onLoadMore={handleLoadMoreGames}
                hasMore={hasMoreGames}
                user={user}
              />
            )}
            
            {/* Right Side Ad */}
            <AdSpace position="right" size="medium" />
          </div>
        </div>
        
        {/* Bottom Ad Banner */}
        <div className="mt-6">
          <AdBanner type="horizontal" />
        </div>
        
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>Click a piece to select, then a destination. Use quantum controls for superposition and entanglement.</p>
          <button 
            onClick={() => {
              if (user) {
                setShowLobby(true);
                setShowGame(false);
              } else {
                setShowHero(true);
                setIsGuestMode(false);
              }
            }}
            className="mt-4 px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
          >
            {user ? '← Back to Lobby' : '← Back to Hero'}
          </button>
        </div>
      </div>
      

      
      {/* Auth Modal for Game View */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onSignup={handleSignup}
        initialMode={authModalMode}
      />
      
      {/* Play Options Modal */}
      <PlayOptionsModal
        isOpen={isPlayOptionsModalOpen}
        onClose={() => setIsPlayOptionsModalOpen(false)}
        onLogin={handlePlayOptionsLogin}
        onGuestPlay={handleGuestPlay}
      />
      <PromotionModal
        isOpen={!!pendingPromotion}
        onSelect={type => {
          setPieces(prev => prev.map(p =>
            p.id === pendingPromotion.pawnId
              ? { ...p, type, positions: [pendingPromotion.to], hasMoved: true }
              : p
          ));
          setPendingPromotion(null);
          setTurn(pendingPromotion.color === 'w' ? 'b' : 'w');
          setMessage('Pawn promoted!');
        }}
      />
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-96 border border-white/20 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Game Statistics</h3>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            {userStats ? (
              <div className="space-y-4">
                {/* Win Rate */}
                <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg p-4 border border-green-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 font-semibold">Win Rate</span>
                    <span className="text-2xl font-bold text-green-400">{userStats.winRate}%</span>
                  </div>
                  <div className="text-xs text-green-300 mt-1">
                    {userStats.gamesWon}W / {userStats.gamesLost}L
                  </div>
                </div>
                {/* Games Played */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-500/30">
                    <div className="text-blue-400 text-sm">Total Games</div>
                    <div className="text-xl font-bold text-blue-400">{userStats.totalGames}</div>
                  </div>
                  <div className="bg-purple-500/20 rounded-lg p-3 border border-purple-500/30">
                    <div className="text-purple-400 text-sm">Recent (7d)</div>
                    <div className="text-xl font-bold text-purple-400">{userStats.recentGames}</div>
                  </div>
                </div>
                {/* Moves */}
                <div className="bg-cyan-500/20 rounded-lg p-4 border border-cyan-500/30">
                  <div className="text-cyan-400 font-semibold mb-2">Moves Used</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Classical:</span>
                      <span className="text-cyan-400 font-mono">{userStats.classicalMoves}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Quantum:</span>
                      <span className="text-cyan-400 font-mono">{userStats.quantumMoves}</span>
                    </div>
                  </div>
                </div>
                {/* Quantum Moves Breakdown */}
                <div className="bg-pink-500/20 rounded-lg p-4 border border-pink-500/30">
                  <div className="text-pink-400 font-semibold mb-2">Quantum Moves</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-pink-400 font-bold">{userStats.superpositions}</div>
                      <div className="text-gray-400">⚛️ Super</div>
                    </div>
                    <div className="text-center">
                      <div className="text-pink-400 font-bold">{userStats.entanglements}</div>
                      <div className="text-gray-400">🔗 Entangle</div>
                    </div>
                    <div className="text-center">
                      <div className="text-pink-400 font-bold">{userStats.measurements}</div>
                      <div className="text-gray-400">📊 Measure</div>
                    </div>
                  </div>
                </div>
                {/* Average Game Duration */}
                <div className="bg-yellow-500/20 rounded-lg p-3 border border-yellow-500/30">
                  <div className="text-yellow-400 text-sm">Avg Duration</div>
                  <div className="text-lg font-bold text-yellow-400">
                    {formatDuration(userStats.averageGameDuration)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-2">📊</div>
                <div>No games played yet</div>
                <div className="text-sm mt-1">Start playing to see your stats!</div>
              </div>
            )}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowStatsModal(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-white/20 rounded-2xl p-8 border border-white/30 shadow-2xl flex flex-col items-center">
            <h2 className="text-3xl font-bold text-red-500 mb-4">{gameOverMessage}</h2>
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-all duration-300 text-lg mt-4"
            >
              🔄 Reset Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
  }

  return null;
}