import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Gamepad2,
  Trophy,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  X,
  Sparkles,
  Flame,
  Zap
} from 'lucide-react';

// Web Audio API Synthesizer for Retro 8-bit Sound Effects
class SnakeAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    try {
      this.muted = localStorage.getItem('bkash_snake_muted') === 'true';
    } catch {
      this.muted = false;
    }
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    try {
      localStorage.setItem('bkash_snake_muted', String(this.muted));
    } catch {}
    return this.muted;
  }

  playEat() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.09); // A5

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {}
  }

  playTurn() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch {}
  }

  playDie() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const now = this.ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.28);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  playHighScore() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const start = now + i * 0.08;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);

        osc.start(start);
        osc.stop(start + 0.16);
      });
    } catch {}
  }
}

const audio = new SnakeAudio();

// Available Skins
const SKINS = {
  ruby: {
    id: 'ruby',
    name: 'bKash Ruby',
    head: '#FF2E88',
    bodyStart: '#FF2E88',
    bodyEnd: '#E2136E',
    food: '#FBBF24',
    glow: '#FF2E88',
    badge: 'bg-[#E2136E]/20 text-[#E2136E] border-[#E2136E]/40'
  },
  emerald: {
    id: 'emerald',
    name: 'Matrix Neon',
    head: '#10B981',
    bodyStart: '#34D399',
    bodyEnd: '#059669',
    food: '#F43F5E',
    glow: '#10B981',
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
  },
  cyan: {
    id: 'cyan',
    name: 'Cyber Cyan',
    head: '#38BDF8',
    bodyStart: '#38BDF8',
    bodyEnd: '#0284C7',
    food: '#F59E0B',
    glow: '#38BDF8',
    badge: 'bg-sky-500/20 text-sky-400 border-sky-500/40'
  },
  solar: {
    id: 'solar',
    name: 'Solar Flare',
    head: '#F59E0B',
    bodyStart: '#FBBF24',
    bodyEnd: '#D97706',
    food: '#E2136E',
    glow: '#F59E0B',
    badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40'
  }
};

const SPEEDS = {
  casual: { id: 'casual', label: 'Casual', ms: 140 },
  normal: { id: 'normal', label: 'Normal', ms: 100 },
  turbo: { id: 'turbo', label: 'Turbo', ms: 65 }
};

export default function SnakeGame({ collapsed = false }) {
  // Persistence: High Score & Settings
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('bkash_snake_high_score') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [isMuted, setIsMuted] = useState(() => audio.muted);
  const [selectedSkin, setSelectedSkin] = useState('ruby');
  const [speedLevel, setSpeedLevel] = useState('normal');

  // Sidebar widget states
  const [isWidgetFolded, setIsWidgetFolded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Stats
  const [gamesPlayed, setGamesPlayed] = useState(() => {
    try {
      return parseInt(localStorage.getItem('bkash_snake_games_played') || '0', 10);
    } catch {
      return 0;
    }
  });

  // Toggle audio
  const handleToggleAudio = (e) => {
    e?.stopPropagation();
    const muted = audio.toggleMute();
    setIsMuted(muted);
  };

  // Sync high score
  const updateHighScore = useCallback((newScore) => {
    setHighScore((prev) => {
      if (newScore > prev) {
        try {
          localStorage.setItem('bkash_snake_high_score', String(newScore));
        } catch {}
        audio.playHighScore();
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
        return newScore;
      }
      return prev;
    });
  }, []);

  const incrementGamesPlayed = useCallback(() => {
    setGamesPlayed((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem('bkash_snake_games_played', String(next));
      } catch {}
      return next;
    });
  }, []);

  // 1. COLLAPSED SIDEBAR: compact icon button
  if (collapsed) {
    return (
      <div className="flex justify-center py-1">
        <button
          onClick={() => setIsModalOpen(true)}
          className="relative p-2.5 rounded-xl bg-slate-100/90 dark:bg-white/[0.05] hover:bg-[#E2136E]/15 dark:hover:bg-[#E2136E]/20 text-[#E2136E] dark:text-pink-400 border border-slate-200 dark:border-white/[0.08] hover:border-[#E2136E]/40 transition-all duration-200 cursor-pointer group shadow-sm"
          title={`Break Room: Snake Arcade (High Score: ${highScore})`}
        >
          <Gamepad2 className="w-5 h-5 group-hover:scale-110 transition-transform text-[#E2136E] dark:text-[#FF2E88]" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E2136E] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF2E88]" />
          </span>
        </button>

        {isModalOpen && (
          <SnakeArcadeModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            highScore={highScore}
            onUpdateHighScore={updateHighScore}
            isMuted={isMuted}
            onToggleAudio={handleToggleAudio}
            selectedSkin={selectedSkin}
            onSelectSkin={setSelectedSkin}
            speedLevel={speedLevel}
            onSelectSpeed={setSpeedLevel}
            gamesPlayed={gamesPlayed}
            onIncrementGamesPlayed={incrementGamesPlayed}
          />
        )}
      </div>
    );
  }

  // 2. EXPANDED SIDEBAR: Interactive Mini Arcade Widget
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-100/70 dark:bg-white/[0.03] backdrop-blur-md p-2.5 relative overflow-hidden transition-all duration-300 shadow-sm">
      {/* Top Gradient Highlight */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#E2136E] via-[#FF2E88] to-purple-500" />

      {/* Header Row */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-white/[0.06]">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-lg bg-[#E2136E]/15 text-[#E2136E] dark:text-pink-400">
            <Gamepad2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-black tracking-tight text-slate-800 dark:text-white uppercase">
                Break Room
              </span>
              <span className="text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase bg-[#E2136E]/15 text-[#E2136E] dark:text-pink-300 border border-[#E2136E]/20">
                ARCADE
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleToggleAudio}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/[0.08] transition cursor-pointer"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#E2136E]" />}
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/[0.08] transition cursor-pointer"
            title="Expand to Fullscreen Arcade Modal"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsWidgetFolded(!isWidgetFolded)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/[0.08] transition cursor-pointer"
            title={isWidgetFolded ? 'Expand Game' : 'Minimize Game'}
          >
            {isWidgetFolded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Mini Bar when folded */}
      {isWidgetFolded ? (
        <div className="flex items-center justify-between text-xs py-1">
          <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
            <Trophy className="w-3 h-3 text-amber-500" />
            <span>Best: <strong className="text-slate-800 dark:text-white font-mono">{highScore}</strong></span>
          </div>
          <button
            onClick={() => setIsWidgetFolded(false)}
            className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#E2136E] text-white hover:bg-[#FF2E88] transition cursor-pointer shadow-xs"
          >
            Play Snake
          </button>
        </div>
      ) : (
        /* Full Playable Board */
        <SnakeCanvasEngine
          gridSize={15}
          cellSize={14}
          highScore={highScore}
          onUpdateHighScore={updateHighScore}
          skin={SKINS[selectedSkin] || SKINS.ruby}
          speedMs={SPEEDS[speedLevel]?.ms || 100}
          speedLevel={speedLevel}
          onSelectSpeed={setSpeedLevel}
          onIncrementGamesPlayed={incrementGamesPlayed}
          isCompact={true}
        />
      )}

      {/* Arcade Modal */}
      {isModalOpen && (
        <SnakeArcadeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          highScore={highScore}
          onUpdateHighScore={updateHighScore}
          isMuted={isMuted}
          onToggleAudio={handleToggleAudio}
          selectedSkin={selectedSkin}
          onSelectSkin={setSelectedSkin}
          speedLevel={speedLevel}
          onSelectSpeed={setSpeedLevel}
          gamesPlayed={gamesPlayed}
          onIncrementGamesPlayed={incrementGamesPlayed}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Interactive Core Snake Canvas Engine
// -------------------------------------------------------------
function SnakeCanvasEngine({
  gridSize = 15,
  cellSize = 14,
  highScore = 0,
  onUpdateHighScore,
  skin = SKINS.ruby,
  speedMs = 100,
  speedLevel = 'normal',
  onSelectSpeed,
  onIncrementGamesPlayed,
  isCompact = true
}) {
  const canvasRef = useRef(null);

  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isNewHigh, setIsNewHigh] = useState(false);

  // References for the loop
  const snakeRef = useRef([
    { x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) },
    { x: Math.floor(gridSize / 2) - 1, y: Math.floor(gridSize / 2) },
    { x: Math.floor(gridSize / 2) - 2, y: Math.floor(gridSize / 2) }
  ]);
  const dirRef = useRef({ x: 1, y: 0 }); // moving right
  const nextDirRef = useRef({ x: 1, y: 0 });
  const foodRef = useRef({ x: Math.floor(gridSize / 2) + 3, y: Math.floor(gridSize / 2) });
  const particlesRef = useRef([]);
  const pulseRef = useRef(0);

  // Random food placement avoiding snake body
  const spawnFood = useCallback(() => {
    const snake = snakeRef.current;
    const available = [];
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        if (!snake.some((seg) => seg.x === x && seg.y === y)) {
          available.push({ x, y });
        }
      }
    }
    if (available.length > 0) {
      const idx = Math.floor(Math.random() * available.length);
      foodRef.current = available[idx];
    }
  }, [gridSize]);

  // Reset Game
  const resetGame = useCallback(() => {
    snakeRef.current = [
      { x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) },
      { x: Math.floor(gridSize / 2) - 1, y: Math.floor(gridSize / 2) },
      { x: Math.floor(gridSize / 2) - 2, y: Math.floor(gridSize / 2) }
    ];
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    particlesRef.current = [];
    setScore(0);
    setIsNewHigh(false);
    setIsGameOver(false);
    setIsPaused(false);
    spawnFood();
  }, [gridSize, spawnFood]);

  // Start / Restart Game
  const handleStartGame = useCallback(() => {
    resetGame();
    setIsPlaying(true);
    if (onIncrementGamesPlayed) onIncrementGamesPlayed();
  }, [resetGame, onIncrementGamesPlayed]);

  const handleTogglePause = () => {
    if (!isPlaying || isGameOver) return;
    setIsPaused((prev) => !prev);
  };

  // Turn helper with 180-degree reversal prevention
  const changeDirection = useCallback((dx, dy) => {
    const current = dirRef.current;
    if (dx !== 0 && current.x !== 0) return; // Prevent horizontal 180
    if (dy !== 0 && current.y !== 0) return; // Prevent vertical 180
    nextDirRef.current = { x: dx, y: dy };
    audio.playTurn();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space'];
      if (keys.includes(e.code) || keys.includes(e.key)) {
        // Prevent window scroll when playing
        if (isPlaying && !isGameOver) {
          e.preventDefault();
        }
      }

      if (e.code === 'ArrowUp' || e.key === 'ArrowUp' || e.code === 'KeyW') {
        changeDirection(0, -1);
      } else if (e.code === 'ArrowDown' || e.key === 'ArrowDown' || e.code === 'KeyS') {
        changeDirection(0, 1);
      } else if (e.code === 'ArrowLeft' || e.key === 'ArrowLeft' || e.code === 'KeyA') {
        changeDirection(-1, 0);
      } else if (e.code === 'ArrowRight' || e.key === 'ArrowRight' || e.code === 'KeyD') {
        changeDirection(1, 0);
      } else if (e.code === 'Space' || e.key === ' ') {
        if (!isPlaying || isGameOver) {
          handleStartGame();
        } else {
          setIsPaused((p) => !p);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, changeDirection, handleStartGame]);

  // Tick step for game mechanics
  useEffect(() => {
    if (!isPlaying || isPaused || isGameOver) return;

    // Slight speed acceleration as snake grows
    const currentSpeed = Math.max(35, speedMs - Math.floor(score / 50) * 4);

    const intervalId = setInterval(() => {
      // Apply buffered direction
      dirRef.current = nextDirRef.current;
      const dir = dirRef.current;
      const snake = snakeRef.current;

      const head = {
        x: snake[0].x + dir.x,
        y: snake[0].y + dir.y
      };

      // Wall collision check
      if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
        setIsGameOver(true);
        setIsPlaying(false);
        audio.playDie();
        return;
      }

      // Self collision check
      if (snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
        setIsGameOver(true);
        setIsPlaying(false);
        audio.playDie();
        return;
      }

      // Move snake
      const newSnake = [head, ...snake];

      // Check food consumption
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        audio.playEat();
        const gainedScore = score + 10;
        setScore(gainedScore);

        if (gainedScore > highScore) {
          setIsNewHigh(true);
          onUpdateHighScore(gainedScore);
        }

        // Spawn particles
        const px = head.x * cellSize + cellSize / 2;
        const py = head.y * cellSize + cellSize / 2;
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.5;
          const speed = 1.5 + Math.random() * 2;
          particlesRef.current.push({
            x: px,
            y: py,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            color: skin.food
          });
        }

        spawnFood();
      } else {
        newSnake.pop(); // Remove tail
      }

      snakeRef.current = newSnake;
    }, currentSpeed);

    return () => clearInterval(intervalId);
  }, [isPlaying, isPaused, isGameOver, speedMs, score, gridSize, cellSize, highScore, onUpdateHighScore, spawnFood, skin]);

  // Canvas Render Loop with High-DPI Support & Particle Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;

    const render = () => {
      pulseRef.current += 0.05;

      const totalPx = gridSize * cellSize;
      const dpr = window.devicePixelRatio || 1;

      // Ensure canvas pixel density matches display
      if (canvas.width !== totalPx * dpr) {
        canvas.width = totalPx * dpr;
        canvas.height = totalPx * dpr;
        canvas.style.width = `${totalPx}px`;
        canvas.style.height = `${totalPx}px`;
        ctx.scale(dpr, dpr);
      }

      // Clear & Background
      ctx.fillStyle = '#090D16';
      ctx.fillRect(0, 0, totalPx, totalPx);

      // Subtle Grid Pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= gridSize; i++) {
        const pos = i * cellSize;
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, totalPx);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(totalPx, pos);
        ctx.stroke();
      }

      // Render Food with Neon Pulse Glow
      const food = foodRef.current;
      if (food) {
        const fx = food.x * cellSize + cellSize / 2;
        const fy = food.y * cellSize + cellSize / 2;
        const pulse = Math.sin(pulseRef.current * 3) * 1.5;
        const radius = Math.max(2, cellSize / 2 - 2 + pulse);

        // Glow
        ctx.save();
        ctx.shadowColor = skin.food;
        ctx.shadowBlur = 12;
        ctx.fillStyle = skin.food;
        ctx.beginPath();
        ctx.arc(fx, fy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner jewel highlight
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(fx - radius * 0.3, fy - radius * 0.3, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Render Snake
      const snake = snakeRef.current;
      const dir = dirRef.current;

      snake.forEach((seg, index) => {
        const sx = seg.x * cellSize;
        const sy = seg.y * cellSize;
        const pad = 1.2;

        ctx.save();
        if (index === 0) {
          // Snake Head with Eyes
          ctx.shadowColor = skin.glow;
          ctx.shadowBlur = 10;
          ctx.fillStyle = skin.head;

          // Head body
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(sx + pad, sy + pad, cellSize - pad * 2, cellSize - pad * 2, 4);
          } else {
            ctx.rect(sx + pad, sy + pad, cellSize - pad * 2, cellSize - pad * 2);
          }
          ctx.fill();

          // Eyes
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#FFFFFF';
          const eyeSize = Math.max(2, cellSize * 0.18);
          let e1x, e1y, e2x, e2y;

          if (dir.x === 1) {
            // Moving Right
            e1x = sx + cellSize * 0.7;
            e1y = sy + cellSize * 0.28;
            e2x = sx + cellSize * 0.7;
            e2y = sy + cellSize * 0.72;
          } else if (dir.x === -1) {
            // Moving Left
            e1x = sx + cellSize * 0.3;
            e1y = sy + cellSize * 0.28;
            e2x = sx + cellSize * 0.3;
            e2y = sy + cellSize * 0.72;
          } else if (dir.y === -1) {
            // Moving Up
            e1x = sx + cellSize * 0.28;
            e1y = sy + cellSize * 0.3;
            e2x = sx + cellSize * 0.72;
            e2y = sy + cellSize * 0.3;
          } else {
            // Moving Down
            e1x = sx + cellSize * 0.28;
            e1y = sy + cellSize * 0.7;
            e2x = sx + cellSize * 0.72;
            e2y = sy + cellSize * 0.7;
          }

          ctx.beginPath();
          ctx.arc(e1x, e1y, eyeSize, 0, Math.PI * 2);
          ctx.arc(e2x, e2y, eyeSize, 0, Math.PI * 2);
          ctx.fill();

          // Pupils
          ctx.fillStyle = '#090D16';
          ctx.beginPath();
          ctx.arc(e1x + dir.x * 0.6, e1y + dir.y * 0.6, eyeSize * 0.55, 0, Math.PI * 2);
          ctx.arc(e2x + dir.x * 0.6, e2y + dir.y * 0.6, eyeSize * 0.55, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Snake Body Segments (Gradient interpolation)
          const ratio = index / Math.max(1, snake.length);
          ctx.fillStyle = ratio < 0.5 ? skin.bodyStart : skin.bodyEnd;

          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(sx + pad, sy + pad, cellSize - pad * 2, cellSize - pad * 2, 3);
          } else {
            ctx.rect(sx + pad, sy + pad, cellSize - pad * 2, cellSize - pad * 2);
          }
          ctx.fill();
        }
        ctx.restore();
      });

      // Update & Render Sparkle Particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, 2.5 * p.life), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gridSize, cellSize, skin]);

  const totalPx = gridSize * cellSize;

  return (
    <div className="space-y-2">
      {/* Score HUD */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</span>
          <span className="font-mono font-black text-sm text-[#FF2E88] dark:text-pink-400">
            {score}
          </span>
          {isNewHigh && (
            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
              NEW!
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{highScore}</span>
        </div>
      </div>

      {/* Canvas Viewport with Overlays */}
      <div
        className="relative mx-auto rounded-xl border border-slate-300/80 dark:border-white/[0.1] bg-[#090D16] shadow-inner overflow-hidden flex items-center justify-center select-none"
        style={{ width: `${totalPx}px`, height: `${totalPx}px` }}
      >
        <canvas ref={canvasRef} className="block cursor-pointer" onClick={() => !isPlaying && handleStartGame()} />

        {/* Overlay: Not Started */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 bg-[#090D16]/85 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center space-y-2">
            <div className="p-2 rounded-xl bg-[#E2136E]/20 text-[#FF2E88] border border-[#E2136E]/30 animate-bounce">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-black text-white tracking-wider uppercase">
                Ready to Slither?
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                Arrows / WASD to move
              </p>
            </div>
            <button
              onClick={handleStartGame}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white font-black text-xs shadow-md shadow-[#E2136E]/30 hover:scale-105 active:scale-95 transition-transform cursor-pointer flex items-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START</span>
            </button>
          </div>
        )}

        {/* Overlay: Paused */}
        {isPlaying && isPaused && (
          <div className="absolute inset-0 bg-[#090D16]/85 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center space-y-2">
            <span className="text-xs font-black text-amber-400 tracking-widest uppercase">
              PAUSED
            </span>
            <button
              onClick={handleTogglePause}
              className="px-3 py-1 rounded-lg bg-white/[0.1] hover:bg-white/[0.18] text-white font-bold text-xs border border-white/20 transition cursor-pointer flex items-center space-x-1"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Resume</span>
            </button>
          </div>
        )}

        {/* Overlay: Game Over */}
        {isGameOver && (
          <div className="absolute inset-0 bg-[#090D16]/90 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center space-y-2 animate-in fade-in duration-200">
            <span className="text-xs font-black text-rose-500 tracking-widest uppercase">
              GAME OVER
            </span>
            <div className="font-mono text-sm font-black text-white">
              Score: <span className="text-[#FF2E88]">{score}</span>
            </div>
            {score >= highScore && score > 0 && (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>NEW RECORD!</span>
              </span>
            )}
            <button
              onClick={handleStartGame}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white font-black text-xs shadow-md shadow-[#E2136E]/30 hover:scale-105 active:scale-95 transition-transform cursor-pointer flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>TRY AGAIN</span>
            </button>
          </div>
        )}
      </div>

      {/* Tactile Mini D-Pad Controls */}
      <div className="pt-1 flex flex-col items-center space-y-1">
        {/* Up */}
        <button
          onClick={() => changeDirection(0, -1)}
          className="p-1.5 rounded-lg bg-slate-200/80 dark:bg-white/[0.06] hover:bg-slate-300 dark:hover:bg-white/[0.12] active:bg-[#E2136E] active:text-white text-slate-600 dark:text-slate-300 transition cursor-pointer border border-slate-300/60 dark:border-white/[0.08]"
          title="Move Up"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>

        {/* Left, Center Pause, Right */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => changeDirection(-1, 0)}
            className="p-1.5 rounded-lg bg-slate-200/80 dark:bg-white/[0.06] hover:bg-slate-300 dark:hover:bg-white/[0.12] active:bg-[#E2136E] active:text-white text-slate-600 dark:text-slate-300 transition cursor-pointer border border-slate-300/60 dark:border-white/[0.08]"
            title="Move Left"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={isPlaying ? handleTogglePause : handleStartGame}
            className="p-1.5 rounded-lg bg-[#E2136E]/15 hover:bg-[#E2136E]/25 text-[#E2136E] dark:text-pink-400 transition cursor-pointer border border-[#E2136E]/30"
            title={isPlaying ? (isPaused ? 'Resume' : 'Pause') : 'Start'}
          >
            {isPlaying && !isPaused ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          <button
            onClick={() => changeDirection(1, 0)}
            className="p-1.5 rounded-lg bg-slate-200/80 dark:bg-white/[0.06] hover:bg-slate-300 dark:hover:bg-white/[0.12] active:bg-[#E2136E] active:text-white text-slate-600 dark:text-slate-300 transition cursor-pointer border border-slate-300/60 dark:border-white/[0.08]"
            title="Move Right"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Down */}
        <button
          onClick={() => changeDirection(0, 1)}
          className="p-1.5 rounded-lg bg-slate-200/80 dark:bg-white/[0.06] hover:bg-slate-300 dark:hover:bg-white/[0.12] active:bg-[#E2136E] active:text-white text-slate-600 dark:text-slate-300 transition cursor-pointer border border-slate-300/60 dark:border-white/[0.08]"
          title="Move Down"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Speed Selector (Compact) */}
      {isCompact && onSelectSpeed && (
        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-white/[0.06] text-[10px]">
          <span className="text-slate-400 font-semibold flex items-center space-x-1">
            <Zap className="w-3 h-3 text-[#E2136E]" />
            <span>Speed:</span>
          </span>
          <div className="flex items-center space-x-1">
            {Object.values(SPEEDS).map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectSpeed(s.id)}
                className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition ${
                  speedLevel === s.id
                    ? 'bg-[#E2136E] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Full-Screen / Popout Arcade Modal for Larger Screen Gaming
// -------------------------------------------------------------
function SnakeArcadeModal({
  isOpen,
  onClose,
  highScore,
  onUpdateHighScore,
  isMuted,
  onToggleAudio,
  selectedSkin,
  onSelectSkin,
  speedLevel,
  onSelectSpeed,
  gamesPlayed,
  onIncrementGamesPlayed
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-[#0B0F19]/95 text-white shadow-2xl overflow-hidden glass-panel-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E2136E] via-[#FF2E88] to-purple-600" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#E2136E] to-[#FF2E88] text-white shadow-lg shadow-[#E2136E]/30">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black tracking-tight text-white">
                  Cyber Snake Arcade
                </h2>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase bg-[#E2136E]/20 text-[#FF2E88] border border-[#E2136E]/30">
                  bKash Lounge
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Take a quick refresh break • Keyboard arrows or WASD
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleAudio}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 transition cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#FF2E88]" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          {/* Top Options: Skin & Speed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Skin Selector */}
            <div className="bg-white/[0.03] p-2.5 rounded-2xl border border-white/[0.06] space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-[#FF2E88]" />
                <span>Snake Skin:</span>
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.values(SKINS).map((skin) => (
                  <button
                    key={skin.id}
                    onClick={() => onSelectSkin(skin.id)}
                    className={`px-2 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border ${
                      selectedSkin === skin.id
                        ? `${skin.badge} shadow-sm font-black`
                        : 'bg-white/[0.02] text-slate-400 border-transparent hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: skin.head }} />
                    <span className="truncate">{skin.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Speed & Stats */}
            <div className="bg-white/[0.03] p-2.5 rounded-2xl border border-white/[0.06] flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Game Difficulty:</span>
                </span>
                <div className="flex items-center space-x-1.5 mt-1.5">
                  {Object.values(SPEEDS).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onSelectSpeed(s.id)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        speedLevel === s.id
                          ? 'bg-gradient-to-r from-[#E2136E] to-[#FF2E88] text-white border-white/20 shadow-md font-black'
                          : 'bg-white/[0.02] text-slate-400 border-white/[0.06] hover:bg-white/[0.06]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.06] text-slate-400">
                <span>Games Played: <strong className="text-white font-mono">{gamesPlayed}</strong></span>
                <span>Best Record: <strong className="text-amber-400 font-mono">{highScore}</strong></span>
              </div>
            </div>
          </div>

          {/* Large Engine Canvas */}
          <div className="flex justify-center">
            <SnakeCanvasEngine
              gridSize={18}
              cellSize={18}
              highScore={highScore}
              onUpdateHighScore={onUpdateHighScore}
              skin={SKINS[selectedSkin] || SKINS.ruby}
              speedMs={SPEEDS[speedLevel]?.ms || 100}
              onIncrementGamesPlayed={onIncrementGamesPlayed}
              isCompact={false}
            />
          </div>

          {/* Keyboard Helper Footer */}
          <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-400 border-t border-white/[0.06] pt-3">
            <span>Navigation: <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-slate-200 font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-slate-200 font-mono">↓</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-slate-200 font-mono">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-slate-200 font-mono">→</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-slate-200 font-mono">W A S D</kbd></span>
            <span>•</span>
            <span>Pause: <kbd className="px-2 py-0.5 rounded bg-white/[0.08] text-slate-200 font-mono">Space</kbd></span>
          </div>
        </div>
      </div>
    </div>
  );
}
