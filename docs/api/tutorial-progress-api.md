# Tutorial Progress API Reference

## Overview

API endpoints for managing tutorial progress, chapter completion, quiz scores, and certificate awards.

**Base URL**: `/api/tutorials/[id]/progress`

**Authentication**: Optional (anonymous users supported with session-based tracking)

## Endpoints

### Get Tutorial Progress

Retrieve progress for a specific tutorial and user.

```
GET /api/tutorials/[id]/progress
```

#### Parameters

| Name | Type | Location | Required | Description |
|------|------|----------|----------|-------------|
| id | string | path | Yes | Tutorial identifier |

#### Response

**Status: 200 OK**

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
    },
    {
      "chapterId": "chapter-2",
      "watchTime": 150,
      "completed": false,
      "lastPosition": 150
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

#### Error Responses

**Status: 500 Internal Server Error**

```json
{
  "error": "Failed to get tutorial progress",
  "details": "Network error"
}
```

---

### Update Chapter Progress

Update watch time and completion status for a specific chapter.

```
POST /api/tutorials/[id]/progress/chapter
```

#### Parameters

| Name | Type | Location | Required | Description |
|------|------|----------|----------|-------------|
| id | string | path | Yes | Tutorial identifier |

#### Request Body

```json
{
  "chapterId": "chapter-1",
  "watchTime": 300,
  "completed": true,
  "lastPosition": 300,
  "totalChapters": 8
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| chapterId | string | Yes | Chapter identifier |
| watchTime | number | Yes | Total watch time in seconds |
| completed | boolean | No | Chapter completion status (default: false) |
| lastPosition | number | No | Last video position in seconds (default: watchTime) |
| totalChapters | number | No | Total chapters in tutorial (for completion calculation) |

#### Response

**Status: 200 OK**

```json
{
  "success": true,
  "progress": {
    // Full TutorialProgress object
  }
}
```

#### Error Responses

**Status: 400 Bad Request**

```json
{
  "error": "Invalid request: chapterId and watchTime are required"
}
```

**Status: 500 Internal Server Error**

```json
{
  "error": "Failed to update chapter progress",
  "details": "Network error"
}
```

---

### Record Quiz Score

Record a quiz attempt with score and pass/fail status.

```
POST /api/tutorials/[id]/progress/quiz
```

#### Parameters

| Name | Type | Location | Required | Description |
|------|------|----------|----------|-------------|
| id | string | path | Yes | Tutorial identifier |

#### Request Body

```json
{
  "quizId": "quiz-1",
  "score": 8,
  "maxScore": 10,
  "passed": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| quizId | string | Yes | Quiz identifier |
| score | number | Yes | Score achieved (0 to maxScore) |
| maxScore | number | Yes | Maximum possible score |
| passed | boolean | No | Override pass status (default: score >= 70% of maxScore) |

#### Response

**Status: 200 OK**

```json
{
  "success": true,
  "passed": true,
  "progress": {
    // Full TutorialProgress object
  }
}
```

#### Error Responses

**Status: 400 Bad Request**

```json
{
  "error": "Invalid request: quizId, score, and maxScore are required"
}
```

```json
{
  "error": "Invalid score: must be between 0 and maxScore"
}
```

**Status: 500 Internal Server Error**

```json
{
  "error": "Failed to record quiz score",
  "details": "Network error"
}
```

---

### Complete Tutorial

Mark tutorial as complete and earn certificate (if eligible).

```
POST /api/tutorials/[id]/complete
```

#### Parameters

| Name | Type | Location | Required | Description |
|------|------|----------|----------|-------------|
| id | string | path | Yes | Tutorial identifier |

#### Request Body

Empty (user context from session)

#### Response

**Status: 200 OK**

```json
{
  "success": true,
  "message": "Tutorial completed successfully!",
  "certificateEarned": true,
  "progress": {
    // Full TutorialProgress object with certificateEarned: true
  }
}
```

#### Error Responses

**Status: 400 Bad Request** (Not Eligible)

```json
{
  "error": "Not eligible for certificate",
  "message": "Complete all chapters and pass all quizzes to earn certificate",
  "eligibility": {
    "chaptersComplete": false,
    "quizzesPassed": true,
    "currentCompletion": 85,
    "passedQuizzes": 3,
    "totalQuizzes": 3
  }
}
```

**Status: 500 Internal Server Error**

```json
{
  "error": "Failed to complete tutorial",
  "details": "Network error"
}
```

---

### Reset Progress

Delete all progress for a tutorial.

```
DELETE /api/tutorials/[id]/progress
```

#### Parameters

| Name | Type | Location | Required | Description |
|------|------|----------|----------|-------------|
| id | string | path | Yes | Tutorial identifier |

#### Request Body

Empty (user context from session)

#### Response

**Status: 200 OK**

```json
{
  "success": true,
  "message": "Progress reset successfully"
}
```

#### Error Responses

**Status: 500 Internal Server Error**

```json
{
  "error": "Failed to reset tutorial progress",
  "details": "Network error"
}
```

---

## Data Models

### TutorialProgress

Main progress tracking object.

```typescript
interface TutorialProgress {
  tutorialId: string;
  userId: string | null;
  completionPercentage: number; // 0-100
  chaptersCompleted: number;
  totalChapters: number;
  chapterProgress: ChapterProgress[];
  quizScores: QuizScore[];
  certificateEligible: boolean;
  certificateEarned: boolean;
  totalWatchTime: number; // seconds
  lastWatchedAt: Date | null;
}
```

### ChapterProgress

Individual chapter watch progress.

```typescript
interface ChapterProgress {
  chapterId: string;
  watchTime: number; // seconds
  completed: boolean;
  lastPosition: number; // seconds
}
```

### QuizScore

Quiz attempt and result.

```typescript
interface QuizScore {
  quizId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  attempts: number;
  completedAt: Date;
}
```

## Business Rules

### Certificate Eligibility

A user is eligible for a certificate when:

1. **Chapter Completion**: `completionPercentage >= 95%`
2. **Quiz Passing**: All quizzes passed (score >= 70% of maxScore)

```typescript
certificateEligible = (
  completionPercentage >= 95 &&
  (quizScores.length === 0 || quizScores.every(q => q.passed))
);
```

### Completion Percentage

Calculated based on completed chapters:

```typescript
completionPercentage = Math.round(
  (chaptersCompleted / totalChapters) * 100
);
```

### Quiz Passing Threshold

Default passing score is 70% of maximum:

```typescript
const PASS_THRESHOLD = 0.7;
passed = score >= maxScore * PASS_THRESHOLD;
```

### Multiple Quiz Attempts

- Each attempt increments `attempts` counter
- Best score is kept: `score = Math.max(existingScore, newScore)`
- Once passed, `passed` remains true

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get progress
const progress = await fetch('/api/tutorials/intro-to-ai/progress')
  .then(r => r.json());

// Update chapter progress
await fetch('/api/tutorials/intro-to-ai/progress/chapter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chapterId: 'chapter-1',
    watchTime: 300,
    completed: true,
    totalChapters: 8
  })
});

// Record quiz score
await fetch('/api/tutorials/intro-to-ai/progress/quiz', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    quizId: 'quiz-1',
    score: 8,
    maxScore: 10
  })
});

// Complete tutorial
await fetch('/api/tutorials/intro-to-ai/complete', {
  method: 'POST'
});

// Reset progress
await fetch('/api/tutorials/intro-to-ai/progress', {
  method: 'DELETE'
});
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

function useTutorialProgress(tutorialId: string) {
  const [progress, setProgress] = useState<TutorialProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/tutorials/${tutorialId}/progress`)
      .then(r => r.json())
      .then(data => {
        setProgress(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [tutorialId]);

  const updateChapter = async (chapterData: ChapterProgress) => {
    const response = await fetch(
      `/api/tutorials/${tutorialId}/progress/chapter`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chapterData)
      }
    );
    const data = await response.json();
    setProgress(data.progress);
  };

  return { progress, loading, error, updateChapter };
}
```

## Rate Limiting

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| GET progress | 60 requests | 1 minute |
| POST chapter | 30 requests | 1 minute |
| POST quiz | 10 requests | 1 minute |
| POST complete | 5 requests | 1 minute |
| DELETE progress | 5 requests | 1 minute |

## Performance

### Target Metrics

- **Latency**: < 200ms average, < 500ms p95
- **Availability**: 99.9% uptime
- **Error Rate**: < 1%

### Optimization Tips

1. **Batch Updates**: Update chapter progress every 30 seconds instead of every second
2. **Cache Results**: Use React Query or SWR for client-side caching
3. **Debounce**: Debounce rapid updates (e.g., video scrubbing)

## Troubleshooting

### Progress Not Saving

**Issue**: Updates return 500 errors

**Solutions**:
1. Check authentication status
2. Verify network connectivity
3. Check browser console for errors
4. Try refreshing the page

**Fallback**: Service automatically uses localStorage

### Certificate Not Awarded

**Issue**: `certificateEligible` is false

**Solutions**:
1. Check `completionPercentage` >= 95%
2. Verify all quizzes are passed
3. Review `eligibility` object in error response

### Progress Lost After Refresh

**Issue**: Progress resets on page reload

**Solutions**:
1. Check if user is authenticated
2. Verify localStorage permissions
3. Check for browser incognito mode
4. Review browser console for API errors

## See Also

- [Database Schema](/docs/database/tutorial-progress-schema.md)
- [Migration Guide](/docs/migration/tutorial-progress-migration-guide.md)
- [Implementation Details](/docs/tutorials/PERSISTENT_STORAGE_IMPLEMENTATION.md)
- [Service Documentation](/services/tutorialProgressService.ts)
