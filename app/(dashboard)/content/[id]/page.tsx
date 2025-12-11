import { currentUser } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface ContentDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ContentDetailPage({ params }: ContentDetailPageProps) {
  const user = await currentUser();
  
  if (!user) {
    redirect('/');
    return null;
  }

  // Get content by ID
  const content = await prisma.content.findUnique({
    where: { id: params.id }
  });

  if (!content) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-gradient-to-r from-temple-brown to-deep-brown text-cream p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-playfair font-bold">{content.title}</h1>
          <p className="text-cream/80">{content.type} " {content.category}</p>
        </div>
      </header>
      
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">
                {content.type === 'VIDEO' && '<¥'}
                {content.type === 'ARTICLE' && '=Ö'}
                {content.type === 'IMAGE' && '=¼'}
              </div>
              <div>
                <h2 className="text-xl font-playfair font-bold text-deep-brown">{content.title}</h2>
                <p className="text-deep-brown/60">{content.category}</p>
              </div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-deep-brown/80 leading-relaxed mb-6">
              {content.description}
            </p>

            {content.imageUrl && (
              <div className="my-8">
                <img 
                  src={content.imageUrl} 
                  alt={content.title}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            )}

            {content.videoUrl && (
              <div className="my-8">
                <div className="aspect-video">
                  <iframe
                    src={content.videoUrl}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-deep-brown/60">
              Published on {new Date(content.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}