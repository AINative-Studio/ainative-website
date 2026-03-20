import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ainative.studio';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/account/',
          '/billing/',
          '/credit-history/',
          '/invoices/',
          '/login',
          '/signup',
          '/forgot-password',
          '/design-system/',
        ],
      },
      {
        userAgent: ['GPTBot', 'anthropic-ai', 'Claude-Web', 'CCBot', 'Google-Extended'],
        allow: '/',
        disallow: [
          '/dashboard/',
          '/account/',
          '/billing/',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
