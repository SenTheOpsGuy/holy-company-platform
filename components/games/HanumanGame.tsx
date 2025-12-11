'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface HanumanGameProps {
  onGameEnd: (score: number) => void;
  onBack: () => void;
}

interface Mountain {
  id: string;
  weight: number;
  x: number;
  y: number;
  isLifted: boolean;
  liftProgress: number;
}

export default function HanumanGame({ onGameEnd, onBack }: HanumanGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'ended'>('waiting');
  const [mountains, setMountains] = useState<Mountain[]>([]);
  const [currentMountain, setCurrentMountain] = useState<string | null>(null);
  const [liftPower, setLiftPower] = useState(0);
  const [isLifting, setIsLifting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const liftIntervalRef = useRef<NodeJS.Timeout>();

  const createMountain = (index: number): Mountain => {
    const weights = [50, 100, 150, 200, 250];
    const weight = weights[Math.floor(Math.random() * weights.length)];
    
    return {
      id: `mountain-${Date.now()}-${index}`,
      weight,
      x: (index % 3) * 110 + 30,
      y: Math.floor(index / 3) * 120 + 100,
      isLifted: false,
      liftProgress: 0
    };
  };

  const generateMountains = () => {
    return Array.from({ length: 6 }, (_, i) => createMountain(i));
  };

  const startGame = () => {
    setGameState('playing');
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(60);
    setMountains(generateMountains());
    setLiftPower(0);

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
    setCurrentMountain(null);
    setIsLifting(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (liftIntervalRef.current) {
      clearInterval(liftIntervalRef.current);
    }
  };

  const resetGame = () => {
    setGameState('waiting');
    setScore(0);
    setTimeLeft(60);
    setMountains([]);
    setLiftPower(0);
    setCurrentMountain(null);
    setIsLifting(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (liftIntervalRef.current) {
      clearInterval(liftIntervalRef.current);
    }
  };

  const startLifting = (mountainId: string) => {
    if (isLifting || currentMountain) return;
    
    const mountain = mountains.find(m => m.id === mountainId && !m.isLifted);
    if (!mountain) return;

    setCurrentMountain(mountainId);
    setIsLifting(true);
    setLiftPower(0);

    // Lifting mini-game: rapidly build power
    liftIntervalRef.current = setInterval(() => {
      setLiftPower(prev => {
        const newPower = prev + (Math.random() * 5 + 2);
        
        // Check if enough power to lift the mountain
        if (newPower >= mountain.weight) {
          liftMountain(mountainId, mountain.weight);
        }
        
        return Math.min(newPower, mountain.weight + 50);
      });
    }, 100);
  };

  const liftMountain = (mountainId: string, weight: number) => {
    setMountains(prev => 
      prev.map(m => 
        m.id === mountainId 
          ? { ...m, isLifted: true, liftProgress: 100 }
          : m
      )
    );

    // Calculate score based on mountain weight
    const points = Math.floor(weight / 10);
    setScore(prev => prev + points);

    // Reset lifting state
    setCurrentMountain(null);
    setIsLifting(false);
    setLiftPower(0);
    
    if (liftIntervalRef.current) {
      clearInterval(liftIntervalRef.current);
    }

    // Generate new mountains if all are lifted
    const unlifted = mountains.filter(m => !m.isLifted && m.id !== mountainId);
    if (unlifted.length === 0) {
      setTimeout(() => {
        setMountains(generateMountains());
      }, 1000);
    }
  };

  const cancelLifting = () => {
    setCurrentMountain(null);
    setIsLifting(false);
    setLiftPower(0);
    
    if (liftIntervalRef.current) {
      clearInterval(liftIntervalRef.current);
    }
  };

  const getMountainEmoji = (weight: number) => {
    if (weight <= 75) return '🏔️';
    if (weight <= 125) return '🗻';
    if (weight <= 175) return '⛰️';
    if (weight <= 225) return '🏔️';
    return '🗻';
  };

  const getMountainSize = (weight: number) => {
    return Math.max(30, Math.min(60, weight / 5));
  };

  const handleGameEnd = (finalScore: number) => {
    onGameEnd(finalScore);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (liftIntervalRef.current) {
        clearInterval(liftIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {/* Game Header */}
      <div className="text-center">
        <h1 className="font-playfair text-3xl font-bold text-deep-brown mb-2">
          🐵 Mountain Lifter
        </h1>
        <p className="text-deep-brown/70">
          Channel Hanuman's strength! Click and hold to build power and lift mountains.
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
          <p className="text-sm text-deep-brown/60">Lifted</p>
          <p className="text-xl font-bold text-deep-brown">
            {mountains.filter(m => m.isLifted).length}
          </p>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative">
        {gameState === 'waiting' && (
          <div className="absolute inset-0 bg-white/90 rounded-lg border-2 border-deep-brown/20 flex flex-col items-center justify-center z-10 p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🐵</div>
              <h3 className="font-playfair text-xl font-bold text-deep-brown mb-2">
                Ready to show your strength?
              </h3>
              <p className="text-deep-brown/70 mb-4">
                Click on mountains to start lifting. Build up power to lift heavier mountains!
              </p>
              <ul className="text-sm text-deep-brown/60 space-y-1">
                <li>🏔️ Light Mountains: 50-100kg</li>
                <li>⛰️ Medium Mountains: 100-200kg</li>
                <li>🗻 Heavy Mountains: 200-250kg</li>
                <li>💪 More weight = more points!</li>
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
                {score >= 500 ? "🏆" : score >= 250 ? "💪" : "🐵"}
              </div>
              <h3 className="font-playfair text-xl font-bold text-deep-brown mb-2">
                Game Complete!
              </h3>
              <p className="text-2xl font-bold text-saffron mb-2">
                Final Score: {score}
              </p>
              <p className="text-deep-brown/70 mb-4">
                {score >= 500 ? "Incredible strength! Hanuman is proud! 🌟" : 
                 score >= 250 ? "Great power! Keep building strength! 💪" :
                 "Good effort! Train harder for more power! 🏋️"}
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

        <div className="w-[350px] h-[400px] bg-gradient-to-b from-green-200 to-brown-200 rounded-lg border-2 border-deep-brown/20 relative overflow-hidden p-4">
          {/* Mountains */}
          {mountains.map(mountain => {
            const size = getMountainSize(mountain.weight);
            return (
              <button
                key={mountain.id}
                onClick={() => startLifting(mountain.id)}
                disabled={mountain.isLifted || isLifting}
                className={cn(
                  "absolute transition-all duration-300 hover:scale-110 disabled:cursor-not-allowed",
                  mountain.isLifted && "opacity-30 scale-75",
                  currentMountain === mountain.id && "ring-4 ring-saffron animate-pulse"
                )}
                style={{
                  left: mountain.x,
                  top: mountain.y,
                  fontSize: `${size}px`
                }}
              >
                {getMountainEmoji(mountain.weight)}
                
                {/* Weight label */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-deep-brown bg-white rounded px-1">
                  {mountain.weight}kg
                </div>
                
                {/* Lift progress */}
                {currentMountain === mountain.id && (
                  <div className="absolute -bottom-4 left-0 w-full">
                    <div className="bg-gray-300 rounded-full h-2">
                      <div 
                        className="bg-saffron rounded-full h-2 transition-all duration-100"
                        style={{ width: `${(liftPower / mountain.weight) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </button>
            );
          })}

          {/* Hanuman character */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-6xl">
            🐵
          </div>
        </div>
      </div>

      {/* Power Meter */}
      {isLifting && currentMountain && (
        <div className="bg-white rounded-lg p-4 border-2 border-saffron/30 w-full max-w-md">
          <div className="text-center mb-2">
            <p className="font-semibold text-deep-brown">Building Strength...</p>
            <p className="text-sm text-deep-brown/60">
              Power: {Math.round(liftPower)} / {mountains.find(m => m.id === currentMountain)?.weight}
            </p>
          </div>
          <div className="bg-gray-300 rounded-full h-4 mb-3">
            <div 
              className="bg-gradient-to-r from-saffron to-red-500 rounded-full h-4 transition-all duration-100"
              style={{ 
                width: `${Math.min(100, (liftPower / (mountains.find(m => m.id === currentMountain)?.weight || 100)) * 100)}%` 
              }}
            />
          </div>
          <Button onClick={cancelLifting} variant="outline" size="sm" className="w-full">
            Cancel Lift
          </Button>
        </div>
      )}

      {/* Instructions */}
      {gameState === 'playing' && !isLifting && (
        <div className="bg-saffron/10 rounded-lg p-3 border border-saffron/30 max-w-md text-center">
          <p className="text-sm text-deep-brown">
            <strong>💡 Tip:</strong> Click on mountains to start lifting. Heavier mountains give more points but take more power!
          </p>
        </div>
      )}

      {/* Back Button */}
      <Button onClick={onBack} variant="ghost" className="mt-4">
        ← Back to Games
      </Button>
    </div>
  );
}