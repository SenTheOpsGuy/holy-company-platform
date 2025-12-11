import { PUNYA_REWARDS, FESTIVAL_CALENDAR } from './constants';

export function calculatePujaPunyaPoints(deity: string, date: Date = new Date()): number {
  let points = PUNYA_REWARDS.DAILY_PUJA;

  // Check if it's a festival day
  const today = date.toISOString().split('T')[0];
  const festival = FESTIVAL_CALENDAR.find(
    (f) => f.date === today && f.deity === deity
  );

  if (festival) {
    points += PUNYA_REWARDS.FESTIVAL_BONUS;
  }

  return points;
}

export function calculateStreakBonus(streakCount: number): number {
  if (streakCount >= 30) return PUNYA_REWARDS.STREAK_30_DAYS;
  if (streakCount >= 14) return PUNYA_REWARDS.STREAK_14_DAYS;
  if (streakCount >= 7) return PUNYA_REWARDS.STREAK_7_DAYS;
  if (streakCount >= 3) return PUNYA_REWARDS.STREAK_3_DAYS;
  return 0;
}

export function calculateGamePunyaPoints(score: number, maxScore: number): number {
  // Calculate punya based on score percentage
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= 90) return 100;
  if (percentage >= 75) return 75;
  if (percentage >= 50) return 50;
  if (percentage >= 25) return 25;
  return 10; // Participation points
}

export function getStreakMessage(streak: number): string {
  if (streak === 0) return 'Start your spiritual journey today! 🙏';
  if (streak === 1) return 'Great start! Keep going! 🔥';
  if (streak === 3) return 'Amazing! 3-day streak achieved! 🎉';
  if (streak === 7) return 'Incredible! One week of devotion! 🌟';
  if (streak === 14) return 'Remarkable! Two weeks strong! 💫';
  if (streak === 30) return 'Outstanding! One month milestone! 🏆';
  if (streak >= 100) return 'Legendary devotee! 100+ days! 👑';
  return `${streak} days of devotion! Keep going! 🔥`;
}

export interface PunyaCalculationParams {
  stepsCompleted: number;
  gestures?: string[];
  offeringAmount: number;
  deityName: string;
}

export function calculatePunya(params: PunyaCalculationParams): number {
  const { stepsCompleted, gestures = [], offeringAmount, deityName } = params;
  
  // Base punya for daily puja
  let totalPunya = PUNYA_REWARDS.DAILY_PUJA;
  
  // Bonus for completing all steps
  if (stepsCompleted >= 7) {
    totalPunya += 50;
  }
  
  // Offering tier bonuses
  const offeringTiers = [
    { amount: 11, bonus: 50 },
    { amount: 21, bonus: 75 },
    { amount: 51, bonus: 100 },
    { amount: 111, bonus: 150 },
  ];
  
  const tier = offeringTiers.find(t => t.amount === offeringAmount);
  if (tier) {
    totalPunya += tier.bonus;
  }
  
  // Festival bonus
  const today = new Date().toISOString().split('T')[0];
  const festival = FESTIVAL_CALENDAR.find(
    f => f.date === today && f.deity === deityName
  );
  
  if (festival) {
    totalPunya += festival.bonus;
  }
  
  return totalPunya;
}
