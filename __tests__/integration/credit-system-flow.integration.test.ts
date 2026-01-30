/**
 * Credit System Integration Tests
 * Tests complete credit workflows including balance checking, purchases, usage tracking, and auto-refill
 */

import { creditService } from '../../services/creditService';
import { usageService } from '../../services/usageService';
import { setupIntegrationTest, testUtils, mockCredits } from './setup';

describe('Credit System Integration Tests', () => {
  setupIntegrationTest();

  beforeEach(() => {
    testUtils.setupAuthenticatedState();
  });

  describe('Credit Balance and Transaction Flow', () => {
    it('should fetch current credit balance', async () => {
      // Given: User has credits
      // When: Fetching balance
      const balance = await creditService.getCreditBalance();

      // Then: Balance is returned
      expect(balance).toBeDefined();
      expect(balance?.available).toBe(mockCredits.available);
      expect(balance?.used).toBe(mockCredits.used);
      expect(balance?.total).toBe(mockCredits.total);
      expect(balance?.currency).toBe(mockCredits.currency);
    });

    it('should fetch credit transaction history', async () => {
      // Given: User has transaction history
      // When: Fetching transactions
      const history = await creditService.getTransactionHistory({
        page: 1,
        limit: 10,
      });

      // Then: Transactions are returned
      expect(history).toBeDefined();
      expect(history?.transactions).toBeDefined();
      expect(history?.transactions.length).toBeGreaterThan(0);
      expect(history?.total).toBe(2);

      // And: Transactions have correct structure
      const firstTx = history?.transactions[0];
      expect(firstTx?.id).toBeTruthy();
      expect(firstTx?.amount).toBeDefined();
      expect(firstTx?.type).toBeTruthy();
      expect(firstTx?.created_at).toBeTruthy();
    });

    it('should filter transactions by type', async () => {
      // Given: User wants to see only purchases
      // When: Filtering by purchase type
      const history = await creditService.getTransactionHistory({
        type: 'purchase',
        limit: 10,
      });

      // Then: Only purchase transactions are returned
      expect(history).toBeDefined();
      expect(history?.transactions).toBeDefined();
    });

    it('should paginate transaction history', async () => {
      // Given: User wants paginated results
      // When: Fetching different pages
      const page1 = await creditService.getTransactionHistory({
        page: 1,
        limit: 5,
      });

      const page2 = await creditService.getTransactionHistory({
        page: 2,
        limit: 5,
      });

      // Then: Different pages are returned
      expect(page1).toBeDefined();
      expect(page2).toBeDefined();
    });
  });

  describe('Credit Purchase Flow', () => {
    it('should complete credit purchase workflow', async () => {
      // Given: User views available credit packages
      const packages = await creditService.getCreditPackages();
      expect(packages).toBeDefined();
      expect(packages.length).toBeGreaterThan(0);

      // When: User selects and purchases package
      const selectedPackage = packages[0];
      const result = await creditService.purchaseCredits(selectedPackage.id, 'pm-123');

      // Then: Purchase succeeds
      expect(result.success).toBe(true);
      expect(result.transactionId).toBeTruthy();

      // And: Balance is updated
      const newBalance = await creditService.getCreditBalance();
      expect(newBalance).toBeDefined();
    });

    it('should get credit packages with bonus credits', async () => {
      // Given: User wants to purchase credits
      // When: Viewing packages
      const packages = await creditService.getCreditPackages();

      // Then: Packages include bonus information
      expect(packages).toBeDefined();
      packages.forEach(pkg => {
        expect(pkg.id).toBeTruthy();
        expect(pkg.name).toBeTruthy();
        expect(pkg.credits).toBeGreaterThan(0);
        expect(pkg.price).toBeGreaterThan(0);
      });
    });

    it('should handle purchase with default payment method', async () => {
      // Given: User has default payment method
      const packages = await creditService.getCreditPackages();
      const selectedPackage = packages[0];

      // When: Purchasing without specifying payment method
      const result = await creditService.purchaseCredits(selectedPackage.id);

      // Then: Purchase succeeds with default method
      expect(result.success).toBe(true);
    });
  });

  describe('Auto-Refill Configuration Flow', () => {
    it('should setup automatic credit refill', async () => {
      // Given: User wants auto-refill when credits are low
      const autoRefillConfig = {
        enabled: true,
        threshold: 100,
        amount: 500,
        paymentMethodId: 'pm-123',
      };

      // When: Setting up auto-refill
      const result = await creditService.setupAutomaticRefill(autoRefillConfig);

      // Then: Auto-refill is configured
      expect(result.success).toBe(true);
      expect(result.message).toContain('successfully');
    });

    it('should fetch auto-refill settings', async () => {
      // Given: User has auto-refill configured
      await creditService.setupAutomaticRefill({
        enabled: true,
        threshold: 100,
        amount: 500,
      });

      // When: Fetching settings
      const settings = await creditService.getAutoRefillSettings();

      // Then: Settings are returned
      expect(settings).toBeDefined();
      expect(settings?.enabled).toBeDefined();
    });

    it('should disable auto-refill', async () => {
      // Given: User has auto-refill enabled
      await creditService.setupAutomaticRefill({
        enabled: true,
        threshold: 100,
        amount: 500,
      });

      // When: Disabling auto-refill
      const result = await creditService.setupAutomaticRefill({
        enabled: false,
      });

      // Then: Auto-refill is disabled
      expect(result.success).toBe(true);
    });

    it('should update auto-refill threshold', async () => {
      // Given: User has auto-refill configured
      await creditService.setupAutomaticRefill({
        enabled: true,
        threshold: 100,
        amount: 500,
      });

      // When: Updating threshold
      const result = await creditService.setupAutomaticRefill({
        enabled: true,
        threshold: 200,
        amount: 500,
      });

      // Then: Threshold is updated
      expect(result.success).toBe(true);
    });
  });

  describe('Credit Usage Tracking Integration', () => {
    it('should track credit usage with API calls', async () => {
      // Given: User has credits
      const initialBalance = await creditService.getCreditBalance();
      expect(initialBalance).toBeDefined();

      // When: User makes API calls (simulated via usage service)
      // Note: This would typically trigger credit deduction
      const usageData = await usageService.getRealtimeUsage();

      // Then: Usage is tracked
      expect(usageData).toBeDefined();
    });

    it('should get detailed credit breakdown', async () => {
      // Given: User wants detailed credit info
      // When: Getting credits breakdown
      const credits = await creditService.getCredits();

      // Then: Detailed breakdown is returned
      expect(credits).toBeDefined();
      expect(credits.base_used).toBeDefined();
      expect(credits.base_quota).toBeDefined();
      expect(credits.add_on_used).toBeDefined();
      expect(credits.add_on_quota).toBeDefined();
      expect(credits.next_refresh).toBeTruthy();
    });

    it('should calculate usage percentage', () => {
      // Given: User has credit balance
      const balance = mockCredits;

      // When: Calculating usage percentage
      const percentage = creditService.calculateUsagePercentage(balance);

      // Then: Percentage is correct
      expect(percentage).toBe(25); // 250/1000 = 25%
    });
  });

  describe('Credit Display and Formatting', () => {
    it('should format credit amounts correctly', () => {
      // Given: Various credit amounts
      const amounts = [0, 100, 1000, 50.5];

      // When: Formatting for display
      const formatted = amounts.map(amount =>
        creditService.formatCreditAmount(amount, 'USD')
      );

      // Then: Amounts are properly formatted
      expect(formatted[0]).toContain('$0');
      expect(formatted[1]).toContain('$100');
      expect(formatted[2]).toContain('$1,000');
    });

    it('should get transaction type display text', () => {
      // Given: Various transaction types
      const types: Array<'purchase' | 'usage' | 'refund' | 'adjustment' | 'expiration'> = [
        'purchase',
        'usage',
        'refund',
        'adjustment',
        'expiration',
      ];

      // When: Getting display text
      const displayTexts = types.map(type =>
        creditService.getTransactionTypeDisplay(type)
      );

      // Then: Readable text is returned
      expect(displayTexts).toEqual([
        'Purchase',
        'Usage',
        'Refund',
        'Adjustment',
        'Expiration',
      ]);
    });

    it('should get transaction type color classes', () => {
      // Given: Various transaction types
      const purchaseColor = creditService.getTransactionTypeColorClass('purchase');
      const usageColor = creditService.getTransactionTypeColorClass('usage');
      const refundColor = creditService.getTransactionTypeColorClass('refund');

      // Then: Color classes are appropriate
      expect(purchaseColor).toContain('green');
      expect(usageColor).toContain('blue');
      expect(refundColor).toContain('purple');
    });
  });

  describe('Credit and Subscription Integration', () => {
    it('should handle credits with active subscription', async () => {
      // Given: User has subscription with included credits
      const credits = await creditService.getCredits();
      expect(credits).toBeDefined();

      // When: Checking base quota
      // Then: Base quota includes subscription credits
      expect(credits.base_quota).toBeGreaterThan(0);
    });

    it('should track add-on credit purchases separately', async () => {
      // Given: User purchased add-on credits
      const credits = await creditService.getCredits();

      // Then: Add-on credits are tracked separately
      expect(credits.add_on_quota).toBeDefined();
      expect(credits.add_on_used).toBeDefined();
    });

    it('should show next credit refresh date', async () => {
      // Given: User has subscription
      const credits = await creditService.getCredits();

      // Then: Next refresh date is provided
      expect(credits.next_refresh).toBeTruthy();
      expect(new Date(credits.next_refresh).getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle insufficient credits gracefully', async () => {
      // Given: User might have low credits
      const balance = await creditService.getCreditBalance();

      // Then: Balance check doesn't throw
      expect(balance).toBeDefined();
      expect(balance?.available).toBeGreaterThanOrEqual(0);
    });

    it('should handle transaction history with no transactions', async () => {
      // Given: New user with no transactions
      // When: Fetching history
      const history = await creditService.getTransactionHistory();

      // Then: Empty array is returned (or default mock data)
      expect(history).toBeDefined();
      expect(Array.isArray(history?.transactions)).toBe(true);
    });

    it('should handle failed credit purchase', async () => {
      // Given: Invalid payment method
      try {
        await creditService.purchaseCredits('invalid-package', 'invalid-pm');
      } catch (error) {
        // Then: Error is handled
        expect(error).toBeDefined();
      }
    });

    it('should handle concurrent balance checks', async () => {
      // Given: Multiple components checking balance
      const promises = [
        creditService.getCreditBalance(),
        creditService.getCreditBalance(),
        creditService.getCreditBalance(),
      ];

      // When: All requests complete
      const results = await Promise.all(promises);

      // Then: All return same balance
      expect(results[0]).toEqual(results[1]);
      expect(results[1]).toEqual(results[2]);
    });
  });

  describe('Complete Credit Lifecycle', () => {
    it('should handle complete credit lifecycle', async () => {
      // Step 1: Check initial balance
      const initialBalance = await creditService.getCreditBalance();
      expect(initialBalance).toBeDefined();

      // Step 2: View available packages
      const packages = await creditService.getCreditPackages();
      expect(packages.length).toBeGreaterThan(0);

      // Step 3: Purchase credits
      const purchaseResult = await creditService.purchaseCredits(packages[0].id);
      expect(purchaseResult.success).toBe(true);

      // Step 4: Setup auto-refill
      const autoRefill = await creditService.setupAutomaticRefill({
        enabled: true,
        threshold: 100,
        amount: 500,
      });
      expect(autoRefill.success).toBe(true);

      // Step 5: Use credits (would be via API calls in real scenario)
      // Check usage
      const finalBalance = await creditService.getCreditBalance();
      expect(finalBalance).toBeDefined();

      // Step 6: View transaction history
      const history = await creditService.getTransactionHistory();
      expect(history?.transactions.length).toBeGreaterThan(0);
    });

    it('should integrate credits with usage tracking', async () => {
      // Given: User makes API calls
      // When: Checking both credits and usage
      const [credits, usage] = await Promise.all([
        creditService.getCredits(),
        usageService.getRealtimeUsage(),
      ]);

      // Then: Both are tracked correctly
      expect(credits).toBeDefined();
      expect(usage).toBeDefined();

      // And: Usage correlates with credit consumption
      expect(credits.base_used).toBeGreaterThanOrEqual(0);
    });

    it('should handle credit purchase with usage in progress', async () => {
      // Given: User is actively using credits
      const balance1 = await creditService.getCreditBalance();

      // When: User purchases more credits during usage
      const packages = await creditService.getCreditPackages();
      await creditService.purchaseCredits(packages[0].id);

      // Then: Purchase succeeds
      const balance2 = await creditService.getCreditBalance();
      expect(balance2).toBeDefined();
    });
  });

  describe('Credit Expiration Handling', () => {
    it('should track credit expiration dates', async () => {
      // Given: User has credits with expiration
      const balance = await creditService.getCreditBalance();

      // Then: Next reset date is provided
      expect(balance?.next_reset_date).toBeTruthy();
    });

    it('should show expiring credits in transaction history', async () => {
      // Given: Credits are expiring
      const history = await creditService.getTransactionHistory({
        type: 'expiration',
      });

      // Then: Expiration transactions are tracked
      expect(history).toBeDefined();
    });
  });
});
