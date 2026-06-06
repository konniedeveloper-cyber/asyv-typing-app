import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { jsonResponse, serializeForJSON } from '@/lib/api-helpers';

// Finish race
export async function POST(request, { params }) {
  try {
    const { roomCode } = await params;
    let body;
    try {
      body = await request.json();
    } catch (e) {
      body = {};
    }
    
    const { userEmail } = body;
    let { wpm, accuracy, rawWpm } = body;
    let session = await getServerSession(authOptions);

    // If no server session, use client-provided email as fallback
    if (!session?.user?.email && userEmail) {
      console.log('[RACE FINISH] Using client-provided email:', userEmail);
      session = { user: { email: userEmail } };
    }

    // Normalize accuracy to 0-100 range
    if (accuracy > 100) {
      accuracy = accuracy / 100;
    }
    accuracy = Math.min(100, Math.max(0, accuracy));

    if (!session?.user?.email) {
      return jsonResponse(
        { error: 'You must be signed in' },
        401
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return jsonResponse(
        { error: 'User not found' },
        404
      );
    }

    const race = await prisma.race.findUnique({
      where: { roomCode }
    });

    if (!race) {
      return jsonResponse(
        { error: 'Race not found' },
        404
      );
    }

    const now = new Date();

    const participant = await prisma.raceParticipant.update({
      where: {
        raceId_userId: {
          raceId: race.id,
          userId: user.id
        }
      },
      data: {
        finished: true,
        finishTime: now,
        wpm,
        accuracy,
        rawWpm: rawWpm || wpm
      }
    });

    // Check if all participants finished
    const allParticipants = await prisma.raceParticipant.findMany({
      where: { raceId: race.id }
    });

    const allFinished = allParticipants.every(p => p.finished);

    if (allFinished) {
      await prisma.race.update({
        where: { id: race.id },
        data: {
          status: 'finished',
          endTime: now
        }
      });
    }

    // Get final results
    const results = await prisma.raceParticipant.findMany({
      where: { raceId: race.id },
      include: {
        user: {
          select: { username: true, image: true }
        }
      },
      orderBy: { wpm: 'desc' }
    });

    return jsonResponse(
      {
        participant: serializeForJSON(participant),
        results: serializeForJSON(
          results.map(r => ({
            userId: r.userId,
            userName: r.user.username,
            userImage: r.user.image,
            wpm: r.wpm,
            accuracy: r.accuracy,
            rawWpm: r.rawWpm,
            finished: r.finished
          }))
        )
      },
      200
    );
  } catch (error) {
    console.error('[RACE FINISH] Error:', error);
    return jsonResponse(
      { 
        error: 'Failed to finish race',
        details: error.message || 'Unknown error',
        timestamp: new Date().toISOString()
      },
      500
    );
  }
}
