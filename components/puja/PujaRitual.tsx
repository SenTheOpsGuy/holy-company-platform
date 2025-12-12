'use client';

import { useState, useRef, useEffect } from 'react';
import { PUNYA_REWARDS } from '@/lib/constants';

interface PujaRitualProps {
  deity: {
    id: string;
    name: string;
    subtitle: string;
    icon: string;
    description: string;
    color: string;
    blessings: string[];
  };
  user: any;
  offeringTiers: any[];
  onComplete: (result: { punyaEarned: number; stepsCompleted: any[]; gesturesPerformed: any[]; offeringAmount?: number }) => void;
}

const PUJA_SEQUENCE = [
  { id: 'diya', name: 'Light Diya', icon: '🪔', instruction: 'Begin by lighting the sacred diya to invoke divine presence' },
  { id: 'incense', name: 'Light Incense', icon: '🕯️', instruction: 'Light the incense sticks to purify the atmosphere' },
  { id: 'flowers', name: 'Offer Flowers', icon: '🌺', instruction: 'Place fresh flowers as a symbol of devotion and beauty' },
  { id: 'water', name: 'Offer Water', icon: '💧', instruction: 'Pour clean water to purify and refresh' },
  { id: 'prasad', name: 'Offer Prasad', icon: '🍯', instruction: 'Present sweets or fruits as nourishment offering' },
  { id: 'chant', name: 'Chant Mantras', icon: '🕉️', instruction: 'Recite sacred mantras with focused mind' },
  { id: 'aarti', name: 'Perform Aarti', icon: '🔥', instruction: 'Wave the lamp in circular motions while singing hymns' },
  { id: 'chadava', name: 'Offer Chadava', icon: '💰', instruction: 'Make a monetary offering as per your devotion' }
];

export default function PujaRitual({ deity, user, offeringTiers, onComplete }: PujaRitualProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState('');
  const [punyaEarned, setPunyaEarned] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [offeringAmount, setOfferingAmount] = useState<number>(0);
  const [showOffering, setShowOffering] = useState(false);
  const [isDiyaLit, setIsDiyaLit] = useState(false);
  const msgTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Audio functions (disabled for deployment compatibility)
  const playChime = () => console.log('🔔 Bell sound');
  const playShankh = () => console.log('🐚 Shankh sound');  
  const playDrum = () => console.log('🥁 Drum sound');
  const playOffering = () => console.log('🎵 Offering sound');

  useEffect(() => {
    // Audio initialization disabled for deployment compatibility
    console.log('Audio would be initialized here');
  }, []);

  const playOfferingChimes = () => {
    if (false) { // if (isAudioEnabled && offeringSynthRef.current) {
      const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
      let time = Date.now() / 1000;
      
      notes.forEach((note, i) => {
        // offeringSynthRef.current.triggerAttackRelease(note, "8n", time + (i * 0.15));
      });
    }
  };

  const completeStep = (stepIndex: number) => {
    if (completedSteps.has(stepIndex)) return;

    const newCompleted = new Set(completedSteps);
    newCompleted.add(stepIndex);
    setCompletedSteps(newCompleted);

    const step = PUJA_SEQUENCE[stepIndex];
    const stepPunya = (PUNYA_REWARDS as any)[deity.id] || 50;
    
    if (step.id === 'diya') {
      setIsDiyaLit(true);
      // if (isAudioEnabled && bellSynthRef.current) {
      //   bellSynthRef.current.triggerAttackRelease(["C4", "E4", "G4", "C5"], "2n");
      // }
    }

    if (step.id === 'chadava') {
      setShowOffering(true);
      // if (isAudioEnabled && offeringSynthRef.current) {
      //   offeringSynthRef.current.triggerAttackRelease(["C4", "E4", "G4"], "0.5");
      // }
      return;
    }

    setPunyaEarned(prev => prev + stepPunya);
    setMessage(`✨ +${stepPunya} punya earned from ${step.name}!`);
    
    // if (isAudioEnabled && offeringSynthRef.current) {
    //   offeringSynthRef.current.triggerAttackRelease(["G4", "B4", "D5"], "0.5");
    // }

    if (msgTimeoutRef.current) {
      clearTimeout(msgTimeoutRef.current);
    }
    msgTimeoutRef.current = setTimeout(() => setMessage(''), 3000);

    // Auto-advance to next step
    if (stepIndex < PUJA_SEQUENCE.length - 1) {
      setTimeout(() => setCurrentStep(stepIndex + 1), 1500);
    }
  };

  const handleOfferingComplete = (amount: number) => {
    setOfferingAmount(amount);
    setShowOffering(false);
    
    const newCompleted = new Set(completedSteps);
    newCompleted.add(7); // chadava step
    setCompletedSteps(newCompleted);

    const offeringPunya = Math.floor(amount * 0.1);
    setPunyaEarned(prev => prev + offeringPunya);
    setMessage(`🙏 Thank you for your offering of ₹${amount}! +${offeringPunya} punya earned!`);
    
    playOfferingChimes();

    if (msgTimeoutRef.current) {
      clearTimeout(msgTimeoutRef.current);
    }
    msgTimeoutRef.current = setTimeout(() => setMessage(''), 4000);

    // Complete the puja after offering
    setTimeout(() => {
      const totalPunya = punyaEarned + offeringPunya;
      onComplete({
        punyaEarned: totalPunya,
        stepsCompleted: PUJA_SEQUENCE.filter((_, i) => newCompleted.has(i)).map(step => step.id),
        gesturesPerformed: [],
        offeringAmount: amount
      });
    }, 2000);
  };

  const toggleAudio = () => {
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);
  };

  const currentStepData = PUJA_SEQUENCE[currentStep];
  const isCurrentStep = (index: number) => index === currentStep;
  const isStepCompleted = (index: number) => completedSteps.has(index);
  const canCompleteStep = (index: number) => {
    if (index === 0) return true; // Can always start with diya
    return completedSteps.has(index - 1); // Must complete previous step
  };

  const getDeityImage = () => {
    const images = {
      ganesha: '/images/ganesha-deity.jpg',
      shiva: '/images/shiva-deity.jpg',
      lakshmi: '/images/lakshmi-deity.jpg',
      hanuman: '/images/hanuman-deity.jpg',
      krishna: '/images/krishna-deity.jpg',
      ram: '/images/ram-deity.jpg',
      durga: '/images/durga-deity.jpg',
      saraswati: '/images/saraswati-deity.jpg'
    };
    return images[deity.id as keyof typeof images] || '/images/default-deity.jpg';
  };

  if (showOffering) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-playfair font-bold text-deep-brown mb-2">
            Make an Offering
          </h2>
          <p className="text-deep-brown/70">
            Complete your puja with a heartfelt offering
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {[11, 51, 101, 501, 1001].map((amount) => (
            <button
              key={amount}
              onClick={() => handleOfferingComplete(amount)}
              className="w-full p-4 border-2 border-saffron/30 rounded-xl hover:border-saffron hover:bg-saffron/10 transition-all duration-200 text-center"
            >
              <div className="text-xl font-bold text-deep-brown">₹{amount}</div>
              <div className="text-sm text-deep-brown/60">+{Math.floor(amount * 0.1)} punya</div>
            </button>
          ))}
        </div>

        <button
          onClick={() => handleOfferingComplete(0)}
          className="w-full py-3 text-deep-brown/60 hover:text-deep-brown transition-colors"
        >
          Skip offering for now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-saffron/20 to-gold/20 flex items-center justify-center text-4xl">
          {deity.icon}
        </div>
        <h2 className="text-2xl font-playfair font-bold text-deep-brown mb-1">
          Puja for {deity.name}
        </h2>
        <p className="text-deep-brown/70 text-sm">{deity.subtitle}</p>
        <div className="mt-2 flex items-center justify-center gap-4 text-sm">
          <span className="text-saffron font-medium">+{punyaEarned} punya earned</span>
          <button
            onClick={toggleAudio}
            className={`px-3 py-1 rounded-full text-xs ${
              isAudioEnabled ? 'bg-saffron/20 text-saffron' : 'bg-gray-200 text-gray-600'
            }`}
          >
            🔊 {isAudioEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-deep-brown/60 mb-2">
          <span>Progress</span>
          <span>{completedSteps.size}/{PUJA_SEQUENCE.length} steps</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-saffron to-gold h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps.size / PUJA_SEQUENCE.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Step */}
      {currentStepData && (
        <div className="mb-6 p-4 bg-gradient-to-r from-saffron/10 to-gold/10 rounded-xl border-l-4 border-saffron">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{currentStepData.icon}</span>
            <h3 className="font-playfair font-bold text-deep-brown">
              {currentStepData.name}
            </h3>
          </div>
          <p className="text-sm text-deep-brown/80 leading-relaxed">
            {currentStepData.instruction}
          </p>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center text-green-800 text-sm font-medium">
          {message}
        </div>
      )}

      {/* Steps Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {PUJA_SEQUENCE.map((step, index) => {
          const completed = isStepCompleted(index);
          const current = isCurrentStep(index);
          const canComplete = canCompleteStep(index);
          
          return (
            <button
              key={step.id}
              onClick={() => canComplete && !completed && completeStep(index)}
              disabled={!canComplete || completed}
              className={`
                aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 transition-all duration-300
                ${completed 
                  ? 'bg-green-50 border-green-300 text-green-800' 
                  : current 
                    ? 'bg-saffron/20 border-saffron text-deep-brown shadow-lg scale-105' 
                    : canComplete
                      ? 'bg-white border-gray-200 text-deep-brown hover:border-saffron/50 hover:bg-saffron/5'
                      : 'bg-gray-50 border-gray-200 text-gray-400'
                }
                ${step.id === 'diya' && isDiyaLit && current ? 'animate-pulse' : ''}
              `}
            >
              <span className={`text-lg mb-1 ${step.id === 'diya' && isDiyaLit && current ? 'animate-bounce' : ''}`}>
                {step.icon}
              </span>
              <span className="text-xs text-center leading-tight font-medium">
                {step.name}
              </span>
              {completed && (
                <span className="text-xs mt-1">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Audio Controls */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          onClick={playChime}
          className="py-2 px-3 bg-gold/20 text-deep-brown rounded-lg text-sm font-medium hover:bg-gold/30 transition-colors"
        >
          🔔 Bell
        </button>
        <button
          onClick={playShankh}
          className="py-2 px-3 bg-gold/20 text-deep-brown rounded-lg text-sm font-medium hover:bg-gold/30 transition-colors"
        >
          🐚 Shankh
        </button>
        <button
          onClick={playDrum}
          className="py-2 px-3 bg-gold/20 text-deep-brown rounded-lg text-sm font-medium hover:bg-gold/30 transition-colors"
        >
          🥁 Drum
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center text-xs text-deep-brown/60 leading-relaxed">
        Tap each step in sequence to complete your puja ritual. 
        {!completedSteps.has(0) && ' Start by lighting the diya.'}
      </div>
    </div>
  );
}