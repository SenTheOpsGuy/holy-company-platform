'use client';

import { useEffect, useRef, useState } from 'react';
import ReactCanvasConfetti from 'react-canvas-confetti';

interface ConfettiEffectProps {
  isActive: boolean;
  onComplete?: () => void;
  duration?: number;
  colors?: string[];
}

export default function ConfettiEffect({ 
  isActive, 
  onComplete, 
  duration = 3000,
  colors = ['#FF6F00', '#D4AF37', '#C62828', '#1976D2', '#00897B', '#5E35B1']
}: ConfettiEffectProps) {
  const refAnimationInstance = useRef<confetti.CreateTypes | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const getInstance = (instance: confetti.CreateTypes) => {
    refAnimationInstance.current = instance;
  };

  const makeShot = (particleRatio: number, opts: any) => {
    refAnimationInstance.current?.({
      ...opts,
      origin: { y: 0.7 },
      particleCount: Math.floor(200 * particleRatio),
      colors: colors
    });
  };

  const fire = () => {
    makeShot(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    makeShot(0.2, {
      spread: 60,
    });

    makeShot(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    makeShot(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    makeShot(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  useEffect(() => {
    if (isActive) {
      // Fire immediately
      fire();

      // Fire multiple times during the duration
      const id = setInterval(() => {
        fire();
      }, 500);

      setIntervalId(id);

      // Complete after duration
      const timeout = setTimeout(() => {
        if (intervalId) {
          clearInterval(intervalId);
          setIntervalId(null);
        }
        onComplete?.();
      }, duration);

      return () => {
        clearTimeout(timeout);
        if (id) {
          clearInterval(id);
        }
      };
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }
  }, [isActive, duration, onComplete]);

  return (
    <ReactCanvasConfetti
      refConfetti={getInstance}
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        zIndex: 9999
      }}
    />
  );
}

// Alternative simpler confetti for specific celebrations
export function SimpleConfetti({ trigger }: { trigger: boolean }) {
  const refAnimationInstance = useRef<confetti.CreateTypes | null>(null);

  const getInstance = (instance: confetti.CreateTypes) => {
    refAnimationInstance.current = instance;
  };

  useEffect(() => {
    if (trigger && refAnimationInstance.current) {
      refAnimationInstance.current({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6F00', '#D4AF37', '#C62828']
      });
    }
  }, [trigger]);

  return (
    <ReactCanvasConfetti
      refConfetti={getInstance}
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        zIndex: 1000
      }}
    />
  );
}