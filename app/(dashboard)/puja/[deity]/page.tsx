import { currentUser } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
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

  const handlePujaComplete = async (result: any) => {
    console.log('Puja completed:', result);
    
    try {
      const response = await fetch('/api/pujas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deityName: deity.name,
          steps: result.stepsCompleted.map((step: any) => step.id || step),
          gestures: result.gesturesPerformed.map((gesture: any) => gesture.id || gesture),
          offeringAmount: result.offeringAmount || 0,
          duration: 60, // Default duration
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Puja saved successfully:', data);
        // You could show a success message or redirect here
      } else {
        console.error('Failed to save puja:', await response.text());
      }
    } catch (error) {
      console.error('Error saving puja:', error);
    }
  };

  return (
    <PujaRitual
      deity={deity}
      user={userData}
      offeringTiers={OFFERING_TIERS}
      onComplete={handlePujaComplete}
    />
  );
}