import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET (no value shown for security)' : 'NOT SET',
        DATABASE_URL: process.env.DATABASE_URL ? 'MONGODB CONNECTION CONFIGURED' : 'NOT SET',
      },
      session: null,
      database: null,
      providers: {
        google: !!process.env.GOOGLE_CLIENT_ID,
        github: !!process.env.GITHUB_CLIENT_ID,
      },
      errors: [],
    };

    // Test session
    try {
      const session = await getServerSession(authOptions);
      diagnostics.session = session ? 'ACTIVE' : 'NOT AUTHENTICATED';
    } catch (err) {
      diagnostics.errors.push(`Session error: ${err.message}`);
    }

    // Test database connection
    try {
      const userCount = await prisma.user.count();
      diagnostics.database = {
        status: 'CONNECTED',
        userCount,
      };
    } catch (dbErr) {
      diagnostics.errors.push(`Database connection failed: ${dbErr.message}`);
      diagnostics.database = {
        status: 'FAILED',
        error: dbErr.message,
      };
    }

    // Test user lookup (if session exists)
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, email: true, role: true },
        });
        diagnostics.currentUser = user || 'NOT FOUND IN DATABASE';
      }
    } catch (err) {
      diagnostics.errors.push(`User lookup error: ${err.message}`);
    }

    return NextResponse.json(diagnostics);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Diagnostic endpoint failed',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
