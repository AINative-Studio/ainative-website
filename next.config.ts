import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix workspace root detection - use this project's directory
  turbopack: {
    root: process.cwd(),
  },
  // Silence RSC client-side errors in dev (shows full errors in terminal)
  reactStrictMode: true,
};

export default nextConfig;
