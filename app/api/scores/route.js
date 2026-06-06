import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    let { wpm, accuracy, rawWpm, userId } = await request.json();

    // Normalize accuracy to 0-100 range
    if (accuracy > 100) {
      accuracy = accuracy / 100;
    }
    accuracy = Math.min(100, Math.max(0, accuracy));

    console.log('Received score data:', { wpm, accuracy, rawWpm, userId });

    if (!userId) {
      console.log('No userId provided');
      return NextResponse.json(
        { error: 'You must be signed in to save scores' },
        { status: 401 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    console.log('User found:', user ? 'YES' : 'NO', user ? user.email : 'N/A');

    if (!user) {
      console.log('User not found with id:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const score = await prisma.score.create({
      data: {
        wpm,
        accuracy,
        rawWpm,
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

    console.log('Score created successfully:', score);

    return NextResponse.json(score);
  } catch (error) {
    console.error('Score error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to save score', details: error.message },
      { status: 500 }
    );
  }
}

// Get leaderboard with gender and userId filter
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let scores = [];

    if (userId) {
      scores = await prisma.score.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              username: true,
              gender: true,
              image: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    } else {
      scores = await prisma.score.findMany({
        include: {
          user: {
            select: {
              username: true,
              gender: true,
              image: true,
            }
          }
        },
        orderBy: { wpm: 'desc' },
        take: 200,
      });
    }

    // Filter out scores with null users (orphaned records)
    const validScores = scores.filter(score => score.user !== null);

    return NextResponse.json({ data: validScores }, { status: 200 });
  } catch (error) {
    console.error('Score fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scores', details: error.message },
      { status: 500 }
    );
  }
}
