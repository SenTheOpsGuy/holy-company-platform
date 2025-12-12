import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { gameId } = body;

    if (!gameId) {
      return NextResponse.json({ 
        error: 'Game ID is required' 
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

    // Check if user already has this game unlocked
    const existingUserGame = await prisma.userGame.findFirst({
      where: {
        userId: userData.id,
        gameId: game.id,
      },
    });

    if (existingUserGame) {
      return NextResponse.json({ 
        error: 'Game already unlocked' 
      }, { status: 400 });
    }

    // Check if user has enough punya points
    if (userData.punyaBalance < game.requiredPunya) {
      return NextResponse.json({ 
        error: 'Insufficient punya points',
        required: game.requiredPunya,
        current: userData.punyaBalance
      }, { status: 400 });
    }

    // Create user game record (unlock the game)
    const userGame = await prisma.userGame.create({
      data: {
        userId: userData.id,
        gameId: game.id,
        highScore: 0,
        timesPlayed: 0,
        lastPlayed: new Date(),
        unlockedAt: new Date(),
      },
    });

    // Deduct punya points from user
    const updatedUser = await prisma.user.update({
      where: { id: userData.id },
      data: {
        punyaBalance: {
          decrement: game.requiredPunya
        }
      },
    });

    return NextResponse.json({
      success: true,
      userGame: {
        id: userGame.id,
        gameId: userGame.gameId,
        unlockedAt: userGame.unlockedAt,
      },
      remainingPunya: updatedUser.punyaBalance,
      game: {
        id: game.id,
        title: game.title,
        description: game.description,
      }
    });

  } catch (error) {
    console.error('Error unlocking game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}