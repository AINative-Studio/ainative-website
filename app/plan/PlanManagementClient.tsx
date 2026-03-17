
'use client';
import React from "react";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { pricingService, type PricingPlan } from '@/services/pricingService';
import { getPriceIdForPlan } from '@/config/pricing';
import apiClient from '@/lib/api-client';
import { appConfig } from '@/lib/config/app';

export default function PlanManagementClient() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string>('hobbyist');
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch plans and current subscription in parallel
        const [plansData, subRes] = await Promise.allSettled([
          pricingService.getPricingPlansWithFallback(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          apiClient.get<any>('/api/v1/public/subscription'),
        ]);

        if (plansData.status === 'fulfilled') {
          setPlans(plansData.value);
        }

        if (subRes.status === 'fulfilled') {
          const sub = subRes.value.data?.data?.subscription;
          if (sub?.plan) {
            setCurrentPlanId(sub.plan);
          }
        }
      } catch (err) {
        console.error('Error loading plan data:', err);
        setError('Failed to load plans');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePlanClick = async (plan: PricingPlan) => {
    // Free plans - no checkout needed
    if (plan.price === 0) {
      return;
    }

    // Resolve Stripe price ID: API value first, then config fallback
    const stripePriceId = plan.stripe_price_id || getPriceIdForPlan(plan.id, 'premium');

    if (!stripePriceId) {
      // No price ID at all - contact sales
      window.open(appConfig.links.calendly, '_blank', 'noopener,noreferrer');
      return;
    }

    setCheckoutLoading(plan.id);
    try {
      const { sessionUrl } = await pricingService.createCheckoutSession(plan.id, {
        stripePriceId,
        successUrl: `${window.location.origin}/plan?success=true`,
        cancelUrl: `${window.location.origin}/plan`,
      });
      window.location.href = sessionUrl;
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to create checkout session. Please try again.');
      setCheckoutLoading(null);
    }
  };

  const getButtonText = (plan: PricingPlan) => {
    if (plan.id === currentPlanId) return 'Current Plan';
    if (plan.price === 0) return 'Free';
    // Check both API and config for stripe price ID
    const hasCheckout = plan.stripe_price_id || getPriceIdForPlan(plan.id, 'premium');
    if (!hasCheckout) return 'Contact Sales';
    return 'Choose Plan';
  };

  const isCurrentPlan = (plan: PricingPlan) => plan.id === currentPlanId;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#4B6FED]" />
      </div>
    );
  }

  // Organize plans into categories
  const codingPlans = plans.filter(p => ['hobbyist', 'individual', 'teams'].includes(p.id));
  const zerodbPlans = plans.filter(p => p.id.startsWith('zerodb'));
  const agentPlans = plans.filter(p => ['cody', 'swarm', 'sre'].includes(p.id));

  const renderPlanCard = (plan: PricingPlan, index: number, highlightIds: string[] = []) => {
    const isCurrent = isCurrentPlan(plan);
    const isHighlighted = highlightIds.includes(plan.id);

    return (
      <motion.div
        key={plan.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`relative rounded-xl p-6 flex flex-col ${
          isCurrent
            ? 'border-2 border-green-500/50 bg-green-500/5'
            : isHighlighted
            ? 'border-2 border-[#4B6FED] bg-[#1D2230] shadow-lg shadow-[#4B6FED]/10'
            : 'border border-white/10 bg-[#1C2128]'
        }`}
      >
        {isCurrent && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-green-500 text-white">Current Plan</Badge>
          </div>
        )}
        {isHighlighted && !isCurrent && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-[#4B6FED] text-white">Popular</Badge>
          </div>
        )}

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
          <p className="text-sm text-gray-400 mt-1">{plan.description}</p>
        </div>

        <div className="mb-6">
          <span className="text-3xl font-bold text-white">
            {plan.price === 0 ? 'Free' : `$${plan.price}`}
          </span>
          {plan.price > 0 && <span className="text-gray-400 ml-1">/month</span>}
        </div>

        <div className="space-y-2.5 flex-1 mb-6">
          {(plan.features || []).map((feature, i) => (
            <div key={i} className="flex items-start">
              <Check className="h-4 w-4 text-[#4B6FED] mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-300">{feature}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={() => handlePlanClick(plan)}
          disabled={isCurrent || checkoutLoading === plan.id}
          className={`w-full ${
            isCurrent
              ? 'bg-green-500/20 text-green-400 cursor-default'
              : isHighlighted
              ? 'bg-gradient-to-r from-[#4B6FED] to-[#8A63F5] text-white hover:opacity-90'
              : 'bg-white/5 text-white hover:bg-white/10 dark:bg-dark-3 dark:hover:bg-white/10'
          }`}
        >
          {checkoutLoading === plan.id ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </span>
          ) : (
            getButtonText(plan)
          )}
        </Button>
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-2">Choose Your Plan</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Pick the right plan for how you build. From solo hacking to full AI dev teams.
        </p>
        {currentPlanId !== 'hobbyist' && (
          <Badge className="mt-4 bg-[#4B6FED]/20 text-[#4B6FED] border-[#4B6FED]/30">
            <Crown className="h-3 w-3 mr-1" />
            Current plan: {plans.find(p => p.id === currentPlanId)?.name || currentPlanId}
          </Badge>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Section 1: AI Coding Services */}
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">⚡</span> AI Coding Services
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            AI-native development tools, hosted models, and coding infrastructure for developers and teams.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {codingPlans.map((plan, i) => renderPlanCard(plan, i, ['individual']))}
        </div>
      </div>

      {/* Section 2: ZeroDB Data Platform */}
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🧱</span> ZeroDB — AI Data Platform
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Vector storage, NoSQL tables, event streams, and all agentic APIs — everything you need to build AI-native apps.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {zerodbPlans.map((plan, i) => renderPlanCard(plan, i, ['zerodb_pro']))}
        </div>
      </div>

      {/* Section 3: Digital Employees (Agents) */}
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🤖</span> Digital Employees — AI Agents
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Autonomous AI agents that write code, manage infrastructure, and ship production-ready software.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {agentPlans.map((plan, i) => renderPlanCard(plan, i, ['cody']))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-400 text-sm border-t border-white/5 pt-8">
        <p>Need a custom plan? <a href={appConfig.links.calendly} target="_blank" rel="noopener noreferrer" className="text-[#4B6FED] hover:underline">Contact our sales team</a></p>
        <p className="mt-2">All plans include a 14-day money-back guarantee. Cancel anytime.</p>
      </div>
    </div>
  );
}
