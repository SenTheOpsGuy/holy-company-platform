'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Play } from 'lucide-react';

interface PujaStepProps {
  step: {
    id: string;
    title: string;
    description: string;
    gesture: string;
    audioPrompt?: string;
  };
  stepNumber: number;
  deity: {
    name: string;
    icon: string;
  };
  isActive: boolean;
  isCompleted?: boolean;
  onComplete?: () => void;
}

export default function PujaStep({ 
  step, 
  stepNumber, 
  deity, 
  isActive, 
  isCompleted = false,
  onComplete 
}: PujaStepProps) {
  const [isExpanded, setIsExpanded] = useState(isActive);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: stepNumber * 0.1 }}
      className={`
        border-2 rounded-xl transition-all duration-300
        ${isActive ? 'border-saffron bg-saffron/5' : 
          isCompleted ? 'border-green-300 bg-green-50' : 
          'border-gray-200 bg-white'}
      `}
    >
      {/* Step Header */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Step Number/Status */}
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-bold
              ${isCompleted ? 'bg-green-500 text-white' :
                isActive ? 'bg-saffron text-white' :
                'bg-gray-200 text-gray-600'}
            `}>
              {isCompleted ? <CheckCircle size={20} /> : stepNumber}
            </div>

            {/* Step Info */}
            <div>
              <h3 className={`font-playfair font-bold ${isActive || isCompleted ? 'text-deep-brown' : 'text-gray-600'}`}>
                {step.title}
              </h3>
              <p className="text-sm text-gray-600">
                {step.gesture}
              </p>
            </div>
          </div>

          {/* Expand/Collapse Icon */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-gray-400"
          >
            ↓
          </motion.div>
        </div>
      </div>

      {/* Step Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-100">
              <div className="pt-4">
                <p className="text-deep-brown/80 mb-4 leading-relaxed">
                  {step.description}
                </p>

                {/* Gesture Visualization */}
                <div className="bg-gradient-to-r from-cream to-white rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{deity.icon}</div>
                    <div className="text-2xl">👐</div>
                    <div className="text-lg text-saffron">✨</div>
                  </div>
                  <p className="text-sm text-deep-brown/60 mt-2">
                    Perform the gesture above this area
                  </p>
                </div>

                {/* Audio Controls */}
                {step.audioPrompt && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg mb-4">
                    <button className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors">
                      <Play size={16} />
                    </button>
                    <div>
                      <p className="text-sm font-medium text-purple-800">
                        Listen to audio guidance
                      </p>
                      <p className="text-xs text-purple-600">
                        Sanskrit pronunciation and instructions
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {isActive && !isCompleted && (
                  <div className="flex gap-3">
                    <button
                      onClick={onComplete}
                      className="flex-1 bg-saffron text-white font-semibold py-3 px-6 rounded-lg hover:bg-saffron/90 transition-colors"
                    >
                      Complete Step
                    </button>
                    <button className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                      Skip
                    </button>
                  </div>
                )}

                {isCompleted && (
                  <div className="p-3 bg-green-100 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle size={16} />
                      <span className="text-sm font-medium">Step Completed</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}