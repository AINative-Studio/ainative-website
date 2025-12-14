'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Calendar,
  Video,
  Clock,
  Users,
  Sparkles,
  AlertCircle,
  Filter,
  Zap,
  Play
} from 'lucide-react';
import { getUnsplashImageUrl } from '@/src/lib/unsplash';
import { searchCommunityContent } from '@/src/lib/community/search';
import { getWebinars } from '@/src/lib/strapi';

interface WebinarTag {
  id: number;
  name: string;
}

interface WebinarSpeaker {
  name: string;
  title?: string;
}

interface Webinar {
  id: number;
  title: string;
  description: string;
  slug: string;
  date: string;
  duration: number;
  status: 'upcoming' | 'live' | 'completed';
  speaker?: WebinarSpeaker;
  tags?: WebinarTag[];
  thumbnail?: { url: string };
  current_attendees: number;
  max_attendees: number;
  _similarity?: number;
}

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
);

const WebinarSkeleton = () => (
  <Card className="h-full">
    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" />
    <CardHeader className="flex-1">
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-16 w-full mb-4" />
      <div className="flex gap-2 mb-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <Skeleton className="h-9 w-full" />
    </CardContent>
  </Card>
);

export default function WebinarListingClient() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [searchMode, setSearchMode] = useState<'exact' | 'semantic'>('exact');
  const [semanticResults, setSemanticResults] = useState<Array<{ metadata?: { content_id?: string }; similarity?: number }>>([]);
  const [searchingSemantics, setSearchingSemantics] = useState(false);

  useEffect(() => {
    const fetchWebinars = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getWebinars({
          sort: 'date:desc',
          pagination: { pageSize: 100 }
        });
        setWebinars(response.data || []);
      } catch (err) {
        console.error('Failed to fetch webinars:', err);
        setError('Failed to load webinars. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWebinars();
  }, []);

  useEffect(() => {
    const performSemanticSearch = async () => {
      if (searchMode === 'semantic' && searchQuery.trim()) {
        try {
          setSearchingSemantics(true);
          const results = await searchCommunityContent(searchQuery, {
            contentTypes: ['webinar'],
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

  const topics = useMemo(() => {
    const topicSet = new Set<string>();
    webinars.forEach((webinar) => {
      webinar.tags?.forEach((tag) => topicSet.add(tag.name));
    });
    return Array.from(topicSet).sort();
  }, [webinars]);

  const filteredWebinars = useMemo(() => {
    let results = webinars;

    if (searchMode === 'semantic' && searchQuery.trim() && semanticResults.length > 0) {
      const semanticIds = new Set(semanticResults.map(r => r.metadata?.content_id).filter(Boolean));
      results = results.filter(webinar => semanticIds.has(webinar.id.toString()));
      results = results.map(webinar => {
        const semanticResult = semanticResults.find(r => r.metadata?.content_id === webinar.id.toString());
        return { ...webinar, _similarity: semanticResult?.similarity || 0 };
      }).sort((a, b) => (b._similarity || 0) - (a._similarity || 0));
    } else if (searchMode === 'exact' && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(webinar =>
        webinar.title.toLowerCase().includes(query) ||
        webinar.description.toLowerCase().includes(query) ||
        webinar.speaker?.name.toLowerCase().includes(query)
      );
    }

    if (selectedTopic !== 'all') {
      results = results.filter(webinar =>
        webinar.tags?.some((tag) => tag.name === selectedTopic)
      );
    }

    if (dateFilter === 'upcoming') {
      results = results.filter(w => w.status === 'upcoming' || w.status === 'live');
    } else if (dateFilter === 'past') {
      results = results.filter(w => w.status === 'completed');
    }

    return results;
  }, [webinars, searchQuery, selectedTopic, dateFilter, searchMode, semanticResults]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-red-500"><span className="animate-pulse mr-1">●</span>LIVE</Badge>;
      case 'upcoming':
        return <Badge variant="secondary"><Calendar className="h-3 w-3 mr-1" />Upcoming</Badge>;
      case 'completed':
        return <Badge variant="outline"><Video className="h-3 w-3 mr-1" />Recording</Badge>;
      default:
        return null;
    }
  };

  const upcomingCount = filteredWebinars.filter(w => w.status === 'upcoming' || w.status === 'live').length;
  const pastCount = filteredWebinars.filter(w => w.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <main className="container mx-auto px-4 py-20 mt-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            Webinars & Events
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            Learn from the Experts
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join live webinars or watch recordings to master AI/ML, quantum computing, and cutting-edge technology
          </p>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <div className="flex-1">
                    <p className="font-medium text-destructive">{error}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Please check your connection and try again.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!error && (
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={
                    searchMode === 'semantic'
                      ? 'Search with AI (semantic search)...'
                      : 'Search webinars...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  disabled={isLoading || searchingSemantics}
                />
                {searchingSemantics && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant={searchMode === 'exact' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSearchMode('exact')}
                  className="whitespace-nowrap"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Exact Match
                </Button>
                <Button
                  variant={searchMode === 'semantic' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSearchMode('semantic')}
                  className="whitespace-nowrap"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Semantic
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium mr-2 flex items-center">
                <Filter className="h-4 w-4 mr-1" />
                Topics:
              </span>
              <Button
                variant={selectedTopic === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTopic('all')}
                disabled={isLoading}
              >
                All Topics
              </Button>
              {topics.map(topic => (
                <Button
                  key={topic}
                  variant={selectedTopic === topic ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTopic(topic)}
                  disabled={isLoading}
                >
                  {topic}
                </Button>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <WebinarSkeleton />
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && !error && (
          <Tabs value={dateFilter} onValueChange={(value) => setDateFilter(value as 'all' | 'upcoming' | 'past')} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">
                All Webinars ({filteredWebinars.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                <Calendar className="w-4 h-4 mr-2" />
                Upcoming ({upcomingCount})
              </TabsTrigger>
              <TabsTrigger value="past">
                <Video className="w-4 h-4 mr-2" />
                Recordings ({pastCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={dateFilter}>
              {filteredWebinars.length === 0 ? (
                <div className="text-center py-16">
                  <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No webinars found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
                  <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedTopic('all'); }}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredWebinars.map((webinar, index) => (
                    <motion.div
                      key={webinar.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={`/webinars/${webinar.slug || webinar.id}`} className="block h-full">
                        <Card className="h-full hover:shadow-lg transition-shadow flex flex-col cursor-pointer">
                          <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/10 to-blue-500/10">
                            <img
                              src={webinar.thumbnail?.url || getUnsplashImageUrl(webinar.id, 800, 450)}
                              alt={webinar.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div className="absolute top-2 right-2 z-10">
                              {getStatusBadge(webinar.status)}
                            </div>
                            {webinar.status === 'completed' && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                                <div className="bg-white/90 dark:bg-black/90 rounded-full p-4">
                                  <Play className="h-8 w-8 text-primary" />
                                </div>
                              </div>
                            )}
                          </div>
                          <CardHeader className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm text-muted-foreground flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(webinar.date)}
                              </div>
                              {searchMode === 'semantic' && webinar._similarity && (
                                <Badge variant="outline" className="text-xs">
                                  <Zap className="h-3 w-3 mr-1" />
                                  {Math.round(webinar._similarity * 100)}%
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="mb-2 line-clamp-2">{webinar.title}</CardTitle>
                            <CardDescription className="mb-4 line-clamp-3">{webinar.description}</CardDescription>

                            {webinar.speaker && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                <Users className="h-3 w-3" />
                                <span>{webinar.speaker.name}</span>
                              </div>
                            )}

                            {webinar.tags && webinar.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {webinar.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag.id} variant="outline" className="text-xs">{tag.name}</Badge>
                                ))}
                              </div>
                            )}
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {webinar.duration || 60} min
                              </div>
                              {webinar.current_attendees > 0 && (
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {webinar.current_attendees} attendees
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {!isLoading && !error && webinars.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No webinars yet</h3>
            <p className="text-muted-foreground mb-4">Check back soon for upcoming events!</p>
          </div>
        )}
      </main>
    </div>
  );
}
