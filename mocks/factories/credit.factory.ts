/**
 * Mock data factory for credit-related entities
 */

import type {
  CreditBalance,
  CreditTransaction,
  CreditPackage,
  CreditBalanceResponse,
  AutoRefillConfig,
} from '@/services/creditService';

export class CreditFactory {
  static createCreditBalance(overrides?: Partial<CreditBalance>): CreditBalance {
    return {
      available: 1000,
      used: 250,
      total: 1250,
      currency: 'USD',
      next_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      ...overrides,
    };
  }

  static createCreditTransaction(overrides?: Partial<CreditTransaction>): CreditTransaction {
    return {
      id: 'txn-' + Math.random().toString(36).substr(2, 9),
      amount: 100,
      description: 'Credit purchase',
      type: 'purchase',
      created_at: new Date().toISOString(),
      balance_after: 1100,
      metadata: {
        invoice_id: 'inv-123',
        reference_id: 'ref-456',
      },
      ...overrides,
    };
  }

  static createTransactionHistory(count: number = 10): CreditTransaction[] {
    const types: CreditTransaction['type'][] = ['purchase', 'usage', 'refund', 'adjustment', 'expiration'];
    const transactions: CreditTransaction[] = [];

    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      const isPositive = type === 'purchase' || type === 'refund' || type === 'adjustment';
      transactions.push(CreditFactory.createCreditTransaction({
        id: 'txn-' + (i + 1),
        amount: isPositive ? Math.floor(Math.random() * 500) + 50 : -Math.floor(Math.random() * 100),
        type,
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        balance_after: 1000 - i * 50,
      }));
    }
    return transactions;
  }

  static createCreditPackage(overrides?: Partial<CreditPackage>): CreditPackage {
    return {
      id: 'pkg-' + Math.random().toString(36).substr(2, 9),
      name: 'Starter Pack',
      description: 'Perfect for getting started',
      credits: 1000,
      price: 10,
      currency: 'USD',
      is_popular: false,
      bonus_credits: 0,
      features: ['No expiration', 'Rollover credits', 'Priority support'],
      ...overrides,
    };
  }

  static createCreditPackages(): CreditPackage[] {
    return [
      CreditFactory.createCreditPackage({
        id: 'pkg-starter',
        name: 'Starter Pack',
        description: 'Perfect for individuals and small projects',
        credits: 1000,
        price: 10,
        is_popular: false,
        features: ['1,000 credits', 'No expiration', 'Email support'],
      }),
      CreditFactory.createCreditPackage({
        id: 'pkg-pro',
        name: 'Pro Pack',
        description: 'Most popular for teams and growing businesses',
        credits: 5000,
        price: 45,
        is_popular: true,
        bonus_credits: 500,
        features: ['5,000 credits', '500 bonus credits', 'Priority support', 'Advanced analytics'],
      }),
      CreditFactory.createCreditPackage({
        id: 'pkg-enterprise',
        name: 'Enterprise Pack',
        description: 'For large teams and high-volume usage',
        credits: 25000,
        price: 200,
        is_popular: false,
        bonus_credits: 5000,
        features: ['25,000 credits', '5,000 bonus credits', 'Dedicated support', 'Custom integrations', 'SLA guarantee'],
      }),
    ];
  }

  static createCreditBalanceResponse(overrides?: Partial<CreditBalanceResponse>): CreditBalanceResponse {
    return {
      base_used: 250,
      base_quota: 1000,
      add_on_used: 50,
      add_on_quota: 500,
      next_refresh: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      ...overrides,
    };
  }

  static createAutoRefillConfig(overrides?: Partial<AutoRefillConfig>): AutoRefillConfig {
    return {
      enabled: false,
      threshold: 100,
      amount: 1000,
      payment_method_id: 'pm_test_123',
      next_refill_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      ...overrides,
    };
  }

  static createLowBalance(): CreditBalance {
    return CreditFactory.createCreditBalance({
      available: 50,
      used: 950,
      total: 1000,
    });
  }

  static createDepletedBalance(): CreditBalance {
    return CreditFactory.createCreditBalance({
      available: 0,
      used: 1000,
      total: 1000,
    });
  }
}
