import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function GamesPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/');
    return null;
  }

  // Get all available games
  const games = await prisma.game.findMany({
    orderBy: { title: 'asc' }
  });

  // Get user's game stats
  const userData = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: {
      userGames: {
        take: 10,
        orderBy: { lastPlayed: 'desc' },
        include: { game: true }
      },
      _count: {
        select: { userGames: true }
      }
    }
  });

  const totalGamesPlayed = userData?._count.userGames || 0;
  const totalPunyaFromGames = userData?.userGames.reduce((sum, game) => sum + (game.highScore * 10), 0) || 0;

  return (
    <div className="min-h-screen bg-cream safe-top">
      {/* Header */}
      <header className="bg-gradient-to-r from-temple-brown to-deep-brown text-cream p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-playfair font-bold mb-2">
            Spiritual Games 🎮
          </h1>
          <p className="text-cream/80">
            Play games inspired by Hindu deities and earn punya points
          </p>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Stats Overview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-2">🎮</div>
            <div className="text-2xl font-bold text-deep-brown">{totalGamesPlayed}</div>
            <div className="text-sm text-deep-brown/60">Games Played</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-2">✨</div>
            <div className="text-2xl font-bold text-deep-brown">{totalPunyaFromGames}</div>
            <div className="text-sm text-deep-brown/60">Punya from Games</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-deep-brown">{games.length}</div>
            <div className="text-sm text-deep-brown/60">Available Games</div>
          </div>
        </section>

        {/* Available Games */}
        <section>
          <h2 className="text-2xl font-playfair font-bold text-deep-brown mb-6 text-center">
            Choose Your Game
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => {
              const userGameData = userData?.userGames.find(ug => ug.gameId === game.id);
              const bestScore = userGameData?.highScore || 0;
              const timesPlayed = userGameData?.timesPlayed || 0;

              return (
                <div key={game.id} className="group">
                  <Link href={`/games/${game.id}`}>
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-saffron/30 transition-all duration-300 overflow-hidden group-hover:scale-105">
                      {/* Game Icon */}
                      <div className="bg-gradient-to-br from-saffron/20 to-gold/20 p-8 text-center">
                        <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                          🎮
                        </div>
                        {timesPlayed > 0 && (
                          <div className="bg-white/80 backdrop-blur-sm text-deep-brown text-xs px-2 py-1 rounded-full inline-block">
                            Played {timesPlayed}x
                          </div>
                        )}
                      </div>

                      {/* Game Info */}
                      <div className="p-6">
                        <h3 className="text-xl font-playfair font-bold text-deep-brown mb-2 group-hover:text-saffron transition-colors">
                          {game.title}
                        </h3>
                        <p className="text-deep-brown/70 text-sm mb-4 leading-relaxed">
                          {game.description}
                        </p>

                        {/* Game Stats */}
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-deep-brown/80">Deity:</span>
                            <span className="text-deep-brown font-medium">{game.deityName}</span>
                          </div>
                          {bestScore > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-deep-brown/80">Best Score:</span>
                              <span className="text-deep-brown font-medium">{bestScore}</span>
                            </div>
                          )}
                        </div>

                        {/* CTA Button */}
                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-deep-brown/60">
                              {timesPlayed === 0 ? 'Try Now' : 'Play Again'}
                            </span>
                            <div className="flex items-center text-saffron">
                              <span className="text-sm font-medium">Play →</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {games.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-playfair font-bold text-deep-brown mb-2">
                No Games Available
              </h3>
              <p className="text-deep-brown/70">
                Games will be available once they are added to the platform.
              </p>
            </div>
          )}
        </section>

        {/* Recent Game History */}
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
                      <p className="font-semibold text-deep-brown">{userGame.game.title}</p>
                      <p className="text-sm text-deep-brown/60">
                        Best Score: {userGame.highScore} • {new Date(userGame.lastPlayed).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-deep-brown/80">+{userGame.highScore * 10} punya</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}