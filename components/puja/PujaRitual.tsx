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
}

const PUJA_SEQUENCE = [
  { id: 'diya', name: 'Light Diya', icon: '🪔', instruction: 'Begin by lighting the sacred diya to invoke divine presence', img: '/images/diya.png' },
  { id: 'agarbatti', name: 'Incense', icon: '🕯️', instruction: 'Light the incense sticks to purify the atmosphere', img: '/images/incense.png' },
  { id: 'flower', name: 'Flowers', icon: '🌺', instruction: 'Place fresh flowers as a symbol of devotion and beauty', img: '/images/flower.png' },
  { id: 'milk', name: 'Offer Milk', icon: '🥛', instruction: 'Pour sacred milk for abhishekam', img: '/images/milk.png' },
  { id: 'bell', name: 'Ring Bell', icon: '🔔', instruction: 'Ring the bell to invoke divine presence', img: '/images/bell.png' },
  { id: 'shankh', name: 'Shankh', icon: '🐚', instruction: 'Blow the conch to purify the environment', img: '/images/shankh.png' },
  { id: 'nagada', name: 'Nagada', icon: '🥁', instruction: 'Beat the drum in rhythm with devotion', img: '/images/nagada.png' },
  { id: 'chadava', name: 'Chadava', icon: '💰', instruction: 'Make a monetary offering as per your devotion', img: '/images/chadava.png' }
];

const BLESSINGS = [
  "May your path be illuminated with wisdom and joy.",
  "Strength does not come from physical capacity. It comes from an indomitable will.",
  "Peace comes from within. Do not seek it without.",
  "Your devotion creates ripples of positivity in the universe.",
  "The universe is always working in your favor. Have faith."
];

export default function PujaRitual({ deity, user, offeringTiers }: PujaRitualProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState(`You have chosen ${deity.name}. Your puja begins now. Follow the guided steps.`);
  const [punyaEarned, setPunyaEarned] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [offeringAmount, setOfferingAmount] = useState<number>(0);
  const [showOffering, setShowOffering] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [isDiyaLit, setIsDiyaLit] = useState(false);
  const [auraVisible, setAuraVisible] = useState(false);
  const [flowerHeap, setFlowerHeap] = useState<Array<{ id: number; rotation: number; scale: number }>>([]);
  const [milkStream, setMilkStream] = useState(false);
  const msgTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hasShownCompletion, setHasShownCompletion] = useState(false);
  const [pujaStarted, setPujaStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes total
  const [stepTimeRemaining, setStepTimeRemaining] = useState(45); // 45 seconds per step
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Audio functions (disabled for deployment compatibility)
  const playChime = () => console.log('🔔 Bell sound');
  const playShankh = () => console.log('🐚 Shankh sound');  
  const playDrum = () => console.log('🥁 Drum sound');
  const playOffering = () => console.log('🎵 Offering sound');

  useEffect(() => {
    // Audio initialization disabled for deployment compatibility
    console.log('Audio would be initialized here');
    
    // Check for successful payment
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment');
    const paymentAmount = urlParams.get('amount');
    
    if (paymentSuccess === 'success' && paymentAmount) {
      // Handle successful payment
      handleOfferingComplete(parseInt(paymentAmount));
      // Clear URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      return;
    }
    
    // Start puja automatically
    startPuja();
    
    return () => {
      // Cleanup timers
      if (timerRef.current) clearInterval(timerRef.current);
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      if (msgTimeoutRef.current) clearTimeout(msgTimeoutRef.current);
    };
  }, []);

  const startPuja = () => {
    setPujaStarted(true);
    setCurrentStepIndex(0);
    showCurrentStepPrompt();
    
    // Start overall timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          endPuja(false); // Time's up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Start step timer
    startStepTimer();
  };

  const startStepTimer = () => {
    setStepTimeRemaining(45);
    
    stepTimerRef.current = setInterval(() => {
      setStepTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-advance to next step or prompt user
          handleStepTimeout();
          return 45; // Reset for next step
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStepTimeout = () => {
    const currentStep = PUJA_SEQUENCE[currentStepIndex];
    
    if (currentStep.id === 'chadava') {
      // Mandatory step - force offering modal
      setShowOffering(true);
      showMessage("⏰ Time's up! Chadava offering is mandatory to complete your puja.");
      return;
    }
    
    if (currentStepIndex < PUJA_SEQUENCE.length - 1) {
      // Move to next step
      setCurrentStepIndex(prev => prev + 1);
      showCurrentStepPrompt();
      showMessage("⏰ Moving to next step. Stay focused on your devotion.");
    } else {
      // Force chadava if we've reached the end
      const chadavaIndex = PUJA_SEQUENCE.findIndex(s => s.id === 'chadava');
      setCurrentStepIndex(chadavaIndex);
      setShowOffering(true);
      showMessage("🙏 Time to complete your puja with the mandatory offering.");
    }
  };

  const showCurrentStepPrompt = () => {
    const step = PUJA_SEQUENCE[currentStepIndex];
    showMessage(`Step ${currentStepIndex + 1}: ${step.instruction}`);
  };

  const playOfferingChimes = () => {
    if (false) { // if (isAudioEnabled && offeringSynthRef.current) {
      const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
      let time = Date.now() / 1000;
      
      notes.forEach((note, i) => {
        // offeringSynthRef.current.triggerAttackRelease(note, "8n", time + (i * 0.15));
      });
    }
  };

  const handleToolClick = (toolId: string) => {
    const currentStep = PUJA_SEQUENCE[currentStepIndex];
    
    // Check if this is the correct step
    if (currentStep.id !== toolId) {
      showMessage(`❌ Please follow the guided sequence. Current step: ${currentStep.name}`);
      return;
    }

    // Add points and track completion
    if (!completedSteps.has(toolId)) {
      const newCompleted = new Set(completedSteps);
      newCompleted.add(toolId);
      setCompletedSteps(newCompleted);
      addPunya(75); // Higher points for following sequence
    }

    // Execute ritual actions
    switch(toolId) {
      case 'diya': performDiya(); break;
      case 'agarbatti': performAgarbatti(); break;
      case 'flower': performFlower(); break;
      case 'milk': performMilk(); break;
      case 'bell': performBell(); break;
      case 'shankh': performShankh(); break;
      case 'nagada': performNagada(); break;
      case 'chadava': setShowOffering(true); return; // Don't advance step yet
    }

    // Move to next step
    if (currentStepIndex < PUJA_SEQUENCE.length - 1) {
      setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
        if (stepTimerRef.current) clearInterval(stepTimerRef.current);
        startStepTimer();
        showCurrentStepPrompt();
      }, 1500);
    }
  };

  const endPuja = (completed: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    
    if (!completed) {
      showMessage("⏰ Time's up! Your puja session has ended. Om Shanti.");
    }
    
    // Force chadava if not completed
    if (!completedSteps.has('chadava')) {
      setTimeout(() => {
        setShowOffering(true);
        showMessage("🙏 Complete your puja with the mandatory Chadava offering.");
      }, 2000);
    } else {
      setShowCompletion(true);
    }
  };

  const addPunya = (points: number) => {
    setPunyaEarned(prev => prev + points);
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    if (msgTimeoutRef.current) {
      clearTimeout(msgTimeoutRef.current);
    }
    msgTimeoutRef.current = setTimeout(() => setMessage(''), 3000);
  };

  // Ritual performance functions
  const performDiya = () => {
    if (!isDiyaLit) {
      setIsDiyaLit(true);
      setAuraVisible(true);
      showMessage("Darkness vanishes before divine light.");
      playChime();
    } else {
      showMessage("The flame burns eternally bright.");
    }
  };

  const performAgarbatti = () => {
    showMessage("The air fills with divine fragrance.");
    playChime();
    // Smoke effect would be handled by CSS animations
  };

  const performFlower = () => {
    showMessage("A shower of flowers for the Divine.");
    playOffering();
    // Add flowers to heap
    const newFlowers = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      rotation: Math.random() * 360,
      scale: 0.6 + Math.random() * 0.4
    }));
    setFlowerHeap(prev => [...prev, ...newFlowers].slice(-25)); // Keep max 25 flowers
  };

  const performMilk = () => {
    showMessage("Abhishekam: Bathe the deity in purity.");
    playOffering();
    setMilkStream(true);
    setTimeout(() => setMilkStream(false), 3000);
  };

  const performBell = () => {
    showMessage("The bell resonates with Om.");
    playChime();
  };

  const performShankh = () => {
    showMessage("The sound of creation purifies all.");
    playShankh();
  };

  const performNagada = () => {
    showMessage("Beating the drums of joy.");
    playDrum();
  };

  const handlePaymentClick = async (amount: number) => {
    if (amount === 0) {
      // Handle free offering
      handleOfferingComplete(0);
      return;
    }

    setPaymentLoading(true);
    setPaymentError('');

    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          deityName: deity.name,
          returnUrl: `${window.location.origin}/puja/${deity.id}/payment-success`
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to payment page
        window.location.href = data.paymentUrl;
      } else {
        setPaymentError(data.error || 'Payment initialization failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('Failed to initialize payment. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleOfferingComplete = (amount: number) => {
    setOfferingAmount(amount);
    setShowOffering(false);
    
    const newCompleted = new Set(completedSteps);
    newCompleted.add('chadava');
    setCompletedSteps(newCompleted);

    const offeringPunya = Math.floor(amount * 0.5);
    setPunyaEarned(prev => prev + offeringPunya);
    
    if (amount > 0) {
      showMessage(`🙏 Thank you for your offering of ₹${amount}! +${offeringPunya} punya earned!`);
    } else {
      showMessage(`🙏 Your devotion is the greatest offering. Puja completed with blessings.`);
    }
    
    playOfferingChimes();

    // Complete the puja after offering
    setTimeout(async () => {
      const totalPunya = punyaEarned + offeringPunya;
      const result = {
        punyaEarned: totalPunya,
        stepsCompleted: Array.from(newCompleted),
        gesturesPerformed: [],
        offeringAmount: amount
      };
      
      console.log('Puja completed:', result);
      
      try {
        const response = await fetch('/api/pujas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deityName: deity.name,
            steps: Array.from(newCompleted),
            gestures: result.gesturesPerformed,
            offeringAmount: result.offeringAmount || 0,
            duration: Math.max(60, 300 - timeRemaining), // Actual duration or minimum 60 seconds
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Puja saved successfully:', data);
          setMessage(`✨ Puja completed! You earned ${totalPunya} punya points!`);
          setShowCompletion(true);
        } else {
          console.error('Failed to save puja:', await response.text());
          setMessage(`❗ Puja completed but failed to save. You earned ${totalPunya} punya points!`);
          setShowCompletion(true);
        }
      } catch (error) {
        console.error('Error saving puja:', error);
        setMessage(`❗ Puja completed but failed to save. You earned ${totalPunya} punya points!`);
        setShowCompletion(true);
      }
    }, 2000);
  };

  const toggleAudio = () => {
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);
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

  const restartPuja = () => {
    // Clear all timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    if (msgTimeoutRef.current) clearTimeout(msgTimeoutRef.current);
    
    // Reset all state
    setShowCompletion(false);
    setCompletedSteps(new Set());
    setHasShownCompletion(false);
    setPunyaEarned(0);
    setIsDiyaLit(false);
    setAuraVisible(false);
    setFlowerHeap([]);
    setMilkStream(false);
    setCurrentStepIndex(0);
    setTimeRemaining(300);
    setStepTimeRemaining(45);
    setPujaStarted(false);
    
    // Restart puja
    startPuja();
  };

  return (
    <div className="h-screen w-screen overflow-hidden text-stone-800 flex flex-col bg-orange-50 relative">

      {/* Audio Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={toggleAudio}
          className="bg-orange-600 text-white p-2 rounded-full shadow-lg hover:bg-orange-700 transition"
        >
{isAudioEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {/* Temple Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40">
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1604882737275-ef280c8a4ba9?w=1200')] bg-cover bg-center opacity-60"></div>
        </div>
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-30 bg-gradient-to-b from-black/70 to-transparent">
        <button className="text-white hover:text-orange-300 transition flex items-center gap-1">
          <span>←</span>
          <span className="hidden md:inline">Back</span>
        </button>
        
        <div className="flex flex-col items-center gap-2">
          <div className="bg-black/40 px-4 py-1 rounded-full border border-yellow-500/50 backdrop-blur-md">
            <span className="text-yellow-400 font-bold flex items-center gap-2">
              <span className="text-sm">✨</span>
              <span>{punyaEarned}</span> Punya
            </span>
          </div>
          
          {/* Timer Display */}
          <div className="flex gap-2 text-xs">
            <div className="bg-red-500/20 px-2 py-1 rounded border border-red-500/50">
              <span className="text-red-300">⏰ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="bg-orange-500/20 px-2 py-1 rounded border border-orange-500/50">
              <span className="text-orange-300">⏱️ {stepTimeRemaining}s</span>
            </div>
          </div>
          
          {/* Current Step Indicator */}
          <div className="bg-blue-500/20 px-3 py-1 rounded border border-blue-500/50">
            <span className="text-blue-300 text-xs font-medium">
              Step {currentStepIndex + 1}/{PUJA_SEQUENCE.length}: {PUJA_SEQUENCE[currentStepIndex]?.name}
            </span>
          </div>
        </div>
        <div className="w-8"></div>
      </div>

      {/* Deity Center Stage */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none pb-24">
        <div className="relative w-full max-w-lg aspect-[3/4] md:aspect-[1/1] flex items-center justify-center">
          {/* Aura */}
          <div 
            className={`absolute w-[80%] h-[80%] rounded-full bg-yellow-500/30 blur-3xl transition-all duration-1000 ${
              auraVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
          />
          
          {/* Milk Overlay */}
          <div 
            className={`absolute inset-0 bg-white mix-blend-overlay rounded-full blur-md z-25 pointer-events-none ${
              milkStream ? 'milk-overlay-active opacity-50' : 'opacity-0'
            }`}
          />

          {/* Deity Image */}
          <img 
            src={getDeityImage()} 
            className="relative z-20 h-[85%] object-contain drop-shadow-[0_0_30px_rgba(255,200,0,0.3)] transition-all duration-700 transform scale-95 float-anim" 
            alt={deity.name}
          />
          
          {/* Milk Stream */}
          <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-12 h-[110%] z-30 pointer-events-none overflow-hidden">
            <div 
              className={`w-full bg-gradient-to-b from-white via-white/90 to-transparent rounded-b-full blur-[2px] ${
                milkStream ? 'milk-stream-active h-full opacity-100' : 'h-0 opacity-0'
              }`}
            />
          </div>
         
          {/* Flower Heap */}
          <div className="absolute bottom-0 w-full h-32 flex justify-center items-end flex-wrap gap-1 z-25 pointer-events-none transition-opacity duration-1000">
            {flowerHeap.map((flower) => (
              <span
                key={flower.id}
                className="text-lg md:text-xl transition-transform"
                style={{
                  transform: `rotate(${flower.rotation}deg) scale(${flower.scale})`,
                  marginLeft: `${(Math.random() - 0.5) * 10}px`,
                  marginBottom: `${Math.random() * 5}px`
                }}
              >
                🌺
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Guide Message */}
      <div className="absolute bottom-32 md:bottom-28 left-1/2 transform -translate-x-1/2 z-40 max-w-xs md:max-w-md mx-4">
        <div className="bg-black/80 text-yellow-100 px-4 py-3 rounded-lg text-sm md:text-base text-center backdrop-blur-md border border-white/20 shadow-lg transition-all duration-300">
          {message}
        </div>
      </div>

      {/* Tool Container */}
      <div className="absolute bottom-0 left-0 right-0 z-50">
        <div className="bg-gradient-to-t from-stone-900 via-stone-900/95 to-transparent pt-6 pb-4 px-2 overflow-x-auto">
          <div className="flex justify-center gap-4 md:gap-8 min-w-max px-4">
            {PUJA_SEQUENCE.map((tool, index) => {
              const completed = completedSteps.has(tool.id);
              const isCurrentStep = index === currentStepIndex;
              const isLit = tool.id === 'diya' && isDiyaLit;
              
              return (
                <div key={tool.id} className="flex flex-col items-center gap-2 group">
                  <button
                    onClick={() => handleToolClick(tool.id)}
                    className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full border-2 flex items-center justify-center shadow-lg transition-all duration-300 overflow-hidden active:scale-95 ${
                      isCurrentStep 
                        ? 'bg-yellow-600 border-yellow-400 animate-pulse scale-110' 
                        : completed
                        ? 'bg-green-600 border-green-400'
                        : 'bg-stone-800 border-yellow-600/30 hover:border-yellow-400 hover:bg-stone-700 hover:-translate-y-2'
                    }`}
                  >
                    <span 
                      className={`text-2xl md:text-3xl relative z-10 transition group-hover:scale-110 ${
                        isLit ? 'flame-active' : ''
                      } ${completed ? 'filter brightness-125' : ''} ${
                        isCurrentStep ? 'text-black font-bold' : 'text-white'
                      }`}
                    >
                      {tool.icon}
                    </span>
                    <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition" />
                    {completed && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-white text-xs flex items-center justify-center">
                        ✓
                      </div>
                    )}
                    {isCurrentStep && !completed && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center animate-ping">
                        !
                      </div>
                    )}
                  </button>
                  <span className={`text-xs font-medium transition text-center ${
                    isCurrentStep 
                      ? 'text-yellow-300 font-bold' 
                      : completed 
                      ? 'text-green-300' 
                      : 'text-stone-400 group-hover:text-yellow-400'
                  }`}>
                    {tool.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Offering Modal */}
      {showOffering && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-sm p-6 shadow-2xl transform translate-y-0 transition-transform">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-orange-800">Offer Chadava</h3>
              <button 
                onClick={() => setShowOffering(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <span>✕</span>
              </button>
            </div>
            <p className="text-sm text-stone-600 mb-6">Make a sacred offering to complete your puja. Payments are secured by Cashfree.</p>
            
            {paymentError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {paymentError}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[11, 21, 51, 101].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handlePaymentClick(amount)}
                  disabled={paymentLoading}
                  className="p-3 border border-orange-200 rounded-lg hover:bg-orange-50 hover:border-orange-500 transition text-center group bg-white font-bold text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <>
                      ₹{amount}
                      <span className="block text-xs text-stone-500 font-normal">
                        +{Math.floor(amount * 0.5)} Punya
                      </span>
                    </>
                  )}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => handlePaymentClick(0)}
              disabled={paymentLoading}
              className="w-full py-2 text-stone-500 hover:text-stone-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paymentLoading ? 'Processing...' : 'Skip offering for now'}
            </button>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {showCompletion && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl transform transition-all duration-500">
            <div className="bg-orange-600 p-4 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 opacity-20"></div>
              <h2 className="text-2xl text-white font-bold relative z-10">Pooja Completed!</h2>
              <p className="text-orange-100 text-sm relative z-10">Blessings Received</p>
            </div>
            
            <div className="p-6 flex flex-col items-center">
              <div className="w-full bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 relative">
                <div className="text-center">
                  <h3 className="text-xl text-orange-800 font-bold mb-1">Daily Blessing</h3>
                  <p className="text-stone-600 italic text-sm mb-3">
                    "{BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)]}"
                  </p>
                  <div className="w-full h-32 bg-stone-200 rounded-lg overflow-hidden mb-2 relative shadow-inner">
                    <img src={getDeityImage()} className="w-full h-full object-cover" alt="Blessing" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6 w-full justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">+{punyaEarned}</div>
                  <div className="text-xs text-stone-500 uppercase tracking-wide">Punya Earned</div>
                </div>
              </div>

              <div className="w-full space-y-3">
                <button 
                  onClick={restartPuja}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-lg transition flex items-center justify-center gap-2"
                >
                  <span>🔄</span> 
                  Perform Another Pooja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}