'use client';

import { useState, useEffect, useRef } from 'react';
import GameCanvas from './GameCanvas';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface GaneshaGameProps {
  onGameEnd: (score: number) => void;
  onBack: () => void;
}

export default function GaneshaGame({ onGameEnd, onBack }: GaneshaGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'ended'>('waiting');
  const timerRef = useRef<NodeJS.Timeout>();

  const startGame = () => {
    setGameState('playing');
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(60);

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
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const resetGame = () => {
    setGameState('waiting');
    setScore(0);
    setTimeLeft(60);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleGameEnd = (finalScore: number) => {
    onGameEnd(finalScore);
  };

  const handleScoreUpdate = (newScore: number) => {
    setScore(newScore);
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
          🐘 Modak Catcher
        </h1>
        <p className="text-deep-brown/70">
          Help Ganesha catch falling modaks! Move your mouse or finger to collect them.
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
      </div>

      {/* Game Area */}
      <div className="relative">
        {gameState === 'waiting' && (
          <div className="absolute inset-0 bg-white/90 rounded-lg border-2 border-deep-brown/20 flex flex-col items-center justify-center z-10 p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🐘</div>
              <h3 className="font-playfair text-xl font-bold text-deep-brown mb-2">
                Ready to catch modaks?
              </h3>
              <p className="text-deep-brown/70 mb-4">
                Move to catch falling modaks. Each modak gives you points!
              </p>
              <ul className="text-sm text-deep-brown/60 space-y-1">
                <li>🍬 Modak: 10 points</li>
                <li>⏱️ Game duration: 60 seconds</li>
                <li>🎯 Goal: Catch as many as possible!</li>
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
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="font-playfair text-xl font-bold text-deep-brown mb-2">
                Game Complete!
              </h3>
              <p className="text-2xl font-bold text-saffron mb-2">
                Final Score: {score}
              </p>
              <p className="text-deep-brown/70 mb-4">
                {score >= 200 ? "Excellent work! 🌟" : 
                 score >= 100 ? "Great job! 👍" :
                 "Good effort! Keep practicing! 💪"}
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

        <GameCanvas
          width={350}
          height={500}
          gameType="ganesha"
          onScoreUpdate={handleScoreUpdate}
          onGameEnd={handleGameEnd}
          isPlaying={isPlaying}
          className="mx-auto"
        />
      </div>

      {/* Instructions */}
      {gameState === 'playing' && (
        <div className="bg-saffron/10 rounded-lg p-3 border border-saffron/30 max-w-md text-center">
          <p className="text-sm text-deep-brown">
            <strong>💡 Tip:</strong> Move your cursor or finger to control Ganesha and catch the falling modaks!
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