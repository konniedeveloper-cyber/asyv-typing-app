// This script creates the database tables manually
import prisma from '../lib/prisma.js';

async function createTables() {
  try {
    console.log('Creating User and Score tables...');

    // Create User table using raw SQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        id TEXT NOT NULL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        gender TEXT NOT NULL,
        image TEXT,
        name TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "emailVerified" TIMESTAMP(3)
      );
    `);

    console.log('✓ User table created');

    // Create Score table using raw SQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Score" (
        id TEXT NOT NULL PRIMARY KEY,
        wpm INTEGER NOT NULL,
        accuracy DOUBLE PRECISION NOT NULL,
        "rawWpm" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "userId" TEXT NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
      );
    `);

    console.log('✓ Score table created');

    // Create indexes
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Score_wpm_idx" ON "Score"(wpm);
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Score_userId_idx" ON "Score"("userId");
    `);

    console.log('✓ Indexes created');
    console.log('✅ All tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTables();
