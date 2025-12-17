'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CreditCard, FileText, Receipt, Plus, Mail, Loader2, Check } from 'lucide-react';
import { useIsAdmin } from '@/components/guards/AdminRouteGuard';

// Types
type PaymentMethod = {
  id: string;
  type: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
};

type AutoRefillSettings = {
  enabled: boolean;
  threshold: number;
  amount: string;
};

type Invoice = {
  id: string;
  amount: number;
  status: string;
  currency: string;
  created_at: string;
  email_sent_at?: string;
  customer_email?: string;
};

type BillingInfo = {
  payment_methods: PaymentMethod[];
  auto_refill?: AutoRefillSettings;
};

type Subscription = {
  id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  auto_refill?: AutoRefillSettings;
};

type CreditBalance = {
  available: number;
  used: number;
  total: number;
  currency: string;
};

// Mock data for demo mode
const mockBillingInfo: BillingInfo = {
  payment_methods: [
    {
      id: 'pm_demo',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      exp_month: 12,
      exp_year: 2026
    }
  ],
  auto_refill: {
    enabled: true,
    threshold: 100,
    amount: '50.00'
  }
};

const mockSubscription: Subscription = {
  id: 'sub_demo',
  plan_id: 'plan_pro',
  status: 'active',
  current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
  cancel_at_period_end: false
};

const mockCreditBalance: CreditBalance = {
  available: 5000,
  used: 2500,
  total: 7500,
  currency: 'USD'
};

const mockInvoices: Invoice[] = [
  {
    id: 'inv_demo1',
    amount: 2900,
    status: 'paid',
    currency: 'USD',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    customer_email: 'demo@ainative.studio'
  },
  {
    id: 'inv_demo2',
    amount: 2900,
    status: 'paid',
    currency: 'USD',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    customer_email: 'demo@ainative.studio'
  }
];

export default function BillingClient() {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDemo, setIsDemo] = useState(false);

  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [sendingEmail, setSendingEmail] = useState<Record<string, boolean>>({});
  const [emailSent, setEmailSent] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true);

        // Check for auth token
        const token = typeof window !== 'undefined' ? (
          localStorage.getItem('access_token') ||
          localStorage.getItem('auth_token')
        ) : null;

        if (!token) {
          // Use demo data
          setBillingInfo(mockBillingInfo);
          setSubscription(mockSubscription);
          setCreditBalance(mockCreditBalance);
          setInvoices(mockInvoices);
          setIsDemo(true);
          return;
        }

        // In a real implementation, fetch from API here
        // For now, use demo data
        setBillingInfo(mockBillingInfo);
        setSubscription(mockSubscription);
        setCreditBalance(mockCreditBalance);
        setInvoices(mockInvoices);
        setIsDemo(true);

      } catch (error) {
        console.error('Failed to fetch billing data:', error);
        setBillingInfo(mockBillingInfo);
        setSubscription(mockSubscription);
        setCreditBalance(mockCreditBalance);
        setInvoices(mockInvoices);
        setIsDemo(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const daysUntilBilling = subscription?.current_period_end
    ? Math.ceil((new Date(subscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const canResendEmail = (invoice: Invoice): boolean => {
    if (!invoice.email_sent_at) return true;
    const sentTime = new Date(invoice.email_sent_at).getTime();
    const now = Date.now();
    const fiveMinutesInMs = 5 * 60 * 1000;
    return (now - sentTime) > fiveMinutesInMs;
  };

  const getResendAvailableTime = (invoice: Invoice): string => {
    if (!invoice.email_sent_at) return '';
    const sentTime = new Date(invoice.email_sent_at).getTime();
    const now = Date.now();
    const fiveMinutesInMs = 5 * 60 * 1000;
    const timeRemaining = fiveMinutesInMs - (now - sentTime);
    if (timeRemaining <= 0) return 'Available now';
    const minutesRemaining = Math.ceil(timeRemaining / 60000);
    return `Available in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}`;
  };

  const handleResendEmail = async (invoice: Invoice) => {
    if (!canResendEmail(invoice)) return;

    setSendingEmail(prev => ({ ...prev, [invoice.id]: true }));

    // Simulate API call
    setTimeout(() => {
      setEmailSent(prev => ({ ...prev, [invoice.id]: true }));
      setInvoices(prevInvoices =>
        prevInvoices.map(inv =>
          inv.id === invoice.id
            ? { ...inv, email_sent_at: new Date().toISOString() }
            : inv
        )
      );
      setSendingEmail(prev => ({ ...prev, [invoice.id]: false }));

      setTimeout(() => {
        setEmailSent(prev => ({ ...prev, [invoice.id]: false }));
      }, 2000);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-6xl mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Billing</h1>
        <p className="text-gray-400">Manage your payment methods and view billing history</p>

        {isDemo && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
            <p className="text-sm text-yellow-200">Demo mode - showing sample billing data</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Credit Balance Card */}
          {creditBalance && (
            <Card className="border-gray-800 bg-[#161B22]">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-white">Credit Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-blue-400">
                    {creditBalance.available.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    {creditBalance.used.toLocaleString()} used • {creditBalance.total.toLocaleString()} total
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subscription Status Card */}
          {subscription && (
            <Card className="border-gray-800 bg-[#161B22]">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-white">Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className={`font-medium ${
                      subscription.status === 'active' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </span>
                  </div>
                  {subscription.current_period_end && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Renews in</span>
                      <span className="text-white">
                        {daysUntilBilling} {daysUntilBilling === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="invoices" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white">
              <Receipt className="h-4 w-4 mr-2" />
              Invoices
            </TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="border-gray-800 bg-[#161B22]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-400" />
                    Payment Method
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Update your payment information and billing address
                  </CardDescription>
                </div>
                <Button variant="outline" className="border-gray-700 hover:bg-gray-800 text-white">
                  Update Payment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {billingInfo?.payment_methods && billingInfo.payment_methods.length > 0 ? (
                <div className="space-y-4">
                  {billingInfo.payment_methods.map((method, index) => (
                    <div key={`payment-method-${method.id || index}`} className="p-4 bg-gray-900/50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-400 text-sm">
                            {method.brand} ending in {method.last4}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            {method.exp_month && method.exp_year ? (
                              `Expires ${method.exp_month.toString().padStart(2, '0')}/${method.exp_year.toString().slice(-2)}`
                            ) : 'Expiration date not available'}
                          </p>
                        </div>
                        {method.type && (
                          <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded">
                            {method.type.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-900/50 rounded-lg text-center">
                  <p className="text-gray-400 text-sm">No payment methods found</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Add Payment Method
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-[#161B22]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    Billing History
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    View and download your past invoices
                  </CardDescription>
                </div>
                <Button variant="outline" className="border-gray-700 hover:bg-gray-800 text-white">
                  View All Invoices
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="space-y-4">
                  <TooltipProvider>
                    {invoices.slice(0, 3).map((invoice, index) => {
                      const isSending = sendingEmail[invoice.id];
                      const showSuccess = emailSent[invoice.id];
                      const canResend = canResendEmail(invoice);
                      const resendTime = getResendAvailableTime(invoice);

                      return (
                        <div
                          key={`invoice-${invoice.id || index}`}
                          className={`flex items-center justify-between p-4 hover:bg-gray-900/50 rounded-lg transition-colors gap-4 ${
                            index > 0 ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="flex-1">
                            <p className="text-white text-sm">
                              Invoice #{invoice.id.split('_').pop()?.slice(0, 6)}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {formatDate(invoice.created_at)}
                            </p>
                            {invoice.email_sent_at && (
                              <p className="text-gray-500 text-xs mt-1">
                                Last sent: {formatDate(invoice.email_sent_at)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-white font-medium">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: invoice.currency || 'USD',
                                }).format(invoice.amount / 100)}
                              </p>
                              <p
                                className={`text-xs ${
                                  invoice.status === 'paid' ? 'text-green-400' :
                                  invoice.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                                }`}
                              >
                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1).toLowerCase()}
                              </p>
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={!canResend || isSending}
                                  onClick={() => handleResendEmail(invoice)}
                                  className="border-gray-700 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                                >
                                  {isSending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Sending...
                                    </>
                                  ) : showSuccess ? (
                                    <>
                                      <Check className="h-4 w-4 mr-2 text-green-400" />
                                      Sent
                                    </>
                                  ) : (
                                    <>
                                      <Mail className="h-4 w-4 mr-2" />
                                      Resend
                                    </>
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {!canResend
                                    ? `Email sent recently. ${resendTime}`
                                    : invoice.customer_email
                                      ? `Send invoice to ${invoice.customer_email}`
                                      : 'Resend invoice email to customer'
                                  }
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      );
                    })}
                  </TooltipProvider>
                  {invoices.length > 3 && (
                    <div className="text-center mt-2">
                      <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                        View all {invoices.length} invoices
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-gray-900/50 rounded-lg text-center">
                  <p className="text-gray-400 text-sm">No invoices found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Your Invoices</h2>
              <p className="text-gray-400 mt-1">View and manage all your invoices</p>
            </div>
            <Button
              onClick={() => router.push('/invoices/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>

          <Card className="border-gray-800 bg-[#161B22]">
            <CardContent className="pt-16 pb-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                <Receipt className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No custom invoices yet</h3>
              <p className="text-gray-400 mb-6">Create your first invoice to get started</p>
              <Button
                onClick={() => router.push('/invoices/create')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
