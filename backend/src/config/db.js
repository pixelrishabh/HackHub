const { PrismaClient } = require('@prisma/client');

// NOTE: NODE_ENV must be explicitly set to 'production' in Render's dashboard environment variables.
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
});

module.exports = prisma;