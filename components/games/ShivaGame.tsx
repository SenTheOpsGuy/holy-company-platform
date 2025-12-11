'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ShivaGameProps {
  onGameEnd: (score: number) => void;
  onBack: () => void;
}

interface Target {
  id: string;
  x: number;
  y: number;
  size: number;
  points: number;
  timeLeft: number;
  emoji: string;
}

export default function ShivaGame({ onGameEnd, onBack }: ShivaGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'ended'>('waiting');
  const [targets, setTargets] = useState<Target[]>([]);
  const [crosshair, setCrosshair] = useState({ x: 0, y: 0, visible: false });
  const timerRef = useRef<NodeJS.Timeout>();
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const createTarget = () => {
    const targetTypes = [
      { emoji: '🎯', points: 20, size: 40, duration: 3000 },
      { emoji: '👹', points: 30, size: 35, duration: 2500 },
      { emoji: '💀', points: 50, size: 30, duration: 2000 },
    ];

    const type = targetTypes[Math.floor(Math.random() * targetTypes.length)];
    
    return {
      id: `target-${Date.now()}-${Math.random()}`,
      x: Math.random() * 300 + 25, // 25px margin
      y: Math.random() * 400 + 50,
      size: type.size,
      points: type.points,
      timeLeft: type.duration,
      emoji: type.emoji
    };
  };

  const startGame = () => {
    setGameState('playing');
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(60);
    setTargets([createTarget()]);

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    setIsPlaying(false);
    setGameState('ended');
    setTargets([]);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const resetGame = () => {
    setGameState('waiting');
    setScore(0);
    setTimeLeft(60);
    setTargets([]);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!gameAreaRef.current) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    setCrosshair({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      visible: true
    });
  };

  const handleMouseLeave = () => {
    setCrosshair(prev => ({ ...prev, visible: false }));
  };

  const handleTargetClick = (targetId: string, points: number) => {
    setTargets(prev => prev.filter(t => t.id !== targetId));
    setScore(prev => prev + points);

    // Add visual feedback
    if (gameAreaRef.current) {
      const hitEffect = document.createElement('div');
      hitEffect.textContent = `+${points}`;
      hitEffect.className = 'absolute text-saffron font-bold text-xl pointer-events-none z-50';
      hitEffect.style.left = `${crosshair.x}px`;
      hitEffect.style.top = `${crosshair.y}px`;
      hitEffect.style.transform = 'translate(-50%, -50%)';
      hitEffect.style.animation = 'fadeUpOut 1s ease-out forwards';
      
      gameAreaRef.current.appendChild(hitEffect);
      setTimeout(() => hitEffect.remove(), 1000);
    }
  };

  // Update targets and spawn new ones
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTargets(prev => {
        // Update existing targets
        const updated = prev
          .map(target => ({ ...target, timeLeft: target.timeLeft - 100 }))
          .filter(target => target.timeLeft > 0);

        // Add new target occasionally
        if (Math.random() < 0.3 && updated.length < 5) {
          updated.push(createTarget());
        }

        return updated;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleGameEnd = (finalScore: number) => {
    onGameEnd(finalScore);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {/* Game Header */}
      <div className="text-center">
        <h1 className="font-playfair text-3xl font-bold text-deep-brown mb-2">
          🔱 Trishul Aim
        </h1>
        <p className="text-deep-brown/70">
          Channel Shiva's precision! Click on targets before they disappear.
        </p>
      </div>

      {/* Game Stats */}
      <div className="flex gap-6 text-center">
        <div className="bg-white rounded-lg p-3 border-2 border-deep-brown/20 min-w-[80px]">
          <p className="text-sm text-deep-brown/60">Score</p>
          <p className="text-xl font-bold text-saffron">{score}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border-2 border-deep-brown/20 min-w-[80px]">
          <p className="text-sm text-deep-brown/60">Time</p>
          <p className={cn(
            "text-xl font-bold",
            timeLeft <= 10 ? "text-red-500" : "text-deep-brown"
          )}>
            {timeLeft}s
          </p>
        </div>
        <div className="bg-white rounded-lg p-3 border-2 border-deep-brown/20 min-w-[80px]">
          <p className="text-sm text-deep-brown/60">Targets</p>
          <p className="text-xl font-bold text-deep-brown">{targets.length}</p>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative">
        {gameState === 'waiting' && (
          <div className="absolute inset-0 bg-white/90 rounded-lg border-2 border-deep-brown/20 flex flex-col items-center justify-center z-10 p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🔱</div>
              <h3 className="font-playfair text-xl font-bold text-deep-brown mb-2">
                Ready to test your aim?
              </h3>
              <p className="text-deep-brown/70 mb-4">
                Click on targets before they vanish. Higher points for harder targets!
              </p>
              <ul className="text-sm text-deep-brown/60 space-y-1">
                <li>🎯 Regular Target: 20 points</li>
                <li>👹 Demon: 30 points</li>
                <li>💀 Skull: 50 points</li>
                <li>⏱️ Targets disappear quickly!</li>
              </ul>
            </div>
            <Button onClick={startGame} variant="divine" size="lg">
              🎮 Start Game
            </Button>
          </div>
        )}

        {gameState === 'ended' && (
          <div className="absolute inset-0 bg-white/90 rounded-lg border-2 border-deep-brown/20 flex flex-col items-center justify-center z-10 p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">
                {score >= 300 ? "🏆" : score >= 150 ? "🎉" : "🎯"}
              </div>
              <h3 className="font-playfair text-xl font-bold text-deep-brown mb-2">
                Game Complete!
              </h3>
              <p className="text-2xl font-bold text-saffron mb-2">
                Final Score: {score}
              </p>
              <p className="text-deep-brown/70 mb-4">
                {score >= 300 ? "Master Archer! Shiva approves! 🌟" : 
                 score >= 150 ? "Great aim! Keep practicing! 👍" :
                 "Good start! Your precision will improve! 💪"}
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={resetGame} variant="outline">
                🔄 Play Again
              </Button>
              <Button onClick={() => handleGameEnd(score)} variant="divine">
                ✓ Continue
              </Button>
            </div>
          </div>
        )}

        <div
          ref={gameAreaRef}
          className="relative w-[350px] h-[500px] bg-gradient-to-b from-blue-200 to-green-200 rounded-lg border-2 border-deep-brown/20 cursor-crosshair overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            background: 'linear-gradient(45deg, #1e3a8a 0%, #065f46 50%, #7c2d12 100%)'
          }}
        >
          {/* Targets */}
          {targets.map(target => (
            <button
              key={target.id}
              onClick={() => handleTargetClick(target.id, target.points)}
              className="absolute transition-transform hover:scale-110 focus:scale-110"
              style={{
                left: target.x,
                top: target.y,
                fontSize: `${target.size}px`,
                lineHeight: 1,
                background: 'none',
                border: 'none',
                cursor: 'crosshair'
              }}
            >
              {target.emoji}
              {/* Timer bar */}
              <div 
                className="absolute -bottom-2 left-0 h-1 bg-red-500 rounded"
                style={{
                  width: `${target.size}px`,
                  transform: `scaleX(${target.timeLeft / 3000})`
                }}
              />
            </button>
          ))}

          {/* Crosshair */}
          {crosshair.visible && isPlaying && (
            <div
              className="absolute pointer-events-none z-40"
              style={{
                left: crosshair.x,
                top: crosshair.y,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="w-6 h-6 border-2 border-red-500 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 w-8 h-0.5 bg-red-500 transform -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-red-500 transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      {gameState === 'playing' && (
        <div className="bg-saffron/10 rounded-lg p-3 border border-saffron/30 max-w-md text-center">
          <p className="text-sm text-deep-brown">
            <strong>💡 Tip:</strong> Click quickly on targets! Skulls give the most points but disappear fastest.
          </p>
        </div>
      )}

      {/* Back Button */}
      <Button onClick={onBack} variant="ghost" className="mt-4">
        ← Back to Games
      </Button>

      <style jsx>{`
        @keyframes fadeUpOut {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) translateY(0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) translateY(-30px);
          }
        }
      `}</style>
    </div>
  );
}