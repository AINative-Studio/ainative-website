
'use client';
import React from "react";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, CreditCard, Sparkles, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { pricingService } from '@/services/pricingService';
import { getAuthToken } from '@/utils/authCookies';

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function CreditRefillsClient() {
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [packagesRes, balanceRes] = await Promise.allSettled([
          apiClient.get<any>('/api/v1/public/credits/packages'),
          apiClient.get<any>('/api/v1/public/credits/balance'),
        ]);

        if (packagesRes.status === 'fulfilled') {
          const data = packagesRes.value.data;
          const packages = data?.data?.packages || data?.packages || [];
          setCreditPackages(packages);
        }

        if (balanceRes.status === 'fulfilled') {
          const data = balanceRes.value.data;
          const balance = data?.data || data;
          setCurrentBalance(balance?.remaining_credits ?? balance?.available ?? null);
        }
      } catch (err) {
        console.error('Failed to load credit packages:', err);
        setError('Failed to load credit packages');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePurchase = async (pkg: CreditPackage) => {
    setCheckoutLoading(pkg.id);
    setError(null);

    try {
      // Use Stripe Checkout via pricing service
      const { sessionUrl } = await pricingService.createCheckoutSession(pkg.id, {
        stripePriceId: pkg.stripe_price_id,
        successUrl: `${window.location.origin}/credit-history?purchase=success`,
        cancelUrl: `${window.location.origin}/refills`,
        metadata: {
          type: 'credit_refill',
          package_id: pkg.id,
          credits: String(pkg.credits),
        },
      });
      window.location.href = sessionUrl;
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to create checkout. Please try again.');
      setCheckoutLoading(null);
    }
  };

  const getPricePerCredit = (credits: number, price: number, bonusCredits: number = 0) => {
    const totalCredits = credits + bonusCredits;
    return (price / totalCredits).toFixed(3);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#4B6FED]" />
      </div>
    );
  }

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
          {currentBalance !== null && (
            <div className="mt-4 inline-flex items-center gap-2 bg-[#4B6FED]/10 border border-[#4B6FED]/20 rounded-full px-4 py-2">
              <Zap className="w-4 h-4 text-[#4B6FED]" />
              <span className="text-white font-medium">
                Current Balance: {currentBalance.toLocaleString()} credits
              </span>
            </div>
          )}
        </motion.div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-center">
            {error}
          </div>
        )}

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
        <div className={`grid gap-6 max-w-4xl mx-auto ${
          creditPackages.length <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'
        }`}>
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
                      Best Value
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
                    {pkg.bonus_credits && pkg.bonus_credits > 0 && (
                      <div className="text-sm text-green-400">
                        + {pkg.bonus_credits.toLocaleString()} bonus credits included!
                      </div>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6">
                    {pkg.features?.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
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
                    disabled={checkoutLoading === pkg.id}
                  >
                    {checkoutLoading === pkg.id ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Redirecting to Stripe...
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

        {creditPackages.length === 0 && !loading && (
          <div className="text-center text-gray-400 py-12">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p>No credit packages available at this time.</p>
          </div>
        )}

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
    </motion.div>
  );
}
