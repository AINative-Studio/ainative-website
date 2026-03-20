
'use client';
import React from "react";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, Sparkles, ExternalLink, Github, AlertCircle, Filter, Video } from 'lucide-react';
import { getShowcases } from '@/src/lib/strapi';
import { getUnsplashImageUrl } from '@/lib/unsplash';
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

const ShowcaseSkeleton = () => (
  <div className="bg-[#161B22] border border-white/5 rounded-xl overflow-hidden flex flex-col animate-pulse">
    <div className="aspect-video bg-[#21262D]" />
    <div className="p-5 flex-1 space-y-3">
      <div className="h-3 w-28 bg-[#21262D] rounded" />
      <div className="h-5 w-full bg-[#21262D] rounded" />
      <div className="h-16 w-full bg-[#21262D] rounded" />
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-[#21262D] rounded-full" />
        <div className="h-5 w-20 bg-[#21262D] rounded-full" />
        <div className="h-5 w-16 bg-[#21262D] rounded-full" />
      </div>
    </div>
    <div className="px-5 pb-5 pt-0 flex gap-2">
      <div className="h-9 flex-1 bg-[#21262D] rounded-lg" />
      <div className="h-9 flex-1 bg-[#21262D] rounded-lg" />
    </div>
  </div>
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
    <div className="min-h-screen bg-[#0D1117]">
      <main className="container mx-auto px-4 py-20 mt-16">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white/5 border border-white/5 text-gray-400 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4 mr-2 text-[#4B6FED]" />
            Community Showcase
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Built with{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4B6FED] to-[#7B9FFF]">
              AINative
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Discover inspiring projects from our developer community
          </p>
        </motion.div>

        {/* Error state */}
        {error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-red-300">{error}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Please check your connection and try again.
                  </p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 text-sm border border-white/5 text-gray-400 hover:text-white hover:bg-[#161B22] rounded-lg transition-all"
                >
                  Retry
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search & Filters */}
        {!error && (
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder={
                    searchMode === 'semantic'
                      ? 'Search with AI (semantic search)...'
                      : 'Search showcases...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isLoading || searchingSemantics}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#0D1117] border border-white/5 text-gray-300 placeholder-gray-600 rounded-lg text-sm focus:outline-none focus:border-[#4B6FED]/40 focus:ring-1 focus:ring-[#4B6FED]/20 transition-all disabled:opacity-50"
                />
                {searchingSemantics && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-[#4B6FED] border-t-transparent rounded-full" />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSearchMode('exact')}
                  className={`inline-flex items-center px-3 py-2 text-sm rounded-lg border transition-all whitespace-nowrap ${
                    searchMode === 'exact'
                      ? 'bg-[#4B6FED] border-[#4B6FED] text-white'
                      : 'bg-transparent border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  <Search className="h-4 w-4 mr-1.5" />
                  Exact Match
                </button>
                <button
                  onClick={() => setSearchMode('semantic')}
                  className={`inline-flex items-center px-3 py-2 text-sm rounded-lg border transition-all whitespace-nowrap ${
                    searchMode === 'semantic'
                      ? 'bg-[#4B6FED] border-[#4B6FED] text-white'
                      : 'bg-transparent border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Semantic
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap gap-2 flex-1">
                <span className="text-sm text-gray-500 flex items-center mr-1">
                  <Filter className="h-4 w-4 mr-1" />
                  Tech Stack:
                </span>
                {techFilters.slice(0, 8).map(tech => (
                  <button
                    key={tech}
                    onClick={() => setSelectedTech(tech)}
                    disabled={isLoading}
                    className={`px-3 py-1 text-xs rounded-lg border transition-all disabled:opacity-50 ${
                      selectedTech === tech
                        ? 'bg-[#4B6FED] border-[#4B6FED] text-white'
                        : 'bg-transparent border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="video-only"
                  checked={showVideoOnly}
                  onCheckedChange={setShowVideoOnly}
                />
                <Label htmlFor="video-only" className="text-sm text-gray-400 flex items-center gap-1 cursor-pointer">
                  <Video className="h-4 w-4" />
                  Video Only
                </Label>
              </div>
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <ShowcaseSkeleton />
              </motion.div>
            ))}
          </div>
        )}

        {/* Showcase cards grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredShowcases.map((showcase, index) => (
              <motion.div
                key={showcase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Link
                  href={`/showcases/${showcase.slug || showcase.id}`}
                  className="group block h-full bg-[#161B22] border border-white/5 rounded-xl overflow-hidden flex flex-col hover:border-[#4B6FED]/30 transition-all shadow-sm shadow-black/20"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video relative overflow-hidden bg-[#0D1117]">
                    <img
                      src={showcase.video_thumbnail || getUnsplashImageUrl(showcase.id, 800, 450)}
                      alt={showcase.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {showcase.featured && (
                      <span className="absolute top-2 right-2 inline-flex items-center px-2 py-0.5 text-xs font-medium bg-yellow-500/90 text-black rounded-full z-10">
                        <Sparkles className="h-3 w-3 mr-1" />Featured
                      </span>
                    )}
                    {showcase.video_url && (
                      <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 text-xs font-medium bg-[#4B6FED]/90 text-white rounded-full z-10">
                        <Video className="h-3 w-3 mr-1" />Video
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">
                        {showcase.company_name}{showcase.developer_name ? ` • ${showcase.developer_name}` : ''}
                      </span>
                      {searchMode === 'semantic' && showcase._similarity ? (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs bg-white/5 border border-white/5 text-gray-400 rounded-full">
                          <Sparkles className="h-3 w-3 mr-1" />
                          {Math.round(showcase._similarity * 100)}%
                        </span>
                      ) : null}
                    </div>

                    <h3 className="text-base font-semibold text-white mb-2 leading-snug">
                      {showcase.title}
                    </h3>

                    <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">
                      {showcase.description}
                    </p>

                    {/* Tech stack badges */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {showcase.tech_stack.slice(0, 4).map((tech, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2 py-0.5 text-xs bg-white/5 border border-white/5 text-gray-400 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                      {showcase.tech_stack.length > 4 && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs bg-white/5 border border-white/5 text-gray-400 rounded-full">
                          +{showcase.tech_stack.length - 4}
                        </span>
                      )}
                    </div>

                    {showcase.results && (
                      <p className="text-xs font-medium text-[#4B6FED] mb-3 line-clamp-1">
                        Results: {showcase.results}
                      </p>
                    )}

                    {/* Action buttons */}
                    {(showcase.demo_url || showcase.github_url) && (
                      <div className="flex gap-2 mt-auto pt-1">
                        {showcase.demo_url && (
                          <a
                            href={showcase.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs border border-white/5 text-gray-400 hover:text-white hover:bg-[#21262D] hover:border-white/10 rounded-lg transition-all"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />Demo
                          </a>
                        )}
                        {showcase.github_url && (
                          <a
                            href={showcase.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs border border-white/5 text-gray-400 hover:text-white hover:bg-[#21262D] hover:border-white/10 rounded-lg transition-all"
                          >
                            <Github className="h-3.5 w-3.5" />Code
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state - no showcases at all */}
        {!isLoading && !error && filteredShowcases.length === 0 && showcases.length === 0 && (
          <div className="text-center py-16">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-medium text-white mb-2">No showcases yet</h3>
            <p className="text-gray-500 mb-6">Be the first to share your AINative project!</p>
            <button className="inline-flex items-center px-4 py-2 bg-[#4B6FED] hover:bg-[#3A56D3] text-white text-sm font-medium rounded-lg transition-all">
              Submit Your Project
            </button>
          </div>
        )}

        {/* Empty state - search returned nothing */}
        {!isLoading && !error && filteredShowcases.length === 0 && showcases.length > 0 && (
          <div className="text-center py-16">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-medium text-white mb-2">No showcases found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedTech('All'); }}
              className="inline-flex items-center px-4 py-2 border border-white/5 text-gray-400 hover:text-white hover:bg-[#161B22] text-sm rounded-lg transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
