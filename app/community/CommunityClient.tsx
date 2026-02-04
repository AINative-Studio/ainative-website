'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getBlogPosts, getTutorials } from '@/src/lib/strapi';
import {
  BookOpen,
  Calendar,
  Code,
  Users,
  ArrowRight,
  Sparkles,
  FileText,
  Rocket,
  Mail,
  Video,
  Play,
  Clock,
  MapPin,
} from 'lucide-react';
import { getUpcomingEvents, type LumaEvent } from '@/services/luma';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  published_date: string;
  category?: { name: string };
  reading_time?: number;
  slug: string;
}

interface Tutorial {
  id: number;
  title: string;
  description?: string;
  difficulty?: string;
  estimated_time?: number;
  slug: string;
}

// Fallback data if API fails
const fallbackBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Introducing AINative AI Kit for React',
    excerpt: 'Discover our new React toolkit for building AI-powered applications.',
    published_date: '2025-01-15',
    category: { name: 'Product' },
    reading_time: 5,
    slug: 'introducing-ainative-aikit-react',
  },
  {
    id: 2,
    title: 'ZeroDB: High-Performance Vector Database',
    excerpt: 'Learn about our vector database optimized for AI applications.',
    published_date: '2025-01-10',
    category: { name: 'Engineering' },
    reading_time: 8,
    slug: 'zerodb-high-performance-vector-database-for-ai-applications',
  },
];

const fallbackTutorials: Tutorial[] = [
  {
    id: 1,
    title: 'Getting Started with ZeroDB Vector Search',
    description: 'Learn how to implement semantic search using ZeroDB vectors in your application.',
    difficulty: 'beginner',
    estimated_time: 15,
    slug: 'zerodb-vector-search',
  },
  {
    id: 2,
    title: 'Building a Multi-Agent System with Agent Swarm',
    description: 'Create and orchestrate multiple AI agents working together to solve complex tasks.',
    difficulty: 'advanced',
    estimated_time: 45,
    slug: 'multi-agent-system',
  },
];

// Static data for showcases (not in Strapi)
const staticShowcases = [
  {
    id: 1,
    title: 'AI-Powered Customer Support Platform',
    company_name: 'TechCorp Inc.',
    description: 'How TechCorp reduced support response time by 80% using AINative Agent Swarm.',
    slug: 'techcorp-support',
  },
  {
    id: 2,
    title: 'Real-time Document Analysis System',
    company_name: 'LegalTech Pro',
    description: 'Processing 10,000+ legal documents daily with ZeroDB semantic search.',
    slug: 'legaltech-documents',
  },
];

// Static data for videos (not in Strapi)
const staticVideos = [
  {
    id: 1,
    title: 'AI Kit Deep Dive: Building Your First Agent',
    description: 'A comprehensive walkthrough of creating AI agents with AI Kit.',
    duration: 1245,
    views: 12500,
    category: 'Tutorial',
    thumbnail_url: '/images/videos/ai-kit-deep-dive.jpg',
    slug: 'ai-kit-deep-dive',
  },
  {
    id: 2,
    title: 'ZeroDB Performance Optimization Tips',
    description: 'Learn how to optimize your vector queries for maximum performance.',
    duration: 890,
    views: 8200,
    category: 'Best Practices',
    thumbnail_url: '/images/videos/zerodb-optimization.jpg',
    slug: 'zerodb-optimization',
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-900/30 text-green-400 border-green-500/30';
    case 'intermediate':
      return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30';
    case 'advanced':
      return 'bg-red-900/30 text-red-400 border-red-500/30';
    default:
      return 'bg-gray-900/30 text-gray-400 border-gray-500/30';
  }
};

export default function CommunityClient() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(fallbackBlogPosts);
  const [tutorials, setTutorials] = useState<Tutorial[]>(fallbackTutorials);
  const [loading, setLoading] = useState(true);
  const [nextEvent, setNextEvent] = useState<LumaEvent | null>(null);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [blogResponse, tutorialResponse] = await Promise.all([
          getBlogPosts({ pagination: { limit: 2 } }),
          getTutorials({ pagination: { limit: 2 } }),
        ]);

        if (blogResponse?.data?.length > 0) {
          setBlogPosts(blogResponse.data.slice(0, 2).map((post: BlogPost) => ({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt || '',
            published_date: post.published_date,
            category: post.category || { name: 'General' },
            reading_time: post.reading_time || 5,
            slug: post.slug,
          })));
        }

        if (tutorialResponse?.data?.length > 0) {
          setTutorials(tutorialResponse.data.slice(0, 2).map((tutorial: Tutorial) => ({
            id: tutorial.id,
            title: tutorial.title,
            description: tutorial.description || '',
            difficulty: tutorial.difficulty || 'beginner',
            estimated_time: tutorial.estimated_time || 15,
            slug: tutorial.slug,
          })));
        }
      } catch (error) {
        console.error('Error fetching community data:', error);
        // Keep fallback data on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch next upcoming Luma event
  useEffect(() => {
    const fetchNextEvent = async () => {
      try {
        setEventsLoading(true);
        const events = await getUpcomingEvents(); // Get all upcoming events
        if (events && events.length > 0) {
          // Sort by start date and get the soonest one
          const sorted = events.sort((a, b) =>
            new Date(a.event.start_at).getTime() - new Date(b.event.start_at).getTime()
          );
          setNextEvent(sorted[0]);
        }
      } catch (error) {
        console.error('Error fetching upcoming event:', error);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchNextEvent();
  }, []);

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    // Simulate subscription
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubscribing(false);
    setEmail('');
    alert('Successfully subscribed to newsletter!');
  };

  return (
    <div className="min-h-screen bg-vite-bg text-white">
      {/* Animated Background - matching Vite design */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#1A1B2E]" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(75, 111, 237, 0.2) 0%, transparent 30%), radial-gradient(circle at 70% 80%, rgba(138, 99, 244, 0.2) 0%, transparent 30%)',
        }} />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>
      <main className="container mx-auto px-4 py-20 mt-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#4B6FED]/10 border border-[#4B6FED]/30 text-[#8AB4FF] text-sm font-medium mb-4">
            <Users className="h-4 w-4 mr-2" />
            AINative Community
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#4B6FED] to-[#8A63F4]">
            Build Together, Grow Together
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join thousands of developers building the future of AI-powered applications
          </p>
        </motion.div>

        {/* Latest Blog Posts */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
              <FileText className="h-6 w-6 text-[#4B6FED]" />
              Latest from the Blog
            </h2>
            <Link href="/blog">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <>
                <Card className="h-full bg-[#161B22] border-[#2D333B]">
                  <CardHeader>
                    <Skeleton className="h-5 w-20 bg-[#1C2128] mb-2" />
                    <Skeleton className="h-6 w-full bg-[#1C2128] mb-2" />
                    <Skeleton className="h-16 w-full bg-[#1C2128]" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-24 bg-[#1C2128]" />
                  </CardContent>
                </Card>
                <Card className="h-full bg-[#161B22] border-[#2D333B]">
                  <CardHeader>
                    <Skeleton className="h-5 w-20 bg-[#1C2128] mb-2" />
                    <Skeleton className="h-6 w-full bg-[#1C2128] mb-2" />
                    <Skeleton className="h-16 w-full bg-[#1C2128]" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-24 bg-[#1C2128]" />
                  </CardContent>
                </Card>
              </>
            ) : (
              blogPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="h-full">
                  <Card className="h-full hover:shadow-lg hover:shadow-[#4B6FED]/10 transition-all duration-200 bg-[#161B22] border-[#2D333B] hover:border-[#4B6FED]/40">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-[#4B6FED]/20 text-[#8AB4FF] border-[#4B6FED]/30">{post.category?.name || 'General'}</Badge>
                        <span className="text-xs text-gray-400">
                          {post.reading_time || 5} min read
                        </span>
                      </div>
                      <CardTitle className="text-white">{post.title}</CardTitle>
                      <CardDescription className="mt-2 text-gray-400">{post.excerpt}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(post.published_date).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </section>

        <hr className="my-12 border-[#2D333B]" />

        {/* Featured Tutorials */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
              <BookOpen className="h-6 w-6 text-[#4B6FED]" />
              Featured Tutorials
            </h2>
            <Link href="/tutorials">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <>
                <Card className="h-full bg-[#161B22] border-[#2D333B]">
                  <CardHeader>
                    <Skeleton className="h-5 w-20 bg-[#1C2128] mb-2" />
                    <Skeleton className="h-6 w-full bg-[#1C2128] mb-2" />
                    <Skeleton className="h-16 w-full bg-[#1C2128]" />
                  </CardHeader>
                </Card>
                <Card className="h-full bg-[#161B22] border-[#2D333B]">
                  <CardHeader>
                    <Skeleton className="h-5 w-20 bg-[#1C2128] mb-2" />
                    <Skeleton className="h-6 w-full bg-[#1C2128] mb-2" />
                    <Skeleton className="h-16 w-full bg-[#1C2128]" />
                  </CardHeader>
                </Card>
              </>
            ) : (
              tutorials.map((tutorial) => (
                <Link key={tutorial.id} href={`/tutorials/${tutorial.slug}`} className="h-full">
                  <Card className="h-full hover:shadow-lg hover:shadow-[#4B6FED]/10 transition-all duration-200 bg-[#161B22] border-[#2D333B] hover:border-[#4B6FED]/40">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getDifficultyColor(tutorial.difficulty || 'beginner')}>
                          {tutorial.difficulty || 'beginner'}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {tutorial.estimated_time || 15} min
                        </span>
                      </div>
                      <CardTitle className="text-white">{tutorial.title}</CardTitle>
                      <CardDescription className="mt-2 text-gray-400">{tutorial.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </section>

        <hr className="my-12 border-[#2D333B]" />

        {/* Upcoming Events */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
              <Calendar className="h-6 w-6 text-[#4B6FED]" />
              Upcoming Events
            </h2>
            <Link href="/events">
              <Button variant="ghost" size="sm">
                View Calendar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {eventsLoading ? (
              <Card className="h-full hover:shadow-lg hover:shadow-[#4B6FED]/10 transition-all duration-200 overflow-hidden bg-[#161B22] border-[#2D333B]">
                <Skeleton className="w-full h-48 bg-[#21262D]" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 bg-[#21262D] mb-2" />
                  <Skeleton className="h-4 w-full bg-[#21262D]" />
                  <Skeleton className="h-4 w-2/3 bg-[#21262D] mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full bg-[#21262D]" />
                </CardContent>
              </Card>
            ) : nextEvent ? (
              <Card className="h-full hover:shadow-lg hover:shadow-[#4B6FED]/10 transition-all duration-200 overflow-hidden bg-[#161B22] border-[#2D333B] hover:border-[#4B6FED]/40">
                <div className="relative w-full h-48 overflow-hidden">
                  {nextEvent.event.cover_url ? (
                    <img
                      src={nextEvent.event.cover_url}
                      alt={nextEvent.event.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#4B6FED]/20 to-[#8A63F4]/20 flex items-center justify-center">
                      <Calendar className="h-16 w-16 text-[#4B6FED]/50" />
                    </div>
                  )}
                  <Badge className="absolute top-3 left-3 bg-[#4B6FED] text-white">
                    Next Event
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-white line-clamp-2">{nextEvent.event.name}</CardTitle>
                  <CardDescription className="mt-2 text-gray-400">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4" />
                      {new Date(nextEvent.event.start_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                    {nextEvent.event.geo_address_json?.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {nextEvent.event.geo_address_json.city}
                        {nextEvent.event.geo_address_json.country && `, ${nextEvent.event.geo_address_json.country}`}
                      </div>
                    )}
                    {!nextEvent.event.geo_address_json?.city && nextEvent.event.url && (
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Online Event
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a href={nextEvent.event.url} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-[#4B6FED] hover:bg-[#3A56D3] text-white">
                      Register Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full hover:shadow-lg hover:shadow-[#4B6FED]/10 transition-all duration-200 overflow-hidden bg-[#161B22] border-[#2D333B] hover:border-[#4B6FED]/40">
                <div className="w-full h-48 bg-gradient-to-r from-[#4B6FED]/20 to-[#8A63F4]/20 flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-[#4B6FED]/50" />
                </div>
                <CardHeader>
                  <CardTitle className="text-white">Upcoming Events</CardTitle>
                  <CardDescription className="mt-2 text-gray-400">
                    Join our workshops, webinars, and community meetups
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/events">
                    <Button className="w-full bg-[#4B6FED] hover:bg-[#3A56D3] text-white">
                      View All Events <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
            <Card className="h-full hover:shadow-lg hover:shadow-[#4B6FED]/10 transition-all duration-200 overflow-hidden bg-[#161B22] border-[#2D333B] hover:border-[#4B6FED]/40">
              <div className="w-full h-48 bg-gradient-to-r from-[#8A63F4]/20 to-[#4B6FED]/20 flex items-center justify-center">
                <Video className="h-16 w-16 text-[#8A63F4]/50" />
              </div>
              <CardHeader>
                <CardTitle className="text-white">Webinars & Training</CardTitle>
                <CardDescription className="mt-2 text-gray-400">
                  Live coding sessions, demos, and deep dives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/webinars">
                  <Button className="w-full bg-[#8A63F4] hover:bg-[#7851E0] text-white">
                    View Webinars <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        <hr className="my-12 border-[#2D333B]" />

        {/* Community Showcase */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
              <Rocket className="h-6 w-6 text-[#4B6FED]" />
              Community Showcase
            </h2>
            <Link href="/showcases">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {staticShowcases.map((showcase) => (
              <Link key={showcase.id} href={`/showcases/${showcase.slug}`} className="h-full">
                <Card className="h-full hover:shadow-lg hover:shadow-[#4B6FED]/10 transition-all duration-200 bg-[#161B22] border-[#2D333B] hover:border-[#4B6FED]/40">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-300">{showcase.company_name}</span>
                    </div>
                    <CardTitle className="text-white">{showcase.title}</CardTitle>
                    <CardDescription className="mt-2 text-gray-400">{showcase.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <hr className="my-12 border-[#2D333B]" />

        {/* Latest Videos */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
              <Video className="h-6 w-6 text-[#4B6FED]" />
              Latest Videos
            </h2>
            <Link href="/community/videos">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {staticVideos.map((video) => (
              <Link key={video.id} href={`/community/videos/${video.slug}`} className="h-full">
                <Card className="h-full hover:shadow-lg hover:shadow-[#4B6FED]/10 transition-all duration-200 overflow-hidden bg-[#161B22] border-[#2D333B] hover:border-[#4B6FED]/40">
                  <div className="relative">
                    <div className="w-full h-48 bg-gradient-to-br from-[#1C2128] to-[#0D1117] flex items-center justify-center">
                      <Play className="h-16 w-16 text-[#4B6FED]/50" />
                    </div>
                    <Badge className="absolute top-2 right-2 bg-[#4B6FED]/20 text-[#8AB4FF]">{video.category}</Badge>
                    <div className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-xs">
                      {Math.floor(video.duration / 60)}:
                      {String(video.duration % 60).padStart(2, '0')}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2 text-white">{video.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                      {video.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{video.views.toLocaleString()} views</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <hr className="my-12 border-[#2D333B]" />

        {/* Quick Links */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Developer Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/dev-resources" className="h-full">
              <Card className="h-full text-center hover:shadow-lg hover:shadow-[#4B6FED]/10 transition-all duration-200 bg-[#161B22] border-[#2D333B] hover:border-[#4B6FED]/40">
                <CardHeader className="flex flex-col items-center justify-center h-full">
                  <Code className="h-12 w-12 mb-4 text-[#4B6FED]" />
                  <CardTitle className="text-white">SDKs & APIs</CardTitle>
                  <CardDescription className="mt-2 text-gray-400">
                    Official SDKs for Python, JavaScript, and Go
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <a href="https://api.ainative.studio/docs" target="_blank" rel="noopener noreferrer" className="h-full">
              <Card className="h-full text-center hover:shadow-lg hover:shadow-[#4B6FED]/10 transition-all duration-200 bg-[#161B22] border-[#2D333B] hover:border-[#4B6FED]/40">
                <CardHeader className="flex flex-col items-center justify-center h-full">
                  <FileText className="h-12 w-12 mb-4 text-[#4B6FED]" />
                  <CardTitle className="text-white">API Reference</CardTitle>
                  <CardDescription className="mt-2 text-gray-400">
                    Complete API documentation and examples
                  </CardDescription>
                </CardHeader>
              </Card>
            </a>
            <Link href="/resources" className="h-full">
              <Card className="h-full text-center hover:shadow-lg hover:shadow-[#4B6FED]/10 transition-all duration-200 bg-[#161B22] border-[#2D333B] hover:border-[#4B6FED]/40">
                <CardHeader className="flex flex-col items-center justify-center h-full">
                  <Rocket className="h-12 w-12 mb-4 text-[#4B6FED]" />
                  <CardTitle className="text-white">Resources</CardTitle>
                  <CardDescription className="mt-2 text-gray-400">
                    Tools, templates, and code examples
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section>
          <Card className="bg-gradient-to-r from-[#4B6FED]/10 to-[#161B22] border-[#4B6FED]/20">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-[#4B6FED]/10 text-[#4B6FED] mb-4 mx-auto">
                <Mail className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl text-white">Stay Updated</CardTitle>
              <CardDescription className="text-base mt-2 text-gray-400">
                Get the latest tutorials, product updates, and developer news delivered to your
                inbox
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleNewsletterSubscribe}
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-2 border border-[#2D333B] rounded-md bg-[#161B22] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4B6FED] focus:border-transparent"
                />
                <Button type="submit" disabled={isSubscribing} className="bg-[#4B6FED] hover:bg-[#3A56D3] text-white">
                  {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
