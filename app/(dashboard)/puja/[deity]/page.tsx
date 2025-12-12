'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { DEITIES, AFFIRMATIONS, OFFERING_TIERS } from '@/lib/constants';
import PujaRitual from '@/components/puja/PujaRitual';
import { useEffect, useState } from 'react';

interface Props {
  params: {
    deity: string;
  };
}

export default function PujaPage({ params }: Props) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !isClient) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return null;
  }

  // Find deity by slug - handle both direct ID match and name variations
  const deity = DEITIES.find(d => {
    // Direct ID match
    if (d.id.toLowerCase() === params.deity.toLowerCase()) {
      return true;
    }
    
    // Name variations
    const deityName = d.name.toLowerCase().replace('shri ', '');
    const urlParam = params.deity.toLowerCase().replace('-', ' ');
    
    return deityName === urlParam || d.name.toLowerCase() === urlParam;
  });

  if (!deity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-deep-brown mb-4">Deity Not Found</h1>
          <p className="text-deep-brown/70 mb-6">The deity you're looking for doesn't exist.</p>
          <button 
            onClick={() => router.push('/home')}
            className="px-6 py-3 bg-saffron text-deep-brown rounded-lg font-semibold hover:bg-gold transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // Note: Database operations moved to API layer to avoid server-side rendering issues
  // User data will be handled when the puja is completed via the API
  const userData = {
    id: user.id, // Using Clerk ID as fallback
    clerkId: user.id,
    email: user.primaryEmailAddress?.emailAddress || '',
    firstName: user.firstName,
    lastName: user.lastName,
  };

  // Get deity's affirmation
  const affirmation = AFFIRMATIONS.find(a => a.deity === deity.id);

  return (
    <PujaRitual
      deity={deity}
      user={userData}
      offeringTiers={OFFERING_TIERS}
    />
  );
}