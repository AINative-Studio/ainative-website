'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getBlogPosts } from '@/src/lib/strapi';
import { getUnsplashImageUrl } from '@/lib/unsplash';
import { searchCommunityContent } from '@/src/lib/community/search';
import {
  Calendar,
  Clock,
  Eye,
  Search,
  AlertCircle,
  Zap
} from 'lucide-react';

interface BlogPost {
  id: number;
  documentId: string;
  title: string;
  excerpt: string;
  published_date: string;
  category?: { name: string; slug: string };
  tags?: Array<{ name: string }>;
  reading_time?: number;
  view_count?: number;
  featured_image?: unknown;
  slug: string;
  author?: { name: string; avatar?: unknown };
}

const categories = [
  { name: 'All Posts', slug: 'all' },
  { name: 'Tutorial', slug: 'tutorial' },
  { name: 'Product Updates', slug: 'product-updates' },
  { name: 'Developer Stories', slug: 'developer-stories' },
  { name: 'Case Studies', slug: 'case-studies' },
  { name: 'Announcements', slug: 'announcements' }
];

const BlogCardSkeleton = () => (
  <Card className="h-full flex flex-col bg-[#161B22] border-[#2D333B]">
    <Skeleton className="aspect-video w-full bg-[#1C2128]" />
    <CardHeader className="flex-1">
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="h-5 w-20 bg-[#1C2128]" />
        <Skeleton className="h-4 w-12 bg-[#1C2128]" />
      </div>
      <Skeleton className="h-6 w-full mb-2 bg-[#1C2128]" />
      <Skeleton className="h-6 w-3/4 mb-2 bg-[#1C2128]" />
      <Skeleton className="h-16 w-full bg-[#1C2128]" />
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24 bg-[#1C2128]" />
        <Skeleton className="h-4 w-20 bg-[#1C2128]" />
      </div>
      <div className="flex gap-1 mt-3">
        <Skeleton className="h-5 w-16 bg-[#1C2128]" />
        <Skeleton className="h-5 w-16 bg-[#1C2128]" />
        <Skeleton className="h-5 w-16 bg-[#1C2128]" />
      </div>
    </CardContent>
  </Card>
);

const FeaturedPostSkeleton = () => (
  <Card className="overflow-hidden bg-[#161B22] border-[#2D333B]">
    <div className="grid md:grid-cols-2 gap-6">
      <Skeleton className="aspect-video w-full bg-[#1C2128]" />
      <CardHeader className="flex flex-col justify-center">
        <Skeleton className="h-5 w-20 mb-2 bg-[#1C2128]" />
        <Skeleton className="h-8 w-full mb-2 bg-[#1C2128]" />
        <Skeleton className="h-8 w-3/4 mb-4 bg-[#1C2128]" />
        <Skeleton className="h-20 w-full mb-4 bg-[#1C2128]" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-28 bg-[#1C2128]" />
          <Skeleton className="h-4 w-24 bg-[#1C2128]" />
          <Skeleton className="h-5 w-20 bg-[#1C2128]" />
        </div>
      </CardHeader>
    </div>
  </Card>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-white ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-gray-400 ${className}`}>{children}</p>
);

interface TransformedPost {
  id: number;
  title: string;
  excerpt: string;
  published_date: string;
  category: { name: string; slug: string };
  tags: Array<{ name: string }>;
  reading_time: number;
  view_count: number;
  featured_image: unknown;
  slug: string;
  author: { name: string; avatar: unknown };
  _similarity?: number;
}

export default function BlogListingClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'exact' | 'semantic'>('exact');
  const [semanticResults, setSemanticResults] = useState<Array<{ metadata?: { content_id?: string }; similarity?: number }>>([]);
  const [searchingSemantics, setSearchingSemantics] = useState(false);
  const postsPerPage = 6;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getBlogPosts();
        setBlogPosts(response.data || []);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const performSemanticSearch = async () => {
      if (searchMode === 'semantic' && searchQuery.trim()) {
        try {
          setSearchingSemantics(true);
          const results = await searchCommunityContent(searchQuery, {
            contentTypes: ['blog_post'],
            limit: 50
          });
          setSemanticResults(results);
        } catch (err) {
          console.error('Semantic search failed:', err);
          setSemanticResults([]);
        } finally {
          setSearchingSemantics(false);
        }
      } else {
        setSemanticResults([]);
      }
    };

    const timer = setTimeout(performSemanticSearch, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, searchMode]);

  const transformedPosts: TransformedPost[] = blogPosts.map(post => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    published_date: post.published_date,
    category: {
      name: post.category?.name || 'Uncategorized',
      slug: post.category?.slug || 'uncategorized'
    },
    tags: post.tags?.map((tag) => ({ name: tag.name || '' })) || [],
    reading_time: post.reading_time || 5,
    view_count: post.view_count || 0,
    featured_image: post.featured_image,
    slug: post.slug,
    author: {
      name: post.author?.name || 'Anonymous',
      avatar: post.author?.avatar
    }
  }));

  const filteredPosts = (() => {
    let posts: TransformedPost[] = transformedPosts;

    if (searchMode === 'semantic' && searchQuery.trim() && semanticResults.length > 0) {
      const semanticIds = new Set(semanticResults.map(r => r.metadata?.content_id).filter(Boolean));
      posts = transformedPosts.filter(post => semanticIds.has(post.id.toString()));

      posts = posts.map(post => {
        const semanticResult = semanticResults.find(r => r.metadata?.content_id === post.id.toString());
        return { ...post, _similarity: semanticResult?.similarity || 0 };
      }).sort((a, b) => (b._similarity || 0) - (a._similarity || 0));
    } else if (searchMode === 'exact' && searchQuery.trim()) {
      posts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      posts = posts.filter(post => post.category.slug === selectedCategory);
    }

    return posts;
  })();

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  const featuredPost = transformedPosts[0];

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <main className="container mx-auto px-4 py-20 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#4B6FED] to-[#8A63F4]">
            AINative Blog
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Insights, tutorials, and updates from the AINative team
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Card className="border-red-500/50 bg-red-500/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div>
                    <CardTitle className="text-red-400">Error Loading Blog Posts</CardTitle>
                    <CardDescription className="mt-1 text-red-300">{error}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-[#2D333B] text-white hover:bg-[#1C2128]"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {loading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12"
          >
            <FeaturedPostSkeleton />
          </motion.div>
        ) : (
          featuredPost && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-12"
            >
              <Link href={`/blog/${featuredPost.slug}`}>
                <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-[#2D333B] bg-[#161B22] hover:border-[#4B6FED]/40">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="aspect-video bg-gradient-to-br from-[#4B6FED]/20 to-[#8A63F4]/20 overflow-hidden">
                      <img
                        src={getUnsplashImageUrl(featuredPost.id, 800, 450)}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover object-center"
                        loading="eager"
                      />
                    </div>
                    <CardHeader className="flex flex-col justify-center">
                      <Badge className="w-fit mb-2 bg-[#4B6FED]/10 text-[#8AB4FF]">Featured</Badge>
                      <CardTitle className="text-2xl md:text-3xl mb-3">{featuredPost.title}</CardTitle>
                      <CardDescription className="text-base mb-4">{featuredPost.excerpt}</CardDescription>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(featuredPost.published_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {featuredPost.reading_time} min read
                        </div>
                        <Badge variant="outline" className="border-[#2D333B] text-gray-400">{featuredPost.category.name}</Badge>
                      </div>
                    </CardHeader>
                  </div>
                </Card>
              </Link>
            </motion.div>
          )
        )}

        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder={
                  searchMode === 'semantic'
                    ? 'Search with AI (semantic search)...'
                    : 'Search blog posts...'
                }
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-[#161B22] border-[#2D333B] focus:border-[#4B6FED] text-white placeholder:text-gray-500"
                disabled={searchingSemantics}
              />
              {searchingSemantics && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-[#4B6FED] border-t-transparent rounded-full" />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant={searchMode === 'exact' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchMode('exact')}
                className={searchMode === 'exact' ? 'bg-[#4B6FED] text-white' : 'border-[#2D333B] text-gray-400 hover:bg-[#1C2128]'}
              >
                <Search className="h-4 w-4 mr-2" />
                Exact Match
              </Button>
              <Button
                variant={searchMode === 'semantic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchMode('semantic')}
                className={searchMode === 'semantic' ? 'bg-[#4B6FED] text-white' : 'border-[#2D333B] text-gray-400 hover:bg-[#1C2128]'}
              >
                <Zap className="h-4 w-4 mr-2" />
                Semantic
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.slug}
                variant={selectedCategory === category.slug ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedCategory(category.slug);
                  setCurrentPage(1);
                }}
                className={selectedCategory === category.slug ? 'bg-[#4B6FED] text-white' : 'border-[#2D333B] text-gray-400 hover:bg-[#1C2128]'}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <BlogCardSkeleton />
              </motion.div>
            ))
          ) : (
            paginatedPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow duration-200 flex flex-col bg-[#161B22] border-[#2D333B] hover:border-[#4B6FED]/40">
                    <div className="aspect-video bg-gradient-to-br from-[#4B6FED]/10 to-[#8A63F4]/10 overflow-hidden">
                      <img
                        src={getUnsplashImageUrl(post.id, 600, 338)}
                        alt={post.title}
                        className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <CardHeader className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-[#4B6FED]/10 text-[#8AB4FF]">{post.category.name}</Badge>
                        <span className="text-xs text-gray-400">{post.reading_time} min</span>
                        {searchMode === 'semantic' && post._similarity && (
                          <Badge variant="outline" className="ml-auto border-[#2D333B] text-gray-400">
                            <Zap className="h-3 w-3 mr-1" />
                            {Math.round(post._similarity * 100)}%
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="line-clamp-2 mb-2">{post.title}</CardTitle>
                      <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(post.published_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          <span>{post.view_count.toLocaleString()} views</span>
                        </div>
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {post.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs border-[#2D333B] text-gray-400">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </div>

        {!loading && !error && filteredPosts.length === 0 && transformedPosts.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-500" />
            <h3 className="text-lg font-medium mb-2 text-white">No blog posts yet</h3>
            <p className="text-gray-400 mb-4">
              Check back soon for new content from the AINative team
            </p>
          </div>
        )}

        {!loading && !error && filteredPosts.length === 0 && transformedPosts.length > 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-500" />
            <h3 className="text-lg font-medium mb-2 text-white">No posts found</h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setCurrentPage(1);
              }}
              className="border-[#2D333B] text-white hover:bg-[#1C2128]"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="border-[#2D333B] text-white hover:bg-[#1C2128] disabled:opacity-50"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 ${currentPage === page ? 'bg-[#4B6FED] text-white' : 'border-[#2D333B] text-gray-400 hover:bg-[#1C2128]'}`}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="border-[#2D333B] text-white hover:bg-[#1C2128] disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
