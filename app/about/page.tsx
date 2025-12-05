import type { Metadata } from "next";
import Link from "next/link";
import {
  Rocket,
  Shield,
  Users,
  Code2,
  Lightbulb,
  Github,
  FileText,
  Cloud,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us - Building the Future of AI Infrastructure",
  description:
    "Learn about AINative Studio's mission to democratize AI development. We create powerful, accessible tools that empower developers worldwide to build intelligent applications.",
  keywords: [
    "AINative Studio",
    "about us",
    "AI infrastructure",
    "AI development",
    "developer tools",
    "AI platform",
    "machine learning",
  ],
  authors: [{ name: "AINative Studio" }],
  openGraph: {
    title: "About AINative Studio - Building the Future of AI Infrastructure",
    description:
      "Learn about AINative Studio's mission to democratize AI development with powerful, accessible tools for developers worldwide.",
    type: "website",
    url: "https://ainative.studio/about",
    siteName: "AINative Studio",
    locale: "en_US",
    images: [
      {
        url: "https://ainative.studio/og-about.jpg",
        width: 1200,
        height: 630,
        alt: "About AINative Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About AINative Studio",
    description:
      "Building the future of AI infrastructure with powerful developer tools.",
    images: ["https://ainative.studio/og-about.jpg"],
    site: "@ainativestudio",
  },
  alternates: {
    canonical: "https://ainative.studio/about",
  },
};

const values = [
  {
    icon: Rocket,
    title: "Innovation",
    description: "Pushing boundaries of what's possible with AI infrastructure",
  },
  {
    icon: Shield,
    title: "Security",
    description: "Enterprise-grade security for your AI workloads",
  },
  {
    icon: Users,
    title: "Community",
    description: "Building with and for the developer community",
  },
  {
    icon: Code2,
    title: "Simplicity",
    description: "Making complex AI simple and accessible",
  },
];

const techStack = [
  {
    icon: Code2,
    title: "Languages & SDKs",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    items: [
      "Python 3.11+ with async/await support",
      "TypeScript 5.x with full type safety",
      "Go 1.21+ with native concurrency",
      "JavaScript (ES6+) for browsers",
    ],
  },
  {
    icon: Cpu,
    title: "Frameworks",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    items: [
      "React 18 with TypeScript",
      "FastAPI for high-performance APIs",
      "Next.js for SSR/SSG",
      "Tailwind CSS for modern UI",
    ],
  },
  {
    icon: Cloud,
    title: "Infrastructure",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    items: [
      "Railway for seamless deployments",
      "Vercel for frontend hosting",
      "PostgreSQL 15 with ZeroDB",
      "Redis for caching & real-time",
    ],
  },
  {
    icon: Lightbulb,
    title: "AI/ML Stack",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    items: [
      "OpenAI GPT-4, GPT-3.5 Turbo",
      "Claude 3 (Opus, Sonnet, Haiku)",
      "Anthropic & Cohere models",
      "LangChain & Agent Swarm",
    ],
  },
];

// JSON-LD Structured Data
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AINative Studio",
  url: "https://ainative.studio",
  logo: "https://ainative.studio/logo.png",
  description:
    "Building the future of AI infrastructure with powerful developer tools",
  foundingDate: "2023",
  sameAs: [
    "https://github.com/AINative-Studio",
    "https://twitter.com/ainativestudio",
    "https://discord.gg/paipalooza",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Support",
    email: "support@ainative.studio",
  },
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
      name: "About",
      item: "https://ainative.studio/about",
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <div className="min-h-screen bg-[#0A0F1A] text-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#4B6FED]/10 to-transparent -z-10" />
          <div className="container mx-auto px-4 py-28 max-w-6xl">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#4B6FED] to-[#FF8A3D]">
                Building the Future of AI Infrastructure
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                At AINative, we&apos;re on a mission to democratize AI
                development by creating powerful, accessible tools that empower
                developers worldwide.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/contact">
                  <Button className="bg-gradient-to-r from-[#4B6FED] to-[#FF8A3D] text-white hover:opacity-90">
                    Get in Touch
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button
                    variant="outline"
                    className="border-gray-700 hover:bg-gray-800/50"
                  >
                    View Documentation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-[#4B6FED] to-[#FF8A3D] mx-auto mb-8" />
            <p className="text-xl text-gray-300">
              We&apos;re building the most intuitive and powerful AI
              infrastructure to help developers create the next generation of
              intelligent applications without the complexity of managing
              underlying systems.
            </p>
          </div>

          {/* Values */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="bg-gray-900/50 p-6 rounded-xl hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-gray-800 rounded-lg">
                      <Icon className="w-8 h-8 text-[#4B6FED]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {value.title}
                      </h3>
                      <p className="text-gray-400">{value.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Our Story */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-6 text-gray-300">
              <p>
                Founded in 2023, AINative was born out of the frustration with
                the complexity of deploying and managing AI models in
                production. Our team of AI researchers, engineers, and product
                builders came together with a shared vision: to make AI
                development as simple as traditional software development.
              </p>
              <p>
                Since our launch, we&apos;ve achieved significant milestones:
                released three production-ready SDKs (Python, TypeScript, and
                Go), built a comprehensive API platform with 1,330+ endpoints,
                and introduced innovative features like ZeroDB for seamless
                database integration and Agent Swarm for multi-agent
                orchestration.
              </p>
              <p>
                Today, we serve thousands of developers and companies worldwide,
                from ambitious startups to Fortune 500 enterprises, all
                leveraging our platform to build and deploy AI applications at
                scale.
              </p>
            </div>
          </div>

          {/* Technology Stack Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Our Technology Stack
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {techStack.map((tech) => {
                const Icon = tech.icon;
                return (
                  <div
                    key={tech.title}
                    className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 hover:border-[#4B6FED]/30 transition-colors"
                  >
                    <div className="flex items-center mb-4">
                      <div className={`p-2 ${tech.bgColor} rounded-lg mr-4`}>
                        <Icon className={`w-6 h-6 ${tech.color}`} />
                      </div>
                      <h3 className="text-xl font-semibold">{tech.title}</h3>
                    </div>
                    <div className="space-y-2 text-gray-400">
                      {tech.items.map((item) => (
                        <p key={item} className="flex items-center gap-2">
                          <span className="text-green-400">•</span>
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Join Community Section */}
          <div className="mb-20 bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-8 rounded-2xl border border-gray-800">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Join Our Growing Community
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Connect with thousands of developers, researchers, and AI
                enthusiasts in our community.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://github.com/AINative-Studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Github className="w-5 h-5" />
                  GitHub
                </a>
                <a
                  href="https://discord.gg/paipalooza"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  Discord
                </a>
                <a
                  href="https://twitter.com/ainativestudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  Twitter
                </a>
                <Link
                  href="/docs"
                  className="px-6 py-3 bg-gradient-to-r from-[#4B6FED] to-[#FF8A3D] hover:opacity-90 text-white rounded-lg font-medium flex items-center gap-2 transition-opacity"
                >
                  <FileText className="w-5 h-5" />
                  Documentation
                </Link>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-[#4B6FED]/10 to-[#FF8A3D]/10 p-8 rounded-2xl text-center">
            <Lightbulb className="w-12 h-12 text-[#4B6FED] mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of developers who are already building the future
              with AINative.
            </p>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-[#4B6FED] to-[#FF8A3D] text-white hover:opacity-90">
                Start Building for Free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
