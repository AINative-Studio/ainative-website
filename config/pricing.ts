/**
 * Pricing Configuration for India Pricing Experiment
 *
 * This module defines multi-tier pricing for AINative Studio:
 * - Premium tier: US/EU markets (USD)
 * - India tier: India market (INR at ~80% discount)
 *
 * Future: Add emerging and developing tiers based on Week 1 results
 */

/**
 * Pricing tier types
 */
export type PricingTier = 'premium' | 'india';

/**
 * Plan types
 */
export type PlanType = 'starter' | 'professional' | 'enterprise';

/**
 * Individual plan pricing
 */
export interface PricingPlan {
  monthly: number;
  display: string;
}

/**
 * Stripe price IDs for each plan
 */
export interface StripePriceIds {
  starter: string;
  professional: string;
  enterprise: string;
}

/**
 * Regional pricing tier configuration
 */
export interface RegionalPricing {
  currency: string;
  symbol: string;
  starter: PricingPlan;
  professional: PricingPlan;
  enterprise: PricingPlan;
  stripePriceIds: StripePriceIds;
}

/**
 * All pricing tiers
 */
export const PRICING_TIERS: Record<PricingTier, RegionalPricing> = {
  /**
   * Premium Tier: US, EU, and other developed markets
   * Currency: USD
   */
  premium: {
    currency: 'USD',
    symbol: '$',
    starter: {
      monthly: 12,
      display: '$12/month',
    },
    professional: {
      monthly: 25,
      display: '$25/month',
    },
    enterprise: {
      monthly: 50,
      display: '$50/month',
    },
    stripePriceIds: {
      starter: 'price_1RqnnmQ15P9oVNQ71LAhpvcp', // Basic $12/month
      professional: 'price_1RqnooQ15P9oVNQ73VJGX4LQ', // Teams $25/month
      enterprise: 'price_1RqnthQ15P9oVNQ7p3lM1BCA', // Enterprise $50/month
    },
  },

  /**
   * India Tier: India market with purchasing power parity pricing
   * Currency: INR (charged as USD equivalent in Stripe)
   * Actual Stripe prices created: Rs.249, Rs.999, Rs.3,999
   * Pricing: ~80-90% discount from US prices
   */
  india: {
    currency: 'INR',
    symbol: '\u20B9',
    starter: {
      monthly: 249, // Rs.249 (~$3 USD) - 75% discount vs $12
      display: '\u20B9249/month (~$3 USD)',
    },
    professional: {
      monthly: 999, // Rs.999 (~$12 USD) - 52% discount vs $25
      display: '\u20B9999/month (~$12 USD)',
    },
    enterprise: {
      monthly: 3999, // Rs.3,999 (~$48 USD) - 4% discount vs $50
      display: '\u20B93,999/month (~$48 USD)',
    },
    stripePriceIds: {
      starter: 'price_1Siq0QDP3OaRv4TyOn6cyJg4', // Individual Developer - Rs.249
      professional: 'price_1Siq1lDP3OaRv4TyzccI8HFF', // Dev Teams - Rs.999
      enterprise: 'price_1Siq7fDP3OaRv4TyeaJ2wFwR', // SRE Agent - Rs.3,999
    },
  },
};

/**
 * Get pricing configuration for a specific tier
 *
 * @param tier - Pricing tier to retrieve
 * @returns RegionalPricing for the specified tier, defaults to premium if tier not found
 */
export function getPricingForTier(tier: PricingTier): RegionalPricing {
  return PRICING_TIERS[tier] || PRICING_TIERS.premium;
}

/**
 * Format price with currency symbol and thousands separator
 *
 * @param amount - Numeric price amount
 * @param _currency - Currency code (USD, INR, etc.)
 * @param symbol - Currency symbol ($, Rs., etc.)
 * @returns Formatted price string (e.g., "$1,499" or "Rs.1,499")
 */
export function formatPrice(amount: number, _currency: string, symbol: string): string {
  // Format with thousands separator
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  return `${symbol}${formatted}`;
}

/**
 * Get all plan names
 */
export const PLAN_NAMES: PlanType[] = ['starter', 'professional', 'enterprise'];

/**
 * Get display name for plan type
 */
export function getPlanDisplayName(plan: PlanType): string {
  const displayNames: Record<PlanType, string> = {
    starter: 'Starter',
    professional: 'Professional',
    enterprise: 'Enterprise',
  };

  return displayNames[plan];
}

/**
 * Check if a tier is available
 */
export function isTierAvailable(tier: PricingTier): boolean {
  return tier in PRICING_TIERS;
}

/**
 * Price ID mapping for all products across tiers
 * Maps plan IDs to their Stripe price IDs for each pricing tier
 */
export const PRICE_ID_MAPPING: Record<string, Record<PricingTier, string | null>> = {
  // Free tier - no price ID needed
  hobbyist: {
    premium: null,
    india: null,
  },
  // Development plans
  individual: {
    premium: 'price_1RqnnmQ15P9oVNQ71LAhpvcp', // $12/month
    india: 'price_1Siq0QDP3OaRv4TyOn6cyJg4', // Rs.249/month
  },
  teams: {
    premium: 'price_1RqnooQ15P9oVNQ73VJGX4LQ', // $25/month
    india: 'price_1Siq1lDP3OaRv4TyzccI8HFF', // Rs.999/month
  },
  enterprise: {
    premium: 'price_1RqnthQ15P9oVNQ7p3lM1BCA', // $50/month
    india: 'price_1Siq7fDP3OaRv4TyeaJ2wFwR', // Rs.3,999/month
  },
  sre: {
    premium: 'price_1RqnthQ15P9oVNQ7p3lM1BCA', // Site Reliability Engineer Agent $50/month
    india: 'price_1Siq7fDP3OaRv4TyeaJ2wFwR', // Rs.3,999/month
  },
  sre_agent: {
    premium: 'price_1RqnthQ15P9oVNQ7p3lM1BCA', // Alias for sre
    india: 'price_1Siq7fDP3OaRv4TyeaJ2wFwR', // Rs.3,999/month
  },
  // ZeroDB add-ons
  zerodb_pro: {
    premium: null, // TODO: Add US price ID when created
    india: 'price_1Siq34DP3OaRv4TyO4vB85LW', // Rs.499/month
  },
  zerodb_scale: {
    premium: null, // TODO: Add US price ID when created
    india: 'price_1Siq4zDP3OaRv4TyEYUfqX8W', // Rs.1,999/month
  },
  // Agent add-ons
  cody: {
    premium: null, // TODO: Add US price ID when created
    india: 'price_1SiqAjDP3OaRv4TyGqOzihen', // Rs.7,999/month
  },
  swarm: {
    premium: null, // TODO: Add US price ID when created
    india: 'price_1SiqBhDP3OaRv4Ty8ovno9nZ', // Rs.19,999/month
  },
};

/**
 * Get Stripe price ID for a plan based on pricing tier
 * @param planId - The plan ID from the API
 * @param tier - The pricing tier (premium or india)
 * @returns Stripe price ID or null if not available for that tier
 */
export function getPriceIdForPlan(planId: string, tier: PricingTier): string | null {
  const mapping = PRICE_ID_MAPPING[planId.toLowerCase()];
  if (!mapping) {
    console.warn(`No price mapping found for plan: ${planId}`);
    return null;
  }
  return mapping[tier];
}
