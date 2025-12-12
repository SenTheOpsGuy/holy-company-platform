'use client';

import { useMemo } from 'react';

export interface PujaStep {
  id: string;
  name: string;
  completed: boolean;
  current?: boolean;
}

interface PujaProgressBarProps {
  steps: PujaStep[];
  className?: string;
}

export default function PujaProgressBar({ steps, className = '' }: PujaProgressBarProps) {
  const { completedSteps, currentStepIndex, totalSteps, progressPercentage } = useMemo(() => {
    const completed = steps.filter(step => step.completed).length;
    const current = steps.findIndex(step => step.current);
    const total = steps.length;
    const percentage = (completed / total) * 100;
    
    return {
      completedSteps: completed,
      currentStepIndex: current,
      totalSteps: total,
      progressPercentage: percentage,
    };
  }, [steps]);

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-deep-brown">Puja Progress</h3>
        <span className="text-xs text-stone-600">
          {completedSteps}/{totalSteps} completed
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-4">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Step Indicators */}
        <div className="absolute top-0 left-0 w-full h-2 flex justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`w-3 h-3 -mt-0.5 rounded-full border-2 transition-all duration-300 ${
                step.completed
                  ? 'bg-green-500 border-green-500'
                  : step.current
                  ? 'bg-orange-500 border-orange-500 animate-pulse'
                  : 'bg-white border-gray-300'
              }`}
              style={{ 
                left: `${(index / (totalSteps - 1)) * 100}%`,
                transform: 'translateX(-50%)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-1">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center space-x-2 text-xs transition-all duration-300 ${
              step.completed
                ? 'text-green-600'
                : step.current
                ? 'text-orange-600 font-semibold'
                : 'text-stone-400'
            }`}
          >
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
              step.completed
                ? 'bg-green-100 text-green-600'
                : step.current
                ? 'bg-orange-100 text-orange-600'
                : 'bg-gray-100 text-gray-400'
            }`}>
              {step.completed ? '✓' : index + 1}
            </div>
            <span>{step.name}</span>
            {step.current && (
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {progressPercentage === 100 && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-green-700 text-sm font-semibold">🎉 Puja Completed!</p>
          <p className="text-green-600 text-xs">Your devotion has been offered with love</p>
        </div>
      )}
    </div>
  );
}