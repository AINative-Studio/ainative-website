/**
 * On-Demand Revalidation API Route
 *
 * This API route enables on-demand revalidation of cached content.
 * Use this for webhooks from CMS or manual cache clearing.
 *
 * Example usage:
 * POST /api/revalidate
 * {
 *   "type": "blog",
 *   "slug": "my-blog-post"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  revalidateContent,
  revalidateBlogPosts,
  revalidateTutorials,
  revalidateWebinars,
  revalidateCommunityVideos,
  revalidateMarketingPages,
  revalidatePricing,
  revalidateHome,
  revalidateAllContent,
  revalidateByTag,
  revalidateByPath,
} from '@/lib/cache-revalidation';

// Use Edge Runtime for faster response times
export const runtime = 'edge';

// Maximum duration for edge function (5 seconds)
export const maxDuration = 5;

interface RevalidateRequest {
  type?: 'blog' | 'tutorial' | 'webinar' | 'video' | 'showcase' | 'all' | 'marketing' | 'pricing' | 'home';
  slug?: string;
  tag?: string;
  path?: string;
  secret?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RevalidateRequest = await request.json();
    const { type, slug, tag, path, secret } = body;

    // Validate secret token if configured
    const revalidateSecret = process.env.REVALIDATE_SECRET;
    if (revalidateSecret && secret !== revalidateSecret) {
      return NextResponse.json(
        { success: false, message: 'Invalid secret token' },
        { status: 401 }
      );
    }

    // Handle different revalidation types
    let result;

    if (tag) {
      // Revalidate by tag
      result = await revalidateByTag(tag);
    } else if (path) {
      // Revalidate by path
      result = await revalidateByPath(path);
    } else if (type && slug) {
      // Revalidate specific content item
      result = await revalidateContent(type, slug);
    } else if (type === 'all') {
      // Revalidate all content
      result = await revalidateAllContent();
    } else if (type === 'marketing') {
      // Revalidate marketing pages
      result = await revalidateMarketingPages();
    } else if (type === 'pricing') {
      // Revalidate pricing page
      result = await revalidatePricing();
    } else if (type === 'home') {
      // Revalidate home page
      result = await revalidateHome();
    } else if (type === 'blog') {
      // Revalidate all blog posts
      result = await revalidateBlogPosts();
    } else if (type === 'tutorial') {
      // Revalidate all tutorials
      result = await revalidateTutorials();
    } else if (type === 'webinar') {
      // Revalidate all webinars
      result = await revalidateWebinars();
    } else if (type === 'video') {
      // Revalidate all community videos
      result = await revalidateCommunityVideos();
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid revalidation parameters. Provide type+slug, tag, or path.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to revalidate',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint for manual testing
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const slug = searchParams.get('slug');
  const secret = searchParams.get('secret');

  // Validate secret token if configured
  const revalidateSecret = process.env.REVALIDATE_SECRET;
  if (revalidateSecret && secret !== revalidateSecret) {
    return NextResponse.json(
      { success: false, message: 'Invalid secret token' },
      { status: 401 }
    );
  }

  if (!type) {
    return NextResponse.json(
      {
        success: false,
        message: 'Missing type parameter',
        usage: {
          endpoint: '/api/revalidate',
          methods: ['GET', 'POST'],
          parameters: {
            type: 'blog | tutorial | webinar | video | all | marketing | pricing | home',
            slug: 'optional - specific content slug',
            secret: 'required if REVALIDATE_SECRET is set',
          },
          examples: [
            '/api/revalidate?type=blog&slug=my-post&secret=xxx',
            '/api/revalidate?type=all&secret=xxx',
            '/api/revalidate?type=marketing&secret=xxx',
          ],
        },
      },
      { status: 400 }
    );
  }

  try {
    let result;

    if (type === 'all') {
      result = await revalidateAllContent();
    } else if (type === 'marketing') {
      result = await revalidateMarketingPages();
    } else if (type === 'pricing') {
      result = await revalidatePricing();
    } else if (type === 'home') {
      result = await revalidateHome();
    } else if (slug) {
      result = await revalidateContent(
        type as 'blog' | 'tutorial' | 'webinar' | 'video' | 'showcase',
        slug
      );
    } else {
      // Revalidate all items of this type
      if (type === 'blog') {
        result = await revalidateBlogPosts();
      } else if (type === 'tutorial') {
        result = await revalidateTutorials();
      } else if (type === 'webinar') {
        result = await revalidateWebinars();
      } else if (type === 'video') {
        result = await revalidateCommunityVideos();
      } else {
        return NextResponse.json(
          { success: false, message: 'Invalid type parameter' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to revalidate',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
