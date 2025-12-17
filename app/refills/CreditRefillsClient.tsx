'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, Zap, CreditCard, Sparkles, Loader2 } from 'lucide-react';

interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credits: number;
  price: number;
  currency: string;
  stripe_price_id?: string;
  popular?: boolean;
  bonus_credits?: number;
  features?: string[];
}

// Mock credit packages for demo
const mockCreditPackages: CreditPackage[] = [
  {
    id: 'starter-pack',
    name: 'Starter Pack',
    description: 'Perfect for trying out AI features',
    credits: 1000,
    price: 10,
    currency: 'USD',
    features: [
      'Works with all AI models',
      'Never expires',
      'Instant activation',
      'Email support',
    ],
  },
  {
    id: 'pro-pack',
    name: 'Pro Pack',
    description: 'Best value for regular users',
    credits: 5000,
    price: 40,
    currency: 'USD',
    popular: true,
    bonus_credits: 500,
    features: [
      'Works with all AI models',
      'Never expires',
      'Instant activation',
      '500 bonus credits included',
      'Priority support',
    ],
  },
  {
    id: 'business-pack',
    name: 'Business Pack',
    description: 'For teams and power users',
    credits: 15000,
    price: 100,
    currency: 'USD',
    bonus_credits: 2000,
    features: [
      'Works with all AI models',
      'Never expires',
      'Instant activation',
      '2,000 bonus credits included',
      'Dedicated support',
      'Volume discounts available',
    ],
  },
  {
    id: 'enterprise-pack',
    name: 'Enterprise Pack',
    description: 'Maximum value for high-volume usage',
    credits: 50000,
    price: 300,
    currency: 'USD',
    bonus_credits: 10000,
    features: [
      'Works with all AI models',
      'Never expires',
      'Instant activation',
      '10,000 bonus credits included',
      '24/7 dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function CreditRefillsClient() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [creditPackages] = useState<CreditPackage[]>(mockCreditPackages);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handlePurchase = (creditPackage: CreditPackage) => {
    setSelectedPackage(creditPackage);
    setShowPaymentModal(true);
  };

  const handlePaymentCancel = () => {
    if (!paymentLoading) {
      setShowPaymentModal(false);
      setSelectedPackage(null);
    }
  };

  const handlePayCredits = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedPackage) {
      return;
    }

    setPaymentLoading(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setPaymentLoading(false);
    setShowPaymentModal(false);
    setSelectedPackage(null);

    // In production, this would redirect to success page
    // window.location.href = '/credit-history?purchase=success';
  };

  const getPricePerCredit = (credits: number, price: number, bonusCredits: number = 0) => {
    const totalCredits = credits + bonusCredits;
    return (price / totalCredits).toFixed(3);
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto px-4 md:px-6 pt-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <div className="mb-8">
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <h1 className="text-3xl font-bold text-white mb-4">
            <CreditCard className="inline-block w-8 h-8 mr-3 text-[#4B6FED]" />
            Prompt Credit Refills
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Purchase additional prompt credits to power your AI workflows.
            Credits work across all supported models and never expire.
          </p>
        </motion.div>

        {/* Features Banner */}
        <motion.div
          className="bg-gradient-to-r from-[#4B6FED]/10 to-[#8A63F5]/10 border border-[#4B6FED]/20 rounded-lg p-4 mb-8"
          variants={itemVariants}
        >
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#4B6FED]" />
              <span>Universal Credits</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#4B6FED]" />
              <span>Never Expire</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#4B6FED]" />
              <span>Instant Activation</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#4B6FED]" />
              <span>All AI Models</span>
            </div>
          </div>
        </motion.div>

        {/* Credit Packages */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {creditPackages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              variants={itemVariants}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`relative h-full bg-[#1C2128] border-gray-800 hover:border-[#4B6FED]/50 transition-all duration-300 ${
                  pkg.popular ? 'ring-2 ring-[#4B6FED]/30' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-[#4B6FED] text-white px-4 py-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-white text-xl">{pkg.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {pkg.description}
                  </CardDescription>

                  <div className="pt-4">
                    <div className="text-4xl font-bold text-white">${pkg.price}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      ${getPricePerCredit(pkg.credits, pkg.price, pkg.bonus_credits || 0)}
                      /credit
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="text-center mb-6">
                    <div className="text-2xl font-semibold text-[#4B6FED] mb-1">
                      {pkg.credits.toLocaleString()} Credits
                    </div>
                    {pkg.bonus_credits && (
                      <div className="text-sm text-green-400">
                        + {pkg.bonus_credits.toLocaleString()} bonus credits included!
                      </div>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6">
                    {pkg.features?.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-300"
                      >
                        <Check className="w-4 h-4 text-[#4B6FED] mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-[#4B6FED] to-[#8A63F5] hover:from-[#3A56D3] hover:to-[#7952E6] text-white'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    } transition-all duration-200`}
                    onClick={() => handlePurchase(pkg)}
                    disabled={isLoading === pkg.id}
                  >
                    {isLoading === pkg.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Purchase Credits
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Information Section */}
        <motion.div
          className="mt-12 bg-[#161B22] rounded-lg border border-gray-800 p-6"
          variants={itemVariants}
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            How Credit Refills Work
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-300">
            <div>
              <h4 className="font-medium text-white mb-2">Secure Payment</h4>
              <p>
                All transactions are processed securely through Stripe. Your
                payment information is never stored on our servers.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Instant Credits</h4>
              <p>
                Credits are added to your account immediately after successful
                payment. No waiting periods or manual processing.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Universal Usage</h4>
              <p>
                Use your credits across all supported AI models including GPT-4,
                Claude, Gemini, and more. One credit system for everything.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={handlePaymentCancel}>
        <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Complete Your Purchase</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedPackage && (
                <>
                  You&apos;re purchasing{' '}
                  <strong>{selectedPackage.credits.toLocaleString()} credits</strong> for{' '}
                  <strong>${selectedPackage.price}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePayCredits} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Card Details</label>
              <div className="p-3 bg-gray-800 border border-gray-700 rounded-md">
                <p className="text-gray-500 text-sm">
                  Stripe payment integration will be configured in production.
                </p>
              </div>
            </div>

            <div className="bg-[#1C2128] border border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Package</span>
                <span className="text-white font-medium">{selectedPackage?.name}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Credits</span>
                <span className="text-white">
                  {selectedPackage?.credits.toLocaleString()}
                  {selectedPackage?.bonus_credits && (
                    <span className="text-green-400 text-sm ml-1">
                      (+{selectedPackage.bonus_credits.toLocaleString()} bonus)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                <span className="text-gray-400">Total</span>
                <span className="text-xl font-bold text-white">
                  ${selectedPackage?.price}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handlePaymentCancel}
                disabled={paymentLoading}
                className="flex-1 border-gray-700 text-white hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={paymentLoading}
                className="flex-1 bg-[#4B6FED] hover:bg-[#3A56D3]"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay $${selectedPackage?.price || 0}`
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
