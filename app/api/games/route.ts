import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user in database
    const userData = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: {
        id: true,
        punyaBalance: true,
        userGames: {
          include: {
            game: true
          }
        }
      }
    });

    if (!userData) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Get all games with user progress
    const games = await prisma.game.findMany({
      orderBy: [
        { requiredPunya: 'asc' },
        { title: 'asc' }
      ],
      include: {
        _count: {
          select: {
            userGames: true
          }
        }
      }
    });

    // Create user games map for quick lookup
    const userGamesMap = new Map(
      userData.userGames.map(ug => [ug.gameId, ug])
    );

    // Add user progress and unlock status to each game
    const gamesWithProgress = games.map(game => {
      const userGame = userGamesMap.get(game.id);
      const isUnlocked = userGame || userData.punyaBalance >= game.requiredPunya;
      
      return {
        ...game,
        isUnlocked,
        userProgress: userGame ? {
          highScore: userGame.highScore,
          timesPlayed: userGame.timesPlayed,
          lastPlayed: userGame.lastPlayed,
          unlockedAt: userGame.unlockedAt,
        } : null,
        totalPlayers: game._count.userGames
      };
    });

    // Get user's game stats
    const gameStats = {
      totalGamesUnlocked: userData.userGames.length,
      totalGamesAvailable: games.length,
      totalScore: userData.userGames.reduce((sum, ug) => sum + ug.highScore, 0),
      totalTimesPlayed: userData.userGames.reduce((sum, ug) => sum + ug.timesPlayed, 0),
    };

    return NextResponse.json({
      games: gamesWithProgress,
      userStats: gameStats,
      userPunya: userData.punyaBalance,
    });

  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}