'use client';

import { useState, useRef, useEffect } from 'react';
import { PUJA_STEPS, PUNYA_REWARDS } from '@/lib/constants';
import { GestureDetector, TiltDetector } from '@/lib/gestures';

interface PujaRitualProps {
  deity: {
    id: string;
    name: string;
    icon: string;
    description: string;
    color: string;
    blessings: string[];
  };
  user: {
    id: string;
    punyaBalance: number;
    currentStreak: number;
  };
  offeringTiers: Array<{
    amount: number;
    punyaBonus: number;
    label: string;
  }>;
}

export default function PujaRitual({ deity, user, offeringTiers }: PujaRitualProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [selectedOffering, setSelectedOffering] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  
  const gestureDetector = useRef(new GestureDetector());
  const tiltDetector = useRef(new TiltDetector());
  const gestureAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Request permission for device motion
    tiltDetector.current.requestPermission();
  }, []);

  const currentPujaStep = PUJA_STEPS[currentStep];

  const handleGestureStart = () => {
    setIsDetecting(true);
    setFeedback(`Perform: ${currentPujaStep.instruction}`);
    
    // Setup gesture detection based on step type
    if (gestureAreaRef.current) {
      const element = gestureAreaRef.current;
      
      if (currentPujaStep.gesture === 'tilt') {
        const cleanup = tiltDetector.current.detectTilt(({ beta, gamma }) => {
          // Check if tilted enough (> 30 degrees)
          if (Math.abs(beta) > 30 || Math.abs(gamma) > 30) {
            handleGestureComplete();
            cleanup?.();
          }
        });
      } else {
        element.addEventListener('touchstart', handleTouchStart);
        element.addEventListener('touchmove', handleTouchMove);
        element.addEventListener('touchend', handleTouchEnd);
      }
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    if (currentPujaStep.gesture === 'hold-drag') {
      gestureDetector.current.onTouchStart(e, () => {
        setFeedback('Great! Now drag to complete the gesture.');
      });
    } else {
      gestureDetector.current.onTouchStart(e);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    gestureDetector.current.onTouchMove(e);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    const gesture = gestureDetector.current.onTouchEnd(e);
    
    if (gesture === currentPujaStep.gesture || 
        (currentPujaStep.gesture === 'hold-drag' && gesture === 'drag') ||
        (currentPujaStep.gesture === 'rhythm-tap' && gesture === 'tap')) {
      handleGestureComplete();
    } else if (gesture) {
      setFeedback(`Try again: ${currentPujaStep.instruction}`);
      setTimeout(() => {
        setFeedback(`Perform: ${currentPujaStep.instruction}`);
      }, 2000);
    }
  };

  const handleGestureComplete = () => {
    setIsDetecting(false);
    setFeedback('Perfect! (');
    
    // Mark step as completed
    setCompletedSteps(prev => [...prev, currentStep]);
    
    // Trigger haptic feedback
    gestureDetector.current.triggerHapticFeedback(100);
    
    // Remove event listeners
    if (gestureAreaRef.current) {
      const element = gestureAreaRef.current;
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    }
    
    // Auto advance to next step after delay
    setTimeout(() => {
      if (currentStep < PUJA_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
        setFeedback('');
      } else {
        // All steps completed
        setIsCompleted(true);
        setFeedback('Puja completed! You may now make an offering.');
      }
    }, 1500);
  };

  const handleOfferingSelect = (amount: number) => {
    setSelectedOffering(amount);
  };

  const handleCompletePuja = async () => {
    try {
      const response = await fetch('/api/pujas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deityName: deity.name,
          steps: completedSteps,
          gestures: completedSteps.map((stepIndex) => PUJA_STEPS[stepIndex].gesture),
          offeringAmount: selectedOffering || 0,
          duration: Math.round((Date.now() - startTime) / 1000),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Puja completed! You earned ${data.puja.punyaEarned} punya points. Current streak: ${data.puja.newStreak} days.`);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error completing puja:', error);
      alert('Failed to complete puja. Please try again.');
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'pending';
  };

  return (
    <div className="space-y-6">
      {/* Step Progress */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-playfair font-bold text-deep-brown mb-4 text-center">
          Sacred Ritual Steps
        </h3>
        
        <div className="space-y-4">
          {PUJA_STEPS.map((step, index) => {
            const status = getStepStatus(index);
            return (
              <div key={step.id} className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                status === 'completed' ? 'bg-green-100 border-2 border-green-300' :
                status === 'current' ? 'bg-saffron/20 border-2 border-saffron' :
                'bg-gray-50 border-2 border-gray-200'
              }`}>
                <div className={`text-2xl ${
                  status === 'completed' ? 'grayscale-0' : 
                  status === 'current' ? 'animate-pulse' : 'grayscale'
                }`}>
                  {status === 'completed' ? '' : step.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-deep-brown">{step.name}</h4>
                  <p className="text-sm text-deep-brown/60">{step.instruction}</p>
                </div>
                {status === 'current' && (
                  <button
                    onClick={handleGestureStart}
                    disabled={isDetecting}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      isDetecting 
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                        : 'bg-saffron text-deep-brown hover:bg-gold'
                    }`}
                  >
                    {isDetecting ? 'Detecting...' : 'Start'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Gesture Detection Area */}
      {currentStep < PUJA_STEPS.length && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-playfair font-bold text-deep-brown mb-4 text-center">
            Gesture Detection Zone
          </h3>
          
          <div
            ref={gestureAreaRef}
            className={`min-h-64 border-4 border-dashed rounded-xl flex items-center justify-center text-center transition-all ${
              isDetecting ? 'border-saffron bg-saffron/10' : 'border-gray-300 bg-gray-50'
            }`}
          >
            <div>
              <div className="text-6xl mb-4">{currentPujaStep?.icon || '=O'}</div>
              <p className="text-lg font-semibold text-deep-brown mb-2">
                {currentPujaStep?.name}
              </p>
              <p className="text-deep-brown/70">
                {feedback || currentPujaStep?.instruction}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Offering Selection */}
      {isCompleted && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-playfair font-bold text-deep-brown mb-4 text-center">
            Make an Offering (Optional)
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {offeringTiers.map((tier) => (
              <button
                key={tier.amount}
                onClick={() => handleOfferingSelect(tier.amount)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedOffering === tier.amount
                    ? 'border-saffron bg-saffron/20'
                    : 'border-gray-300 hover:border-saffron/50'
                }`}
              >
                <div className="text-2xl mb-2">>�</div>
                <div className="font-bold text-deep-brown">{tier.label}</div>
                <div className="text-sm text-deep-brown/60">+{tier.punyaBonus} punya</div>
              </button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleCompletePuja}
              className="bg-green-600 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:bg-green-700 transition-colors"
            >
              Complete Puja & Earn Punya (
            </button>
            <p className="text-sm text-deep-brown/60 mt-2">
              Base reward: {PUNYA_REWARDS.DAILY_PUJA} punya points
            </p>
          </div>
        </div>
      )}
    </div>
  );
}