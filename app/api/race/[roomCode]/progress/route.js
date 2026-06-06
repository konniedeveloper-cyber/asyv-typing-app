import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { jsonResponse, serializeForJSON } from '@/lib/api-helpers';

// Update race progress
export async function POST(request, { params }) {
  try {
    const { roomCode } = await params;
    let body;
    try {
      body = await request.json();
    } catch (e) {
      body = {};
    }
    
    const { progress, wpm, rawWpm, userEmail } = body;
    let { accuracy } = body;
    
    // Normalize accuracy to 0-100 range
    if (accuracy > 100) {
      accuracy = accuracy / 100;
    }
    accuracy = Math.min(100, Math.max(0, accuracy));
    
    console.log(`[RACE PROGRESS] Update for ${roomCode}:`, { progress, accuracy, wpm, rawWpm });
    
    let session = await getServerSession(authOptions);

    // If no server session, use client-provided email as fallback
    if (!session?.user?.email && userEmail) {
      console.log('[RACE PROGRESS] Using client-provided email:', userEmail);
      session = { user: { email: userEmail } };
    }

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

    const participant = await prisma.raceParticipant.update({
      where: {
        raceId_userId: {
          raceId: race.id,
          userId: user.id
        }
      },
      data: {
        progress,
        accuracy,
        wpm,
        rawWpm: rawWpm || wpm
      }
    });

    console.log('[RACE PROGRESS] Saved for user:', user.id, 'Progress:', progress);
    return jsonResponse(serializeForJSON(participant), 200);
  } catch (error) {
    console.error('[RACE PROGRESS] Error:', error);
    return jsonResponse(
      { 
        error: 'Failed to update progress',
        details: error.message || 'Unknown error',
        timestamp: new Date().toISOString()
      },
      500
    );
  }
}
