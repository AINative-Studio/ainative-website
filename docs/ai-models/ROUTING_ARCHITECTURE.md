# AI Model Registry - Routing Architecture

**Status**: Active Design Document
**Last Updated**: 2026-02-06
**Related**: AI_MODEL_REGISTRY_SYSTEM.md

---

## Table of Contents

1. [Overview](#overview)
2. [Routing Structure](#routing-structure)
3. [Slug Generation Strategy](#slug-generation-strategy)
4. [URL Patterns and Examples](#url-patterns-and-examples)
5. [Component Hierarchy](#component-hierarchy)
6. [Tab Navigation System](#tab-navigation-system)
7. [Data Loading Strategy](#data-loading-strategy)
8. [SEO and Metadata](#seo-and-metadata)
9. [Error Handling](#error-handling)
10. [Implementation Examples](#implementation-examples)

---

## Overview

The AI Model Registry uses a slug-based routing system for model detail pages with three interactive tabs (Playground, API, Readme). The architecture follows Next.js 14+ App Router conventions, prioritizing server-side rendering for SEO while maintaining client-side interactivity.

**Key Design Principles**:
- SEO-friendly URLs with model slugs
- Server Components by default, Client Components only when needed
- URL-based tab state for shareable links
- Browser navigation (back/forward) support
- Type-safe routing with TypeScript

---

## Routing Structure

### Route Pattern

```
/dashboard/ai-settings/[slug]?tab=[playground|api|readme]
```

### Directory Structure

```
app/dashboard/ai-settings/
├── page.tsx                              # Browse page (Server Component)
├── AISettingsClient.tsx                  # Browse page client logic
├── [slug]/
│   ├── page.tsx                          # Model detail page (Server Component)
│   ├── ModelDetailClient.tsx             # Main wrapper (Client Component)
│   ├── components/
│   │   ├── ModelPlayground.tsx           # Playground tab (Client Component)
│   │   ├── ModelAPI.tsx                  # API tab (Client Component)
│   │   └── ModelReadme.tsx               # Readme tab (Client/Server Component)
│   └── types.ts                          # TypeScript types for detail page
└── types.ts                              # Shared TypeScript types
```

---

## Slug Generation Strategy

### Algorithm

Slugs are generated from model identifiers using a consistent, URL-safe transformation:

```typescript
function generateSlug(modelIdentifier: string, provider?: string): string {
  // Step 1: Convert to lowercase
  let slug = modelIdentifier.toLowerCase();

  // Step 2: Replace non-alphanumeric characters with hyphens
  slug = slug.replace(/[^a-z0-9]+/g, '-');

  // Step 3: Remove leading/trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');

  // Step 4: Optional - prepend provider for uniqueness
  if (provider && needsProviderPrefix(modelIdentifier)) {
    const providerSlug = provider.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    slug = `${providerSlug}-${slug}`;
  }

  return slug;
}

function needsProviderPrefix(modelIdentifier: string): boolean {
  // Add provider prefix for common model names that might conflict
  const commonNames = ['gpt-4', 'gpt-3.5-turbo', 'claude', 'whisper'];
  return commonNames.some(name => modelIdentifier.toLowerCase().includes(name));
}
```

### Slug Examples

| Model Identifier | Provider | Generated Slug | Reasoning |
|-----------------|----------|----------------|-----------|
| `gpt-4` | OpenAI | `gpt-4` | Short, recognizable |
| `claude-3-5-sonnet-20241022` | Anthropic | `claude-3-5-sonnet-20241022` | Version included |
| `wan22-i2v` | Alibaba | `alibaba-wan-22-i2v-720p` | Provider added for clarity |
| `BAAI/bge-small-en-v1.5` | BAAI | `baai-bge-small-en-v1-5` | Slash replaced with hyphen |
| `qwen-image-edit` | Qwen | `qwen-image-edit` | Direct conversion |
| `Whisper` | OpenAI | `openai-whisper` | Provider added for clarity |

### Slug Uniqueness

**Database Constraint**: The `slug` field should have a unique constraint in the database schema.

**Conflict Resolution**:
1. If slug collision occurs, append `-v2`, `-v3`, etc.
2. Log warning for manual review
3. Alternatively, use `provider-slug` format consistently

---

## URL Patterns and Examples

### Browse Page

```
/dashboard/ai-settings
/dashboard/ai-settings?category=Image
/dashboard/ai-settings?category=Video&sort=newest
```

### Model Detail Page

```
# Default (Playground tab)
/dashboard/ai-settings/gpt-4

# Explicit tab selection
/dashboard/ai-settings/gpt-4?tab=playground
/dashboard/ai-settings/gpt-4?tab=api
/dashboard/ai-settings/gpt-4?tab=readme

# With provider prefix
/dashboard/ai-settings/alibaba-wan-22-i2v-720p?tab=playground

# Complex slugs
/dashboard/ai-settings/baai-bge-small-en-v1-5?tab=readme
```

### Shareable URLs

Users can share direct links to specific tabs:

```
# Share API integration code
https://ainative.studio/dashboard/ai-settings/gpt-4?tab=api

# Share model documentation
https://ainative.studio/dashboard/ai-settings/qwen-image-edit?tab=readme
```

---

## Component Hierarchy

### Server vs Client Components

```
[slug]/page.tsx (Server Component)
├── Generate metadata for SEO
├── Fetch initial model data
└── Render ModelDetailClient (Client Component)
    ├── Tab navigation state
    ├── URL query param management
    └── Conditionally render active tab:
        ├── ModelPlayground (Client Component)
        │   ├── Form state management
        │   ├── API mutations
        │   └── Result rendering
        ├── ModelAPI (Client Component)
        │   ├── Code snippet generation
        │   ├── Copy-to-clipboard
        │   └── Syntax highlighting
        └── ModelReadme (Client/Server Component)
            └── Markdown rendering
```

### Component Responsibilities

#### `page.tsx` (Server Component)
- Generate dynamic metadata (title, description, Open Graph)
- Fetch model data server-side
- Handle 404 for invalid slugs
- Pass data to client components

#### `ModelDetailClient.tsx` (Client Component)
- Manage tab state
- Sync tab state with URL query params
- Handle browser back/forward navigation
- Render active tab component
- Provide model context to children

#### `ModelPlayground.tsx` (Client Component)
- Render model-specific input controls
- Manage form state (prompt, parameters)
- Execute API calls (mutations)
- Display results (video, image, text)
- Handle loading/error states

#### `ModelAPI.tsx` (Client Component)
- Generate curl/Post code snippets
- Syntax highlighting
- Copy-to-clipboard functionality
- Toggle between code formats

#### `ModelReadme.tsx` (Client/Server Component)
- Render markdown documentation
- Display model metadata
- Could be Server Component if no interactivity needed

---

## Tab Navigation System

### URL-Based State Management

**Why URL-based?**
- Shareable links with tab state
- Browser back/forward navigation works
- Tab state persists on page refresh
- Better for SEO (separate URLs for different content)

### Implementation Strategy

```typescript
// In ModelDetailClient.tsx
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

type TabType = 'playground' | 'api' | 'readme';

export default function ModelDetailClient({ model, slug }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read tab from URL, default to 'playground'
  const activeTab = (searchParams.get('tab') as TabType) || 'playground';

  const setActiveTab = (tab: TabType) => {
    // Update URL without full page reload
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div>
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'playground' && <ModelPlayground model={model} />}
      {activeTab === 'api' && <ModelAPI model={model} />}
      {activeTab === 'readme' && <ModelReadme model={model} />}
    </div>
  );
}
```

### Tab Component Props Interface

```typescript
// Base props for all tab components
interface TabComponentProps {
  model: UnifiedAIModel;
  slug: string;
}

// Playground-specific props
interface PlaygroundProps extends TabComponentProps {
  onRun?: (result: InferenceResult) => void;
}

// API-specific props
interface APIProps extends TabComponentProps {
  defaultFormat?: 'curl' | 'postrun';
}

// Readme-specific props
interface ReadmeProps extends TabComponentProps {
  expandMetadata?: boolean;
}
```

---

## Data Loading Strategy

### Server-Side Rendering (SSR)

**Advantages**:
- SEO-friendly (crawlers see full content)
- Faster initial page load
- No loading spinner on first render

**When to use**:
- Initial model data fetch
- Static content (readme, metadata)

### Client-Side Rendering (CSR)

**Advantages**:
- Interactive features (playground, API calls)
- No full page reload
- Better for dynamic content

**When to use**:
- Playground tab (form inputs, API mutations)
- API tab (copy-to-clipboard, code toggling)
- Real-time data updates

### Hybrid Approach (Recommended)

```typescript
// [slug]/page.tsx (Server Component)
export default async function ModelDetailPage({ params, searchParams }) {
  const { slug } = await params;

  // Fetch model data server-side
  const model = await fetchModelBySlug(slug);

  if (!model) {
    notFound(); // 404 page
  }

  // Pass to client component
  return <ModelDetailClient model={model} slug={slug} />;
}

// ModelDetailClient.tsx (Client Component)
export default function ModelDetailClient({ model, slug }) {
  // Client-side interactivity
  // Tab navigation, form state, etc.
}
```

### Data Fetching Functions

```typescript
// lib/ai-models-service.ts

/**
 * Fetch model by slug (server-side)
 */
export async function fetchModelBySlug(slug: string): Promise<UnifiedAIModel | null> {
  try {
    // First, try to find model in aggregated data
    const models = await fetchAllModels();
    return models.find(m => m.slug === slug) || null;
  } catch (error) {
    console.error('Failed to fetch model:', error);
    return null;
  }
}

/**
 * Fetch all models (with caching)
 */
export async function fetchAllModels(): Promise<UnifiedAIModel[]> {
  // Aggregate from multiple endpoints
  // Cache for performance
  // Return unified model array
}
```

---

## SEO and Metadata

### Dynamic Metadata Generation

```typescript
// [slug]/page.tsx

import { Metadata } from 'next';

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params;
  const model = await fetchModelBySlug(slug);

  if (!model) {
    return {
      title: 'Model Not Found - AI Native Studio',
    };
  }

  return {
    title: `${model.name} - ${model.category} Model | AI Native Studio`,
    description: model.description || `Explore and test ${model.name}, a ${model.provider} AI model for ${model.category.toLowerCase()} generation.`,
    openGraph: {
      title: `${model.name} - AI Model Playground`,
      description: model.description,
      images: model.thumbnail_url ? [model.thumbnail_url] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${model.name} - AI Model Playground`,
      description: model.description,
      images: model.thumbnail_url ? [model.thumbnail_url] : [],
    },
  };
}
```

### URL Structure for SEO

**Good** (current design):
```
/dashboard/ai-settings/gpt-4
/dashboard/ai-settings/alibaba-wan-22-i2v-720p
```

**Why it works**:
- Clean, readable URLs
- Contains keywords (model name, provider)
- No unnecessary IDs or random strings
- Permanent (doesn't change with model updates)

---

## Error Handling

### Not Found (404)

```typescript
// [slug]/page.tsx

import { notFound } from 'next/navigation';

export default async function ModelDetailPage({ params }) {
  const { slug } = await params;
  const model = await fetchModelBySlug(slug);

  if (!model) {
    notFound(); // Triggers 404 page
  }

  return <ModelDetailClient model={model} slug={slug} />;
}
```

### Custom 404 Page

```typescript
// [slug]/not-found.tsx

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
      <h1 className="text-2xl font-bold text-white">Model Not Found</h1>
      <p className="text-gray-400">The AI model you're looking for doesn't exist.</p>
      <Link href="/dashboard/ai-settings" className="text-primary hover:underline">
        Browse All Models
      </Link>
    </div>
  );
}
```

### Error Boundary

```typescript
// [slug]/error.tsx

'use client';

export default function Error({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
      <h1 className="text-2xl font-bold text-red-400">Something went wrong</h1>
      <p className="text-gray-400">{error.message}</p>
      <button onClick={reset} className="px-4 py-2 bg-primary rounded-md">
        Try Again
      </button>
    </div>
  );
}
```

---

## Implementation Examples

### Example 1: Complete Flow

```typescript
// User visits: /dashboard/ai-settings/gpt-4?tab=api

// 1. [slug]/page.tsx (Server Component)
export default async function ModelDetailPage({ params, searchParams }) {
  const { slug } = await params; // 'gpt-4'
  const model = await fetchModelBySlug('gpt-4'); // { id: 'gpt-4', name: 'GPT-4', ... }

  return (
    <ModelDetailClient
      model={model}
      slug={slug}
    />
  );
}

// 2. ModelDetailClient.tsx (Client Component)
export default function ModelDetailClient({ model, slug }) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'playground'; // 'api'

  return (
    <div>
      <ModelHeader model={model} />
      <TabNavigation activeTab={activeTab} />
      {activeTab === 'api' && <ModelAPI model={model} slug={slug} />}
    </div>
  );
}

// 3. ModelAPI.tsx (Client Component)
export default function ModelAPI({ model, slug }) {
  const [copied, setCopied] = useState(false);
  const curlSnippet = generateCurlSnippet(model);

  return (
    <div>
      <CodeBlock code={curlSnippet} />
      <CopyButton onClick={() => copyToClipboard(curlSnippet)} />
    </div>
  );
}
```

### Example 2: Tab Switching

```typescript
// User clicks "Playground" tab

// ModelDetailClient.tsx
const setActiveTab = (tab: TabType) => {
  const params = new URLSearchParams(searchParams);
  params.set('tab', tab);
  router.push(`/dashboard/ai-settings/${slug}?${params.toString()}`, {
    scroll: false // Don't scroll to top
  });
};

// URL changes to: /dashboard/ai-settings/gpt-4?tab=playground
// Component re-renders with new activeTab
// Browser history updated (back button works)
```

### Example 3: Shareable URL

```typescript
// User copies URL from browser:
// https://ainative.studio/dashboard/ai-settings/gpt-4?tab=api

// Another user visits this URL:
// 1. Server fetches model data for 'gpt-4'
// 2. Client reads tab=api from searchParams
// 3. ModelAPI component renders directly
// 4. No extra clicks needed - exact state restored
```

---

## Migration Path

### Step 1: Update Route (DONE)
- Rename `[id]/` to `[slug]/`
- Update page.tsx to use slug instead of id

### Step 2: Add Slug Generation
- Add slug field to UnifiedAIModel interface
- Implement slug generation in model aggregator
- Ensure uniqueness

### Step 3: Update Components
- Refactor ModelDetailClient to use slug
- Update all model detail components
- Test tab navigation

### Step 4: Add SEO Metadata
- Implement generateMetadata function
- Add Open Graph tags
- Add Twitter card tags

### Step 5: Testing
- Test all model slugs
- Verify tab navigation
- Check browser back/forward
- Confirm shareable URLs work
- Test 404 handling

---

## Performance Considerations

### Caching Strategy

```typescript
// Cache model data for 5 minutes
export const revalidate = 300;

// Or use Next.js cache
import { cache } from 'react';

export const fetchModelBySlug = cache(async (slug: string) => {
  // Fetch logic
});
```

### Code Splitting

- Tab components are lazy-loaded by default (Client Components)
- Only active tab's code is loaded
- Reduces initial bundle size

### Prefetching

```typescript
// In browse page, prefetch model detail pages
<Link
  href={`/dashboard/ai-settings/${model.slug}`}
  prefetch={true} // Default in App Router
>
  {model.name}
</Link>
```

---

## Testing Checklist

- [ ] All model slugs generate correctly
- [ ] No slug collisions
- [ ] URL changes when switching tabs
- [ ] Browser back/forward works
- [ ] Tab state persists on refresh
- [ ] Shareable URLs restore correct tab
- [ ] 404 page shows for invalid slugs
- [ ] SEO metadata generates correctly
- [ ] Open Graph tags present
- [ ] Performance acceptable (< 2s LCP)

---

## Future Enhancements

1. **Slug Redirects**: Handle legacy `/[id]` URLs → redirect to `/[slug]`
2. **Canonical URLs**: Add canonical tags for SEO
3. **Breadcrumbs**: Add structured data for breadcrumb navigation
4. **Model Versioning**: Support multiple versions with slug suffixes (e.g., `gpt-4-v1`, `gpt-4-v2`)
5. **Search-Friendly**: Add schema.org structured data for AI models

---

**END OF ROUTING ARCHITECTURE DOCUMENT**

This document defines the complete routing structure for the AI Model Registry detail pages. All implementation should follow these patterns and conventions.
