'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Play,
  Clock,
  Eye,
  Heart,
  Search,
  Star,
  User,
  ArrowRight,
  Video as VideoIcon,
  PlayCircle,
  Sparkles,
} from 'lucide-react';

interface Video {
  id: number;
  documentId: string;
  title: string;
  description: string;
  slug: string;
  category: 'tutorial' | 'webinar' | 'showcase' | 'demo';
  duration: number;
  thumbnail_url: string;
  poster_url: string;
  views: number;
  likes: number;
  featured: boolean;
  publishedAt: string;
  author?: {
    id: number;
    name: string;
    slug: string;
    avatar?: string;
  };
  tags?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

// Mock videos data
const mockVideos: Video[] = [
  {
    id: 1,
    documentId: 'vid1',
    title: 'Getting Started with AI Kit',
    description:
      'Learn how to set up and use AI Kit for your first AI-powered application. This comprehensive tutorial covers installation, configuration, and basic usage patterns.',
    slug: 'getting-started-ai-kit',
    category: 'tutorial',
    duration: 1245,
    thumbnail_url: '/images/videos/ai-kit-thumb.png',
    poster_url: '/images/videos/ai-kit-poster.png',
    views: 15420,
    likes: 892,
    featured: true,
    publishedAt: '2024-11-15T10:00:00Z',
    author: {
      id: 1,
      name: 'Sarah Chen',
      slug: 'sarah-chen',
    },
    tags: [
      { id: 1, name: 'AI Kit', slug: 'ai-kit' },
      { id: 2, name: 'Getting Started', slug: 'getting-started' },
    ],
  },
  {
    id: 2,
    documentId: 'vid2',
    title: 'Building RAG Applications with ZeroDB',
    description:
      'Deep dive into Retrieval-Augmented Generation using ZeroDB vector database. Learn semantic search, embeddings, and hybrid queries.',
    slug: 'rag-applications-zerodb',
    category: 'tutorial',
    duration: 2156,
    thumbnail_url: '/images/videos/zerodb-thumb.png',
    poster_url: '/images/videos/zerodb-poster.png',
    views: 8934,
    likes: 567,
    featured: true,
    publishedAt: '2024-11-10T14:30:00Z',
    author: {
      id: 2,
      name: 'Marcus Rodriguez',
      slug: 'marcus-rodriguez',
    },
    tags: [
      { id: 3, name: 'ZeroDB', slug: 'zerodb' },
      { id: 4, name: 'RAG', slug: 'rag' },
    ],
  },
  {
    id: 3,
    documentId: 'vid3',
    title: 'QNN Performance Optimization Webinar',
    description:
      'Join our live webinar on optimizing Quantum Neural Networks for production workloads. Q&A session included.',
    slug: 'qnn-optimization-webinar',
    category: 'webinar',
    duration: 3600,
    thumbnail_url: '/images/videos/qnn-webinar-thumb.png',
    poster_url: '/images/videos/qnn-webinar-poster.png',
    views: 5621,
    likes: 423,
    featured: false,
    publishedAt: '2024-11-05T18:00:00Z',
    author: {
      id: 3,
      name: 'Dr. Emily Watson',
      slug: 'emily-watson',
    },
    tags: [
      { id: 5, name: 'QNN', slug: 'qnn' },
      { id: 6, name: 'Performance', slug: 'performance' },
    ],
  },
  {
    id: 4,
    documentId: 'vid4',
    title: 'AI-Powered Code Editor Showcase',
    description:
      'See how our community members built an intelligent code editor using AI Kit. Real-time code suggestions, refactoring, and more.',
    slug: 'ai-code-editor-showcase',
    category: 'showcase',
    duration: 987,
    thumbnail_url: '/images/videos/code-editor-thumb.png',
    poster_url: '/images/videos/code-editor-poster.png',
    views: 12340,
    likes: 891,
    featured: false,
    publishedAt: '2024-11-01T09:00:00Z',
    author: {
      id: 4,
      name: 'Alex Kim',
      slug: 'alex-kim',
    },
    tags: [
      { id: 1, name: 'AI Kit', slug: 'ai-kit' },
      { id: 7, name: 'Showcase', slug: 'showcase' },
    ],
  },
  {
    id: 5,
    documentId: 'vid5',
    title: 'Agent Swarm Architecture Demo',
    description:
      'Live demonstration of multi-agent orchestration using AI Kit. Watch agents collaborate on complex tasks in real-time.',
    slug: 'agent-swarm-demo',
    category: 'demo',
    duration: 1856,
    thumbnail_url: '/images/videos/agent-swarm-thumb.png',
    poster_url: '/images/videos/agent-swarm-poster.png',
    views: 7823,
    likes: 654,
    featured: false,
    publishedAt: '2024-10-28T11:00:00Z',
    author: {
      id: 5,
      name: 'Jordan Martinez',
      slug: 'jordan-martinez',
    },
    tags: [
      { id: 8, name: 'Agents', slug: 'agents' },
      { id: 9, name: 'Demo', slug: 'demo' },
    ],
  },
  {
    id: 6,
    documentId: 'vid6',
    title: 'Semantic Search Implementation Guide',
    description:
      'Step-by-step tutorial on implementing semantic search in your applications using ZeroDB and OpenAI embeddings.',
    slug: 'semantic-search-guide',
    category: 'tutorial',
    duration: 2478,
    thumbnail_url: '/images/videos/semantic-search-thumb.png',
    poster_url: '/images/videos/semantic-search-poster.png',
    views: 6234,
    likes: 445,
    featured: false,
    publishedAt: '2024-10-25T15:00:00Z',
    author: {
      id: 2,
      name: 'Marcus Rodriguez',
      slug: 'marcus-rodriguez',
    },
    tags: [
      { id: 3, name: 'ZeroDB', slug: 'zerodb' },
      { id: 10, name: 'Search', slug: 'search' },
    ],
  },
];

const categories = [
  { id: 'all', label: 'All Videos' },
  { id: 'tutorial', label: 'Tutorials' },
  { id: 'webinar', label: 'Webinars' },
  { id: 'showcase', label: 'Showcases' },
  { id: 'demo', label: 'Demos' },
];

export default function VideosClient() {
  const [videos] = useState<Video[]>(mockVideos);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      searchQuery === '' ||
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || video.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredVideos = filteredVideos.filter((v) => v.featured);
  const regularVideos = filteredVideos.filter((v) => !v.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="relative pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center mb-6">
              <VideoIcon className="w-12 h-12 text-cyan-400 mr-4" />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Community Videos
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Learn from tutorials, webinars, and showcases created by the
              AINative community
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {videos.length}
                </div>
                <div className="text-sm text-gray-400">Total Videos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {featuredVideos.length}
                </div>
                <div className="text-sm text-gray-400">Featured</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {formatViews(videos.reduce((sum, v) => sum + (v.views || 0), 0))}
                </div>
                <div className="text-sm text-gray-400">Total Views</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Videos */}
      {featuredVideos.length > 0 && (
        <section className="px-4 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center mb-6">
              <Star className="w-6 h-6 text-yellow-500 mr-2" />
              <h2 className="text-2xl font-bold text-white">Featured Videos</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredVideos.map((video, index) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  featured
                  index={index}
                  formatDuration={formatDuration}
                  formatViews={formatViews}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Videos */}
      <section className="px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          {regularVideos.length === 0 && featuredVideos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                No videos found matching your criteria.
              </p>
            </div>
          ) : (
            <>
              {regularVideos.length > 0 && (
                <>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    All Videos
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regularVideos.map((video, index) => (
                      <VideoCard
                        key={video.id}
                        video={video}
                        index={index}
                        formatDuration={formatDuration}
                        formatViews={formatViews}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

interface VideoCardProps {
  video: Video;
  featured?: boolean;
  index: number;
  formatDuration: (seconds: number) => string;
  formatViews: (views: number) => string;
}

function VideoCard({
  video,
  featured,
  index,
  formatDuration,
  formatViews,
}: VideoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={featured ? 'md:col-span-1' : ''}
    >
      <Link
        href={`/community/videos/${video.slug}`}
        className="block group h-full"
      >
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700 hover:border-cyan-500 transition-all duration-200 h-full flex flex-col">
          {/* Thumbnail */}
          <div className="relative aspect-video bg-gray-900">
            {video.thumbnail_url ? (
              <div className="w-full h-full bg-gradient-to-br from-cyan-900/20 to-purple-900/20 flex items-center justify-center">
                <PlayCircle className="w-16 h-16 text-cyan-400/50" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <VideoIcon className="w-16 h-16 text-gray-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
              <PlayCircle className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            {video.featured && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-white text-xs font-semibold flex items-center">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </div>
            )}
            {video.duration > 0 && (
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-75 rounded text-white text-xs font-medium">
                {formatDuration(video.duration)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 flex-grow flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
              {video.title}
            </h3>
            {video.description && (
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                {video.description}
              </p>
            )}

            {/* Author & Category */}
            <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
              {video.author && (
                <div className="flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  <span>{video.author.name}</span>
                </div>
              )}
              <span className="px-2 py-1 bg-gray-700/50 rounded capitalize">
                {video.category}
              </span>
            </div>

            {/* Tags */}
            {video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {video.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.slug}
                    className="px-2 py-1 bg-gray-700/30 text-gray-300 text-xs rounded"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-400 mt-auto">
              {video.views > 0 && (
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  <span>{formatViews(video.views)}</span>
                </div>
              )}
              {video.likes > 0 && (
                <div className="flex items-center">
                  <Heart className="w-4 h-4 mr-1" />
                  <span>{formatViews(video.likes)}</span>
                </div>
              )}
              <div className="flex-grow"></div>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
