/**
 * Subscription Mock Data Factory
 * Generates realistic subscription and payment data for testing
 */
import type {
  Subscription,
  SubscriptionPlan,
  PaymentMethod,
  SubscriptionInvoice,
} from '@/services/subscriptionService';

export class SubscriptionFactory {
  static createSubscriptionPlan(overrides?: Partial<SubscriptionPlan>): SubscriptionPlan {
    return {
      id: 'plan_pro',
      name: 'Pro Plan',
      description: 'Professional features for individuals and small teams',
      price: 2900,
      currency: 'usd',
      interval: 'month',
      interval_count: 1,
      features: [
        'Unlimited API calls',
        'Advanced analytics',
        'Priority support',
        '10 team members',
      ],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    };
  }

  static createSubscription(overrides?: Partial<Subscription>): Subscription {
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    return {
      id: 'sub_123456',
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
      canceled_at: null,
      ended_at: null,
      trial_start: null,
      trial_end: null,
      plan: SubscriptionFactory.createSubscriptionPlan(),
      auto_renew: true,
      payment_method_id: 'pm_123456',
      next_payment_date: periodEnd.toISOString(),
      quantity: 1,
      ...overrides,
    };
  }

  static createPaymentMethod(overrides?: Partial<PaymentMethod>): PaymentMethod {
    return {
      id: 'pm_123456',
      type: 'card',
      card: {
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2025,
        country: 'US',
      },
      billing_details: {
        email: 'test@example.com',
        name: 'Test User',
      },
      created: Date.now(),
      is_default: true,
      ...overrides,
    };
  }

  static createInvoice(overrides?: Partial<SubscriptionInvoice>): SubscriptionInvoice {
    const now = Date.now();
    const periodStart = now - 30 * 24 * 60 * 60 * 1000; // 30 days ago
    const periodEnd = now;

    return {
      id: 'in_123456',
      amount_due: 2900,
      amount_paid: 2900,
      currency: 'usd',
      status: 'paid',
      number: 'INV-2024-0001',
      pdf_url: 'https://example.com/invoice.pdf',
      hosted_invoice_url: 'https://example.com/invoice',
      created: now,
      period_start: periodStart,
      period_end: periodEnd,
      lines: [
        {
          amount: 2900,
          currency: 'usd',
          description: 'Pro Plan subscription',
          period: {
            start: periodStart,
            end: periodEnd,
          },
          plan: {
            id: 'plan_pro',
            name: 'Pro Plan',
          },
        },
      ],
      ...overrides,
    };
  }

  static createCanceledSubscription(): Subscription {
    return SubscriptionFactory.createSubscription({
      status: 'canceled',
      cancel_at_period_end: false,
      canceled_at: new Date().toISOString(),
      ended_at: new Date().toISOString(),
      auto_renew: false,
    });
  }

  static createTrialSubscription(): Subscription {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

    return SubscriptionFactory.createSubscription({
      status: 'trialing',
      trial_start: now.toISOString(),
      trial_end: trialEnd.toISOString(),
    });
  }

  static createPlanList(): SubscriptionPlan[] {
    return [
      SubscriptionFactory.createSubscriptionPlan({
        id: 'plan_free',
        name: 'Free',
        price: 0,
        features: ['Basic features', '100 API calls/month'],
      }),
      SubscriptionFactory.createSubscriptionPlan({
        id: 'plan_basic',
        name: 'Basic',
        price: 1000,
        features: ['1000 API calls/month', 'Email support'],
      }),
      SubscriptionFactory.createSubscriptionPlan({
        id: 'plan_pro',
        name: 'Pro',
        price: 2900,
        is_popular: true,
        features: ['Unlimited API calls', 'Priority support'],
      }),
      SubscriptionFactory.createSubscriptionPlan({
        id: 'plan_enterprise',
        name: 'Enterprise',
        price: 15000,
        features: ['Custom solutions', 'Dedicated support', 'SLA'],
      }),
    ];
  }
}
