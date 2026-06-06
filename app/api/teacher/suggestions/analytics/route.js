import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Get completion analytics for a suggestion
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
    const classId = searchParams.get('classId');

    // Get teacher ID from email
    const teacher = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!teacher || teacher.role !== 'teacher') {
      return Response.json(
        { error: 'Unauthorized - Teacher access required' },
        { status: 403 }
      );
    }

    if (suggestionId) {
      // Get analytics for a specific suggestion
      const suggestion = await prisma.teacherSuggestion.findUnique({
        where: { id: suggestionId },
        include: {
          class: true,
          completions: {
            include: {
              suggestion: true
            }
          }
        }
      });

      if (!suggestion) {
        return Response.json(
          { error: 'Suggestion not found' },
          { status: 404 }
        );
      }

      // Verify teacher owns this suggestion
      if (suggestion.teacherId !== teacher.id) {
        return Response.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      // Get total students in class
      const totalStudents = await prisma.user.count({
        where: {
          classId: suggestion.class.name,
          role: 'student'
        }
      });

      const completions = suggestion.completions;
      const avgWpm = completions.length > 0 
        ? Math.round(completions.reduce((sum, c) => sum + c.wpm, 0) / completions.length)
        : 0;
      const avgAccuracy = completions.length > 0
        ? Math.round(completions.reduce((sum, c) => sum + c.accuracy, 0) / completions.length)
        : 0;

      return Response.json({
        success: true,
        data: {
          suggestionId,
          sentence: suggestion.sentence,
          description: suggestion.description,
          totalStudentsInClass: totalStudents,
          completedCount: completions.length,
          completionRate: totalStudents > 0 ? Math.round((completions.length / totalStudents) * 100) : 0,
          avgWpm,
          avgAccuracy,
          bestWpm: completions.length > 0 ? Math.max(...completions.map(c => c.wpm)) : 0,
          completions: completions.map(c => ({
            wpm: c.wpm,
            accuracy: c.accuracy,
            completedAt: c.completedAt
          }))
        }
      }, { status: 200 });
    }

    if (classId) {
      // Get analytics for all suggestions in a class
      const classData = await prisma.class.findFirst({
        where: {
          name: classId || undefined,
          teacherId: teacher.id
        }
      });

      if (!classData) {
        return Response.json(
          { error: 'Class not found or access denied' },
          { status: 404 }
        );
      }

      const suggestions = await prisma.teacherSuggestion.findMany({
        where: { classId: classData.id },
        include: {
          completions: true
        },
        orderBy: { createdAt: 'desc' }
      });

      const totalStudents = await prisma.user.count({
        where: {
          classId: classData.name,
          role: 'student'
        }
      });

      const suggestionsWithStats = suggestions.map(s => ({
        id: s.id,
        sentence: s.sentence,
        description: s.description,
        createdAt: s.createdAt,
        completedCount: s.completions.length,
        completionRate: totalStudents > 0 ? Math.round((s.completions.length / totalStudents) * 100) : 0,
        avgWpm: s.completions.length > 0 
          ? Math.round(s.completions.reduce((sum, c) => sum + c.wpm, 0) / s.completions.length)
          : 0,
        avgAccuracy: s.completions.length > 0
          ? Math.round(s.completions.reduce((sum, c) => sum + c.accuracy, 0) / s.completions.length)
          : 0
      }));

      return Response.json({
        success: true,
        data: {
          totalStudents,
          suggestions: suggestionsWithStats
        }
      }, { status: 200 });
    }

    return Response.json(
      { error: 'suggestionId or classId is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[SUGGESTION-ANALYTICS] Error:', error);
    return Response.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    );
  }
}
