import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix workspace root detection - use this project's directory
  turbopack: {
    root: process.cwd(),
  },
  // Silence RSC client-side errors in dev (shows full errors in terminal)
  reactStrictMode: true,

  // Production optimizations
  poweredByHeader: false,

  // Image optimization for external domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.ainative.studio',
      },
      {
        protocol: 'https',
        hostname: 'ainative-community-production.up.railway.app',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.lu.ma',
      },
    ],
  },

  // Output standalone for Railway deployment
  output: 'standalone',
};

export default nextConfig;
