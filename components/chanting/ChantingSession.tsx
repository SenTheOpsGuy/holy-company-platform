'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Chant } from '@/lib/chants';

interface ChantingSessionProps {
  chant: Chant;
  onComplete: () => void;
  onExit: () => void;
}

interface AudioLevel {
  level: number;
  isChanting: boolean;
}

export default function ChantingSession({ chant, onComplete, onExit }: ChantingSessionProps) {
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState<AudioLevel>({ level: 0, isChanting: false });
  const [timeRemaining, setTimeRemaining] = useState(chant.duration);
  const [chantingTime, setChantingTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const CHANTING_THRESHOLD = 30; // Minimum audio level to consider as chanting
  const MIN_CHANTING_PERCENTAGE = 60; // Minimum percentage of time user needs to chant

  const initializeAudio = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;

      // Create audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create analyser
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;

      // Connect microphone to analyser
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);

      setIsListening(true);
      setPermissionDenied(false);

      // Start audio level monitoring
      monitorAudioLevel();

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setPermissionDenied(true);
    }
  }, []);

  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateLevel = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      
      // Determine if user is chanting
      const isChanting = average > CHANTING_THRESHOLD;
      
      setAudioLevel({ level: average, isChanting });

      animationIdRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  }, []);

  const startSession = useCallback(() => {
    setSessionActive(true);
    setTimeRemaining(chant.duration);
    setChantingTime(0);
    setProgress(0);

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          completeSession();
          return 0;
        }
        return prev - 1;
      });

      // Update chanting time if user is currently chanting
      if (audioLevel.isChanting) {
        setChantingTime(prev => prev + 1);
      }

      // Update progress
      setProgress(prev => {
        const totalTime = chant.duration - (timeRemaining - 1);
        const chantedTime = audioLevel.isChanting ? chantingTime + 1 : chantingTime;
        return (chantedTime / totalTime) * 100;
      });
    }, 1000);
  }, [chant.duration, audioLevel.isChanting, chantingTime, timeRemaining]);

  const completeSession = useCallback(() => {
    setSessionActive(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Check if user chanted enough
    const chantingPercentage = (chantingTime / chant.duration) * 100;
    
    if (chantingPercentage >= MIN_CHANTING_PERCENTAGE) {
      onComplete();
    } else {
      // Show completion with low percentage warning
      alert(`Session completed! You chanted for ${chantingPercentage.toFixed(1)}% of the time. Try to chant more actively next time.`);
      onComplete();
    }
  }, [chantingTime, chant.duration, onComplete]);

  const cleanup = useCallback(() => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop animation
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }

    // Stop microphone
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsListening(false);
    setSessionActive(false);
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAudioLevelColor = () => {
    if (!isListening) return 'bg-gray-300';
    if (audioLevel.isChanting) return 'bg-green-500';
    if (audioLevel.level > 10) return 'bg-yellow-500';
    return 'bg-red-300';
  };

  const getChantingPercentage = () => {
    if (chant.duration - timeRemaining === 0) return 0;
    return ((chantingTime / (chant.duration - timeRemaining)) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-cream flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-deep-brown mb-2">Chanting Session</h1>
          <p className="text-stone-600 text-sm">Chant for {chant.deityId.charAt(0).toUpperCase() + chant.deityId.slice(1)}</p>
        </div>

        {/* Chant Display */}
        <div className="bg-orange-50 rounded-lg p-4 mb-6">
          <div className="text-center mb-3">
            <h3 className="font-semibold text-deep-brown mb-1">Sanskrit</h3>
            <p className="text-lg text-deep-brown font-sanskrit">{chant.text}</p>
          </div>
          
          <div className="text-center mb-3">
            <h3 className="font-semibold text-deep-brown mb-1">Pronunciation</h3>
            <p className="text-sm text-stone-600 italic">{chant.transliteration}</p>
          </div>
          
          {chant.pronunciation && chant.pronunciation.length > 0 && (
            <div className="text-center">
              <h3 className="font-semibold text-deep-brown mb-1">Guide</h3>
              <div className="text-xs text-stone-600">
                {chant.pronunciation.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Permission Request */}
        {!isListening && !permissionDenied && (
          <div className="text-center mb-6">
            <p className="text-stone-600 mb-4">We need microphone access to detect your chanting</p>
            <button
              onClick={initializeAudio}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition"
            >
              Allow Microphone Access
            </button>
          </div>
        )}

        {/* Permission Denied */}
        {permissionDenied && (
          <div className="text-center mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 text-sm">
                Microphone access is required for chanting detection. 
                Please allow microphone permission and try again.
              </p>
            </div>
            <button
              onClick={initializeAudio}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition mb-2"
            >
              Retry Microphone Access
            </button>
            <button
              onClick={onExit}
              className="w-full py-2 text-stone-500 hover:text-stone-700 transition text-sm"
            >
              Skip Chanting
            </button>
          </div>
        )}

        {/* Audio Level Display */}
        {isListening && !sessionActive && (
          <div className="mb-6">
            <div className="text-center mb-4">
              <p className="text-stone-600 mb-2">Microphone Test</p>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-100 ${getAudioLevelColor()}`}
                    style={{ width: `${Math.min(audioLevel.level / 100 * 100, 100)}%` }}
                  />
                </div>
                <span className={`text-sm font-semibold ${audioLevel.isChanting ? 'text-green-600' : 'text-stone-400'}`}>
                  {audioLevel.isChanting ? 'Chanting Detected!' : 'Speak to test'}
                </span>
              </div>
            </div>
            
            <button
              onClick={startSession}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition"
            >
              Start Chanting Session
            </button>
          </div>
        )}

        {/* Active Session */}
        {sessionActive && (
          <div className="mb-6">
            {/* Timer */}
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-deep-brown mb-1">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-stone-600">Time Remaining</p>
            </div>

            {/* Audio Level */}
            <div className="mb-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-100 ${getAudioLevelColor()}`}
                    style={{ width: `${Math.min(audioLevel.level / 100 * 100, 100)}%` }}
                  />
                </div>
                <span className={`text-sm font-semibold ${audioLevel.isChanting ? 'text-green-600' : 'text-orange-500'}`}>
                  {audioLevel.isChanting ? '🎵 Chanting' : '🤫 Silent'}
                </span>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-stone-600 mb-1">
                <span>Chanting Progress</span>
                <span>{getChantingPercentage()}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300"
                  style={{ width: `${Math.min(parseFloat(getChantingPercentage()), 100)}%` }}
                />
              </div>
              <p className="text-xs text-stone-500 mt-1 text-center">
                Chant actively to increase progress
              </p>
            </div>

            {/* Stop Session Button */}
            <button
              onClick={completeSession}
              className="w-full py-2 text-orange-600 hover:text-orange-700 transition text-sm border border-orange-300 rounded-lg"
            >
              Complete Session Early
            </button>
          </div>
        )}

        {/* Exit Button */}
        {!sessionActive && (
          <button
            onClick={onExit}
            className="w-full py-2 text-stone-500 hover:text-stone-700 transition text-sm"
          >
            Return to Puja
          </button>
        )}
      </div>
    </div>
  );
}