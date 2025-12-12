import { currentUser } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface ContentPageProps {
  params: {
    id: string;
  };
}

async function getContent(id: string) {
  return await prisma.content.findUnique({
    where: { id },
  });
}

export default async function ContentPage({ params }: ContentPageProps) {
  const user = await currentUser();
  
  if (!user) {
    redirect('/');
  }

  const content = await getContent(params.id);

  if (!content) {
    notFound();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{content.title}</h1>
      <div className="prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: content.content }} />
      </div>
    </div>
  );
}