import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  const checks = {
    database: 'checking...',
    env: {
      database_url_set: !!process.env.DATABASE_URL,
      nextauth_url: process.env.NEXTAUTH_URL,
      nextauth_secret_set: !!process.env.NEXTAUTH_SECRET,
    },
    timestamp: new Date().toISOString(),
  };

  // Test database connection
  try {
    const result = await prisma.$queryRaw`db.adminCommand({ ping: 1 })`;
    checks.database = 'connected ✓';
  } catch (error) {
    checks.database = `failed: ${error.message}`;
    checks.database_error = error.toString();
  }

  return NextResponse.json(checks, {
    status: checks.database === 'connected ✓' ? 200 : 500,
  });
}
