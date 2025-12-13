'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getBlogPost } from '@/src/lib/strapi';
import { getUnsplashImageUrl } from '@/src/lib/unsplash';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Twitter,
  Linkedin,
  Facebook,
  Eye,
  AlertCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const BlogDetailSkeleton = () => (
  <div>
    <div className="mb-8">
      <div className="flex flex-wrap gap-2 mb-4">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-12 w-full mb-2" />
      <Skeleton className="h-12 w-3/4 mb-4" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
    <Skeleton className="aspect-video w-full mb-8" />
    <div className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-8 w-48 mt-6" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-32 w-full mt-4" />
    </div>
  </div>
);

const SidebarSkeleton = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-16 w-full mt-3" />
      </CardHeader>
    </Card>
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32 mb-4" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  </div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
);

interface BlogDetailClientProps {
  slug: string;
}

interface BlogPostData {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  published_date: string;
  category: { name: string; slug: string };
  tags: Array<{ name: string }>;
  reading_time: number;
  view_count: number;
  featured_image: unknown;
  slug: string;
  author: {
    name: string;
    role?: string;
    bio?: string;
    avatar: unknown;
    github_url?: string;
    twitter_url?: string;
  };
}

export default function BlogDetailClient({ slug }: BlogDetailClientProps) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setError('No blog post slug provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getBlogPost(slug);

        if (!response) {
          setError('Blog post not found');
          setLoading(false);
          return;
        }

        const transformedPost: BlogPostData = {
          id: response.id,
          title: response.title,
          excerpt: response.excerpt,
          content: response.content,
          published_date: response.published_date,
          category: {
            name: response.category?.name || 'Uncategorized',
            slug: response.category?.slug || 'uncategorized'
          },
          tags: response.tags?.map((tag: { name?: string }) => ({
            name: tag.name || ''
          })) || [],
          reading_time: response.reading_time || 5,
          view_count: response.view_count || 0,
          featured_image: response.featured_image,
          slug: response.slug,
          author: {
            name: response.author?.name || 'Anonymous',
            role: response.author?.role || '',
            bio: response.author?.bio || '',
            avatar: response.author?.avatar,
            github_url: response.author?.github_url,
            twitter_url: response.author?.twitter_url
          }
        };

        setPost(transformedPost);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleShare = (platform: string) => {
    if (!post) return;

    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = post.title;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <main className="container mx-auto px-4 py-20 mt-16">
        <Link href="/blog">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </Link>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <div>
                    <CardTitle className="text-destructive">Error Loading Blog Post</CardTitle>
                    <CardDescription className="mt-1">{error}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => router.push('/blog')}
                  variant="default"
                >
                  Back to Blog
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {loading && !error && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <BlogDetailSkeleton />
              </motion.div>
            </div>
            <SidebarSkeleton />
          </div>
        )}

        {!loading && !error && post && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge variant="secondary">{post.category.name}</Badge>
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag.name}</Badge>
                    ))}
                  </div>

                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                    {post.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(post.published_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {post.reading_time} min read
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {post.view_count.toLocaleString()} views
                    </div>
                  </div>
                </div>

                <div className="aspect-video bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-lg mb-8 overflow-hidden">
                  <img
                    src={getUnsplashImageUrl(post.id, 1200, 675)}
                    alt={post.title}
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                  />
                </div>

                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match;
                        return !isInline && match ? (
                          <SyntaxHighlighter
                            language={match[1]}
                            style={vscDarkPlus}
                            customStyle={{
                              borderRadius: '0.5rem',
                              padding: '1.5rem',
                              fontSize: '0.875rem'
                            }}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                      h1({ children, ...props }) {
                        return <h1 className="text-4xl font-bold mt-8 mb-4 text-foreground" {...props}>{children}</h1>;
                      },
                      h2({ children, ...props }) {
                        return <h2 className="text-3xl font-bold mt-6 mb-3 text-foreground" {...props}>{children}</h2>;
                      },
                      h3({ children, ...props }) {
                        return <h3 className="text-2xl font-semibold mt-4 mb-2 text-foreground" {...props}>{children}</h3>;
                      },
                      p({ children, ...props }) {
                        return <p className="mb-4 leading-relaxed text-muted-foreground" {...props}>{children}</p>;
                      },
                      ul({ children, ...props }) {
                        return <ul className="my-4 list-disc pl-6 space-y-2" {...props}>{children}</ul>;
                      },
                      ol({ children, ...props }) {
                        return <ol className="my-4 list-decimal pl-6 space-y-2" {...props}>{children}</ol>;
                      },
                      li({ children, ...props }) {
                        return <li className="mb-2 text-muted-foreground" {...props}>{children}</li>;
                      },
                      blockquote({ children, ...props }) {
                        return (
                          <blockquote className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground" {...props}>
                            {children}
                          </blockquote>
                        );
                      },
                      strong({ children, ...props }) {
                        return <strong className="font-semibold text-foreground" {...props}>{children}</strong>;
                      },
                      a({ href, children, ...props }) {
                        return (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                            {...props}
                          >
                            {children}
                          </a>
                        );
                      },
                      hr({ ...props }) {
                        return <hr className="my-8 border-border" {...props} />;
                      },
                    }}
                  >
                    {post.content || ''}
                  </ReactMarkdown>
                </div>

                <Separator className="my-8" />

                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Share:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('twitter')}
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('linkedin')}
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('facebook')}
                  >
                    <Facebook className="h-4 w-4" />
                  </Button>
                </div>
              </motion.article>
            </div>

            <div className="space-y-6">
              {post.author && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base mb-4">About the Author</CardTitle>
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-white">
                          {post.author.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{post.author.name}</h4>
                        {post.author.role && (
                          <p className="text-sm text-muted-foreground">{post.author.role}</p>
                        )}
                      </div>
                    </div>
                    {post.author.bio && (
                      <CardDescription className="mt-3">{post.author.bio}</CardDescription>
                    )}
                  </CardHeader>
                  {(post.author.github_url || post.author.twitter_url) && (
                    <CardContent>
                      <div className="flex gap-2">
                        {post.author.github_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={post.author.github_url} target="_blank" rel="noopener noreferrer">
                              GitHub
                            </a>
                          </Button>
                        )}
                        {post.author.twitter_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={post.author.twitter_url} target="_blank" rel="noopener noreferrer">
                              Twitter
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

              <Card className="bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-gray-800/50 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-base">Ready to Build?</CardTitle>
                  <CardDescription>
                    Start building AI-powered applications with AINative
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/signup">
                    <Button className="w-full">Get Started Free</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
