'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

interface GameCanvasProps {
  width?: number;
  height?: number;
  gameType: string;
  onScoreUpdate: (score: number) => void;
  onGameEnd: (finalScore: number) => void;
  isPlaying: boolean;
  className?: string;
}

interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX?: number;
  velocityY?: number;
  type: string;
  emoji: string;
  points: number;
}

export default function GameCanvas({
  width = 350,
  height = 500,
  gameType,
  onScoreUpdate,
  onGameEnd,
  isPlaying,
  className
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  const [player, setPlayer] = useState({ x: width / 2, y: height - 60, width: 40, height: 40 });
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const createGameObject = useCallback(() => {
    const objects: Record<string, GameObject> = {
      ganesha: {
        id: `modak-${Date.now()}`,
        x: Math.random() * (width - 30),
        y: -30,
        width: 30,
        height: 30,
        velocityY: 2 + Math.random() * 3,
        type: 'modak',
        emoji: '🍬',
        points: 10
      },
      shiva: {
        id: `target-${Date.now()}`,
        x: Math.random() * (width - 40),
        y: Math.random() * (height / 2),
        width: 40,
        height: 40,
        type: 'target',
        emoji: '🎯',
        points: 20
      },
      lakshmi: {
        id: `coin-${Date.now()}`,
        x: Math.random() * (width - 25),
        y: -25,
        width: 25,
        height: 25,
        velocityY: 1.5 + Math.random() * 2,
        type: 'coin',
        emoji: '🪙',
        points: 15
      },
      hanuman: {
        id: `mountain-${Date.now()}`,
        x: Math.random() * (width - 50),
        y: height - 100,
        width: 50,
        height: 50,
        type: 'mountain',
        emoji: '⛰️',
        points: 25
      }
    };

    return objects[gameType as keyof typeof objects] as GameObject;
  }, [width, height, gameType]);

  const updateGame = useCallback(() => {
    if (!isPlaying) return;

    setGameObjects(prevObjects => {
      const updated = prevObjects
        .map(obj => {
          // Update position based on velocity
          if (obj.velocityY) {
            obj.y += obj.velocityY;
          }
          if (obj.velocityX) {
            obj.x += obj.velocityX;
          }
          return obj;
        })
        .filter(obj => {
          // Remove objects that are off screen
          return obj.y < height + 50 && obj.x > -50 && obj.x < width + 50;
        });

      // Add new objects randomly
      if (Math.random() < 0.02 && updated.length < 8) {
        updated.push(createGameObject());
      }

      return updated;
    });
  }, [isPlaying, height, width, createGameObject]);

  const checkCollisions = useCallback(() => {
    gameObjects.forEach(obj => {
      // Check collision with player
      if (
        player.x < obj.x + obj.width &&
        player.x + player.width > obj.x &&
        player.y < obj.y + obj.height &&
        player.y + player.height > obj.y
      ) {
        // Remove collected object and update score
        setGameObjects(prev => prev.filter(o => o.id !== obj.id));
        setScore(prev => {
          const newScore = prev + obj.points;
          onScoreUpdate(newScore);
          return newScore;
        });
        
        // Show points gained
        showToast(`+${obj.points} points!`, 'success');
      }
    });
  }, [gameObjects, player, onScoreUpdate, showToast]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#FFF8DC');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw game objects
    gameObjects.forEach(obj => {
      ctx.font = `${obj.width}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText(obj.emoji, obj.x + obj.width / 2, obj.y + obj.height);
    });

    // Draw player
    const playerEmoji = getPlayerEmoji();
    ctx.font = `${player.width}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText(playerEmoji, player.x + player.width / 2, player.y + player.height);

  }, [gameObjects, player, width, height]);

  const getPlayerEmoji = () => {
    const players = {
      ganesha: '🐘',
      shiva: '🔱',
      lakshmi: '👸',
      hanuman: '🐵',
      krishna: '🪈',
      durga: '⚔️',
      ram: '🏹',
      vishnu: '🐚'
    };
    return players[gameType as keyof typeof players] || '😊';
  };

  const gameLoop = useCallback(() => {
    if (isPlaying) {
      updateGame();
      checkCollisions();
      draw();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }, [isPlaying, updateGame, checkCollisions, draw]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPlaying) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      setPlayer(prev => ({
        ...prev,
        x: Math.max(0, Math.min(width - prev.width, x - prev.width / 2))
      }));
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isPlaying) return;
    
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && e.touches[0]) {
      const x = e.touches[0].clientX - rect.left;
      setPlayer(prev => ({
        ...prev,
        x: Math.max(0, Math.min(width - prev.width, x - prev.width / 2))
      }));
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPlaying) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Check if clicked on any game object
      gameObjects.forEach(obj => {
        if (
          clickX >= obj.x &&
          clickX <= obj.x + obj.width &&
          clickY >= obj.y &&
          clickY <= obj.y + obj.height
        ) {
          // Remove clicked object and update score
          setGameObjects(prev => prev.filter(o => o.id !== obj.id));
          setScore(prev => {
            const newScore = prev + obj.points;
            onScoreUpdate(newScore);
            return newScore;
          });
          showToast(`+${obj.points} points!`, 'success');
        }
      });
    }
  };

  useEffect(() => {
    if (isPlaying && !gameStarted) {
      setGameStarted(true);
      setScore(0);
      setGameObjects([]);
    } else if (!isPlaying && gameStarted) {
      setGameStarted(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      onGameEnd(score);
    }
  }, [isPlaying, gameStarted, score, onGameEnd]);

  useEffect(() => {
    if (isPlaying) {
      gameLoop();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, gameLoop]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={cn(
          'border-2 border-deep-brown/20 rounded-lg bg-white cursor-crosshair',
          'touch-none select-none',
          className
        )}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onClick={handleClick}
        style={{
          maxWidth: '100%',
          height: 'auto'
        }}
      />
      {ToastComponent}
    </>
  );
}