import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('🔐 [LOGIN] Attempt:', email);

    if (!email || !password) {
      return NextResponse.json({
        error: 'Invalid credentials'
      }, { status: 401 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        role: true,
        image: true,
      },
    });

    if (!user) {
      console.log('❌ [LOGIN] User not found:', email);
      return NextResponse.json({
        error: 'Invalid credentials'
      }, { status: 401 });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      console.log('❌ [LOGIN] Password mismatch');
      return NextResponse.json({
        error: 'Invalid credentials'
      }, { status: 401 });
    }

    console.log('✅ [LOGIN] Success for:', email);
    console.log('📝 [LOGIN] User ID:', user.id);

    // Create a session token and store in database
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    console.log('📝 [LOGIN] Session token:', sessionToken.substring(0, 8) + '...');
    console.log('📝 [LOGIN] Expires at:', expiresAt);

    // Store session in database using NextAuth schema
    try {
      const session = await prisma.session.create({
        data: {
          sessionToken,
          userId: user.id,
          expires: expiresAt,
        },
      });
      console.log('✅ [LOGIN] Session created in database:', session.id);
    } catch (dbError) {
      console.error('🚨 [LOGIN] Session creation failed:', dbError.message);
      throw dbError;
    }

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.username || user.email,
        username: user.username,
        role: user.role || 'student',
        image: user.image,
      }
    });

    // Set NextAuth session cookie (same name NextAuth uses)
    // With database strategy, this should be the sessionToken
    response.cookies.set('next-auth.session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    console.log('✅ [LOGIN] Cookie set with name: next-auth.session-token');
    console.log('✅ [LOGIN] Cookie secure:', process.env.NODE_ENV === 'production');
    console.log('✅ [LOGIN] SESSION_CREATED:', {
      token: sessionToken.substring(0, 16) + '...',
      userId: user.id,
      expires: expiresAt.toISOString(),
    });

    return response;
  } catch (error) {
    console.error('🚨 [LOGIN] Error:', error.message);
    console.error('🚨 [LOGIN] Stack:', error.stack);
    return NextResponse.json({
      error: 'Authentication failed'
    }, { status: 500 });
  }
}
