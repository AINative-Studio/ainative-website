# Database Setup Guide

## Overview

This guide covers the PostgreSQL database setup for AINative Studio using Prisma ORM with connection pooling and production-ready configurations.

## Technology Stack

- **Database**: PostgreSQL 14+
- **ORM**: Prisma 5+
- **Connection Pooling**: Built-in Prisma connection pooling
- **Hosting**: Railway (recommended) or any PostgreSQL provider

## Quick Start

### 1. Set Up PostgreSQL Database

#### Option A: Railway (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Add PostgreSQL to your project
railway add postgres

# Get the connection string
railway variables
```

Copy the `DATABASE_URL` to your `.env.local` file.

#### Option B: Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb ainative

# Set connection string in .env.local
DATABASE_URL="postgresql://localhost:5432/ainative"
DIRECT_DATABASE_URL="postgresql://localhost:5432/ainative"
```

### 2. Configure Environment Variables

Create a `.env.local` file (copy from `.env.example`):

```env
# PostgreSQL connection URL (used by Prisma for queries)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require&pgbouncer=true"

# Direct database URL (bypasses PgBouncer, used for migrations)
DIRECT_DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here" # Generate with: openssl rand -base64 32
```

### 3. Install Dependencies

Dependencies are already installed if you ran `npm install`:

```bash
npm install @prisma/client
npm install -D prisma
```

### 4. Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# Or push schema without migration (development only)
npx prisma db push
```

### 5. Seed Development Data (Optional)

```bash
npx prisma db seed
```

## Database Schema

### Core Models

#### User Management
- **User**: User accounts with email, role, and profile information
- **Account**: OAuth provider accounts (NextAuth)
- **Session**: User sessions (NextAuth)
- **VerificationToken**: Email verification tokens (NextAuth)

#### API & Usage
- **ApiKey**: API key management with rate limiting
- **UsageMetric**: Track API usage, tokens, embeddings, and costs

#### Billing & Subscriptions
- **Subscription**: Subscription plans and Stripe integration
- **BillingInfo**: Customer billing details and payment methods
- **Invoice**: Invoice history and status
- **Credit**: Credit system for purchases, bonuses, and usage

#### Projects
- **Project**: User projects with flexible settings (JSON)

#### Rate Limiting
- **RateLimit**: In-database rate limiting (optional, can use Redis)

### Schema Diagram

```
User
├── accounts (Account[])
├── sessions (Session[])
├── apiKeys (ApiKey[])
├── projects (Project[])
├── subscriptions (Subscription[])
├── credits (Credit[])
├── usageMetrics (UsageMetric[])
└── billingInfo (BillingInfo)
    └── invoices (Invoice[])
```

## Connection Pooling

Prisma Client includes built-in connection pooling with the following defaults:

- **Connection limit**: Automatic (based on database provider)
- **Pool timeout**: 10 seconds
- **Idle timeout**: 0 (connections are not closed)

For Railway with PgBouncer, use two connection strings:

1. **DATABASE_URL**: Pooled connection (for queries)
   - Add `?pgbouncer=true` parameter
   - Used by Prisma Client for queries

2. **DIRECT_DATABASE_URL**: Direct connection (for migrations)
   - Connects directly to PostgreSQL
   - Used by Prisma Migrate

## Usage Examples

### Basic CRUD Operations

```typescript
import { prisma } from '@/lib/prisma';

// Create user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    role: 'USER',
  },
});

// Find user
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: {
    apiKeys: true,
    subscriptions: true,
  },
});

// Update user
const user = await prisma.user.update({
  where: { id: userId },
  data: { name: 'Jane Doe' },
});

// Delete user
await prisma.user.delete({
  where: { id: userId },
});
```

### Using Retry Logic

```typescript
import { withRetry, withTransaction } from '@/lib/db-utils';

// Retry on transient failures
const user = await withRetry(() =>
  prisma.user.findUnique({ where: { id: userId } })
);

// Transaction with retry
const result = await withTransaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: 'test@example.com' },
  });

  const apiKey = await tx.apiKey.create({
    data: {
      userId: user.id,
      key: generateApiKey(),
      name: 'Default API Key',
    },
  });

  return { user, apiKey };
});
```

### Batch Operations

```typescript
import { batchInsert, paginate } from '@/lib/db-utils';

// Batch insert with chunking
await batchInsert(
  users,
  (chunk) => prisma.user.createMany({ data: chunk }),
  100
);

// Paginate through large datasets
for await (const users of paginate(
  (skip, take) => prisma.user.findMany({ skip, take }),
  100
)) {
  // Process users in chunks
  console.log(`Processing ${users.length} users`);
}
```

## Database Maintenance

### View Database in Prisma Studio

```bash
npx prisma studio
```

Opens a web interface at `http://localhost:5555` to view and edit data.

### Reset Database (Development Only)

```bash
# WARNING: Deletes all data
npx prisma migrate reset
```

### Generate Prisma Client After Schema Changes

```bash
npx prisma generate
```

### Create New Migration

```bash
npx prisma migrate dev --name add_new_field
```

### View Migration Status

```bash
npx prisma migrate status
```

## Production Deployment

### Railway Deployment

1. **Set Environment Variables in Railway Dashboard**:
   - `DATABASE_URL` - Automatically provided by Railway
   - `DIRECT_DATABASE_URL` - Same as DATABASE_URL without `?pgbouncer=true`
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Your production domain

2. **Add Build Commands**:
   ```json
   {
     "scripts": {
       "build": "prisma generate && prisma migrate deploy && next build",
       "start": "next start"
     }
   }
   ```

3. **Enable SSL**:
   Connection strings should include `?sslmode=require`

### Connection Pool Monitoring

Monitor connection pool usage:

```typescript
import { prisma } from '@/lib/prisma';

// Check database connectivity
const isConnected = await checkDatabaseConnection();

// Get database statistics
const stats = await getDatabaseStats();
console.log('Database stats:', stats);
```

## Troubleshooting

### Connection Issues

**Error**: `Can't reach database server`
- Check `DATABASE_URL` is correct
- Verify database is running
- Check firewall/security group settings
- Ensure SSL is configured if required

**Error**: `Connection pool timeout`
- Increase pool size in Prisma schema
- Check for connection leaks
- Use `withRetry()` for transient failures

### Migration Issues

**Error**: `Migration failed`
- Check `DIRECT_DATABASE_URL` bypasses connection pooler
- Ensure database user has migration permissions
- Review migration SQL for syntax errors

### Performance Issues

**Slow queries**:
1. Add database indexes
2. Use `select` to fetch only needed fields
3. Implement pagination for large datasets
4. Use `include` sparingly (prefer explicit queries)

**Connection pool exhaustion**:
1. Ensure Prisma Client is a singleton
2. Don't create multiple Prisma instances
3. Use `$disconnect()` in serverless environments
4. Monitor active connections

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use environment variables** for all secrets
3. **Enable SSL** for production connections (`?sslmode=require`)
4. **Implement rate limiting** on API endpoints
5. **Validate all user input** before database queries
6. **Use parameterized queries** (Prisma handles this automatically)
7. **Regularly update dependencies**: `npm update @prisma/client prisma`
8. **Monitor database access logs** in production
9. **Implement row-level security** for multi-tenant data
10. **Use prepared statements** for raw queries

## Monitoring & Health Checks

### Health Check Endpoint

Create an API route at `app/api/health/route.ts`:

```typescript
import { checkDatabaseConnection } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const isHealthy = await checkDatabaseConnection();

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'unhealthy',
      database: isHealthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    },
    { status: isHealthy ? 200 : 503 }
  );
}
```

### Database Stats

```typescript
import { getDatabaseStats } from '@/lib/prisma';

const stats = await getDatabaseStats();
// { users: 150, apiKeys: 200, subscriptions: 50, projects: 300 }
```

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Railway PostgreSQL Guide](https://docs.railway.app/databases/postgresql)
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/current/index.html)

## Support

For issues or questions:
- Check [Prisma GitHub Issues](https://github.com/prisma/prisma/issues)
- Review [Railway Documentation](https://docs.railway.app)
- Contact the development team
