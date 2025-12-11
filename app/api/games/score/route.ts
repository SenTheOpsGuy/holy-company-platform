import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { gameId, score, duration, achievements } = body;

    if (!gameId || typeof score !== 'number') {
      return NextResponse.json({ 
        error: 'Game ID and score are required' 
      }, { status: 400 });
    }

    // Find user in database
    const userData = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!userData) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Get the game
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json({ 
        error: 'Game not found' 
      }, { status: 404 });
    }

    // Check if user has unlocked this game
    const userGame = await prisma.userGame.findFirst({
      where: {
        userId: userData.id,
        gameId: game.id,
      },
    });

    if (!userGame) {
      return NextResponse.json({ 
        error: 'Game not unlocked' 
      }, { status: 403 });
    }

    // Calculate punya earned based on score
    // Base punya is score divided by 100, with bonuses for high scores
    let punyaEarned = Math.floor(score / 100);
    
    // Bonus for new high score
    const isNewHighScore = score > userGame.highScore;
    if (isNewHighScore) {
      punyaEarned = Math.floor(punyaEarned * 1.5); // 50% bonus for high score
    }

    // Bonus for achievements
    if (achievements && achievements.length > 0) {
      punyaEarned += achievements.length * 10; // 10 punya per achievement
    }

    // Update user game record
    const updatedUserGame = await prisma.userGame.update({
      where: { id: userGame.id },
      data: {
        highScore: Math.max(userGame.highScore, score),
        timesPlayed: {
          increment: 1
        },
        lastPlayed: new Date(),
      },
    });

    // Update user's punya balance
    const updatedUser = await prisma.user.update({
      where: { id: userData.id },
      data: {
        punyaBalance: {
          increment: punyaEarned
        }
      },
    });

    // Create game session record for analytics
    await prisma.gameSession.create({
      data: {
        userId: userData.id,
        gameId: game.id,
        score: score,
        duration: duration || null,
        punyaEarned: punyaEarned,
        achievements: achievements || [],
        isHighScore: isNewHighScore,
      },
    }).catch(() => {
      // Ignore if GameSession table doesn't exist yet
    });

    return NextResponse.json({
      success: true,
      score: score,
      highScore: updatedUserGame.highScore,
      isNewHighScore,
      punyaEarned,
      totalPunya: updatedUser.punyaBalance,
      timesPlayed: updatedUserGame.timesPlayed,
      achievements: achievements || [],
    });

  } catch (error) {
    console.error('Error recording game score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}