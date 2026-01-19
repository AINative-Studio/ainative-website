'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SubscriptionService, type Subscription, type PaymentMethod, type SubscriptionInvoice } from '@/services/subscriptionService';
import { pricingService, type PricingPlan } from '@/services/pricingService';
import { Check, CheckCircle, Loader2, ArrowLeft, CreditCard, Download, Plus, Trash2, Star, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

type DialogType = 'cancel' | 'upgrade' | 'downgrade' | 'reactivate' | null;

export default function PlanManagementClient() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<PricingPlan[]>([]);
  const [currentPlanInfo, setCurrentPlanInfo] = useState<CurrentPlanInfo | null>(null);
  const [fullSubscription, setFullSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<SubscriptionInvoice[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setMounted(true);
    fetchPlanData();
  }, []);

  const fetchPlanData = async () => {
    try {
      const subscriptionService = new SubscriptionService();

      // Fetch all data in parallel
      const [subscription, allPlans, paymentMethodsList, invoicesList] = await Promise.all([
        subscriptionService.getCurrentSubscription().catch(() => null),
        pricingService.getPricingPlansWithFallback(),
        subscriptionService.getPaymentMethods().catch(() => []),
        subscriptionService.getInvoices(10).catch(() => [])
      ]);

      setPaymentMethods(paymentMethodsList);
      setInvoices(invoicesList);

      if (subscription) {
        setFullSubscription(subscription);

        // Store the current plan info for status tracking
        setCurrentPlanInfo({
          id: subscription.plan.id,
          name: subscription.plan.name,
          price: subscription.plan.price,
          currency: subscription.plan.currency,
          status: subscription.status,
          current_period_end: subscription.current_period_end,
          features: subscription.plan.features || []
        });

        // Set the display format for current plan
        setCurrentPlan({
          name: subscription.plan.name,
          price: subscription.plan.price === 0 ? 'Free' : `$${(subscription.plan.price / 100).toFixed(2)}`,
          status: subscription.status,
          current_period_end: subscription.current_period_end,
          features: subscription.plan.features || []
        });
      } else {
        // Default to free plan if no subscription found
        const freePlan = allPlans.find(p => p.price === 0 || p.id === 'free');
        setCurrentPlanInfo({
          id: 'free',
          name: freePlan?.name || 'Free',
          price: 0,
          currency: 'USD',
          status: 'active',
          current_period_end: null,
          features: freePlan?.features || ['50 prompt credits/month', 'Community support', 'Basic AI assistance']
        });
        setCurrentPlan({
          name: freePlan?.name || 'Free',
          price: 'Free',
          status: 'active',
          features: freePlan?.features || ['50 prompt credits/month', 'Community support', 'Basic AI assistance']
        });
      }

      // Set all available plans from PricingService
      setAvailablePlans(allPlans);
    } catch (err) {
      console.error('Error fetching plan data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load plan details';
      toast.error(errorMessage);
      setCurrentPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (plan: PricingPlan) => {
    if (!currentPlanInfo) return;

    const isCurrent = plan.id === currentPlanInfo.id ||
                     plan.name.toLowerCase() === currentPlanInfo.name.toLowerCase();

    if (isCurrent) {
      toast.info('This is your current plan');
      return;
    }

    const isUpgrade = (plan.price || 0) > currentPlanInfo.price;
    setSelectedPlan(plan);
    setDialogType(isUpgrade ? 'upgrade' : 'downgrade');
    setDialogOpen(true);
  };

  const confirmPlanChange = async () => {
    if (!selectedPlan) return;

    setActionLoading(true);
    try {
      const subscriptionService = new SubscriptionService();

      // If upgrading to a paid plan from free, use subscribe
      // Otherwise use updateSubscription
      let result;
      if (currentPlanInfo?.price === 0 && (selectedPlan.price || 0) > 0) {
        // For new subscriptions, redirect to checkout
        if (selectedPlan.stripe_price_id) {
          const { sessionUrl } = await pricingService.createCheckoutSession(
            selectedPlan.id,
            {
              stripePriceId: selectedPlan.stripe_price_id,
              successUrl: `${window.location.origin}/plan?success=true`,
              cancelUrl: `${window.location.origin}/plan?canceled=true`
            }
          );
          window.location.href = sessionUrl;
          return;
        } else {
          result = await subscriptionService.subscribe(selectedPlan.id);
        }
      } else {
        result = await subscriptionService.updateSubscription(selectedPlan.id);
      }

      if (result.success) {
        toast.success(result.message || 'Subscription updated successfully');
        setDialogOpen(false);
        setSelectedPlan(null);
        // Refresh plan data
        await fetchPlanData();
      } else {
        toast.error(result.message || 'Failed to update subscription');
      }
    } catch (err) {
      console.error('Plan change error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update subscription';
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    setDialogType('cancel');
    setDialogOpen(true);
  };

  const confirmCancelSubscription = async () => {
    setActionLoading(true);
    try {
      const subscriptionService = new SubscriptionService();
      const result = await subscriptionService.cancelSubscription();

      if (result.success) {
        toast.success(result.message || 'Your subscription has been scheduled for cancellation.');
        setDialogOpen(false);
        // Refresh plan data
        await fetchPlanData();
      } else {
        toast.error(result.message || 'Failed to process cancellation');
      }
    } catch (err) {
      console.error('Cancellation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel subscription';
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateSubscription = () => {
    setDialogType('reactivate');
    setDialogOpen(true);
  };

  const confirmReactivateSubscription = async () => {
    setActionLoading(true);
    try {
      const subscriptionService = new SubscriptionService();
      const result = await subscriptionService.reactivateSubscription();

      if (result.success) {
        toast.success(result.message || 'Your subscription has been reactivated');
        setDialogOpen(false);
        // Refresh plan data
        await fetchPlanData();
      } else {
        toast.error(result.message || 'Failed to reactivate subscription');
      }
    } catch (err) {
      console.error('Reactivation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to reactivate subscription';
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    const isDefault = paymentMethods.find(pm => pm.id === paymentMethodId)?.is_default;

    if (isDefault && paymentMethods.length > 1) {
      toast.error('Please set another payment method as default before removing this one');
      return;
    }

    if (!confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    try {
      const subscriptionService = new SubscriptionService();
      const result = await subscriptionService.removePaymentMethod(paymentMethodId);

      if (result.success) {
        toast.success('Payment method removed successfully');
        // Refresh payment methods
        const updatedMethods = await subscriptionService.getPaymentMethods();
        setPaymentMethods(updatedMethods);
      } else {
        toast.error(result.message || 'Failed to remove payment method');
      }
    } catch (err) {
      console.error('Remove payment method error:', err);
      toast.error('Failed to remove payment method');
    }
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      const subscriptionService = new SubscriptionService();
      const result = await subscriptionService.setDefaultPaymentMethod(paymentMethodId);

      if (result.success) {
        toast.success('Default payment method updated');
        // Refresh payment methods
        const updatedMethods = await subscriptionService.getPaymentMethods();
        setPaymentMethods(updatedMethods);
      } else {
        toast.error(result.message || 'Failed to update default payment method');
      }
    } catch (err) {
      console.error('Set default payment method error:', err);
      toast.error('Failed to update default payment method');
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

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const calculateProration = (newPlan: PricingPlan) => {
    if (!fullSubscription || !currentPlanInfo) return null;

    const currentPrice = currentPlanInfo.price;
    const newPrice = newPlan.price || 0;
    const priceDiff = newPrice - currentPrice;

    if (priceDiff === 0) return null;

    // Simple prorated calculation - in production, this would come from the backend
    const now = new Date();
    const periodEnd = new Date(fullSubscription.current_period_end);
    const periodStart = new Date(fullSubscription.current_period_start);
    const totalDays = (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24);
    const daysRemaining = Math.max(0, (periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const proratedAmount = (priceDiff * daysRemaining) / totalDays;

    return {
      amount: proratedAmount,
      daysRemaining: Math.ceil(daysRemaining),
      isUpgrade: priceDiff > 0
    };
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

  const isCancelled = currentPlan?.status === 'cancelled' || currentPlan?.status === 'canceled' || fullSubscription?.cancel_at_period_end;
  const isFreePlan = currentPlan?.name.toLowerCase() === 'free' || currentPlanInfo?.price === 0;

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
            Manage your subscription, payment methods, and view billing history
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {isCancelled && (
              <Alert className="border-yellow-500/20 bg-yellow-500/5">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <AlertTitle>Subscription Ending</AlertTitle>
                <AlertDescription>
                  Your subscription will end on {formatDate(currentPlan?.current_period_end)}.
                  You can reactivate it before this date to continue your service.
                </AlertDescription>
                <Button
                  onClick={handleReactivateSubscription}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Reactivate Subscription
                </Button>
              </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Current Plan Card */}
              <Card className="border-primary/20 bg-gradient-to-br from-card to-card/80 shadow-lg">
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
                          /month
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
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {!isFreePlan && (
                      <Button
                        variant={isCancelled ? 'outline' : 'destructive'}
                        onClick={isCancelled ? handleReactivateSubscription : handleCancelSubscription}
                        disabled={actionLoading}
                        className="w-full mt-4"
                      >
                        {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isCancelled ? 'Reactivate Subscription' : 'Cancel Subscription'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common subscription management tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab('plans')}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {isFreePlan ? 'Upgrade Plan' : 'Change Plan'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab('payment')}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Manage Payment Methods
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab('billing')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    View Billing History
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
                <CardDescription>
                  {isFreePlan ? 'Upgrade to unlock premium features' : 'Change your current plan'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availablePlans.map((plan) => {
                    const isCurrent = currentPlanInfo && (
                      plan.id === currentPlanInfo.id ||
                      plan.name.toLowerCase() === currentPlanInfo.name.toLowerCase()
                    );

                    return (
                      <motion.div
                        key={plan.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          'border rounded-xl p-6 transition-all',
                          isCurrent
                            ? 'border-primary/50 ring-2 ring-primary/20 bg-primary/5'
                            : 'border-border/50 hover:border-primary/30 hover:shadow-md'
                        )}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-xl">{plan.name}</h3>
                            <p className="text-2xl font-bold mt-2">
                              {plan.price === 0 || plan.price === null ? 'Free' :
                                `$${(plan.price / 100).toFixed(0)}`
                              }
                              {plan.price !== null && plan.price > 0 && (
                                <span className="text-sm text-muted-foreground font-normal">
                                  /{plan.billing_period || 'month'}
                                </span>
                              )}
                            </p>
                          </div>
                          {plan.highlighted && !isCurrent && (
                            <Badge className="bg-primary/10 text-primary">Popular</Badge>
                          )}
                          {isCurrent && (
                            <Badge variant="secondary">Current</Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">
                          {plan.description}
                        </p>

                        <ul className="space-y-2 mb-6">
                          {plan.features.slice(0, 5).map((feature, i) => (
                            <li key={i} className="flex items-start text-sm">
                              <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Button
                          onClick={() => !isCurrent && handlePlanChange(plan)}
                          disabled={isCurrent ?? false}
                          className="w-full"
                          variant={isCurrent ? 'secondary' : 'default'}
                        >
                          {isCurrent ? 'Current Plan' : plan.button_text || 'Select Plan'}
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your payment methods</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => router.push('/billing')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No payment methods added yet</p>
                    <Button variant="outline" onClick={() => router.push('/billing')}>
                      Add Your First Payment Method
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentMethods.map((pm) => (
                      <div
                        key={pm.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <CreditCard className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {pm.card?.brand?.toUpperCase()} •••• {pm.card?.last4}
                              </p>
                              {pm.is_default && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Expires {pm.card?.exp_month}/{pm.card?.exp_year}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!pm.is_default && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefaultPaymentMethod(pm.id)}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePaymentMethod(pm.id)}
                            disabled={pm.is_default && paymentMethods.length === 1}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing History Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View and download your invoices</CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <div className="text-center py-12">
                    <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No invoices yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-medium">{invoice.number}</p>
                            <Badge
                              variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                              className={cn(
                                invoice.status === 'paid' && 'bg-green-500/10 text-green-500'
                              )}
                            >
                              {invoice.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatTimestamp(invoice.created)} • {formatCurrency(invoice.amount_due, invoice.currency)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(invoice.pdf_url, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Confirmation Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogType === 'cancel' && 'Cancel Subscription'}
                {dialogType === 'upgrade' && 'Upgrade Plan'}
                {dialogType === 'downgrade' && 'Downgrade Plan'}
                {dialogType === 'reactivate' && 'Reactivate Subscription'}
              </DialogTitle>
              <DialogDescription>
                {dialogType === 'cancel' && (
                  <>
                    Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period on {formatDate(currentPlan?.current_period_end)}.
                  </>
                )}
                {dialogType === 'upgrade' && selectedPlan && (
                  <>
                    <p className="mb-4">
                      You are upgrading to the {selectedPlan.name} plan for ${((selectedPlan.price || 0) / 100).toFixed(2)}/month.
                    </p>
                    {calculateProration(selectedPlan) && (
                      <Alert className="mt-4">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Prorated Billing</AlertTitle>
                        <AlertDescription>
                          You will be charged {formatCurrency(calculateProration(selectedPlan)!.amount, currentPlanInfo?.currency || 'USD')} today for the remaining {calculateProration(selectedPlan)!.daysRemaining} days of your billing period.
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
                {dialogType === 'downgrade' && selectedPlan && (
                  <>
                    <p className="mb-4">
                      You are changing to the {selectedPlan.name} plan. This change will take effect at the end of your current billing period on {formatDate(currentPlan?.current_period_end)}.
                    </p>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>No Immediate Charge</AlertTitle>
                      <AlertDescription>
                        You will continue to have access to your current plan features until {formatDate(currentPlan?.current_period_end)}.
                      </AlertDescription>
                    </Alert>
                  </>
                )}
                {dialogType === 'reactivate' && (
                  <>
                    Are you sure you want to reactivate your subscription? Your plan will continue as normal and you will be charged on your next billing date.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (dialogType === 'cancel') confirmCancelSubscription();
                  else if (dialogType === 'upgrade' || dialogType === 'downgrade') confirmPlanChange();
                  else if (dialogType === 'reactivate') confirmReactivateSubscription();
                }}
                disabled={actionLoading}
                variant={dialogType === 'cancel' ? 'destructive' : 'default'}
              >
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {dialogType === 'cancel' && 'Confirm Cancellation'}
                {dialogType === 'upgrade' && 'Confirm Upgrade'}
                {dialogType === 'downgrade' && 'Confirm Change'}
                {dialogType === 'reactivate' && 'Confirm Reactivation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
