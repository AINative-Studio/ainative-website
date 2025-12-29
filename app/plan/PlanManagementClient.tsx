'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SubscriptionService } from '@/services/subscriptionService';
import { pricingService, type PricingPlan } from '@/services/pricingService';
import { Check, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PlanDisplay {
  name: string;
  price: string;
  status?: string;
  current_period_end?: string;
  features?: string[];
}

interface CurrentPlanInfo {
  id: string;
  name: string;
  price: number;
  currency: string;
  status: string;
  current_period_end: string | null;
  features: string[];
}

export default function PlanManagementClient() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<PricingPlan[]>([]);
  const [currentPlanInfo, setCurrentPlanInfo] = useState<CurrentPlanInfo | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchPlanData();
  }, []);

  const fetchPlanData = async () => {
    try {
      const subscriptionService = new SubscriptionService();

      // Fetch current plan info and all available plans in parallel
      const [planInfo, allPlans] = await Promise.all([
        subscriptionService.getCurrentPlan().catch(() => null),
        pricingService.getPricingPlansWithFallback()
      ]);

      if (planInfo) {
        // Store the current plan info for status tracking
        setCurrentPlanInfo({
          id: planInfo.id,
          name: planInfo.name,
          price: planInfo.price,
          currency: planInfo.currency,
          status: planInfo.status,
          current_period_end: planInfo.current_period_end,
          features: planInfo.features || []
        });

        // Set the display format for current plan
        setCurrentPlan({
          name: planInfo.name,
          price: planInfo.price === 0 ? 'Free' : `$${planInfo.price.toFixed(2)}`,
          status: planInfo.status,
          current_period_end: planInfo.current_period_end,
          features: planInfo.features || []
        });
      } else {
        // Default to free plan if no subscription found
        const freePlan = allPlans.find(p => p.price === 0 || p.id === 'hobbyist');
        setCurrentPlanInfo({
          id: 'hobbyist',
          name: freePlan?.name || 'Start',
          price: 0,
          currency: 'USD',
          status: 'active',
          current_period_end: null,
          features: freePlan?.features || ['50 completions/month', 'Community support', 'Basic AI assistance']
        });
        setCurrentPlan({
          name: freePlan?.name || 'Start',
          price: 'Free',
          status: 'active',
          features: freePlan?.features || ['50 completions/month', 'Community support', 'Basic AI assistance']
        });
      }

      // Set all available plans from PricingService
      setAvailablePlans(allPlans);
    } catch (err) {
      console.error('Error fetching plan data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load plan details';
      toast.error(errorMessage);

      // Leave currentPlan as null to show error state
      setCurrentPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    setCancelLoading(true);
    try {
      const subscriptionService = new SubscriptionService();
      const result = await subscriptionService.cancelSubscription();

      if (result.success) {
        toast.success(result.message || 'Your subscription has been scheduled for cancellation.');
        // Refresh plan data
        const updatedPlanInfo = await subscriptionService.getCurrentPlan();
        setCurrentPlanInfo({
          id: updatedPlanInfo.id,
          name: updatedPlanInfo.name,
          price: updatedPlanInfo.price,
          currency: updatedPlanInfo.currency,
          status: updatedPlanInfo.status,
          current_period_end: updatedPlanInfo.current_period_end,
          features: updatedPlanInfo.features || []
        });
        setCurrentPlan({
          name: updatedPlanInfo.name,
          price: updatedPlanInfo.price === 0 ? 'Free' : `$${updatedPlanInfo.price.toFixed(2)}`,
          status: updatedPlanInfo.status,
          current_period_end: updatedPlanInfo.current_period_end,
          features: updatedPlanInfo.features || []
        });
      } else {
        toast.error(result.message || 'Failed to process cancellation');
      }
    } catch (err) {
      console.error('Cancellation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel subscription';
      toast.error(errorMessage);
    } finally {
      setCancelLoading(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-6 -ml-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent mb-4">
              Subscription Management
            </h1>
            <div className="max-w-md mx-auto mt-8">
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground mb-4">
                    Unable to load subscription information
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="secondary"
                    className="w-full"
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const isCancelled = currentPlan?.status === 'cancelled' || currentPlan?.status === 'past_due' || currentPlan?.status === 'canceled';
  const isFreePlan = currentPlan?.name.toLowerCase() === 'free' || currentPlan?.name.toLowerCase() === 'start' || currentPlanInfo?.price === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 -ml-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent mb-4">
            Subscription Management
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Manage your subscription, view your current plan, and explore available options
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Plan Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="h-full border-primary/20 bg-gradient-to-br from-card to-card/80 shadow-lg">
              <CardHeader className="border-b border-border/50">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="mb-2" variant="secondary">CURRENT PLAN</Badge>
                    <CardTitle className="text-2xl">{currentPlan?.name} Plan</CardTitle>
                    <CardDescription>
                      {isCancelled
                        ? 'Your subscription will end soon'
                        : 'Manage your current subscription'}
                    </CardDescription>
                  </div>
                  <Badge
                    className={cn(
                      'px-3 py-1 text-sm',
                      isCancelled ? 'bg-destructive/20 text-destructive' :
                      isFreePlan ? 'bg-secondary' : 'bg-primary/10 text-primary'
                    )}
                  >
                    {isCancelled ? 'Ending Soon' : isFreePlan ? 'Active - Free' : 'Active'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">
                      {isFreePlan ? 'Free' : currentPlan?.price}
                    </span>
                    {!isFreePlan && currentPlanInfo && (
                      <span className="ml-2 text-muted-foreground">
                        /{currentPlanInfo.name.includes('Yearly') ? 'year' : 'month'}
                      </span>
                    )}
                  </div>

                  {!isFreePlan && currentPlan?.current_period_end && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm font-medium">
                        {isCancelled ? 'Access ends' : 'Next billing date'}
                      </p>
                      <p className="text-lg font-semibold">
                        {formatDate(currentPlan.current_period_end)}
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="font-medium">Plan Features</h4>
                    <ul className="space-y-2">
                      {(currentPlan?.features || []).map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {!isFreePlan && (
                    <Button
                      variant={isCancelled ? 'outline' : 'destructive'}
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                      className="w-full mt-4"
                    >
                      {cancelLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isCancelled ? 'Cancellation Pending' : 'Cancel Subscription'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Available Plans */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
                <CardDescription>
                  {isFreePlan ? 'Upgrade to unlock premium features' : 'Change your current plan'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availablePlans.length > 0 ? (
                    availablePlans.map((plan) => {
                      // Check if this plan matches the current user's plan by ID or name
                      const isCurrent = currentPlanInfo && (
                        plan.id === currentPlanInfo.id ||
                        plan.name.toLowerCase() === currentPlanInfo.name.toLowerCase() ||
                        (plan.name.toLowerCase().includes('free') && currentPlanInfo.name.toLowerCase().includes('free')) ||
                        (plan.name.toLowerCase().includes('start') && currentPlanInfo.name.toLowerCase().includes('start')) ||
                        (plan.id === 'hobbyist' && currentPlanInfo.id === 'hobbyist')
                      );

                      return (
                        <motion.div
                          key={plan.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            'border rounded-xl p-5 transition-all cursor-pointer',
                            isCurrent
                              ? 'border-primary/50 ring-2 ring-primary/20 bg-primary/5'
                              : 'border-border/50 hover:border-primary/30 hover:shadow-md'
                          )}
                          onClick={() => !isCurrent && router.push('/pricing')}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold">{plan.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {plan.price === 0 || plan.price === null ? 'Free' :
                                  `$${plan.price.toFixed(2)}/${plan.billing_period || 'month'}`
                                }
                              </p>
                            </div>
                            {isCurrent ? (
                              <Badge variant="secondary">Current</Badge>
                            ) : (
                              <Button size="sm" variant="outline">
                                Select
                              </Button>
                            )}
                          </div>
                          <ul className="text-sm space-y-2 mt-4">
                            {plan.features.map((feature, i) => (
                              <li key={i} className="flex items-center">
                                <Check className="h-3.5 w-3.5 text-muted-foreground mr-2 flex-shrink-0" />
                                <span className="text-muted-foreground">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">Loading available plans...</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t border-border/50 p-6">
                <p className="text-xs text-muted-foreground text-center w-full">
                  Need a custom plan?{' '}
                  <a href="/contact" className="text-primary hover:underline">
                    Contact sales
                  </a>
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
