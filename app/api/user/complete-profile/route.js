import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    
    // Use email from session or from request body as fallback
    const userEmail = session?.user?.email || body?.email;

    if (!userEmail) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { username, gender, classId } = body;

    // Validate inputs
    if (!username || !gender || !classId) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Map class formats to database class names
    const classMap = {
      'ey-jupiter': 'EY Jupiter',
      'ey-venus': 'EY Venus',
      'ey-mercury': 'EY Mercury',
      'ey-neptune': 'EY Neptune',
      'EY Jupiter': 'EY Jupiter',
      'EY Venus': 'EY Venus',
      'EY Mercury': 'EY Mercury',
      'EY Neptune': 'EY Neptune',
    };

    const normalizedClassId = classMap[classId];
    if (!normalizedClassId) {
      return Response.json(
        { error: 'Invalid class. Must be one of: ey-jupiter, ey-venus, ey-mercury, ey-neptune' },
        { status: 400 }
      );
    }

    // Validate username format (3-30 chars, alphanumeric)
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      return Response.json(
        { error: 'Username must be 3-30 characters and contain only letters, numbers, and underscores' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return Response.json(
        { error: 'Username already taken. Please choose another.' },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        username,
        gender,
        classId: normalizedClassId,
      },
      select: {
        id: true,
        email: true,
        username: true,
        gender: true,
        classId: true,
        role: true,
      },
    });

    console.log('✅ [PROFILE] User profile updated:', updatedUser.email);

    return Response.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('❌ [PROFILE] Error updating profile:', error);
    return Response.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
