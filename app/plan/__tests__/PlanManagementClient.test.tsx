/**
 * Plan Management Client Tests
 * Comprehensive tests for subscription management functionality
 */

import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import PlanManagementClient from '../PlanManagementClient';
import { SubscriptionService } from '@/services/subscriptionService';
import { pricingService } from '@/services/pricingService';

// Mock next/navigation
const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock services
jest.mock('@/services/subscriptionService');
jest.mock('@/services/pricingService');

const mockSubscriptionService = SubscriptionService as jest.MockedClass<typeof SubscriptionService>;
const mockPricingService = pricingService as jest.Mocked<typeof pricingService>;

describe('PlanManagementClient', () => {
  const mockSubscription = {
    id: 'sub-123',
    status: 'active' as const,
    current_period_start: '2025-01-01T00:00:00Z',
    current_period_end: '2025-02-01T00:00:00Z',
    cancel_at_period_end: false,
    canceled_at: null,
    ended_at: null,
    trial_start: null,
    trial_end: null,
    plan: {
      id: 'pro',
      name: 'Pro',
      description: 'Professional plan',
      price: 1200,
      currency: 'USD',
      interval: 'month' as const,
      interval_count: 1,
      features: ['Unlimited completions', 'Priority support', 'Advanced features'],
      is_popular: true,
      is_active: true,
    },
    auto_renew: true,
    quantity: 1,
  };

  const mockPlans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Free tier',
      price: 0,
      currency: 'USD',
      billing_period: null,
      stripe_price_id: 'price_free',
      button_text: 'Get Started',
      level: 'start' as const,
      highlighted: false,
      features: ['50 prompt credits/month', 'Community support'],
      is_active: true,
      sort_order: 0,
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Professional plan',
      price: 1200,
      currency: 'USD',
      billing_period: 'month' as const,
      stripe_price_id: 'price_pro',
      button_text: 'Upgrade to Pro',
      level: 'pro' as const,
      highlighted: true,
      features: ['Unlimited completions', 'Priority support', 'Advanced features'],
      is_active: true,
      sort_order: 1,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Enterprise plan',
      price: 5000,
      currency: 'USD',
      billing_period: 'month' as const,
      stripe_price_id: 'price_enterprise',
      button_text: 'Contact Sales',
      level: 'enterprise' as const,
      highlighted: false,
      features: ['Everything in Pro', 'Dedicated support', 'Custom integrations'],
      is_active: true,
      sort_order: 2,
    },
  ];

  const mockPaymentMethods = [
    {
      id: 'pm-123',
      type: 'card' as const,
      card: {
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2026,
        country: 'US',
      },
      billing_details: {
        email: 'test@example.com',
        name: 'Test User',
      },
      created: 1704067200,
      is_default: true,
    },
  ];

  const mockInvoices = [
    {
      id: 'inv-123',
      amount_due: 1200,
      amount_paid: 1200,
      currency: 'usd',
      status: 'paid' as const,
      number: 'INV-001',
      pdf_url: 'https://example.com/invoice.pdf',
      hosted_invoice_url: 'https://example.com/view',
      created: 1704067200,
      period_start: 1704067200,
      period_end: 1706745600,
      lines: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    const mockServiceInstance = {
      getCurrentSubscription: jest.fn().mockResolvedValue(mockSubscription),
      getPaymentMethods: jest.fn().mockResolvedValue(mockPaymentMethods),
      getInvoices: jest.fn().mockResolvedValue(mockInvoices),
      cancelSubscription: jest.fn().mockResolvedValue({ success: true, message: 'Cancelled' }),
      reactivateSubscription: jest.fn().mockResolvedValue({ success: true, message: 'Reactivated' }),
      updateSubscription: jest.fn().mockResolvedValue({ success: true, message: 'Updated' }),
      removePaymentMethod: jest.fn().mockResolvedValue({ success: true, message: 'Removed' }),
      setDefaultPaymentMethod: jest.fn().mockResolvedValue({ success: true, message: 'Updated' }),
    };

    mockSubscriptionService.mockImplementation(() => mockServiceInstance as any);
    mockPricingService.getPricingPlansWithFallback.mockResolvedValue(mockPlans);
  });

  describe('Initial Render and Data Loading', () => {
    it('should display loading spinner initially', () => {
      render(<PlanManagementClient />);
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });

    it('should load and display subscription data', async () => {
      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Subscription Management')).toBeInTheDocument();
      });

      expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      expect(screen.getByText('$12.00')).toBeInTheDocument();
    });

    it('should display error state when data fails to load', async () => {
      mockSubscriptionService.mockImplementation(() => ({
        getCurrentSubscription: jest.fn().mockRejectedValue(new Error('Network error')),
        getPaymentMethods: jest.fn().mockRejectedValue(new Error('Network error')),
        getInvoices: jest.fn().mockRejectedValue(new Error('Network error')),
      } as any));

      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Unable to load subscription information')).toBeInTheDocument();
      });
    });

    it('should default to free plan when no subscription exists', async () => {
      mockSubscriptionService.mockImplementation(() => ({
        getCurrentSubscription: jest.fn().mockResolvedValue(null),
        getPaymentMethods: jest.fn().mockResolvedValue([]),
        getInvoices: jest.fn().mockResolvedValue([]),
      } as any));

      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText(/Free/i)).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between tabs', async () => {
      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Subscription Management')).toBeInTheDocument();
      });

      const plansTab = screen.getByRole('tab', { name: /Plans/i });
      await userEvent.click(plansTab);

      expect(screen.getByText('Available Plans')).toBeInTheDocument();
    });

    it('should display payment methods in Payment tab', async () => {
      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Subscription Management')).toBeInTheDocument();
      });

      const paymentTab = screen.getByRole('tab', { name: /Payment/i });
      await userEvent.click(paymentTab);

      expect(screen.getByText('Payment Methods')).toBeInTheDocument();
      expect(screen.getByText(/VISA •••• 4242/i)).toBeInTheDocument();
    });

    it('should display billing history in Billing tab', async () => {
      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Subscription Management')).toBeInTheDocument();
      });

      const billingTab = screen.getByRole('tab', { name: /Billing/i });
      await userEvent.click(billingTab);

      expect(screen.getByText('Billing History')).toBeInTheDocument();
      expect(screen.getByText('INV-001')).toBeInTheDocument();
    });
  });

  describe('Subscription Cancellation', () => {
    it('should show cancellation dialog when cancel button clicked', async () => {
      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /Cancel Subscription/i });
      await userEvent.click(cancelButton);

      expect(screen.getByText('Cancel Subscription')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to cancel/i)).toBeInTheDocument();
    });

    it('should cancel subscription when confirmed', async () => {
      const mockCancelSubscription = jest.fn().mockResolvedValue({
        success: true,
        message: 'Subscription cancelled',
      });

      mockSubscriptionService.mockImplementation(() => ({
        getCurrentSubscription: jest.fn().mockResolvedValue(mockSubscription),
        getPaymentMethods: jest.fn().mockResolvedValue(mockPaymentMethods),
        getInvoices: jest.fn().mockResolvedValue(mockInvoices),
        cancelSubscription: mockCancelSubscription,
      } as any));

      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /Cancel Subscription/i });
      await userEvent.click(cancelButton);

      const confirmButton = screen.getByRole('button', { name: /Confirm Cancellation/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockCancelSubscription).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('cancelled'));
      });
    });

    it('should not cancel when dialog is dismissed', async () => {
      const mockCancelSubscription = jest.fn();

      mockSubscriptionService.mockImplementation(() => ({
        getCurrentSubscription: jest.fn().mockResolvedValue(mockSubscription),
        getPaymentMethods: jest.fn().mockResolvedValue(mockPaymentMethods),
        getInvoices: jest.fn().mockResolvedValue(mockInvoices),
        cancelSubscription: mockCancelSubscription,
      } as any));

      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /Cancel Subscription/i });
      await userEvent.click(cancelButton);

      const dismissButton = screen.getByRole('button', { name: /^Cancel$/i });
      await userEvent.click(dismissButton);

      expect(mockCancelSubscription).not.toHaveBeenCalled();
    });
  });

  describe('Plan Upgrades and Downgrades', () => {
    it('should show upgrade dialog when selecting higher tier plan', async () => {
      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      });

      const plansTab = screen.getByRole('tab', { name: /Plans/i });
      await userEvent.click(plansTab);

      const enterpriseCards = screen.getAllByText(/Enterprise/i);
      const selectButton = screen.getByRole('button', { name: /Contact Sales/i });
      await userEvent.click(selectButton);

      await waitFor(() => {
        expect(screen.getByText('Upgrade Plan')).toBeInTheDocument();
        expect(screen.getByText(/upgrading to the Enterprise plan/i)).toBeInTheDocument();
      });
    });

    it('should show downgrade dialog when selecting lower tier plan', async () => {
      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      });

      const plansTab = screen.getByRole('tab', { name: /Plans/i });
      await userEvent.click(plansTab);

      const freeCards = screen.getAllByText(/Free/i);
      const selectButton = screen.getByRole('button', { name: /Get Started/i });
      await userEvent.click(selectButton);

      await waitFor(() => {
        expect(screen.getByText('Downgrade Plan')).toBeInTheDocument();
      });
    });

    it('should display prorated billing information for upgrades', async () => {
      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      });

      const plansTab = screen.getByRole('tab', { name: /Plans/i });
      await userEvent.click(plansTab);

      const selectButton = screen.getByRole('button', { name: /Contact Sales/i });
      await userEvent.click(selectButton);

      await waitFor(() => {
        expect(screen.getByText(/Prorated Billing/i)).toBeInTheDocument();
      });
    });

    it('should show info that current plan features continue until period end for downgrades', async () => {
      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      });

      const plansTab = screen.getByRole('tab', { name: /Plans/i });
      await userEvent.click(plansTab);

      const selectButton = screen.getByRole('button', { name: /Get Started/i });
      await userEvent.click(selectButton);

      await waitFor(() => {
        expect(screen.getByText(/No Immediate Charge/i)).toBeInTheDocument();
      });
    });

    it('should not allow selecting current plan', async () => {
      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      });

      const plansTab = screen.getByRole('tab', { name: /Plans/i });
      await userEvent.click(plansTab);

      const currentPlanButton = screen.getByRole('button', { name: /Current Plan/i });
      expect(currentPlanButton).toBeDisabled();
    });
  });

  describe('Payment Method Management', () => {
    it('should display payment methods', async () => {
      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Subscription Management')).toBeInTheDocument();
      });

      const paymentTab = screen.getByRole('tab', { name: /Payment/i });
      await userEvent.click(paymentTab);

      expect(screen.getByText(/VISA •••• 4242/i)).toBeInTheDocument();
      expect(screen.getByText(/Expires 12\/2026/i)).toBeInTheDocument();
    });

    it('should show empty state when no payment methods', async () => {
      mockSubscriptionService.mockImplementation(() => ({
        getCurrentSubscription: jest.fn().mockResolvedValue(mockSubscription),
        getPaymentMethods: jest.fn().mockResolvedValue([]),
        getInvoices: jest.fn().mockResolvedValue(mockInvoices),
      } as any));

      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Subscription Management')).toBeInTheDocument();
      });

      const paymentTab = screen.getByRole('tab', { name: /Payment/i });
      await userEvent.click(paymentTab);

      expect(screen.getByText('No payment methods added yet')).toBeInTheDocument();
    });

    it('should remove payment method when confirmed', async () => {
      const mockRemovePaymentMethod = jest.fn().mockResolvedValue({
        success: true,
        message: 'Payment method removed',
      });

      const multiplePaymentMethods = [
        ...mockPaymentMethods,
        {
          ...mockPaymentMethods[0],
          id: 'pm-456',
          is_default: false,
        },
      ];

      mockSubscriptionService.mockImplementation(() => ({
        getCurrentSubscription: jest.fn().mockResolvedValue(mockSubscription),
        getPaymentMethods: jest.fn()
          .mockResolvedValueOnce(multiplePaymentMethods)
          .mockResolvedValueOnce(mockPaymentMethods),
        getInvoices: jest.fn().mockResolvedValue(mockInvoices),
        removePaymentMethod: mockRemovePaymentMethod,
      } as any));

      // Mock window.confirm
      window.confirm = jest.fn().mockReturnValue(true);

      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Subscription Management')).toBeInTheDocument();
      });

      const paymentTab = screen.getByRole('tab', { name: /Payment/i });
      await userEvent.click(paymentTab);

      const deleteButtons = screen.getAllByRole('button', { name: '' });
      await userEvent.click(deleteButtons[1]); // Click second delete button

      await waitFor(() => {
        expect(mockRemovePaymentMethod).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalled();
      });
    });

    it('should set default payment method', async () => {
      const mockSetDefaultPaymentMethod = jest.fn().mockResolvedValue({
        success: true,
        message: 'Default payment method updated',
      });

      const multiplePaymentMethods = [
        ...mockPaymentMethods,
        {
          ...mockPaymentMethods[0],
          id: 'pm-456',
          is_default: false,
        },
      ];

      mockSubscriptionService.mockImplementation(() => ({
        getCurrentSubscription: jest.fn().mockResolvedValue(mockSubscription),
        getPaymentMethods: jest.fn().mockResolvedValue(multiplePaymentMethods),
        getInvoices: jest.fn().mockResolvedValue(mockInvoices),
        setDefaultPaymentMethod: mockSetDefaultPaymentMethod,
      } as any));

      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Subscription Management')).toBeInTheDocument();
      });

      const paymentTab = screen.getByRole('tab', { name: /Payment/i });
      await userEvent.click(paymentTab);

      const setDefaultButton = screen.getByRole('button', { name: /Set Default/i });
      await userEvent.click(setDefaultButton);

      await waitFor(() => {
        expect(mockSetDefaultPaymentMethod).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalled();
      });
    });
  });

  describe('Billing History', () => {
    it('should display invoices', async () => {
      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Subscription Management')).toBeInTheDocument();
      });

      const billingTab = screen.getByRole('tab', { name: /Billing/i });
      await userEvent.click(billingTab);

      expect(screen.getByText('INV-001')).toBeInTheDocument();
      expect(screen.getByText(/PAID/i)).toBeInTheDocument();
    });

    it('should show empty state when no invoices', async () => {
      mockSubscriptionService.mockImplementation(() => ({
        getCurrentSubscription: jest.fn().mockResolvedValue(mockSubscription),
        getPaymentMethods: jest.fn().mockResolvedValue(mockPaymentMethods),
        getInvoices: jest.fn().mockResolvedValue([]),
      } as any));

      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Subscription Management')).toBeInTheDocument();
      });

      const billingTab = screen.getByRole('tab', { name: /Billing/i });
      await userEvent.click(billingTab);

      expect(screen.getByText('No invoices yet')).toBeInTheDocument();
    });

    it('should open invoice PDF when download clicked', async () => {
      window.open = jest.fn();

      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Subscription Management')).toBeInTheDocument();
      });

      const billingTab = screen.getByRole('tab', { name: /Billing/i });
      await userEvent.click(billingTab);

      const downloadButtons = screen.getAllByRole('button', { name: '' });
      const pdfButton = downloadButtons.find(btn => btn.querySelector('svg'));

      if (pdfButton) {
        await userEvent.click(pdfButton);
        expect(window.open).toHaveBeenCalledWith(mockInvoices[0].pdf_url, '_blank');
      }
    });
  });

  describe('Subscription Reactivation', () => {
    it('should show reactivation option for cancelled subscriptions', async () => {
      const cancelledSubscription = {
        ...mockSubscription,
        cancel_at_period_end: true,
      };

      mockSubscriptionService.mockImplementation(() => ({
        getCurrentSubscription: jest.fn().mockResolvedValue(cancelledSubscription),
        getPaymentMethods: jest.fn().mockResolvedValue(mockPaymentMethods),
        getInvoices: jest.fn().mockResolvedValue(mockInvoices),
      } as any));

      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText(/Subscription Ending/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /Reactivate Subscription/i })).toBeInTheDocument();
    });

    it('should reactivate subscription when confirmed', async () => {
      const cancelledSubscription = {
        ...mockSubscription,
        cancel_at_period_end: true,
      };

      const mockReactivateSubscription = jest.fn().mockResolvedValue({
        success: true,
        message: 'Subscription reactivated',
      });

      mockSubscriptionService.mockImplementation(() => ({
        getCurrentSubscription: jest.fn()
          .mockResolvedValueOnce(cancelledSubscription)
          .mockResolvedValueOnce(mockSubscription),
        getPaymentMethods: jest.fn().mockResolvedValue(mockPaymentMethods),
        getInvoices: jest.fn().mockResolvedValue(mockInvoices),
        reactivateSubscription: mockReactivateSubscription,
      } as any));

      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText(/Subscription Ending/i)).toBeInTheDocument();
      });

      const reactivateButtons = screen.getAllByRole('button', { name: /Reactivate Subscription/i });
      await userEvent.click(reactivateButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Reactivate Subscription')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Confirm Reactivation/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockReactivateSubscription).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back when back button clicked', async () => {
      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Subscription Management')).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /Back to Dashboard/i });
      await userEvent.click(backButton);

      expect(mockBack).toHaveBeenCalled();
    });

    it('should navigate to billing page when add payment method clicked', async () => {
      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Subscription Management')).toBeInTheDocument();
      });

      const paymentTab = screen.getByRole('tab', { name: /Payment/i });
      await userEvent.click(paymentTab);

      const addButton = screen.getByRole('button', { name: /Add Payment Method/i });
      await userEvent.click(addButton);

      expect(mockPush).toHaveBeenCalledWith('/billing');
    });
  });

  describe('Error Handling', () => {
    it('should display error toast when cancellation fails', async () => {
      const mockCancelSubscription = jest.fn().mockResolvedValue({
        success: false,
        message: 'Cancellation failed',
      });

      mockSubscriptionService.mockImplementation(() => ({
        getCurrentSubscription: jest.fn().mockResolvedValue(mockSubscription),
        getPaymentMethods: jest.fn().mockResolvedValue(mockPaymentMethods),
        getInvoices: jest.fn().mockResolvedValue(mockInvoices),
        cancelSubscription: mockCancelSubscription,
      } as any));

      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /Cancel Subscription/i });
      await userEvent.click(cancelButton);

      const confirmButton = screen.getByRole('button', { name: /Confirm Cancellation/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Cancellation failed');
      });
    });

    it('should display error toast when plan update fails', async () => {
      const mockUpdateSubscription = jest.fn().mockResolvedValue({
        success: false,
        message: 'Update failed',
      });

      mockSubscriptionService.mockImplementation(() => ({
        getCurrentSubscription: jest.fn().mockResolvedValue(mockSubscription),
        getPaymentMethods: jest.fn().mockResolvedValue(mockPaymentMethods),
        getInvoices: jest.fn().mockResolvedValue(mockInvoices),
        updateSubscription: mockUpdateSubscription,
      } as any));

      render(<PlanManagementClient />);

      await waitFor(() => {
        expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      });

      const plansTab = screen.getByRole('tab', { name: /Plans/i });
      await userEvent.click(plansTab);

      const selectButton = screen.getByRole('button', { name: /Get Started/i });
      await userEvent.click(selectButton);

      const confirmButton = screen.getByRole('button', { name: /Confirm Change/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Update failed');
      });
    });
  });
});
