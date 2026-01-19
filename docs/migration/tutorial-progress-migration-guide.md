# Tutorial Progress Storage Migration Guide

## Overview

This guide covers the migration from in-memory storage to persistent database storage for tutorial progress tracking.

## Migration Timeline

### Phase 1: Preparation (Week 1)

#### Backend API Implementation

1. **Database Setup**
   ```sql
   -- Run schema creation scripts
   psql -U postgres -d ainative < docs/database/tutorial-progress-schema.sql
   ```

2. **API Endpoints Implementation**

   Create the following endpoints on your backend API (`https://api.ainative.studio`):

   - `GET /v1/tutorials/progress/:tutorialId`
   - `POST /v1/tutorials/progress/:tutorialId/chapter`
   - `POST /v1/tutorials/progress/:tutorialId/quiz`
   - `POST /v1/tutorials/progress/:tutorialId/complete`
   - `DELETE /v1/tutorials/progress/:tutorialId`

3. **Testing**
   ```bash
   # Run integration tests
   npm test services/__tests__/tutorialProgressService.test.ts
   ```

### Phase 2: Deployment (Week 2)

#### Step 1: Deploy Backend API

1. Deploy database schema to production
2. Deploy API endpoints
3. Verify endpoints are accessible:
   ```bash
   curl -X GET https://api.ainative.studio/v1/tutorials/progress/test-tutorial \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

#### Step 2: Deploy Frontend Changes

1. **Build and Test**
   ```bash
   npm run lint
   npm run type-check
   npm run build
   npm test
   ```

2. **Deploy to Staging**
   ```bash
   # Deploy to staging environment first
   git push staging main
   ```

3. **Smoke Test on Staging**
   - Load a tutorial page
   - Check browser console for errors
   - Verify progress is saved (check Network tab)
   - Test offline fallback (disable network, should still work)

4. **Deploy to Production**
   ```bash
   git push production main
   ```

### Phase 3: User Migration (Week 3)

#### Automatic Migration on App Load

The service includes automatic migration functionality. Users will have their localStorage data migrated to the backend automatically when they:

1. Visit any tutorial page
2. Their localStorage data will be detected
3. Migration will run in the background
4. Users continue without interruption

#### Manual Migration (Optional)

For power users or troubleshooting, provide a migration page:

```typescript
// app/migrate-tutorials/page.tsx
'use client';

import { useState } from 'react';
import TutorialProgressService from '@/services/tutorialProgressService';

export default function MigrateTutorialsPage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMigrate = async () => {
    setLoading(true);
    setStatus('Migrating...');

    try {
      // Get user ID from session
      const response = await fetch('/api/auth/session');
      const session = await response.json();
      const userId = session?.user?.id;

      const result = await TutorialProgressService.migrateAllLocalStorage(userId);

      setStatus(`
        Migration complete!
        - Migrated: ${result.migrated}
        - Failed: ${result.failed}
        ${result.errors.length > 0 ? '\n\nErrors:\n' + result.errors.join('\n') : ''}
      `);
    } catch (error) {
      setStatus(`Migration failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Migrate Tutorial Progress</h1>
      <p className="mb-4">
        Click the button below to migrate your tutorial progress from browser storage
        to our secure cloud storage.
      </p>
      <button
        onClick={handleMigrate}
        disabled={loading}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Migrating...' : 'Migrate Progress'}
      </button>
      {status && (
        <pre className="mt-4 p-4 bg-gray-100 rounded whitespace-pre-wrap">
          {status}
        </pre>
      )}
    </div>
  );
}
```

### Phase 4: Monitoring (Ongoing)

#### Key Metrics to Track

1. **API Performance**
   ```javascript
   // Monitor these metrics
   - Average response time: < 200ms
   - Error rate: < 1%
   - P95 latency: < 500ms
   ```

2. **Migration Success Rate**
   ```javascript
   // Track in analytics
   - Total migrations attempted
   - Successful migrations
   - Failed migrations (with error types)
   ```

3. **localStorage Usage**
   ```javascript
   // Monitor localStorage fallback usage
   - API failures triggering fallback
   - Offline usage patterns
   ```

#### Monitoring Dashboard

Set up monitoring for:

```javascript
// Example monitoring queries
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_progress_records,
  COUNT(DISTINCT user_id) as unique_users
FROM tutorial_progress
GROUP BY DATE(created_at)
ORDER BY date DESC;

SELECT
  tutorial_id,
  COUNT(*) as enrollments,
  AVG(completion_percentage) as avg_completion,
  COUNT(CASE WHEN certificate_earned THEN 1 END) as certificates_earned
FROM tutorial_progress
GROUP BY tutorial_id
ORDER BY enrollments DESC;
```

## Rollback Plan

If issues arise, you can rollback in stages:

### Stage 1: Emergency Rollback (< 5 minutes)

1. **Revert Frontend**
   ```bash
   # Revert to previous commit
   git revert HEAD
   git push production main
   ```

2. **Verify Old Code**
   - Ensure in-memory storage is working
   - localStorage reads are functional

### Stage 2: Database Rollback (if needed)

1. **Preserve Data**
   ```sql
   -- Backup progress data
   CREATE TABLE tutorial_progress_backup AS
   SELECT * FROM tutorial_progress;
   ```

2. **Optional: Clear Problematic Data**
   ```sql
   -- Only if corruption is detected
   DELETE FROM tutorial_progress WHERE updated_at > '2026-01-19';
   ```

## Troubleshooting

### Issue: API Returns 500 Errors

**Symptoms:**
- Progress not saving
- Console errors: "Failed to update chapter progress"

**Solution:**
1. Check API server logs
2. Verify database connection
3. Check rate limiting isn't blocking requests
4. Ensure authentication tokens are valid

**Fallback:**
- Service automatically falls back to localStorage
- Users continue without interruption
- Data syncs when API recovers

### Issue: Migration Fails for Some Users

**Symptoms:**
- Some users report progress missing
- Migration status shows failures

**Solution:**
1. Check specific error messages
2. Verify user has localStorage data
3. Check for data format issues
4. Manually migrate using admin tools

**Prevention:**
- Validate localStorage data before migration
- Implement retry logic (already included)
- Keep localStorage as backup for 30 days

### Issue: Performance Degradation

**Symptoms:**
- Slow page loads
- API timeouts
- High database CPU

**Solution:**
1. Enable query caching
2. Add database indexes (already in schema)
3. Implement Redis caching layer
4. Review slow queries

```sql
-- Find slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE query LIKE '%tutorial_progress%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## Data Validation

### Verify Migration Success

```javascript
// Run this in browser console on any tutorial page
(async () => {
  const userId = 'YOUR_USER_ID'; // Get from session
  const tutorialId = 'test-tutorial';

  // Check API
  const apiProgress = await fetch(
    `/api/tutorials/${tutorialId}/progress`
  ).then(r => r.json());

  // Check localStorage
  const localProgress = localStorage.getItem(
    `tutorial_progress_${tutorialId}_${userId}`
  );

  console.log('API Progress:', apiProgress);
  console.log('Local Progress:', localProgress ? JSON.parse(localProgress) : null);
  console.log('Match:', JSON.stringify(apiProgress) === localProgress);
})();
```

### Database Health Check

```sql
-- Check data integrity
SELECT
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT tutorial_id) as unique_tutorials,
  AVG(completion_percentage) as avg_completion,
  COUNT(CASE WHEN certificate_earned THEN 1 END) as total_certificates
FROM tutorial_progress;

-- Check for data anomalies
SELECT *
FROM tutorial_progress
WHERE
  completion_percentage > 100
  OR completion_percentage < 0
  OR chapters_completed > total_chapters
  OR total_watch_time < 0;
```

## Post-Migration Cleanup

### After 30 Days (Phase 5)

1. **Remove Old localStorage Keys**
   ```javascript
   // Add to app initialization
   if (Date.now() > MIGRATION_CUTOFF_DATE) {
     // Clear old tutorial progress from localStorage
     Object.keys(localStorage)
       .filter(key => key.startsWith('tutorial_progress_'))
       .forEach(key => localStorage.removeItem(key));
   }
   ```

2. **Archive Migration Code**
   - Remove migration utilities
   - Keep core service functionality
   - Update documentation

3. **Performance Optimization**
   - Analyze query patterns
   - Optimize indexes
   - Implement caching where beneficial

## Support Resources

### For Developers

- **Schema Documentation**: `/docs/database/tutorial-progress-schema.md`
- **Service API**: `/services/tutorialProgressService.ts`
- **Tests**: `/services/__tests__/tutorialProgressService.test.ts`

### For Users

Create a support article:

**Title:** "Tutorial Progress Not Saving?"

**Content:**
> Your tutorial progress is now automatically saved to the cloud! If you notice any issues:
>
> 1. Check your internet connection
> 2. Try refreshing the page
> 3. Your progress is backed up locally and will sync when you're back online
> 4. Contact support if issues persist: support@ainative.studio

## Success Criteria

Migration is considered successful when:

- [ ] All API endpoints are operational (>99.9% uptime)
- [ ] Error rate < 1%
- [ ] Average response time < 200ms
- [ ] 90%+ of users successfully migrated
- [ ] Zero data loss incidents
- [ ] User satisfaction maintained (< 5 support tickets)

## Timeline Summary

| Phase | Duration | Key Activities |
|-------|----------|----------------|
| 1. Preparation | Week 1 | Backend API, testing, validation |
| 2. Deployment | Week 2 | Deploy to staging, then production |
| 3. Migration | Week 3 | Automatic user migration, monitoring |
| 4. Monitoring | Ongoing | Performance tracking, issue resolution |
| 5. Cleanup | After 30 days | Remove legacy code, optimize |

## Contact

For questions or issues during migration:
- **Technical Lead**: [Your email]
- **DevOps**: [DevOps email]
- **Emergency**: [On-call rotation]
