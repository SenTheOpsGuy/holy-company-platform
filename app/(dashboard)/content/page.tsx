import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ContentPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/');
    return null;
  }

  // Get all content
  const content = await prisma.content.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  // Get content by type for organization
  const videos = content.filter(c => c.type === 'VIDEO');
  const articles = content.filter(c => c.type === 'ARTICLE');
  const images = content.filter(c => c.type === 'IMAGE');

  return (
    <div className="min-h-screen bg-cream safe-top">
      {/* Header */}
      <header className="bg-gradient-to-r from-temple-brown to-deep-brown text-cream p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-playfair font-bold mb-2">
            Sacred Content 📖
          </h1>
          <p className="text-cream/80">
            Explore videos, articles, and images about Hindu traditions
          </p>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Stats Overview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-2">🎥</div>
            <div className="text-2xl font-bold text-deep-brown">{videos.length}</div>
            <div className="text-sm text-deep-brown/60">Videos</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-2">📖</div>
            <div className="text-2xl font-bold text-deep-brown">{articles.length}</div>
            <div className="text-sm text-deep-brown/60">Articles</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-2">🖼️</div>
            <div className="text-2xl font-bold text-deep-brown">{images.length}</div>
            <div className="text-sm text-deep-brown/60">Images</div>
          </div>
        </section>

        {/* Content Sections */}
        {videos.length > 0 && (
          <section>
            <h2 className="text-xl font-playfair font-bold text-deep-brown mb-4">
              Videos 🎥
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.slice(0, 4).map((item) => (
                <Link key={item.id} href={`/content/${item.id}`}>
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <div className="bg-gradient-to-br from-saffron/20 to-gold/20 p-6 text-center">
                      <div className="text-4xl mb-2">🎥</div>
                      <h3 className="font-playfair font-bold text-deep-brown group-hover:text-saffron transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-deep-brown/70 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mt-3 text-xs text-deep-brown/60">
                        <span>{item.category}</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {articles.length > 0 && (
          <section>
            <h2 className="text-xl font-playfair font-bold text-deep-brown mb-4">
              Articles 📖
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.slice(0, 4).map((item) => (
                <Link key={item.id} href={`/content/${item.id}`}>
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <div className="bg-gradient-to-br from-saffron/20 to-gold/20 p-6 text-center">
                      <div className="text-4xl mb-2">📖</div>
                      <h3 className="font-playfair font-bold text-deep-brown group-hover:text-saffron transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-deep-brown/70 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mt-3 text-xs text-deep-brown/60">
                        <span>{item.category}</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {images.length > 0 && (
          <section>
            <h2 className="text-xl font-playfair font-bold text-deep-brown mb-4">
              Sacred Images 🖼️
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {images.slice(0, 6).map((item) => (
                <Link key={item.id} href={`/content/${item.id}`}>
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <div className="bg-gradient-to-br from-saffron/20 to-gold/20 p-6 text-center">
                      <div className="text-4xl mb-2">🖼️</div>
                      <h3 className="font-playfair font-bold text-deep-brown group-hover:text-saffron transition-colors text-sm">
                        {item.title}
                      </h3>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between text-xs text-deep-brown/60">
                        <span>{item.category}</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {content.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-playfair font-bold text-deep-brown mb-2">
              No Content Available
            </h3>
            <p className="text-deep-brown/70">
              Sacred content will appear here once added to the platform.
            </p>
          </div>
        )}

        {/* View All Link */}
        {content.length > 12 && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all">
              <span className="text-deep-brown font-medium">View All Content</span>
              <span className="text-saffron">→</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}