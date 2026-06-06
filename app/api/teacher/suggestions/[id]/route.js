import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Get a single suggestion by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const suggestion = await prisma.teacherSuggestion.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        class: {
          select: {
            id: true,
            name: true
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

    return Response.json({
      success: true,
      data: suggestion
    }, { status: 200 });
  } catch (error) {
    console.error('[GET-SUGGESTION] Error:', error);
    return Response.json(
      { error: 'Failed to fetch suggestion', details: error.message },
      { status: 500 }
    );
  }
}
