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
import { strapiClient, Tutorial as StrapiTutorial } from '@/lib/strapi-client';
import { getUnsplashImageUrl } from '@/lib/unsplash';
import { searchCommunityContent } from '@/src/lib/community/search';

interface Tutorial extends StrapiTutorial {
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
      const response = await strapiClient.getTutorials();
      // Strapi v5 uses 'results', v4 uses 'data'
      const tutorialsData = response?.results || response?.data || [];
      setTutorials(Array.isArray(tutorialsData) ? tutorialsData : []);
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
        return 'bg-green-900/30 text-green-400';
      case 'intermediate':
        return 'bg-yellow-900/30 text-yellow-400';
      case 'advanced':
        return 'bg-red-900/30 text-red-400';
      default:
        return 'bg-[#2D333B] text-gray-400';
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
        (tutorial.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      );
    }

    if (selectedDifficulty !== 'All Levels') {
      results = results.filter(tutorial => tutorial.difficulty === selectedDifficulty);
    }

    return results;
  })();

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <main className="container mx-auto px-4 py-20 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#4B6FED]/10 text-[#4B6FED] text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4 mr-2" />
            Tutorials
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#4B6FED] to-[#8AB4FF]">
            Learn by Doing
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Step-by-step tutorials to master AINative platform
          </p>
        </motion.div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={
                  searchMode === 'semantic'
                    ? 'Search with AI (semantic search)...'
                    : 'Search tutorials...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#161B22] border-[#2D333B] text-white placeholder:text-gray-500"
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
                className={searchMode === 'exact' ? 'bg-[#4B6FED] text-white' : 'border-[#2D333B] text-gray-300 hover:bg-[#2D333B]'}
              >
                <Search className="h-4 w-4 mr-2" />
                Exact Match
              </Button>
              <Button
                variant={searchMode === 'semantic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchMode('semantic')}
                className={searchMode === 'semantic' ? 'bg-[#4B6FED] text-white' : 'border-[#2D333B] text-gray-300 hover:bg-[#2D333B]'}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Semantic
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="flex items-center text-sm font-medium mr-2 text-gray-300">
              <Filter className="h-4 w-4 mr-1" />
              Difficulty:
            </span>
            {difficulties.map((difficulty) => (
              <Button
                key={difficulty}
                variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDifficulty(difficulty)}
                className={selectedDifficulty === difficulty ? 'bg-[#4B6FED] text-white capitalize' : 'border-[#2D333B] text-gray-300 hover:bg-[#2D333B] capitalize'}
              >
                {difficulty}
              </Button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-300 mb-1">
                  Error Loading Tutorials
                </h3>
                <p className="text-sm text-red-400 mb-3">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchTutorials}
                  className="border-[#2D333B] text-gray-300 hover:bg-[#2D333B]"
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
              <Card key={index} className="h-full flex flex-col bg-[#161B22] border-[#2D333B]">
                <Skeleton className="aspect-video w-full bg-[#2D333B]" />
                <CardHeader className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-5 w-20 bg-[#2D333B]" />
                    <Skeleton className="h-4 w-16 bg-[#2D333B]" />
                  </div>
                  <Skeleton className="h-6 w-full mb-2 bg-[#2D333B]" />
                  <Skeleton className="h-4 w-full bg-[#2D333B]" />
                  <Skeleton className="h-4 w-3/4 bg-[#2D333B]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-12 w-full mb-3 bg-[#2D333B]" />
                  <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-5 w-12 bg-[#2D333B]" />
                    <Skeleton className="h-5 w-16 bg-[#2D333B]" />
                    <Skeleton className="h-5 w-14 bg-[#2D333B]" />
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
                  <Card className="h-full hover:border-[#4B6FED]/50 transition-all duration-200 flex flex-col bg-[#161B22] border-[#2D333B]">
                    <div className="aspect-video bg-gradient-to-br from-[#4B6FED]/20 to-[#8A63F4]/20 overflow-hidden">
                      <img
                        src={getUnsplashImageUrl(tutorial.id, 600, 338)}
                        alt={tutorial.title}
                        className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <CardHeader className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {tutorial.difficulty && (
                          <Badge className={getDifficultyColor(tutorial.difficulty)}>
                            {tutorial.difficulty}
                          </Badge>
                        )}
                        {tutorial.duration && (
                          <div className="flex items-center text-xs text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {tutorial.duration} min
                          </div>
                        )}
                      </div>
                      <CardTitle className="line-clamp-2 mb-2 text-white">{tutorial.title}</CardTitle>
                      <CardDescription className="line-clamp-3 text-gray-400">{tutorial.description || ''}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {tutorial.tags && tutorial.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {tutorial.tags.map((tag, idx) => (
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
            ))}
          </div>
        )}

        {!loading && !error && filteredTutorials.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-500" />
            <h3 className="text-lg font-medium mb-2 text-white">No tutorials found</h3>
            <p className="text-gray-400 mb-4">
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
                className="border-[#2D333B] text-gray-300 hover:bg-[#2D333B]"
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
