import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { minutes, lessonId, source } = await request.json();

    if (!minutes || minutes <= 0) {
      return Response.json(
        { error: 'Minutes must be greater than 0' },
        { status: 400 }
      );
    }

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

    // Create typing minutes record
    const typingMinutes = await prisma.typingMinutes.create({
      data: {
        userId: user.id,
        minutes: Math.round(minutes),
        lessonId: lessonId || null,
        source: source || 'test',
        date: new Date()
      }
    });

    return Response.json(
      {
        success: true,
        data: typingMinutes,
        message: `${minutes} minutes tracked successfully`
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[TRACK-MINUTES] Error:', error);
    return Response.json(
      { error: 'Failed to track minutes', details: error.message },
      { status: 500 }
    );
  }
}
