import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 [DB-TEST] Starting database connection test...');
    
    // Check if DATABASE_URL is set
    const dbUrl = process.env.DATABASE_URL;
    console.log('📋 [DB-TEST] DATABASE_URL is set:', !!dbUrl);
    if (dbUrl) {
      // Show only the scheme and host, not the password
      const urlObj = new URL(dbUrl);
      console.log('📋 [DB-TEST] Database URL scheme:', urlObj.protocol);
      console.log('📋 [DB-TEST] Database host:', urlObj.hostname);
      console.log('📋 [DB-TEST] Database name:', urlObj.pathname);
    }

    // Try to query the database
    console.log('🔄 [DB-TEST] Attempting database query...');
    const userCount = await prisma.user.count();
    
    console.log('✅ [DB-TEST] Database connection successful!');
    console.log('📊 [DB-TEST] Total users in database:', userCount);

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount,
      databaseConfigured: !!dbUrl,
    });
  } catch (error) {
    console.error('❌ [DB-TEST] Database connection failed:', error.message);
    console.error('❌ [DB-TEST] Error code:', error.code);
    console.error('❌ [DB-TEST] Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
    });

    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      message: error.message,
      details: {
        name: error.name,
        code: error.code,
      },
      databaseUrlSet: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
    }, { status: 500 });
  }
}
