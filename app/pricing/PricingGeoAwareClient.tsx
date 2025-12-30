'use client';

import { useState, useEffect } from 'react';
import { Cpu, Users, Shield, Zap, Check, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, Variants } from 'framer-motion';
import { getUserLocationWithCache } from '@/utils/geoDetection';
import { type PricingTier, getPriceIdForPlan } from '@/config/pricing';
import { pricingService } from '@/services/pricingService';
import type { GeoLocation } from '@/utils/geoDetection';
import { appConfig } from '@/lib/config/app';
import { usePageViewTracking, useConversionTracking } from '@/hooks/useConversionTracking';

type PlanLevel = 'start' | 'pro' | 'teams' | 'enterprise' | 'free' | 'scale' | 'individual' | 'hobbyist' | 'zerodb_free' | 'zerodb_pro' | 'zerodb_scale' | 'cody' | 'swarm';

interface PricingPlan {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  price: string;
  sub?: string;
  description: string;
  subtitle?: string;
  features: string[];
  use_cases?: string;
  buttonText: string;
  highlighted: boolean;
  stripePriceId?: string;
  url?: string;
  level: PlanLevel;
}

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
    },
  }),
};

// Helper function to get icon for plan name
const getIconForPlan = (planName: string) => {
  const name = planName.toLowerCase();
  if (name.includes('hobbyist') || name.includes('free')) return Cpu;
  if (name.includes('individual')) return Zap;
  if (name.includes('dev teams') || name.includes('teams')) return Users;
  if (name.includes('zerodb')) return Shield;
  if (name.includes('cody')) return Cpu;
  if (name.includes('swarm')) return Zap;
  return Cpu;
};

const CALENDLY_URL = appConfig.links.calendly;

const fallbackPlans: PricingPlan[] = [
  {
    id: 'hobbyist',
    name: 'Start',
    icon: Cpu,
    price: 'Free',
    sub: '',
    buttonText: 'Get Started',
    description: 'Perfect for trying out AI Native Studio',
    features: [
      '50 completions/month',
      'Community support',
      'Basic AI assistance',
    ],
    level: 'start',
    highlighted: true,
    url: '/login',
  },
  {
    id: 'individual',
    name: 'Pro',
    icon: Zap,
    price: '$10',
    sub: '/month',
    buttonText: 'Upgrade to Pro',
    description: 'For individual developers',
    features: [
      'Unlimited completions',
      'Hosted models and memory',
      '5 custom agents',
      'Semantic code context',
      'Quantum Boost add-on',
      'Priority support',
    ],
    level: 'pro',
    highlighted: false,
    stripePriceId: appConfig.pricing.stripeKeys.pro,
  },
  {
    id: 'teams',
    name: 'Teams',
    icon: Users,
    price: '$60',
    sub: '/user/month',
    buttonText: 'Start Free Trial',
    description: 'For growing development teams',
    features: [
      'Everything in Pro',
      'Admin dashboard',
      'Usage analytics',
      'Private VPC hosting',
      'SSO integration',
      'Team collaboration tools',
    ],
    level: 'teams',
    highlighted: false,
    stripePriceId: appConfig.pricing.stripeKeys.teams,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Shield,
    price: 'Custom',
    sub: '',
    buttonText: 'Contact Sales',
    description: 'Custom solutions for large organizations',
    features: [
      'Everything in Teams',
      'RBAC & role management',
      'Hybrid deployments',
      'Access to QNN APIs',
      'Custom training',
      'Volume pricing',
      'Dedicated support',
    ],
    level: 'enterprise',
    highlighted: false,
    url: CALENDLY_URL,
  },
];

export default function PricingGeoAwareClient() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [pricingTier, setPricingTier] = useState<PricingTier>('premium');
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [plans, setPlans] = useState<PricingPlan[]>(fallbackPlans);
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);
  const [pricingError, setPricingError] = useState<string | null>(null);

  // Conversion tracking
  usePageViewTracking(); // Automatically tracks page view
  const { updateFunnel } = useConversionTracking();

  // Detect user location on mount
  useEffect(() => {
    async function detectLocation() {
      setIsLoadingLocation(true);
      try {
        const userLocation = await getUserLocationWithCache();
        setLocation(userLocation);
        setPricingTier(userLocation.pricingTier);

        // Track pricing tier detection
        if (typeof window !== 'undefined') {
          const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
          if (gtag) {
            gtag('event', 'pricing_tier_detected', {
              pricing_tier: userLocation.pricingTier,
              country: userLocation.country,
              country_code: userLocation.countryCode,
              is_india: userLocation.pricingTier === 'india',
            });
          }
        }

        // Track pricing page visit in conversion funnel
        updateFunnel('visited_pricing');
      } catch (error) {
        console.error('Failed to detect location:', error);
        setPricingTier('premium');
      } finally {
        setIsLoadingLocation(false);
      }
    }
    detectLocation();
  }, [updateFunnel]);

  // Fetch pricing plans from API and apply geo-based pricing
  useEffect(() => {
    if (isLoadingLocation) return; // Wait for location detection first

    async function fetchAndTransformPricing() {
      setIsLoadingPricing(true);
      setPricingError(null);

      try {
        const pricingPlans = await pricingService.getPricingPlansWithFallback();

        console.log('[GEO-PRICING] Fetched plans:', pricingPlans.length);
        console.log('[GEO-PRICING] Detected tier:', pricingTier);

        // Filter out zerodb_free and zerodb_enterprise (same as original)
        const filteredPlans = pricingPlans.filter((plan) => {
          const planId = plan.id.toLowerCase();
          if (planId === 'zerodb_free' || planId === 'zerodb_enterprise') {
            return false;
          }
          return true;
        });

        // Transform plans based on pricing tier
        const transformedPlans: PricingPlan[] = filteredPlans.map((plan) => {
          // Get geo-specific price ID
          const geoPriceId = getPriceIdForPlan(plan.id, pricingTier);

          // For India tier, transform pricing display
          let price = plan.price === 0 ? 'Free' : plan.price === null ? 'Custom' : `$${plan.price}`;
          let sub = plan.billing_period ? `/${plan.billing_period}` : '';

          if (pricingTier === 'india' && plan.price !== null && plan.price !== 0) {
            // Apply India pricing transformation based on plan ID
            const indiaPricing: Record<string, { price: string; sub: string }> = {
              individual: { price: '\u20B9249', sub: '/month (~$3 USD)' },
              teams: { price: '\u20B9999', sub: '/month (~$12 USD)' },
              enterprise: { price: '\u20B93,999', sub: '/month (~$48 USD)' },
              sre: { price: '\u20B93,999', sub: '/month (~$48 USD)' }, // Site Reliability Engineer Agent
              sre_agent: { price: '\u20B93,999', sub: '/month (~$48 USD)' }, // Alias
              zerodb_pro: { price: '\u20B9499', sub: '/month (~$6 USD)' },
              zerodb_scale: { price: '\u20B91,999', sub: '/month (~$24 USD)' },
              cody: { price: '\u20B97,999', sub: '/month (~$96 USD)' },
              swarm: { price: '\u20B919,999', sub: '/month (~$240 USD)' },
            };

            const indiaPrice = indiaPricing[plan.id.toLowerCase()];
            if (indiaPrice) {
              price = indiaPrice.price;
              sub = indiaPrice.sub;
            }
          }

          return {
            id: plan.id,
            name: plan.name,
            icon: getIconForPlan(plan.name),
            price,
            sub,
            buttonText: plan.button_text,
            description: plan.description,
            subtitle: plan.subtitle,
            features: plan.features || [],
            use_cases: plan.use_cases,
            level: plan.level,
            highlighted: plan.highlighted,
            stripePriceId: geoPriceId || plan.stripe_price_id, // Use geo-specific ID if available
            url: plan.url,
          };
        });

        setPlans(transformedPlans);
      } catch (error) {
        console.error('[GEO-PRICING] Error fetching pricing:', error);
        setPricingError('Failed to load current pricing. Please refresh or contact support.');
      } finally {
        setIsLoadingPricing(false);
      }
    }

    fetchAndTransformPricing();
  }, [pricingTier, isLoadingLocation]);

  const handlePlanClick = async (plan: PricingPlan) => {
    // Track plan click
    if (typeof window !== 'undefined') {
      const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
      if (gtag) {
        gtag('event', 'pricing_plan_clicked', {
          plan_id: plan.id,
          plan_name: plan.name,
          plan_price: plan.price,
          pricing_tier: pricingTier,
          country_code: location?.countryCode || 'UNKNOWN',
          is_india: pricingTier === 'india',
        });
      }
    }

    if (plan.url) {
      if (plan.url.startsWith('http')) {
        window.open(plan.url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = plan.url;
      }
    } else if (plan.stripePriceId && plan.id !== 'hobbyist') {
      try {
        console.log(`[GEO-PRICING] Creating checkout for: ${plan.name} (Tier: ${pricingTier}, Price ID: ${plan.stripePriceId})`);

        const checkoutSession = await pricingService.createCheckoutSession(plan.id, {
          stripePriceId: plan.stripePriceId, // Pass geo-specific price ID
          successUrl: `${window.location.origin}/billing/success`,
          cancelUrl: `${window.location.origin}/pricing`,
          metadata: {
            plan_name: plan.name,
            plan_id: plan.id,
            pricing_tier: pricingTier,
            country_code: location?.countryCode || 'UNKNOWN',
          },
        });

        // Track successful Stripe checkout initiation
        if (typeof window !== 'undefined') {
          const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
          if (gtag) {
            gtag('event', 'stripe_checkout_initiated', {
              plan_id: plan.id,
              plan_name: plan.name,
              plan_price: plan.price,
              stripe_price_id: plan.stripePriceId,
              pricing_tier: pricingTier,
              country_code: location?.countryCode || 'UNKNOWN',
              is_india: pricingTier === 'india',
              session_id: checkoutSession.sessionId,
            });
          }
        }

        window.location.href = checkoutSession.sessionUrl;
      } catch (error) {
        console.error('[GEO-PRICING] Checkout error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';

        // Track checkout error
        if (typeof window !== 'undefined') {
          const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
          if (gtag) {
            gtag('event', 'stripe_checkout_error', {
              plan_id: plan.id,
              plan_name: plan.name,
              pricing_tier: pricingTier,
              country_code: location?.countryCode || 'UNKNOWN',
              error_message: errorMessage,
            });
          }
        }

        alert(`Unable to start subscription checkout: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`);
      }
    } else if (plan.id !== 'hobbyist') {
      alert('This plan is not available for online purchase. Please contact support.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white py-28">
      <div className="max-w-screen-xl mx-auto px-6 space-y-12">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <p className="text-sm uppercase tracking-wider text-[#4B6FED]/80">Pricing</p>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#4B6FED] to-[#8A63F5] bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Regional pricing tailored for your location. Pay what&apos;s fair.
          </p>

          {/* Location indicator */}
          {!isLoadingLocation && location && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onAnimationComplete={() => {
                // Track India discount badge view
                if (pricingTier === 'india' && typeof window !== 'undefined') {
                  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
                  if (gtag) {
                    gtag('event', 'india_discount_badge_viewed', {
                      country: location.country,
                      country_code: location.countryCode,
                      discount_percentage: 80,
                    });
                  }
                }
              }}
              className="inline-flex items-center gap-2 bg-[#1C2128] border border-white/10 rounded-full px-4 py-2 text-sm"
            >
              <Map className="h-4 w-4 text-[#4B6FED]" />
              <span className="text-gray-300">
                Pricing for <span className="font-semibold text-white">{location.country}</span>
                {pricingTier === 'india' && (
                  <span className="ml-2 text-green-400 text-xs">(80% discount applied)</span>
                )}
              </span>
            </motion.div>
          )}
        </motion.header>

        {/* Loading State */}
        {(isLoadingLocation || isLoadingPricing) && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4B6FED] mx-auto mb-4"></div>
            <p className="text-gray-400">
              {isLoadingLocation ? 'Detecting your location...' : 'Loading pricing...'}
            </p>
          </div>
        )}

        {/* Error Banner */}
        {pricingError && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-center">
            <p className="text-red-400 mb-2">{pricingError}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
              className="border-red-700 text-red-400 hover:bg-red-900/30"
            >
              Retry Loading
            </Button>
          </div>
        )}

        {/* Pricing Cards */}
        {!isLoadingLocation && !isLoadingPricing && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, i) => (
              <motion.article
                key={plan.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={fadeIn}
                className={`
                  rounded-2xl relative overflow-hidden p-6 h-full flex flex-col
                  ${plan.highlighted
                    ? 'border-2 border-[#4B6FED] shadow-lg bg-[#1D2230]'
                    : 'border border-white/10 bg-[#1C2128]'}
                  transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
                `}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 right-0 bg-[#4B6FED] text-white text-xs font-semibold px-3 py-1 rounded-bl-md shadow-md">
                    POPULAR
                  </div>
                )}

                <plan.icon className="h-6 w-6 text-[#4B6FED] mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-4 h-12">{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.sub && (
                      <span className="ml-2 text-sm text-gray-400">{plan.sub}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mt-6 flex-1">
                  {plan.features.map((feature, index) => (
                    <div key={`${plan.id}-${index}`} className="flex items-start group">
                      <Check className="h-5 w-5 text-[#4B6FED] mt-0.5 mr-2 transition-transform duration-200 group-hover:scale-110" />
                      <span className="text-sm text-white">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <Button
                    onClick={() => handlePlanClick(plan)}
                    className={`w-full ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-[#4B6FED] to-[#8A63F5] text-white hover:opacity-90'
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {plan.buttonText}
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center pt-12 border-t border-white/10"
        >
          <p className="text-sm text-gray-400 mb-4">Trusted by developers worldwide</p>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Secure payments via Stripe</span>
            </div>
            <div>Cancel anytime</div>
            <div>7-day money-back guarantee</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
