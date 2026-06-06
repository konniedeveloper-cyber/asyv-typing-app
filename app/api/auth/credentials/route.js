import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, csrfToken } = body;

    console.log('🔐 [CREDENTIALS] Signin attempt:', email);

    if (!email || !password) {
      console.log('❌ [CREDENTIALS] Missing email or password');
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
      },
    });

    if (!user) {
      console.log('❌ [CREDENTIALS] User not found:', email);
      return NextResponse.json({
        error: 'Invalid credentials'
      }, { status: 401 });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      console.log('❌ [CREDENTIALS] Password mismatch');
      return NextResponse.json({
        error: 'Invalid credentials'
      }, { status: 401 });
    }

    console.log('✅ [CREDENTIALS] Auth successful for:', email);

    // Return user object for NextAuth session creation
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.username,
      role: user.role,
    });
  } catch (error) {
    console.error('🚨 [CREDENTIALS] Error:', error.message);
    return NextResponse.json({
      error: 'Authentication failed'
    }, { status: 500 });
  }
}
