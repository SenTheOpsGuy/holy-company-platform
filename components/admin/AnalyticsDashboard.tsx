'use client';

import { useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  userGrowth: Array<{ date: string; users: number; activeUsers: number }>;
  revenue: Array<{ date: string; amount: number; orders: number }>;
  pujaStats: Array<{ deity: string; count: number; revenue: number }>;
  gameStats: Array<{ game: string; plays: number; avgScore: number }>;
  contentViews: Array<{ type: string; views: number }>;
  userRetention: Array<{ period: string; retention: number }>;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  className?: string;
}

function MetricCard({ title, value, change, changeType, icon, className }: MetricCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={cn(
      'bg-white rounded-2xl p-6 border-2 border-deep-brown/10 hover:border-saffron/30 transition-all duration-200',
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-deep-brown/60 mb-2">{title}</p>
          <p className="text-3xl font-bold text-deep-brown mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <p className={cn('text-sm font-medium', getChangeColor())}>
              {change}
            </p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  className?: string;
}

export default function AnalyticsDashboard({ data, className }: AnalyticsDashboardProps) {
  const metrics = useMemo(() => {
    const latestUserData = data.userGrowth[data.userGrowth.length - 1];
    const previousUserData = data.userGrowth[data.userGrowth.length - 2];
    const totalUsers = latestUserData?.users || 0;
    const activeUsers = latestUserData?.activeUsers || 0;
    const userGrowth = previousUserData 
      ? ((latestUserData.users - previousUserData.users) / previousUserData.users * 100).toFixed(1)
      : '0';

    const latestRevenue = data.revenue[data.revenue.length - 1];
    const totalRevenue = data.revenue.reduce((sum, item) => sum + item.amount, 0);
    const totalOrders = data.revenue.reduce((sum, item) => sum + item.orders, 0);
    
    const totalPujas = data.pujaStats.reduce((sum, item) => sum + item.count, 0);
    const totalGamePlays = data.gameStats.reduce((sum, item) => sum + item.plays, 0);
    const totalContentViews = data.contentViews.reduce((sum, item) => sum + item.views, 0);

    return {
      totalUsers,
      activeUsers,
      userGrowth: `+${userGrowth}%`,
      totalRevenue,
      totalOrders,
      totalPujas,
      totalGamePlays,
      totalContentViews
    };
  }, [data]);

  const COLORS = ['#FF6F00', '#D4AF37', '#C62828', '#1976D2', '#00897B', '#5E35B1', '#7B1FA2', '#388E3C'];

  return (
    <div className={cn('space-y-8', className)}>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers}
          change={metrics.userGrowth}
          changeType="positive"
          icon="👥"
        />
        <MetricCard
          title="Active Users"
          value={metrics.activeUsers}
          change="Last 30 days"
          changeType="neutral"
          icon="✨"
        />
        <MetricCard
          title="Total Revenue"
          value={`₹${metrics.totalRevenue.toLocaleString()}`}
          change="+12.3% from last month"
          changeType="positive"
          icon="💰"
        />
        <MetricCard
          title="Total Pujas"
          value={metrics.totalPujas}
          change="+8.5% this week"
          changeType="positive"
          icon="🙏"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <div className="bg-white rounded-2xl p-6 border-2 border-deep-brown/10">
          <h3 className="text-lg font-bold text-deep-brown mb-4">User Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.userGrowth}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6F00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF6F00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#FF6F00"
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  name="Total Users"
                />
                <Line
                  type="monotone"
                  dataKey="activeUsers"
                  stroke="#D4AF37"
                  strokeWidth={3}
                  name="Active Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 border-2 border-deep-brown/10">
          <h3 className="text-lg font-bold text-deep-brown mb-4">Revenue Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#00897B"
                  strokeWidth={3}
                  name="Revenue (₹)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Puja Distribution */}
        <div className="bg-white rounded-2xl p-6 border-2 border-deep-brown/10">
          <h3 className="text-lg font-bold text-deep-brown mb-4">Puja Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.pujaStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ deity, percent }) => `${deity} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.pujaStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Game Statistics */}
        <div className="bg-white rounded-2xl p-6 border-2 border-deep-brown/10">
          <h3 className="text-lg font-bold text-deep-brown mb-4">Game Statistics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.gameStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="game" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="plays" fill="#FF6F00" name="Plays" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content Performance */}
        <div className="bg-white rounded-2xl p-6 border-2 border-deep-brown/10">
          <h3 className="text-lg font-bold text-deep-brown mb-4">Content Performance</h3>
          <div className="space-y-3">
            {data.contentViews.map((item, index) => (
              <div key={item.type} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-deep-brown">
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </span>
                </div>
                <span className="text-sm text-deep-brown/70">
                  {item.views.toLocaleString()} views
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Deities */}
        <div className="bg-white rounded-2xl p-6 border-2 border-deep-brown/10">
          <h3 className="text-lg font-bold text-deep-brown mb-4">Top Deities</h3>
          <div className="space-y-3">
            {data.pujaStats
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 5)
              .map((item, index) => (
                <div key={item.deity} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📍'}
                    </span>
                    <span className="text-sm font-medium text-deep-brown">
                      {item.deity}
                    </span>
                  </div>
                  <span className="text-sm text-green-600">
                    ₹{item.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* User Retention */}
        <div className="bg-white rounded-2xl p-6 border-2 border-deep-brown/10">
          <h3 className="text-lg font-bold text-deep-brown mb-4">User Retention</h3>
          <div className="space-y-3">
            {data.userRetention.map((item, index) => (
              <div key={item.period}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-deep-brown">
                    {item.period}
                  </span>
                  <span className="text-sm text-deep-brown/70">
                    {item.retention}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-saffron to-gold h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.retention}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border-2 border-deep-brown/10">
        <h3 className="text-lg font-bold text-deep-brown mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-saffron text-deep-brown rounded-lg hover:bg-saffron/90 transition-colors font-medium">
            📊 Export Data
          </button>
          <button className="px-4 py-2 bg-deep-brown/10 text-deep-brown rounded-lg hover:bg-deep-brown/20 transition-colors font-medium">
            📧 Send Report
          </button>
          <button className="px-4 py-2 bg-deep-brown/10 text-deep-brown rounded-lg hover:bg-deep-brown/20 transition-colors font-medium">
            🔄 Refresh Data
          </button>
          <button className="px-4 py-2 bg-deep-brown/10 text-deep-brown rounded-lg hover:bg-deep-brown/20 transition-colors font-medium">
            ⚙️ Settings
          </button>
        </div>
      </div>
    </div>
  );
}