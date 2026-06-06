import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

// Create Prisma client with optimized settings for Vercel serverless
const prismaClientConfig = {
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'pretty',
};

// Add connection timeout settings for serverless environments
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  prismaClientConfig.datasources = {
    db: {
      url: process.env.DATABASE_URL,
    },
  };
}

const prisma = globalForPrisma.prisma || new PrismaClient(prismaClientConfig);

// Store in global for reuse
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

// Ensure proper cleanup
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;