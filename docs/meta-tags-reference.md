# Meta Tags Reference - AI Native Studio

## Overview

This document provides a comprehensive reference for all meta tags implemented in the AI Native Studio Next.js website. These tags are crucial for SEO, social sharing, search engine crawling, and browser behavior.

---

## Implementation Location

**File**: `/Users/aideveloper/ainative-website-nextjs-staging/app/layout.tsx`

All meta tags are defined in the root layout's `metadata` export, which Next.js automatically converts to HTML meta tags.

---

## Meta Tag Categories

### 1. Basic SEO Meta Tags

```typescript
title: {
  default: 'AI Native Studio | Quantum-Enhanced Development Environment for Modern Developers',
  template: '%s | AI Native Studio',
}
description: 'Experience the next generation of software development with AI Native Studio...'
keywords: [
  'AI code editor',
  'AI coding assistant',
  'agentic IDE',
  // ... extensive keyword list
]
```

**Purpose**:
- `title`: Primary page title and template for child pages
- `description`: Meta description for search results (155-160 characters optimal)
- `keywords`: Target keywords for SEO (though less important for modern search engines)

---

### 2. Authorship & Ownership

```typescript
authors: [{ name: 'AI Native Studio', url: siteUrl }]
creator: 'AI Native Studio'
publisher: 'AI Native Studio'
```

**Purpose**:
- Establishes content ownership and authorship
- Used by search engines for attribution
- Supports E-A-T (Expertise, Authoritativeness, Trustworthiness) signals

**Extended Tags** (in `other`):
```typescript
'article:publisher': 'AI Native Studio'
'article:author': 'AI Native Studio'
'generator': 'AI Native Studio'
'copyright': '© 2025 AI Native Studio. All rights reserved.'
```

---

### 3. Search Engine Crawling Directives

```typescript
robots: {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
}
```

**Purpose**:
- `index`: Allow search engines to index the page
- `follow`: Allow crawlers to follow links on the page
- `max-video-preview`: -1 = no limit on video preview duration
- `max-image-preview`: 'large' = allow large image previews in search results
- `max-snippet`: -1 = no limit on text snippet length

**Extended Tags** (in `other`):
```typescript
'revisit-after': '7 days'
'rating': 'general'
'distribution': 'global'
```

- `revisit-after`: Suggests crawl frequency (though search engines may ignore)
- `rating`: Content rating for filtering systems
- `distribution`: Target audience scope

---

### 4. Open Graph (Social Sharing)

```typescript
openGraph: {
  type: 'website',
  locale: 'en_US',
  url: siteUrl,
  siteName: 'AI Native Studio',
  title: 'AI Native Studio | Quantum-Enhanced Development Environment',
  description: 'Experience the future of coding with AI Native Studio...',
  images: [
    {
      url: '/card.png',
      width: 1200,
      height: 630,
      alt: 'AI Native Studio - Next-Gen Quantum Development Environment',
      type: 'image/png',
    },
  ],
}
```

**Purpose**:
- Controls how content appears when shared on Facebook, LinkedIn, WhatsApp
- `images`: OG image should be 1200x630px for optimal display
- Used by 200+ social platforms and messaging apps

**Meta Tags Generated**:
```html
<meta property="og:type" content="website" />
<meta property="og:locale" content="en_US" />
<meta property="og:url" content="https://www.ainative.studio" />
<meta property="og:site_name" content="AI Native Studio" />
<meta property="og:title" content="AI Native Studio | ..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="/card.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

---

### 5. Twitter Cards

```typescript
twitter: {
  card: 'summary_large_image',
  site: '@AINativeStudio',
  creator: '@AINativeStudio',
  title: 'AI Native Studio | Quantum-Enhanced Development Environment',
  description: 'Experience the future of coding with AI Native Studio...',
  images: ['/card.png'],
}
```

**Purpose**:
- Controls Twitter/X preview cards
- `summary_large_image`: Large image card format (optimal for visual content)
- `site` and `creator`: Twitter handles for attribution

**Meta Tags Generated**:
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@AINativeStudio" />
<meta name="twitter:creator" content="@AINativeStudio" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="/card.png" />
```

---

### 6. Canonical & Alternate URLs

```typescript
alternates: {
  canonical: siteUrl,
}
```

**Purpose**:
- Prevents duplicate content penalties
- Establishes the preferred URL for the page
- Critical for SEO

**Meta Tag Generated**:
```html
<link rel="canonical" href="https://www.ainative.studio" />
```

---

### 7. Icons & Manifest

```typescript
icons: {
  icon: '/code_simple_logo.jpg',
  apple: '/code_simple_logo.jpg',
}
manifest: '/manifest.json'
```

**Purpose**:
- `icon`: Browser favicon and app icon
- `apple`: Apple Touch Icon for iOS home screen
- `manifest`: PWA manifest for installable web app

**HTML Generated**:
```html
<link rel="icon" href="/code_simple_logo.jpg" />
<link rel="apple-touch-icon" href="/code_simple_logo.jpg" />
<link rel="manifest" href="/manifest.json" />
```

---

### 8. Mobile & PWA Meta Tags

```typescript
other: {
  'theme-color': '#4B6FED',
  'mobile-web-app-capable': 'yes',
  'apple-mobile-web-app-title': 'AI Native Studio',
  'apple-mobile-web-app-status-bar-style': 'default',
  'apple-mobile-web-app-capable': 'yes',
  'application-name': 'AI Native Studio',
  'msapplication-TileColor': '#4B6FED',
}
```

**Purpose**:
- `theme-color`: Browser UI color (mobile Chrome, Safari)
- `mobile-web-app-capable`: Enable fullscreen mode on iOS
- `apple-mobile-web-app-title`: App name when added to iOS home screen
- `apple-mobile-web-app-status-bar-style`: iOS status bar appearance
- `msapplication-TileColor`: Windows tile color

---

### 9. Extended Meta Tags (Issue #385 Additions)

```typescript
other: {
  // Localization & Accessibility
  'language': 'English',

  // Crawl Frequency
  'revisit-after': '7 days',

  // Content Classification
  'rating': 'general',
  'distribution': 'global',

  // Legal & Attribution
  'copyright': '© 2025 AI Native Studio. All rights reserved.',
  'generator': 'AI Native Studio',

  // Abstract Description (for non-JS crawlers)
  'abstract': 'Complete AI development platform with quantum computing support, vector databases, AI agents, and semantic search capabilities. Build full-stack applications with AI-powered code generation, multi-agent development workflows, and quantum-enhanced neural networks.',

  // Article-specific (Open Graph extensions)
  'article:publisher': 'AI Native Studio',
  'article:author': 'AI Native Studio',
}
```

**Purpose**:
- `language`: Declares primary content language
- `revisit-after`: Suggests to search engines how often to recrawl
- `rating`: Content rating for parental controls and filters
- `distribution`: Geographic distribution scope
- `copyright`: Legal copyright notice
- `generator`: Tool/platform that generated the site
- `abstract`: Detailed description for legacy crawlers without JavaScript
- `article:publisher` / `article:author`: Open Graph article extensions for content attribution

---

## Testing & Validation

### 1. HTML Validation
```bash
# W3C HTML Validator
curl -H "Content-Type: text/html; charset=utf-8" \
  --data-binary @dist/index.html \
  https://validator.w3.org/nu/?out=json
```

### 2. Meta Tag Verification
```bash
# Build production version
npm run build

# Start production server
npm run start

# Check meta tags
curl http://localhost:3000 | grep -E '<meta|<link'
```

### 3. Browser DevTools
- Open Network tab
- Reload page
- View HTML source
- Inspect `<head>` section
- Verify all meta tags are present

### 4. SEO Testing Tools

**Facebook Debugger**:
- URL: https://developers.facebook.com/tools/debug/
- Test Open Graph tags

**Twitter Card Validator**:
- URL: https://cards-dev.twitter.com/validator
- Test Twitter Card tags

**Google Rich Results Test**:
- URL: https://search.google.com/test/rich-results
- Test structured data

**LinkedIn Post Inspector**:
- URL: https://www.linkedin.com/post-inspector/
- Test LinkedIn sharing

---

## Meta Tag Best Practices

### Title Tags
- **Length**: 50-60 characters (desktop), 78 characters (mobile)
- **Format**: Primary Keyword | Brand Name
- **Uniqueness**: Every page should have unique title

### Description Tags
- **Length**: 155-160 characters (optimal)
- **Content**: Compelling summary with primary keywords
- **Call-to-Action**: Include action words

### Open Graph Images
- **Dimensions**: 1200x630px (recommended)
- **Format**: PNG or JPG
- **File Size**: Under 8MB
- **Aspect Ratio**: 1.91:1

### Keywords
- **Relevance**: Only include relevant, targeted keywords
- **Length**: 10-30 keywords (though less important for modern SEO)
- **Placement**: Most important keywords first

---

## Related Files

- **Layout**: `/Users/aideveloper/ainative-website-nextjs-staging/app/layout.tsx`
- **Structured Data**: `/Users/aideveloper/ainative-website-nextjs-staging/components/seo/StructuredData.tsx`
- **Sitemap**: `/Users/aideveloper/ainative-website-nextjs-staging/app/sitemap.ts`
- **Robots**: `/Users/aideveloper/ainative-website-nextjs-staging/app/robots.ts`
- **Manifest**: `/Users/aideveloper/ainative-website-nextjs-staging/public/manifest.json`

---

## References

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Google Search Central](https://developers.google.com/search/docs)
- [Schema.org](https://schema.org/)
- [W3C HTML Validator](https://validator.w3.org/)

---

## Changelog

**2025-01-18** - Issue #385: Extended Meta Tags
- Added `language`, `revisit-after`, `rating`, `distribution`
- Added `copyright`, `generator`, `abstract`
- Added `article:publisher`, `article:author`
- Created comprehensive documentation

**Previous**:
- Initial Next.js migration with core meta tags
- Open Graph and Twitter Card implementation
- Mobile and PWA meta tags
