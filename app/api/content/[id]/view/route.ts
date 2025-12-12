import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentId = params.id;

    // Find user in database
    const userData = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!userData) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Check if content exists
    const content = await prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!content) {
      return NextResponse.json({ 
        error: 'Content not found' 
      }, { status: 404 });
    }

    // Check if user has already viewed this content today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingView = await prisma.contentView.findFirst({
      where: {
        contentId,
        userId: userData.id,
        createdAt: {
          gte: today
        }
      }
    });

    // Only create a new view if user hasn't viewed today
    if (!existingView) {
      await prisma.contentView.create({
        data: {
          contentId,
          userId: userData.id,
        }
      });
    }

    // Get updated view count
    const viewCount = await prisma.contentView.count({
      where: { contentId }
    });

    return NextResponse.json({
      success: true,
      viewCount,
      newView: !existingView
    });

  } catch (error) {
    console.error('Error recording content view:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}