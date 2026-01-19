# Backend Integration Guide - Tutorial Progress API

## Quick Start for Backend Team

This guide provides everything needed to implement the tutorial progress API endpoints that the frontend expects.

## Prerequisites

- PostgreSQL database access
- Authentication middleware (JWT/Session)
- API framework (FastAPI, Express, Django, etc.)

## Step 1: Deploy Database Schema

Run the following SQL to create tables:

```sql
-- Main progress table
CREATE TABLE tutorial_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutorial_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    chapters_completed INTEGER DEFAULT 0,
    total_chapters INTEGER DEFAULT 0,
    certificate_eligible BOOLEAN DEFAULT FALSE,
    certificate_earned BOOLEAN DEFAULT FALSE,
    total_watch_time INTEGER DEFAULT 0,
    last_watched_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tutorial_id, user_id)
);

-- Chapter progress table
CREATE TABLE chapter_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    progress_id UUID NOT NULL REFERENCES tutorial_progress(id) ON DELETE CASCADE,
    chapter_id VARCHAR(255) NOT NULL,
    watch_time INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    last_position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(progress_id, chapter_id)
);

-- Quiz scores table
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
    UNIQUE(progress_id, quiz_id)
);

-- Indexes for performance
CREATE INDEX idx_tutorial_progress_user_id ON tutorial_progress(user_id);
CREATE INDEX idx_tutorial_progress_tutorial_id ON tutorial_progress(tutorial_id);
CREATE INDEX idx_tutorial_progress_last_watched ON tutorial_progress(last_watched_at DESC);
CREATE INDEX idx_chapter_progress_progress_id ON chapter_progress(progress_id);
CREATE INDEX idx_quiz_scores_progress_id ON quiz_scores(progress_id);
```

## Step 2: Implement Endpoints

### Base URL Structure

```
https://api.ainative.studio/v1/tutorials/progress
```

### Endpoint 1: Get Progress

**Route**: `GET /v1/tutorials/progress/:tutorialId`

**Query Parameters**:
- `userId` (optional): User identifier from session if not provided

**Implementation Logic**:
```python
async def get_progress(tutorial_id: str, user_id: str = None):
    # Get user_id from session if not provided
    if not user_id:
        user_id = get_user_from_session()

    # Query database
    progress = await db.fetch_one("""
        SELECT * FROM tutorial_progress
        WHERE tutorial_id = $1 AND user_id = $2
    """, tutorial_id, user_id)

    if not progress:
        # Return default progress
        return {
            "tutorialId": tutorial_id,
            "userId": user_id,
            "completionPercentage": 0,
            "chaptersCompleted": 0,
            "totalChapters": 0,
            "chapterProgress": [],
            "quizScores": [],
            "certificateEligible": False,
            "certificateEarned": False,
            "totalWatchTime": 0,
            "lastWatchedAt": None
        }

    # Fetch related data
    chapters = await db.fetch_all("""
        SELECT chapter_id, watch_time, completed, last_position
        FROM chapter_progress
        WHERE progress_id = $1
    """, progress['id'])

    quizzes = await db.fetch_all("""
        SELECT quiz_id, score, max_score, passed, attempts, completed_at
        FROM quiz_scores
        WHERE progress_id = $1
    """, progress['id'])

    # Transform to expected format
    return {
        "tutorialId": progress['tutorial_id'],
        "userId": progress['user_id'],
        "completionPercentage": progress['completion_percentage'],
        "chaptersCompleted": progress['chapters_completed'],
        "totalChapters": progress['total_chapters'],
        "chapterProgress": [
            {
                "chapterId": c['chapter_id'],
                "watchTime": c['watch_time'],
                "completed": c['completed'],
                "lastPosition": c['last_position']
            } for c in chapters
        ],
        "quizScores": [
            {
                "quizId": q['quiz_id'],
                "score": q['score'],
                "maxScore": q['max_score'],
                "passed": q['passed'],
                "attempts": q['attempts'],
                "completedAt": q['completed_at'].isoformat()
            } for q in quizzes
        ],
        "certificateEligible": progress['certificate_eligible'],
        "certificateEarned": progress['certificate_earned'],
        "totalWatchTime": progress['total_watch_time'],
        "lastWatchedAt": progress['last_watched_at'].isoformat() if progress['last_watched_at'] else None
    }
```

### Endpoint 2: Update Chapter Progress

**Route**: `POST /v1/tutorials/progress/:tutorialId/chapter`

**Request Body**:
```json
{
  "userId": "string (optional)",
  "chapterId": "string (required)",
  "watchTime": "number (required)",
  "completed": "boolean (optional, default: false)",
  "lastPosition": "number (optional, default: watchTime)",
  "totalChapters": "number (optional)"
}
```

**Implementation Logic**:
```python
async def update_chapter_progress(tutorial_id: str, data: dict):
    user_id = data.get('userId') or get_user_from_session()
    chapter_id = data['chapterId']
    watch_time = data['watchTime']
    completed = data.get('completed', False)
    last_position = data.get('lastPosition', watch_time)
    total_chapters = data.get('totalChapters')

    # Get or create progress record
    progress = await db.fetch_one("""
        INSERT INTO tutorial_progress (tutorial_id, user_id, total_chapters)
        VALUES ($1, $2, $3)
        ON CONFLICT (tutorial_id, user_id)
        DO UPDATE SET
            total_chapters = GREATEST(tutorial_progress.total_chapters, $3),
            updated_at = NOW()
        RETURNING *
    """, tutorial_id, user_id, total_chapters or 0)

    # Upsert chapter progress
    await db.execute("""
        INSERT INTO chapter_progress (progress_id, chapter_id, watch_time, completed, last_position)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (progress_id, chapter_id)
        DO UPDATE SET
            watch_time = GREATEST(chapter_progress.watch_time, $3),
            completed = $4,
            last_position = $5,
            updated_at = NOW()
    """, progress['id'], chapter_id, watch_time, completed, last_position)

    # Recalculate stats
    stats = await db.fetch_one("""
        SELECT
            COUNT(*) FILTER (WHERE completed = true) as completed_count,
            SUM(watch_time) as total_watch_time
        FROM chapter_progress
        WHERE progress_id = $1
    """, progress['id'])

    completion_percentage = 0
    if progress['total_chapters'] > 0:
        completion_percentage = min(100, int((stats['completed_count'] / progress['total_chapters']) * 100))

    # Check certificate eligibility
    all_quizzes_passed = await db.fetch_one("""
        SELECT CASE
            WHEN COUNT(*) = 0 THEN true
            WHEN COUNT(*) = COUNT(*) FILTER (WHERE passed = true) THEN true
            ELSE false
        END as all_passed
        FROM quiz_scores WHERE progress_id = $1
    """, progress['id'])

    certificate_eligible = (
        completion_percentage >= 95 and
        all_quizzes_passed['all_passed']
    )

    # Update progress record
    await db.execute("""
        UPDATE tutorial_progress SET
            chapters_completed = $1,
            total_watch_time = $2,
            completion_percentage = $3,
            certificate_eligible = $4,
            last_watched_at = NOW(),
            updated_at = NOW()
        WHERE id = $5
    """, stats['completed_count'], stats['total_watch_time'],
        completion_percentage, certificate_eligible, progress['id'])

    # Return updated progress
    return await get_progress(tutorial_id, user_id)
```

### Endpoint 3: Update Quiz Score

**Route**: `POST /v1/tutorials/progress/:tutorialId/quiz`

**Request Body**:
```json
{
  "userId": "string (optional)",
  "quizId": "string (required)",
  "score": "number (required)",
  "maxScore": "number (required)",
  "passed": "boolean (required)"
}
```

**Implementation Logic**:
```python
async def update_quiz_score(tutorial_id: str, data: dict):
    user_id = data.get('userId') or get_user_from_session()
    quiz_id = data['quizId']
    score = data['score']
    max_score = data['maxScore']
    passed = data['passed']

    # Validate score
    if score < 0 or score > max_score:
        raise ValueError("Score must be between 0 and maxScore")

    # Get or create progress record
    progress = await db.fetch_one("""
        INSERT INTO tutorial_progress (tutorial_id, user_id)
        VALUES ($1, $2)
        ON CONFLICT (tutorial_id, user_id)
        DO UPDATE SET updated_at = NOW()
        RETURNING *
    """, tutorial_id, user_id)

    # Upsert quiz score
    await db.execute("""
        INSERT INTO quiz_scores (progress_id, quiz_id, score, max_score, passed, attempts)
        VALUES ($1, $2, $3, $4, $5, 1)
        ON CONFLICT (progress_id, quiz_id)
        DO UPDATE SET
            score = GREATEST(quiz_scores.score, $3),
            passed = quiz_scores.passed OR $5,
            attempts = quiz_scores.attempts + 1,
            completed_at = NOW(),
            updated_at = NOW()
    """, progress['id'], quiz_id, score, max_score, passed)

    # Update certificate eligibility
    all_quizzes_passed = await db.fetch_one("""
        SELECT COUNT(*) = COUNT(*) FILTER (WHERE passed = true) as all_passed
        FROM quiz_scores WHERE progress_id = $1
    """, progress['id'])

    certificate_eligible = (
        progress['completion_percentage'] >= 95 and
        all_quizzes_passed['all_passed']
    )

    await db.execute("""
        UPDATE tutorial_progress SET
            certificate_eligible = $1,
            last_watched_at = NOW(),
            updated_at = NOW()
        WHERE id = $2
    """, certificate_eligible, progress['id'])

    # Return updated progress
    return await get_progress(tutorial_id, user_id)
```

### Endpoint 4: Complete Tutorial

**Route**: `POST /v1/tutorials/progress/:tutorialId/complete`

**Request Body**:
```json
{
  "userId": "string (optional)"
}
```

**Implementation Logic**:
```python
async def complete_tutorial(tutorial_id: str, data: dict):
    user_id = data.get('userId') or get_user_from_session()

    # Get progress
    progress = await db.fetch_one("""
        SELECT * FROM tutorial_progress
        WHERE tutorial_id = $1 AND user_id = $2
    """, tutorial_id, user_id)

    if not progress:
        raise NotFoundError("No progress found for this tutorial")

    if not progress['certificate_eligible']:
        raise BadRequestError("Not eligible for certificate")

    # Mark as complete
    await db.execute("""
        UPDATE tutorial_progress SET
            certificate_earned = true,
            completion_percentage = 100,
            last_watched_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
    """, progress['id'])

    # Return updated progress
    return await get_progress(tutorial_id, user_id)
```

### Endpoint 5: Reset Progress

**Route**: `DELETE /v1/tutorials/progress/:tutorialId`

**Query Parameters**:
- `userId` (optional): User identifier from session if not provided

**Implementation Logic**:
```python
async def reset_progress(tutorial_id: str, user_id: str = None):
    if not user_id:
        user_id = get_user_from_session()

    # Delete progress (cascade will handle related records)
    result = await db.execute("""
        DELETE FROM tutorial_progress
        WHERE tutorial_id = $1 AND user_id = $2
    """, tutorial_id, user_id)

    return {"success": True, "message": "Progress reset successfully"}
```

## Step 3: Add Middleware

### Authentication

```python
@app.middleware("http")
async def authenticate_user(request: Request, call_next):
    # Extract user from session/JWT
    user_id = extract_user_from_token(request)

    # Store in request context
    request.state.user_id = user_id

    response = await call_next(request)
    return response
```

### Rate Limiting

```python
# Rate limits per endpoint
RATE_LIMITS = {
    "GET /progress": "60/minute",
    "POST /chapter": "30/minute",
    "POST /quiz": "10/minute",
    "POST /complete": "5/minute",
    "DELETE /progress": "5/minute"
}
```

## Step 4: Add Error Handling

```python
@app.exception_handler(Exception)
async def handle_errors(request: Request, exc: Exception):
    if isinstance(exc, NotFoundError):
        return JSONResponse(
            status_code=404,
            content={"error": str(exc)}
        )
    elif isinstance(exc, BadRequestError):
        return JSONResponse(
            status_code=400,
            content={"error": str(exc)}
        )
    else:
        # Log error
        logger.error(f"Unexpected error: {exc}", exc_info=True)

        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error"}
        )
```

## Step 5: Testing

### Manual Testing

```bash
# Test get progress
curl -X GET "https://api.ainative.studio/v1/tutorials/progress/test-tutorial?userId=user-123" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test update chapter
curl -X POST "https://api.ainative.studio/v1/tutorials/progress/test-tutorial/chapter" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "chapterId": "chapter-1",
    "watchTime": 300,
    "completed": true,
    "totalChapters": 8
  }'

# Test update quiz
curl -X POST "https://api.ainative.studio/v1/tutorials/progress/test-tutorial/quiz" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "quizId": "quiz-1",
    "score": 8,
    "maxScore": 10,
    "passed": true
  }'

# Test complete
curl -X POST "https://api.ainative.studio/v1/tutorials/progress/test-tutorial/complete" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-123"}'

# Test reset
curl -X DELETE "https://api.ainative.studio/v1/tutorials/progress/test-tutorial?userId=user-123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Integration Tests

```python
def test_progress_flow():
    # 1. Get initial progress (should be default)
    response = client.get("/v1/tutorials/progress/test-tutorial")
    assert response.json()["completionPercentage"] == 0

    # 2. Update chapter progress
    response = client.post(
        "/v1/tutorials/progress/test-tutorial/chapter",
        json={
            "chapterId": "chapter-1",
            "watchTime": 300,
            "completed": True,
            "totalChapters": 2
        }
    )
    assert response.json()["completionPercentage"] == 50

    # 3. Complete second chapter
    response = client.post(
        "/v1/tutorials/progress/test-tutorial/chapter",
        json={
            "chapterId": "chapter-2",
            "watchTime": 250,
            "completed": True,
            "totalChapters": 2
        }
    )
    assert response.json()["completionPercentage"] == 100
    assert response.json()["certificateEligible"] == True

    # 4. Complete tutorial
    response = client.post("/v1/tutorials/progress/test-tutorial/complete")
    assert response.json()["certificateEarned"] == True
```

## Step 6: Monitoring

Add logging and metrics:

```python
import time
from prometheus_client import Counter, Histogram

# Metrics
request_count = Counter('api_requests_total', 'Total API requests', ['endpoint', 'status'])
request_duration = Histogram('api_request_duration_seconds', 'Request duration', ['endpoint'])

@app.middleware("http")
async def track_metrics(request: Request, call_next):
    start_time = time.time()

    response = await call_next(request)

    duration = time.time() - start_time
    endpoint = request.url.path

    request_count.labels(endpoint=endpoint, status=response.status_code).inc()
    request_duration.labels(endpoint=endpoint).observe(duration)

    return response
```

## Performance Targets

| Metric | Target |
|--------|--------|
| Avg Response Time | < 200ms |
| P95 Response Time | < 500ms |
| Error Rate | < 1% |
| Availability | 99.9% |

## Security Checklist

- [ ] All endpoints require authentication
- [ ] Users can only access their own data
- [ ] Input validation on all fields
- [ ] SQL injection prevention (use parameterized queries)
- [ ] Rate limiting enabled
- [ ] CORS configured correctly
- [ ] HTTPS enforced
- [ ] Sensitive data encrypted at rest

## Deployment Checklist

- [ ] Database schema deployed
- [ ] All endpoints implemented
- [ ] Integration tests passing
- [ ] Performance tests passing
- [ ] Security scan completed
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Staging environment tested
- [ ] Production deployment scheduled

## Support

For questions or issues:
- **GitHub Issue**: #337
- **Frontend Team**: dev-team@ainative.studio
- **DevOps**: devops@ainative.studio
