import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-playfair font-bold text-deep-brown mb-2">
            Join The Holy Company
          </h1>
          <p className="text-deep-brown/70">
            Create your account to start your spiritual journey
          </p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl border-0 bg-white rounded-2xl",
            }
          }}
        />
      </div>
    </div>
  );
}