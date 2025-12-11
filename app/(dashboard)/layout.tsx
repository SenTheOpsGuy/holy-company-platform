import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import BottomNav from '@/components/ui/BottomNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className="min-h-screen bg-cream">
          <main className="pb-20">
            {children}
          </main>
          <BottomNav />
        </div>
      </SignedIn>
    </>
  );
}