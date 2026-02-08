'use client';

import { useState, Component, ReactNode, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Play,
  RotateCcw,
  Download,
  Copy,
  Check,
  ChevronDown,
  FileText,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { PlaygroundProps, PlaygroundFormState } from '../types';
import { PlaygroundResult, transformToPlaygroundResult } from '../types.preview';
import { PreviewSelector } from './preview';
import apiClient from '@/lib/api-client';

/**
 * Simple Error Boundary for Preview Components
 */
class PreviewErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Preview error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white/[0.02] border border-red-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="text-red-400 font-medium">Preview Error</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Failed to render preview. The result data may be in an unexpected format.
          </p>
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-400">Error details</summary>
            <pre className="mt-2 p-3 bg-black/20 rounded overflow-x-auto">
              {this.state.error?.message}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * LocalStorage key for user-generated audio by model ID
 */
const getUserAudioKey = (modelId: string) => `playground_audio_${modelId}`;

/**
 * Run status for the playground
 */
type RunStatus = 'idle' | 'running' | 'complete' | 'error';

/**
 * Result view modes
 */
type ResultView = 'preview' | 'json';

/**
 * Status colors for visual feedback
 */
const STATUS_COLORS: Record<RunStatus, string> = {
  idle: 'bg-blue-400',
  running: 'bg-yellow-400 animate-pulse',
  complete: 'bg-green-400',
  error: 'bg-red-400',
};

const STATUS_LABELS: Record<RunStatus, string> = {
  idle: 'Idle',
  running: 'Running',
  complete: 'Complete',
  error: 'Error',
};

/**
 * Model Playground Component
 *
 * This component provides an interactive UI for testing AI models.
 * It adapts to different model types (chat, image, video, audio, embedding).
 *
 * Features:
 * - Dynamic form based on model parameters
 * - Real-time API calls with loading states
 * - Result preview (text/image/video/audio)
 * - JSON response viewer
 * - Download results
 * - Advanced settings (collapsible)
 *
 * TODO: Implement model-specific UI variants:
 * - Chat models: Message history, streaming responses
 * - Image models: Image upload, size presets, style selectors
 * - Video models: Image upload, duration selector, advanced parameters
 * - Audio models: File upload, voice/language selectors
 * - Embedding models: Text input, normalization options
 */
export default function ModelPlayground({ model, slug }: PlaygroundProps) {
  // Form state
  const [formState, setFormState] = useState<PlaygroundFormState>({
    prompt: '',
    negative_prompt: '',
    max_tokens: model.max_tokens || 2048,
    temperature: 0.7,
    num_inference_steps: 40,
    guidance: 5,
    enable_safety_checker: true,
  });

  // Run state
  const [status, setStatus] = useState<RunStatus>('idle');
  const [result, setResult] = useState<PlaygroundResult | null>(null);
  const [resultView, setResultView] = useState<ResultView>('preview');
  const [copied, setCopied] = useState(false);

  /**
   * Load saved audio from localStorage on component mount
   * Only loads user-generated audio if it exists (TTS models only)
   */
  useEffect(() => {
    // Only load saved audio for TTS models
    const isTTSModel = model.category === 'Audio' && model.endpoint.includes('/tts');
    if (!isTTSModel) return;

    const savedAudio = localStorage.getItem(getUserAudioKey(model.id));
    if (savedAudio) {
      try {
        const parsed = JSON.parse(savedAudio);
        setResult(parsed);
        setStatus('complete');
        console.log('✅ Loaded saved audio from localStorage');
      } catch (error) {
        console.error('❌ Failed to parse saved audio:', error);
        // Clear corrupted data
        localStorage.removeItem(getUserAudioKey(model.id));
      }
    }
    // If no saved audio exists, user will see "Run a prompt to see results here"
  }, [model.id, model.category, model.endpoint]);

  /**
   * Run inference mutation
   *
   * Makes actual API call to model endpoint using apiClient
   */
  const runInference = useMutation({
    mutationFn: async (input: PlaygroundFormState) => {
      console.log('Running inference with:', input);
      console.log('Model endpoint:', model.endpoint, 'Method:', model.method);

      // Transform request payload based on model category
      let requestPayload: Record<string, unknown> = { ...input };

      // Audio TTS models expect { text, voice } instead of { prompt }
      if (model.category === 'Audio' && model.endpoint.includes('/tts')) {
        requestPayload = {
          text: input.prompt || '',
          voice: 'Wise_Woman', // Default voice profile
        };
      }

      // Media generation endpoints (TTS, image, video) can take longer than default 30s
      // Set timeout to 120 seconds for media endpoints
      const isMediaEndpoint = model.category === 'Audio' || model.category === 'Video' || model.category === 'Image';
      const timeout = isMediaEndpoint ? 120000 : 30000; // 120s for media, 30s for others

      console.log('⏱️ Request timeout set to:', timeout / 1000, 'seconds');

      // Call the appropriate API method based on model.method
      if (model.method === 'POST') {
        const response = await apiClient.post(model.endpoint, requestPayload, { timeout });
        return response.data;
      } else {
        const response = await apiClient.get(model.endpoint, { timeout });
        return response.data;
      }
    },
    onMutate: () => {
      setStatus('running');
      setResult(null);
    },
    onSuccess: (data) => {
      console.log('✅ API Response received:', data);
      console.log('📊 Response type:', typeof data);
      console.log('📋 Response keys:', Object.keys(data || {}));

      setStatus('complete');

      try {
        // Transform API response to typed PlaygroundResult
        console.log('🔄 Transforming response for category:', model.category);
        const playgroundResult = transformToPlaygroundResult(data as Record<string, unknown>, model.category);
        console.log('✨ Transformation complete:', playgroundResult);
        console.log('🎯 Result type:', playgroundResult.type);
        console.log('🔗 Result URL exists:', !!playgroundResult.url);
        if (playgroundResult.type === 'audio') {
          console.log('🎵 Audio URL:', playgroundResult.url?.substring(0, 100) + '...');
          console.log('🎵 Audio duration:', playgroundResult.duration_seconds);
          console.log('🎵 Audio format:', playgroundResult.format);

          // Save user-generated TTS audio to localStorage
          try {
            localStorage.setItem(getUserAudioKey(model.id), JSON.stringify(playgroundResult));
            console.log('💾 Saved user-generated audio to localStorage');
          } catch (storageError) {
            console.error('❌ Failed to save audio to localStorage:', storageError);
          }
        }

        setResult(playgroundResult);
        console.log('✅ Result set successfully');
      } catch (transformError) {
        console.error('❌ Transformation error:', transformError);
        console.error('❌ Error details:', {
          message: transformError instanceof Error ? transformError.message : 'Unknown error',
          stack: transformError instanceof Error ? transformError.stack : undefined,
        });

        // Fallback error result
        const errorResult = transformToPlaygroundResult(
          {
            error: transformError instanceof Error ? transformError.message : 'Transformation failed',
            output: 'Failed to transform API response',
          },
          model.category
        );
        setResult(errorResult);
      }
    },
    onError: (error: Error) => {
      console.error('❌ API Error:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);

      setStatus('error');
      // Create error result based on model category
      const errorResult = transformToPlaygroundResult(
        {
          error: error.message,
          output: error.message,
        },
        model.category
      );
      setResult(errorResult);
    },
  });

  /**
   * Handle form submission
   */
  const handleRun = () => {
    if (!formState.prompt?.trim()) return;
    runInference.mutate(formState);
  };

  /**
   * Reset form and results
   */
  const handleReset = () => {
    setFormState({
      prompt: '',
      negative_prompt: '',
      max_tokens: model.max_tokens || 2048,
      temperature: 0.7,
      num_inference_steps: 40,
      guidance: 5,
      enable_safety_checker: true,
    });
    setStatus('idle');
    setResult(null);
    setCopied(false);
  };

  /**
   * Copy text to clipboard
   */
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Update form field
   */
  const updateField = <K extends keyof PlaygroundFormState>(
    field: K,
    value: PlaygroundFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Handle using an example prompt (just populate textarea)
   */
  const handleUsePrompt = (prompt: string) => {
    updateField('prompt', prompt);
  };

  /**
   * Handle running an example prompt (populate and execute)
   */
  const handleRunPrompt = (prompt: string) => {
    updateField('prompt', prompt);
    // Wait for state update then run
    setTimeout(() => {
      const newFormState = { ...formState, prompt };
      runInference.mutate(newFormState);
    }, 0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Input */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Input</h2>
          <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
            <FileText className="w-3.5 h-3.5" />
            Request logs
          </button>
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Prompt</label>
          <textarea
            value={formState.prompt}
            onChange={(e) => updateField('prompt', e.target.value)}
            placeholder="Enter your prompt here..."
            rows={5}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none transition-colors"
          />
        </div>

        {/* Example Prompts Section */}
        {model.examplePrompts && model.examplePrompts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-medium text-gray-300">Example Prompts</h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {model.examplePrompts.map((prompt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="group relative bg-white/[0.02] border border-white/10 rounded-lg p-3 hover:bg-white/[0.05] hover:border-white/20 transition-all"
                >
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2 pr-2">
                    {prompt}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUsePrompt(prompt)}
                      disabled={status === 'running'}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-white/20 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={`Use example prompt: ${prompt.substring(0, 50)}...`}
                    >
                      <Copy className="w-3 h-3" />
                      Use This
                    </button>
                    <button
                      onClick={() => handleRunPrompt(prompt)}
                      disabled={status === 'running'}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary border border-primary/20 hover:border-primary/30 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={`Run example prompt: ${prompt.substring(0, 50)}...`}
                    >
                      <Play className="w-3 h-3" />
                      {status === 'running' ? 'Running...' : 'Run'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Negative Prompt (for image/video models) */}
        {(model.category === 'Image' || model.category === 'Video') && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Negative prompt</label>
            <input
              type="text"
              value={formState.negative_prompt}
              onChange={(e) => updateField('negative_prompt', e.target.value)}
              placeholder="What to avoid in the output"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>
        )}

        {/* Model-specific parameters */}
        {/* TODO: Render dynamic parameters based on model.parameters */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">Max Tokens</label>
          <p className="text-xs text-gray-500">Limit the response length</p>
          <div className="flex items-center gap-2">
            {[256, 512, 1024, 2048].map((val) => (
              <button
                key={val}
                onClick={() => updateField('max_tokens', val)}
                className={`px-3 py-1.5 text-xs border rounded-md transition-colors ${
                  formState.max_tokens === val
                    ? 'border-primary text-primary bg-primary/10'
                    : 'border-white/15 text-gray-400 hover:text-white hover:border-white/30'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Settings (Collapsible) */}
        <details className="group">
          <summary className="flex items-center justify-between w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-300 cursor-pointer hover:bg-white/[0.07] transition-colors">
            Additional settings
            <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="mt-2 p-4 bg-white/[0.02] border border-white/10 rounded-lg space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Temperature</span>
              <input
                type="number"
                value={formState.temperature}
                onChange={(e) => updateField('temperature', parseFloat(e.target.value))}
                min={0}
                max={2}
                step={0.1}
                className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-gray-300 text-right"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Guidance Scale</span>
              <input
                type="number"
                value={formState.guidance}
                onChange={(e) => updateField('guidance', parseFloat(e.target.value))}
                min={1}
                max={20}
                step={0.5}
                className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-gray-300 text-right"
              />
            </div>
          </div>
        </details>

        {/* Pricing Information */}
        {model.pricing && (
          <div className="bg-white/[0.02] border border-white/10 rounded-lg px-4 py-2.5 text-xs text-gray-500">
            Cost: {model.pricing.credits} credits (~${model.pricing.usd.toFixed(2)}){' '}
            {model.pricing.unit && `${model.pricing.unit}`}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleRun}
            disabled={!formState.prompt?.trim() || status === 'running'}
            className="gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            {status === 'running' ? 'Running...' : 'Run'}
          </Button>
        </div>
      </div>

      {/* Right Column - Result */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">Result</h2>
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`} />
              {STATUS_LABELS[status]}
            </span>
          </div>
          {result && (
            <button
              onClick={() =>
                handleCopy(
                  typeof result.output === 'string'
                    ? result.output
                    : JSON.stringify(result.output)
                )
              }
              className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Download result
            </button>
          )}
        </div>

        {/* Preview / JSON Toggle */}
        <div className="flex items-center gap-0 border-b border-white/10">
          <button
            onClick={() => setResultView('preview')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm border-b-2 transition-colors ${
              resultView === 'preview'
                ? 'border-primary text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Play className="w-3 h-3" />
            Preview
          </button>
          <button
            onClick={() => setResultView('json')}
            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
              resultView === 'json'
                ? 'border-primary text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            JSON
          </button>
        </div>

        {/* Result Display */}
        <div className="min-h-[400px]">
          {status === 'idle' && !result && (
            <div className="flex items-center justify-center h-[400px] bg-white/[0.02] border border-white/10 rounded-xl text-gray-500 text-sm">
              Run a prompt to see results here
            </div>
          )}

          {status === 'running' && (
            <div className="flex items-center justify-center h-[400px] bg-white/[0.02] border border-white/10 rounded-xl">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-gray-400">Running inference...</p>
              </div>
            </div>
          )}

          {result && resultView === 'preview' && (
            <AnimatePresence mode="wait">
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PreviewErrorBoundary>
                  <PreviewSelector result={result} />
                </PreviewErrorBoundary>
              </motion.div>
            </AnimatePresence>
          )}

          {result && resultView === 'json' && (
            <AnimatePresence mode="wait">
              <motion.div
                key="json"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white/[0.02] border border-white/10 rounded-xl p-5 relative"
              >
                <button
                  onClick={() => handleCopy(JSON.stringify(result, null, 2))}
                  className="absolute top-3 right-3 p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
                <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
