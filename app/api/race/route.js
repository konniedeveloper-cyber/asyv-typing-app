import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { sentences } from '../../constants/sentences';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { jsonResponse, serializeForJSON } from '@/lib/api-helpers';

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create a new race room
export async function POST(request) {
  try {
    let session = await getServerSession(authOptions);
    
    console.log('[RACE CREATE] Session check:', { 
      hasSession: !!session,
      email: session?.user?.email,
    });
    
    // If no server-side session, try to get user from request body (fallback)
    if (!session?.user?.email) {
      try {
        const body = await request.json();
        if (body.userEmail) {
          console.log('[RACE CREATE] Using client-provided email:', body.userEmail);
          session = { user: { email: body.userEmail } };
        }
      } catch (e) {
        // Ignore if body is not JSON
      }
    }
    
    if (!session?.user?.email) {
      console.error('[RACE CREATE] No authentication found');
      return jsonResponse(
        { error: 'You must be signed in to create a race' },
        401
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      console.error('[RACE CREATE] User not found for email:', session.user.email);
      return jsonResponse(
        { error: 'User not found' },
        404
      );
    }

    const roomCode = generateRoomCode();
    const sentenceId = Math.floor(Math.random() * sentences.length);
    
    const race = await prisma.race.create({
      data: {
        roomCode,
        sentenceId,
        creatorId: user.id,
        participants: {
          create: {
            userId: user.id
          }
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            image: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                image: true
              }
            }
          }
        }
      }
    });

    return jsonResponse(serializeForJSON(race), 200);
  } catch (error) {
    console.error('[RACE CREATE] Error:', error);
    return jsonResponse(
      { 
        error: 'Failed to create race',
        details: error.message || 'Unknown error',
        timestamp: new Date().toISOString()
      },
      500
    );
  }
}

// Get race details
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomCode = searchParams.get('roomCode');

    if (!roomCode) {
      return NextResponse.json(
        { error: 'Room code is required' },
        { status: 400 }
      );
    }

    const race = await prisma.race.findUnique({
      where: { roomCode },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                image: true
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
            image: true
          }
        }
      }
    });

    if (!race) {
      return NextResponse.json(
        { error: 'Race not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(race);
  } catch (error) {
    console.error('Race fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch race', details: error.message },
      { status: 500 }
    );
  }
}
