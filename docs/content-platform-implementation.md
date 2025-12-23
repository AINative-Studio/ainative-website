# Content Platform Implementation - Stream B

## Overview

This document tracks the TDD implementation of Content Platform features from the Vite SPA to Next.js 16, including Strapi CMS integration, HLS video streaming, semantic search with ZeroDB, and comments system.

## Progress Summary

### Completed ✓

#### 1. Strapi Client Library (`lib/strapi-client.ts`)

**Status**: Implemented and tested (19/19 tests passing)

**Features**:
- TypeScript class-based client with axios
- Full CRUD operations for all content types:
  - Blog Posts
  - Videos (with view/like tracking)
  - Tutorials
  - Webinars (with attendee tracking)
  - Showcases
  - Events
- Typed interfaces for all entities
- Configurable base URL and timeout
- Comprehensive error handling
- Newsletter subscription support

**Test Coverage**:
- Client initialization
- All CRUD methods
- Error handling (network errors, timeouts)
- TypeScript type exports
- Environment configuration
- Custom parameters and filtering

**Key Exports**:
```typescript
- StrapiClient (class)
- strapiClient (singleton instance)
- Interfaces: BlogPost, Video, Tutorial, Webinar, Showcase, Event
- Types: StrapiResponse, Author, Tag, Category, QueryParams
```

**Strapi Endpoint**: `https://ainative-community-production.up.railway.app/api`

---

## Next Steps (Pending)

### 2. HLS Video Player Component

**Source Files**:
- `/home/quaid/Documents/Projects/ainative-studio/src/AINative-website/src/components/video/VideoPlayer.tsx`
- `/home/quaid/Documents/Projects/ainative-studio/src/AINative-website/src/hooks/useVideoPlayer.ts`
- `/home/quaid/Documents/Projects/ainative-studio/src/AINative-website/src/lib/videoPlayerConfig.ts`

**Target Implementation**:
- `components/video/HLSPlayer.tsx` (client component)
- `hooks/useVideoPlayer.ts` (video state management)
- `lib/videoPlayerConfig.ts` (HLS.js configuration)
- `components/video/__tests__/HLSPlayer.test.tsx`
- `hooks/__tests__/useVideoPlayer.test.ts`

**Key Features**:
- HLS.js integration with adaptive streaming
- Quality selection (360p, 720p, 1080p, auto)
- Playback speed control (0.5x - 2x)
- Volume control and mute
- Fullscreen and Picture-in-Picture
- Progress tracking with localStorage
- Keyboard shortcuts (space, arrows, f, m, p, 0-9)
- Buffer management
- Error recovery (network errors, media errors)
- Analytics tracking (play, pause, seek, quality change, etc.)

**Dependencies**:
- `hls.js` - HLS streaming library
- Custom video player CSS (`styles/video-player.css`)

### 3. Semantic Search with ZeroDB

**Source Files**:
- `/home/quaid/Documents/Projects/ainative-studio/src/AINative-website/src/lib/community/search.ts`
- `/home/quaid/Documents/Projects/ainative-studio/src/AINative-website/src/components/community/RelatedContent.tsx`

**Target Implementation**:
- `lib/services/semantic-search.ts`
- `lib/__tests__/semantic-search.test.ts`
- `components/content/RelatedContent.tsx`
- `components/content/RelatedContentCompact.tsx`
- `components/content/RelatedContentGrid.tsx`

**Key Features**:
- Semantic similarity search using ZeroDB vector database
- Content type filtering (blog posts, tutorials, videos, showcases)
- Similarity threshold configuration (default 0.7)
- Related content recommendations
- Search suggestions
- Metadata filtering (categories, tags)

**Search Flow**:
1. Query text → Strapi backend `/api/search`
2. Strapi → ZeroDB MCP (generates embeddings, performs vector search)
3. Results with similarity scores → Frontend
4. Display with content type icons and badges

**ZeroDB Integration**:
- Uses MCP tools via Strapi backend (no direct ZeroDB credentials on frontend)
- Vector namespace: `ainative-community`
- Embedding model: `BAAI/bge-small-en-v1.5` (384 dimensions)
- Similarity metric: Cosine similarity

### 4. Video Watch Page

**Source Files**:
- `/home/quaid/Documents/Projects/ainative-studio/src/AINative-website/src/pages/VideoWatchPage.tsx`

**Target Implementation**:
- `app/community/videos/[slug]/page.tsx` (Server Component)
- `app/community/videos/[slug]/VideoWatchClient.tsx` (Client Component)
- `test/issue-XX-video-watch.test.sh` (validation script)

**Page Features**:
- Dynamic route with slug parameter
- SEO metadata (title, description, OG tags)
- HLS video player integration
- Video metadata display (views, likes, duration, published date)
- Author/creator information
- Tags with filtering links
- Like/share/bookmark actions
- Related videos sidebar (semantic search)
- Comments section (ZeroDB backend)
- View count tracking
- Responsive layout (video + sidebar)

**Server Component** (page.tsx):
- Fetch video data with Strapi client
- Generate metadata for SEO
- Handle 404 for non-existent videos
- Pass data to client component

**Client Component** (VideoWatchClient.tsx):
- Video player with HLS streaming
- Interactive UI (like, share, bookmark)
- Related videos with semantic search
- Comments integration
- Progress tracking

### 5. Comments System with ZeroDB

**Target Implementation**:
- `components/comments/CommentSection.tsx`
- `components/comments/CommentItem.tsx`
- `components/comments/CommentForm.tsx`
- `lib/services/comments-service.ts`
- `lib/__tests__/comments-service.test.ts`

**Features**:
- Add/view comments on videos, blog posts, tutorials
- ZeroDB storage via MCP tools
- Threaded/nested comments support
- Comment metadata (author, timestamp, content ID)
- Real-time updates (optional)
- Moderation flags (report/flag comments)
- Pagination for large comment threads

**ZeroDB Schema**:
```typescript
{
  id: string,
  content_type: 'video' | 'blog_post' | 'tutorial',
  content_id: number,
  author_name: string,
  author_email?: string,
  comment_text: string,
  parent_comment_id?: string, // For threading
  created_at: string,
  updated_at: string,
  is_flagged: boolean
}
```

**MCP Integration**:
- Use `zerodb_insert_rows` to add comments
- Use `zerodb_query_rows` to fetch comments by content_id
- Use `zerodb_update_rows` for editing/flagging
- Store in NoSQL table: `comments`

---

## File Structure Overview

```
ainative-nextjs/
├── app/
│   └── community/
│       └── videos/
│           ├── page.tsx (videos list)
│           └── [slug]/
│               ├── page.tsx (server component)
│               └── VideoWatchClient.tsx (client component)
├── components/
│   ├── video/
│   │   ├── HLSPlayer.tsx
│   │   └── __tests__/
│   │       └── HLSPlayer.test.tsx
│   ├── content/
│   │   ├── RelatedContent.tsx
│   │   ├── RelatedContentCompact.tsx
│   │   └── RelatedContentGrid.tsx
│   └── comments/
│       ├── CommentSection.tsx
│       ├── CommentItem.tsx
│       └── CommentForm.tsx
├── lib/
│   ├── strapi-client.ts ✓
│   ├── videoPlayerConfig.ts
│   ├── services/
│   │   ├── semantic-search.ts
│   │   └── comments-service.ts
│   └── __tests__/
│       ├── strapi-client.test.ts ✓
│       ├── semantic-search.test.ts
│       └── comments-service.test.ts
├── hooks/
│   ├── useVideoPlayer.ts
│   └── __tests__/
│       └── useVideoPlayer.test.ts
├── styles/
│   └── video-player.css
└── test/
    └── issue-XX-video-watch.test.sh
```

---

## Environment Variables Required

```env
# Already configured
NEXT_PUBLIC_STRAPI_URL=https://ainative-community-production.up.railway.app/api

# To be added
ZERODB_PROJECT_ID=<from ZeroDB dashboard>
ZERODB_API_KEY=<from ZeroDB dashboard>
```

---

## Testing Strategy

### TDD Workflow (RED-GREEN-REFACTOR)

1. **RED**: Write failing tests first
   - Define expected API contracts
   - Test error cases and edge cases
   - Test TypeScript types

2. **GREEN**: Implement to pass tests
   - Minimal implementation
   - Focus on correctness over optimization

3. **REFACTOR**: Build UI components
   - Add styling and polish
   - Optimize performance
   - Enhance UX

### Test Types

- **Unit Tests**: Individual functions, hooks, services (Jest)
- **Component Tests**: React components in isolation (React Testing Library)
- **Integration Tests**: End-to-end page flows (test scripts)
- **Type Tests**: TypeScript interface validation

---

## Next Actions

1. Create HLS video player test file (`components/video/__tests__/HLSPlayer.test.tsx`)
2. Implement HLS player component and useVideoPlayer hook
3. Create semantic search test file (`lib/__tests__/semantic-search.test.ts`)
4. Implement semantic search service with ZeroDB integration
5. Build video watch page with server/client components
6. Implement comments system with ZeroDB backend
7. Create validation test scripts for each page
8. Update environment variables and configuration

---

## Dependencies to Install

```bash
npm install hls.js
npm install --save-dev @types/hls.js
```

---

## Notes

- All commits must follow git rules (no Claude/Anthropic attribution)
- Follow existing Next.js patterns (server/client component separation)
- Use TypeScript strict mode
- Implement comprehensive error handling
- Maintain test coverage above 80%
- Use ZeroDB MCP tools via backend (no direct credentials on frontend)
- Follow accessibility guidelines (WCAG 2.1)

---

## Links

- Vite SPA Source: `/home/quaid/Documents/Projects/ainative-studio/src/AINative-website/`
- Next.js Target: `/home/quaid/Documents/Projects/ainative-studio/src/ainative-nextjs/`
- Strapi Production: `https://ainative-community-production.up.railway.app/`
- ZeroDB MCP: Available via configured MCP tools
