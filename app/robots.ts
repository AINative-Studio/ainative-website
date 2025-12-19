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
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
