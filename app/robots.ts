import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ainative.studio';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
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
        // AI crawlers get explicit access to discovery files and product pages
        userAgent: ['GPTBot', 'anthropic-ai', 'Claude-Web', 'CCBot', 'Google-Extended', 'PerplexityBot', 'Bytespider'],
        allow: [
          '/',
          '/products/',
          '/pricing',
          '/llms.txt',
          '/agents.txt',
          '/.well-known/',
          '/compare/',
          '/showcases/',
          '/blog/',
        ],
        disallow: [
          '/dashboard/',
          '/account/',
          '/billing/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
