'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { getUnsplashImageUrl } from '@/src/lib/unsplash';
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

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

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
            <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white hover:bg-[#161B22]">
              <ArrowLeft className="h-4 w-4 mr-2" />Back to Showcases
            </Button>
          </Link>

          <Skeleton className="w-full h-96 rounded-xl mb-8 bg-[#21262D]" />

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full bg-[#21262D]" />
            </div>
            <div className="space-y-6">
              <Card className="bg-[#161B22] border-[#2D333B]">
                <CardHeader><Skeleton className="h-5 w-32 bg-[#21262D]" /></CardHeader>
                <CardContent><Skeleton className="h-16 w-full bg-[#21262D]" /></CardContent>
              </Card>
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
            <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white hover:bg-[#161B22]">
              <ArrowLeft className="h-4 w-4 mr-2" />Back to Showcases
            </Button>
          </Link>

          <div className="max-w-2xl mx-auto">
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-300 mb-2">
                {error === 'Showcase not found' ? 'Showcase Not Found' : 'Error Loading Showcase'}
              </h3>
              <p className="text-red-400 mb-6">
                {error || 'The showcase you are looking for could not be loaded.'}
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="border-[#2D333B] text-gray-400 hover:bg-[#161B22]"
                >
                  Go Back
                </Button>
                {error !== 'Showcase not found' && (
                  <Button
                    onClick={fetchShowcase}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Try Again
                  </Button>
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
        <div className="flex items-center justify-between mb-6">
          <Link href="/showcases">
            <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-[#161B22]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Showcases
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn('text-gray-400 hover:text-white hover:bg-[#161B22]', isLiked && 'text-red-500')}
              onClick={handleLike}
            >
              <Heart className={cn('h-4 w-4 mr-1', isLiked && 'fill-current')} />
              {(showcase?.likes || 0) + (isLiked ? 1 : 0)}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn('text-gray-400 hover:text-white hover:bg-[#161B22]', isBookmarked && 'text-[#4B6FED]')}
              onClick={handleBookmark}
            >
              <Bookmark className={cn('h-4 w-4 mr-1', isBookmarked && 'fill-current')} />
              Save
            </Button>

            <Button variant="ghost" size="sm" onClick={handleShare} className="text-gray-400 hover:text-white hover:bg-[#161B22]">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative w-full h-96 rounded-xl overflow-hidden mb-8 shadow-2xl">
          <img
            src={showcase.video_thumbnail || getUnsplashImageUrl(showcase.id, 1200, 600)}
            alt={showcase.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          {showcase.featured && (
            <Badge className="absolute top-4 right-4 bg-yellow-500 text-white z-10">
              <Sparkles className="h-4 w-4 mr-1" />Featured Project
            </Badge>
          )}
          {showcase.video_url && (
            <Badge className="absolute top-4 left-4 bg-blue-500 text-white z-10">
              <Video className="h-4 w-4 mr-1" />Has Video
            </Badge>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">{showcase.title}</h1>
            <div className="flex items-center gap-4 text-gray-200">
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
          <div className="lg:col-span-2">
            <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList className="grid w-full grid-cols-2 bg-[#161B22] border border-[#2D333B]">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-[#4B6FED] data-[state=active]:text-white text-gray-400">Overview</TabsTrigger>
                  <TabsTrigger value="tech" className="data-[state=active]:bg-[#4B6FED] data-[state=active]:text-white text-gray-400">Tech Stack</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  <Card className="bg-[#161B22] border-[#2D333B]">
                    <CardHeader>
                      <CardTitle className="text-white">About This Project</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg leading-relaxed text-gray-400">{showcase.description}</p>
                    </CardContent>
                  </Card>

                  {showcase.results && (
                    <Card className="bg-[#161B22] border-[#2D333B]">
                      <CardHeader>
                        <CardTitle className="text-white">Results & Impact</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-medium text-[#4B6FED]">{showcase.results}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Demo Link */}
                  {showcase.demo_url && (
                    <Card className="bg-[#161B22] border-[#2D333B]">
                      <CardHeader>
                        <CardTitle className="text-white">Live Demo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button asChild className="w-full bg-[#4B6FED] hover:bg-[#3A56D3] text-white">
                          <a href={showcase.demo_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Live Demo
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* GitHub Link */}
                  {showcase.github_url && (
                    <Card className="bg-[#161B22] border-[#2D333B]">
                      <CardHeader>
                        <CardTitle className="text-white">Source Code</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" asChild className="w-full border-[#2D333B] text-gray-400 hover:bg-[#21262D] hover:text-white">
                          <a href={showcase.github_url} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-2" />
                            View on GitHub
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Video */}
                  {showcase.video_url && (
                    <Card className="bg-[#161B22] border-[#2D333B]">
                      <CardHeader>
                        <CardTitle className="text-white">Demo Video</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-video rounded-lg overflow-hidden bg-black">
                          <video
                            src={showcase.video_url}
                            controls
                            className="w-full h-full"
                            poster={showcase.video_thumbnail}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="tech" className="space-y-6 mt-6">
                  <Card className="bg-[#161B22] border-[#2D333B]">
                    <CardHeader>
                      <CardTitle className="text-white">Technologies Used</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {showcase.tech_stack.map((tech, i) => (
                          <Badge key={i} variant="secondary" className="text-sm py-1 px-3 bg-[#4B6FED]/10 text-[#8AB4FF] border-[#4B6FED]/30">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#161B22] border-[#2D333B]">
                    <CardHeader>
                      <CardTitle className="text-white">Architecture & Implementation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400">
                        This project leverages a modern tech stack combining {showcase.tech_stack.slice(0, 3).join(', ')}
                        {showcase.tech_stack.length > 3 && ` and ${showcase.tech_stack.length - 3} more technologies`}
                        {' '}to deliver a robust and scalable solution.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.article>
          </div>

          <div className="space-y-6">
            {(showcase.company_name || showcase.developer_name) && (
              <Card className="bg-[#161B22] border-[#2D333B]">
                <CardHeader>
                  <CardTitle className="text-base text-white">Company</CardTitle>
                </CardHeader>
                <CardContent>
                  {showcase.company_name && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-[#4B6FED]" />
                      <span className="font-medium text-white">{showcase.company_name}</span>
                    </div>
                  )}
                  {showcase.developer_name && (
                    <div className="flex items-center gap-2 mt-3">
                      <User className="h-5 w-5 text-[#4B6FED]" />
                      <span className="text-sm text-gray-400">{showcase.developer_name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {showcase.featured && (
              <Card className="border-yellow-500/50 bg-yellow-900/10">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Featured Project
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400">
                    This project has been highlighted by the AINative team for its exceptional implementation and results.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="bg-[#161B22] border-[#2D333B]">
              <CardHeader>
                <CardTitle className="text-base text-white">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {showcase.demo_url && (
                  <Button variant="outline" asChild className="w-full justify-start border-[#2D333B] text-gray-400 hover:bg-[#21262D] hover:text-white">
                    <a href={showcase.demo_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Live Demo
                    </a>
                  </Button>
                )}
                {showcase.github_url && (
                  <Button variant="outline" asChild className="w-full justify-start border-[#2D333B] text-gray-400 hover:bg-[#21262D] hover:text-white">
                    <a href={showcase.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      Source Code
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
