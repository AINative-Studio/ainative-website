'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { pricingService, type PricingPlan } from '@/services/pricingService';
import { appConfig } from '@/lib/config/app';
import {
  Cpu,
  Shield,
  Users,
  Zap,
  Check,
  Crown,
  RefreshCcw,
  Calendar,
  CreditCard,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

type PlanLevel = 'start' | 'pro' | 'teams' | 'enterprise' | 'free';

interface Plan {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  price: string;
  priceNumeric: number;
  sub?: string;
  buttonText: string;
  description: string;
  features: string[];
  level: PlanLevel;
  highlight: boolean;
  priceId?: string;
  url?: string;
}

const CALENDLY_URL = appConfig.links.calendly;

const fallbackPlans: Plan[] = [
  {
    id: 'hobbyist',
    name: 'Start',
    icon: Cpu,
    price: 'Free',
    priceNumeric: 0,
    sub: '',
    buttonText: 'Current Plan',
    description: 'Perfect for trying out AI Native Studio',
    features: [
      '50 completions/month',
      'Community support',
      'Basic AI assistance'
    ],
    level: 'start',
    highlight: false,
  },
  {
    id: 'individual',
    name: 'Pro',
    icon: Zap,
    price: '$10',
    priceNumeric: 10,
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
    highlight: true,
    priceId: appConfig.pricing.stripeKeys.pro,
  },
  {
    id: 'teams',
    name: 'Teams',
    icon: Users,
    price: '$60',
    priceNumeric: 60,
    sub: '/user/month',
    buttonText: 'Upgrade to Teams',
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
    priceNumeric: -1,
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
  if (name.includes('enterprise')) return Shield;
  return Cpu;
};

interface UserSubscription {
  planId: string;
  planName: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  currentPeriodEnd?: string;
  creditsUsed: number;
  creditsTotal: number;
}

export default function PlanManagementClient() {
  const [mounted, setMounted] = useState(false);
  const [plans, setPlans] = useState<Plan[]>(fallbackPlans);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription>({
    planId: 'hobbyist',
    planName: 'Start',
    status: 'active',
    currentPeriodEnd: undefined,
    creditsUsed: 35,
    creditsTotal: 50
  });

  useEffect(() => {
    setMounted(true);
    fetchPlans();
    loadUserSubscription();
  }, []);

  const loadUserSubscription = () => {
    // Load user subscription from localStorage or API
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.subscription) {
          setCurrentSubscription({
            planId: user.subscription.planId || 'hobbyist',
            planName: user.subscription.planName || 'Start',
            status: user.subscription.status || 'active',
            currentPeriodEnd: user.subscription.currentPeriodEnd,
            creditsUsed: user.subscription.creditsUsed || 35,
            creditsTotal: user.subscription.creditsTotal || 50
          });
        }
      }
    } catch {
      // Use defaults
    }
  };

  const fetchPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const pricingPlans = await pricingService.getPricingPlansWithFallback();

      // Filter to main plans only
      const filteredPlans = pricingPlans.filter((plan: PricingPlan) => {
        const planId = plan.id.toLowerCase();
        if (planId.includes('zerodb') && planId !== 'zerodb_pro' && planId !== 'zerodb_scale') {
          return false;
        }
        return ['hobbyist', 'individual', 'teams', 'enterprise'].includes(planId) ||
               planId.includes('start') || planId.includes('pro') || planId.includes('team');
      });

      if (filteredPlans.length > 0) {
        const apiPlans: Plan[] = filteredPlans.slice(0, 4).map((plan: PricingPlan) => ({
          id: plan.id,
          name: plan.name,
          icon: getIconForPlan(plan.name),
          price: plan.price === 0 ? 'Free' : plan.price === null ? 'Custom' : `$${plan.price}`,
          priceNumeric: plan.price || 0,
          sub: plan.billing_period ? `/${plan.billing_period}` : '',
          buttonText: plan.button_text,
          description: plan.description,
          features: plan.features || [],
          level: plan.level as PlanLevel,
          highlight: plan.highlighted,
          priceId: plan.stripe_price_id,
          url: plan.url,
        }));
        setPlans(apiPlans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      // Keep fallback plans
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handlePlanClick = async (plan: Plan) => {
    // If already on this plan, do nothing
    if (plan.id === currentSubscription.planId) {
      return;
    }

    // Enterprise goes to Calendly
    if (plan.url) {
      window.open(plan.url, '_blank', 'noopener,noreferrer');
      return;
    }

    // Free plan - just update locally (would need API in production)
    if (plan.priceNumeric === 0) {
      setCurrentSubscription({
        ...currentSubscription,
        planId: plan.id,
        planName: plan.name,
        creditsTotal: 50
      });
      return;
    }

    // Paid plans - redirect to Stripe checkout
    if (plan.priceId) {
      setIsCheckoutLoading(plan.id);
      try {
        const checkoutSession = await pricingService.createCheckoutSession(plan.id, {
          successUrl: `${window.location.origin}/plan?success=true`,
          cancelUrl: `${window.location.origin}/plan`,
          metadata: {
            plan_name: plan.name,
            plan_id: plan.id
          }
        });
        window.location.href = checkoutSession.sessionUrl;
      } catch (error) {
        console.error('Error creating checkout session:', error);
        alert('Unable to start subscription checkout. Please try again.');
      } finally {
        setIsCheckoutLoading(null);
      }
    }
  };

  const getButtonText = (plan: Plan) => {
    if (plan.id === currentSubscription.planId) {
      return 'Current Plan';
    }
    if (plan.priceNumeric === 0) {
      return 'Downgrade';
    }
    if (plan.priceNumeric === -1) {
      return 'Contact Sales';
    }
    const currentPlan = plans.find(p => p.id === currentSubscription.planId);
    if (currentPlan && plan.priceNumeric > currentPlan.priceNumeric) {
      return `Upgrade to ${plan.name}`;
    }
    return `Switch to ${plan.name}`;
  };

  const creditsPercentage = (currentSubscription.creditsUsed / currentSubscription.creditsTotal) * 100;

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentPlan = plans.find(p => p.id === currentSubscription.planId) || plans[0];
  const CurrentPlanIcon = currentPlan.icon;

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Plan Management</h1>
            <p className="text-muted-foreground">
              Manage your subscription and explore available plans
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchPlans}
            disabled={isLoadingPlans}
            className="gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoadingPlans ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Current Plan Card */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Card className="bg-gradient-to-r from-[#4B6FED]/10 to-[#8A63F4]/10 border-[#4B6FED]/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#4B6FED]/20 rounded-lg">
                  <CurrentPlanIcon className="h-6 w-6 text-[#4B6FED]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl">{currentPlan.name} Plan</CardTitle>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      {currentSubscription.status === 'active' ? 'Active' : currentSubscription.status}
                    </Badge>
                  </div>
                  <CardDescription>{currentPlan.description}</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{currentPlan.price}</div>
                {currentPlan.sub && (
                  <div className="text-sm text-muted-foreground">{currentPlan.sub}</div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Credits Usage */}
              <div className="bg-[#161B22] rounded-lg p-4 border border-[#2D333B]">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-[#4B6FED]" />
                  <span className="text-sm font-medium">Credits Used</span>
                </div>
                <div className="text-2xl font-bold mb-2">
                  {currentSubscription.creditsUsed} / {currentSubscription.creditsTotal}
                </div>
                <Progress value={creditsPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {currentSubscription.creditsTotal - currentSubscription.creditsUsed} credits remaining
                </p>
              </div>

              {/* Billing Cycle */}
              <div className="bg-[#161B22] rounded-lg p-4 border border-[#2D333B]">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-[#4B6FED]" />
                  <span className="text-sm font-medium">Billing Cycle</span>
                </div>
                <div className="text-2xl font-bold mb-2">
                  {currentSubscription.currentPeriodEnd
                    ? new Date(currentSubscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'Monthly'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentSubscription.currentPeriodEnd
                    ? 'Next billing date'
                    : 'Credits refresh monthly'
                  }
                </p>
              </div>

              {/* Quick Actions */}
              <div className="bg-[#161B22] rounded-lg p-4 border border-[#2D333B]">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-[#4B6FED]" />
                  <span className="text-sm font-medium">Quick Actions</span>
                </div>
                <div className="space-y-2">
                  <Link href="/dashboard/usage">
                    <Button variant="outline" size="sm" className="w-full justify-between">
                      View Usage Details
                      <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </Link>
                  {currentPlan.priceNumeric > 0 && (
                    <Button variant="outline" size="sm" className="w-full justify-between text-red-400 border-red-400/30 hover:bg-red-400/10">
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Available Plans */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <h2 className="text-2xl font-bold mb-6">Available Plans</h2>

        {isLoadingPlans ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#4B6FED]" />
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {plans.map((plan) => {
              const PlanIcon = plan.icon;
              const isCurrentPlan = plan.id === currentSubscription.planId;

              return (
                <motion.div key={plan.id} variants={fadeUp}>
                  <Card className={`h-full flex flex-col ${
                    isCurrentPlan
                      ? 'bg-[#4B6FED]/10 border-[#4B6FED]'
                      : plan.highlight
                        ? 'bg-[#161B22] border-[#4B6FED]/50'
                        : 'bg-[#161B22] border-[#2D333B]'
                  }`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <PlanIcon className="h-6 w-6 text-[#4B6FED]" />
                        {isCurrentPlan && (
                          <Badge className="bg-[#4B6FED]/20 text-[#4B6FED] border-[#4B6FED]/30">
                            <Crown className="h-3 w-3 mr-1" />
                            Current
                          </Badge>
                        )}
                        {plan.highlight && !isCurrentPlan && (
                          <Badge className="bg-[#4B6FED] text-white">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <div className="mb-4">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        {plan.sub && (
                          <span className="text-sm text-muted-foreground">{plan.sub}</span>
                        )}
                      </div>

                      <div className="space-y-2 flex-1">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-[#4B6FED] mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        onClick={() => handlePlanClick(plan)}
                        disabled={isCurrentPlan || isCheckoutLoading === plan.id}
                        className={`w-full mt-6 ${
                          isCurrentPlan
                            ? 'bg-[#2D333B] text-gray-400 cursor-not-allowed'
                            : plan.highlight
                              ? 'bg-[#4B6FED] hover:bg-[#4B6FED]/80'
                              : 'bg-[#2D333B] hover:bg-[#2D333B]/80'
                        }`}
                      >
                        {isCheckoutLoading === plan.id ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </span>
                        ) : (
                          getButtonText(plan)
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      {/* Enterprise CTA */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Card className="bg-[#161B22] border-[#2D333B]">
          <CardContent className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#8A63F4]/20 rounded-lg">
                <Shield className="h-6 w-6 text-[#8A63F4]" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Need a custom solution?</h3>
                <p className="text-gray-400 text-sm">
                  Contact our sales team for enterprise pricing and custom features
                </p>
              </div>
            </div>
            <Button
              onClick={() => window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer')}
              className="bg-[#8A63F4] hover:bg-[#8A63F4]/80"
            >
              Contact Sales
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
