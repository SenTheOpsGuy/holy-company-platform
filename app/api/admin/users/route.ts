import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const filter = searchParams.get('filter');

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (filter && filter !== 'all') {
      switch (filter) {
        case 'active':
          where.lastPujaDate = { 
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
          };
          break;
        case 'inactive':
          where.OR = [
            { lastPujaDate: { 
              lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
            }},
            { lastPujaDate: null }
          ];
          break;
        case 'premium':
          where.offerings = { 
            some: { 
              status: 'COMPLETED' 
            } 
          };
          break;
      }
    }

    // Get paginated users with counts
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              pujas: true,
              offerings: true,
              userGames: true,
              blessings: true
            }
          },
          offerings: {
            where: { status: 'COMPLETED' },
            select: {
              amount: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Calculate additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const totalSpent = await prisma.offering.aggregate({
          where: {
            userId: user.id,
            status: 'COMPLETED'
          },
          _sum: { amount: true }
        });

        const lastActivity = await prisma.puja.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true }
        });

        return {
          ...user,
          stats: {
            totalSpent: totalSpent._sum.amount || 0,
            lastActivity: lastActivity?.createdAt || user.createdAt,
            isActive: user.lastPujaDate ? 
              new Date(user.lastPujaDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : 
              false
          }
        };
      })
    );

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }
    });

  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}