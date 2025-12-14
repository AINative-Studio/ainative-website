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
import { getWebinar } from '@/src/lib/strapi';
import { getUnsplashImageUrl } from '@/src/lib/unsplash';

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
        const data = await getWebinar(slug);
        if (data) {
          setWebinar(data);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <Link href="/webinars" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to all webinars
            </Link>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <div>
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-12 w-full mb-4" />
                <Skeleton className="h-8 w-3/4 mb-4" />
                <div className="flex gap-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                <CardContent><Skeleton className="h-10 w-full" /></CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !webinar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="container mx-auto px-4 py-16 text-center">
          <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">{error === 'Webinar not found' ? 'Webinar Not Found' : 'Error Loading Webinar'}</h1>
          <p className="text-muted-foreground mb-6">{error || 'The webinar could not be loaded.'}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
            <Link href="/webinars">
              <Button>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <Link href="/webinars" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to all webinars
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="overflow-hidden shadow-xl">
                <div className="relative aspect-video bg-gray-900">
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

              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                {webinar.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{formatDate(webinar.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{webinar.duration} minutes</span>
                </div>
                {isPast && webinar.views && (
                  <div className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    <span>{webinar.views.toLocaleString()} views</span>
                  </div>
                )}
                {(isUpcoming || isLive) && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
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
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {webinar.resources && webinar.resources.length > 0 && (
                  <TabsTrigger value="resources">Resources ({webinar.resources.length})</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About this Webinar</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none dark:prose-invert">
                    <p className="text-muted-foreground whitespace-pre-line">{webinar.description}</p>

                    {webinar.prerequisites && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Prerequisites</h3>
                        <p className="text-muted-foreground">{webinar.prerequisites}</p>
                      </div>
                    )}

                    {webinar.learning_outcomes && webinar.learning_outcomes.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">What You'll Learn</h3>
                        <ul className="space-y-2">
                          {webinar.learning_outcomes.map((outcome, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {webinar.speaker?.bio && (
                  <Card>
                    <CardHeader>
                      <CardTitle>About the Speaker</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={webinar.speaker.avatar?.url} alt={webinar.speaker.name} />
                          <AvatarFallback className="text-xl">{webinar.speaker.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-lg">{webinar.speaker.name}</p>
                          {webinar.speaker.title && (
                            <p className="text-sm text-muted-foreground mb-2">{webinar.speaker.title}</p>
                          )}
                          <p className="text-muted-foreground">{webinar.speaker.bio}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {webinar.resources && webinar.resources.length > 0 && (
                <TabsContent value="resources">
                  <Card>
                    <CardHeader>
                      <CardTitle>Resources</CardTitle>
                      <CardDescription>Download materials and resources from this webinar</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {webinar.resources.map((resource) => (
                          <li key={resource.id}>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                              <ExternalLink className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{resource.title}</p>
                                <p className="text-xs text-muted-foreground uppercase">{resource.type}</p>
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
              <Card>
                <CardHeader>
                  <CardTitle>Reserve Your Spot</CardTitle>
                  <CardDescription>
                    {isFull ? 'This webinar is currently full' : 'Register now to join this live webinar'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!isFull && (
                    <Button className="w-full" size="lg">
                      Register Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {isLive && webinar.meeting_url && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <CardHeader>
                  <CardTitle className="text-red-800 dark:text-red-300">Join Live Now</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" size="lg" asChild>
                    <a href={webinar.meeting_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Join Webinar
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {webinar.tags && webinar.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {webinar.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Share This Webinar</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
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
