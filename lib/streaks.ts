import { differenceInDays, startOfDay } from 'date-fns';

export function calculateNewStreak(
  lastPujaDate: Date | null,
  currentDate: Date = new Date()
): { newStreak: number; shouldReset: boolean } {
  if (!lastPujaDate) {
    return { newStreak: 1, shouldReset: false };
  }

  const lastPujaDay = startOfDay(lastPujaDate);
  const currentDay = startOfDay(currentDate);
  const daysDifference = differenceInDays(currentDay, lastPujaDay);

  // Same day - no change
  if (daysDifference === 0) {
    return { newStreak: 0, shouldReset: false };
  }

  // Next day - increment streak
  if (daysDifference === 1) {
    return { newStreak: 1, shouldReset: false };
  }

  // Missed a day or more - reset streak
  return { newStreak: 1, shouldReset: true };
}

export function getStreakStatus(
  lastPujaDate: Date | null,
  currentDate: Date = new Date()
): {
  isActive: boolean;
  hoursRemaining: number;
  message: string;
} {
  if (!lastPujaDate) {
    return {
      isActive: false,
      hoursRemaining: 24,
      message: 'Start your streak today!',
    };
  }

  const lastPujaDay = startOfDay(lastPujaDate);
  const currentDay = startOfDay(currentDate);
  const daysDifference = differenceInDays(currentDay, lastPujaDay);

  // Completed today
  if (daysDifference === 0) {
    return {
      isActive: true,
      hoursRemaining: 0,
      message: "Today's puja completed! ✅",
    };
  }

  // Can continue streak today
  if (daysDifference === 1) {
    const endOfDay = new Date(currentDay);
    endOfDay.setHours(23, 59, 59, 999);
    const hoursRemaining = Math.ceil(
      (endOfDay.getTime() - currentDate.getTime()) / (1000 * 60 * 60)
    );

    return {
      isActive: true,
      hoursRemaining,
      message: `Complete puja within ${hoursRemaining}h to maintain streak! 🔥`,
    };
  }

  // Streak broken
  return {
    isActive: false,
    hoursRemaining: 0,
    message: 'Streak ended. Start fresh today! 🌟',
  };
}

export function shouldSendStreakReminder(
  lastPujaDate: Date | null,
  currentDate: Date = new Date(),
  reminderHour: number = 20 // 8 PM
): boolean {
  const status = getStreakStatus(lastPujaDate, currentDate);
  
  // Only send if streak is active and hours remaining
  if (!status.isActive || status.hoursRemaining === 0) {
    return false;
  }

  // Check if current time is the reminder hour
  const currentHour = currentDate.getHours();
  return currentHour === reminderHour;
}

export async function updateStreak(userId: string): Promise<{
  newStreak: number;
  bonusMultiplier: number;
}> {
  const { prisma } = await import('@/lib/prisma');
  const { calculateStreakBonus } = await import('./punya');
  
  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const streakResult = calculateNewStreak(user.lastPujaDate);
  let newStreak = user.currentStreak;
  
  if (streakResult.shouldReset) {
    newStreak = 1;
  } else if (streakResult.newStreak > 0) {
    newStreak += 1;
  }
  
  // Calculate streak bonus
  const streakBonus = calculateStreakBonus(newStreak);
  const bonusMultiplier = 1 + (streakBonus / 100); // Convert bonus to multiplier
  
  return {
    newStreak,
    bonusMultiplier,
  };
}
