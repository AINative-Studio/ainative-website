import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/components/providers/QueryProvider";
import SessionProvider from "@/components/providers/session-provider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GoogleTagManager, { GoogleTagManagerNoscript } from "@/components/analytics/GoogleTagManager";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import ChatwootWidget from "@/components/support/ChatwootWidget";
import SpeedInsights from "@/components/analytics/SpeedInsights";
import StructuredData from "@/components/seo/StructuredData";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Optimize font loading - show fallback immediately, swap when loaded
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Optimize font loading - show fallback immediately, swap when loaded
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
    'AI-powered IDE',
    'quantum software development',
    'AI coding assistant',
    'quantum IDE',
    'AI development tools',
    'quantum programming',
    'AI code generation',
    'developer productivity',
    'AI pair programming',
    'quantum computing',
    'modern development tools',
    'AI coding platform',
    'quantum development environment',
    'AI-assisted coding',
    'developer workflow optimization',
    'ZeroDB',
    'AI Kit',
    'vector database',
    'embeddings API',
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
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics 4 (GA4) - Primary Analytics */}
        <GoogleAnalytics />
        {/* Google Tag Manager - For additional tag management */}
        <GoogleTagManager />
        {/* JSON-LD Structured Data for SEO */}
        <StructuredData />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
