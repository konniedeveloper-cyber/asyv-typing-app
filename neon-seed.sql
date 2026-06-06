-- Create User table
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

-- Create Score table
CREATE TABLE IF NOT EXISTS "Score" (
  id TEXT NOT NULL PRIMARY KEY,
  wpm INTEGER NOT NULL,
  accuracy DOUBLE PRECISION NOT NULL,
  "rawWpm" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Score_wpm_idx" ON "Score"(wpm);
CREATE INDEX IF NOT EXISTS "Score_userId_idx" ON "Score"("userId");

-- Verify tables created
SELECT tablename FROM pg_tables WHERE schemaname='public';
