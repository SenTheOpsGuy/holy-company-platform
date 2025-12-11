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
    <>
      {/* Hide bottom navigation for fullscreen experience */}
      <style jsx global>{`
        body {
          overflow: hidden;
        }
        nav[class*="BottomNav"],
        nav[class*="bottom-nav"] {
          display: none !important;
        }
      `}</style>

      {/* Fullscreen Immersive Puja Experience */}
      <PujaRitual
        deity={deity}
        user={userData}
        offeringTiers={OFFERING_TIERS}
      />
    </>
  );
}