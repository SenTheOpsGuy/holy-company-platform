import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get comprehensive analytics
    const [
      totalUsers,
      totalPujas,
      totalRevenue,
      activeUsers,
      newUsersToday,
      pujasToday,
      revenueToday,
      userGrowth,
      pujaGrowth,
      revenueGrowth,
      topDeities,
      topGames,
      contentStats
    ] = await Promise.all([
      // Total counts
      prisma.user.count(),
      prisma.puja.count(),
      prisma.offering.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      
      // Active users (last 7 days)
      prisma.user.count({
        where: {
          lastPujaDate: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Today's stats
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.puja.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.offering.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        _sum: { amount: true }
      }),

      // Growth data
      getUserGrowthData(startDate),
      getPujaGrowthData(startDate),
      getRevenueGrowthData(startDate),
      getTopDeities(),
      getTopGames(),
      getContentStats()
    ]);

    // Calculate conversion rates
    const conversionRate = totalUsers > 0 
      ? (await prisma.user.count({
          where: {
            offerings: {
              some: { status: 'COMPLETED' }
            }
          }
        })) / totalUsers * 100
      : 0;

    const avgOfferingAmount = totalUsers > 0
      ? (totalRevenue._sum.amount || 0) / totalUsers
      : 0;

    return NextResponse.json({
      overview: {
        totalUsers,
        totalPujas,
        totalRevenue: totalRevenue._sum.amount || 0,
        activeUsers,
        newUsersToday,
        pujasToday,
        revenueToday: revenueToday._sum.amount || 0,
        conversionRate: Math.round(conversionRate * 100) / 100,
        avgOfferingAmount: Math.round(avgOfferingAmount * 100) / 100
      },
      growth: {
        users: userGrowth,
        pujas: pujaGrowth,
        revenue: revenueGrowth
      },
      insights: {
        topDeities,
        topGames,
        contentStats
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getUserGrowthData(startDate: Date) {
  const users = await prisma.user.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: { gte: startDate }
    },
    _count: true,
    orderBy: { createdAt: 'asc' }
  });

  const dailyData: { [key: string]: number } = {};
  users.forEach(user => {
    const date = user.createdAt.toISOString().split('T')[0];
    dailyData[date] = (dailyData[date] || 0) + user._count;
  });

  return Object.entries(dailyData).map(([date, count]) => ({
    date,
    count
  }));
}

async function getPujaGrowthData(startDate: Date) {
  const pujas = await prisma.puja.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: { gte: startDate }
    },
    _count: true,
    _sum: { punyaEarned: true },
    orderBy: { createdAt: 'asc' }
  });

  const dailyData: { [key: string]: { count: number; punya: number } } = {};
  pujas.forEach(puja => {
    const date = puja.createdAt.toISOString().split('T')[0];
    if (!dailyData[date]) {
      dailyData[date] = { count: 0, punya: 0 };
    }
    dailyData[date].count += puja._count;
    dailyData[date].punya += puja._sum.punyaEarned || 0;
  });

  return Object.entries(dailyData).map(([date, data]) => ({
    date,
    pujas: data.count,
    punya: data.punya
  }));
}

async function getRevenueGrowthData(startDate: Date) {
  const revenue = await prisma.offering.groupBy({
    by: ['createdAt'],
    where: {
      status: 'COMPLETED',
      createdAt: { gte: startDate }
    },
    _sum: { amount: true },
    _count: true,
    orderBy: { createdAt: 'asc' }
  });

  const dailyData: { [key: string]: { amount: number; count: number } } = {};
  revenue.forEach(rev => {
    const date = rev.createdAt.toISOString().split('T')[0];
    if (!dailyData[date]) {
      dailyData[date] = { amount: 0, count: 0 };
    }
    dailyData[date].amount += rev._sum.amount || 0;
    dailyData[date].count += rev._count;
  });

  return Object.entries(dailyData).map(([date, data]) => ({
    date,
    revenue: data.amount,
    offerings: data.count
  }));
}

async function getTopDeities() {
  const deities = await prisma.puja.groupBy({
    by: ['deityName'],
    _count: true,
    _sum: { punyaEarned: true },
    orderBy: { _count: { deityName: 'desc' } },
    take: 10
  });

  return deities.map(deity => ({
    name: deity.deityName,
    pujas: deity._count,
    totalPunya: deity._sum.punyaEarned || 0
  }));
}

async function getTopGames() {
  const games = await prisma.userGame.groupBy({
    by: ['gameId'],
    _count: true,
    _sum: { timesPlayed: true },
    _avg: { highScore: true },
    orderBy: { _count: { gameId: 'desc' } },
    take: 10
  });

  // Get game details
  const gameDetails = await prisma.game.findMany({
    where: {
      id: { in: games.map(g => g.gameId) }
    },
    select: {
      id: true,
      title: true,
      description: true
    }
  });

  const gameMap = new Map(gameDetails.map(g => [g.id, g]));

  return games.map(game => {
    const details = gameMap.get(game.gameId);
    return {
      id: game.gameId,
      title: details?.title || 'Unknown Game',
      description: details?.description || '',
      players: game._count,
      totalPlays: game._sum.timesPlayed || 0,
      avgScore: Math.round(game._avg.highScore || 0)
    };
  });
}

async function getContentStats() {
  const [
    totalContent,
    totalViews,
    totalLikes,
    contentByType,
    contentByCategory,
    topContent
  ] = await Promise.all([
    prisma.content.count(),
    prisma.contentView.count(),
    prisma.contentLike.count(),
    
    prisma.content.groupBy({
      by: ['type'],
      _count: true
    }),
    
    prisma.content.groupBy({
      by: ['category'],
      _count: true
    }),

    prisma.content.findMany({
      take: 5,
      orderBy: {
        views: {
          _count: 'desc'
        }
      },
      include: {
        _count: {
          select: {
            views: true,
            likes: true
          }
        }
      }
    })
  ]);

  return {
    total: totalContent,
    views: totalViews,
    likes: totalLikes,
    byType: contentByType,
    byCategory: contentByCategory,
    popular: topContent.map(content => ({
      id: content.id,
      title: content.title,
      type: content.type,
      category: content.category,
      views: content._count.views,
      likes: content._count.likes
    }))
  };
}