'use client';

import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle, ArrowRight, MessageCircle, Book } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  // Getting Started
  {
    category: 'Getting Started',
    question: 'How do I get started with AI Native Studio?',
    answer: 'Getting started is easy! Simply sign up for a free account, download the AI Native Studio IDE or install our SDK packages, and follow our quick-start guide. We provide comprehensive documentation and tutorials to help you build your first AI-powered application in minutes.',
  },
  {
    category: 'Getting Started',
    question: 'What programming languages are supported?',
    answer: 'AI Native Studio supports Python, TypeScript/JavaScript, and Go out of the box. Our SDK packages are available on npm, PyPI, and Go modules. We also provide REST APIs that can be used from any programming language.',
  },
  {
    category: 'Getting Started',
    question: 'Do I need prior AI/ML experience?',
    answer: 'No prior AI/ML experience is required! AI Native Studio abstracts away the complexity of working with LLMs and AI models. Our intuitive APIs and pre-built components allow developers of all skill levels to build intelligent applications.',
  },
  // Pricing & Billing
  {
    category: 'Pricing & Billing',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise customers. All payments are processed securely through Stripe.',
  },
  {
    category: 'Pricing & Billing',
    question: 'Can I cancel my subscription?',
    answer: 'Yes, you can cancel your subscription at any time from your account settings. There are no long-term contracts or cancellation fees. Your access will continue until the end of your current billing period.',
  },
  {
    category: 'Pricing & Billing',
    question: 'Is there a free tier available?',
    answer: 'Yes! We offer a generous free tier that includes access to our core SDK packages, community support, and limited API calls. This is perfect for personal projects, learning, and small-scale applications.',
  },
  // Security & Privacy
  {
    category: 'Security & Privacy',
    question: 'How secure is my data?',
    answer: 'We take security seriously. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We are SOC 2 Type II certified and perform regular third-party security audits. Your code and data never leave your control unless you explicitly choose to use our cloud services.',
  },
  {
    category: 'Security & Privacy',
    question: 'Where is my data stored?',
    answer: 'By default, data is stored in secure AWS data centers in the US. Enterprise customers can choose from multiple regions including EU, Asia-Pacific, and Canada. We also offer on-premises deployment for organizations with strict data residency requirements.',
  },
  {
    category: 'Security & Privacy',
    question: 'Do you use my data to train AI models?',
    answer: 'No, we never use your code, prompts, or data to train our models or any third-party models. Your data remains completely private and is only used to provide you with the service you requested.',
  },
  // Technical Support
  {
    category: 'Technical Support',
    question: 'What support options are available?',
    answer: 'We offer multiple support channels: community forums and Discord for free tier users, email support for Pro users, and dedicated support with SLAs for Enterprise customers. Our documentation and tutorials cover most common use cases.',
  },
  {
    category: 'Technical Support',
    question: 'How do I report a bug or request a feature?',
    answer: 'You can report bugs and request features through our GitHub repositories, community Discord, or by contacting support directly. We actively monitor all channels and prioritize based on community feedback.',
  },
  // Products & Features
  {
    category: 'Products & Features',
    question: 'What is the AI Kit and what does it include?',
    answer: 'AI Kit is our collection of 14 production-ready npm packages for AI development. It includes tools for prompt engineering, context management, embeddings, RAG pipelines, agent frameworks, and more. All packages are designed to work seamlessly together.',
  },
  {
    category: 'Products & Features',
    question: 'What is ZeroDB?',
    answer: 'ZeroDB is our AI-native vector database designed for semantic search and AI applications. It provides lightning-fast similarity search, automatic embedding generation, and seamless integration with popular AI frameworks.',
  },
  {
    category: 'Products & Features',
    question: 'Can I use AI Native Studio with my existing LLM provider?',
    answer: 'Yes! AI Native Studio supports all major LLM providers including OpenAI, Anthropic Claude, Google Gemini, AWS Bedrock, Azure OpenAI, and local models through Ollama. You can even use multiple providers in the same application.',
  },
];

const categories = [...new Set(faqs.map((faq) => faq.category))];

export default function FAQClient() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800/50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Find answers to common questions about AI Native Studio, our products, pricing, and technical support.
            </p>
          </div>

          {/* FAQ Sections by Category */}
          {categories.map((category) => (
            <div key={category} className="mb-10">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3" />
                {category}
              </h2>
              <div className="space-y-3">
                {faqs
                  .filter((faq) => faq.category === category)
                  .map((faq, index) => (
                    <Card
                      key={`${category}-${index}`}
                      className="overflow-hidden border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm"
                    >
                      <Accordion type="single" collapsible>
                        <AccordionItem value={`${category}-${index}`} className="border-none">
                          <AccordionTrigger className="px-6 py-4 text-left text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors font-medium">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </Card>
                  ))}
              </div>
            </div>
          ))}

          {/* Still Have Questions Section */}
          <div className="mt-16 text-center bg-gradient-to-r from-primary/5 to-purple-500/5 dark:from-primary/10 dark:to-purple-500/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
              Still have questions?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-lg mx-auto">
              Can&apos;t find what you&apos;re looking for? Our team is here to help you succeed with AI Native Studio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Link href="/support">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Support
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-gray-200 dark:border-gray-700"
              >
                <Link href="/docs">
                  <Book className="mr-2 h-4 w-4" />
                  View Documentation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
