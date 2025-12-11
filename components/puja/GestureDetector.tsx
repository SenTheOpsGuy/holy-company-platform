'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { detectGesture } from '@/lib/gestures';

interface GestureDetectorProps {
  deity: {
    name: string;
    icon: string;
  };
  onGestureComplete: (gestureType: string) => void;
}

export default function GestureDetector({ deity, onGestureComplete }: GestureDetectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastGesture, setLastGesture] = useState<string | null>(null);
  const [touchTrail, setTouchTrail] = useState<{ x: number; y: number; id: number }[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchPoints: { x: number; y: number; time: number }[] = [];
    let trailId = 0;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      setIsDetecting(true);
      touchPoints = [];
      setTouchTrail([]);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      
      const point = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        time: Date.now()
      };
      
      touchPoints.push(point);
      
      // Add to visual trail
      setTouchTrail(prev => [
        ...prev.slice(-20), // Keep last 20 points
        { x: point.x, y: point.y, id: trailId++ }
      ]);
      
      // Keep only recent points for gesture detection
      if (touchPoints.length > 50) {
        touchPoints = touchPoints.slice(-50);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      setIsDetecting(false);
      
      if (touchPoints.length > 5) {
        const gestureType = detectGesture(touchPoints);
        if (gestureType) {
          setLastGesture(gestureType);
          onGestureComplete(gestureType);
          
          // Clear trail after a delay
          setTimeout(() => {
            setTouchTrail([]);
          }, 1000);
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onGestureComplete]);

  return (
    <div
      ref={containerRef}
      className={`
        relative w-full h-64 border-2 border-dashed rounded-xl touch-none select-none overflow-hidden
        ${isDetecting ? 'border-saffron bg-saffron/5' : 'border-gray-300 bg-gray-50'}
        transition-all duration-300
      `}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">{deity.icon}</div>
          <p className="text-sm text-gray-600">
            {isDetecting ? 'Detecting gesture...' : 'Touch and gesture here'}
          </p>
        </div>
      </div>

      {/* Touch Trail */}
      {touchTrail.map((point, index) => (
        <motion.div
          key={point.id}
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 0.3, opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute w-4 h-4 bg-saffron rounded-full pointer-events-none"
          style={{
            left: point.x - 8,
            top: point.y - 8,
            zIndex: touchTrail.length - index
          }}
        />
      ))}

      {/* Gesture Feedback */}
      {lastGesture && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center bg-green-500/90 text-white"
        >
          <div className="text-center">
            <div className="text-6xl mb-2">✨</div>
            <p className="text-lg font-bold">
              {lastGesture.charAt(0).toUpperCase() + lastGesture.slice(1)} Gesture Detected!
            </p>
          </div>
        </motion.div>
      )}

      {/* Active Detection Indicator */}
      {isDetecting && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-saffron rounded-full animate-pulse" />
        </div>
      )}

      {/* Gesture Instructions */}
      <div className="absolute bottom-2 left-2 right-2">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs text-center text-gray-700">
          Try: Swipe, Circle, Tap, or Hold gestures
        </div>
      </div>
    </div>
  );
}