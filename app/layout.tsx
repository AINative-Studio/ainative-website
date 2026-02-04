import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import SessionProvider from "@/components/providers/session-provider";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import GoogleTagManager, { GoogleTagManagerNoscript } from "@/components/analytics/GoogleTagManager";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import MetaPixel from "@/components/analytics/MetaPixel";
import ChatwootWidget from "@/components/support/ChatwootWidget";
import SpeedInsights from "@/components/analytics/SpeedInsights";
import WebVitalsMonitor from "@/components/analytics/WebVitalsMonitor";
import StructuredData from "@/components/seo/StructuredData";
import "./globals.css";
import "./widgets.css";

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
  description: 'AINative Studio - AI Native Development Platform. Build AI applications 10x faster with our IDE, Vector DB, and production-ready AI Kit packages. Complete toolkit for AI-native development.',
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
    title: 'AI Native Studio | AI Development Platform with IDE, Vector DB, and AI Kit',
    description: 'Build AI applications 10x faster with our quantum-enhanced IDE, ZeroDB vector database, and 14 production-ready AI Kit packages. Complete AI-native development platform.',
    images: [
      {
        url: '/card.png',
        width: 1200,
        height: 630,
        alt: 'AI Native Studio - AI Development Platform with IDE, Vector DB, and AI Kit packages',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AINativeStudio',
    creator: '@AINativeStudio',
    title: 'AI Native Studio | AI Development Platform with IDE, Vector DB & AI Kit',
    description: 'Build AI applications 10x faster. Quantum-enhanced IDE, ZeroDB vector database, and 14 production-ready AI Kit packages for modern developers.',
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
    'copyright': '© 2026 AI Native Studio. All rights reserved.',
    'summary': 'Complete AI-native development platform with quantum-enhanced IDE, vector database (ZeroDB), and 14 production-ready AI Kit NPM packages. Build AI applications 10x faster with semantic search, embeddings, and neural network acceleration.',
    'generator': 'AI Native Studio',
    'abstract': 'Complete AI development platform with quantum-enhanced IDE, vector database (ZeroDB), and 14 production-ready AI Kit NPM packages. Build AI applications 10x faster with semantic search, embeddings, and neural network acceleration.',
    'article:publisher': 'AI Native Studio',
    'article:author': 'AI Native Studio',
    // Comprehensive keyword string for legacy meta tags
    'keywords': 'vibe coding, AI Native Studio, flow state programming, aesthetic IDE, Cursor alternative, Windsurf competitor, Copilot alternative, quantum IDE, AI pair programming, zen coding, lo-fi coding environment, DX-first development, 10x developer tools, multiplayer coding, AI code completion, LLM-powered IDE, GPT-4 coding assistant, Claude coding, prompt-driven development, ship faster, instant dev environment, quantum computing IDE, quantum neural networks, Next.js development, React 19 IDE, TypeScript IDE, open source IDE, indie hacker tools, developer wellness, mindful coding, distraction-free IDE, vector database, AI Kit packages, semantic search, embeddings, ZeroDB',
    // Additional SEO meta tags from Vite version
    'category': 'Developer Tools',
    'coverage': 'Worldwide',
    'target': 'developers, AI engineers, software architects, tech leads',
    'audience': 'Developers',
    'classification': 'AI Development Platform, IDE, Vector Database, Developer Tools',
    'pagename': 'AI Native Studio - AI Development Platform',
    'topic': 'AI Development, Software Engineering, Developer Tools',
    // Geo tags
    'geo.region': 'US',
    'geo.placename': 'United States',
    'geo.position': '37.7749;-122.4194',
    'ICBM': '37.7749, -122.4194',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
        className={`${poppins.variable} ${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        {/* GTM noscript fallback */}
        <GoogleTagManagerNoscript />

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <QueryProvider>
              <ConditionalLayout>
                <main className="min-h-screen">{children}</main>
              </ConditionalLayout>
            </QueryProvider>
          </SessionProvider>

          {/* Analytics & Support Widgets */}
          <ChatwootWidget />
          <SpeedInsights />
          <WebVitalsMonitor />
        </ThemeProvider>
      </body>
    </html>
  );
}
