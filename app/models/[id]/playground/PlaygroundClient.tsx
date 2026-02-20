'use client';

/**
 * PlaygroundClient Component
 * Main client component for the AI Model Playground
 *
 * Layout (matches screenshot):
 * - Top: Model header with breadcrumb navigation
 * - Category tabs: All, Image, Video, Audio, Coding, Embedding
 * - Sub-tabs: Playground, API, Readme
 * - Split view: Input panel (left 35%) + Result panel (right 65%)
 *
 * Refs #238, #241
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Types
interface ModelData {
  id: string;
  name: string;
  description: string;
  provider: string;
  model_id: string;
  capabilities: string[];
  preview_thumbnail_url?: string;
  preview?: {
    media_url: string;
    thumbnail_url: string;
    prompt: string;
    parameters: {
      image_url?: string;
      duration?: number;
      negative_prompt?: string;
      num_inference_steps?: number;
      guidance?: number;
      size?: string;
      flow_shift?: number;
      seed?: number;
    };
  };
}

interface PlaygroundClientProps {
  modelId: string;
}

// Fetch model data
async function fetchModelData(modelId: string): Promise<ModelData> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ainative.studio';
  const response = await fetch(`${API_BASE_URL}/v1/public/ai-registry/models/${modelId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch model data');
  }

  return response.json();
}

export default function PlaygroundClient({ modelId }: PlaygroundClientProps) {
  const [activeTab, setActiveTab] = useState<'playground' | 'api' | 'readme'>('playground');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [resultTab, setResultTab] = useState<'preview' | 'json'>('preview');

  // Form state (pre-populated from preview_data)
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [duration, setDuration] = useState<number>(8);
  const [imageUrl, setImageUrl] = useState('');
  const [showRequestLogs, setShowRequestLogs] = useState(false);
  const [showAdditionalSettings, setShowAdditionalSettings] = useState(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMedia, setGeneratedMedia] = useState<string | null>(null);

  // Fetch model data
  const { data: modelData, isLoading, error, refetch } = useQuery({
    queryKey: ['model', modelId],
    queryFn: () => fetchModelData(modelId),
    staleTime: 5 * 60 * 1000,
  });

  // Pre-populate form when model data loads
  useEffect(() => {
    if (modelData?.preview) {
      setPrompt(modelData.preview.prompt || '');
      setNegativePrompt(modelData.preview.parameters.negative_prompt || '');
      setDuration(modelData.preview.parameters.duration || 8);
      setImageUrl(modelData.preview.parameters.image_url || '');
    }
  }, [modelData]);

  // Categories for top nav
  const categories = ['All', 'Image', 'Video', 'Audio', 'Coding', 'Embedding'];

  // Duration options with pricing
  const durationOptions = [
    { value: 5, price: 0.30 },
    { value: 8, price: 0.48 },
    { value: 10, price: 0.60 },
    { value: 15, price: 0.70 },
  ];

  // Handle reset - restore preview data values
  const handleReset = () => {
    if (modelData?.preview) {
      setPrompt(modelData.preview.prompt || '');
      setNegativePrompt(modelData.preview.parameters.negative_prompt || '');
      setDuration(modelData.preview.parameters.duration || 8);
      setImageUrl(modelData.preview.parameters.image_url || '');
      setGeneratedMedia(null);
    }
  };

  // Handle run - generate new media
  const handleRun = async () => {
    setIsGenerating(true);
    // TODO: Implement API call for generation
    // For now, just simulate loading
    setTimeout(() => {
      setIsGenerating(false);
      // Keep showing preview for now
    }, 2000);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-vite-bg">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error || !modelData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-vite-bg px-4">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-100 mb-2">Error Loading Model</h2>
        <p className="text-gray-400 mb-6">Failed to load model data. Please try again.</p>
        <Button onClick={() => refetch()} variant="default">
          Try Again
        </Button>
      </div>
    );
  }

  // Get current media URL (preview or generated)
  const currentMediaUrl = generatedMedia || modelData.preview?.media_url || '';

  return (
    <div className="min-h-screen bg-vite-bg text-white">
      {/* Breadcrumb Header */}
      <div className="border-b border-white/5 bg-surface-primary/50">
        <div className="px-6 py-3">
          <div className="text-sm text-gray-400">
            <span className="hover:text-primary cursor-pointer transition-colors">Hub</span>
            <span className="mx-2">›</span>
            <span className="text-gray-300">{modelData.provider} / {modelData.model_id}</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-white/5 bg-surface-primary/50">
        <div className="px-6">
          <div className="flex gap-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`py-3 text-sm font-medium border-b-2 -mb-[1px] transition-colors ${
                  activeCategory === category
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Model Header and Sub-tabs */}
      <div className="border-b border-white/5 bg-surface-primary/50">
        <div className="px-6 py-5">
          <h1 className="text-2xl font-semibold text-white mb-1">{modelData.name}</h1>
          <p className="text-gray-400 text-sm">{modelData.description}</p>
        </div>

        {/* Sub-tabs: Playground, API, Readme */}
        <div className="px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('playground')}
              className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 -mb-[1px] transition-colors ${
                activeTab === 'playground'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Playground
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 -mb-[1px] transition-colors ${
                activeTab === 'api'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              API
            </button>
            <button
              onClick={() => setActiveTab('readme')}
              className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 -mb-[1px] transition-colors ${
                activeTab === 'readme'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Readme
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Split View */}
      {activeTab === 'playground' && (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-250px)]">
          {/* Left Panel - Input (40%) */}
          <div className="w-full lg:w-[40%] bg-surface-primary/30 overflow-y-auto">
            <div className="p-6 space-y-5">
              {/* Request Logs Toggle */}
              <div>
                <button
                  onClick={() => setShowRequestLogs(!showRequestLogs)}
                  className="flex items-center justify-between w-full text-sm font-medium text-gray-300 hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Request logs
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform ${showRequestLogs ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showRequestLogs && (
                  <div className="mt-3 p-3 bg-surface-accent/30 rounded text-xs text-gray-400">
                    No requests yet. Click "Run" to generate.
                  </div>
                )}
              </div>

              {/* Prompt Field */}
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
                  Prompt
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-surface-secondary rounded-md text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                  placeholder="Enter your prompt..."
                />
                <div className="text-xs text-gray-500 mt-1">{prompt.length} characters</div>
              </div>

              {/* Negative Prompt */}
              <div>
                <label htmlFor="negative-prompt" className="block text-sm font-medium text-gray-300 mb-2">
                  Negative prompt
                </label>
                <textarea
                  id="negative-prompt"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-surface-secondary rounded-md text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                  placeholder="Optional negative prompt..."
                />
              </div>

              {/* Duration Selector (for video models) */}
              {modelData.capabilities?.some(cap => cap.toLowerCase().includes('video')) && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration
                  </label>
                  <div className="flex gap-2">
                    {durationOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setDuration(option.value)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          duration === option.value
                            ? 'bg-primary text-white'
                            : 'bg-surface-secondary text-gray-300 hover:bg-surface-accent'
                        }`}
                      >
                        {option.value}s
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Upload (for I2V models) */}
              {imageUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image
                  </label>
                  <div className="space-y-3">
                    {/* Thumbnail Preview */}
                    <div className="relative w-24 h-24 rounded overflow-hidden">
                      <img
                        src={imageUrl}
                        alt="Input image"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* URL Input */}
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-secondary rounded-md text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="https://image.ainative.studio/asset/..."
                    />
                    <div className="text-xs text-gray-500">
                      .jpeg, .jpg, .png up to 16MB; single file
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Settings */}
              <div>
                <button
                  onClick={() => setShowAdditionalSettings(!showAdditionalSettings)}
                  className="flex items-center justify-between w-full text-sm font-medium text-gray-300 hover:text-white"
                >
                  Additional settings
                  <svg
                    className={`w-4 h-4 transition-transform ${showAdditionalSettings ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showAdditionalSettings && (
                  <div className="mt-3 p-4 bg-surface-accent/30 rounded space-y-3">
                    <div className="text-xs text-gray-400">
                      Advanced parameters available in next update
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing Display */}
              <div className="text-xs text-gray-400">
                {durationOptions.map((opt, idx) => (
                  <span key={opt.value}>
                    {opt.value}s ${opt.price.toFixed(2)}
                    {idx < durationOptions.length - 1 ? ', ' : ' per request'}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1"
                  disabled={isGenerating}
                >
                  Reset
                </Button>
                <Button
                  onClick={handleRun}
                  variant="default"
                  className="flex-1"
                  disabled={isGenerating || !prompt}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Run'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel - Result (60%) */}
          <div className="w-full lg:w-[60%] bg-surface-primary/30 overflow-y-auto">
            <div className="p-6">
              {/* Result Tabs */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-4">
                  <button
                    onClick={() => setResultTab('preview')}
                    className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                      resultTab === 'preview'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    ► Preview
                  </button>
                  <button
                    onClick={() => setResultTab('json')}
                    className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                      resultTab === 'json'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    JSON
                  </button>
                </div>
                {currentMediaUrl && resultTab === 'preview' && (
                  <button className="text-sm text-primary hover:text-primary/80 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download video
                  </button>
                )}
              </div>

              {/* Media Player */}
              {resultTab === 'preview' && currentMediaUrl && (
                <div className="bg-black rounded-lg overflow-hidden">
                  <video
                    src={currentMediaUrl}
                    controls
                    className="w-full h-auto"
                    style={{ maxHeight: '600px' }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {/* JSON View */}
              {resultTab === 'json' && (
                <div className="bg-surface-accent/30 rounded-lg p-4">
                  <pre className="text-xs text-gray-300 overflow-x-auto">
                    {JSON.stringify(modelData.preview || {}, null, 2)}
                  </pre>
                </div>
              )}

              {/* Empty State */}
              {!currentMediaUrl && (
                <div className="bg-surface-accent/30 rounded-lg p-12 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-400">Click "Run" to generate media</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* API Tab Content (placeholder) */}
      {activeTab === 'api' && (
        <div className="p-6">
          <div className="bg-surface-secondary/50 rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-200 mb-2">API Documentation</h3>
            <p className="text-gray-400">Coming soon</p>
          </div>
        </div>
      )}

      {/* Readme Tab Content (placeholder) */}
      {activeTab === 'readme' && (
        <div className="p-6">
          <div className="bg-surface-secondary/50 rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-200 mb-2">Model README</h3>
            <p className="text-gray-400">Coming soon</p>
          </div>
        </div>
      )}
    </div>
  );
}
