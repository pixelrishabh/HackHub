const { PrismaClient } = require('@prisma/client');

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.trim().replace(/^["']|["']$/g, '');
}
if (process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DIRECT_URL.trim().replace(/^["']|["']$/g, '');
}

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
});

module.exports = prisma;