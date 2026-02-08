/**
 * Preview Component Type Definitions
 *
 * This file contains type definitions for the preview component system.
 * These types extend the base PlaygroundResult interface with media-specific
 * discriminated unions for type-safe preview rendering.
 *
 * Related: Issue #546 - Add example prompts to model playground pages
 * Architecture: /docs/architecture/PREVIEW_COMPONENTS_ARCHITECTURE.md
 */

import { ModelCategory } from './types';

/**
 * Media type discriminator based on model category
 */
export type MediaType = 'text' | 'code' | 'image' | 'video' | 'audio' | 'embedding';

/**
 * Base result interface with common fields shared by all preview types
 */
interface BasePlaygroundResult {
  latency_ms?: number;
  tokens_used?: number;
  cost_credits?: number;
  error?: string;
  model_category: ModelCategory;
}

/**
 * Text result (chat models, general text generation)
 *
 * Used by: GPT-3.5 Turbo, GPT-4, Claude 3.5 Sonnet
 *
 * @example
 * {
 *   type: 'text',
 *   output: 'The capital of France is Paris.',
 *   streaming: false,
 *   latency_ms: 234,
 *   tokens_used: 15,
 *   cost_credits: 1
 * }
 */
export interface TextResult extends BasePlaygroundResult {
  type: 'text';
  output: string;
  streaming?: boolean;
}

/**
 * Code result (coding models with syntax highlighting)
 *
 * Used by: NousCoder, Claude Code, GPT-4 (coding mode)
 *
 * @example
 * {
 *   type: 'code',
 *   output: 'def hello():\n    print("Hello, World!")',
 *   language: 'python',
 *   latency_ms: 567,
 *   tokens_used: 23,
 *   cost_credits: 2
 * }
 */
export interface CodeResult extends BasePlaygroundResult {
  type: 'code';
  output: string;
  language?: string; // Auto-detected or API-provided
  highlighted_html?: string; // Optional: Pre-rendered HTML for performance
}

/**
 * Image result (image generation/editing models)
 *
 * Used by: Qwen Image Edit, DALL-E, Stable Diffusion
 *
 * @example
 * {
 *   type: 'image',
 *   url: 'https://cdn.ainative.studio/outputs/abc123.png',
 *   width: 2048,
 *   height: 2048,
 *   format: 'png',
 *   alt_text: 'A serene mountain landscape at sunset',
 *   latency_ms: 3421,
 *   cost_credits: 25
 * }
 */
export interface ImageResult extends BasePlaygroundResult {
  type: 'image';
  url: string;
  width?: number;
  height?: number;
  format?: 'png' | 'jpg' | 'webp' | 'gif';
  alt_text?: string;
}

/**
 * Video result (video generation models)
 *
 * Used by: Sora2, CogVideoX-2B, Seedance I2V, Alibaba Wan 2.2
 *
 * @example
 * {
 *   type: 'video',
 *   url: 'https://cdn.ainative.studio/outputs/xyz456.mp4',
 *   duration_seconds: 5.2,
 *   width: 1280,
 *   height: 720,
 *   format: 'mp4',
 *   thumbnail_url: 'https://cdn.ainative.studio/outputs/xyz456_thumb.jpg',
 *   supports_streaming: true,
 *   latency_ms: 8932,
 *   cost_credits: 50
 * }
 */
export interface VideoResult extends BasePlaygroundResult {
  type: 'video';
  url: string;
  duration_seconds?: number;
  width?: number;
  height?: number;
  format?: 'mp4' | 'webm' | 'mov';
  thumbnail_url?: string;
  supports_streaming?: boolean; // True if HLS/DASH available
}

/**
 * Audio result (text-to-speech and speech-to-text models)
 *
 * Used by: OpenAI TTS, Whisper, Whisper Translation
 *
 * @example TTS
 * {
 *   type: 'audio',
 *   url: 'https://cdn.ainative.studio/outputs/tts789.mp3',
 *   duration_seconds: 12.8,
 *   format: 'mp3',
 *   latency_ms: 1234,
 *   cost_credits: 5
 * }
 *
 * @example Whisper (transcription)
 * {
 *   type: 'audio',
 *   url: 'https://cdn.ainative.studio/uploads/input.mp3',
 *   transcript: 'This is the transcribed text from the audio file.',
 *   duration_seconds: 45.6,
 *   latency_ms: 2341,
 *   cost_credits: 3
 * }
 */
export interface AudioResult extends BasePlaygroundResult {
  type: 'audio';
  url: string;
  duration_seconds?: number;
  format?: 'mp3' | 'wav' | 'opus' | 'ogg';
  waveform_data?: number[]; // Optional: Array of amplitude values for visualization
  transcript?: string; // For Whisper transcription results
}

/**
 * Embedding result (vector embedding models)
 *
 * Used by: BGE Large, BGE Base, BGE Small
 *
 * @example
 * {
 *   type: 'embedding',
 *   embeddings: [[0.123, -0.456, 0.789, ...], [0.234, -0.567, 0.890, ...]],
 *   dimensions: 1024,
 *   normalized: true,
 *   input_texts: ['First sentence to embed', 'Second sentence to embed'],
 *   latency_ms: 123,
 *   cost_credits: 1
 * }
 */
export interface EmbeddingResult extends BasePlaygroundResult {
  type: 'embedding';
  embeddings: number[][]; // Array of vectors
  dimensions: number; // Vector dimensionality (e.g., 768, 1024, 1536)
  normalized?: boolean; // Whether vectors are normalized
  input_texts: string[]; // Original input texts
}

/**
 * Discriminated union of all result types
 *
 * This enables type-safe switching and exhaustiveness checking in TypeScript.
 * Each result type is distinguished by its 'type' field.
 *
 * @example Type narrowing
 * function handleResult(result: PlaygroundResult) {
 *   switch (result.type) {
 *     case 'video':
 *       // TypeScript knows result is VideoResult here
 *       console.log(result.url, result.duration_seconds);
 *       break;
 *     case 'code':
 *       // TypeScript knows result is CodeResult here
 *       console.log(result.output, result.language);
 *       break;
 *     // ... other cases
 *   }
 * }
 */
export type PlaygroundResult =
  | TextResult
  | CodeResult
  | ImageResult
  | VideoResult
  | AudioResult
  | EmbeddingResult;

/**
 * Preview component props interfaces
 */

export interface PreviewContainerProps {
  result: PlaygroundResult;
  children: React.ReactNode;
  showDownload?: boolean;
  showCopy?: boolean;
  onDownload?: () => void;
  customActions?: React.ReactNode;
}

export interface PreviewSelectorProps {
  result: PlaygroundResult;
  onDownload?: () => void;
  onCopy?: () => void;
}

export interface TextPreviewProps {
  result: TextResult;
  onCopy?: () => void;
}

export interface CodePreviewProps {
  result: CodeResult;
  onCopy?: () => void;
}

export interface ImagePreviewProps {
  result: ImageResult;
  onDownload?: () => void;
}

export interface VideoPreviewProps {
  result: VideoResult;
  onDownload?: () => void;
}

export interface AudioPreviewProps {
  result: AudioResult;
  onDownload?: () => void;
}

export interface EmbeddingPreviewProps {
  result: EmbeddingResult;
  onCopy?: () => void;
}

/**
 * Helper type guards for runtime type checking
 */

export function isTextResult(result: PlaygroundResult): result is TextResult {
  return result.type === 'text';
}

export function isCodeResult(result: PlaygroundResult): result is CodeResult {
  return result.type === 'code';
}

export function isImageResult(result: PlaygroundResult): result is ImageResult {
  return result.type === 'image';
}

export function isVideoResult(result: PlaygroundResult): result is VideoResult {
  return result.type === 'video';
}

export function isAudioResult(result: PlaygroundResult): result is AudioResult {
  return result.type === 'audio';
}

export function isEmbeddingResult(result: PlaygroundResult): result is EmbeddingResult {
  return result.type === 'embedding';
}

/**
 * Utility function to detect programming language from code content
 *
 * Uses simple heuristics to detect common languages.
 * Falls back to 'text' if language cannot be determined.
 *
 * @param code - The code string to analyze
 * @returns Language identifier for syntax highlighting
 */
export function detectLanguage(code: string): string {
  if (!code) return 'text';

  // Python
  if (/^\s*def\s+\w+\s*\(|^\s*class\s+\w+|^\s*import\s+\w+|^\s*from\s+\w+\s+import/.test(code)) {
    return 'python';
  }

  // JavaScript/TypeScript
  if (/^\s*function\s+\w+|^\s*const\s+\w+\s*=|^\s*let\s+\w+\s*=|^\s*import\s+.*from/.test(code)) {
    if (code.includes(': ') && (code.includes('interface ') || code.includes('type '))) {
      return 'typescript';
    }
    return 'javascript';
  }

  // Java
  if (/^\s*public\s+class|^\s*private\s+\w+|^\s*package\s+\w+/.test(code)) {
    return 'java';
  }

  // C/C++
  if (/^#include\s*<|^\s*int\s+main\s*\(|^\s*void\s+\w+\s*\(/.test(code)) {
    return code.includes('cout') || code.includes('std::') ? 'cpp' : 'c';
  }

  // Go
  if (/^\s*func\s+\w+|^\s*package\s+main|^\s*import\s+\(/.test(code)) {
    return 'go';
  }

  // Rust
  if (/^\s*fn\s+\w+|^\s*let\s+mut\s+|^\s*use\s+\w+/.test(code)) {
    return 'rust';
  }

  // Ruby
  if (/^\s*def\s+\w+|^\s*class\s+\w+|^\s*require\s+/.test(code)) {
    return 'ruby';
  }

  // PHP
  if (code.includes('<?php') || /^\s*function\s+\w+\s*\(.*\)\s*{/.test(code)) {
    return 'php';
  }

  // SQL
  if (/^\s*SELECT\s+|^\s*INSERT\s+|^\s*UPDATE\s+|^\s*DELETE\s+|^\s*CREATE\s+/i.test(code)) {
    return 'sql';
  }

  // Shell/Bash
  if (/^#!\/bin\/(ba)?sh|^\s*echo\s+|^\s*export\s+/.test(code)) {
    return 'bash';
  }

  // HTML
  if (/^<!DOCTYPE|^<html|^<div|^<script/.test(code)) {
    return 'html';
  }

  // CSS
  if (/^\s*\.[\w-]+\s*{|^\s*#[\w-]+\s*{|^\s*@media/.test(code)) {
    return 'css';
  }

  // JSON
  if (/^\s*{[\s\S]*}|^\s*\[[\s\S]*\]/.test(code.trim())) {
    try {
      JSON.parse(code);
      return 'json';
    } catch {
      // Not valid JSON, continue checking
    }
  }

  // Markdown
  if (/^#\s+\w+|^\*\*\w+\*\*|^\[.*\]\(.*\)/.test(code)) {
    return 'markdown';
  }

  // Default fallback
  return 'text';
}

/**
 * Transform API response to typed PlaygroundResult
 *
 * Converts raw API responses from different model providers into
 * type-safe PlaygroundResult objects based on model category.
 *
 * @param apiResponse - Raw API response from model endpoint
 * @param modelCategory - Category of the model (from UnifiedAIModel)
 * @returns Typed PlaygroundResult with appropriate media type
 *
 * @example
 * const apiData = await fetch('/api/models/sora2/run', { ... });
 * const result = transformToPlaygroundResult(apiData, 'Video');
 * // result.type === 'video'
 */
export function transformToPlaygroundResult(
  apiResponse: Record<string, unknown>,
  modelCategory: ModelCategory
): PlaygroundResult {
  console.log('🔧 [Transform] Starting transformation for category:', modelCategory);
  console.log('🔧 [Transform] Input data:', apiResponse);

  const base = {
    latency_ms: apiResponse.latency_ms as number | undefined,
    tokens_used: apiResponse.tokens_used as number | undefined,
    cost_credits: (apiResponse.cost_credits || apiResponse.credits_used) as number | undefined,
    error: apiResponse.error as string | undefined,
    model_category: modelCategory,
  };

  console.log('🔧 [Transform] Base properties:', base);

  switch (modelCategory) {
    case 'Video':
      // Handle base64-encoded video from backend
      const videoBase64 = apiResponse.video_base64 as string | undefined;
      const videoUrl = apiResponse.video_url as string | undefined;
      const videoFormat = (apiResponse.format as 'mp4' | 'webm' | 'mov') || 'mp4';

      return {
        ...base,
        type: 'video',
        url: videoBase64
          ? `data:video/${videoFormat};base64,${videoBase64}`
          : videoUrl || '',
        duration_seconds: (apiResponse.duration_s || apiResponse.duration) as number | undefined,
        width: apiResponse.width as number | undefined,
        height: apiResponse.height as number | undefined,
        format: videoFormat,
        thumbnail_url: apiResponse.thumbnail_url as string | undefined,
        supports_streaming: apiResponse.supports_streaming as boolean | undefined,
      };

    case 'Audio':
      // Handle base64-encoded audio from backend
      const audioBase64 = apiResponse.audio_base64 as string | undefined;
      const audioUrl = apiResponse.audio_url as string | undefined;
      const audioFormat = (apiResponse.format as 'mp3' | 'wav' | 'opus' | 'ogg') || 'mp3';
      const durationMs = apiResponse.duration_ms as number | undefined;
      const duration = apiResponse.duration as number | undefined;

      console.log('🔧 [Transform Audio] audioBase64 exists:', !!audioBase64);
      console.log('🔧 [Transform Audio] audioBase64 length:', audioBase64?.length);
      console.log('🔧 [Transform Audio] audioUrl:', audioUrl);
      console.log('🔧 [Transform Audio] format:', audioFormat);
      console.log('🔧 [Transform Audio] duration_ms:', durationMs);
      console.log('🔧 [Transform Audio] duration:', duration);

      const audioResult = {
        ...base,
        type: 'audio' as const,
        url: audioBase64
          ? `data:audio/${audioFormat};base64,${audioBase64}`
          : (audioUrl || ''),
        duration_seconds: durationMs ? durationMs / 1000 : duration,
        format: audioFormat,
        waveform_data: apiResponse.waveform_data as number[] | undefined,
        transcript: apiResponse.transcript as string | undefined,
      };

      console.log('🔧 [Transform Audio] Final result URL:', audioResult.url.substring(0, 100) + '...');
      console.log('🔧 [Transform Audio] Final result:', audioResult);

      return audioResult;

    case 'Image':
      // Handle base64-encoded image from backend
      const imageBase64 = apiResponse.image_base64 as string | undefined;
      const imageUrl = apiResponse.image_url as string | undefined;
      const imageFormat = (apiResponse.format as 'png' | 'jpg' | 'webp' | 'gif') || 'png';

      return {
        ...base,
        type: 'image',
        url: imageBase64
          ? `data:image/${imageFormat};base64,${imageBase64}`
          : imageUrl || '',
        width: apiResponse.width as number | undefined,
        height: apiResponse.height as number | undefined,
        format: imageFormat,
        alt_text: apiResponse.alt_text as string | undefined,
      };

    case 'Coding':
      const codeOutput = (apiResponse.code || apiResponse.output) as string;
      return {
        ...base,
        type: 'code',
        output: codeOutput,
        language: (apiResponse.language as string) || detectLanguage(codeOutput),
        highlighted_html: apiResponse.highlighted_html as string | undefined,
      };

    case 'Embedding':
      return {
        ...base,
        type: 'embedding',
        embeddings: apiResponse.embeddings as number[][],
        dimensions: (apiResponse.embeddings as number[][])[0]?.length || 0,
        normalized: apiResponse.normalized as boolean | undefined,
        input_texts: apiResponse.input_texts as string[],
      };

    default:
      // 'All' or unknown categories default to text
      return {
        ...base,
        type: 'text',
        output: (apiResponse.output || apiResponse.text) as string,
        streaming: apiResponse.streaming as boolean | undefined,
      };
  }
}
