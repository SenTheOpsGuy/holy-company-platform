import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userData = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { role: true }
    });

    if (userData?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = params.id;

    // Get detailed user data
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        pujas: {
          orderBy: { createdAt: 'desc' },
          include: {
            offerings: true
          }
        },
        userGames: {
          include: {
            game: true
          },
          orderBy: { lastPlayed: 'desc' }
        },
        offerings: {
          orderBy: { createdAt: 'desc' }
        },
        blessings: {
          orderBy: { createdAt: 'desc' }
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

    if (!targetUser) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Calculate detailed analytics
    const analytics = {
      totalSpent: targetUser.offerings
        .filter(o => o.status === 'COMPLETED')
        .reduce((sum, o) => sum + o.amount, 0),
      
      averagePujaScore: targetUser.pujas.length > 0 
        ? targetUser.pujas.reduce((sum, p) => sum + p.punyaEarned, 0) / targetUser.pujas.length
        : 0,
      
      gameStats: targetUser.userGames.reduce((acc, ug) => ({
        totalScore: acc.totalScore + ug.highScore,
        totalPlayed: acc.totalPlayed + ug.timesPlayed,
        averageScore: acc.totalPlayed > 0 ? acc.totalScore / acc.totalPlayed : 0
      }), { totalScore: 0, totalPlayed: 0, averageScore: 0 }),

      activityByMonth: await getMonthlyActivity(userId),
      punyaHistory: await getPunyaHistory(userId),
      favoriteDeities: getFavoriteDeities(targetUser.pujas),
    };

    return NextResponse.json({
      user: targetUser,
      analytics
    });

  } catch (error) {
    console.error('Error fetching admin user detail:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userData = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { role: true }
    });

    if (userData?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = params.id;
    const body = await request.json();

    // Allowed fields for admin to update
    const allowedFields = ['role', 'punyaBalance', 'currentStreak', 'longestStreak'];
    
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

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getMonthlyActivity(userId: string) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyPujas = await prisma.puja.groupBy({
    by: ['createdAt'],
    where: {
      userId,
      createdAt: { gte: sixMonthsAgo }
    },
    _count: true
  });

  // Group by month
  const monthlyData: { [key: string]: number } = {};
  monthlyPujas.forEach(puja => {
    const month = puja.createdAt.toISOString().slice(0, 7); // YYYY-MM
    monthlyData[month] = (monthlyData[month] || 0) + puja._count;
  });

  return monthlyData;
}

async function getPunyaHistory(userId: string) {
  const pujas = await prisma.puja.findMany({
    where: { userId },
    select: {
      punyaEarned: true,
      createdAt: true
    },
    orderBy: { createdAt: 'asc' },
    take: 30 // Last 30 pujas
  });

  let runningTotal = 0;
  return pujas.map(puja => {
    runningTotal += puja.punyaEarned;
    return {
      date: puja.createdAt,
      earned: puja.punyaEarned,
      total: runningTotal
    };
  });
}

function getFavoriteDeities(pujas: any[]) {
  const deityCount: { [key: string]: number } = {};
  
  pujas.forEach(puja => {
    deityCount[puja.deityName] = (deityCount[puja.deityName] || 0) + 1;
  });

  return Object.entries(deityCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([deity, count]) => ({ deity, count }));
}