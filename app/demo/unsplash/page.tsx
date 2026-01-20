/**
 * Unsplash Integration Demo Page
 * Server component with metadata
 */

import type { Metadata } from 'next';
import UnsplashDemoClient from './UnsplashDemoClient';

export const metadata: Metadata = {
  title: 'Unsplash Integration Demo',
  description: 'Demonstration of AINative Studio Unsplash integration features including caching, rate limiting, and attribution.',
  robots: 'noindex, nofollow', // Don't index demo pages
};

export default function UnsplashDemoPage() {
  return <UnsplashDemoClient />;
}
