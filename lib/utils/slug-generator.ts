/**
 * Slug Generation Utility
 *
 * This module provides utilities for generating URL-friendly slugs from model identifiers.
 * Slugs are used in the routing structure: /dashboard/ai-settings/[slug]
 *
 * Key Features:
 * - Convert model identifiers to lowercase, hyphenated format
 * - Remove special characters and spaces
 * - Optionally prepend provider name for uniqueness
 * - Ensure URL safety
 *
 * Usage:
 * ```typescript
 * import { generateSlug } from '@/lib/utils/slug-generator';
 *
 * const slug = generateSlug('GPT-4', 'OpenAI');
 * // Result: 'gpt-4'
 *
 * const slug = generateSlug('BAAI/bge-small-en-v1.5', 'BAAI');
 * // Result: 'baai-bge-small-en-v1-5'
 * ```
 */

/**
 * Options for slug generation
 */
export interface SlugGenerationOptions {
  /**
   * Provider name (e.g., "OpenAI", "Anthropic")
   */
  provider?: string;

  /**
   * Force inclusion of provider prefix even if not typically needed
   */
  forceProviderPrefix?: boolean;

  /**
   * Version string to append (e.g., "v1", "2.0")
   */
  version?: string;

  /**
   * Custom suffix to append for uniqueness
   */
  suffix?: string;
}

/**
 * List of common model names that should include provider prefix to avoid collisions
 */
const COMMON_MODEL_NAMES = [
  'gpt',
  'claude',
  'llama',
  'whisper',
  'dall-e',
  'stable-diffusion',
  'midjourney',
  'imagen',
  'bge',
  'bert',
];

/**
 * Check if a model identifier needs a provider prefix
 *
 * This helps avoid slug collisions for common model names.
 * For example, both OpenAI and Azure might have "gpt-4", so we'd use
 * "openai-gpt-4" and "azure-gpt-4".
 */
function needsProviderPrefix(modelIdentifier: string): boolean {
  const lowerIdentifier = modelIdentifier.toLowerCase();
  return COMMON_MODEL_NAMES.some((name) => lowerIdentifier.includes(name));
}

/**
 * Generate a URL-friendly slug from a model identifier
 *
 * Algorithm:
 * 1. Convert to lowercase
 * 2. Replace slashes, dots, and special chars with hyphens
 * 3. Remove consecutive hyphens
 * 4. Trim leading/trailing hyphens
 * 5. Optionally prepend provider
 * 6. Optionally append version/suffix
 *
 * @param modelIdentifier - The model identifier (e.g., "GPT-4", "BAAI/bge-small-en-v1.5")
 * @param options - Optional configuration for slug generation
 * @returns URL-friendly slug
 *
 * @example
 * ```typescript
 * generateSlug('GPT-4')
 * // Returns: 'gpt-4'
 *
 * generateSlug('claude-3-5-sonnet-20241022')
 * // Returns: 'claude-3-5-sonnet-20241022'
 *
 * generateSlug('BAAI/bge-small-en-v1.5', { provider: 'BAAI' })
 * // Returns: 'baai-bge-small-en-v1-5'
 *
 * generateSlug('wan22-i2v', { provider: 'Alibaba', suffix: '720p' })
 * // Returns: 'alibaba-wan-22-i2v-720p'
 * ```
 */
export function generateSlug(
  modelIdentifier: string,
  options: SlugGenerationOptions = {}
): string {
  if (!modelIdentifier) {
    throw new Error('Model identifier is required for slug generation');
  }

  // Step 1: Convert to lowercase
  let slug = modelIdentifier.toLowerCase();

  // Step 2: Replace special characters with hyphens
  // This includes slashes, dots, underscores, spaces, etc.
  slug = slug.replace(/[^a-z0-9]+/g, '-');

  // Step 3: Remove consecutive hyphens
  slug = slug.replace(/-+/g, '-');

  // Step 4: Remove leading/trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');

  // Step 5: Add provider prefix if needed
  if (options.provider && (options.forceProviderPrefix || needsProviderPrefix(modelIdentifier))) {
    const providerSlug = options.provider.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    // Only add provider if it's not already in the slug
    if (!slug.startsWith(providerSlug)) {
      slug = `${providerSlug}-${slug}`;
    }
  }

  // Step 6: Add version if provided
  if (options.version) {
    const versionSlug = options.version.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (!slug.includes(versionSlug)) {
      slug = `${slug}-${versionSlug}`;
    }
  }

  // Step 7: Add suffix if provided
  if (options.suffix) {
    const suffixSlug = options.suffix.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (!slug.endsWith(suffixSlug)) {
      slug = `${slug}-${suffixSlug}`;
    }
  }

  // Final cleanup
  slug = slug.replace(/-+/g, '-').replace(/^-+|-+$/g, '');

  return slug;
}

/**
 * Validate that a slug is URL-safe
 *
 * A valid slug:
 * - Contains only lowercase letters, numbers, and hyphens
 * - Does not start or end with a hyphen
 * - Does not contain consecutive hyphens
 * - Is not empty
 * - Is between 1 and 100 characters
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length === 0 || slug.length > 100) {
    return false;
  }

  // Must match pattern: lowercase letters, numbers, hyphens only
  const validPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return validPattern.test(slug);
}

/**
 * Generate a unique slug by appending a number if collision occurs
 *
 * This is useful when you detect a slug collision in the database.
 *
 * @param baseSlug - The base slug (e.g., "gpt-4")
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique slug (e.g., "gpt-4-v2" if "gpt-4" exists)
 *
 * @example
 * ```typescript
 * const uniqueSlug = generateUniqueSlug('gpt-4', ['gpt-4', 'gpt-4-v2']);
 * // Returns: 'gpt-4-v3'
 * ```
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  let uniqueSlug = `${baseSlug}-v${counter}`;

  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-v${counter}`;
  }

  return uniqueSlug;
}

/**
 * Parse slug back to model identifier (best effort)
 *
 * Note: This is a lossy operation. The original casing and special
 * characters cannot be recovered. Use this for display purposes only.
 *
 * @param slug - The slug to parse (e.g., "gpt-4")
 * @returns Human-readable identifier (e.g., "GPT-4")
 */
export function parseSlug(slug: string): string {
  // Convert hyphens to spaces and title case
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Batch generate slugs for multiple models
 *
 * Ensures all generated slugs are unique within the batch.
 *
 * @param models - Array of model identifiers with optional providers
 * @returns Array of unique slugs
 */
export function batchGenerateSlugs(
  models: Array<{ identifier: string; provider?: string }>
): string[] {
  const slugs: string[] = [];
  const usedSlugs = new Set<string>();

  for (const model of models) {
    let slug = generateSlug(model.identifier, { provider: model.provider });

    // Ensure uniqueness
    if (usedSlugs.has(slug)) {
      slug = generateUniqueSlug(slug, Array.from(usedSlugs));
    }

    slugs.push(slug);
    usedSlugs.add(slug);
  }

  return slugs;
}

/**
 * Example usage and test cases
 */
export const SLUG_EXAMPLES = {
  'gpt-4': generateSlug('gpt-4'),
  'claude-3-5-sonnet': generateSlug('claude-3-5-sonnet-20241022'),
  'alibaba-wan-22-i2v': generateSlug('wan22-i2v', {
    provider: 'Alibaba',
    suffix: '720p',
  }),
  'baai-bge-small-en-v1-5': generateSlug('BAAI/bge-small-en-v1.5', { provider: 'BAAI' }),
  'qwen-image-edit': generateSlug('qwen-image-edit', { provider: 'Qwen' }),
  'openai-whisper': generateSlug('Whisper', { provider: 'OpenAI' }),
};

/**
 * Type guard to check if a string is a valid slug
 */
export function assertValidSlug(slug: string): asserts slug is string {
  if (!isValidSlug(slug)) {
    throw new Error(`Invalid slug: "${slug}". Slugs must contain only lowercase letters, numbers, and hyphens.`);
  }
}
