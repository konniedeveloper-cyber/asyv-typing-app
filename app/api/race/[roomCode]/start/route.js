import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { jsonResponse, serializeForJSON } from '@/lib/api-helpers';

// Handle CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Get auth user from either session or request body (localStorage fallback)
async function getAuthUser(request, authOptions) {
  let session = await getServerSession(authOptions);
  let userEmail = null;

  // Try to get email from request body (sent from client localStorage)
  try {
    const body = await request.json();
    userEmail = body.userEmail;
    console.log('[AUTH] Got email from request body:', userEmail);
    // Put the body back for later use
    request.json = async () => JSON.parse(JSON.stringify(body));
  } catch (e) {
    console.log('[AUTH] Could not parse request body');
  }

  // If no server-side session, use client-provided email
  if (!session?.user?.email && userEmail) {
    console.log('[AUTH] Using client-provided email:', userEmail);
    session = { user: { email: userEmail } };
  }

  return { session, userEmail };
}

// Start a race
export async function POST(request, { params }) {
  try {
    console.log('[RACE START] POST endpoint called');
    
    let roomCode;
    try {
      const resolvedParams = await params;
      roomCode = resolvedParams?.roomCode;
      console.log('[RACE START] Room code from params:', roomCode);
    } catch (paramError) {
      console.error('[RACE START] Error parsing params:', paramError);
      return jsonResponse(
        { error: 'Invalid route parameters', details: paramError.message },
        400
      );
    }
    
    if (!roomCode) {
      return jsonResponse(
        { error: 'Room code is required' },
        400
      );
    }

    // Get auth from session or localStorage
    let body = {};
    try {
      body = await request.clone().json();
    } catch (e) {
      console.log('[RACE START] Could not parse body');
    }

    let session = await getServerSession(authOptions);
    const userEmail = body.userEmail;

    // Use either session or fallback to body email
    if (!session?.user?.email && !userEmail) {
      console.log('[RACE START] No authentication found');
      return jsonResponse(
        { error: 'You must be signed in' },
        401
      );
    }

    const email = session?.user?.email || userEmail;
    console.log('[RACE START] Using email:', email);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('[RACE START] User not found for email:', email);
      return jsonResponse(
        { error: 'User not found' },
        404
      );
    }

    console.log('[RACE START] Finding race with code:', roomCode);
    const race = await prisma.race.findUnique({
      where: { roomCode }
    });

    if (!race) {
      console.log('[RACE START] Race not found');
      return jsonResponse(
        { error: 'Race not found' },
        404
      );
    }

    if (race.creatorId !== user.id) {
      console.log('[RACE START] User is not the creator');
      return jsonResponse(
        { error: 'Only the creator can start the race' },
        403
      );
    }

    // Check participants
    const participants = await prisma.raceParticipant.findMany({
      where: { raceId: race.id }
    });

    if (participants.length < 2) {
      console.log('[RACE START] Not enough participants:', participants.length);
      return jsonResponse(
        { error: 'At least 2 participants are required' },
        400
      );
    }

    // Update race status
    const updatedRace = await prisma.race.update({
      where: { id: race.id },
      data: {
        status: 'active',
        startTime: new Date(),
        countdown: 10
      },
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

    console.log('[RACE START] Race started successfully');
    return jsonResponse(serializeForJSON(updatedRace), 200);
    
  } catch (error) {
    console.error('[RACE START] Error:', error.message);
    return jsonResponse(
      { error: 'Failed to start race', details: error.message },
      500
    );
  }
}
