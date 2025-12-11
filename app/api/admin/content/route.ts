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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    // Get paginated content with analytics
    const [content, totalCount] = await Promise.all([
      prisma.content.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              views: true,
              likes: true
            }
          }
        }
      }),
      prisma.content.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Get summary stats
    const stats = await Promise.all([
      prisma.content.count(),
      prisma.content.count({ where: { featured: true } }),
      prisma.contentView.count(),
      prisma.contentLike.count(),
      prisma.content.groupBy({
        by: ['type'],
        _count: true
      }),
      prisma.content.groupBy({
        by: ['category'],
        _count: true
      })
    ]);

    return NextResponse.json({
      content,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      stats: {
        total: stats[0],
        featured: stats[1],
        totalViews: stats[2],
        totalLikes: stats[3],
        byType: stats[4],
        byCategory: stats[5]
      }
    });

  } catch (error) {
    console.error('Error fetching admin content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      title,
      description,
      content: contentText,
      type,
      category,
      imageUrl,
      videoUrl,
      audioUrl,
      featured = false
    } = body;

    // Validate required fields
    if (!title || !description || !contentText || !type || !category) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, description, content, type, category' 
      }, { status: 400 });
    }

    // Validate type and category values
    const validTypes = ['article', 'video', 'audio', 'image'];
    const validCategories = ['festivals', 'rituals', 'stories', 'philosophy', 'mantras', 'temples'];

    if (!validTypes.includes(type)) {
      return NextResponse.json({ 
        error: `Invalid type. Must be one of: ${validTypes.join(', ')}` 
      }, { status: 400 });
    }

    if (!validCategories.includes(category)) {
      return NextResponse.json({ 
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
      }, { status: 400 });
    }

    // Create content
    const newContent = await prisma.content.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        content: contentText,
        type,
        category,
        imageUrl: imageUrl?.trim() || null,
        videoUrl: videoUrl?.trim() || null,
        audioUrl: audioUrl?.trim() || null,
        featured: Boolean(featured),
      },
    });

    return NextResponse.json({
      success: true,
      content: newContent
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating admin content:', error);
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

    // Check if user is admin
    const userData = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { role: true }
    });

    if (userData?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ 
        error: 'Content ID is required' 
      }, { status: 400 });
    }

    // Check if content exists
    const existingContent = await prisma.content.findUnique({
      where: { id }
    });

    if (!existingContent) {
      return NextResponse.json({ 
        error: 'Content not found' 
      }, { status: 404 });
    }

    // Update content
    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      content: updatedContent
    });

  } catch (error) {
    console.error('Error updating admin content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const contentId = searchParams.get('id');

    if (!contentId) {
      return NextResponse.json({ 
        error: 'Content ID is required' 
      }, { status: 400 });
    }

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
    await Promise.all([
      prisma.contentView.deleteMany({
        where: { contentId }
      }),
      prisma.contentLike.deleteMany({
        where: { contentId }
      })
    ]);

    // Delete the content
    await prisma.content.delete({
      where: { id: contentId }
    });

    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting admin content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}