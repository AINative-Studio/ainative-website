'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Send, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CommentsProps {
  contentType: 'blog_post' | 'tutorial' | 'video';
  contentId: number;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: {
    email: string;
    full_name?: string;
  };
}

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

export default function Comments({ contentType, contentId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, []);

  // Load comments on mount
  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentType, contentId]);

  const loadComments = async () => {
    setIsLoading(true);
    setError(null);

    const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ainative-community-production.up.railway.app';

    try {
      const response = await fetch(`${STRAPI_URL}/api/comments?` + new URLSearchParams({
        'filters[content_type][$eq]': contentType,
        'filters[content_id][$eq]': contentId.toString(),
        'filters[approved][$eq]': 'true',
        'sort': 'createdAt:desc',
        'pagination[limit]': '100'
      }));

      if (response.ok) {
        const data = await response.json();
        // Transform Strapi comments to match our interface
        const transformedComments = (data.data || []).map((item: any) => ({
          id: item.id,
          content: item.content,
          created_at: item.createdAt,
          user: {
            email: item.user_email,
            full_name: item.user_name
          }
        }));
        setComments(transformedComments);
      } else if (response.status === 404) {
        // Comments endpoint not yet implemented in Strapi - silently handle
        setComments([]);
      } else {
        throw new Error('Failed to load comments');
      }
    } catch (err: any) {
      // Silently handle missing comments endpoint - feature not yet implemented
      if (err.message?.includes('404') || err.status === 404) {
        setComments([]);
      } else {
        console.error('Error loading comments:', err);
        setError('Failed to load comments. Please try again later.');
        setComments([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (newComment.trim().length < 3) {
      toast.error('Comment must be at least 3 characters long');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ainative-community-production.up.railway.app';

    try {
      // Get user info from localStorage
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      if (!user) {
        toast.error('Please sign in to comment');
        return;
      }

      const response = await fetch(`${STRAPI_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            content: newComment.trim(),
            user_id: user.id || user.user_id,
            user_email: user.email,
            user_name: user.preferred_name || user.email.split('@')[0],
            content_type: contentType,
            content_id: contentId,
            approved: true
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Transform and add to list
        const newCommentData = {
          id: data.data.id,
          content: data.data.content,
          created_at: data.data.createdAt,
          user: {
            email: data.data.user_email,
            full_name: data.data.user_name
          }
        };
        setComments(prev => [newCommentData, ...prev]);
        setNewComment('');
        toast.success('Comment posted successfully!');
      } else {
        throw new Error('Failed to post comment');
      }
    } catch (err: any) {
      console.error('Error posting comment:', err);
      const errorMessage = err.message || 'Failed to post comment. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getUserInitials = (user: Comment['user']) => {
    if (user.full_name) {
      return user.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  const getUserDisplayName = (user: Comment['user']) => {
    return user.full_name || user.email.split('@')[0];
  };

  return (
    <div className="mt-12 border-t pt-12">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>
              Comments ({comments.length})
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isSubmitting}
                className="min-h-[100px] resize-none"
                maxLength={5000}
              />

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {newComment.length}/5000 characters
                </span>

                <Button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="py-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">
                  Sign in to join the conversation
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link href="/login">
                    <Button variant="default">Sign In</Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="outline">Sign Up</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          <Separator />

          {/* Comments List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading comments...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground text-lg mb-2">No comments yet</p>
              <p className="text-muted-foreground/70 text-sm">
                Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex gap-4"
                  >
                    <Avatar className="flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getUserInitials(comment.user)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {getUserDisplayName(comment.user)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
