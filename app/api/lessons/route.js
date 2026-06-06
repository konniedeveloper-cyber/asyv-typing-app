import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { lessonProgress: true }
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Get array of completed lesson IDs
    const completedLessonIds = user.lessonProgress
      .filter(lp => lp.completed)
      .map(lp => lp.lessonId);

    return new Response(JSON.stringify({ 
      completedLessons: completedLessonIds,
      allProgress: user.lessonProgress
    }), { status: 200 });
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch lesson progress' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { lessonId } = await req.json();

    if (!lessonId) {
      return new Response(JSON.stringify({ error: 'Lesson ID is required' }), { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Update or create lesson progress
    const lessonProgress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: parseInt(lessonId)
        }
      },
      update: {
        completed: true,
        completedAt: new Date()
      },
      create: {
        userId: user.id,
        lessonId: parseInt(lessonId),
        completed: true,
        completedAt: new Date()
      }
    });

    return new Response(JSON.stringify({ 
      success: true,
      lessonProgress
    }), { status: 200 });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return new Response(JSON.stringify({ error: 'Failed to update lesson progress' }), { status: 500 });
  }
}
