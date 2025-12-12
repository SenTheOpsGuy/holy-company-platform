import { currentUser } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import UserDetail from '@/components/admin/UserDetail';
import Link from 'next/link';

interface Props {
  params: {
    id: string;
  };
}

export default async function AdminUserDetailPage({ params }: Props) {
  const user = await currentUser();
  if (!user) return null;

  // Check if user is admin
  const userData = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { role: true }
  });

  if (userData?.role !== 'ADMIN') {
    redirect('/home');
  }

  // Get detailed user data
  const targetUser = await prisma.user.findUnique({
    where: { id: params.id },
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
      }
    }
  });

  if (!targetUser) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/users"
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ←
            </Link>
            <div>
              <h1 className="text-2xl font-playfair font-bold text-gray-900">
                {targetUser.firstName} {targetUser.lastName}
              </h1>
              <p className="text-gray-600">{targetUser.email}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <UserDetail user={targetUser} />
      </div>
    </div>
  );
}