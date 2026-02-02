'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Eye,
  Heart,
  Share2,
  Clock,
  User,
  Calendar,
  Tag,
  MessageSquare,
  BookmarkPlus,
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Video as VideoIcon,
} from 'lucide-react';
import { VideoPlayer } from '@/components/video/VideoPlayer';

interface Video {
  id: number;
  documentId: string;
  title: string;
  description: string;
  slug: string;
  category: string;
  duration: number;
  video_url: string;
  thumbnail_url: string;
  poster_url: string;
  views: number;
  likes: number;
  publishedAt: string;
  author?: {
    id: number;
    name: string;
    slug: string;
    bio?: string;
    avatar?: string;
  };
  tags?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

// Mock video data
const mockVideos: Video[] = [
  {
    id: 1,
    documentId: 'vid1',
    title: 'Getting Started with AI Kit',
    description:
      'Learn how to set up and use AI Kit for your first AI-powered application. This comprehensive tutorial covers installation, configuration, and basic usage patterns.\n\nIn this video, you will learn:\n- How to install AI Kit packages\n- Setting up your development environment\n- Creating your first AI-powered feature\n- Best practices for production deployment',
    slug: 'getting-started-ai-kit',
    category: 'tutorial',
    duration: 1245,
    video_url: 'https://example.com/videos/ai-kit-intro.mp4',
    thumbnail_url: '/images/videos/ai-kit-thumb.png',
    poster_url: '/images/videos/ai-kit-poster.png',
    views: 15420,
    likes: 892,
    publishedAt: '2024-11-15T10:00:00Z',
    author: {
      id: 1,
      name: 'Sarah Chen',
      slug: 'sarah-chen',
      bio: 'Senior Developer Advocate at AINative. Passionate about making AI accessible to all developers.',
    },
    tags: [
      { id: 1, name: 'AI Kit', slug: 'ai-kit' },
      { id: 2, name: 'Getting Started', slug: 'getting-started' },
      { id: 3, name: 'Tutorial', slug: 'tutorial' },
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
    video_url: 'https://example.com/videos/zerodb-rag.mp4',
    thumbnail_url: '/images/videos/zerodb-thumb.png',
    poster_url: '/images/videos/zerodb-poster.png',
    views: 8934,
    likes: 567,
    publishedAt: '2024-11-10T14:30:00Z',
    author: {
      id: 2,
      name: 'Marcus Rodriguez',
      slug: 'marcus-rodriguez',
      bio: 'ZeroDB Core Team. Building the future of AI-native databases.',
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
    video_url: 'https://example.com/videos/qnn-webinar.mp4',
    thumbnail_url: '/images/videos/qnn-webinar-thumb.png',
    poster_url: '/images/videos/qnn-webinar-poster.png',
    views: 5621,
    likes: 423,
    publishedAt: '2024-11-05T18:00:00Z',
    author: {
      id: 3,
      name: 'Dr. Emily Watson',
      slug: 'emily-watson',
      bio: 'Quantum Computing Researcher and Lead Scientist at AINative.',
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
    video_url: 'https://example.com/videos/code-editor.mp4',
    thumbnail_url: '/images/videos/code-editor-thumb.png',
    poster_url: '/images/videos/code-editor-poster.png',
    views: 12340,
    likes: 891,
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
    video_url: 'https://example.com/videos/agent-swarm.mp4',
    thumbnail_url: '/images/videos/agent-swarm-thumb.png',
    poster_url: '/images/videos/agent-swarm-poster.png',
    views: 7823,
    likes: 654,
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
    video_url: 'https://example.com/videos/semantic-search.mp4',
    thumbnail_url: '/images/videos/semantic-search-thumb.png',
    poster_url: '/images/videos/semantic-search-poster.png',
    views: 6234,
    likes: 445,
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

interface VideoDetailClientProps {
  slug: string;
}

export default function VideoDetailClient({ slug }: VideoDetailClientProps) {
  const video = mockVideos.find((v) => v.slug === slug);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video?.likes || 0);
  const [bookmarked, setBookmarked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Get related videos (same category or tags)
  const relatedVideos = mockVideos
    .filter(
      (v) =>
        v.slug !== slug &&
        (v.category === video?.category ||
          v.tags?.some((t) => video?.tags?.some((vt) => vt.slug === t.slug)))
    )
    .slice(0, 4);

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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleLike = () => {
    if (liked) {
      setLikeCount((prev) => prev - 1);
    } else {
      setLikeCount((prev) => prev + 1);
    }
    setLiked(!liked);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: video?.title,
        text: video?.description,
        url: window.location.href,
      });
    } catch {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Video not found</h1>
          <Link
            href="/community/videos"
            className="text-[#8AB4FF] hover:text-[#4B6FED]"
          >
            Back to videos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vite-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/community/videos"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Videos
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <div className="relative aspect-video bg-[#161B22] rounded-lg overflow-hidden border border-[#2D333B]">
                <VideoPlayer
                  src={video.video_url}
                  poster={video.poster_url}
                  videoId={video.documentId}
                  autoplay={false}
                  controls={true}
                  className="w-full h-full"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={(time) => {
                    if (video.duration > 0) {
                      setProgress((time / video.duration) * 100);
                    }
                  }}
                />
              </div>
            </motion.div>

            {/* Video Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[#161B22] backdrop-blur-sm rounded-lg p-6 border border-[#2D333B] mb-6"
            >
              <h1 className="text-3xl font-bold text-white mb-4">
                {video.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  <span>{video.views.toLocaleString()} views</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{formatDate(video.publishedAt)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{formatDuration(video.duration)}</span>
                </div>
                <span className="px-3 py-1 bg-[#2D333B] rounded-full capitalize">
                  {video.category}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                    liked
                      ? 'bg-[#4B6FED] text-white'
                      : 'bg-[#2D333B] text-gray-300 hover:bg-[#3D434B]'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 mr-2 ${liked ? 'fill-current' : ''}`}
                  />
                  <span>{likeCount.toLocaleString()}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center px-4 py-2 bg-[#2D333B] text-gray-300 rounded-lg hover:bg-[#3D434B] transition-colors"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                    bookmarked
                      ? 'bg-[#8A63F4] text-white'
                      : 'bg-[#2D333B] text-gray-300 hover:bg-[#3D434B]'
                  }`}
                >
                  <BookmarkPlus className="w-4 h-4 mr-2" />
                  {bookmarked ? 'Saved' : 'Save'}
                </button>
              </div>

              {/* Description */}
              {video.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Description
                  </h3>
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {video.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {video.tags && video.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Tag className="w-5 h-5 mr-2" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {video.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/community/videos?tag=${tag.slug}`}
                        className="px-3 py-1 bg-[#2D333B] text-gray-300 rounded-full text-sm hover:bg-[#3D434B] transition-colors"
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Author */}
              {video.author && (
                <div className="border-t border-[#2D333B] pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-[#2D333B] flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <Link
                        href={`/community/authors/${video.author.slug}`}
                        className="text-lg font-semibold text-white hover:text-[#8AB4FF] transition-colors"
                      >
                        {video.author.name}
                      </Link>
                      {video.author.bio && (
                        <p className="text-sm text-gray-400 mt-1">
                          {video.author.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Comments Section (Placeholder) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#161B22] backdrop-blur-sm rounded-lg p-6 border border-[#2D333B]"
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Comments
              </h3>
              <p className="text-gray-400">Comments coming soon...</p>
            </motion.div>
          </div>

          {/* Sidebar - Related Videos */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                Related Videos
              </h3>
              <div className="space-y-4">
                {relatedVideos.map((relatedVideo) => (
                  <Link
                    key={relatedVideo.id}
                    href={`/community/videos/${relatedVideo.slug}`}
                    className="block group"
                  >
                    <div className="bg-[#161B22] backdrop-blur-sm rounded-lg overflow-hidden border border-[#2D333B] hover:border-[#4B6FED] transition-all duration-200">
                      <div className="flex gap-3">
                        <div className="w-40 h-24 flex-shrink-0 relative bg-vite-bg">
                          <div className="w-full h-full bg-gradient-to-br from-[#4B6FED]/20 to-[#8A63F4]/20 flex items-center justify-center">
                            <VideoIcon className="w-8 h-8 text-[#4B6FED]/50" />
                          </div>
                          {relatedVideo.duration > 0 && (
                            <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black bg-opacity-75 rounded text-white text-xs">
                              {formatDuration(relatedVideo.duration)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 p-3 min-w-0">
                          <h4 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-[#8AB4FF] transition-colors mb-1">
                            {relatedVideo.title}
                          </h4>
                          {relatedVideo.author && (
                            <p className="text-xs text-gray-400 mb-1">
                              {relatedVideo.author.name}
                            </p>
                          )}
                          <div className="flex items-center text-xs text-gray-500">
                            <Eye className="w-3 h-3 mr-1" />
                            <span>
                              {relatedVideo.views.toLocaleString()} views
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

                {relatedVideos.length === 0 && (
                  <p className="text-gray-400 text-sm">
                    No related videos found.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
