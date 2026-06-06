import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🧪 Testing database connection...');
    
    // Test database connection
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      status: '✅ Database connected',
      userCount,
      timestamp: new Date().toISOString(),
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || '✗ Not set',
        DATABASE_URL: process.env.DATABASE_URL ? 'Set (hidden)' : '✗ Not set',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set (hidden)' : '✗ Not set',
      }
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return NextResponse.json({
      status: '❌ Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
