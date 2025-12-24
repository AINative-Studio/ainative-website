/**
 * JSON-LD Structured Data Components for SEO
 * Implements Schema.org markup for better search engine understanding
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ainative.studio';

// Organization Schema
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AI Native Studio',
    url: siteUrl,
    logo: `${siteUrl}/code_simple_logo.jpg`,
    description: 'Next-generation development environment powered by quantum computing and artificial intelligence.',
    sameAs: [
      'https://twitter.com/ainativestudio',
      'https://github.com/ainativestudio',
      'https://www.linkedin.com/company/ai-native-studio',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${siteUrl}/support`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Software Application Schema
export function SoftwareApplicationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AI Native Studio',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: ['Windows', 'macOS', 'Linux', 'Web'],
    description: 'Next-generation development environment powered by quantum computing and artificial intelligence to enhance developer productivity and code quality.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '127',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    author: {
      '@type': 'Organization',
      name: 'AI Native Studio',
      url: siteUrl,
      logo: `${siteUrl}/code_simple_logo.jpg`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Native Studio',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/code_simple_logo.jpg`,
      },
    },
    screenshot: `${siteUrl}/card.png`,
    softwareVersion: '1.0.0',
    datePublished: '2025-01-01',
    dateModified: new Date().toISOString().split('T')[0],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Website Schema with Search Action
export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AI Native Studio',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Breadcrumb Schema for navigation
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FAQ Schema for FAQ pages
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSchema({ items }: { items: FAQItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Product Schema for pricing pages
interface ProductOffer {
  name: string;
  description: string;
  price: number;
  priceCurrency: string;
}

export function ProductSchema({ offer }: { offer: ProductOffer }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: offer.name,
    description: offer.description,
    brand: {
      '@type': 'Brand',
      name: 'AI Native Studio',
    },
    offers: {
      '@type': 'Offer',
      price: offer.price,
      priceCurrency: offer.priceCurrency,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'AI Native Studio',
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Article Schema for blog posts
interface ArticleData {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}

export function ArticleSchema({ article }: { article: ArticleData }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Native Studio',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/code_simple_logo.jpg`,
      },
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    image: article.image || `${siteUrl}/card.png`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': siteUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Combined default schemas for all pages
export default function StructuredData() {
  return (
    <>
      <OrganizationSchema />
      <SoftwareApplicationSchema />
      <WebSiteSchema />
    </>
  );
}
