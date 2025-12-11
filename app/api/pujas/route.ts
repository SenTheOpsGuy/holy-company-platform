import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { calculatePunya } from '@/lib/punya';
import { updateStreak } from '@/lib/streaks';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      deityName, 
      steps, 
      gestures, 
      offeringAmount, 
      duration 
    } = body;

    // Validate required fields
    if (!deityName || !steps || !Array.isArray(steps)) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
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

    // Calculate punya points based on steps completed and offering
    const basePunya = calculatePunya({
      stepsCompleted: steps.length,
      gestures: gestures || [],
      offeringAmount: offeringAmount || 0,
      deityName,
    });

    // Update streak and get bonus multiplier
    const { newStreak, bonusMultiplier } = await updateStreak(userData.id);
    const finalPunya = Math.round(basePunya * bonusMultiplier);

    // Create puja record
    const puja = await prisma.puja.create({
      data: {
        userId: userData.id,
        deityName,
        stepsCompleted: steps,
        gesturesPerformed: gestures || [],
        punyaEarned: finalPunya,
        offeringAmount: offeringAmount || null,
        duration: duration || null,
        completedAt: new Date(),
      },
    });

    // Update user's punya balance and streak
    const updatedUser = await prisma.user.update({
      where: { id: userData.id },
      data: {
        punyaBalance: {
          increment: finalPunya
        },
        currentStreak: newStreak,
        longestStreak: Math.max(userData.longestStreak, newStreak),
        lastPujaDate: new Date(),
      },
    });

    // Create offering record if amount provided
    let offering = null;
    if (offeringAmount && offeringAmount > 0) {
      offering = await prisma.offering.create({
        data: {
          userId: userData.id,
          pujaId: puja.id,
          amount: offeringAmount,
          status: 'PENDING',
          paymentMethod: 'CASHFREE',
        },
      });
    }

    // Generate blessing card
    await prisma.blessingCard.create({
      data: {
        userId: userData.id,
        pujaId: puja.id,
        deityName,
        message: `${deityName} blesses you with divine grace and protection. Your devotion has earned you ${finalPunya} punya points.`,
        imageUrl: `/blessings/${deityName.toLowerCase()}.jpg`,
      },
    });

    return NextResponse.json({
      success: true,
      puja: {
        id: puja.id,
        punyaEarned: finalPunya,
        newStreak: newStreak,
        totalPunya: updatedUser.punyaBalance,
        offering: offering ? { id: offering.id, amount: offering.amount } : null,
      },
    });

  } catch (error) {
    console.error('Error creating puja:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const deityFilter = searchParams.get('deity');

    // Find user in database
    const userData = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!userData) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Build filter conditions
    const where: any = {
      userId: userData.id,
    };

    if (deityFilter) {
      where.deityName = deityFilter;
    }

    // Get paginated pujas
    const [pujas, totalCount] = await Promise.all([
      prisma.puja.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          offerings: true,
          blessings: true,
        },
      }),
      prisma.puja.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      pujas,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error('Error fetching pujas:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}