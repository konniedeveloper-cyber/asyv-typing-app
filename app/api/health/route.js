import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    console.log('🏥 [HEALTH] Checking database connectivity...');
    
    // Quick count of sessions
    const sessionCount = await prisma.session.count();
    console.log('🏥 [HEALTH] Total sessions in DB:', sessionCount);

    // Try to find a recent session
    const recentSession = await prisma.session.findFirst({
      orderBy: { expires: 'desc' },
      take: 1,
    });

    console.log('🏥 [HEALTH] Most recent session:', !!recentSession);

    return NextResponse.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'CONNECTED',
      sessionCount,
      recentSession: recentSession ? {
        token: recentSession.sessionToken.substring(0, 20) + '...',
        userId: recentSession.userId,
        expires: recentSession.expires,
      } : null,
    });
  } catch (error) {
    console.error('🚨 [HEALTH] Error:', error.message);
    return NextResponse.json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'DISCONNECTED',
      error: error.message,
    }, { status: 500 });
  }
}
