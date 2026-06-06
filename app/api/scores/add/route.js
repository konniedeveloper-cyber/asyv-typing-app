import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST - Add test scores (for development only)
export async function POST(request) {
  try {
    const { userId, wpm, accuracy, rawWpm } = await request.json();

    if (!userId || !wpm || accuracy === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, wpm, accuracy' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create score
    const score = await prisma.score.create({
      data: {
        wpm,
        accuracy: Math.min(100, Math.max(0, accuracy)),
        rawWpm: rawWpm || wpm,
        userId,
      },
      include: {
        user: {
          select: {
            username: true,
            gender: true,
            image: true,
          }
        }
      }
    });

    return NextResponse.json({ data: score }, { status: 201 });
  } catch (error) {
    console.error('Error adding score:', error);
    return NextResponse.json(
      { error: 'Failed to add score', details: error.message },
      { status: 500 }
    );
  }
}
