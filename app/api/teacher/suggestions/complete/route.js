import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Record a suggestion completion
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { suggestionId, wpm, accuracy } = await request.json();

    if (!suggestionId || wpm === undefined || accuracy === undefined) {
      return Response.json(
        { error: 'suggestionId, wpm, and accuracy are required' },
        { status: 400 }
      );
    }

    // Get student ID from email
    const student = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!student || student.role !== 'student') {
      return Response.json(
        { error: 'Unauthorized - Student access required' },
        { status: 403 }
      );
    }

    // Verify suggestion exists
    const suggestion = await prisma.teacherSuggestion.findUnique({
      where: { id: suggestionId }
    });

    if (!suggestion) {
      return Response.json(
        { error: 'Suggestion not found' },
        { status: 404 }
      );
    }

    // Record completion (upsert - update if already exists, create if not)
    const completion = await prisma.suggestionCompletion.upsert({
      where: {
        suggestionId_studentId: {
          suggestionId,
          studentId: student.id
        }
      },
      update: {
        wpm,
        accuracy,
        completedAt: new Date()
      },
      create: {
        suggestionId,
        studentId: student.id,
        wpm,
        accuracy
      }
    });

    return Response.json({
      success: true,
      data: completion,
      message: 'Suggestion completion recorded'
    }, { status: 200 });
  } catch (error) {
    console.error('[COMPLETE-SUGGESTION] Error:', error);
    return Response.json(
      { error: 'Failed to record completion', details: error.message },
      { status: 500 }
    );
  }
}

// Get completion status for a suggestion
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
    const suggestionId = searchParams.get('suggestionId');

    if (!suggestionId) {
      return Response.json(
        { error: 'suggestionId is required' },
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

    // Get suggestion
    const suggestion = await prisma.teacherSuggestion.findUnique({
      where: { id: suggestionId }
    });

    if (!suggestion) {
      return Response.json(
        { error: 'Suggestion not found' },
        { status: 404 }
      );
    }

    // Check completion status
    const completion = await prisma.suggestionCompletion.findUnique({
      where: {
        suggestionId_studentId: {
          suggestionId,
          studentId: user.id
        }
      }
    });

    return Response.json({
      success: true,
      data: {
        suggestionId,
        isCompleted: !!completion,
        completion: completion || null
      }
    }, { status: 200 });
  } catch (error) {
    console.error('[GET-COMPLETION] Error:', error);
    return Response.json(
      { error: 'Failed to fetch completion status', details: error.message },
      { status: 500 }
    );
  }
}
