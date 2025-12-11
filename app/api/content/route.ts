import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    // Build filter conditions
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
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

    // Get paginated content
    const [content, totalCount] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              views: true,
              likes: true
            }
          }
        },
      }),
      prisma.content.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Get filter options
    const [types, categories] = await Promise.all([
      prisma.content.findMany({
        select: { type: true },
        distinct: ['type'],
        orderBy: { type: 'asc' }
      }),
      prisma.content.findMany({
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' }
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
      filters: {
        types: types.map(t => t.type),
        categories: categories.map(c => c.category)
      }
    });

  } catch (error) {
    console.error('Error fetching content:', error);
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
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Create content
    const newContent = await prisma.content.create({
      data: {
        title,
        description,
        content: contentText,
        type,
        category,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        audioUrl: audioUrl || null,
        featured,
      },
    });

    return NextResponse.json({
      success: true,
      content: newContent
    });

  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}