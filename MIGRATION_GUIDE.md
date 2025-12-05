# Vite to Next.js Migration Guide

This guide documents the patterns and best practices for migrating the AINative Studio website from Vite + React Router to Next.js 16 with the App Router.

## Table of Contents

1. [File Structure](#1-file-structure)
2. [Routing Conversion](#2-routing-conversion)
3. [Meta Tags & SEO](#3-meta-tags--seo)
4. [Client vs Server Components](#4-client-vs-server-components)
5. [Data Fetching Patterns](#5-data-fetching-patterns)
6. [Troubleshooting Guide](#6-troubleshooting-guide)

---

## 1. File Structure

### Vite Structure (Before)

```
src/
├── pages/              # Page components (flat)
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   └── dashboard/
│       └── SettingsPage.tsx
├── components/         # Reusable components
├── services/           # API services
├── lib/                # Utilities
├── hooks/              # Custom hooks
└── App.tsx             # Router configuration
```

### Next.js Structure (After)

```
app/
├── layout.tsx          # Root layout (replaces App.tsx wrapper)
├── page.tsx            # Home page (/)
├── login/
│   └── page.tsx        # Login page (/login)
├── dashboard/
│   ├── layout.tsx      # Dashboard layout
│   └── settings/
│       └── page.tsx    # Settings page (/dashboard/settings)
├── error.tsx           # Global error boundary
├── not-found.tsx       # 404 page
└── globals.css         # Global styles

components/             # Shared components (same as before)
├── ui/                 # UI primitives
└── providers/          # Context providers

lib/                    # Utilities and configurations
├── react-query.ts      # React Query setup
└── env.ts              # Environment validation
```

### Key Differences

| Aspect | Vite | Next.js |
|--------|------|---------|
| Routing | React Router in App.tsx | File-based in `app/` |
| Page files | `HomePage.tsx` | `page.tsx` in folder |
| Layouts | Manual wrapper components | `layout.tsx` files |
| Entry point | `main.tsx` | `layout.tsx` + `page.tsx` |

---

## 2. Routing Conversion

### Basic Route Conversion

**Vite + React Router:**
```tsx
// App.tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/about" element={<AboutPage />} />
  <Route path="/blog/:slug" element={<BlogPost />} />
</Routes>
```

**Next.js App Router:**
```
app/
├── page.tsx            # → /
├── about/
│   └── page.tsx        # → /about
└── blog/
    └── [slug]/
        └── page.tsx    # → /blog/:slug
```

### Dynamic Routes

**Vite:**
```tsx
// Using useParams
import { useParams } from 'react-router-dom';

function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  // ...
}
```

**Next.js:**
```tsx
// app/blog/[slug]/page.tsx
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  // ...
}
```

### Catch-All Routes

**Vite:** `<Route path="/docs/*" element={<Docs />} />`

**Next.js:** `app/docs/[...slug]/page.tsx`

### Navigation

**Vite:**
```tsx
import { Link, useNavigate } from 'react-router-dom';

// Declarative
<Link to="/about">About</Link>

// Programmatic
const navigate = useNavigate();
navigate('/dashboard');
```

**Next.js:**
```tsx
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Declarative
<Link href="/about">About</Link>

// Programmatic
const router = useRouter();
router.push('/dashboard');
```

---

## 3. Meta Tags & SEO

### React Helmet → Next.js Metadata

**Vite (React Helmet Async):**
```tsx
import { Helmet } from 'react-helmet-async';

function HomePage() {
  return (
    <>
      <Helmet>
        <title>Home | AINative Studio</title>
        <meta name="description" content="Build AI apps" />
        <meta property="og:title" content="AINative Studio" />
      </Helmet>
      <div>...</div>
    </>
  );
}
```

**Next.js (Metadata API):**
```tsx
// app/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home | AINative Studio',
  description: 'Build AI apps',
  openGraph: {
    title: 'AINative Studio',
  },
};

export default function HomePage() {
  return <div>...</div>;
}
```

### Dynamic Metadata

**Next.js:**
```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      images: [post.coverImage],
    },
  };
}
```

### Template Titles

**Next.js layout.tsx:**
```tsx
export const metadata: Metadata = {
  title: {
    default: 'AINative Studio',
    template: '%s | AINative Studio',
  },
};
```

Child pages can then use simple titles:
```tsx
export const metadata: Metadata = {
  title: 'About', // Renders as "About | AINative Studio"
};
```

---

## 4. Client vs Server Components

### Decision Tree

```
Is this component...
│
├─ Using React hooks (useState, useEffect, useContext)?
│   └─ YES → "use client"
│
├─ Using browser APIs (window, document, localStorage)?
│   └─ YES → "use client"
│
├─ Handling user interactions (onClick, onChange)?
│   └─ YES → "use client"
│
├─ Using third-party libraries that require browser?
│   └─ YES → "use client"
│
└─ Just rendering data or static content?
    └─ NO to above → Keep as Server Component (default)
```

### Common Patterns

**Server Component (default):**
```tsx
// app/blog/page.tsx - No directive needed
async function BlogList() {
  const posts = await getPosts(); // Direct database/API call

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

**Client Component:**
```tsx
// components/LikeButton.tsx
"use client";

import { useState } from 'react';

export function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false);

  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? '❤️' : '🤍'}
    </button>
  );
}
```

**Mixing Server and Client:**
```tsx
// app/blog/[slug]/page.tsx (Server Component)
import { LikeButton } from '@/components/LikeButton';

async function BlogPost({ params }) {
  const post = await getPost(params.slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      {/* Client component nested in server component */}
      <LikeButton postId={post.id} />
    </article>
  );
}
```

### Components That MUST Be Client Components

| Component Type | Reason |
|---------------|--------|
| Form inputs with state | useState for controlled inputs |
| Interactive UI (modals, dropdowns) | Event handlers, animations |
| Theme toggles | useTheme hook from next-themes |
| React Query hooks | useMutation, useQuery |
| Stripe Elements | Browser-only SDK |
| Charts/Graphs | D3, Recharts need DOM |

---

## 5. Data Fetching Patterns

### Server-Side Fetching (Recommended for SEO)

```tsx
// app/products/page.tsx
async function ProductsPage() {
  // This runs on the server - no loading state needed
  const products = await fetch('https://api.example.com/products', {
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  }).then(res => res.json());

  return (
    <ul>
      {products.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}
```

### Client-Side with React Query

```tsx
// components/UserProfile.tsx
"use client";

import { useQuery } from '@tanstack/react-query';

export function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
  });

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  return <div>{data.name}</div>;
}
```

### Hybrid: Server Prefetch + Client Hydration

```tsx
// app/dashboard/page.tsx
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/react-query';
import { UserStats } from '@/components/UserStats';

export default async function DashboardPage() {
  const queryClient = getQueryClient();

  // Prefetch on server
  await queryClient.prefetchQuery({
    queryKey: ['user-stats'],
    queryFn: getUserStats,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserStats /> {/* Client component uses the prefetched data */}
    </HydrationBoundary>
  );
}
```

### When to Use Each Pattern

| Pattern | Use When |
|---------|----------|
| Server Component fetch | SEO-critical content, static data |
| React Query (client) | User-specific data, real-time updates |
| Hybrid prefetch | Best of both: SEO + interactivity |
| Server Actions | Form submissions, mutations |

---

## 6. Troubleshooting Guide

### Common Pitfalls and Solutions

#### Pitfall 1: "useState is not defined" in Server Component

**Problem:** Using hooks in a file without `"use client"`.

```tsx
// ❌ This will fail
function Counter() {
  const [count, setCount] = useState(0); // Error!
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

**Solution:** Add `"use client"` directive at the top of the file.

```tsx
// ✅ Fixed
"use client";

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

---

#### Pitfall 2: "window is not defined"

**Problem:** Accessing browser globals during server rendering.

```tsx
// ❌ This crashes on the server
const theme = localStorage.getItem('theme');
```

**Solution:** Use useEffect or dynamic imports.

```tsx
// ✅ Fixed with useEffect
"use client";

function ThemeLoader() {
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    setTheme(localStorage.getItem('theme'));
  }, []);

  return <div data-theme={theme}>...</div>;
}
```

---

#### Pitfall 3: Hydration Mismatch

**Problem:** Server and client render different content.

```tsx
// ❌ This causes hydration errors
function Timestamp() {
  return <span>{new Date().toISOString()}</span>; // Different on server vs client!
}
```

**Solution:** Use `suppressHydrationWarning` or render client-only.

```tsx
// ✅ Fixed
"use client";

function Timestamp() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    setTime(new Date().toISOString());
  }, []);

  return <span suppressHydrationWarning>{time}</span>;
}
```

---

#### Pitfall 4: Passing Functions to Client Components

**Problem:** Trying to pass a function from Server to Client component.

```tsx
// ❌ Functions can't be serialized
async function Page() {
  const handleClick = () => console.log('clicked');
  return <ClientButton onClick={handleClick} />; // Error!
}
```

**Solution:** Define the function in the client component or use Server Actions.

```tsx
// ✅ Fixed with Server Action
// actions.ts
"use server";
export async function handleClick() {
  console.log('clicked on server');
}

// page.tsx
import { handleClick } from './actions';
export default function Page() {
  return <ClientButton action={handleClick} />;
}
```

---

#### Pitfall 5: Environment Variables Not Available

**Problem:** Client-side code can't access server env vars.

```tsx
// ❌ This will be undefined on client
const apiKey = process.env.API_SECRET_KEY;
```

**Solution:** Use `NEXT_PUBLIC_` prefix for client-side variables.

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.example.com  # ✅ Available on client
API_SECRET_KEY=secret123                       # ❌ Server only
```

---

#### Pitfall 6: Incorrect Params Access in Next.js 16

**Problem:** Params are now async in Next.js 16.

```tsx
// ❌ Old pattern (Next.js 14)
function Page({ params }: { params: { id: string } }) {
  return <div>{params.id}</div>;
}

// ✅ New pattern (Next.js 16)
async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div>{id}</div>;
}
```

---

### Quick Reference: Import Changes

| Vite Import | Next.js Import |
|-------------|----------------|
| `react-router-dom` → `Link` | `next/link` → `Link` |
| `react-router-dom` → `useNavigate` | `next/navigation` → `useRouter` |
| `react-router-dom` → `useParams` | Component props (`params`) |
| `react-router-dom` → `useSearchParams` | `next/navigation` → `useSearchParams` |
| `react-helmet-async` → `Helmet` | `next` → `Metadata` export |

---

## Additional Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Next.js Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading)
- [TanStack Query with Next.js](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)

---

*Last updated: December 2025*
*Migration: Vite 5.x → Next.js 16.x*
