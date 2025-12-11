import { ClerkProvider } from '@clerk/nextjs';
import { Playfair_Display, Crimson_Text, Inter } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const crimson = Crimson_Text({ 
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-crimson',
  display: 'swap',
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Holy Company - Virtual Puja & Spiritual Games',
  description: 'Experience divine pujas, play spiritual games, and explore sacred content',
  manifest: '/manifest.json',
  themeColor: '#5D4037',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${playfair.variable} ${crimson.variable} ${inter.variable}`}>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </head>
        <body className="font-crimson bg-cream text-deep-brown min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
