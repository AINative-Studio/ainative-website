'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Monitor,
  ExternalLink,
} from 'lucide-react';

// Mock data for blog posts
const mockBlogPosts = [
  {
    id: 1,
    title: 'Introducing AI Kit 2.0: The Future of AI Development',
    excerpt: 'Discover the new features and improvements in AI Kit 2.0 that make building AI applications easier than ever.',
    published_date: '2025-01-15',
    category: { name: 'Product' },
    reading_time: 5,
    slug: 'introducing-ai-kit-2',
  },
  {
    id: 2,
    title: 'Building Production-Ready AI Agents with AINative',
    excerpt: 'Learn best practices for deploying AI agents at scale using our battle-tested infrastructure.',
    published_date: '2025-01-10',
    category: { name: 'Engineering' },
    reading_time: 8,
    slug: 'production-ready-ai-agents',
  },
];

// Mock data for tutorials
const mockTutorials = [
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

// Mock data for events
const mockEvents = [
  {
    api_id: 'evt-1',
    title: 'AINative Developer Conference 2025',
    event_type: 'in-person',
    start_date: '2025-03-15T10:00:00Z',
    url: 'https://events.ainative.studio/devcon-2025',
    cover_url: '/images/events/devcon.jpg',
  },
  {
    api_id: 'evt-2',
    title: 'Building with AI Kit: Live Coding Session',
    event_type: 'online',
    start_date: '2025-02-01T18:00:00Z',
    url: 'https://events.ainative.studio/live-coding',
    cover_url: '/images/events/live-coding.jpg',
  },
];

// Mock data for showcases
const mockShowcases = [
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

// Mock data for videos
const mockVideos = [
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
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'advanced':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

export default function CommunityClient() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <main className="container mx-auto px-4 py-20 mt-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Users className="h-4 w-4 mr-2" />
            AINative Community
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            Build Together, Grow Together
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join thousands of developers building the future of AI-powered applications
          </p>
        </motion.div>

        {/* Latest Blog Posts */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Latest from the Blog
            </h2>
            <Link href="/blog">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockBlogPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{post.category.name}</Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {post.reading_time} min read
                      </span>
                    </div>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription className="mt-2">{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(post.published_date).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <hr className="my-12 border-gray-200 dark:border-gray-700" />

        {/* Featured Tutorials */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Featured Tutorials
            </h2>
            <Link href="/tutorials">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockTutorials.map((tutorial) => (
              <Link key={tutorial.id} href={`/tutorials/${tutorial.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getDifficultyColor(tutorial.difficulty)}>
                        {tutorial.difficulty}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {tutorial.estimated_time} min
                      </span>
                    </div>
                    <CardTitle>{tutorial.title}</CardTitle>
                    <CardDescription className="mt-2">{tutorial.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <hr className="my-12 border-gray-200 dark:border-gray-700" />

        {/* Upcoming Events */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Upcoming Events
            </h2>
            <Link href="/events">
              <Button variant="ghost" size="sm">
                View Calendar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockEvents.map((event) => (
              <Card
                key={event.api_id}
                className="hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                <div className="w-full h-40 bg-gradient-to-r from-primary/20 to-blue-500/20 flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-primary/50" />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={
                        event.event_type === 'online'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      }
                    >
                      {event.event_type === 'online' ? 'Online' : 'In-Person'}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                  <CardDescription className="mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(event.start_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        at{' '}
                        {new Date(event.start_date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" asChild>
                    <a href={event.url} target="_blank" rel="noopener noreferrer">
                      Register Now <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <hr className="my-12 border-gray-200 dark:border-gray-700" />

        {/* Community Showcase */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Rocket className="h-6 w-6 text-primary" />
              Community Showcase
            </h2>
            <Link href="/showcases">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockShowcases.map((showcase) => (
              <Link key={showcase.id} href={`/showcases/${showcase.slug}`}>
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{showcase.company_name}</span>
                    </div>
                    <CardTitle>{showcase.title}</CardTitle>
                    <CardDescription className="mt-2">{showcase.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <hr className="my-12 border-gray-200 dark:border-gray-700" />

        {/* Latest Videos */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Video className="h-6 w-6 text-primary" />
              Latest Videos
            </h2>
            <Link href="/community/videos">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockVideos.map((video) => (
              <Link key={video.id} href={`/community/videos/${video.slug}`}>
                <Card className="hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                  <div className="relative">
                    <div className="w-full h-48 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      <Play className="h-16 w-16 text-white/50" />
                    </div>
                    <Badge className="absolute top-2 right-2">{video.category}</Badge>
                    <div className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-xs">
                      {Math.floor(video.duration / 60)}:
                      {String(video.duration % 60).padStart(2, '0')}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                      {video.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>{video.views.toLocaleString()} views</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <hr className="my-12 border-gray-200 dark:border-gray-700" />

        {/* Quick Links */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Developer Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/dev-resources">
              <Card className="text-center hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <Code className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle>SDKs & APIs</CardTitle>
                  <CardDescription className="mt-2">
                    Official SDKs for Python, JavaScript, and Go
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/api-reference">
              <Card className="text-center hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle>API Reference</CardTitle>
                  <CardDescription className="mt-2">
                    Complete API documentation and examples
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/resources">
              <Card className="text-center hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <Rocket className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle>Resources</CardTitle>
                  <CardDescription className="mt-2">
                    Tools, templates, and code examples
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section>
          <Card className="bg-gradient-to-r from-primary/5 to-blue-50 dark:from-primary/10 dark:to-gray-800/50 border-primary/20">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-4 mx-auto">
                <Mail className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">Stay Updated</CardTitle>
              <CardDescription className="text-base mt-2">
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
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Button type="submit" disabled={isSubscribing}>
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
