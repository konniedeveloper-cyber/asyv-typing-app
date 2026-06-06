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
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ SET' : '❌ NOT SET',
        DATABASE_URL: process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ SET' : '❌ NOT SET',
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? '✅ SET' : '❌ NOT SET',
      },
      session: null,
      database: null,
      auth_test: null,
      errors: [],
      warnings: [],
    };

    // Test session
    try {
      const session = await getServerSession(authOptions);
      diagnostics.session = session ? '✅ ACTIVE' : '⚠️ NOT AUTHENTICATED';
    } catch (err) {
      diagnostics.errors.push(`Session error: ${err.message}`);
      diagnostics.session = '❌ ERROR';
    }

    // Test database connection
    try {
      const startTime = Date.now();
      const userCount = await prisma.user.count();
      const duration = Date.now() - startTime;
      diagnostics.database = {
        status: '✅ CONNECTED',
        userCount,
        responseTime: `${duration}ms`,
      };
    } catch (dbErr) {
      diagnostics.errors.push(`❌ Database error: ${dbErr.message}`);
      diagnostics.database = {
        status: '❌ FAILED',
        error: dbErr.message,
        troubleshooting: 'Check MongoDB Atlas IP whitelist includes Vercel/your IP',
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
        diagnostics.currentUser = user || 'NOT FOUND';
      }
    } catch (err) {
      diagnostics.warnings.push(`User lookup error: ${err.message}`);
    }

    // Test user table existence and schema
    try {
      const testUser = await prisma.user.findFirst({ select: { id: true }, take: 1 });
      diagnostics.auth_test = {
        usersExist: !!testUser,
        status: '✅ User table accessible',
      };
    } catch (err) {
      diagnostics.auth_test = {
        status: '❌ Cannot access user table',
        error: err.message,
      };
    }

    // Summary
    diagnostics.summary = {
      canConnect: diagnostics.database.status === '✅ CONNECTED',
      allEnvVarsSet: Object.values(diagnostics.environment).every(v => v.includes('✅')),
      readyForLogin: 
        diagnostics.database.status === '✅ CONNECTED' && 
        diagnostics.auth_test?.status?.includes('✅'),
    };

    return NextResponse.json(diagnostics);
  } catch (error) {
    return NextResponse.json(
      {
        error: '❌ Diagnostic failed',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
