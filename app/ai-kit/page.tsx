import type { Metadata } from "next";
import Link from "next/link";
import {
  AIKitHero,
  FeaturesGrid,
  PackageGrid,
  QuickStart,
  IntegrationsGrid,
  CTASection,
} from "@/components/ai-kit/AIKitClient";

export const metadata: Metadata = {
  title: "AI Kit - 14 Production-Ready NPM Packages",
  description:
    "Build AI applications faster with AI Kit - 14 production-ready NPM packages for React, Vue, Svelte & more. Type-safe, framework-agnostic, with built-in observability & vector storage.",
  keywords: [
    "ai kit",
    "npm packages",
    "react ai",
    "vue ai",
    "svelte ai",
    "typescript ai",
    "ai development",
    "llm framework",
    "vector database",
    "ai observability",
    "ai safety",
    "ai authentication",
    "ai testing",
  ],
  authors: [{ name: "AINative Studio" }],
  openGraph: {
    title: "AI Kit - 14 Production-Ready NPM Packages | AINative Studio",
    description:
      "Build AI applications faster with AI Kit - 14 production-ready NPM packages for React, Vue, Svelte & more. Type-safe, framework-agnostic, with built-in observability & vector storage.",
    type: "website",
    url: "https://ainative.studio/ai-kit",
    siteName: "AINative Studio",
    locale: "en_US",
    images: [
      {
        url: "https://ainative.studio/og-ai-kit.jpg",
        width: 1200,
        height: 630,
        alt: "AI Kit - Production-Ready NPM Packages",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Kit - 14 Production-Ready NPM Packages | AINative Studio",
    description:
      "Build AI applications faster with AI Kit - 14 production-ready NPM packages for React, Vue, Svelte & more.",
    images: ["https://ainative.studio/og-ai-kit.jpg"],
    site: "@ainativestudio",
    creator: "@ainativestudio",
  },
  alternates: {
    canonical: "https://ainative.studio/ai-kit",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD Structured Data
const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "AI Kit",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Cross-platform",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1200",
  },
  description:
    "14 production-ready NPM packages for building AI applications with React, Vue, Svelte and other frameworks",
  softwareVersion: "1.0.0",
  publisher: {
    "@type": "Organization",
    name: "AINative Studio",
    url: "https://ainative.studio",
  },
  downloadUrl: "https://www.npmjs.com/~ainative-studio",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://ainative.studio",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "AI Kit",
      item: "https://ainative.studio/ai-kit",
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is AI Kit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AI Kit is a collection of 14 production-ready NPM packages for building AI applications with React, Vue, Svelte and other frameworks. It provides everything from authentication to deployment, including core utilities, framework integrations, testing tools, and security features.",
      },
    },
    {
      "@type": "Question",
      name: "Which frameworks does AI Kit support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AI Kit supports React, Vue, Svelte, Next.js, and vanilla JavaScript. It's framework-agnostic and works with any modern JavaScript framework. Each framework has dedicated packages with framework-specific hooks, composables, and components.",
      },
    },
    {
      "@type": "Question",
      name: "Is AI Kit free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, AI Kit is completely free and open source. All 14 packages are available on NPM at no cost under the ISC license.",
      },
    },
    {
      "@type": "Question",
      name: "How do I install AI Kit packages?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Install individual packages using npm or yarn. For example: 'npm install @ainative-studio/aikit-core' for the core package, or 'npm install @ainative/ai-kit' for React support. Each package can be installed separately based on your needs.",
      },
    },
    {
      "@type": "Question",
      name: "Does AI Kit support TypeScript?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, AI Kit has full TypeScript support with comprehensive type definitions. All packages are written in TypeScript and include complete type safety for better development experience.",
      },
    },
  ],
};

const howToReactSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Build AI Chat with React using AI Kit",
  description:
    "Step-by-step guide to building AI-powered chat interfaces with React and AI Kit",
  totalTime: "PT5M",
  estimatedCost: {
    "@type": "MonetaryAmount",
    currency: "USD",
    value: "0",
  },
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Install AI Kit for React",
      text: "Install the AI Kit React package using npm",
      itemListElement: [
        {
          "@type": "HowToDirection",
          text: "npm install @ainative/ai-kit",
        },
      ],
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Import the AI hooks",
      text: "Import the useAIChat hook from AI Kit in your React component",
      itemListElement: [
        {
          "@type": "HowToDirection",
          text: "import { useAIChat, useAICompletion } from '@ainative/ai-kit';",
        },
      ],
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Configure the AI chat",
      text: "Set up the useAIChat hook with your preferred AI model and system prompt",
      itemListElement: [
        {
          "@type": "HowToDirection",
          text: "const { messages, sendMessage, isLoading } = useAIChat({ model: 'gpt-4', systemPrompt: 'You are a helpful assistant' });",
        },
      ],
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Build the chat interface",
      text: "Create your chat UI using the messages and sendMessage function from the hook",
      itemListElement: [
        {
          "@type": "HowToDirection",
          text: "Render messages with messages.map() and create an input with onClick handler calling sendMessage()",
        },
      ],
    },
  ],
};

const howToVueSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Build AI Chat with Vue using AI Kit",
  description:
    "Step-by-step guide to integrating AI capabilities into Vue applications with AI Kit",
  totalTime: "PT5M",
  estimatedCost: {
    "@type": "MonetaryAmount",
    currency: "USD",
    value: "0",
  },
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Install AI Kit for Vue",
      text: "Install the AI Kit Vue package using npm",
      itemListElement: [
        {
          "@type": "HowToDirection",
          text: "npm install @ainative/ai-kit-vue",
        },
      ],
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Import the composable",
      text: "Import the useAIChat composable in your Vue component setup",
      itemListElement: [
        {
          "@type": "HowToDirection",
          text: "import { useAIChat } from '@ainative/ai-kit-vue';",
        },
      ],
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Use the composable",
      text: "Set up the composable with your AI configuration",
      itemListElement: [
        {
          "@type": "HowToDirection",
          text: "const { messages, sendMessage, isLoading } = useAIChat({ model: 'gpt-4', systemPrompt: 'You are a helpful assistant' });",
        },
      ],
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Build the template",
      text: "Use v-for to display messages and @click to send new messages",
      itemListElement: [
        {
          "@type": "HowToDirection",
          text: "Create a template with v-for to loop through messages and a button with @click handler",
        },
      ],
    },
  ],
};

export default function AIKitPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToReactSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToVueSchema),
        }}
      />

      <main className="min-h-screen bg-[#0D1117] text-white overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#1A1B2E]" />
          <div className="absolute inset-0 opacity-30">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 30%, rgba(75, 111, 237, 0.3) 0%, transparent 30%), radial-gradient(circle at 80% 70%, rgba(138, 99, 244, 0.3) 0%, transparent 30%)",
              }}
            />
          </div>
          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.3) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="container mx-auto max-w-7xl px-4 pt-8"
        >
          <ol
            className="flex gap-2 text-sm text-gray-400"
            itemScope
            itemType="https://schema.org/BreadcrumbList"
          >
            <li
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <Link
                href="/"
                itemProp="item"
                className="hover:text-white transition-colors"
              >
                <span itemProp="name">Home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <li aria-hidden="true">/</li>
            <li
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
              aria-current="page"
            >
              <span itemProp="name" className="text-white font-medium">
                AI Kit
              </span>
              <meta itemProp="position" content="2" />
            </li>
          </ol>
        </nav>

        {/* Client Components */}
        <AIKitHero />
        <FeaturesGrid />
        <PackageGrid />
        <QuickStart />
        <IntegrationsGrid />
        <CTASection />
      </main>
    </>
  );
}
