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

// Software Application Schema - Enhanced for competitive SEO
export function SoftwareApplicationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AI Native Studio',
    applicationCategory: 'DeveloperApplication',
    applicationSubCategory: 'IDE',
    operatingSystem: ['Windows 10+', 'macOS 11+', 'Linux', 'Web Browser'],
    description: 'The best AI code editor with multi-agent development, quantum acceleration, and intelligent code completion. A powerful alternative to Cursor and GitHub Copilot.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '2500',
      bestRating: '5',
      worstRating: '1',
    },
    offers: [
      {
        '@type': 'Offer',
        name: 'Free Plan',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        description: 'Free forever with 50 completions/month',
      },
      {
        '@type': 'Offer',
        name: 'Pro Plan',
        price: '10',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        description: 'Unlimited completions, hosted models, custom agents',
      },
      {
        '@type': 'Offer',
        name: 'Teams Plan',
        price: '60',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        description: 'Team collaboration, admin dashboard, SSO',
      },
    ],
    featureList: [
      'AI Code Completion',
      'Multi-Agent Development',
      'Codebase Understanding',
      'Natural Language Coding',
      'Quantum Acceleration',
      'ZeroDB Vector Database',
      'AI Kit NPM Packages',
      'Custom Agent Creation',
      'VS Code Compatibility',
    ],
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
        width: '200',
        height: '200',
      },
    },
    screenshot: [
      {
        '@type': 'ImageObject',
        url: `${siteUrl}/card.png`,
        caption: 'AI Native Studio - Main Interface',
      },
    ],
    softwareVersion: '1.0.0',
    releaseNotes: `${siteUrl}/changelog`,
    downloadUrl: `${siteUrl}/download`,
    installUrl: `${siteUrl}/download`,
    datePublished: '2025-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    keywords: 'AI code editor, AI IDE, cursor alternative, windsurf alternative, copilot alternative, agentic IDE',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Video Tutorial Schema for YouTube/video content
export function VideoSchema({
  title,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  embedUrl
}: {
  title: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string;
  embedUrl: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: title,
    description,
    thumbnailUrl,
    uploadDate,
    duration,
    embedUrl,
    publisher: {
      '@type': 'Organization',
      name: 'AI Native Studio',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/code_simple_logo.jpg`,
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

// HowTo Schema for tutorials and guides
interface HowToStep {
  name: string;
  text: string;
  image?: string;
}

export function HowToSchema({
  title,
  description,
  steps,
  totalTime,
}: {
  title: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description,
    totalTime: totalTime || 'PT10M',
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image,
    })),
    tool: {
      '@type': 'HowToTool',
      name: 'AI Native Studio',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Review Schema for testimonials
export function ReviewSchema({
  author,
  reviewBody,
  rating,
  datePublished,
}: {
  author: string;
  reviewBody: string;
  rating: number;
  datePublished: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'SoftwareApplication',
      name: 'AI Native Studio',
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: rating,
      bestRating: '5',
    },
    author: {
      '@type': 'Person',
      name: author,
    },
    reviewBody,
    datePublished,
    publisher: {
      '@type': 'Organization',
      name: 'AI Native Studio',
    },
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
