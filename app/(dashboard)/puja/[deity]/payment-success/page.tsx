'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function PaymentSuccessPage({ params }: { params: { deity: string } }) {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [paymentData, setPaymentData] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const orderId = searchParams.get('order_id');
    const orderToken = searchParams.get('order_token');

    if (!orderId) {
      setVerificationStatus('failed');
      return;
    }

    verifyPayment(orderId);
  }, [isLoaded, user, searchParams]);

  const verifyPayment = async (orderId: string) => {
    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (data.success && data.paid) {
        setVerificationStatus('success');
        setPaymentData(data);
        
        // Redirect back to puja page after 3 seconds
        setTimeout(() => {
          router.push(`/puja/${params.deity}?payment=success&amount=${data.amount}`);
        }, 3000);
      } else {
        setVerificationStatus('failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setVerificationStatus('failed');
    }
  };

  const redirectToPuja = () => {
    if (paymentData) {
      router.push(`/puja/${params.deity}?payment=success&amount=${paymentData.amount}`);
    } else {
      router.push(`/puja/${params.deity}`);
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-cream">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-deep-brown">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-cream p-4">
      <div className="max-w-md w-full">
        {verificationStatus === 'loading' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-bold text-deep-brown mb-2">Verifying Payment</h2>
            <p className="text-stone-600">Please wait while we confirm your offering...</p>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-stone-600 mb-6">
              Your offering of ₹{paymentData?.amount} has been received with gratitude.
              <br />
              May divine blessings be upon you.
            </p>
            <div className="space-y-3">
              <button
                onClick={redirectToPuja}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition"
              >
                Continue to Puja
              </button>
              <p className="text-sm text-stone-500">Redirecting automatically in 3 seconds...</p>
            </div>
          </div>
        )}

        {verificationStatus === 'failed' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl">✗</span>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
            <p className="text-stone-600 mb-6">
              We couldn't verify your payment. Please try again or contact support if the issue persists.
            </p>
            <div className="space-y-3">
              <button
                onClick={redirectToPuja}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition"
              >
                Return to Puja
              </button>
              <button
                onClick={() => router.push('/home')}
                className="w-full py-2 text-stone-500 hover:text-stone-700 transition text-sm"
              >
                Go to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}