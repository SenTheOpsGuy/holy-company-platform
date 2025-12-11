import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get comprehensive user data
    const userData = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: {
        pujas: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            offerings: true
          }
        },
        userGames: {
          include: {
            game: {
              select: {
                id: true,
                title: true,
                description: true,
                type: true
              }
            }
          },
          orderBy: { lastPlayed: 'desc' }
        },
        offerings: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        blessings: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            pujas: true,
            userGames: true,
            offerings: true,
            blessings: true
          }
        }
      }
    });

    if (!userData) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Calculate additional stats
    const totalSpent = userData.offerings
      .filter(o => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + o.amount, 0);

    const averagePujaScore = userData.pujas.length > 0
      ? userData.pujas.reduce((sum, p) => sum + p.punyaEarned, 0) / userData.pujas.length
      : 0;

    const gamesStats = userData.userGames.reduce((acc, ug) => ({
      totalScore: acc.totalScore + ug.highScore,
      totalPlayed: acc.totalPlayed + ug.timesPlayed
    }), { totalScore: 0, totalPlayed: 0 });

    // Determine user level based on punya
    const level = Math.floor(userData.punyaBalance / 1000) + 1;
    const nextLevelPunya = level * 1000;
    const progressToNextLevel = (userData.punyaBalance % 1000) / 1000;

    return NextResponse.json({
      user: {
        id: userData.id,
        clerkId: userData.clerkId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        createdAt: userData.createdAt,
      },
      spiritual: {
        punyaBalance: userData.punyaBalance,
        currentStreak: userData.currentStreak,
        longestStreak: userData.longestStreak,
        lastPujaDate: userData.lastPujaDate,
        level,
        nextLevelPunya,
        progressToNextLevel,
        averagePujaScore: Math.round(averagePujaScore)
      },
      stats: {
        totalPujas: userData._count.pujas,
        totalGamesUnlocked: userData._count.userGames,
        totalOfferings: userData._count.offerings,
        totalBlessings: userData._count.blessings,
        totalSpent,
        gamesScore: gamesStats.totalScore,
        gamesPlayed: gamesStats.totalPlayed
      },
      recent: {
        pujas: userData.pujas,
        games: userData.userGames.slice(0, 5),
        offerings: userData.offerings,
        blessings: userData.blessings.slice(0, 5)
      }
    });

  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const allowedFields = ['firstName', 'lastName'];
    
    // Filter to only allowed fields
    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        error: 'No valid fields to update' 
      }, { status: 400 });
    }

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { clerkId: user.id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      }
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}