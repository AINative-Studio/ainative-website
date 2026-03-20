
'use client';
import React from "react";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Building2,
  User,
  Sparkles,
  AlertCircle,
  Heart,
  Bookmark,
  Share2,
  Video,
} from 'lucide-react';
import { strapiClient } from '@/lib/strapi-client';
import { getUnsplashImageUrl } from '@/lib/unsplash';
import { cn } from '@/lib/utils';

interface ShowcaseData {
  id: number;
  documentId: string;
  title: string;
  company_name: string;
  developer_name: string | null;
  description: string;
  tech_stack: string[];
  demo_url: string | null;
  github_url: string | null;
  results: string | null;
  featured: boolean;
  slug: string | null;
  video_url?: string;
  video_thumbnail?: string;
  likes?: number;
}

interface ShowcaseDetailClientProps {
  slug: string;
}

export default function ShowcaseDetailClient({ slug }: ShowcaseDetailClientProps) {
  const [showcase, setShowcase] = useState<ShowcaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (slug) {
      fetchShowcase();
    }
  }, [slug]);

  const fetchShowcase = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await strapiClient.getShowcase(slug);
      if (data) {
        // Transform Strapi response to ShowcaseData
        const STRAPI_BASE_URL = 'https://ainative-community-production.up.railway.app';
        const getMediaUrl = (media: unknown): string | undefined => {
          if (!media) return undefined;
          const m = media as { url?: string; data?: { attributes?: { url?: string } } };
          if (m.url) return m.url.startsWith('http') ? m.url : `${STRAPI_BASE_URL}${m.url}`;
          if (m.data?.attributes?.url) {
            const relUrl = m.data.attributes.url;
            return relUrl.startsWith('http') ? relUrl : `${STRAPI_BASE_URL}${relUrl}`;
          }
          return undefined;
        };

        setShowcase({
          id: data.id,
          documentId: data.documentId,
          title: data.title,
          company_name: (data as unknown as { company_name?: string }).company_name || '',
          developer_name: (data as unknown as { developer_name?: string }).developer_name || null,
          description: data.description || '',
          tech_stack: (data as unknown as { tech_stack?: string[] }).tech_stack || [],
          demo_url: data.demo_url || null,
          github_url: data.github_url || null,
          results: (data as unknown as { results?: string }).results || null,
          featured: (data as unknown as { featured?: boolean }).featured || false,
          slug: data.slug,
          video_url: (data as unknown as { video_url?: string }).video_url,
          video_thumbnail: getMediaUrl((data as unknown as { video_thumbnail?: unknown }).video_thumbnail),
          likes: (data as unknown as { likes?: number }).likes,
        });
      } else {
        setError('Showcase not found');
      }
    } catch (err) {
      console.error('Failed to fetch showcase:', err);
      setError('Failed to load showcase. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117]">
        <main className="container mx-auto px-4 py-20 mt-16">
          <Link href="/showcases">
            <button className="inline-flex items-center px-3 py-2 mb-6 text-sm text-gray-400 hover:text-white hover:bg-[#161B22] rounded-lg transition-all">
              <ArrowLeft className="h-4 w-4 mr-2" />Back to Showcases
            </button>
          </Link>

          <Skeleton className="w-full h-96 rounded-xl mb-8 bg-[#21262D]" />

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full bg-[#21262D]" />
            </div>
            <div className="space-y-6">
              <div className="bg-[#161B22] border border-white/5 rounded-xl p-5">
                <Skeleton className="h-5 w-32 bg-[#21262D] mb-4" />
                <Skeleton className="h-16 w-full bg-[#21262D]" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !showcase) {
    return (
      <div className="min-h-screen bg-[#0D1117]">
        <main className="container mx-auto px-4 py-20 mt-16">
          <Link href="/showcases">
            <button className="inline-flex items-center px-3 py-2 mb-6 text-sm text-gray-400 hover:text-white hover:bg-[#161B22] rounded-lg transition-all">
              <ArrowLeft className="h-4 w-4 mr-2" />Back to Showcases
            </button>
          </Link>

          <div className="max-w-2xl mx-auto">
            <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-300 mb-2">
                {error === 'Showcase not found' ? 'Showcase Not Found' : 'Error Loading Showcase'}
              </h3>
              <p className="text-red-400/80 mb-6">
                {error || 'The showcase you are looking for could not be loaded.'}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 text-sm border border-white/5 text-gray-400 hover:text-white hover:bg-[#161B22] rounded-lg transition-all"
                >
                  Go Back
                </button>
                {error !== 'Showcase not found' && (
                  <button
                    onClick={fetchShowcase}
                    className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: showcase?.title,
        text: showcase?.description,
        url: window.location.href,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <main className="container mx-auto px-4 py-20 mt-16">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/showcases">
            <button className="inline-flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#161B22] rounded-lg transition-all">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Showcases
            </button>
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={handleLike}
              className={cn(
                'inline-flex items-center px-3 py-2 text-sm rounded-lg transition-all hover:bg-[#161B22]',
                isLiked ? 'text-red-400' : 'text-gray-400 hover:text-white'
              )}
            >
              <Heart className={cn('h-4 w-4 mr-1', isLiked && 'fill-current')} />
              {(showcase?.likes || 0) + (isLiked ? 1 : 0)}
            </button>

            <button
              onClick={handleBookmark}
              className={cn(
                'inline-flex items-center px-3 py-2 text-sm rounded-lg transition-all hover:bg-[#161B22]',
                isBookmarked ? 'text-[#4B6FED]' : 'text-gray-400 hover:text-white'
              )}
            >
              <Bookmark className={cn('h-4 w-4 mr-1', isBookmarked && 'fill-current')} />
              Save
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#161B22] rounded-lg transition-all"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative w-full h-96 rounded-xl overflow-hidden mb-8">
          <img
            src={showcase.video_thumbnail || getUnsplashImageUrl(showcase.id, 1200, 600)}
            alt={showcase.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          {showcase.featured && (
            <span className="absolute top-4 right-4 inline-flex items-center px-2.5 py-1 text-xs font-medium bg-yellow-500/90 text-black rounded-full z-10">
              <Sparkles className="h-3.5 w-3.5 mr-1" />Featured Project
            </span>
          )}
          {showcase.video_url && (
            <span className="absolute top-4 left-4 inline-flex items-center px-2.5 py-1 text-xs font-medium bg-[#4B6FED]/90 text-white rounded-full z-10">
              <Video className="h-3.5 w-3.5 mr-1" />Has Video
            </span>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">{showcase.title}</h1>
            <div className="flex items-center gap-4 text-gray-300">
              {showcase.company_name && (
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  {showcase.company_name}
                </div>
              )}
              {showcase.developer_name && (
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  {showcase.developer_name}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList className="grid w-full grid-cols-2 bg-[#161B22] border border-white/5">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-[#4B6FED] data-[state=active]:text-white text-gray-400"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="tech"
                    className="data-[state=active]:bg-[#4B6FED] data-[state=active]:text-white text-gray-400"
                  >
                    Tech Stack
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-5 mt-6">
                  {/* About */}
                  <div className="bg-[#161B22] border border-white/5 rounded-xl p-6">
                    <h2 className="text-base font-semibold text-white mb-4">About This Project</h2>
                    <p className="text-base leading-relaxed text-gray-400">{showcase.description}</p>
                  </div>

                  {/* Results */}
                  {showcase.results && (
                    <div className="bg-[#161B22] border border-white/5 rounded-xl p-6">
                      <h2 className="text-base font-semibold text-white mb-4">Results &amp; Impact</h2>
                      <p className="text-base font-medium text-[#4B6FED]">{showcase.results}</p>
                    </div>
                  )}

                  {/* Demo */}
                  {showcase.demo_url && (
                    <div className="bg-[#161B22] border border-white/5 rounded-xl p-6">
                      <h2 className="text-base font-semibold text-white mb-4">Live Demo</h2>
                      <a
                        href={showcase.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-[#4B6FED] hover:bg-[#3A56D3] text-white text-sm font-medium rounded-lg transition-all"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Live Demo
                      </a>
                    </div>
                  )}

                  {/* GitHub */}
                  {showcase.github_url && (
                    <div className="bg-[#161B22] border border-white/5 rounded-xl p-6">
                      <h2 className="text-base font-semibold text-white mb-4">Source Code</h2>
                      <a
                        href={showcase.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 border border-white/5 text-gray-400 hover:text-white hover:bg-[#21262D] hover:border-white/10 text-sm rounded-lg transition-all"
                      >
                        <Github className="h-4 w-4" />
                        View on GitHub
                      </a>
                    </div>
                  )}

                  {/* Video */}
                  {showcase.video_url && (
                    <div className="bg-[#161B22] border border-white/5 rounded-xl p-6">
                      <h2 className="text-base font-semibold text-white mb-4">Demo Video</h2>
                      <div className="aspect-video rounded-lg overflow-hidden bg-[#0A0D14] border border-white/10">
                        <video
                          src={showcase.video_url}
                          controls
                          className="w-full h-full"
                          poster={showcase.video_thumbnail}
                        />
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="tech" className="space-y-5 mt-6">
                  {/* Tech stack */}
                  <div className="bg-[#161B22] border border-white/5 rounded-xl p-6">
                    <h2 className="text-base font-semibold text-white mb-4">Technologies Used</h2>
                    <div className="flex flex-wrap gap-2">
                      {showcase.tech_stack.map((tech, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-3 py-1 text-sm bg-[#4B6FED]/10 text-[#8AB4FF] border border-[#4B6FED]/30 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Architecture */}
                  <div className="bg-[#161B22] border border-white/5 rounded-xl p-6">
                    <h2 className="text-base font-semibold text-white mb-4">Architecture &amp; Implementation</h2>
                    <p className="text-gray-400">
                      This project leverages a modern tech stack combining {showcase.tech_stack.slice(0, 3).join(', ')}
                      {showcase.tech_stack.length > 3 && ` and ${showcase.tech_stack.length - 3} more technologies`}
                      {' '}to deliver a robust and scalable solution.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.article>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {(showcase.company_name || showcase.developer_name) && (
              <div className="bg-[#161B22] border border-white/5 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
                {showcase.company_name && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#4B6FED] shrink-0" />
                    <span className="font-medium text-white">{showcase.company_name}</span>
                  </div>
                )}
                {showcase.developer_name && (
                  <div className="flex items-center gap-2 mt-3">
                    <User className="h-5 w-5 text-[#4B6FED] shrink-0" />
                    <span className="text-sm text-gray-400">{showcase.developer_name}</span>
                  </div>
                )}
              </div>
            )}

            {showcase.featured && (
              <div className="bg-yellow-900/10 border border-yellow-500/30 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  Featured Project
                </h3>
                <p className="text-sm text-gray-400">
                  This project has been highlighted by the AINative team for its exceptional implementation and results.
                </p>
              </div>
            )}

            <div className="bg-[#161B22] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Quick Links</h3>
              <div className="space-y-2">
                {showcase.demo_url && (
                  <a
                    href={showcase.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-sm border border-white/5 text-gray-400 hover:text-white hover:bg-[#21262D] hover:border-white/10 rounded-lg transition-all"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    Live Demo
                  </a>
                )}
                {showcase.github_url && (
                  <a
                    href={showcase.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-sm border border-white/5 text-gray-400 hover:text-white hover:bg-[#21262D] hover:border-white/10 rounded-lg transition-all"
                  >
                    <Github className="h-4 w-4 shrink-0" />
                    Source Code
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
