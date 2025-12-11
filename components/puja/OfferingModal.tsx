'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Gift } from 'lucide-react';

interface OfferingModalProps {
  deity: {
    name: string;
    icon: string;
  };
  onOfferingComplete: (amount: number) => void;
}

const offeringAmounts = [
  { amount: 11, label: '₹11', description: 'Auspicious beginning' },
  { amount: 51, label: '₹51', description: 'Traditional offering' },
  { amount: 101, label: '₹101', description: 'Prosperity blessing' },
  { amount: 111, label: '₹111', description: 'Divine protection' },
  { amount: 501, label: '₹501', description: 'Special devotion' },
  { amount: 1001, label: '₹1001', description: 'Grand offering' }
];

export default function OfferingModal({ deity, onOfferingComplete }: OfferingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOfferingSubmit = async () => {
    const amount = selectedAmount || parseInt(customAmount);
    if (!amount || amount < 1) return;

    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onOfferingComplete(amount);
    setIsProcessing(false);
    setIsOpen(false);
    setSelectedAmount(null);
    setCustomAmount('');
  };

  return (
    <>
      {/* Open Modal Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-sacred-gold to-auspicious-saffron text-deep-brown font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          <Gift size={20} />
          <span>Make an Offering</span>
        </div>
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-sacred-gold to-auspicious-saffron p-6 rounded-t-2xl text-deep-brown">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{deity.icon}</div>
                    <div>
                      <h2 className="text-xl font-playfair font-bold">
                        Offering to {deity.name}
                      </h2>
                      <p className="text-sm text-deep-brown/80">
                        Express your devotion through traditional offering
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Offering Benefits */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="text-red-500" size={16} />
                    <span className="text-sm font-semibold text-amber-800">
                      Offering Benefits
                    </span>
                  </div>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• 5x Punya points bonus for your puja</li>
                    <li>• Special blessing card from {deity.name}</li>
                    <li>• Priority in divine grace queue</li>
                    <li>• Support temple maintenance</li>
                  </ul>
                </div>

                {/* Preset Amounts */}
                <div className="mb-6">
                  <h3 className="text-lg font-playfair font-bold text-deep-brown mb-4">
                    Choose Amount
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {offeringAmounts.map((offering) => (
                      <button
                        key={offering.amount}
                        onClick={() => {
                          setSelectedAmount(offering.amount);
                          setCustomAmount('');
                        }}
                        className={`
                          p-4 border-2 rounded-lg text-left transition-all
                          ${selectedAmount === offering.amount
                            ? 'border-sacred-gold bg-sacred-gold/10 shadow-md'
                            : 'border-gray-200 hover:border-sacred-gold/50 hover:bg-sacred-gold/5'
                          }
                        `}
                      >
                        <div className="font-bold text-deep-brown">
                          {offering.label}
                        </div>
                        <div className="text-xs text-deep-brown/70">
                          {offering.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-deep-brown mb-2">
                    Or enter custom amount:
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      placeholder="Enter amount"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sacred-gold focus:border-sacred-gold"
                      min="1"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum offering: ₹1
                  </p>
                </div>

                {/* Payment Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-600">🔒</span>
                    <span className="text-sm font-semibold text-blue-800">
                      Secure Payment
                    </span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Your payment is processed securely through Cashfree. 
                    We never store your payment information.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    disabled={isProcessing}
                    className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleOfferingSubmit}
                    disabled={isProcessing || (!selectedAmount && !customAmount)}
                    className="flex-1 bg-gradient-to-r from-sacred-gold to-auspicious-saffron text-deep-brown font-semibold py-3 px-6 rounded-lg hover:shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-deep-brown/30 border-t-deep-brown rounded-full animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      `Offer ₹${selectedAmount || customAmount || 0}`
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}