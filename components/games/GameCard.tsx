'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { DEITIES, GAME_CONFIGS } from '@/lib/constants';

interface GameCardProps {
  gameId: string;
  isUnlocked: boolean;
  highScore?: number;
  lastPlayed?: Date;
  className?: string;
}

export default function GameCard({
  gameId,
  isUnlocked,
  highScore = 0,
  lastPlayed,
  className
}: GameCardProps) {
  const deity = DEITIES.find(d => d.id === gameId);
  const config = GAME_CONFIGS[gameId as keyof typeof GAME_CONFIGS];

  if (!deity || !config) return null;

  const getGameTitle = () => {
    const titles = {
      ganesha: 'Modak Catcher',
      shiva: 'Trishul Aim',
      lakshmi: 'Coin Collector',
      hanuman: 'Mountain Lifter',
      krishna: 'Melody Master',
      durga: 'Warrior Match',
      ram: 'Arrow Shooter',
      vishnu: 'Chakra Spinner'
    };
    return titles[gameId as keyof typeof titles] || `${deity.name} Game`;
  };

  const getDifficultyBadge = () => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    return (
      <span className={cn(
        'px-2 py-1 rounded-full text-xs font-medium',
        colors[config.difficulty as keyof typeof colors]
      )}>
        {config.difficulty.charAt(0).toUpperCase() + config.difficulty.slice(1)}
      </span>
    );
  };

  const content = (
    <div
      className={cn(
        'relative bg-white rounded-2xl p-4 border-2 transition-all duration-300',
        'min-h-[180px] flex flex-col',
        isUnlocked 
          ? 'border-deep-brown/20 hover:border-saffron hover:scale-105 hover:shadow-lg cursor-pointer' 
          : 'border-gray-300 opacity-60 cursor-not-allowed',
        className
      )}
      style={{
        background: isUnlocked 
          ? `linear-gradient(135deg, ${deity.color}10 0%, white 100%)`
          : 'linear-gradient(135deg, #f3f4f6 0%, white 100%)'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{deity.icon}</span>
          <div>
            <h3 className={cn(
              'font-playfair text-lg font-bold',
              isUnlocked ? 'text-deep-brown' : 'text-gray-500'
            )}>
              {getGameTitle()}
            </h3>
            <p className={cn(
              'text-sm',
              isUnlocked ? 'text-deep-brown/70' : 'text-gray-400'
            )}>
              {deity.subtitle}
            </p>
          </div>
        </div>

        {/* Lock/Unlock indicator */}
        {!isUnlocked && (
          <div className="bg-gray-500 text-white rounded-full p-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Game Type & Difficulty */}
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-deep-brown/10 text-deep-brown px-2 py-1 rounded-full text-xs font-medium">
          {config.type.charAt(0).toUpperCase() + config.type.slice(1)} Game
        </span>
        {getDifficultyBadge()}
      </div>

      {/* Stats */}
      {isUnlocked && (
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-xs text-deep-brown/60">High Score</p>
              <p className="font-bold text-lg" style={{ color: deity.color }}>
                {highScore.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-deep-brown/60">Duration</p>
              <p className="font-semibold text-deep-brown">
                {config.duration}s
              </p>
            </div>
          </div>

          {lastPlayed && (
            <p className="text-xs text-deep-brown/50 mb-3">
              Last played: {lastPlayed.toLocaleDateString()}
            </p>
          )}

          {/* Play Button */}
          <div 
            className={cn(
              'w-full py-2 px-4 rounded-lg text-center font-semibold text-sm transition-all duration-200',
              'bg-gradient-to-r from-saffron to-gold text-deep-brown hover:shadow-md'
            )}
          >
            🎮 Play Now
          </div>
        </div>
      )}

      {/* Unlock requirement */}
      {!isUnlocked && (
        <div className="mt-auto text-center">
          <p className="text-sm text-gray-500 mb-2">
            Complete a puja with {deity.name} to unlock
          </p>
          <div className="bg-gray-200 text-gray-500 py-2 px-4 rounded-lg text-sm font-semibold">
            🔒 Locked
          </div>
        </div>
      )}
    </div>
  );

  if (isUnlocked) {
    return (
      <Link href={`/games/${gameId}`} className="block">
        {content}
      </Link>
    );
  }

  return content;
}