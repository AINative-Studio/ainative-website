/**
 * Cache Revalidation Utilities
 *
 * Provides utilities for on-demand revalidation and cache invalidation
 * using Next.js revalidateTag and revalidatePath APIs.
 */

import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Cache tags for different content types
 */
export const CacheTags = {
  // Content types
  BLOG: 'blog',
  TUTORIAL: 'tutorial',
  WEBINAR: 'webinar',
  VIDEO: 'video',
  SHOWCASE: 'showcase',
  CONTENT: 'content',

  // Marketing pages
  HOME: 'home',
  PRICING: 'pricing',
  PRODUCTS: 'products',
  MARKETING: 'marketing',
  STATIC: 'static',
  FAQ: 'faq',

  // User-specific
  USER: 'user',
  DASHBOARD: 'dashboard',
  SETTINGS: 'settings',

  // Community
  COMMUNITY: 'community',
} as const;

export type CacheTag = typeof CacheTags[keyof typeof CacheTags];

/**
 * Revalidate a specific content item by slug
 */
export async function revalidateContent(
  type: 'blog' | 'tutorial' | 'webinar' | 'video' | 'showcase',
  slug: string
) {
  try {
    // Revalidate the specific page
    revalidatePath(`/${type}/${slug}`);

    // Revalidate the list page
    revalidatePath(`/${type}`);

    // Revalidate by tag
    revalidateTag(type);
    revalidateTag('content');

    return { success: true, message: `Revalidated ${type} content: ${slug}` };
  } catch (error) {
    console.error(`Error revalidating ${type} content:`, error);
    return {
      success: false,
      message: `Failed to revalidate ${type} content: ${slug}`,
      error,
    };
  }
}

/**
 * Revalidate all blog posts
 */
export async function revalidateBlogPosts() {
  try {
    revalidatePath('/blog');
    revalidateTag(CacheTags.BLOG);
    revalidateTag(CacheTags.CONTENT);
    return { success: true, message: 'Revalidated all blog posts' };
  } catch (error) {
    console.error('Error revalidating blog posts:', error);
    return { success: false, message: 'Failed to revalidate blog posts', error };
  }
}

/**
 * Revalidate all tutorials
 */
export async function revalidateTutorials() {
  try {
    revalidatePath('/tutorials');
    revalidateTag(CacheTags.TUTORIAL);
    revalidateTag(CacheTags.CONTENT);
    return { success: true, message: 'Revalidated all tutorials' };
  } catch (error) {
    console.error('Error revalidating tutorials:', error);
    return { success: false, message: 'Failed to revalidate tutorials', error };
  }
}

/**
 * Revalidate all webinars
 */
export async function revalidateWebinars() {
  try {
    revalidatePath('/webinars');
    revalidateTag(CacheTags.WEBINAR);
    revalidateTag(CacheTags.CONTENT);
    return { success: true, message: 'Revalidated all webinars' };
  } catch (error) {
    console.error('Error revalidating webinars:', error);
    return { success: false, message: 'Failed to revalidate webinars', error };
  }
}

/**
 * Revalidate all community videos
 */
export async function revalidateCommunityVideos() {
  try {
    revalidatePath('/community/videos');
    revalidateTag(CacheTags.VIDEO);
    revalidateTag(CacheTags.COMMUNITY);
    revalidateTag(CacheTags.CONTENT);
    return { success: true, message: 'Revalidated all community videos' };
  } catch (error) {
    console.error('Error revalidating community videos:', error);
    return { success: false, message: 'Failed to revalidate community videos', error };
  }
}

/**
 * Revalidate marketing pages
 */
export async function revalidateMarketingPages() {
  try {
    const paths = ['/', '/pricing', '/products', '/about', '/faq', '/contact'];
    paths.forEach((path) => revalidatePath(path));

    revalidateTag(CacheTags.MARKETING);
    return { success: true, message: 'Revalidated marketing pages' };
  } catch (error) {
    console.error('Error revalidating marketing pages:', error);
    return {
      success: false,
      message: 'Failed to revalidate marketing pages',
      error,
    };
  }
}

/**
 * Revalidate pricing page
 */
export async function revalidatePricing() {
  try {
    revalidatePath('/pricing');
    revalidateTag(CacheTags.PRICING);
    revalidateTag(CacheTags.MARKETING);
    return { success: true, message: 'Revalidated pricing page' };
  } catch (error) {
    console.error('Error revalidating pricing:', error);
    return { success: false, message: 'Failed to revalidate pricing', error };
  }
}

/**
 * Revalidate home page
 */
export async function revalidateHome() {
  try {
    revalidatePath('/');
    revalidateTag(CacheTags.HOME);
    revalidateTag(CacheTags.MARKETING);
    return { success: true, message: 'Revalidated home page' };
  } catch (error) {
    console.error('Error revalidating home page:', error);
    return { success: false, message: 'Failed to revalidate home page', error };
  }
}

/**
 * Revalidate all content
 */
export async function revalidateAllContent() {
  try {
    // Revalidate main content pages
    revalidatePath('/blog');
    revalidatePath('/tutorials');
    revalidatePath('/webinars');
    revalidatePath('/community/videos');
    revalidatePath('/showcases');

    // Revalidate all content tags
    revalidateTag(CacheTags.CONTENT);
    revalidateTag(CacheTags.BLOG);
    revalidateTag(CacheTags.TUTORIAL);
    revalidateTag(CacheTags.WEBINAR);
    revalidateTag(CacheTags.VIDEO);
    revalidateTag(CacheTags.SHOWCASE);

    return { success: true, message: 'Revalidated all content' };
  } catch (error) {
    console.error('Error revalidating all content:', error);
    return { success: false, message: 'Failed to revalidate all content', error };
  }
}

/**
 * Revalidate by custom tag
 */
export async function revalidateByTag(tag: CacheTag | string) {
  try {
    revalidateTag(tag);
    return { success: true, message: `Revalidated tag: ${tag}` };
  } catch (error) {
    console.error(`Error revalidating tag ${tag}:`, error);
    return { success: false, message: `Failed to revalidate tag: ${tag}`, error };
  }
}

/**
 * Revalidate by path
 */
export async function revalidateByPath(path: string) {
  try {
    revalidatePath(path);
    return { success: true, message: `Revalidated path: ${path}` };
  } catch (error) {
    console.error(`Error revalidating path ${path}:`, error);
    return { success: false, message: `Failed to revalidate path: ${path}`, error };
  }
}

/**
 * Batch revalidation for multiple items
 */
export async function batchRevalidate(items: Array<{
  type: 'path' | 'tag';
  value: string;
}>) {
  const results = await Promise.allSettled(
    items.map((item) =>
      item.type === 'path'
        ? revalidateByPath(item.value)
        : revalidateByTag(item.value)
    )
  );

  const successes = results.filter((r) => r.status === 'fulfilled').length;
  const failures = results.filter((r) => r.status === 'rejected').length;

  return {
    success: failures === 0,
    message: `Batch revalidation complete: ${successes} succeeded, ${failures} failed`,
    results,
  };
}
