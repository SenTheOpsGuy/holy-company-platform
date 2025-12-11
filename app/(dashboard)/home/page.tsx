import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { DEITIES } from '@/lib/constants';
import DeityCard from '@/components/puja/DeityCard';
import StatsCard from '@/components/shared/StatsCard';

export default async function HomePage() {
  const user = await currentUser();
  
  if (!user) return null;

  // Get user data and stats
  const userData = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: {
      pujas: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: {
          pujas: true,
          userGames: true
        }
      }
    }
  });

  const totalPunya = userData?.punyaBalance || 0;
  const currentStreak = userData?.currentStreak || 0;
  const totalPujas = userData?._count.pujas || 0;
  const totalGames = userData?._count.userGames || 0;

  return (
    <div className="min-h-screen bg-cream safe-top">
      {/* Header */}
      <header className="bg-gradient-to-r from-temple-brown to-deep-brown text-cream p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-playfair font-bold mb-2">
            Namaste, {user.firstName || 'Devotee'} 🙏
          </h1>
          <p className="text-cream/80">
            Choose your deity and begin your spiritual practice
          </p>
        </div>
      </header>

      {/* Stats Section */}
      <section className="p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            icon="✨" 
            label="Punya Points" 
            value={totalPunya.toString()} 
            color="gold"
          />
          <StatsCard 
            icon="🔥" 
            label="Streak" 
            value={`${currentStreak} days`} 
            color="saffron"
          />
          <StatsCard 
            icon="🪔" 
            label="Total Pujas" 
            value={totalPujas.toString()} 
            color="brown"
          />
          <StatsCard 
            icon="🎮" 
            label="Games Played" 
            value={totalGames.toString()} 
            color="brown"
          />
        </div>

        {/* Deity Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-playfair font-bold text-deep-brown mb-6 text-center">
            Select Your Deity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DEITIES.map((deity) => (
              <DeityCard 
                key={deity.id} 
                deity={deity}
                userPujaCount={userData?.pujas?.filter(p => p.deityName === deity.name).length || 0}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {userData?.pujas && userData.pujas.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-playfair font-bold text-deep-brown mb-4">
              Recent Pujas
            </h3>
            <div className="space-y-3">
              {userData.pujas.map((puja) => (
                <div key={puja.id} className="flex items-center justify-between p-3 bg-cream/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{DEITIES.find(d => d.name === puja.deityName)?.icon}</span>
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
          </div>
        )}
      </section>
    </div>
  );
}