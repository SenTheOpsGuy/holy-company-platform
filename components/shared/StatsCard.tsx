interface StatsCardProps {
  icon: string;
  label: string;
  value: string;
  color: 'gold' | 'saffron' | 'brown' | 'purple' | 'blue' | 'green' | 'orange' | 'red' | 'indigo' | 'pink' | 'teal' | 'emerald';
  subtitle?: string;
}

const colorClasses = {
  gold: 'bg-gradient-to-br from-yellow-100 to-amber-100 border-amber-200',
  saffron: 'bg-gradient-to-br from-orange-100 to-red-100 border-orange-200',
  brown: 'bg-gradient-to-br from-amber-100 to-orange-100 border-amber-200',
  purple: 'bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-200',
  blue: 'bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-200',
  green: 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-200',
  orange: 'bg-gradient-to-br from-orange-100 to-amber-100 border-orange-200',
  red: 'bg-gradient-to-br from-red-100 to-pink-100 border-red-200',
  indigo: 'bg-gradient-to-br from-indigo-100 to-purple-100 border-indigo-200',
  pink: 'bg-gradient-to-br from-pink-100 to-rose-100 border-pink-200',
  teal: 'bg-gradient-to-br from-teal-100 to-cyan-100 border-teal-200',
  emerald: 'bg-gradient-to-br from-emerald-100 to-green-100 border-emerald-200'
};

export default function StatsCard({ icon, label, value, color, subtitle }: StatsCardProps) {
  return (
    <div className={`${colorClasses[color]} rounded-lg md:rounded-xl p-3 md:p-4 border shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center gap-2 md:gap-3">
        <div className="text-xl md:text-2xl flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide truncate">
            {label}
          </p>
          <p className="text-base md:text-lg font-bold text-gray-900 truncate">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}