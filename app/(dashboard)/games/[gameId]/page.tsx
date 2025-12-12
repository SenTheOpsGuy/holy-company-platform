import { currentUser } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface GamePageProps {
  params: {
    gameId: string;
  };
}

export default async function GamePage({ params }: GamePageProps) {
  const user = await currentUser();
  
  if (!user) {
    redirect('/');
    return null;
  }

  // Get game details
  const game = await prisma.game.findUnique({
    where: { id: params.gameId },
  });

  if (!game) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-gradient-to-r from-temple-brown to-deep-brown text-cream p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-playfair font-bold">{game.title}</h1>
          <p className="text-cream/80">{game.description}</p>
        </div>
      </header>
      
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-2xl font-playfair font-bold text-deep-brown mb-4">
            {game.title}
          </h2>
          <p className="text-deep-brown/70 mb-6">{game.description}</p>
          <p className="text-sm text-deep-brown/60">Deity: {game.deityName}</p>
          <button className="mt-6 bg-saffron text-deep-brown px-8 py-3 rounded-lg font-semibold hover:bg-gold transition-colors">
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}