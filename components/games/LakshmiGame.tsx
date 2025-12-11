'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface LakshmiGameProps {
  onGameEnd: (score: number) => void;
  onBack: () => void;
}

interface Coin {
  id: string;
  x: number;
  y: number;
  type: 'gold' | 'silver' | 'bronze';
  value: number;
  emoji: string;
  velocityY: number;
}

export default function LakshmiGame({ onGameEnd, onBack }: LakshmiGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'ended'>('waiting');
  const [coins, setCoins] = useState<Coin[]>([]);
  const [draggedCoin, setDraggedCoin] = useState<string | null>(null);
  const [sortingBins, setSortingBins] = useState({
    gold: 0,
    silver: 0,
    bronze: 0
  });
  const timerRef = useRef<NodeJS.Timeout>();
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const coinTypes = [
    { type: 'gold' as const, emoji: '🟡', value: 25, probability: 0.2 },
    { type: 'silver' as const, emoji: '⚪', value: 15, probability: 0.3 },
    { type: 'bronze' as const, emoji: '🟤', value: 10, probability: 0.5 }
  ];

  const createCoin = (): Coin => {
    const rand = Math.random();
    let coinType = coinTypes[2]; // default bronze
    
    if (rand < coinTypes[0].probability) {
      coinType = coinTypes[0]; // gold
    } else if (rand < coinTypes[0].probability + coinTypes[1].probability) {
      coinType = coinTypes[1]; // silver
    }

    return {
      id: `coin-${Date.now()}-${Math.random()}`,
      x: Math.random() * 250 + 25,
      y: -30,
      type: coinType.type,
      value: coinType.value,
      emoji: coinType.emoji,
      velocityY: 2 + Math.random() * 2
    };
  };

  const startGame = () => {
    setGameState('playing');
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(60);
    setCoins([]);
    setSortingBins({ gold: 0, silver: 0, bronze: 0 });

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
    setCoins([]);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const resetGame = () => {
    setGameState('waiting');
    setScore(0);
    setTimeLeft(60);
    setCoins([]);
    setSortingBins({ gold: 0, silver: 0, bronze: 0 });
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleDragStart = (coinId: string) => {
    setDraggedCoin(coinId);
  };

  const handleDragEnd = () => {
    setDraggedCoin(null);
  };

  const handleDrop = (binType: 'gold' | 'silver' | 'bronze', e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedCoin) return;

    const coin = coins.find(c => c.id === draggedCoin);
    if (!coin) return;

    // Remove coin from falling coins
    setCoins(prev => prev.filter(c => c.id !== draggedCoin));

    // Check if sorted correctly
    if (coin.type === binType) {
      // Correct sort
      setScore(prev => prev + coin.value);
      setSortingBins(prev => ({
        ...prev,
        [binType]: prev[binType] + 1
      }));

      // Visual feedback
      const binElement = e.currentTarget as HTMLElement;
      binElement.style.transform = 'scale(1.1)';
      binElement.style.backgroundColor = '#22c55e';
      setTimeout(() => {
        binElement.style.transform = 'scale(1)';
        binElement.style.backgroundColor = '';
      }, 300);
    } else {
      // Wrong sort - penalty
      setScore(prev => Math.max(0, prev - 5));

      // Visual feedback
      const binElement = e.currentTarget as HTMLElement;
      binElement.style.transform = 'scale(1.1)';
      binElement.style.backgroundColor = '#ef4444';
      setTimeout(() => {
        binElement.style.transform = 'scale(1)';
        binElement.style.backgroundColor = '';
      }, 300);
    }

    setDraggedCoin(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Game loop for falling coins
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      // Update coin positions
      setCoins(prev => {
        const updated = prev
          .map(coin => ({ ...coin, y: coin.y + coin.velocityY }))
          .filter(coin => coin.y < 400); // Remove coins that fell off screen

        // Add new coin occasionally
        if (Math.random() < 0.05 && updated.length < 8) {
          updated.push(createCoin());
        }

        return updated;
      });
    }, 50);

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
          💰 Coin Collector
        </h1>
        <p className="text-deep-brown/70">
          Help Lakshmi sort the falling coins! Drag them to the correct bins.
        </p>
      </div>

      {/* Game Stats */}
      <div className="flex gap-4 text-center flex-wrap justify-center">
        <div className="bg-white rounded-lg p-3 border-2 border-deep-brown/20 min-w-[70px]">
          <p className="text-sm text-deep-brown/60">Score</p>
          <p className="text-xl font-bold text-saffron">{score}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border-2 border-deep-brown/20 min-w-[70px]">
          <p className="text-sm text-deep-brown/60">Time</p>
          <p className={cn(
            "text-xl font-bold",
            timeLeft <= 10 ? "text-red-500" : "text-deep-brown"
          )}>
            {timeLeft}s
          </p>
        </div>
        <div className="bg-white rounded-lg p-3 border-2 border-deep-brown/20 min-w-[70px]">
          <p className="text-sm text-deep-brown/60">🟡 Gold</p>
          <p className="text-lg font-bold text-yellow-600">{sortingBins.gold}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border-2 border-deep-brown/20 min-w-[70px]">
          <p className="text-sm text-deep-brown/60">⚪ Silver</p>
          <p className="text-lg font-bold text-gray-600">{sortingBins.silver}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border-2 border-deep-brown/20 min-w-[70px]">
          <p className="text-sm text-deep-brown/60">🟤 Bronze</p>
          <p className="text-lg font-bold text-amber-700">{sortingBins.bronze}</p>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative">
        {gameState === 'waiting' && (
          <div className="absolute inset-0 bg-white/90 rounded-lg border-2 border-deep-brown/20 flex flex-col items-center justify-center z-10 p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="font-playfair text-xl font-bold text-deep-brown mb-2">
                Ready to sort coins?
              </h3>
              <p className="text-deep-brown/70 mb-4">
                Drag falling coins to their matching color bins!
              </p>
              <ul className="text-sm text-deep-brown/60 space-y-1">
                <li>🟡 Gold coins: 25 points</li>
                <li>⚪ Silver coins: 15 points</li>
                <li>🟤 Bronze coins: 10 points</li>
                <li>❌ Wrong bin: -5 points</li>
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
                {score >= 400 ? "💎" : score >= 200 ? "🎉" : "💰"}
              </div>
              <h3 className="font-playfair text-xl font-bold text-deep-brown mb-2">
                Game Complete!
              </h3>
              <p className="text-2xl font-bold text-saffron mb-2">
                Final Score: {score}
              </p>
              <p className="text-deep-brown/70 mb-4">
                {score >= 400 ? "Wealth Master! Lakshmi is pleased! 💎" : 
                 score >= 200 ? "Great sorting skills! 🌟" :
                 "Good effort! Practice makes perfect! 💪"}
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
          className="w-[350px] h-[500px] bg-gradient-to-b from-yellow-100 to-amber-200 rounded-lg border-2 border-deep-brown/20 relative overflow-hidden"
        >
          {/* Falling Coins */}
          {coins.map(coin => (
            <div
              key={coin.id}
              draggable={true}
              onDragStart={() => handleDragStart(coin.id)}
              onDragEnd={handleDragEnd}
              className="absolute text-3xl cursor-grab active:cursor-grabbing select-none hover:scale-110 transition-transform"
              style={{
                left: coin.x,
                top: coin.y,
                zIndex: draggedCoin === coin.id ? 50 : 10
              }}
            >
              {coin.emoji}
            </div>
          ))}
        </div>
      </div>

      {/* Sorting Bins */}
      <div className="flex gap-4 justify-center">
        {(['gold', 'silver', 'bronze'] as const).map(binType => (
          <div
            key={binType}
            onDrop={(e) => handleDrop(binType, e)}
            onDragOver={handleDragOver}
            className={cn(
              "w-20 h-20 rounded-lg border-4 border-dashed flex flex-col items-center justify-center transition-all duration-200",
              "hover:scale-105 cursor-pointer",
              binType === 'gold' && "border-yellow-400 bg-yellow-50",
              binType === 'silver' && "border-gray-400 bg-gray-50",
              binType === 'bronze' && "border-amber-600 bg-amber-50"
            )}
          >
            <div className="text-2xl">
              {binType === 'gold' ? '🟡' : binType === 'silver' ? '⚪' : '🟤'}
            </div>
            <div className="text-xs font-bold text-deep-brown">
              {binType.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      {gameState === 'playing' && (
        <div className="bg-saffron/10 rounded-lg p-3 border border-saffron/30 max-w-md text-center">
          <p className="text-sm text-deep-brown">
            <strong>💡 Tip:</strong> Drag coins to matching colored bins. Gold coins are worth the most!
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