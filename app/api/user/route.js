'use server';

import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET user data
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        username: true,
        email: true,
        gender: true,
        image: true,
        classId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH update user data
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // For client-side updates, also accept email from body as fallback
    const body = await request.json();
    const userEmail = session?.user?.email || body?.email;
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username, gender, image, classId } = body;

    // Build update object with only provided fields
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (gender !== undefined) updateData.gender = gender;
    if (image !== undefined) updateData.image = image;
    if (classId !== undefined) updateData.classId = classId;

    const user = await prisma.user.update({
      where: { email: userEmail },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        gender: true,
        image: true,
        classId: true,
      },
    });

    return NextResponse.json({ data: user, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
