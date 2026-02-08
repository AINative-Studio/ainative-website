/**
 * Type definitions for AI Model Detail Pages
 *
 * These types extend the base AIModel interface from ai-registry-service.ts
 * with additional fields needed for the detail page UI.
 */

import { AIModel } from '@/lib/ai-registry-service';

/**
 * Tab types for model detail page
 */
export type TabType = 'playground' | 'api' | 'readme';

/**
 * Unified AI Model with additional detail page fields
 *
 * This extends the base AIModel interface with fields needed for
 * the detail page UI, including slug, pricing, thumbnails, and documentation.
 */
export interface UnifiedAIModel extends AIModel {
  // URL-friendly identifier (e.g., "gpt-4", "alibaba-wan-22-i2v-720p")
  slug: string;

  // Display information
  category: ModelCategory;
  description: string;
  thumbnail_url?: string;

  // Pricing information
  pricing?: ModelPricing;

  // Technical details
  endpoint: string;
  method: 'GET' | 'POST';
  parameters?: ModelParameter[];

  // Metadata
  is_premium?: boolean;
  speed?: string; // "Fast", "Medium", "Slow"
  quality?: string; // "Standard", "High", "Cinematic"

  // API Integration
  example_request?: string;
  example_response?: string;

  // Documentation
  readme?: string;
}

/**
 * Model category types
 */
export type ModelCategory = 'All' | 'Image' | 'Video' | 'Audio' | 'Coding' | 'Embedding';

/**
 * Pricing information for a model
 */
export interface ModelPricing {
  credits: number; // Cost in credits
  usd: number; // Approximate USD cost
  unit?: string; // "per image", "per 5s video", "per 1000 tokens", etc.
  tiers?: PricingTier[]; // Optional: different pricing for different durations/sizes
}

/**
 * Pricing tier for models with variable costs
 * (e.g., video models with different durations)
 */
export interface PricingTier {
  label: string; // "5s", "8s", "10s", etc.
  credits: number;
  usd: number;
}

/**
 * Model parameter definition
 */
export interface ModelParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  default?: unknown;
  description: string;
  min?: number;
  max?: number;
  options?: unknown[]; // For enum-like parameters
  placeholder?: string;
}

/**
 * Props for tab components
 */
export interface TabComponentProps {
  model: UnifiedAIModel;
  slug: string;
}

/**
 * Props for ModelPlayground component
 */
export interface PlaygroundProps extends TabComponentProps {
  onRun?: (result: PlaygroundResult) => void;
}

/**
 * Props for ModelAPI component
 */
export interface APIProps extends TabComponentProps {
  defaultFormat?: 'curl' | 'postrun';
}

/**
 * Props for ModelReadme component
 */
export interface ReadmeProps extends TabComponentProps {
  expandMetadata?: boolean;
}

/**
 * Playground inference result
 */
export interface PlaygroundResult {
  output: string | object; // Text response or structured data
  latency_ms?: number;
  tokens_used?: number;
  cost_credits?: number;
  media_url?: string; // For image/video/audio outputs
  error?: string;
}

/**
 * Playground form state
 *
 * This is a flexible interface that can accommodate different model types
 */
export interface PlaygroundFormState {
  // Common fields
  prompt?: string;
  negative_prompt?: string;

  // Image/Video generation
  image_url?: string;
  width?: number;
  height?: number;
  duration?: number; // For video models

  // Text generation
  max_tokens?: number;
  temperature?: number;
  top_p?: number;

  // Advanced settings
  num_inference_steps?: number;
  guidance?: number;
  seed?: number;
  enable_prompt_optimization?: boolean;
  enable_safety_checker?: boolean;

  // Audio models
  audio_file?: File;
  voice?: string;
  language?: string;

  // Embedding models
  texts?: string[];
  normalize?: boolean;
}

/**
 * API code format types
 */
export type APICodeFormat = 'curl' | 'postrun' | 'python' | 'javascript';

/**
 * Model detail page params (from Next.js route)
 */
export interface ModelDetailPageParams {
  slug: string;
}

/**
 * Model detail page search params (from Next.js route)
 */
export interface ModelDetailPageSearchParams {
  tab?: TabType;
}

/**
 * Helper type for slug generation
 */
export interface SlugGenerationOptions {
  provider?: string;
  includeProvider?: boolean;
  version?: string;
}
