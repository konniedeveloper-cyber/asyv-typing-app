import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Create a suggestion
export async function POST(request) {
  try {
    console.log('[CREATE-SUGGESTION] POST request started');
    console.log('[CREATE-SUGGESTION] NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    
    const session = await getServerSession(authOptions);
    console.log('[CREATE-SUGGESTION] Session result:', {
      hasSession: !!session,
      email: session?.user?.email,
      userId: session?.user?.id,
      role: session?.user?.role
    });
    
    const { classId, sentence, description, userEmail } = await request.json();
    
    // Try to get email from session first, fallback to userEmail from request body
    let emailToUse = session?.user?.email || userEmail;
    
    if (!emailToUse) {
      console.error('[CREATE-SUGGESTION] No email found - session:', !!session, 'userEmail:', !!userEmail);
      return Response.json(
        { error: 'Unauthorized - No valid session' },
        { status: 401 }
      );
    }
    
    console.log('[CREATE-SUGGESTION] Using email:', emailToUse);

    if (!classId || !sentence) {
      return Response.json(
        { error: 'classId and sentence are required' },
        { status: 400 }
      );
    }

    // Get teacher ID from email
    const teacher = await prisma.user.findUnique({
      where: { email: emailToUse }
    });

    if (!teacher || teacher.role !== 'teacher') {
      return Response.json(
        { error: 'Unauthorized - Teacher access required' },
        { status: 403 }
      );
    }

    // Map class IDs to database class names
    const classNameMap = {
      'ey-jupiter': 'EY Jupiter',
      'ey-venus': 'EY Venus',
      'ey-mercury': 'EY Mercury',
      'ey-neptune': 'EY Neptune',
    };

    const className = classNameMap[classId];
    if (!className) {
      return Response.json(
        { error: 'Invalid class ID' },
        { status: 400 }
      );
    }

    // Verify/create teacher class
    let classData = await prisma.class.findFirst({
      where: {
        name: className,
        teacherId: teacher.id
      }
    });

    // If class doesn't exist, create it
    if (!classData) {
      classData = await prisma.class.create({
        data: {
          name: className,
          teacherId: teacher.id,
        }
      });
    }

    // Create the suggestion
    const suggestion = await prisma.teacherSuggestion.create({
      data: {
        teacherId: teacher.id,
        classId: classData.id,
        sentence: sentence.trim(),
        description: description ? description.trim() : null
      }
    });

    // Fetch students assigned to this class (query by class NAME, not ID)
    const classStudents = await prisma.user.findMany({
      where: {
        classId: className,
        role: 'student'
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    console.log('[CREATE-SUGGESTION] Found students:', classStudents.length, 'for class:', className);

    // Create notifications for all students in the class
    const notificationPromises = classStudents.map(student =>
      prisma.notification.create({
        data: {
          userId: student.id,
          type: 'suggestion',
          title: `New typing practice from ${teacher.name || 'your teacher'}`,
          message: `Your teacher has suggested a new sentence to practice: "${sentence.substring(0, 50)}${sentence.length > 50 ? '...' : ''}"`,
          suggestionId: suggestion.id
        }
      })
    );

    await Promise.all(notificationPromises);

    return Response.json(
      {
        success: true,
        data: suggestion,
        notificationsCreated: classStudents.length,
        message: `Suggestion created and notifications sent to ${classStudents.length} students`
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[CREATE-SUGGESTION] Error:', error);
    return Response.json(
      { error: 'Failed to create suggestion', details: error.message },
      { status: 500 }
    );
  }
}

// Get suggestions for a class
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
    const classId = searchParams.get('classId');

    if (!classId) {
      return Response.json(
        { error: 'classId is required' },
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

    // Map class IDs to database class names
    const classNameMap = {
      'ey-jupiter': 'EY Jupiter',
      'ey-venus': 'EY Venus',
      'ey-mercury': 'EY Mercury',
      'ey-neptune': 'EY Neptune',
    };

    const className = classNameMap[classId];
    if (!className) {
      return Response.json(
        { error: 'Invalid class ID' },
        { status: 400 }
      );
    }

    // Get class and verify user has access
    let classData = await prisma.class.findFirst({
      where: { name: className }
    });

    // If class doesn't exist and user is a teacher, create it
    if (!classData && user.role === 'teacher') {
      classData = await prisma.class.create({
        data: {
          name: className,
          teacherId: user.id,
        }
      });
    }

    if (!classData) {
      return Response.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // Check if user is teacher of this class or student in this class
    if (user.role === 'teacher' && classData.teacherId !== user.id) {
      return Response.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    if (user.role === 'student' && user.classId !== className) {
      return Response.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Fetch suggestions
    const suggestions = await prisma.teacherSuggestion.findMany({
      where: { classId: classData.id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return Response.json({
      success: true,
      data: suggestions
    }, { status: 200 });
  } catch (error) {
    console.error('[GET-SUGGESTIONS] Error:', error);
    return Response.json(
      { error: 'Failed to fetch suggestions', details: error.message },
      { status: 500 }
    );
  }
}
