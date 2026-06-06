import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { jsonResponse, serializeForJSON } from '@/lib/api-helpers';

export async function POST(request) {
  try {
    let session = await getServerSession(authOptions);
    
    console.log('[RACE/JOIN] Session check:', { 
      hasSession: !!session,
      email: session?.user?.email
    });
    
    // Get request body
    let body = {};
    try {
      body = await request.clone().json();
    } catch (e) {
      console.log('[RACE/JOIN] Could not parse body');
    }
    
    // Fallback to client-provided email
    if (!session?.user?.email && body.userEmail) {
      console.log('[RACE/JOIN] Using client email:', body.userEmail);
      session = { user: { email: body.userEmail } };
    }
    
    if (!session?.user?.email) {
      return jsonResponse(
        { error: 'You must be signed in to join a race' },
        401
      );
    }

    const { roomCode } = body;
    if (!roomCode) {
      return jsonResponse(
        { error: 'Room code is required' },
        400
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return jsonResponse(
        { error: 'User not found' },
        404
      );
    }

    // Find race
    const race = await prisma.race.findUnique({
      where: { roomCode }
    });

    if (!race) {
      return jsonResponse(
        { error: 'Race not found' },
        404
      );
    }

    if (race.status !== 'waiting') {
      return jsonResponse(
        { error: 'Race has already started' },
        400
      );
    }

    // Check if already in race
    const existing = await prisma.raceParticipant.findUnique({
      where: {
        raceId_userId: {
          raceId: race.id,
          userId: user.id
        }
      }
    });

    if (existing) {
      return jsonResponse(
        { error: 'You are already in this race' },
        400
      );
    }

    // Add user to race
    await prisma.raceParticipant.create({
      data: {
        raceId: race.id,
        userId: user.id
      }
    });

    // Get updated race with all participants
    const updatedRace = await prisma.race.findUnique({
      where: { roomCode },
      include: {
        creator: {
          select: { id: true, username: true, image: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, username: true, image: true }
            }
          }
        }
      }
    });

    console.log('[RACE/JOIN] User joined successfully');
    return jsonResponse(serializeForJSON(updatedRace), 200);
    
  } catch (error) {
    console.error('[RACE/JOIN] Error:', error.message);
    return jsonResponse(
      { error: 'Failed to join race', details: error.message },
      500
    );
  }
}
