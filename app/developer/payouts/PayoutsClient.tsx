'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  CreditCard,
  Building2,
  Calendar,
  Download,
  Upload,
  Settings,
  Bell,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  FileText,
  Plus,
  Trash2,
  Info,
  Loader2,
} from 'lucide-react';
import {
  payoutService,
  type Payout,
  type ConnectedPaymentMethod,
  type AutoPayoutSettings,
  type TaxForm,
  type PayoutNotificationPreferences,
  type StripeConnectStatus,
  type PayoutBalance,
  type PayoutSchedule,
} from '@/services/payoutService';

// Mock data for demo mode
const mockStripeStatus: StripeConnectStatus = {
  is_connected: true,
  account_id: 'acct_demo123',
  charges_enabled: true,
  payouts_enabled: true,
  details_submitted: true,
};

const mockPaymentMethods: ConnectedPaymentMethod[] = [
  {
    id: 'ba_demo1',
    type: 'bank_account',
    bank_name: 'Chase Bank',
    account_holder_name: 'John Developer',
    last4: '6789',
    currency: 'USD',
    is_default: true,
    status: 'verified',
  },
];

const mockPayouts: Payout[] = [
  {
    id: 'po_demo1',
    amount: 125000,
    currency: 'USD',
    status: 'paid',
    description: 'Monthly payout - January 2026',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    arrival_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    destination_type: 'bank_account',
    destination_last4: '6789',
  },
  {
    id: 'po_demo2',
    amount: 98500,
    currency: 'USD',
    status: 'in_transit',
    description: 'Monthly payout - February 2026',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    arrival_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    destination_type: 'bank_account',
    destination_last4: '6789',
  },
  {
    id: 'po_demo3',
    amount: 152000,
    currency: 'USD',
    status: 'pending',
    description: 'Monthly payout - March 2026',
    created_at: new Date().toISOString(),
    arrival_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    destination_type: 'bank_account',
    destination_last4: '6789',
  },
];

const mockBalance: PayoutBalance = {
  available: 245000,
  pending: 152000,
  total: 397000,
  currency: 'USD',
};

const mockAutoSettings: AutoPayoutSettings = {
  enabled: true,
  schedule: 'weekly',
  threshold: 100000,
  delay_days: 2,
};

const mockTaxForms: TaxForm[] = [
  {
    id: 'tf_demo1',
    type: 'W9',
    year: 2026,
    status: 'approved',
    file_url: '/api/tax-forms/tf_demo1.pdf',
    submitted_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    approved_at: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tf_demo2',
    type: '1099-K',
    year: 2025,
    status: 'approved',
    file_url: '/api/tax-forms/tf_demo2.pdf',
    submitted_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    approved_at: new Date(Date.now() - 363 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockNotificationPrefs: PayoutNotificationPreferences = {
  email_on_payout_sent: true,
  email_on_payout_paid: true,
  email_on_payout_failed: true,
  sms_on_payout_paid: false,
};

export default function PayoutsClient() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Stripe Connect state
  const [stripeStatus, setStripeStatus] = useState<StripeConnectStatus | null>(null);
  const [connectingStripe, setConnectingStripe] = useState(false);

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<ConnectedPaymentMethod[]>([]);
  const [addingPaymentMethod, setAddingPaymentMethod] = useState(false);

  // Payouts state
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [balance, setBalance] = useState<PayoutBalance | null>(null);
  const [requestingPayout, setRequestingPayout] = useState(false);

  // Auto-payout settings state
  const [autoSettings, setAutoSettings] = useState<AutoPayoutSettings>({
    enabled: false,
    schedule: 'weekly',
    threshold: 100000,
    delay_days: 2,
  });
  const [savingAutoSettings, setSavingAutoSettings] = useState(false);

  // Tax forms state
  const [taxForms, setTaxForms] = useState<TaxForm[]>([]);
  const [uploadingTaxForm, setUploadingTaxForm] = useState(false);
  const [selectedTaxFile, setSelectedTaxFile] = useState<File | null>(null);
  const [selectedTaxYear, setSelectedTaxYear] = useState<number>(new Date().getFullYear());

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState<PayoutNotificationPreferences>({
    email_on_payout_sent: true,
    email_on_payout_paid: true,
    email_on_payout_failed: true,
    sms_on_payout_paid: false,
  });
  const [savingNotifications, setSavingNotifications] = useState(false);

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Check for auth token
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('access_token') || localStorage.getItem('auth_token')
          : null;

      if (!token) {
        // Use demo data
        setStripeStatus(mockStripeStatus);
        setPaymentMethods(mockPaymentMethods);
        setPayouts(mockPayouts);
        setBalance(mockBalance);
        setAutoSettings(mockAutoSettings);
        setTaxForms(mockTaxForms);
        setNotificationPrefs(mockNotificationPrefs);
        setIsDemo(true);
        return;
      }

      // Fetch real data
      const [
        statusData,
        methodsData,
        payoutsData,
        balanceData,
        autoData,
        taxData,
        notifData,
      ] = await Promise.all([
        payoutService.getStripeConnectStatus(),
        payoutService.getPaymentMethods(),
        payoutService.getPayouts({ limit: 20 }),
        payoutService.getPayoutBalance(),
        payoutService.getAutoPayoutSettings(),
        payoutService.getTaxForms(),
        payoutService.getNotificationPreferences(),
      ]);

      setStripeStatus(statusData);
      setPaymentMethods(methodsData);
      setPayouts(payoutsData);
      setBalance(balanceData);
      if (autoData) setAutoSettings(autoData);
      setTaxForms(taxData);
      if (notifData) setNotificationPrefs(notifData);
    } catch (error) {
      console.error('Error fetching payout data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payout data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    try {
      setConnectingStripe(true);
      const result = await payoutService.createConnectAccountLink();

      if (result?.url) {
        window.location.href = result.url;
      } else {
        throw new Error('Failed to create account link');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to connect Stripe account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setConnectingStripe(false);
    }
  };

  const handleOpenStripeDashboard = async () => {
    try {
      const result = await payoutService.createConnectDashboardLink();

      if (result?.url) {
        window.open(result.url, '_blank');
      } else {
        throw new Error('Failed to create dashboard link');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to open Stripe dashboard. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAddPaymentMethod = async () => {
    setAddingPaymentMethod(true);
    // In a real implementation, this would open a Stripe Connect flow
    // For now, we redirect to the Stripe dashboard
    await handleOpenStripeDashboard();
    setAddingPaymentMethod(false);
  };

  const handleRemovePaymentMethod = async (methodId: string) => {
    try {
      const result = await payoutService.removePaymentMethod(methodId);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Payment method removed successfully.',
        });
        // Refresh payment methods
        const methods = await payoutService.getPaymentMethods();
        setPaymentMethods(methods);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove payment method.',
        variant: 'destructive',
      });
    }
  };

  const handleSetDefaultPaymentMethod = async (methodId: string) => {
    try {
      const result = await payoutService.setDefaultPaymentMethod(methodId);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Default payment method updated.',
        });
        // Refresh payment methods
        const methods = await payoutService.getPaymentMethods();
        setPaymentMethods(methods);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to set default payment method.',
        variant: 'destructive',
      });
    }
  };

  const handleRequestPayout = async () => {
    if (!balance || balance.available === 0) {
      toast({
        title: 'No Balance Available',
        description: 'You need available balance to request a payout.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setRequestingPayout(true);
      const result = await payoutService.requestPayout(balance.available);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Payout requested successfully.',
        });
        // Refresh payouts and balance
        const [payoutsData, balanceData] = await Promise.all([
          payoutService.getPayouts({ limit: 20 }),
          payoutService.getPayoutBalance(),
        ]);
        setPayouts(payoutsData);
        setBalance(balanceData);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to request payout.',
        variant: 'destructive',
      });
    } finally {
      setRequestingPayout(false);
    }
  };

  const handleSaveAutoSettings = async () => {
    try {
      setSavingAutoSettings(true);
      const result = await payoutService.updateAutoPayoutSettings(autoSettings);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Auto-payout settings updated successfully.',
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save auto-payout settings.',
        variant: 'destructive',
      });
    } finally {
      setSavingAutoSettings(false);
    }
  };

  const handleUploadTaxForm = async () => {
    if (!selectedTaxFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploadingTaxForm(true);
      const result = await payoutService.uploadTaxForm('W9', selectedTaxYear, selectedTaxFile);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Tax form uploaded successfully.',
        });
        // Refresh tax forms
        const forms = await payoutService.getTaxForms();
        setTaxForms(forms);
        setSelectedTaxFile(null);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload tax form.',
        variant: 'destructive',
      });
    } finally {
      setUploadingTaxForm(false);
    }
  };

  const handleDownloadTaxForm = async (formId: string) => {
    try {
      const url = await payoutService.downloadTaxForm(formId);

      if (url) {
        window.open(url, '_blank');
      } else {
        throw new Error('Failed to get download URL');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to download tax form. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSavingNotifications(true);
      const result = await payoutService.updateNotificationPreferences(notificationPrefs);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Notification preferences updated successfully.',
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save notification preferences.',
        variant: 'destructive',
      });
    } finally {
      setSavingNotifications(false);
    }
  };

  const getPayoutStatusIcon = (status: Payout['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_transit':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Developer Payouts</h1>
          <p className="text-muted-foreground">
            Manage your payment methods, view payout history, and configure automatic payouts.
          </p>
          {isDemo && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <Info className="inline h-4 w-4 mr-2" />
                You are viewing demo data. Sign in to see your actual payout information.
              </p>
            </div>
          )}
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                  <p className="text-3xl font-bold">
                    {balance ? payoutService.formatCurrency(balance.available, balance.currency) : '$0.00'}
                  </p>
                </div>
                <CreditCard className="h-10 w-10 text-green-600" />
              </div>
              <Button
                className="w-full mt-4"
                onClick={handleRequestPayout}
                disabled={!balance || balance.available === 0 || requestingPayout}
              >
                {requestingPayout ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Request Payout
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Balance</p>
                  <p className="text-3xl font-bold">
                    {balance ? payoutService.formatCurrency(balance.pending, balance.currency) : '$0.00'}
                  </p>
                </div>
                <Clock className="h-10 w-10 text-yellow-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Funds that will be available in {autoSettings.delay_days} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                  <p className="text-3xl font-bold">
                    {balance ? payoutService.formatCurrency(balance.total, balance.currency) : '$0.00'}
                  </p>
                </div>
                <CreditCard className="h-10 w-10 text-blue-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-4">All-time developer earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="settings">Auto-Payout</TabsTrigger>
            <TabsTrigger value="tax-forms">Tax Forms</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stripe Connect Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Stripe Connect Status
                </CardTitle>
                <CardDescription>Manage your Stripe Connect account for receiving payouts</CardDescription>
              </CardHeader>
              <CardContent>
                {stripeStatus?.is_connected ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-900">Connected to Stripe</p>
                          <p className="text-sm text-green-700">Account ID: {stripeStatus.account_id}</p>
                        </div>
                      </div>
                      <Button variant="outline" onClick={handleOpenStripeDashboard}>
                        Open Dashboard
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        {stripeStatus.charges_enabled ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">Charges Enabled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {stripeStatus.payouts_enabled ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">Payouts Enabled</span>
                      </div>
                    </div>

                    {stripeStatus.requirements && stripeStatus.requirements.currently_due.length > 0 && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="font-semibold text-yellow-900 mb-2">Action Required</p>
                        <p className="text-sm text-yellow-700">
                          Please complete the following requirements to continue receiving payouts:
                        </p>
                        <ul className="list-disc list-inside text-sm text-yellow-700 mt-2">
                          {stripeStatus.requirements.currently_due.map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Connect Your Stripe Account</h3>
                    <p className="text-muted-foreground mb-6">
                      Connect your Stripe account to receive payouts for your developer earnings.
                    </p>
                    <Button onClick={handleConnectStripe} disabled={connectingStripe}>
                      {connectingStripe ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Connect with Stripe
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Payouts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Payout History
                </CardTitle>
                <CardDescription>View your recent payout transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {payouts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Destination</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Arrival Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payouts.map((payout) => (
                          <TableRow key={payout.id}>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`${payoutService.getPayoutStatusColorClass(payout.status)}`}
                              >
                                <span className="flex items-center gap-1">
                                  {getPayoutStatusIcon(payout.status)}
                                  {payoutService.getPayoutStatusDisplayText(payout.status)}
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {payoutService.formatCurrency(payout.amount, payout.currency)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {payout.description || 'Developer payout'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {payout.destination_type === 'bank_account' ? (
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  ****{payout.destination_last4}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <CreditCard className="h-3 w-3" />
                                  ****{payout.destination_last4}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {payoutService.formatDate(payout.created_at)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {payout.arrival_date ? payoutService.formatDate(payout.arrival_date) : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No payouts yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment-methods" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>Manage your connected bank accounts and debit cards</CardDescription>
              </CardHeader>
              <CardContent>
                {paymentMethods.length > 0 ? (
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          {method.type === 'bank_account' ? (
                            <Building2 className="h-8 w-8 text-blue-600" />
                          ) : (
                            <CreditCard className="h-8 w-8 text-purple-600" />
                          )}
                          <div>
                            <p className="font-semibold">
                              {method.bank_name || 'Debit Card'} ****{method.last4}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {method.account_holder_name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {method.is_default && (
                                <Badge variant="default" className="text-xs">
                                  Default
                                </Badge>
                              )}
                              <Badge
                                variant={method.status === 'verified' ? 'default' : 'outline'}
                                className="text-xs"
                              >
                                {method.status === 'verified' ? 'Verified' : 'Pending Verification'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!method.is_default && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefaultPaymentMethod(method.id)}
                            >
                              Set as Default
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePaymentMethod(method.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No payment methods added yet</p>
                  </div>
                )}

                <Separator className="my-6" />

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Add payment methods through your Stripe Connect dashboard
                  </p>
                  <Button variant="outline" onClick={handleAddPaymentMethod} disabled={addingPaymentMethod}>
                    {addingPaymentMethod ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Opening...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Payment Method
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Auto-Payout Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Automatic Payout Settings
                </CardTitle>
                <CardDescription>Configure when and how you receive payouts automatically</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-payout-enabled" className="text-base font-semibold">
                      Enable Automatic Payouts
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Automatically receive payouts on a regular schedule
                    </p>
                  </div>
                  <Switch
                    id="auto-payout-enabled"
                    checked={autoSettings.enabled}
                    onCheckedChange={(checked) =>
                      setAutoSettings({ ...autoSettings, enabled: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="payout-schedule">Payout Schedule</Label>
                    <Select
                      value={autoSettings.schedule}
                      onValueChange={(value: PayoutSchedule) =>
                        setAutoSettings({ ...autoSettings, schedule: value })
                      }
                      disabled={!autoSettings.enabled}
                    >
                      <SelectTrigger id="payout-schedule" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="manual">Manual Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      How often automatic payouts should be processed
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="payout-threshold">Minimum Payout Threshold</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-muted-foreground">$</span>
                      <Input
                        id="payout-threshold"
                        type="number"
                        min="0"
                        step="100"
                        value={autoSettings.threshold / 100}
                        onChange={(e) =>
                          setAutoSettings({
                            ...autoSettings,
                            threshold: Math.floor(parseFloat(e.target.value) * 100),
                          })
                        }
                        disabled={!autoSettings.enabled}
                        className="max-w-xs"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Minimum balance required before automatic payout is triggered
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="delay-days">Payout Delay (Days)</Label>
                    <Input
                      id="delay-days"
                      type="number"
                      min="0"
                      max="30"
                      value={autoSettings.delay_days}
                      onChange={(e) =>
                        setAutoSettings({
                          ...autoSettings,
                          delay_days: parseInt(e.target.value),
                        })
                      }
                      disabled={!autoSettings.enabled}
                      className="mt-2 max-w-xs"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Number of days to wait after funds become available before payout
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveAutoSettings} disabled={savingAutoSettings}>
                    {savingAutoSettings ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Settings'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax Forms Tab */}
          <TabsContent value="tax-forms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Tax Forms
                </CardTitle>
                <CardDescription>Manage your W9, 1099-K, and other tax documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Section */}
                <div className="p-4 border-2 border-dashed rounded-lg">
                  <h3 className="font-semibold mb-4">Upload New Tax Form</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="tax-year">Tax Year</Label>
                      <Select
                        value={selectedTaxYear.toString()}
                        onValueChange={(value) => setSelectedTaxYear(parseInt(value))}
                      >
                        <SelectTrigger id="tax-year" className="mt-2 max-w-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2026, 2025, 2024, 2023, 2022].map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="tax-file">Upload File (PDF)</Label>
                      <Input
                        id="tax-file"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setSelectedTaxFile(e.target.files?.[0] || null)}
                        className="mt-2"
                      />
                    </div>

                    <Button
                      onClick={handleUploadTaxForm}
                      disabled={!selectedTaxFile || uploadingTaxForm}
                    >
                      {uploadingTaxForm ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Tax Form
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Tax Forms List */}
                <div>
                  <h3 className="font-semibold mb-4">Submitted Tax Forms</h3>
                  {taxForms.length > 0 ? (
                    <div className="space-y-3">
                      {taxForms.map((form) => (
                        <div
                          key={form.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <div>
                              <p className="font-semibold">
                                {form.type} - {form.year}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Submitted: {payoutService.formatDate(form.submitted_at || '')}
                              </p>
                              <Badge
                                variant={form.status === 'approved' ? 'default' : 'outline'}
                                className="mt-1"
                              >
                                {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadTaxForm(form.id)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No tax forms uploaded yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how you want to be notified about payouts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-payout-sent" className="text-base">
                        Email when payout is sent
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Get notified when a payout is initiated
                      </p>
                    </div>
                    <Switch
                      id="email-payout-sent"
                      checked={notificationPrefs.email_on_payout_sent}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs({ ...notificationPrefs, email_on_payout_sent: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-payout-paid" className="text-base">
                        Email when payout is completed
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Get notified when funds arrive in your account
                      </p>
                    </div>
                    <Switch
                      id="email-payout-paid"
                      checked={notificationPrefs.email_on_payout_paid}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs({ ...notificationPrefs, email_on_payout_paid: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-payout-failed" className="text-base">
                        Email when payout fails
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Get notified if a payout encounters an error
                      </p>
                    </div>
                    <Switch
                      id="email-payout-failed"
                      checked={notificationPrefs.email_on_payout_failed}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs({ ...notificationPrefs, email_on_payout_failed: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms-payout-paid" className="text-base">
                        SMS when payout is completed
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Receive a text message when funds arrive
                      </p>
                    </div>
                    <Switch
                      id="sms-payout-paid"
                      checked={notificationPrefs.sms_on_payout_paid}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs({ ...notificationPrefs, sms_on_payout_paid: checked })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveNotifications} disabled={savingNotifications}>
                    {savingNotifications ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Preferences'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
