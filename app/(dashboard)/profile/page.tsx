import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/');
    return null;
  }

  // Get user data
  const userData = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: {
      pujas: {
        take: 10,
        orderBy: { createdAt: 'desc' }
      },
      userGames: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { game: true }
      },
      offerings: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: {
          pujas: true,
          userGames: true,
          offerings: true
        }
      }
    }
  });

  const totalPunya = userData?.punyaBalance || 0;
  const currentStreak = userData?.currentStreak || 0;
  const totalPujas = userData?._count.pujas || 0;
  const totalGames = userData?._count.userGames || 0;
  const totalOfferings = userData?._count.offerings || 0;

  return (
    <div className="min-h-screen bg-cream safe-top">
      {/* Header */}
      <header className="bg-gradient-to-r from-temple-brown to-deep-brown text-cream p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-cream/20 rounded-full flex items-center justify-center text-2xl">
              {user.firstName?.charAt(0) || '👤'}
            </div>
            <div>
              <h1 className="text-2xl font-playfair font-bold">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-cream/80">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Stats Overview */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-2">✨</div>
            <div className="text-2xl font-bold text-deep-brown">{totalPunya}</div>
            <div className="text-sm text-deep-brown/60">Punya Points</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-deep-brown">{currentStreak}</div>
            <div className="text-sm text-deep-brown/60">Day Streak</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-2">🪔</div>
            <div className="text-2xl font-bold text-deep-brown">{totalPujas}</div>
            <div className="text-sm text-deep-brown/60">Total Pujas</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-2">🎮</div>
            <div className="text-2xl font-bold text-deep-brown">{totalGames}</div>
            <div className="text-sm text-deep-brown/60">Games Played</div>
          </div>
        </section>

        {/* Recent Pujas */}
        {userData?.pujas && userData.pujas.length > 0 && (
          <section className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-playfair font-bold text-deep-brown mb-4">
              Recent Pujas
            </h2>
            <div className="space-y-3">
              {userData.pujas.map((puja) => (
                <div key={puja.id} className="flex items-center justify-between p-3 bg-cream/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🪔</span>
                    <div>
                      <p className="font-semibold text-deep-brown">{puja.deityName}</p>
                      <p className="text-sm text-deep-brown/60">
                        {new Date(puja.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-deep-brown/80">+{puja.punyaEarned} punya</p>
                    {puja.offeringAmount && (
                      <p className="text-xs text-deep-brown/60">₹{puja.offeringAmount}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Games */}
        {userData?.userGames && userData.userGames.length > 0 && (
          <section className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-playfair font-bold text-deep-brown mb-4">
              Recent Games
            </h2>
            <div className="space-y-3">
              {userData.userGames.map((userGame) => (
                <div key={userGame.id} className="flex items-center justify-between p-3 bg-cream/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎮</span>
                    <div>
                      <p className="font-semibold text-deep-brown">{userGame.game.name}</p>
                      <p className="text-sm text-deep-brown/60">
                        Score: {userGame.score} • {new Date(userGame.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-deep-brown/80">+{userGame.punyaEarned} punya</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Account Settings */}
        <section className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-playfair font-bold text-deep-brown mb-4">
            Account Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-deep-brown">Member Since</span>
              <span className="text-deep-brown/70">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-deep-brown">Email</span>
              <span className="text-deep-brown/70">
                {user.primaryEmailAddress?.emailAddress}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-deep-brown">Total Offerings</span>
              <span className="text-deep-brown/70">{totalOfferings}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}