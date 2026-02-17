export default {
  datasources: {
    db: {
      provider: 'postgresql',
      url: process.env.DATABASE_URL || 'postgresql://postgres:test@localhost:5432/azora_test'
    }
  },
  generator: {
    client: { provider: 'prisma-client-js' }
  }
}
