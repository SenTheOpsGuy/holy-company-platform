'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gamepad2, BookOpen, User } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

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

export default function DesktopNav() {
  const pathname = usePathname();

  const isActive = (patterns: string[]) => {
    return patterns.some(pattern => pathname.startsWith(pattern));
  };

  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/home" className="flex items-center gap-2">
              <span className="text-2xl">🕉️</span>
              <span className="text-xl font-playfair font-bold text-deep-brown">
                The Holy Company
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-8">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.activePatterns);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    active
                      ? 'text-auspicious-saffron bg-saffron/5'
                      : 'text-deep-brown/60 hover:text-deep-brown hover:bg-gray-50'
                  }`}
                >
                  <IconComponent 
                    size={20} 
                    className={active ? 'text-auspicious-saffron' : ''} 
                  />
                  <span 
                    className={`font-medium ${
                      active ? 'text-auspicious-saffron' : ''
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}