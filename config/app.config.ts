/**
 * Centralized application configuration for Next.js
 * Environment variables should be prefixed with NEXT_PUBLIC_ to be accessible in the browser
 */

export const appConfig = {
  company: {
    name: 'AINative Studio',
    email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'hello@ainative.studio',
    phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || '(831) 295-1482',
    address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || '1101 Pacific Avenue, Santa Cruz, CA 95060',
    location: process.env.NEXT_PUBLIC_COMPANY_LOCATION || 'Santa Cruz, California',
    businessHours: process.env.NEXT_PUBLIC_BUSINESS_HOURS || 'Monday - Friday, 9:00 AM - 6:00 PM PST'
  },

  links: {
    calendly: process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/seedlingstudio/',
    blog: process.env.NEXT_PUBLIC_BLOG_URL || 'https://blog.ainative.studio',
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || 'https://www.linkedin.com/company/cody-agent/posts/?feedView=all',
    github: process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com/AINative-Studio',
    zerodb: process.env.NEXT_PUBLIC_ZERODB_URL || 'https://zerodb.ainative.studio'
  },

  pricing: {
    stripeKeys: {
      free: process.env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID || 'price_1RqnriQ15P9oVNQ769M5G46y',
      basic: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID || 'price_1RqnnmQ15P9oVNQ71LAhpvcp',
      pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_1Rqo1LQ15P9oVNQ7V0vROmsh',
      teams: process.env.NEXT_PUBLIC_STRIPE_TEAMS_PRICE_ID || 'price_1RqnooQ15P9oVNQ73VJGX4LQ',
      scale: process.env.NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID || 'price_1Rqo2oQ15P9oVNQ7Eu5odtQ7',
      enterprise: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'price_1RqnthQ15P9oVNQ7p3lM1BCA',
      swarm: process.env.NEXT_PUBLIC_STRIPE_SWARM_PRICE_ID || 'price_1RqnpjQ15P9oVNQ7Zjbj7xuE'
    },
    amounts: {
      free: 0,
      basic: parseInt(process.env.NEXT_PUBLIC_BASIC_AMOUNT || '1000'), // $10
      pro: parseInt(process.env.NEXT_PUBLIC_PRO_AMOUNT || '2900'), // $29
      teams: parseInt(process.env.NEXT_PUBLIC_TEAMS_AMOUNT || '6000'), // $60
      scale: parseInt(process.env.NEXT_PUBLIC_SCALE_AMOUNT || '9900'), // $99
      enterprise: parseInt(process.env.NEXT_PUBLIC_ENTERPRISE_AMOUNT || '15000'), // $150
      swarm: parseInt(process.env.NEXT_PUBLIC_SWARM_AMOUNT || '60000') // $600
    }
  },

  statistics: {
    totalUsers: process.env.NEXT_PUBLIC_STATS_USERS || '10,000+',
    rating: process.env.NEXT_PUBLIC_STATS_RATING || '4.9/5',
    reviewCount: process.env.NEXT_PUBLIC_STATS_REVIEWS || '500+'
  },

  app: {
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    name: 'AINative',
    description: 'AI-powered development platform'
  },

  theme: {
    colors: {
      primary: process.env.NEXT_PUBLIC_THEME_PRIMARY || '#4B6FED',
      secondary: process.env.NEXT_PUBLIC_THEME_SECONDARY || '#8A63F4',
      accent: process.env.NEXT_PUBLIC_THEME_ACCENT || '#D04BF4',
      background: process.env.NEXT_PUBLIC_THEME_BACKGROUND || '#0D1117',
      orange: process.env.NEXT_PUBLIC_THEME_ORANGE || '#FF6B00'
    }
  },

  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000')
  },

  qnn: {
    apiUrl: process.env.NEXT_PUBLIC_QNN_API_URL || 'https://qnn-api.ainative.studio',
    timeout: parseInt(process.env.NEXT_PUBLIC_QNN_API_TIMEOUT || '30000'),
    pollingInterval: parseInt(process.env.NEXT_PUBLIC_QNN_POLLING_INTERVAL || '5000'),
    maxRetries: parseInt(process.env.NEXT_PUBLIC_QNN_MAX_RETRIES || '3'),
    enablePolling: process.env.NEXT_PUBLIC_QNN_ENABLE_POLLING !== 'false'
  },

  features: {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableChat: process.env.NEXT_PUBLIC_ENABLE_CHAT !== 'false',
    enableDebug: process.env.NODE_ENV === 'development'
  }
} as const;

// Type definitions for better TypeScript support
export type AppConfig = typeof appConfig;
export type CompanyConfig = typeof appConfig.company;
export type LinksConfig = typeof appConfig.links;
export type PricingConfig = typeof appConfig.pricing;
export type StatisticsConfig = typeof appConfig.statistics;
export type ThemeConfig = typeof appConfig.theme;
export type QNNConfig = typeof appConfig.qnn;

// Helper functions
export const getContactEmail = () => appConfig.company.email;
export const getCalendlyUrl = () => appConfig.links.calendly;
export const getStripeProPriceId = () => appConfig.pricing.stripeKeys.pro;
export const getStripeTeamsPriceId = () => appConfig.pricing.stripeKeys.teams;
export const getQNNApiUrl = () => appConfig.qnn.apiUrl;
export const getQNNTimeout = () => appConfig.qnn.timeout;
export const getQNNPollingInterval = () => appConfig.qnn.pollingInterval;

// Validation function to ensure critical config is available
export const validateConfig = () => {
  const criticalValues = [
    appConfig.company.email,
    appConfig.links.calendly,
    appConfig.pricing.stripeKeys.pro,
    appConfig.pricing.stripeKeys.teams
  ];

  const missing = criticalValues.filter(value => !value);
  if (missing.length > 0) {
    console.warn('Missing critical configuration values:', missing);
  }

  return missing.length === 0;
};
