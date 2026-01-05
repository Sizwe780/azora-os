import { BuildSpaceSpec } from '@prisma/client';

export function scaffoldProject(spec: Partial<BuildSpaceSpec>): string {
    // Real logic to generate docker-compose.yml based on spec requirements

    const services: string[] = [];

    // 1. Core Service (Next.js App)
    services.push(`
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp
      - NODE_ENV=production
    depends_on:
      - db
  `);

    // 2. Database Service (if requested in spec or default)
    // In a real implementation, we'd parse spec.content (YAML/JSON) to check for 'database' key
    const needsDatabase = true; // Default for now
    if (needsDatabase) {
        services.push(`
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp
    volumes:
      - db_data:/var/lib/postgresql/data
    `);
    }

    // 3. Cache Service (Redis)
    // Check spec for 'redis' or 'cache'
    const needsCache = spec.content?.includes('redis');
    if (needsCache) {
        services.push(`
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    `);
    }

    return `version: '3.8'

services:
${services.join('')}

volumes:
  db_data:
`;
}
