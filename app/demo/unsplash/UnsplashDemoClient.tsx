/**
 * Unsplash Integration Demo Page - Client Component
 * Showcases all Unsplash features
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UnsplashImage } from '@/components/unsplash/UnsplashImage';
import { unsplashService } from '@/services/unsplashService';
import type { UnsplashServiceStats } from '@/services/types/unsplash.types';
import {
  Image as ImageIcon,
  BarChart3,
  RefreshCw,
  Zap,
  Shield,
  Clock,
  Info,
} from 'lucide-react';

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-white ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-gray-400 ${className}`}>{children}</p>
);

export default function UnsplashDemoClient() {
  const [stats, setStats] = useState<UnsplashServiceStats | null>(null);
  const [imageId, setImageId] = useState(1);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [quality, setQuality] = useState(80);
  const [showAttribution, setShowAttribution] = useState(true);

  const refreshStats = () => {
    const currentStats = unsplashService.getStats();
    setStats(currentStats);
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePreload = async () => {
    const requests = Array.from({ length: 9 }, (_, i) => ({
      id: i,
      width: 800,
      height: 600,
    }));

    await unsplashService.preloadImages(requests);
    refreshStats();
  };

  const handleReset = () => {
    unsplashService.reset();
    refreshStats();
  };

  const cacheHitRate = stats
    ? ((stats.cacheHits / (stats.cacheHits + stats.cacheMisses)) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-[#0D1117] py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Unsplash Integration Demo
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explore the features of our comprehensive Unsplash service including
            caching, rate limiting, error handling, and attribution.
          </p>
        </div>

        {/* Statistics Dashboard */}
        {stats && (
          <Card className="mb-8 bg-[#161B22] border-[#2D333B]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-[#4B6FED]" />
                  <CardTitle>Service Statistics</CardTitle>
                </div>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  className="text-gray-400"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-[#1C2128] rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {stats.totalRequests}
                  </div>
                  <div className="text-sm text-gray-400">Total Requests</div>
                </div>
                <div className="text-center p-4 bg-[#1C2128] rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {stats.cacheHits}
                  </div>
                  <div className="text-sm text-gray-400">Cache Hits</div>
                </div>
                <div className="text-center p-4 bg-[#1C2128] rounded-lg">
                  <div className="text-2xl font-bold text-[#4B6FED]">
                    {cacheHitRate}%
                  </div>
                  <div className="text-sm text-gray-400">Hit Rate</div>
                </div>
                <div className="text-center p-4 bg-[#1C2128] rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {stats.cacheSize}
                  </div>
                  <div className="text-sm text-gray-400">Cache Size</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-[#1C2128] rounded-lg">
                  <div className="text-xl font-bold text-orange-400">
                    {stats.cacheMisses}
                  </div>
                  <div className="text-sm text-gray-400">Cache Misses</div>
                </div>
                <div className="text-center p-4 bg-[#1C2128] rounded-lg">
                  <div className="text-xl font-bold text-red-400">
                    {stats.rateLimited}
                  </div>
                  <div className="text-sm text-gray-400">Rate Limited</div>
                </div>
                <div className="text-center p-4 bg-[#1C2128] rounded-lg">
                  <div className="text-xl font-bold text-yellow-400">
                    {stats.errors}
                  </div>
                  <div className="text-sm text-gray-400">Errors</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#161B22] border-[#2D333B]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-400" />
                <CardTitle className="text-base">Smart Caching</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                In-memory cache with LRU eviction and 24-hour TTL. Reduces
                redundant requests and improves performance.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-[#161B22] border-[#2D333B]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-400" />
                <CardTitle className="text-base">Rate Limiting</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                100 requests per minute limit with automatic queuing prevents
                CDN throttling.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-[#161B22] border-[#2D333B]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-base">Error Handling</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Graceful fallbacks to gradient placeholders on errors with
                comprehensive error tracking.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Demo */}
        <Card className="mb-8 bg-[#161B22] border-[#2D333B]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <ImageIcon className="w-6 h-6 text-[#4B6FED]" />
              <CardTitle>Interactive Image Generator</CardTitle>
            </div>
            <CardDescription>
              Customize image parameters and see the service in action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Controls */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Image ID (0-100)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={imageId}
                    onChange={(e) => setImageId(parseInt(e.target.value) || 0)}
                    className="bg-[#1C2128] border-[#2D333B] text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Width (px)
                  </label>
                  <Input
                    type="number"
                    min={100}
                    max={2000}
                    value={width}
                    onChange={(e) => setWidth(parseInt(e.target.value) || 800)}
                    className="bg-[#1C2128] border-[#2D333B] text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Height (px)
                  </label>
                  <Input
                    type="number"
                    min={100}
                    max={2000}
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value) || 600)}
                    className="bg-[#1C2128] border-[#2D333B] text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Quality (1-100)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value) || 80)}
                    className="bg-[#1C2128] border-[#2D333B] text-white"
                  />
                </div>
              </div>

              {/* Attribution Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="attribution"
                  checked={showAttribution}
                  onChange={(e) => setShowAttribution(e.target.checked)}
                  className="w-4 h-4 bg-[#1C2128] border-[#2D333B] rounded"
                />
                <label htmlFor="attribution" className="text-sm text-gray-400">
                  Show Attribution
                </label>
              </div>

              {/* Generated Image */}
              <div className="bg-[#1C2128] p-4 rounded-lg">
                <UnsplashImage
                  id={imageId}
                  width={width}
                  height={height}
                  quality={quality}
                  alt={`Demo image ${imageId}`}
                  showAttribution={showAttribution}
                  attributionVariant="overlay"
                  className="w-full h-auto rounded-lg"
                  loading="eager"
                  onLoad={refreshStats}
                />
              </div>

              {/* Info */}
              <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <strong>Note:</strong> Images are selected deterministically based
                  on the ID. Same ID always returns the same photo for consistency.
                  Try different IDs to see various tech/business images.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo Gallery */}
        <Card className="mb-8 bg-[#161B22] border-[#2D333B]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ImageIcon className="w-6 h-6 text-[#4B6FED]" />
                <CardTitle>Photo Gallery (9 Images)</CardTitle>
              </div>
              <Button onClick={handlePreload} variant="outline" size="sm">
                <Zap className="w-4 h-4 mr-2" />
                Preload All
              </Button>
            </div>
            <CardDescription>
              All available images from the curated collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="space-y-2">
                  <UnsplashImage
                    id={i}
                    width={400}
                    height={300}
                    alt={`Gallery image ${i}`}
                    showAttribution={true}
                    attributionVariant="footer"
                    className="w-full h-auto rounded-lg"
                    wrapperClassName="bg-[#1C2128] p-2 rounded-lg"
                    loading="lazy"
                    onLoad={refreshStats}
                  />
                  <Badge variant="secondary" className="w-full justify-center">
                    ID: {i}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Documentation Links */}
        <Card className="bg-[#161B22] border-[#2D333B]">
          <CardHeader>
            <CardTitle>Documentation & Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <a
                href="/docs/integrations/unsplash-integration.md"
                className="block p-3 bg-[#1C2128] hover:bg-[#22272E] rounded-lg transition-colors"
              >
                <div className="font-semibold text-white">Full Integration Guide</div>
                <div className="text-sm text-gray-400">
                  Complete documentation on implementation and usage
                </div>
              </a>
              <a
                href="/docs/integrations/unsplash-quick-start.md"
                className="block p-3 bg-[#1C2128] hover:bg-[#22272E] rounded-lg transition-colors"
              >
                <div className="font-semibold text-white">Quick Start Guide</div>
                <div className="text-sm text-gray-400">
                  Get started with Unsplash integration in 5 minutes
                </div>
              </a>
              <a
                href="/docs/integrations/unsplash-audit-report.md"
                className="block p-3 bg-[#1C2128] hover:bg-[#22272E] rounded-lg transition-colors"
              >
                <div className="font-semibold text-white">Audit Report</div>
                <div className="text-sm text-gray-400">
                  Technical audit and enhancement recommendations
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
