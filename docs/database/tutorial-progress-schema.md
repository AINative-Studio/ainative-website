# Tutorial Progress Database Schema

## Overview

This document describes the database schema for persistent tutorial progress storage. The schema is designed to support user progress tracking across tutorials, chapters, quizzes, and certificate awards.

## Tables

### `tutorial_progress`

Primary table storing overall tutorial progress for each user.

```sql
CREATE TABLE tutorial_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutorial_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    chapters_completed INTEGER DEFAULT 0,
    total_chapters INTEGER DEFAULT 0,
    certificate_eligible BOOLEAN DEFAULT FALSE,
    certificate_earned BOOLEAN DEFAULT FALSE,
    total_watch_time INTEGER DEFAULT 0, -- in seconds
    last_watched_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Composite unique constraint: one progress record per user per tutorial
    UNIQUE(tutorial_id, user_id)
);

-- Indexes for common queries
CREATE INDEX idx_tutorial_progress_user_id ON tutorial_progress(user_id);
CREATE INDEX idx_tutorial_progress_tutorial_id ON tutorial_progress(tutorial_id);
CREATE INDEX idx_tutorial_progress_last_watched ON tutorial_progress(last_watched_at DESC);
CREATE INDEX idx_tutorial_progress_certificate_earned ON tutorial_progress(certificate_earned) WHERE certificate_earned = TRUE;
```

### `chapter_progress`

Detailed progress for individual chapters within tutorials.

```sql
CREATE TABLE chapter_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    progress_id UUID NOT NULL REFERENCES tutorial_progress(id) ON DELETE CASCADE,
    chapter_id VARCHAR(255) NOT NULL,
    watch_time INTEGER DEFAULT 0, -- in seconds
    completed BOOLEAN DEFAULT FALSE,
    last_position INTEGER DEFAULT 0, -- in seconds
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Composite unique constraint: one progress record per chapter per tutorial progress
    UNIQUE(progress_id, chapter_id)
);

-- Indexes
CREATE INDEX idx_chapter_progress_progress_id ON chapter_progress(progress_id);
CREATE INDEX idx_chapter_progress_chapter_id ON chapter_progress(chapter_id);
CREATE INDEX idx_chapter_progress_completed ON chapter_progress(completed) WHERE completed = TRUE;
```

### `quiz_scores`

Quiz attempt results and scores.

```sql
CREATE TABLE quiz_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    progress_id UUID NOT NULL REFERENCES tutorial_progress(id) ON DELETE CASCADE,
    quiz_id VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0),
    max_score INTEGER NOT NULL CHECK (max_score > 0),
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    attempts INTEGER DEFAULT 1,
    completed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Composite unique constraint: one score record per quiz per tutorial progress
    UNIQUE(progress_id, quiz_id)
);

-- Indexes
CREATE INDEX idx_quiz_scores_progress_id ON quiz_scores(progress_id);
CREATE INDEX idx_quiz_scores_quiz_id ON quiz_scores(quiz_id);
CREATE INDEX idx_quiz_scores_passed ON quiz_scores(passed) WHERE passed = TRUE;
CREATE INDEX idx_quiz_scores_completed_at ON quiz_scores(completed_at DESC);
```

### `tutorial_certificates`

Certificate records for completed tutorials (optional - for audit trail).

```sql
CREATE TABLE tutorial_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    progress_id UUID NOT NULL REFERENCES tutorial_progress(id) ON DELETE CASCADE,
    certificate_id VARCHAR(255) UNIQUE NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    tutorial_title VARCHAR(500) NOT NULL,
    difficulty VARCHAR(50),
    duration INTEGER, -- in minutes
    issued_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(progress_id)
);

-- Indexes
CREATE INDEX idx_tutorial_certificates_progress_id ON tutorial_certificates(progress_id);
CREATE INDEX idx_tutorial_certificates_certificate_id ON tutorial_certificates(certificate_id);
CREATE INDEX idx_tutorial_certificates_issued_at ON tutorial_certificates(issued_at DESC);
```

## Relationships

```
tutorial_progress (1) ─── (N) chapter_progress
tutorial_progress (1) ─── (N) quiz_scores
tutorial_progress (1) ─── (1) tutorial_certificates
```

## API Endpoints

### Backend API Endpoints (to be implemented)

These endpoints should be implemented on the backend API server:

#### `GET /v1/tutorials/progress/:tutorialId`
Get tutorial progress for authenticated user.

**Query Parameters:**
- `userId` (optional): User identifier

**Response:**
```json
{
  "tutorialId": "intro-to-ai",
  "userId": "user-123",
  "completionPercentage": 45,
  "chaptersCompleted": 3,
  "totalChapters": 8,
  "chapterProgress": [
    {
      "chapterId": "chapter-1",
      "watchTime": 300,
      "completed": true,
      "lastPosition": 300
    }
  ],
  "quizScores": [
    {
      "quizId": "quiz-1",
      "score": 8,
      "maxScore": 10,
      "passed": true,
      "attempts": 1,
      "completedAt": "2026-01-19T12:00:00Z"
    }
  ],
  "certificateEligible": false,
  "certificateEarned": false,
  "totalWatchTime": 1200,
  "lastWatchedAt": "2026-01-19T12:30:00Z"
}
```

#### `POST /v1/tutorials/progress/:tutorialId/chapter`
Update chapter progress.

**Request Body:**
```json
{
  "userId": "user-123",
  "chapterId": "chapter-1",
  "watchTime": 300,
  "completed": true,
  "lastPosition": 300,
  "totalChapters": 8
}
```

#### `POST /v1/tutorials/progress/:tutorialId/quiz`
Record quiz score.

**Request Body:**
```json
{
  "userId": "user-123",
  "quizId": "quiz-1",
  "score": 8,
  "maxScore": 10,
  "passed": true
}
```

#### `POST /v1/tutorials/progress/:tutorialId/complete`
Mark tutorial as complete and earn certificate.

**Request Body:**
```json
{
  "userId": "user-123"
}
```

#### `DELETE /v1/tutorials/progress/:tutorialId`
Reset tutorial progress.

**Query Parameters:**
- `userId` (optional): User identifier

## Data Migration

### Migration Strategy

1. **Dual-Write Phase** (Weeks 1-2):
   - Write to both in-memory storage and database
   - Read from database with localStorage fallback
   - Monitor for errors and performance

2. **Database-Only Phase** (Week 3+):
   - Remove in-memory storage
   - Database as primary source
   - localStorage only for offline fallback

3. **Cleanup Phase** (Week 4+):
   - Migrate remaining localStorage data
   - Remove migration utilities
   - Archive old localStorage data

### Migration Scripts

See `/services/tutorialProgressService.ts` for migration utilities:
- `migrateLocalStorageToBackend()` - Migrate single tutorial
- `migrateAllLocalStorage()` - Batch migrate all tutorials

## Performance Considerations

### Caching Strategy

1. **Client-Side Cache**:
   - localStorage as read-through cache
   - 5-minute TTL for progress data
   - Invalidate on updates

2. **Server-Side Cache** (Backend):
   - Redis cache for frequently accessed progress
   - 1-hour TTL
   - Cache key: `tutorial_progress:{userId}:{tutorialId}`

### Query Optimization

1. Use composite indexes for common queries
2. Implement pagination for large result sets
3. Use `SELECT` with specific columns instead of `SELECT *`
4. Batch operations when possible

### Database Constraints

- **Foreign Keys**: Ensure referential integrity
- **Check Constraints**: Validate data at database level
- **Unique Constraints**: Prevent duplicate entries
- **Not Null**: Enforce required fields

## Security Considerations

1. **Authentication**: All endpoints require user authentication
2. **Authorization**: Users can only access their own progress
3. **Input Validation**: Sanitize and validate all inputs
4. **SQL Injection Prevention**: Use parameterized queries
5. **Rate Limiting**: Apply per-user rate limits

## Backup & Recovery

1. **Daily Backups**: Automated database backups
2. **Point-in-Time Recovery**: Enable PITR for PostgreSQL
3. **Retention Policy**: Keep backups for 30 days
4. **Testing**: Regular restore testing

## Monitoring & Alerts

### Metrics to Track

- Query performance (p95, p99 latency)
- Error rates per endpoint
- Database connection pool usage
- Cache hit/miss ratio
- Storage growth rate

### Alerts

- Query latency > 500ms
- Error rate > 1%
- Connection pool > 80% utilized
- Disk usage > 80%

## Future Enhancements

1. **Analytics**: Track popular tutorials and completion rates
2. **Leaderboards**: Compare progress across users
3. **Social Features**: Share progress and certificates
4. **Offline Sync**: Robust offline-first architecture
5. **Real-time Updates**: WebSocket for live progress updates
