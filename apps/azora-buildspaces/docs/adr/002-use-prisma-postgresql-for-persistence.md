# Architecture Decision Record: Use Prisma with PostgreSQL for Data Persistence

**Status**: Accepted

**Date**: 2025-12-15

**Deciders**: BuildSpaces Core Team

**Constitutional Alignment**: Truth Mandate, No Mock Protocol, Transparency

---

## Context

BuildSpaces requires robust data persistence for:
- User accounts and authentication
- BuildSpace projects and specifications
- Chat sessions and messages
- Agent execution history
- Design imports (Figma frames)
- Knowledge indexing metadata

Constitutional requirements mandate:
- **No Mock Data**: All data must be persistent and real
- **Truth Mandate**: Database-backed, not in-memory simulations
- **Auditability**: Full history and logging
- **Transparency**: Clear data models and relationships

## Decision

We will use **Prisma ORM** with **PostgreSQL** as our primary database solution.

### Technology Stack:
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL 14+
- **Extensions**: pgvector (for Knowledge Ocean semantic search)
- **Migrations**: Prisma Migrate
- **Client**: Auto-generated type-safe client

### Architecture:
```typescript
// Shared schema at monorepo root
// prisma/schema.prisma

model BuildSpaceProject {
  id             String   @id @default(cuid())
  name           String
  slug           String   @unique
  ownerId        String
  description    String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  specs          BuildSpaceSpec[]
  executions     BuildSpaceExecution[]
  
  @@index([ownerId])
}
```

## Alternatives Considered

### 1. MongoDB (NoSQL)
**Pros:**
- Flexible schema
- Good for rapid prototyping
- Horizontal scaling

**Cons:**
- No ACID transactions (weaker in earlier versions)
- No foreign key constraints
- Less suitable for relational data
- No native vector search without Atlas

**Rejected**: BuildSpaces data is highly relational

### 2. MySQL / MariaDB
**Pros:**
- Mature and stable
- Wide hosting availability
- Good performance

**Cons:**
- No native vector extension (pgvector equivalent)
- Less feature-rich than PostgreSQL
- JSON support not as good

**Rejected**: Lack of vector search support

### 3. Supabase (PostgreSQL + extras)
**Pros:**
- Built on PostgreSQL
- Real-time subscriptions
- Built-in auth
- Hosted solution

**Cons:**
- Vendor lock-in
- Additional abstraction layer
- Cost at scale
- Less control

**Deferred**: Currently use raw PostgreSQL, may migrate later

### 4. In-Memory (Redis / In-Process)
**Pros:**
- Very fast
- Simple for development

**Cons:**
- Data loss on restart
- Violates Truth Mandate
- No audit trail
- Constitutional non-compliance

**Rejected**: Violates No Mock Protocol

## Consequences

### Positive:
- ✅ **Type Safety**: Auto-generated TypeScript types from schema
- ✅ **Migration Management**: Declarative schema with version control
- ✅ **ACID Transactions**: Data integrity guaranteed
- ✅ **Vector Search**: pgvector extension for Knowledge Ocean
- ✅ **JSON Support**: Native JSON columns for flexible data
- ✅ **Constitutional Compliance**: Real persistence, no mocks
- ✅ **Full-Text Search**: Built-in PostgreSQL FTS
- ✅ **Performance**: Excellent query optimizer
- ✅ **Audit Logging**: ConstitutionalAuditLog table for all actions

### Negative:
- ⚠️ **Infrastructure Requirement**: Needs PostgreSQL instance
- ⚠️ **Setup Complexity**: Database provisioning required
- ⚠️ **Connection Pooling**: Needs configuration for serverless
- ⚠️ **Backup Strategy**: Must implement backup procedures

### Mitigation:
- Use Prisma connection pooling for serverless (PgBouncer)
- Automated backups via cloud provider or pg_dump
- Migrations tested in staging before production
- In-memory fallback for development without DB

## Data Models

### Core Entities:
1. **User**: Authentication and profile
2. **BuildSpaceProject**: Project container
3. **BuildSpaceSpec**: YAML/JSON specifications
4. **BuildSpaceExecution**: Agent execution history
5. **ChatSession**: Conversation sessions
6. **ChatMessage**: Individual messages
7. **FigmaFrame**: Imported designs
8. **ConstitutionalAuditLog**: Audit trail (future)

### Relationships:
- One User → Many Projects
- One Project → Many Specs
- One Project → Many Executions
- One User → Many ChatSessions
- One ChatSession → Many Messages

## Migration Strategy

### Development:
```bash
# Create migration
npx prisma migrate dev --name add_feature

# Generate client
npx prisma generate
```

### Production:
```bash
# Deploy migrations
npx prisma migrate deploy

# Verify
npx prisma migrate status
```

### Rollback:
- Migrations are tracked in `_prisma_migrations` table
- Rollback requires manual SQL or restore from backup
- Test all migrations in staging first

## Performance Considerations

### Indexing:
- Primary keys: CUID (better for distributed systems)
- Foreign keys: Auto-indexed
- Common query fields: Manual indexes (e.g., `ownerId`, `createdAt`)

### Query Optimization:
```typescript
// Use select to limit fields
const project = await prisma.buildSpaceProject.findUnique({
  where: { id },
  select: { id: true, name: true }
})

// Use include for relations
const project = await prisma.buildSpaceProject.findUnique({
  where: { id },
  include: { specs: true }
})
```

### Connection Pooling:
- Development: Direct connection
- Production: PgBouncer or Prisma Data Proxy
- Max connections: 20 per instance (configurable)

## Security

### Practices:
- Use Prisma's parameterized queries (prevents SQL injection)
- Never expose DATABASE_URL to client
- Use least-privilege database users
- Enable SSL/TLS for connections
- Regular security updates

### Example:
```typescript
// Safe: Prisma automatically parameterizes
const user = await prisma.user.findUnique({
  where: { email: userInput } // SQL injection protected
})

// Never do this:
// const result = await prisma.$queryRaw(`SELECT * FROM users WHERE email = '${userInput}'`)
```

## Monitoring

### Metrics:
- Query performance (via Prisma logs)
- Connection pool utilization
- Slow query log (PostgreSQL)
- Database size growth
- Index usage statistics

### Tools:
- Prisma Studio: Data browser
- pgAdmin: Database management
- Grafana: Metrics visualization
- Sentry: Error tracking

## Backup & Disaster Recovery

### Strategy:
- Automated daily backups
- Point-in-time recovery (PITR)
- 30-day retention
- Off-site backup storage
- Quarterly restore tests

### Commands:
```bash
# Backup
pg_dump -h localhost -U user -d azora_buildspaces > backup.sql

# Restore
psql -h localhost -U user -d azora_buildspaces < backup.sql
```

## Constitutional Compliance

### No Mock Protocol:
- ✅ All data persisted to database
- ✅ No fake initial states
- ✅ Empty tables on first load
- ✅ Real user data only

### Truth Mandate:
- ✅ Database is source of truth
- ✅ No in-memory simulations
- ✅ Audit trail for all changes

### Transparency:
- ✅ Schema is version-controlled
- ✅ Migrations are documented
- ✅ Data models are public

## References

- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- pgvector: https://github.com/pgvector/pgvector
- Best Practices: https://www.prisma.io/docs/guides/performance-and-optimization

---

## Follow-Up Actions

- [x] Create initial Prisma schema
- [x] Set up migrations
- [x] Integrate into BuildSpaces
- [x] Add pgvector extension
- [ ] Implement backup automation
- [ ] Add query performance monitoring
- [ ] Create database documentation
- [ ] Set up staging database

---

**Last Updated**: 2026-01-09
