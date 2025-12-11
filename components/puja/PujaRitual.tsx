'use client';

import { useState, useRef, useEffect } from 'react';
import { PUNYA_REWARDS } from '@/lib/constants';
import * as Tone from 'tone';

interface PujaRitualProps {
  deity: {
    id: string;
    name: string;
    icon: string;
    description: string;
    color: string;
    blessings: string[];
    img?: string;
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

const TOOLS = [
  { id: 'diya', name: 'Light Diya', icon: '🪔' },
  { id: 'agarbatti', name: 'Incense', icon: '🌿' },
  { id: 'flower', name: 'Flowers', icon: '🌸' },
  { id: 'milk', name: 'Offer Milk', icon: '🥛' },
  { id: 'bell', name: 'Ring Bell', icon: '🔔' },
  { id: 'shankh', name: 'Shankh', icon: '🐚' },
  { id: 'nagada', name: 'Nagada', icon: '🥁' },
  { id: 'chadava', name: 'Chadava', icon: '🪙' }
];

const BLESSINGS = [
  "May your path be illuminated with wisdom and joy.",
  "Strength does not come from physical capacity. It comes from an indomitable will.",
  "Peace comes from within. Do not seek it without.",
  "Your devotion creates ripples of positivity in the universe.",
  "The universe is always working in your favor. Have faith."
];

export default function PujaRitual({ deity, user, offeringTiers }: PujaRitualProps) {
  const [punya, setPunya] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [hasShownCompletion, setHasShownCompletion] = useState(false);
  const [guideMessage, setGuideMessage] = useState('Welcome to the temple.');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showChadavaModal, setShowChadavaModal] = useState(false);
  const [isDiyaLit, setIsDiyaLit] = useState(false);
  const [flowerHeap, setFlowerHeap] = useState<Array<{ id: number; rotation: number; scale: number; x: number; y: number }>>([]);

  const msgTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bellSynthRef = useRef<Tone.PolySynth | null>(null);
  const shankhSynthRef = useRef<Tone.AMSynth | null>(null);
  const drumSynthRef = useRef<Tone.MembraneSynth | null>(null);
  const offeringSynthRef = useRef<Tone.PolySynth | null>(null);
  const particleLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      // Cleanup
      if (msgTimeoutRef.current) clearTimeout(msgTimeoutRef.current);
    };
  }, []);

  const initAudio = async () => {
    if (audioInitialized) return;

    await Tone.start();

    const reverb = new Tone.Reverb(2).toDestination();
    await reverb.ready;

    bellSynthRef.current = new Tone.PolySynth(Tone.Synth).connect(reverb);
    bellSynthRef.current.set({ envelope: { attack: 0.001, decay: 1.2, sustain: 0, release: 1.2 } });
    bellSynthRef.current.volume.value = -8;

    shankhSynthRef.current = new Tone.AMSynth().connect(reverb);
    shankhSynthRef.current.volume.value = -5;

    drumSynthRef.current = new Tone.MembraneSynth().toDestination();

    offeringSynthRef.current = new Tone.PolySynth(Tone.Synth).connect(reverb);
    offeringSynthRef.current.set({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.01, decay: 0.5, sustain: 0.1, release: 1 }
    });
    offeringSynthRef.current.volume.value = -10;

    setAudioInitialized(true);
    setIsAudioEnabled(true);
  };

  const toggleAudio = async () => {
    if (!audioInitialized) {
      await initAudio();
      return;
    }
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);
    Tone.Destination.mute = !newState;
  };

  const playOfferingTune = () => {
    if (isAudioEnabled && offeringSynthRef.current) {
      const notes = ["C5", "D5", "E5", "G5", "A5"];
      let time = Tone.now();
      for (let i = 0; i < 3; i++) {
        const note = notes[Math.floor(Math.random() * notes.length)];
        offeringSynthRef.current.triggerAttackRelease(note, "8n", time + (i * 0.15));
      }
    }
  };

  const showMessage = (msg: string) => {
    setGuideMessage(msg);
    if (msgTimeoutRef.current) clearTimeout(msgTimeoutRef.current);
    msgTimeoutRef.current = setTimeout(() => {
      setGuideMessage('');
    }, 3000);
  };

  const addPunya = (points: number) => {
    setPunya(prev => prev + points);
  };

  const handleToolClick = (toolId: string) => {
    if (!completedSteps.has(toolId)) {
      setCompletedSteps(prev => new Set([...prev, toolId]));
      addPunya(50);
    } else {
      addPunya(10);
    }

    switch (toolId) {
      case 'diya':
        performDiya();
        break;
      case 'agarbatti':
        performAgarbatti();
        break;
      case 'flower':
        performFlower();
        break;
      case 'milk':
        performMilk();
        break;
      case 'bell':
        performBell();
        break;
      case 'shankh':
        performShankh();
        break;
      case 'nagada':
        performNagada();
        break;
      case 'chadava':
        setShowChadavaModal(true);
        break;
    }

    if (completedSteps.size >= 5 && !hasShownCompletion) {
      setTimeout(() => {
        setHasShownCompletion(true);
        setShowCompletionModal(true);
        if (isAudioEnabled && bellSynthRef.current) {
          bellSynthRef.current.triggerAttackRelease(["C4", "E4", "G4", "C5"], "2n");
        }
      }, 2000);
    }
  };

  const performDiya = () => {
    if (!isDiyaLit) {
      setIsDiyaLit(true);
      showMessage("Darkness vanishes before divine light.");
      if (isAudioEnabled && offeringSynthRef.current) {
        offeringSynthRef.current.triggerAttackRelease(["C4", "E4", "G4"], "0.5");
      }
    } else {
      showMessage("The flame burns eternally bright.");
    }
  };

  const performAgarbatti = () => {
    showMessage("The air fills with divine fragrance.");
    if (isAudioEnabled && offeringSynthRef.current) {
      offeringSynthRef.current.triggerAttackRelease(["G4", "B4", "D5"], "0.5");
    }

    // Spawn smoke particles
    if (particleLayerRef.current) {
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          const smoke = document.createElement('div');
          smoke.className = 'smoke-particle';
          smoke.style.left = (window.innerWidth / 2) + (Math.random() * 80 - 40) + 'px';
          smoke.style.bottom = '150px';
          particleLayerRef.current?.appendChild(smoke);
          setTimeout(() => smoke.remove(), 3000);
        }, i * 300);
      }
    }
  };

  const performFlower = () => {
    showMessage("A shower of flowers for the Divine.");
    playOfferingTune();

    // Spawn falling flowers
    if (particleLayerRef.current) {
      for (let i = 0; i < 12; i++) {
        setTimeout(() => {
          const flower = document.createElement('div');
          flower.className = 'flower-particle';
          flower.textContent = '🌸';
          flower.style.fontSize = '32px';
          const startX = 50 + (Math.random() * 60 - 30);
          flower.style.left = startX + '%';
          flower.style.top = '-100px';
          particleLayerRef.current?.appendChild(flower);

          setTimeout(() => {
            flower.remove();
            const newFlower = {
              id: Date.now() + i,
              rotation: Math.random() * 360,
              scale: 0.6 + Math.random() * 0.4,
              x: Math.random() * 10 - 5,
              y: Math.random() * 5
            };
            setFlowerHeap(prev => {
              const updated = [...prev, newFlower];
              return updated.length > 25 ? updated.slice(-25) : updated;
            });
          }, 1900);
        }, i * 150);
      }
    }
  };

  const performMilk = () => {
    showMessage("Abhishekam: Bathe the deity in purity.");
    playOfferingTune();

    const stream = document.getElementById('milk-stream');
    const overlay = document.getElementById('milk-overlay');

    if (stream && overlay) {
      stream.classList.remove('milk-stream-active');
      overlay.classList.remove('milk-overlay-active');
      void stream.offsetWidth;

      stream.classList.add('milk-stream-active');
      overlay.classList.add('milk-overlay-active');
    }
  };

  const performBell = () => {
    showMessage("The bell resonates with Om.");
    if (isAudioEnabled && bellSynthRef.current) {
      bellSynthRef.current.triggerAttackRelease(["C5", "E5", "G5", "C6"], "8n");
    }
  };

  const performShankh = () => {
    showMessage("The sound of creation purifies all.");
    if (isAudioEnabled && shankhSynthRef.current) {
      shankhSynthRef.current.triggerAttackRelease("D3", 3);
    }
  };

  const performNagada = () => {
    showMessage("Beating the drums of joy.");
    if (isAudioEnabled && drumSynthRef.current) {
      drumSynthRef.current.triggerAttackRelease("C2", "8n");
    }
  };

  const handleChadavaSubmit = (amount: number) => {
    playOfferingTune();
    addPunya(amount * 5);
    setShowChadavaModal(false);
    showMessage(`Offered ₹${amount}. Blessings received.`);

    if (!completedSteps.has('chadava')) {
      setCompletedSteps(prev => new Set([...prev, 'chadava']));
      if (completedSteps.size >= 4 && !hasShownCompletion) {
        setTimeout(() => {
          setHasShownCompletion(true);
          setShowCompletionModal(true);
        }, 2000);
      }
    }
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
          steps: Array.from(completedSteps),
          gestures: Array.from(completedSteps),
          offeringAmount: 0,
          duration: 60,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        addPunya(150);
      }
    } catch (error) {
      console.error('Error completing puja:', error);
    }
  };

  const restartPooja = () => {
    setShowCompletionModal(false);
    setCompletedSteps(new Set());
    setHasShownCompletion(false);
    setFlowerHeap([]);
    setIsDiyaLit(false);
    showMessage("Begin your prayers anew.");
  };

  const getDeityImage = () => {
    // Use deity icon as fallback
    return deity.img || `https://api.dicebear.com/7.x/bottts/svg?seed=${deity.id}`;
  };

  return (
    <>
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px) scale(0.95); }
          50% { transform: translateY(-10px) scale(0.95); }
          100% { transform: translateY(0px) scale(0.95); }
        }
        .float-anim { animation: float 4s ease-in-out infinite; }

        @keyframes flame-flicker {
          0%, 100% { transform: scale(1); opacity: 0.9; filter: drop-shadow(0 0 5px orange); }
          50% { transform: scale(1.1) skewX(2deg); opacity: 1; }
          25% { transform: scale(0.9) skewX(-2deg); opacity: 0.8; }
        }
        .flame-active { animation: flame-flicker 0.15s infinite alternate; }

        @keyframes smoke-rise {
          0% { transform: translateY(0) scale(1); opacity: 0.7; }
          100% { transform: translateY(-100px) scale(2); opacity: 0; }
        }
        .smoke-particle {
          position: absolute;
          width: 48px;
          height: 48px;
          background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          pointer-events: none;
          animation: smoke-rise 3s forwards;
        }

        @keyframes flower-tumble {
          0% {
            transform: translateY(-100%) rotate(0deg) scale(0.5);
            opacity: 0;
          }
          10% { opacity: 1; }
          100% {
            transform: translateY(80vh) rotate(360deg) scale(1);
            opacity: 0;
          }
        }
        .flower-particle {
          position: absolute;
          z-index: 30;
          pointer-events: none;
          animation: flower-tumble 2s linear forwards;
        }

        @keyframes milk-pour-anim {
          0% { height: 0; opacity: 0.8; }
          10% { height: 100%; opacity: 1; }
          90% { height: 100%; opacity: 1; }
          100% { height: 0; opacity: 0; }
        }
        .milk-stream-active {
          animation: milk-pour-anim 3s ease-in-out forwards;
        }

        @keyframes milk-wash-effect {
          0% { opacity: 0; }
          20% { opacity: 0.5; }
          80% { opacity: 0.5; }
          100% { opacity: 0; }
        }
        .milk-overlay-active {
          animation: milk-wash-effect 3s ease-in-out forwards;
        }
      `}</style>

      {/* Temple Screen */}
      <div className="fixed inset-0 bg-black">
        {/* Background */}
        <div className="absolute inset-0 opacity-60">
          <div className="w-full h-full bg-gradient-to-b from-amber-900/50 via-orange-900/50 to-stone-900"></div>
        </div>

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-30 bg-gradient-to-b from-black/70 to-transparent">
          <button
            onClick={toggleAudio}
            className="text-white hover:text-orange-300 transition flex items-center gap-2 bg-orange-600 p-2 rounded-full"
          >
            <span className="text-xl">{isAudioEnabled ? '🔊' : '🔇'}</span>
          </button>
          <div className="flex flex-col items-center">
            <div className="bg-black/40 px-4 py-1 rounded-full border border-yellow-500/50 backdrop-blur-md">
              <span className="text-yellow-400 font-bold flex items-center gap-2">
                <span className="text-xl">✨</span>
                <span>{punya} Punya</span>
              </span>
            </div>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Deity Display */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none pb-24">
          <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
            {/* Aura */}
            <div
              className={`absolute w-[80%] h-[80%] rounded-full bg-yellow-500/30 blur-3xl transition-all duration-1000 ${isDiyaLit ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
            ></div>

            {/* Milk Overlay */}
            <div id="milk-overlay" className="absolute inset-0 bg-white mix-blend-overlay opacity-0 rounded-full blur-md z-25 pointer-events-none"></div>

            {/* Deity Image */}
            <div className="relative z-20 text-9xl float-anim drop-shadow-[0_0_30px_rgba(255,200,0,0.3)]">
              {deity.icon}
            </div>

            {/* Milk Stream */}
            <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-12 h-[110%] z-30 pointer-events-none overflow-hidden">
              <div id="milk-stream" className="w-full bg-gradient-to-b from-white via-white/90 to-transparent rounded-b-full h-0 opacity-0 blur-[2px]"></div>
            </div>

            {/* Flower Heap */}
            <div className="absolute bottom-0 w-full h-32 flex justify-center items-end flex-wrap gap-1 z-25 pointer-events-none transition-opacity duration-1000">
              {flowerHeap.map(flower => (
                <div
                  key={flower.id}
                  className="text-2xl transition-transform"
                  style={{
                    transform: `rotate(${flower.rotation}deg) scale(${flower.scale})`,
                    marginLeft: `${flower.x}px`,
                    marginBottom: `${flower.y}px`
                  }}
                >
                  🌸
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Particle Layer */}
        <div ref={particleLayerRef} className="absolute inset-0 pointer-events-none z-40 overflow-hidden"></div>

        {/* Bottom UI */}
        <div className="absolute bottom-0 left-0 right-0 z-50">
          {/* Guide Message */}
          <div className={`mx-auto w-max max-w-[90%] mb-4 bg-black/60 text-yellow-100 px-4 py-2 rounded-lg text-sm md:text-base text-center backdrop-blur-md border border-white/10 shadow-lg transition-all duration-300 ${guideMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {guideMessage || 'Welcome to the temple.'}
          </div>

          {/* Tools */}
          <div className="bg-gradient-to-t from-stone-900 via-stone-900/95 to-transparent pt-6 pb-4 px-2 overflow-x-auto">
            <div className="flex justify-center gap-4 md:gap-8 min-w-max px-4">
              {TOOLS.map(tool => (
                <div key={tool.id} className="flex flex-col items-center gap-2 group">
                  <button
                    onClick={() => handleToolClick(tool.id)}
                    className={`relative w-16 h-16 md:w-20 md:h-20 bg-stone-800 rounded-full border-2 border-yellow-600/30 flex items-center justify-center shadow-lg hover:border-yellow-400 hover:bg-stone-700 hover:-translate-y-2 transition-all duration-300 overflow-hidden active:scale-95 ${tool.id === 'diya' && isDiyaLit ? 'flame-active' : ''}`}
                  >
                    <span className="text-3xl md:text-4xl relative z-10 transition group-hover:scale-110">
                      {tool.icon}
                    </span>
                    <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition"></div>
                  </button>
                  <span className="text-xs text-stone-400 font-medium group-hover:text-yellow-400 transition">
                    {tool.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl transform transition-all duration-500">
            <div className="bg-orange-600 p-4 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-yellow-400 to-orange-600"></div>
              <h2 className="text-2xl text-white font-bold relative z-10">Pooja Completed!</h2>
              <p className="text-orange-100 text-sm relative z-10">Blessings Received</p>
            </div>

            <div className="p-6 flex flex-col items-center overflow-y-auto">
              <div className="w-full bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 relative">
                <div className="text-center">
                  <h3 className="text-xl text-orange-800 font-bold mb-1">Daily Blessing</h3>
                  <p className="text-stone-600 italic text-sm mb-3 font-serif">
                    "{BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)]}"
                  </p>
                  <div className="w-full h-32 bg-stone-200 rounded-lg overflow-hidden mb-2 relative shadow-inner">
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      {deity.icon}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6 w-full justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">+{PUNYA_REWARDS.DAILY_PUJA}</div>
                  <div className="text-xs text-stone-500 uppercase tracking-wide">Punya Earned</div>
                </div>
              </div>

              <div className="w-full space-y-3">
                <button
                  onClick={() => {
                    handleCompletePuja();
                    restartPooja();
                  }}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-lg transition flex items-center justify-center gap-2"
                >
                  <span className="text-xl">🔄</span> Perform Another Pooja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chadava Modal */}
      {showChadavaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-orange-800">Offer Chadava</h3>
              <button
                onClick={() => setShowChadavaModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <p className="text-sm text-stone-600 mb-6">
              Make a virtual offering to increase your Punya and gratitude.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { amount: 11, punya: 50 },
                { amount: 21, punya: 75 },
                { amount: 51, punya: 100 },
                { amount: 101, punya: 250 }
              ].map(({ amount, punya }) => (
                <button
                  key={amount}
                  onClick={() => handleChadavaSubmit(amount)}
                  className="p-3 border border-orange-200 rounded-lg hover:bg-orange-50 hover:border-orange-500 transition text-center group bg-white font-bold text-orange-700"
                >
                  ₹{amount}
                  <span className="block text-xs text-stone-500 font-normal">
                    +{punya} Punya
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
