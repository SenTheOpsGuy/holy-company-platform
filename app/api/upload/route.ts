import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'video/mp4',
  'audio/mpeg',
  'audio/wav',
  'application/pdf'
];

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin for certain upload types
    const userData = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { role: true }
    });

    const { searchParams } = new URL(request.url);
    const uploadType = searchParams.get('type') || 'general';

    // Only admins can upload content media
    if (uploadType === 'content' && userData?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ 
        error: 'No file provided' 
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` 
      }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: `File type ${file.type} not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}` 
      }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uploadType}/${timestamp}_${randomString}.${fileExtension}`;

    try {
      // Upload to Vercel Blob
      const blob = await put(fileName, file, {
        access: 'public',
        addRandomSuffix: false
      });

      // Create upload record in database
      // Note: Upload model not implemented yet
      // await prisma.upload.create({
      //   data: {
      //     userId: userData?.id || null,
      //     fileName: file.name,
      //     fileSize: file.size,
      //     mimeType: file.type,
      //     blobUrl: blob.url,
      //     uploadType,
      //   }
      // }).catch(error => {
      //   // If Upload table doesn't exist, just log the error
      //   console.error('Could not save upload record:', error);
      // });

      return NextResponse.json({
        success: true,
        url: blob.url,
        fileName: file.name,
        size: file.size,
        type: file.type
      });

    } catch (blobError) {
      console.error('Blob upload error:', blobError);
      return NextResponse.json({
        error: 'File upload failed',
        details: 'Unable to store file'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error uploading file:', error);
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

    const userData = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!userData) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const uploadType = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: any = {};
    
    if (uploadType) {
      where.uploadType = uploadType;
    }

    // Regular users can only see their own uploads, admins can see all
    if (userData.role !== 'ADMIN') {
      where.userId = userData.id;
    }

    try {
      // Get paginated uploads
      // Note: Upload model not implemented yet
      const uploads: any[] = [];
      const totalCount = 0;
      // const [uploads, totalCount] = await Promise.all([
      //   prisma.upload.findMany({
      //     where,
      //     skip: (page - 1) * limit,
      //     take: limit,
      //     orderBy: { createdAt: 'desc' },
      //     include: {
      //       user: {
      //         select: {
      //           firstName: true,
      //           lastName: true,
      //           email: true
      //         }
      //       }
      //     }
      //   }),
      //   prisma.upload.count({ where })
      // ]);

      const totalPages = Math.ceil(totalCount / limit);

      return NextResponse.json({
        uploads,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        }
      });

    } catch (dbError) {
      // If Upload table doesn't exist, return empty results
      return NextResponse.json({
        uploads: [],
        pagination: {
          page: 1,
          limit: 20,
          totalCount: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        }
      });
    }

  } catch (error) {
    console.error('Error fetching uploads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}