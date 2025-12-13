'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Clock,
  BookOpen,
  Filter,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { getTutorials } from '@/src/lib/strapi';
import { getUnsplashImageUrl } from '@/src/lib/unsplash';
import { searchCommunityContent } from '@/src/lib/community/search';

interface TutorialTag {
  name: string;
}

interface TutorialCategory {
  name: string;
  slug: string;
}

interface Tutorial {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  estimated_time: number;
  prerequisites: string;
  category?: TutorialCategory;
  tags?: TutorialTag[];
  slug: string;
  _similarity?: number;
}

const difficulties = ['All Levels', 'beginner', 'intermediate', 'advanced'];

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
);

export default function TutorialListingClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Levels');
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'exact' | 'semantic'>('exact');
  const [semanticResults, setSemanticResults] = useState<Array<{ metadata?: { content_id?: string }; similarity?: number }>>([]);
  const [searchingSemantics, setSearchingSemantics] = useState(false);

  const fetchTutorials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTutorials({
        sort: 'createdAt:desc',
        pagination: { pageSize: 100 }
      });
      setTutorials(response.data || []);
    } catch (err) {
      console.error('Failed to fetch tutorials:', err);
      setError('Failed to load tutorials. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorials();
  }, []);

  useEffect(() => {
    const performSemanticSearch = async () => {
      if (searchMode === 'semantic' && searchQuery.trim()) {
        try {
          setSearchingSemantics(true);
          const results = await searchCommunityContent(searchQuery, {
            contentTypes: ['tutorial'],
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

  const filteredTutorials = (() => {
    let results: Tutorial[] = tutorials;

    if (searchMode === 'semantic' && searchQuery.trim() && semanticResults.length > 0) {
      const semanticIds = new Set(semanticResults.map(r => r.metadata?.content_id).filter(Boolean));
      results = tutorials.filter(tutorial => semanticIds.has(tutorial.id.toString()));

      results = results.map(tutorial => {
        const semanticResult = semanticResults.find(r => r.metadata?.content_id === tutorial.id.toString());
        return { ...tutorial, _similarity: semanticResult?.similarity || 0 };
      }).sort((a, b) => (b._similarity || 0) - (a._similarity || 0));
    } else if (searchMode === 'exact' && searchQuery.trim()) {
      results = results.filter(tutorial =>
        tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutorial.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedDifficulty !== 'All Levels') {
      results = results.filter(tutorial => tutorial.difficulty === selectedDifficulty);
    }

    return results;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <main className="container mx-auto px-4 py-20 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4 mr-2" />
            Tutorials
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            Learn by Doing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Step-by-step tutorials to master AINative platform
          </p>
        </motion.div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={
                  searchMode === 'semantic'
                    ? 'Search with AI (semantic search)...'
                    : 'Search tutorials...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={searchingSemantics}
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

          <div className="flex flex-wrap gap-2">
            <span className="flex items-center text-sm font-medium mr-2">
              <Filter className="h-4 w-4 mr-1" />
              Difficulty:
            </span>
            {difficulties.map((difficulty) => (
              <Button
                key={difficulty}
                variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDifficulty(difficulty)}
                className="capitalize"
              >
                {difficulty}
              </Button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                  Error Loading Tutorials
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400 mb-3">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchTutorials}
                  className="border-red-300 dark:border-red-700"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="h-full flex flex-col">
                <Skeleton className="aspect-video w-full" />
                <CardHeader className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-12 w-full mb-3" />
                  <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-14" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutorials.map((tutorial, index) => (
              <motion.div
                key={tutorial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={`/tutorials/${tutorial.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow duration-200 flex flex-col">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-blue-500/20 overflow-hidden">
                      <img
                        src={getUnsplashImageUrl(tutorial.id, 600, 338)}
                        alt={tutorial.title}
                        className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <CardHeader className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getDifficultyColor(tutorial.difficulty)}>
                          {tutorial.difficulty}
                        </Badge>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {tutorial.estimated_time} min
                        </div>
                      </div>
                      <CardTitle className="line-clamp-2 mb-2">{tutorial.title}</CardTitle>
                      <CardDescription className="line-clamp-3">{tutorial.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3">
                        <span className="text-xs font-medium text-muted-foreground">Prerequisites:</span>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tutorial.prerequisites}</p>
                      </div>
                      {tutorial.tags && tutorial.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {tutorial.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && !error && filteredTutorials.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No tutorials found</h3>
            <p className="text-muted-foreground mb-4">
              {tutorials.length === 0
                ? 'No tutorials are available at the moment. Check back soon!'
                : 'Try adjusting your search or filter criteria'}
            </p>
            {tutorials.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDifficulty('All Levels');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
