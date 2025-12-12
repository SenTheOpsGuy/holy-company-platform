'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface User {
  id: string;
  name: string;
  email: string;
  joinedAt: Date;
  lastActive: Date;
  punyaPoints: number;
  totalPujas: number;
  gamesPlayed: number;
  totalSpent: number;
  status: 'active' | 'inactive' | 'blocked';
  avatar?: string;
}

interface UserTableProps {
  users: User[];
  onUserSelect?: (user: User) => void;
  onUserAction?: (userId: string, action: 'block' | 'unblock' | 'delete') => void;
  className?: string;
}

export default function UserTable({
  users,
  onUserSelect,
  onUserAction,
  className
}: UserTableProps) {
  const [sortField, setSortField] = useState<keyof User>('joinedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | User['status']>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const sortedAndFilteredUsers = useMemo(() => {
    let filtered = users;

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (aValue instanceof Date) {
        aValue = aValue.getTime();
      }
      if (bValue instanceof Date) {
        bValue = bValue.getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
      }
      if (typeof bValue === 'string') {
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return (aValue || 0) > (bValue || 0) ? 1 : -1;
      } else {
        return (aValue || 0) < (bValue || 0) ? 1 : -1;
      }
    });

    return filtered;
  }, [users, sortField, sortDirection, filterStatus, searchQuery]);

  const handleSort = (field: keyof User) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStatusBadge = (status: User['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      blocked: 'bg-red-100 text-red-800'
    };

    return (
      <span className={cn(
        'px-2 py-1 rounded-full text-xs font-medium',
        styles[status]
      )}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getSortIcon = (field: keyof User) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 12l5-5 5 5H5z"/>
        </svg>
      );
    }

    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-saffron" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 12l5-5 5 5H5z"/>
      </svg>
    ) : (
      <svg className="w-4 h-4 text-saffron" fill="currentColor" viewBox="0 0 20 20">
        <path d="M15 8l-5 5-5-5h10z"/>
      </svg>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-deep-brown/20 rounded-lg focus:outline-none focus:border-saffron"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-deep-brown/50" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 border-2 border-deep-brown/20 rounded-lg focus:outline-none focus:border-saffron"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Results count */}
      <div className="text-sm text-deep-brown/60">
        Showing {sortedAndFilteredUsers.length} of {users.length} users
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg border-2 border-deep-brown/10 overflow-hidden">
          <thead className="bg-deep-brown/5">
            <tr>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 font-medium text-deep-brown hover:text-saffron"
                >
                  User
                  {getSortIcon('name')}
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('joinedAt')}
                  className="flex items-center gap-2 font-medium text-deep-brown hover:text-saffron"
                >
                  Joined
                  {getSortIcon('joinedAt')}
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('lastActive')}
                  className="flex items-center gap-2 font-medium text-deep-brown hover:text-saffron"
                >
                  Last Active
                  {getSortIcon('lastActive')}
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('punyaPoints')}
                  className="flex items-center gap-2 font-medium text-deep-brown hover:text-saffron"
                >
                  Punya Points
                  {getSortIcon('punyaPoints')}
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('totalPujas')}
                  className="flex items-center gap-2 font-medium text-deep-brown hover:text-saffron"
                >
                  Pujas
                  {getSortIcon('totalPujas')}
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('totalSpent')}
                  className="flex items-center gap-2 font-medium text-deep-brown hover:text-saffron"
                >
                  Total Spent
                  {getSortIcon('totalSpent')}
                </button>
              </th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredUsers.map((user, index) => (
              <tr
                key={user.id}
                className={cn(
                  'border-t border-deep-brown/10 hover:bg-deep-brown/5 transition-colors',
                  index % 2 === 0 ? 'bg-white' : 'bg-deep-brown/2'
                )}
              >
                <td className="p-4">
                  <button
                    onClick={() => onUserSelect?.(user)}
                    className="flex items-center gap-3 text-left hover:text-saffron transition-colors"
                  >
                    <div className="w-8 h-8 bg-saffron/20 rounded-full flex items-center justify-center text-sm font-medium">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-deep-brown">{user.name}</div>
                      <div className="text-sm text-deep-brown/60">{user.email}</div>
                    </div>
                  </button>
                </td>
                <td className="p-4 text-sm text-deep-brown/70">
                  {user.joinedAt.toLocaleDateString()}
                </td>
                <td className="p-4 text-sm text-deep-brown/70">
                  {user.lastActive.toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="font-medium text-saffron">
                    {user.punyaPoints.toLocaleString()}
                  </div>
                </td>
                <td className="p-4 text-deep-brown">
                  {user.totalPujas}
                </td>
                <td className="p-4">
                  <div className="font-medium text-green-600">
                    ₹{user.totalSpent.toLocaleString()}
                  </div>
                </td>
                <td className="p-4">
                  {getStatusBadge(user.status)}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {user.status !== 'blocked' ? (
                      <Button
                        onClick={() => onUserAction?.(user.id, 'block')}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Block
                      </Button>
                    ) : (
                      <Button
                        onClick={() => onUserAction?.(user.id, 'unblock')}
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        Unblock
                      </Button>
                    )}
                    <Button
                      onClick={() => onUserSelect?.(user)}
                      variant="ghost"
                      size="sm"
                    >
                      View
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedAndFilteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-deep-brown mb-2">No users found</h3>
          <p className="text-deep-brown/60">
            Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}