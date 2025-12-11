import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contentId = params.id;

    // Get content with view and like counts
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        _count: {
          select: {
            views: true,
            likes: true
          }
        }
      }
    });

    if (!content) {
      return NextResponse.json({ 
        error: 'Content not found' 
      }, { status: 404 });
    }

    // Get related content (same category or type)
    const relatedContent = await prisma.content.findMany({
      where: {
        AND: [
          { id: { not: contentId } },
          {
            OR: [
              { category: content.category },
              { type: content.type }
            ]
          }
        ]
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        type: true,
        category: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      content,
      relatedContent
    });

  } catch (error) {
    console.error('Error fetching content:', error);
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

    const contentId = params.id;
    const body = await request.json();

    // Check if content exists
    const existingContent = await prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!existingContent) {
      return NextResponse.json({ 
        error: 'Content not found' 
      }, { status: 404 });
    }

    // Update content
    const updatedContent = await prisma.content.update({
      where: { id: contentId },
      data: {
        ...body,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      content: updatedContent
    });

  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const contentId = params.id;

    // Check if content exists
    const existingContent = await prisma.content.findUnique({
      where: { id: contentId }
    });

    if (!existingContent) {
      return NextResponse.json({ 
        error: 'Content not found' 
      }, { status: 404 });
    }

    // Delete related records first
    await prisma.contentView.deleteMany({
      where: { contentId }
    });

    await prisma.contentLike.deleteMany({
      where: { contentId }
    });

    // Delete the content
    await prisma.content.delete({
      where: { id: contentId }
    });

    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}