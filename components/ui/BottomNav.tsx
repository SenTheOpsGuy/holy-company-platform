'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gamepad2, BookOpen, User } from 'lucide-react';

const navigationItems = [
  {
    name: 'Home',
    href: '/home',
    icon: Home,
    activePatterns: ['/home', '/puja']
  },
  {
    name: 'Games',
    href: '/games',
    icon: Gamepad2,
    activePatterns: ['/games']
  },
  {
    name: 'Content',
    href: '/content',
    icon: BookOpen,
    activePatterns: ['/content']
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
    activePatterns: ['/profile']
  }
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (patterns: string[]) => {
    return patterns.some(pattern => pathname.startsWith(pattern));
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50">
      <div className="grid grid-cols-4 h-16">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.activePatterns);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 touch-target transition-colors ${
                active
                  ? 'text-auspicious-saffron bg-saffron/5'
                  : 'text-deep-brown/60 hover:text-deep-brown'
              }`}
            >
              <IconComponent 
                size={24} 
                className={active ? 'text-auspicious-saffron' : ''} 
              />
              <span 
                className={`text-xs font-medium ${
                  active ? 'text-auspicious-saffron' : ''
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}