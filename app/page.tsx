import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';

export default async function Home() {
  const user = await currentUser();
  
  if (user) {
    redirect('/home');
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cream via-white to-cream">
      {/* Header */}
      <header className="safe-area-pt p-3 sm:p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-lg sm:text-xl md:text-2xl font-playfair font-bold text-deep-brown flex items-center gap-1 sm:gap-2">
            <span className="text-xl sm:text-2xl md:text-3xl">🕉️</span>
            <span className="hidden sm:inline">The Holy Company</span>
            <span className="sm:hidden">Holy Co.</span>
          </h1>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white border-2 border-deep-brown text-deep-brown text-sm sm:text-base rounded-lg font-semibold hover:bg-deep-brown hover:text-white transition-all">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Floating Icons */}
          <div className="flex justify-center gap-3 sm:gap-6 text-4xl sm:text-5xl md:text-6xl mb-6 sm:mb-8">
            <span className="animate-bounce" style={{ animationDelay: '0s' }}>🪔</span>
            <span className="animate-bounce" style={{ animationDelay: '0.5s' }}>🙏</span>
            <span className="animate-bounce" style={{ animationDelay: '1s' }}>🌺</span>
          </div>

          {/* Headline */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-playfair font-bold text-deep-brown leading-tight">
              Your Daily
              <br />
              <span className="text-saffron">
                Spiritual Companion
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-deep-brown/80 max-w-3xl mx-auto leading-relaxed px-2">
              Experience divine pujas, play spiritual games, and explore sacred content—all from your phone
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 my-8 sm:my-12 md:my-16">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-deep-brown/10 hover:border-saffron/50 transition-all hover:scale-105">
              <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">🪔</div>
              <h3 className="font-playfair text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-deep-brown">Virtual Puja</h3>
              <p className="text-sm sm:text-base text-deep-brown/70 leading-relaxed">
                Perform authentic rituals with interactive touch gestures and receive divine blessings
              </p>
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-deep-brown/10 hover:border-saffron/50 transition-all hover:scale-105">
              <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">🎮</div>
              <h3 className="font-playfair text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-deep-brown">Spiritual Games</h3>
              <p className="text-sm sm:text-base text-deep-brown/70 leading-relaxed">
                Engaging games inspired by Hindu deities that earn you punya points while you play
              </p>
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-deep-brown/10 hover:border-saffron/50 transition-all hover:scale-105 sm:col-span-2 lg:col-span-1">
              <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">📖</div>
              <h3 className="font-playfair text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-deep-brown">Sacred Content</h3>
              <p className="text-sm sm:text-base text-deep-brown/70 leading-relaxed">
                Learn about rituals, festivals, and traditions through videos, articles, and images
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-saffron/10 via-gold/10 to-saffron/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-saffron/30">
            <h3 className="font-playfair text-xl sm:text-2xl font-bold text-deep-brown mb-4 sm:mb-6 text-center sm:text-left">
              Why Choose The Holy Company?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl flex-shrink-0">✨</span>
                <span className="text-sm sm:text-base text-deep-brown">Earn Punya points for spiritual activities</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl flex-shrink-0">🔥</span>
                <span className="text-sm sm:text-base text-deep-brown">Build daily spiritual streaks</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl flex-shrink-0">🎯</span>
                <span className="text-sm sm:text-base text-deep-brown">Interactive gesture-based pujas</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl flex-shrink-0">📱</span>
                <span className="text-sm sm:text-base text-deep-brown">Works perfectly on mobile</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl flex-shrink-0">💳</span>
                <span className="text-sm sm:text-base text-deep-brown">Optional offerings with secure payments</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl flex-shrink-0">🇮🇳</span>
                <span className="text-sm sm:text-base text-deep-brown">Authentic Indian traditions</span>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="space-y-4 sm:space-y-6">
            <SignedOut>
              <div className="space-y-3 sm:space-y-4">
                <SignUpButton mode="modal">
                  <button className="w-full sm:w-auto bg-gradient-to-r from-saffron to-gold text-deep-brown font-bold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                    Start Your Spiritual Journey 🙏
                  </button>
                </SignUpButton>
                <p className="text-sm sm:text-base text-deep-brown/60 px-4">
                  ✅ Free to join • ✅ No credit card required • ✅ Instant access
                </p>
              </div>
            </SignedOut>

            <SignedIn>
              <Link href="/home">
                <button className="w-full sm:w-auto bg-gradient-to-r from-saffron to-gold text-deep-brown font-bold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                  Enter Your Sacred Space →
                </button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="safe-area-pb p-4 sm:p-6 md:p-8 text-center text-deep-brown/60 text-xs sm:text-sm bg-deep-brown/5">
        <div className="max-w-2xl mx-auto space-y-1 sm:space-y-2">
          <p className="font-semibold text-sm sm:text-base">🕉️ The Holy Company</p>
          <p className="text-xs sm:text-sm">Bridging Ancient Wisdom with Modern Technology</p>
          <p className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
            Made with <span className="text-red-500">❤️</span> and devotion in India 🇮🇳
          </p>
        </div>
      </footer>
    </div>
  );
}
