import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days')) || 30; // Default: last 30 days
    const lessonId = searchParams.get('lessonId');

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate date range
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    // Build query filter
    const whereClause = {
      userId: user.id,
      date: {
        gte: dateFrom
      }
    };

    if (lessonId) {
      whereClause.lessonId = parseInt(lessonId);
    }

    // Fetch typing minutes
    const typingMinutes = await prisma.typingMinutes.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    });

    // Calculate statistics
    const totalMinutes = typingMinutes.reduce((sum, record) => sum + record.minutes, 0);
    
    // Count unique days with activity instead of total days
    const daysWithActivity = new Set();
    typingMinutes.forEach(record => {
      const dateStr = new Date(record.date).toISOString().split('T')[0];
      daysWithActivity.add(dateStr);
    });
    const avgMinutesPerDay = daysWithActivity.size > 0 ? Math.round((totalMinutes / daysWithActivity.size) * 10) / 10 : 0;
    const sessionsCount = typingMinutes.length;

    // Group by source
    const bySource = {};
    typingMinutes.forEach(record => {
      if (!bySource[record.source]) {
        bySource[record.source] = 0;
      }
      bySource[record.source] += record.minutes;
    });

    // Group by day for chart
    const byDay = {};
    typingMinutes.forEach(record => {
      const date = new Date(record.date).toISOString().split('T')[0];
      if (!byDay[date]) {
        byDay[date] = 0;
      }
      byDay[date] += record.minutes;
    });

    return Response.json({
      success: true,
      data: {
        totalMinutes,
        avgMinutesPerDay: Math.round(avgMinutesPerDay * 10) / 10,
        sessionsCount,
        records: typingMinutes,
        bySource,
        byDay
      }
    }, { status: 200 });
  } catch (error) {
    console.error('[GET-MINUTES] Error:', error);
    return Response.json(
      { error: 'Failed to fetch minutes', details: error.message },
      { status: 500 }
    );
  }
}
