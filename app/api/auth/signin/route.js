import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('🔐 [SIGNIN] Credentials signin attempt for:', email);

    if (!email || !password) {
      return NextResponse.json({
        error: 'Missing email or password'
      }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        role: true,
      },
    });

    if (!user) {
      console.log('❌ [SIGNIN] User not found:', normalizedEmail);
      return NextResponse.json({
        error: 'Invalid credentials'
      }, { status: 401 });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.log('❌ [SIGNIN] Password mismatch for:', email);
      return NextResponse.json({
        error: 'Invalid credentials'
      }, { status: 401 });
    }

    console.log('✅ [SIGNIN] Authentication successful for:', email);

    // Return user data (NextAuth will handle session creation)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.username || user.email,
        username: user.username,
        role: user.role || 'student',
      }
    });
  } catch (error) {
    console.error('🚨 [SIGNIN] Error:', error.message);
    return NextResponse.json({
      error: 'Authentication failed'
    }, { status: 500 });
  }
}
