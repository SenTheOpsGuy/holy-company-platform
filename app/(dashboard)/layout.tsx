import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import BottomNav from '@/components/ui/BottomNav';
import DesktopNav from '@/components/ui/DesktopNav';

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
          <DesktopNav />
          <main className="pb-20 md:pb-0 md:pt-16">
            {children}
          </main>
          <BottomNav />
        </div>
      </SignedIn>
    </>
  );
}