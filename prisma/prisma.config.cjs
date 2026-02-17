const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

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
