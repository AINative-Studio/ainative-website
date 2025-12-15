'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Filter, Loader2, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  searchCommunityContent,
  getContentTypeLabel,
  getContentTypeIcon,
  type SearchResult,
} from '@/src/lib/community/search';

const CONTENT_TYPES = [
  { value: 'all', label: 'All Content' },
  { value: 'blog_post', label: 'Blog Posts' },
  { value: 'tutorial', label: 'Tutorials' },
  { value: 'showcase', label: 'Showcases' },
  { value: 'resource', label: 'Resources' },
];

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-xl font-semibold ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-base text-muted-foreground ${className}`}>{children}</p>
);

export default function SearchClient() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedContentType, setSelectedContentType] = useState('all');
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (searchQuery: string, contentType: string) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const contentTypes = contentType === 'all' ? undefined : [contentType];
      const searchResults = await searchCommunityContent(searchQuery, {
        limit: 20,
        threshold: 0.7,
        contentTypes,
      });

      setResults(searchResults);
    } catch (err: any) {
      setError(err.message || 'Search failed. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchChange = (value: string) => {
    setQuery(value);

    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    const timer = setTimeout(() => {
      performSearch(value, selectedContentType);
    }, 500);

    setSearchDebounceTimer(timer);
  };

  const handleContentTypeChange = (value: string) => {
    setSelectedContentType(value);
    if (query) {
      performSearch(query, value);
    }
  };

  useEffect(() => {
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchDebounceTimer]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-20 mt-16 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Search Community Content
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powered by semantic search - find exactly what you're looking for across blog posts,
            tutorials, showcases, and resources
          </p>
        </motion.div>

        <div className="mb-8">
          <div className="flex gap-4 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="search"
                placeholder="Search blog posts, tutorials, docs..."
                value={query}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-4 h-12 text-lg"
                autoFocus
              />
            </div>
            <Select value={selectedContentType} onValueChange={handleContentTypeChange}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Searching...</span>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Search Error</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
                {selectedContentType !== 'all' && ` in ${getContentTypeLabel(selectedContentType)}`}
              </p>
            </div>

            <div className="grid gap-4">
              {results.map((result, index) => (
                <SearchResultCard key={`${result.content_type}-${result.id}-${index}`} result={result} />
              ))}
            </div>
          </div>
        )}

        {!loading && !error && query && results.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search query or content type filter
            </p>
          </div>
        )}

        {!loading && !query && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">Start searching</h3>
            <p className="text-muted-foreground">
              Enter a search query to find relevant content
            </p>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {CONTENT_TYPES.slice(1).map((type) => (
                <Button
                  key={type.value}
                  variant="outline"
                  onClick={() => setSelectedContentType(type.value)}
                  className="h-auto py-3"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{getContentTypeIcon(type.value)}</div>
                    <div className="text-sm">{type.label}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchResultCard({ result }: { result: SearchResult }) {
  const contentTypeLabel = getContentTypeLabel(result.content_type);
  const contentTypeIcon = getContentTypeIcon(result.content_type);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {contentTypeIcon} {contentTypeLabel}
                </Badge>
                {result.category && (
                  <Badge variant="outline" className="text-xs">
                    {result.category}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs ml-auto">
                  {(result.similarity * 100).toFixed(0)}% match
                </Badge>
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">
                <Link href={result.url} className="flex items-center gap-2">
                  {result.title}
                  <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </CardTitle>
            </div>
          </div>
          {(result.excerpt || result.description) && (
            <CardDescription className="line-clamp-2 mt-2">
              {result.excerpt || result.description}
            </CardDescription>
          )}
        </CardHeader>
        {result.tags && result.tags.length > 0 && (
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.tags.slice(0, 5).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {result.tags.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{result.tags.length - 5} more
                </Badge>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}
