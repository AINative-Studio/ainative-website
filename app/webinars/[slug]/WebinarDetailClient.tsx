'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  Clock,
  Users,
  Video,
  ChevronLeft,
  ExternalLink,
  CheckCircle,
  Play,
  Share2,
  Copy
} from 'lucide-react';
import { strapiClient, type Webinar as StrapiWebinar } from '@/lib/strapi-client';
import { getUnsplashImageUrl } from '@/lib/unsplash';

interface WebinarTag {
  id: number;
  name: string;
}

interface WebinarSpeaker {
  name: string;
  title?: string;
  bio?: string;
  avatar?: { url: string };
}

interface WebinarResource {
  id: number;
  title: string;
  type: string;
  url: string;
}

interface WebinarData {
  id: number;
  title: string;
  description: string;
  slug: string;
  date: string;
  duration: number;
  status: 'upcoming' | 'live' | 'completed';
  speaker?: WebinarSpeaker;
  co_speakers?: WebinarSpeaker[];
  tags?: WebinarTag[];
  thumbnail?: { url: string };
  video?: { video_url?: string; poster_url?: string };
  current_attendees: number;
  max_attendees: number;
  meeting_url?: string;
  prerequisites?: string;
  learning_outcomes?: string[];
  resources?: WebinarResource[];
  featured?: boolean;
  views?: number;
  category?: { id: number; name: string };
  allow_certificates?: boolean;
}

interface WebinarDetailClientProps {
  slug: string;
}

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
);

export default function WebinarDetailClient({ slug }: WebinarDetailClientProps) {
  const router = useRouter();
  const [webinar, setWebinar] = useState<WebinarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchWebinar = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await strapiClient.getWebinar(slug);
        if (data) {
          // Transform Strapi response to WebinarData format
          const now = new Date();
          const webinarDate = new Date(data.date);
          let status: 'upcoming' | 'live' | 'completed' = 'completed';
          if (webinarDate > now) {
            status = 'upcoming';
          } else if (webinarDate.toDateString() === now.toDateString()) {
            status = 'live';
          }

          // Handle Strapi media URL
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

          const webinarData: WebinarData = {
            id: data.id,
            title: data.title,
            description: data.description || '',
            slug: data.slug,
            date: data.date,
            duration: data.duration || 60,
            status,
            speaker: data.speaker ? {
              name: data.speaker.name,
              bio: data.speaker.bio,
              avatar: data.speaker.avatar ? { url: getMediaUrl(data.speaker.avatar) || '' } : undefined,
            } : undefined,
            co_speakers: data.co_speakers?.map((s) => ({
              name: s.name,
              bio: s.bio,
              avatar: s.avatar ? { url: getMediaUrl(s.avatar) || '' } : undefined,
            })),
            tags: data.tags,
            thumbnail: data.thumbnail ? { url: getMediaUrl(data.thumbnail) || '' } : undefined,
            video: data.video as { video_url?: string; poster_url?: string } | undefined,
            current_attendees: data.current_attendees || 0,
            max_attendees: data.max_attendees || 0,
            views: data.views,
            category: data.category,
          };
          setWebinar(webinarData);
        } else {
          setError('Webinar not found');
        }
      } catch (err) {
        console.error('Failed to fetch webinar:', err);
        setError('Failed to load webinar. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchWebinar();
    }
  }, [slug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D1117]">
        <div className="bg-[#161B22] backdrop-blur-sm border-b border-[#2D333B]">
          <div className="container mx-auto px-4 py-4">
            <Link href="/webinars" className="inline-flex items-center text-sm text-gray-400 hover:text-[#4B6FED] transition-colors">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to all webinars
            </Link>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="aspect-video w-full rounded-lg bg-[#21262D]" />
              <div>
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-6 w-24 bg-[#21262D]" />
                  <Skeleton className="h-6 w-20 bg-[#21262D]" />
                </div>
                <Skeleton className="h-12 w-full mb-4 bg-[#21262D]" />
                <Skeleton className="h-8 w-3/4 mb-4 bg-[#21262D]" />
                <div className="flex gap-4">
                  <Skeleton className="h-5 w-32 bg-[#21262D]" />
                  <Skeleton className="h-5 w-24 bg-[#21262D]" />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <Card className="bg-[#161B22] border-[#2D333B]">
                <CardHeader><Skeleton className="h-6 w-32 bg-[#21262D]" /></CardHeader>
                <CardContent><Skeleton className="h-10 w-full bg-[#21262D]" /></CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !webinar) {
    return (
      <div className="min-h-screen bg-[#0D1117]">
        <div className="container mx-auto px-4 py-16 text-center">
          <Video className="h-16 w-16 mx-auto mb-4 text-gray-500" />
          <h1 className="text-2xl font-bold mb-4 text-white">{error === 'Webinar not found' ? 'Webinar Not Found' : 'Error Loading Webinar'}</h1>
          <p className="text-gray-400 mb-6">{error || 'The webinar could not be loaded.'}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" className="border-[#2D333B] text-gray-400 hover:bg-[#161B22]" onClick={() => router.back()}>Go Back</Button>
            <Link href="/webinars">
              <Button className="bg-[#4B6FED] hover:bg-[#3A56D3] text-white">
                <ChevronLeft className="w-4 h-4 mr-2" />
                All Webinars
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isUpcoming = webinar.status === 'upcoming';
  const isLive = webinar.status === 'live';
  const isPast = webinar.status === 'completed';
  const isFull = webinar.max_attendees > 0 && webinar.current_attendees >= webinar.max_attendees;

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="bg-[#161B22] backdrop-blur-sm border-b border-[#2D333B]">
        <div className="container mx-auto px-4 py-4">
          <Link href="/webinars" className="inline-flex items-center text-sm text-gray-400 hover:text-[#4B6FED] transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to all webinars
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="overflow-hidden shadow-xl bg-[#161B22] border-[#2D333B]">
                <div className="relative aspect-video bg-[#0D1117]">
                  {isPast && webinar.video?.video_url ? (
                    <video
                      ref={videoRef}
                      controls
                      className="w-full h-full"
                      poster={webinar.video.poster_url || webinar.thumbnail?.url}
                    >
                      <source src={webinar.video.video_url} type="application/x-mpegURL" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={webinar.thumbnail?.url || getUnsplashImageUrl(webinar.id, 1200, 675)}
                        alt={webinar.title}
                        className="w-full h-full object-cover"
                      />
                      {isLive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Badge variant="destructive" className="text-xl py-2 px-4 animate-pulse">
                            LIVE NOW
                          </Badge>
                        </div>
                      )}
                      {isUpcoming && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="text-center text-white">
                            <Calendar className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-xl font-semibold">Starting Soon</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-2 mb-3">
                {isUpcoming && <Badge>Upcoming</Badge>}
                {isLive && <Badge variant="destructive" className="animate-pulse">Live</Badge>}
                {isPast && <Badge variant="secondary">On-Demand</Badge>}
                {webinar.featured && <Badge variant="outline">Featured</Badge>}
                {webinar.category && <Badge variant="secondary">{webinar.category.name}</Badge>}
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#4B6FED] to-[#8A63F4]">
                {webinar.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-gray-400 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#4B6FED]" />
                  <span>{formatDate(webinar.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#4B6FED]" />
                  <span>{webinar.duration} minutes</span>
                </div>
                {isPast && webinar.views && (
                  <div className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-[#4B6FED]" />
                    <span>{webinar.views.toLocaleString()} views</span>
                  </div>
                )}
                {(isUpcoming || isLive) && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#4B6FED]" />
                    <span>
                      {webinar.current_attendees} registered
                      {webinar.max_attendees > 0 && ` / ${webinar.max_attendees} max`}
                    </span>
                  </div>
                )}
              </div>

              {webinar.speaker && (
                <div className="flex items-center gap-3 mb-6">
                  <Avatar>
                    <AvatarImage src={webinar.speaker.avatar?.url} alt={webinar.speaker.name} />
                    <AvatarFallback>{webinar.speaker.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{webinar.speaker.name}</p>
                    {webinar.speaker.title && (
                      <p className="text-sm text-muted-foreground">{webinar.speaker.title}</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start bg-[#161B22] border border-[#2D333B]">
                <TabsTrigger value="overview" className="data-[state=active]:bg-[#4B6FED] data-[state=active]:text-white text-gray-400">Overview</TabsTrigger>
                {webinar.resources && webinar.resources.length > 0 && (
                  <TabsTrigger value="resources" className="data-[state=active]:bg-[#4B6FED] data-[state=active]:text-white text-gray-400">Resources ({webinar.resources.length})</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card className="bg-[#161B22] border-[#2D333B]">
                  <CardHeader>
                    <CardTitle className="text-white">About this Webinar</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none prose-invert">
                    <p className="text-gray-400 whitespace-pre-line">{webinar.description}</p>

                    {webinar.prerequisites && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2 text-white">Prerequisites</h3>
                        <p className="text-gray-400">{webinar.prerequisites}</p>
                      </div>
                    )}

                    {webinar.learning_outcomes && webinar.learning_outcomes.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3 text-white">What You&apos;ll Learn</h3>
                        <ul className="space-y-2">
                          {webinar.learning_outcomes.map((outcome, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-400">{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {webinar.speaker?.bio && (
                  <Card className="bg-[#161B22] border-[#2D333B]">
                    <CardHeader>
                      <CardTitle className="text-white">About the Speaker</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={webinar.speaker.avatar?.url} alt={webinar.speaker.name} />
                          <AvatarFallback className="text-xl bg-[#4B6FED] text-white">{webinar.speaker.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-lg text-white">{webinar.speaker.name}</p>
                          {webinar.speaker.title && (
                            <p className="text-sm text-gray-500 mb-2">{webinar.speaker.title}</p>
                          )}
                          <p className="text-gray-400">{webinar.speaker.bio}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {webinar.resources && webinar.resources.length > 0 && (
                <TabsContent value="resources">
                  <Card className="bg-[#161B22] border-[#2D333B]">
                    <CardHeader>
                      <CardTitle className="text-white">Resources</CardTitle>
                      <CardDescription className="text-gray-400">Download materials and resources from this webinar</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {webinar.resources.map((resource) => (
                          <li key={resource.id}>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-lg border border-[#2D333B] hover:bg-[#21262D] transition-colors"
                            >
                              <ExternalLink className="h-5 w-5 text-[#4B6FED]" />
                              <div>
                                <p className="font-medium text-white">{resource.title}</p>
                                <p className="text-xs text-gray-500 uppercase">{resource.type}</p>
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>

          <div className="space-y-6">
            {isUpcoming && (
              <Card className="bg-[#161B22] border-[#2D333B]">
                <CardHeader>
                  <CardTitle className="text-white">Reserve Your Spot</CardTitle>
                  <CardDescription className="text-gray-400">
                    {isFull ? 'This webinar is currently full' : 'Register now to join this live webinar'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!isFull && (
                    <Button className="w-full bg-[#4B6FED] hover:bg-[#3A56D3] text-white" size="lg">
                      Register Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {isLive && webinar.meeting_url && (
              <Card className="border-red-800 bg-red-900/20">
                <CardHeader>
                  <CardTitle className="text-red-300">Join Live Now</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white" size="lg" asChild>
                    <a href={webinar.meeting_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Join Webinar
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {webinar.tags && webinar.tags.length > 0 && (
              <Card className="bg-[#161B22] border-[#2D333B]">
                <CardHeader>
                  <CardTitle className="text-white">Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {webinar.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="bg-[#4B6FED]/10 text-[#8AB4FF] border-[#4B6FED]/30">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-[#161B22] border-[#2D333B]">
              <CardHeader>
                <CardTitle className="text-white">Share This Webinar</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="border-[#2D333B] text-gray-400 hover:bg-[#21262D] hover:text-white">
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
