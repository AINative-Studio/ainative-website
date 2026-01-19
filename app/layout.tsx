import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import { QueryProvider } from "@/components/providers/QueryProvider";
import SessionProvider from "@/components/providers/session-provider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GoogleTagManager, { GoogleTagManagerNoscript } from "@/components/analytics/GoogleTagManager";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import MetaPixel from "@/components/analytics/MetaPixel";
import ChatwootWidget from "@/components/support/ChatwootWidget";
import SpeedInsights from "@/components/analytics/SpeedInsights";
import StructuredData from "@/components/seo/StructuredData";
import "./globals.css";

// Poppins - Primary font matching Vite design system
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ainative.studio';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'AI Native Studio | Quantum-Enhanced Development Environment for Modern Developers',
    template: '%s | AI Native Studio',
  },
  description: 'Experience the next generation of software development with AI Native Studio. Our quantum-boosted IDE combines multi-agent AI, quantum neural networks, and intuitive design to revolutionize your coding workflow.',
  keywords: [
    // Competitive Keywords (CRITICAL)
    'Cursor alternative',
    'Windsurf competitor',
    'Copilot alternative',

    // Trending/Aesthetic
    'vibe coding',
    'flow state programming',
    'aesthetic IDE',
    'zen coding',
    'lo-fi coding environment',

    // DX/Productivity
    'DX-first development',
    '10x developer tools',
    'multiplayer coding',
    'ship faster',
    'instant dev environment',

    // Technology Specific - LLM/AI
    'LLM-powered IDE',
    'GPT-4 coding assistant',
    'Claude coding',

    // Technology Specific - Frameworks
    'React 19 IDE',
    'TypeScript IDE',
    'Next.js development',
    'open source IDE',

    // Developer Wellness
    'indie hacker tools',
    'developer wellness',
    'mindful coding',
    'distraction-free IDE',

    // Primary competitive keywords
    'AI code editor',
    'AI coding assistant',
    'agentic IDE',
    'AI-powered IDE',
    'AI-powered development',
    'code completion',
    'AI autocomplete',
    'codebase understanding',
    'AI pair programming',
    'prompt to code',
    'prompt-driven development',
    'full-stack AI',
    'developer productivity',
    'code generation',
    'multi-agent AI',
    'AI code completion',

    // Quantum differentiators
    'quantum-enhanced IDE',
    'quantum neural networks',
    'quantum software development',
    'quantum computing IDE',
    'quantum programming',
    'quantum IDE',

    // Product-specific
    'ZeroDB vector database',
    'vector database',
    'AI Kit NPM packages',
    'AI Kit packages',
    'embeddings API',
    'embeddings',
    'semantic search',
    'vector database for developers',
    'AI agent swarm',
    'multi-agent development',

    // Action keywords
    'build apps with AI',
    'AI website builder',
    'AI app builder',
    'no-code AI development',

    // Brand
    'AI Native Studio',
  ],
  authors: [{ name: 'AI Native Studio', url: siteUrl }],
  creator: 'AI Native Studio',
  publisher: 'AI Native Studio',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'AI Native Studio',
    title: 'AI Native Studio | Quantum-Enhanced Development Environment',
    description: 'Experience the future of coding with AI Native Studio. Quantum-boosted IDE with multi-agent AI and neural networks for developers.',
    images: [
      {
        url: '/card.png',
        width: 1200,
        height: 630,
        alt: 'AI Native Studio - Next-Gen Quantum Development Environment',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AINativeStudio',
    creator: '@AINativeStudio',
    title: 'AI Native Studio | Quantum-Enhanced Development Environment',
    description: 'Experience the future of coding with AI Native Studio. Quantum-boosted IDE with multi-agent AI and neural networks for developers.',
    images: ['/card.png'],
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: '/code_simple_logo.jpg',
    apple: '/code_simple_logo.jpg',
  },
  manifest: '/manifest.json',
  other: {
    'theme-color': '#4B6FED',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-title': 'AI Native Studio',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-capable': 'yes',
    'application-name': 'AI Native Studio',
    'msapplication-TileColor': '#4B6FED',
    // Extended meta tags from Vite version
    'language': 'English',
    'revisit-after': '7 days',
    'rating': 'general',
    'distribution': 'global',
    'copyright': '© 2025 AI Native Studio. All rights reserved.',
    'generator': 'AI Native Studio',
    'abstract': 'Complete AI development platform with quantum computing support, vector databases, AI agents, and semantic search capabilities. Build full-stack applications with AI-powered code generation, multi-agent development workflows, and quantum-enhanced neural networks.',
    'article:publisher': 'AI Native Studio',
    'article:author': 'AI Native Studio',
    // Comprehensive keyword string for legacy meta tags
    'keywords': 'vibe coding, AI Native Studio, flow state programming, aesthetic IDE, Cursor alternative, Windsurf competitor, Copilot alternative, quantum IDE, AI pair programming, zen coding, lo-fi coding environment, DX-first development, 10x developer tools, multiplayer coding, AI code completion, LLM-powered IDE, GPT-4 coding assistant, Claude coding, prompt-driven development, ship faster, instant dev environment, quantum computing IDE, quantum neural networks, Next.js development, React 19 IDE, TypeScript IDE, open source IDE, indie hacker tools, developer wellness, mindful coding, distraction-free IDE, vector database, AI Kit packages, semantic search, embeddings, ZeroDB',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Google Analytics 4 (GA4) - Primary Analytics */}
        <GoogleAnalytics />
        {/* Google Tag Manager - For additional tag management */}
        <GoogleTagManager />
        {/* Meta Pixel - Facebook/Instagram Conversion Tracking & Retargeting */}
        <MetaPixel />
        {/* JSON-LD Structured Data for SEO */}
        <StructuredData />
      </head>
      <body
        className={`${poppins.variable} ${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-[#0D1117] text-white`}
      >
        {/* GTM noscript fallback */}
        <GoogleTagManagerNoscript />

        <SessionProvider>
          <QueryProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </QueryProvider>
        </SessionProvider>

        {/* Analytics & Support Widgets */}
        <ChatwootWidget />
        <SpeedInsights />
      </body>
    </html>
  );
}
