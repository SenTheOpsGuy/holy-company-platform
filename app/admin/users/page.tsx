import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import UserTable from '@/components/admin/UserTable';
import Link from 'next/link';

interface Props {
  searchParams: {
    page?: string;
    search?: string;
    filter?: string;
  };
}

export default async function AdminUsersPage({ searchParams }: Props) {
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

  const page = parseInt(searchParams.page || '1');
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  // Build where clause
  const where: any = {};
  
  if (searchParams.search) {
    where.OR = [
      { email: { contains: searchParams.search, mode: 'insensitive' } },
      { firstName: { contains: searchParams.search, mode: 'insensitive' } },
      { lastName: { contains: searchParams.search, mode: 'insensitive' } }
    ];
  }

  if (searchParams.filter && searchParams.filter !== 'all') {
    switch (searchParams.filter) {
      case 'active':
        where.lastPujaDate = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case 'inactive':
        where.OR = [
          { lastPujaDate: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
          { lastPujaDate: null }
        ];
        break;
      case 'premium':
        where.offerings = { some: {} };
        break;
    }
  }

  // Get users with counts
  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            pujas: true,
            offerings: true,
            userGames: true
          }
        },
        offerings: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    }),
    prisma.user.count({ where })
  ]);

  const totalPages = Math.ceil(totalUsers / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin"
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ê
              </Link>
              <div>
                <h1 className="text-2xl font-playfair font-bold text-gray-900">
                  User Management
                </h1>
                <p className="text-gray-600">
                  {totalUsers.toLocaleString()} total users
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <form className="flex gap-2">
                <input 
                  type="text" 
                  name="search"
                  defaultValue={searchParams.search || ''}
                  placeholder="Search users..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select 
                  name="filter"
                  defaultValue={searchParams.filter || 'all'}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active (7 days)</option>
                  <option value="inactive">Inactive</option>
                  <option value="premium">Premium</option>
                </select>
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Filter
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">=e</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">=‚</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.lastPujaDate && 
                    new Date(u.lastPujaDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">=é</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Premium Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.offerings && u.offerings.length > 0).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-xl">= </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Punya</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(users.reduce((sum, u) => sum + (u.punyaBalance || 0), 0) / (users.length || 1))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow">
          <UserTable 
            users={users}
            currentPage={page}
            totalPages={totalPages}
          />
        </div>
      </div>
    </div>
  );
}