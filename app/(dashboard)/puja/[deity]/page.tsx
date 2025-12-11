import { currentUser } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DEITIES, AFFIRMATIONS, OFFERING_TIERS } from '@/lib/constants';
import PujaRitual from '@/components/puja/PujaRitual';

interface Props {
  params: {
    deity: string;
  };
}

export default async function PujaPage({ params }: Props) {
  const user = await currentUser();
  
  if (!user) {
    redirect('/');
    return null;
  }

  // Find deity by slug
  const deitySlug = params.deity.replace('-', ' ').toLowerCase();
  const deity = DEITIES.find(d => 
    d.name.toLowerCase() === deitySlug || 
    d.id.toLowerCase() === params.deity
  );

  if (!deity) {
    notFound();
  }

  // Get user data to check for existing user record
  let userData = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  // Create user record if doesn't exist
  if (!userData) {
    userData = await prisma.user.create({
      data: {
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  }

  // Get user's recent pujas for this deity
  const recentPujas = await prisma.puja.findMany({
    where: {
      userId: userData.id,
      deityName: deity.name,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // Check if user did puja today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysPuja = recentPujas.find(puja => {
    const pujaDate = new Date(puja.createdAt);
    pujaDate.setHours(0, 0, 0, 0);
    return pujaDate.getTime() === today.getTime();
  });

  // Get deity's affirmation
  const affirmation = AFFIRMATIONS.find(a => a.deity === deity.id);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-gradient-to-r from-temple-brown to-deep-brown text-cream p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">{deity.icon}</div>
            <div>
              <h1 className="text-3xl font-playfair font-bold">{deity.name}</h1>
              <p className="text-cream/80 text-lg">{deity.description}</p>
            </div>
          </div>
          
          {affirmation && (
            <div className="bg-cream/20 backdrop-blur-sm rounded-2xl p-4 mt-4">
              <p className="text-cream text-center italic">
                "{affirmation.text}"
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Puja Status */}
      <div className="p-6 max-w-4xl mx-auto">
        {todaysPuja ? (
          <div className="bg-green-100 border-2 border-green-300 rounded-2xl p-6 mb-6 text-center">
            <div className="text-4xl mb-2">✨</div>
            <h2 className="text-xl font-playfair font-bold text-green-800 mb-2">
              Today's Puja Completed
            </h2>
            <p className="text-green-700">
              You earned {todaysPuja.punyaEarned} punya points from your devotion
            </p>
            <div className="mt-4">
              <button 
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                onClick={() => window.location.reload()}
              >
                Perform Another Puja ✨
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 mb-6 text-center shadow-lg">
            <div className="text-6xl mb-4">{deity.icon}</div>
            <h2 className="text-2xl font-playfair font-bold text-deep-brown mb-4">
              Begin Your Sacred Ritual
            </h2>
            <p className="text-deep-brown/70 mb-6 max-w-2xl mx-auto">
              Follow the 7 sacred steps of puja to connect with {deity.name}. 
              Use touch gestures to make offerings and receive blessings.
            </p>
          </div>
        )}

        {/* Puja Ritual Component */}
        <PujaRitual 
          deity={deity}
          user={userData}
          offeringTiers={OFFERING_TIERS}
        />

        {/* Recent Pujas */}
        {recentPujas.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mt-8">
            <h3 className="text-xl font-playfair font-bold text-deep-brown mb-4">
              Your Recent Devotion
            </h3>
            <div className="space-y-3">
              {recentPujas.map((puja) => (
                <div 
                  key={puja.id} 
                  className="flex items-center justify-between p-3 bg-cream/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{deity.icon}</span>
                    <div>
                      <p className="font-semibold text-deep-brown">
                        {new Date(puja.createdAt).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-deep-brown/60">
                        {new Date(puja.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
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
      </div>
    </div>
  );
}