module.exports = {
  datasources: {
    db: {
      provider: 'postgresql',
      url: process.env.DATABASE_URL || ''
    }
  },
  // Keep clients generated in node_modules/.prisma/client by default
  generator: {
    client: {
      provider: 'prisma-client-js'
    }
  }
}
