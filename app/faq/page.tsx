import type { Metadata } from 'next';
import FAQClient from './FAQClient';
import { FAQSchema, BreadcrumbSchema } from '@/components/seo/StructuredData';

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions | AI Native Studio',
  description: 'Find answers to common questions about AI Native Studio, pricing, features, security, and technical support. Get the help you need to build AI-powered applications.',
  keywords: [
    'AINative FAQ',
    'AI Native Studio help',
    'AINative support',
    'AI development questions',
    'AINative pricing',
    'AI SDK help',
    'AINative security',
    'technical support',
    'AI Native Studio'
  ],
  openGraph: {
    title: 'AINative FAQ - Get Your Questions Answered',
    description: 'Find answers to common questions about AI Native Studio, pricing, features, security, and support.',
    type: 'website',
    url: 'https://www.ainative.studio/faq',
    images: [
      {
        url: 'https://www.ainative.studio/og-faq.png',
        width: 1200,
        height: 630,
        alt: 'AI Native Studio FAQ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AINative FAQ - Frequently Asked Questions',
    description: 'Find answers to common questions about AI Native Studio.',
    images: ['https://www.ainative.studio/og-faq.png'],
  },
  alternates: {
    canonical: 'https://www.ainative.studio/faq',
  },
};

// FAQ data for structured data
const faqItems = [
  // Getting Started
  {
    question: 'How do I get started with AI Native Studio?',
    answer: 'Getting started is easy! Simply sign up for a free account, download the AI Native Studio IDE or install our SDK packages, and follow our quick-start guide. We provide comprehensive documentation and tutorials to help you build your first AI-powered application in minutes.',
  },
  {
    question: 'What programming languages are supported?',
    answer: 'AI Native Studio supports Python, TypeScript/JavaScript, and Go out of the box. Our SDK packages are available on npm, PyPI, and Go modules. We also provide REST APIs that can be used from any programming language.',
  },
  {
    question: 'Do I need prior AI/ML experience?',
    answer: 'No prior AI/ML experience is required! AI Native Studio abstracts away the complexity of working with LLMs and AI models. Our intuitive APIs and pre-built components allow developers of all skill levels to build intelligent applications.',
  },
  // Pricing & Billing
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise customers. All payments are processed securely through Stripe.',
  },
  {
    question: 'Can I cancel my subscription?',
    answer: 'Yes, you can cancel your subscription at any time from your account settings. There are no long-term contracts or cancellation fees. Your access will continue until the end of your current billing period.',
  },
  {
    question: 'Is there a free tier available?',
    answer: 'Yes! We offer a generous free tier that includes access to our core SDK packages, community support, and limited API calls. This is perfect for personal projects, learning, and small-scale applications.',
  },
  // Security & Privacy
  {
    question: 'How secure is my data?',
    answer: 'We take security seriously. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We are SOC 2 Type II certified and perform regular third-party security audits. Your code and data never leave your control unless you explicitly choose to use our cloud services.',
  },
  {
    question: 'Where is my data stored?',
    answer: 'By default, data is stored in secure AWS data centers in the US. Enterprise customers can choose from multiple regions including EU, Asia-Pacific, and Canada. We also offer on-premises deployment for organizations with strict data residency requirements.',
  },
  {
    question: 'Do you use my data to train AI models?',
    answer: 'No, we never use your code, prompts, or data to train our models or any third-party models. Your data remains completely private and is only used to provide you with the service you requested.',
  },
  // Technical Support
  {
    question: 'What support options are available?',
    answer: 'We offer multiple support channels: community forums and Discord for free tier users, email support for Pro users, and dedicated support with SLAs for Enterprise customers. Our documentation and tutorials cover most common use cases.',
  },
  {
    question: 'How do I report a bug or request a feature?',
    answer: 'You can report bugs and request features through our GitHub repositories, community Discord, or by contacting support directly. We actively monitor all channels and prioritize based on community feedback.',
  },
  // Products & Features
  {
    question: 'What is the AI Kit and what does it include?',
    answer: 'AI Kit is our collection of 14 production-ready npm packages for AI development. It includes tools for prompt engineering, context management, embeddings, RAG pipelines, agent frameworks, and more. All packages are designed to work seamlessly together.',
  },
  {
    question: 'What is ZeroDB?',
    answer: 'ZeroDB is our AI-native vector database designed for semantic search and AI applications. It provides lightning-fast similarity search, automatic embedding generation, and seamless integration with popular AI frameworks.',
  },
  {
    question: 'Can I use AI Native Studio with my existing LLM provider?',
    answer: 'Yes! AI Native Studio supports all major LLM providers including OpenAI, Anthropic Claude, Google Gemini, AWS Bedrock, Azure OpenAI, and local models through Ollama. You can even use multiple providers in the same application.',
  },
];

export default function FAQPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ainative.studio';

  // Breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', url: siteUrl },
    { name: 'FAQ', url: `${siteUrl}/faq` }
  ];

  return (
    <>
      <FAQSchema items={faqItems} />
      <BreadcrumbSchema items={breadcrumbItems} />
      <FAQClient />
    </>
  );
}
