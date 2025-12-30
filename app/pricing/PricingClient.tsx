'use client';

import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { Cpu, Shield, Users, Zap, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pricingService, type PricingPlan } from '@/services/pricingService';
import { appConfig } from '@/lib/config/app';

// Types
type PlanLevel = 'start' | 'pro' | 'teams' | 'enterprise' | 'free' | 'scale' | 'individual' | 'hobbyist' | 'zerodb_free' | 'zerodb_pro' | 'zerodb_scale' | 'cody' | 'swarm';

interface Plan {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  price: string;
  sub?: string;
  buttonText: string;
  description: string;
  subtitle?: string;
  features: string[];
  use_cases?: string;
  level: PlanLevel;
  highlight: boolean;
  url?: string;
  priceId?: string;
}

// Animation variants
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

const CALENDLY_URL = appConfig.links.calendly;

const fallbackPlans: Plan[] = [
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
      'Basic AI assistance'
    ],
    level: 'start',
    highlight: true,
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
      'Priority support'
    ],
    level: 'pro',
    highlight: false,
    priceId: appConfig.pricing.stripeKeys.pro,
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
      'Team collaboration tools'
    ],
    level: 'teams',
    highlight: false,
    priceId: appConfig.pricing.stripeKeys.teams,
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
      'Dedicated support'
    ],
    level: 'enterprise',
    highlight: false,
    url: CALENDLY_URL,
  },
];

// Helper function to get icon for plan name
const getIconForPlan = (planName: string) => {
  const name = planName.toLowerCase();
  if (name.includes('hobbyist') || name.includes('free') || name.includes('start')) return Cpu;
  if (name.includes('individual') || name.includes('pro')) return Zap;
  if (name.includes('dev teams') || name.includes('teams')) return Users;
  if (name.includes('zerodb') || name.includes('enterprise')) return Shield;
  if (name.includes('cody')) return Cpu;
  if (name.includes('swarm')) return Zap;
  return Cpu;
};

export default function PricingClient() {
  const [plans, setPlans] = useState<Plan[]>(fallbackPlans);
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState<string | null>(null);

  // Fetch pricing plans from API
  const fetchPricingPlans = async () => {
    setIsLoadingPricing(true);
    setPricingError(null);
    try {
      const pricingPlans = await pricingService.getPricingPlansWithFallback();

      // Show exactly 7 plans: 5 dev plans + 2 paid ZeroDB subscriptions (Pro and Scale)
      // Exclude: zerodb_free and zerodb_enterprise
      const filteredPlans = pricingPlans.filter((plan: PricingPlan) => {
        const planId = plan.id.toLowerCase();
        // Exclude ZeroDB Free and Enterprise - only show Pro and Scale
        if (planId === 'zerodb_free' || planId === 'zerodb_enterprise') {
          return false;
        }
        return true;
      });

      // Map API response to Plan format
      const apiPlans: Plan[] = filteredPlans.map((plan: PricingPlan) => ({
        id: plan.id,
        name: plan.name,
        icon: getIconForPlan(plan.name),
        price: plan.price === 0 ? 'Free' : plan.price === null ? 'Custom' : `$${plan.price}`,
        sub: plan.billing_period ? `/${plan.billing_period}` : '',
        buttonText: plan.button_text,
        description: plan.description,
        subtitle: plan.subtitle,
        features: plan.features || [],
        use_cases: plan.use_cases,
        level: plan.level,
        highlight: plan.highlighted,
        priceId: plan.stripe_price_id,
        url: plan.url,
      }));

      setPlans(apiPlans);
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      setPricingError('Failed to load current pricing. Please refresh or contact support.');
      // Keep fallback plans on error
    } finally {
      setIsLoadingPricing(false);
    }
  };

  // Load pricing on component mount
  useEffect(() => {
    fetchPricingPlans();

    // Re-fetch when storage changes (login/logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        fetchPricingPlans();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handlePlanClick = async (plan: Plan) => {
    if (plan.url) {
      if (plan.url.startsWith('http')) {
        window.open(plan.url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = plan.url;
      }
      return;
    }

    if (plan.priceId && plan.id !== 'hobbyist') {
      setIsCheckoutLoading(plan.id);
      try {
        console.log(`Creating checkout session for plan: ${plan.name} (ID: ${plan.id}, Price: ${plan.priceId})`);

        const checkoutSession = await pricingService.createCheckoutSession(plan.id, {
          successUrl: `${window.location.origin}/billing/success`,
          cancelUrl: `${window.location.origin}/pricing`,
          metadata: {
            plan_name: plan.name,
            plan_id: plan.id
          }
        });

        console.log('Checkout session created:', checkoutSession.sessionId);

        // Redirect to Stripe checkout
        window.location.href = checkoutSession.sessionUrl;
      } catch (error) {
        console.error('Error creating checkout session:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
        alert(`Unable to start subscription checkout: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`);
      } finally {
        setIsCheckoutLoading(null);
      }
    } else if (plan.id !== 'hobbyist') {
      alert('This plan is not available for online purchase. Please contact support.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white py-28">
      <div className="max-w-screen-xl mx-auto px-6 space-y-20">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <p className="text-sm uppercase tracking-wider text-[#4B6FED]/80">
            Pricing
          </p>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#4B6FED] to-[#8A63F5] bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Pick a plan tailored for your team size and development stage.
          </p>
        </motion.header>

        {/* Error Banner */}
        {pricingError && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-center">
            <p className="text-red-400 mb-2">{pricingError}</p>
            <Button
              onClick={fetchPricingPlans}
              variant="outline"
              size="sm"
              className="border-red-700 text-red-400 hover:bg-red-900/30"
            >
              Retry Loading Pricing
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoadingPricing && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4B6FED] mx-auto mb-4"></div>
            <p className="text-gray-400">Loading current pricing...</p>
          </div>
        )}

        {/* Pricing Cards */}
        {!isLoadingPricing && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, i) => (
              <motion.article
                key={plan.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={fadeIn}
                className={`
                  rounded-2xl relative overflow-hidden p-6 h-full flex flex-col
                  ${
                    plan.highlight
                      ? 'border-2 border-[#4B6FED] shadow-lg bg-[#1D2230]'
                      : 'border border-white/10 bg-[#1C2128]'
                  }
                  transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
                `}
              >
                {plan.highlight && (
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
                    <div
                      key={`${plan.name}-${index}`}
                      className="flex items-start group"
                    >
                      <Check className="h-5 w-5 text-[#4B6FED] mt-0.5 mr-2 transition-transform duration-200 group-hover:scale-110" />
                      <span className="text-sm text-white">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="mt-8">
                  <Button
                    onClick={() => handlePlanClick(plan)}
                    disabled={isCheckoutLoading === plan.id}
                    className={`w-full ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-[#4B6FED] to-[#8A63F5] text-white hover:opacity-90'
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {isCheckoutLoading === plan.id ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Processing...
                      </span>
                    ) : (
                      plan.buttonText
                    )}
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-[#1C2128] rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-lg mb-2">
                Can I switch plans anytime?
              </h3>
              <p className="text-gray-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                take effect on your next billing cycle.
              </p>
            </div>
            <div className="bg-[#1C2128] rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-lg mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-400">
                We accept all major credit cards (Visa, Mastercard, American
                Express) through Stripe. Enterprise customers can also pay via
                invoice.
              </p>
            </div>
            <div className="bg-[#1C2128] rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-lg mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-400">
                The Start plan is always free with 50 completions/month. Teams
                plan includes a 14-day free trial with full access to all
                features.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Enterprise CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center bg-gradient-to-r from-[#4B6FED]/10 to-[#8A63F5]/10 rounded-2xl p-12 border border-[#4B6FED]/20"
        >
          <h2 className="text-2xl font-bold mb-4">Need a Custom Solution?</h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            Our enterprise team can help design a solution that fits your
            organization&apos;s unique requirements.
          </p>
          <Button
            onClick={() => window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer')}
            className="bg-gradient-to-r from-[#4B6FED] to-[#8A63F5] text-white hover:opacity-90"
          >
            Contact Sales
          </Button>
        </motion.section>
      </div>
    </div>
  );
}
