import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized - Student access required' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        gender: true,
        classId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized - Student access required' },
        { status: 403 }
      );
    }

    const { classId } = await request.json();

    // Validate classId - must be one of the valid class names
    const validClasses = ['EY jupiter', 'EY venus', 'EY mercury', 'EY neptune'];
    if (!classId || !validClasses.includes(classId)) {
      return NextResponse.json(
        { error: 'Invalid class ID. Must be one of: ' + validClasses.join(', ') },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { classId },
      select: {
        id: true,
        username: true,
        email: true,
        classId: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating student profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
