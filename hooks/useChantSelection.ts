'use client';

import { useMemo } from 'react';
import { DEITY_CHANTS, Chant, ChantLevel } from '@/lib/chants';

interface UseChantSelectionProps {
  deityId: string;
  offeringAmount: number;
}

export function useChantSelection({ deityId, offeringAmount }: UseChantSelectionProps) {
  const selectedChant = useMemo(() => {
    const deityChants = DEITY_CHANTS[deityId];
    
    if (!deityChants || deityChants.length === 0) {
      return null;
    }

    // Determine chant level based on offering amount
    let chantLevel: ChantLevel;
    if (offeringAmount >= 111) {
      chantLevel = 'advanced';
    } else if (offeringAmount >= 51) {
      chantLevel = 'intermediate';
    } else {
      chantLevel = 'basic';
    }

    // Find chant for the determined level
    const levelChants = deityChants.filter(chant => chant.level === chantLevel);
    
    if (levelChants.length === 0) {
      // Fallback to basic if no chant found for the level
      return deityChants.find(chant => chant.level === 'basic') || deityChants[0];
    }

    // Return the first chant of the level (or could be randomized)
    return levelChants[0];
  }, [deityId, offeringAmount]);

  const chantDuration = selectedChant?.duration || 30;
  
  const chantLevel = useMemo(() => {
    if (offeringAmount >= 111) return 'advanced';
    if (offeringAmount >= 51) return 'intermediate';
    return 'basic';
  }, [offeringAmount]);

  const getAllChantsForDeity = useMemo(() => {
    return DEITY_CHANTS[deityId] || [];
  }, [deityId]);

  return {
    selectedChant,
    chantLevel,
    chantDuration,
    getAllChantsForDeity,
  };
}