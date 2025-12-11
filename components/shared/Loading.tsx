'use client';

import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'spiritual';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export default function Loading({
  size = 'md',
  variant = 'spiritual',
  text,
  className,
  fullScreen = false
}: LoadingProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const SpinnerLoader = () => (
    <div className={cn(
      'animate-spin rounded-full border-4 border-deep-brown/20 border-t-saffron',
      sizes[size]
    )} />
  );

  const DotsLoader = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full bg-saffron animate-pulse',
            size === 'sm' ? 'w-1 h-1' :
            size === 'md' ? 'w-2 h-2' :
            size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );

  const PulseLoader = () => (
    <div className={cn(
      'rounded-full bg-saffron animate-pulse',
      sizes[size]
    )} />
  );

  const SpiritualLoader = () => (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Outer ring */}
        <div className={cn(
          'absolute inset-0 rounded-full border-4 border-saffron/30 animate-ping',
          sizes[size]
        )} />
        
        {/* Middle ring */}
        <div className={cn(
          'absolute inset-1 rounded-full border-2 border-gold/50 animate-pulse',
          size === 'sm' ? 'w-2 h-2' :
          size === 'md' ? 'w-6 h-6' :
          size === 'lg' ? 'w-8 h-8' : 'w-12 h-12'
        )}
        style={{ animationDelay: '0.5s' }} />
        
        {/* Center symbol */}
        <div className={cn(
          'flex items-center justify-center rounded-full bg-gradient-to-r from-saffron to-gold',
          sizes[size],
          size === 'sm' ? 'text-xs' :
          size === 'md' ? 'text-lg' :
          size === 'lg' ? 'text-2xl' : 'text-3xl'
        )}>
          <span className="animate-pulse text-deep-brown">🕉️</span>
        </div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gold rounded-full animate-bounce opacity-60"
            style={{
              top: `${Math.sin(i * Math.PI / 3) * 30 + 20}px`,
              left: `${Math.cos(i * Math.PI / 3) * 30 + 20}px`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return <SpinnerLoader />;
      case 'dots':
        return <DotsLoader />;
      case 'pulse':
        return <PulseLoader />;
      case 'spiritual':
      default:
        return <SpiritualLoader />;
    }
  };

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center',
      className
    )}>
      <div className="mb-4">
        {renderLoader()}
      </div>
      
      {text && (
        <p className={cn(
          'text-deep-brown/70 font-medium text-center',
          textSizes[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-deep-brown/10">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

// Preset loading states for common scenarios
export const LoadingStates = {
  pujaLoading: () => (
    <Loading
      variant="spiritual"
      size="lg"
      text="Preparing your sacred space..."
    />
  ),
  
  gameLoading: () => (
    <Loading
      variant="dots"
      size="md"
      text="Loading game..."
    />
  ),
  
  contentLoading: () => (
    <Loading
      variant="pulse"
      size="md"
      text="Loading content..."
    />
  ),
  
  saving: () => (
    <Loading
      variant="spinner"
      size="sm"
      text="Saving..."
    />
  ),
  
  blessingGeneration: () => (
    <Loading
      variant="spiritual"
      size="xl"
      text="Generating your divine blessing..."
      fullScreen
    />
  ),
  
  paymentProcessing: () => (
    <Loading
      variant="spiritual"
      size="lg"
      text="Processing your offering..."
      fullScreen
    />
  )
};

// Simple inline loading spinner for buttons
export function ButtonLoading({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <div className={cn(
      'animate-spin rounded-full border-2 border-current border-t-transparent',
      size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
    )} />
  );
}