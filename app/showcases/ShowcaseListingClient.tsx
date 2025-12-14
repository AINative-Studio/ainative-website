'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, Sparkles, ExternalLink, Github, AlertCircle, Filter, Video } from 'lucide-react';
import { getShowcases } from '@/src/lib/strapi';
import { getUnsplashImageUrl } from '@/src/lib/unsplash';
import { searchCommunityContent } from '@/src/lib/community/search';

interface ShowcaseData {
  id: number;
  title: string;
  company_name: string;
  developer_name: string | null;
  description: string;
  tech_stack: string[];
  demo_url: string | null;
  github_url: string | null;
  results: string | null;
  featured: boolean;
  slug: string | null;
  video_url?: string;
  video_thumbnail?: string;
  _similarity?: number;
}

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
);

const ShowcaseSkeleton = () => (
  <Card className="h-full">
    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" />
    <CardHeader className="flex-1">
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-20 w-full mb-4" />
      <div className="flex gap-2 mb-3">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-full mb-3" />
    </CardHeader>
    <CardContent className="pt-0">
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>
    </CardContent>
  </Card>
);

export default function ShowcaseListingClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState('All');
  const [showcases, setShowcases] = useState<ShowcaseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [techFilters, setTechFilters] = useState<string[]>(['All']);
  const [searchMode, setSearchMode] = useState<'exact' | 'semantic'>('exact');
  const [semanticResults, setSemanticResults] = useState<any[]>([]);
  const [searchingSemantics, setSearchingSemantics] = useState(false);
  const [showVideoOnly, setShowVideoOnly] = useState(false);

  useEffect(() => {
    const fetchShowcases = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getShowcases();
        const transformedShowcases: ShowcaseData[] = response.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          company_name: item.company_name,
          developer_name: item.developer_name,
          description: item.description,
          tech_stack: item.tech_stack || [],
          demo_url: item.demo_url,
          github_url: item.github_url,
          results: item.results,
          featured: item.featured,
          slug: item.slug,
          video_url: item.video_url,
          video_thumbnail: item.video_thumbnail,
        }));

        setShowcases(transformedShowcases);

        const allTechStack = transformedShowcases.flatMap(s => s.tech_stack);
        const uniqueTech = Array.from(new Set(allTechStack)).sort();
        setTechFilters(['All', ...uniqueTech]);
      } catch (err) {
        console.error('Failed to fetch showcases:', err);
        setError('Failed to load showcases. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchShowcases();
  }, []);

  useEffect(() => {
    const performSemanticSearch = async () => {
      if (searchMode === 'semantic' && searchQuery.trim()) {
        try {
          setSearchingSemantics(true);
          const results = await searchCommunityContent(searchQuery, {
            contentTypes: ['showcase'],
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

  const filteredShowcases = (() => {
    let results = showcases;

    if (showVideoOnly) {
      results = results.filter(showcase => showcase.video_url);
    }

    if (searchMode === 'semantic' && searchQuery.trim() && semanticResults.length > 0) {
      const semanticIds = new Set(semanticResults.map(r => r.metadata?.content_id).filter(Boolean));
      results = results.filter(showcase => semanticIds.has(showcase.id.toString()));

      results = results.map(showcase => {
        const semanticResult = semanticResults.find(r => r.metadata?.content_id === showcase.id.toString());
        return { ...showcase, _similarity: semanticResult?.similarity || 0 };
      }).sort((a, b) => (b._similarity || 0) - (a._similarity || 0));
    } else if (searchMode === 'exact' && searchQuery.trim()) {
      results = results.filter(showcase =>
        showcase.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        showcase.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        showcase.company_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedTech !== 'All') {
      results = results.filter(showcase => showcase.tech_stack.includes(selectedTech));
    }

    return results;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <main className="container mx-auto px-4 py-20 mt-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            Community Showcase
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            Built with AINative
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover inspiring projects from our developer community
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
                      : 'Search showcases...'
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
                  <Sparkles className="h-4 w-4 mr-2" />
                  Semantic
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap gap-2 flex-1">
                <span className="text-sm font-medium mr-2 flex items-center">
                  <Filter className="h-4 w-4 mr-1" />
                  Tech Stack:
                </span>
                {techFilters.slice(0, 8).map(tech => (
                  <Button
                    key={tech}
                    variant={selectedTech === tech ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTech(tech)}
                    disabled={isLoading}
                  >
                    {tech}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="video-only"
                    checked={showVideoOnly}
                    onCheckedChange={setShowVideoOnly}
                  />
                  <Label htmlFor="video-only" className="text-sm flex items-center gap-1 cursor-pointer">
                    <Video className="h-4 w-4" />
                    Video Only
                  </Label>
                </div>
              </div>
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
                <ShowcaseSkeleton />
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShowcases.map((showcase, index) => (
              <motion.div key={showcase.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Link href={`/showcases/${showcase.slug || showcase.id}`} className="block h-full">
                  <Card className="h-full hover:shadow-lg transition-shadow flex flex-col cursor-pointer">
                    <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/10 to-blue-500/10">
                      <img
                        src={showcase.video_thumbnail || getUnsplashImageUrl(showcase.id, 800, 450)}
                        alt={showcase.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {showcase.featured && (
                        <Badge className="absolute top-2 right-2 bg-yellow-500 text-white z-10">
                          <Sparkles className="h-3 w-3 mr-1" />Featured
                        </Badge>
                      )}
                      {showcase.video_url && (
                        <Badge className="absolute top-2 left-2 bg-blue-500 text-white z-10">
                          <Video className="h-3 w-3 mr-1" />Video
                        </Badge>
                      )}
                    </div>
                    <CardHeader className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-muted-foreground">
                          {showcase.company_name}{showcase.developer_name ? ` • ${showcase.developer_name}` : ''}
                        </div>
                        {searchMode === 'semantic' && showcase._similarity && (
                          <Badge variant="outline" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {Math.round(showcase._similarity * 100)}%
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="mb-2">{showcase.title}</CardTitle>
                      <CardDescription className="mb-4 line-clamp-2">{showcase.description}</CardDescription>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {showcase.tech_stack.slice(0, 4).map((tech, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{tech}</Badge>
                        ))}
                        {showcase.tech_stack.length > 4 && (
                          <Badge variant="outline" className="text-xs">+{showcase.tech_stack.length - 4}</Badge>
                        )}
                      </div>
                      {showcase.results && (
                        <div className="text-sm font-medium text-primary mb-3 line-clamp-1">Results: {showcase.results}</div>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-2">
                        {showcase.demo_url && (
                          <Button variant="outline" size="sm" asChild className="flex-1" onClick={(e) => e.stopPropagation()}>
                            <a href={showcase.demo_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />Demo
                            </a>
                          </Button>
                        )}
                        {showcase.github_url && (
                          <Button variant="outline" size="sm" asChild className="flex-1" onClick={(e) => e.stopPropagation()}>
                            <a href={showcase.github_url} target="_blank" rel="noopener noreferrer">
                              <Github className="h-4 w-4 mr-1" />Code
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && !error && filteredShowcases.length === 0 && showcases.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No showcases yet</h3>
            <p className="text-muted-foreground mb-4">Be the first to share your AINative project!</p>
            <Button>Submit Your Project</Button>
          </div>
        )}

        {!isLoading && !error && filteredShowcases.length === 0 && showcases.length > 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No showcases found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedTech('All'); }}>Clear Filters</Button>
          </div>
        )}
      </main>
    </div>
  );
}
