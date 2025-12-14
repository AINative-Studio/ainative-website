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
import { getShowcase } from '@/src/lib/strapi';
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
      const data = await getShowcase(slug);
      if (data) {
        setShowcase(data);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <main className="container mx-auto px-4 py-20 mt-16">
          <Link href="/showcases">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />Back to Showcases
            </Button>
          </Link>

          <Skeleton className="w-full h-96 rounded-xl mb-8" />

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
                <CardContent><Skeleton className="h-16 w-full" /></CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !showcase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <main className="container mx-auto px-4 py-20 mt-16">
          <Link href="/showcases">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />Back to Showcases
            </Button>
          </Link>

          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                {error === 'Showcase not found' ? 'Showcase Not Found' : 'Error Loading Showcase'}
              </h3>
              <p className="text-red-700 dark:text-red-400 mb-6">
                {error || 'The showcase you are looking for could not be loaded.'}
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="border-red-300 dark:border-red-700"
                >
                  Go Back
                </Button>
                {error !== 'Showcase not found' && (
                  <Button
                    onClick={fetchShowcase}
                    className="bg-red-600 hover:bg-red-700"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <main className="container mx-auto px-4 py-20 mt-16">
        <div className="flex items-center justify-between mb-6">
          <Link href="/showcases">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Showcases
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(isLiked && 'text-red-500')}
              onClick={handleLike}
            >
              <Heart className={cn('h-4 w-4 mr-1', isLiked && 'fill-current')} />
              {(showcase?.likes || 0) + (isLiked ? 1 : 0)}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn(isBookmarked && 'text-blue-500')}
              onClick={handleBookmark}
            >
              <Bookmark className={cn('h-4 w-4 mr-1', isBookmarked && 'fill-current')} />
              Save
            </Button>

            <Button variant="ghost" size="sm" onClick={handleShare}>
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
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tech">Tech Stack</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>About This Project</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg leading-relaxed text-muted-foreground">{showcase.description}</p>
                    </CardContent>
                  </Card>

                  {showcase.results && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Results & Impact</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-medium text-primary">{showcase.results}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Demo Link */}
                  {showcase.demo_url && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Live Demo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button asChild className="w-full">
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
                    <Card>
                      <CardHeader>
                        <CardTitle>Source Code</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" asChild className="w-full">
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
                    <Card>
                      <CardHeader>
                        <CardTitle>Demo Video</CardTitle>
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
                  <Card>
                    <CardHeader>
                      <CardTitle>Technologies Used</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {showcase.tech_stack.map((tech, i) => (
                          <Badge key={i} variant="secondary" className="text-sm py-1 px-3">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Architecture & Implementation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Company</CardTitle>
                </CardHeader>
                <CardContent>
                  {showcase.company_name && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <span className="font-medium">{showcase.company_name}</span>
                    </div>
                  )}
                  {showcase.developer_name && (
                    <div className="flex items-center gap-2 mt-3">
                      <User className="h-5 w-5 text-primary" />
                      <span className="text-sm text-muted-foreground">{showcase.developer_name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {showcase.featured && (
              <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/10">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Featured Project
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This project has been highlighted by the AINative team for its exceptional implementation and results.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {showcase.demo_url && (
                  <Button variant="outline" asChild className="w-full justify-start">
                    <a href={showcase.demo_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Live Demo
                    </a>
                  </Button>
                )}
                {showcase.github_url && (
                  <Button variant="outline" asChild className="w-full justify-start">
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
