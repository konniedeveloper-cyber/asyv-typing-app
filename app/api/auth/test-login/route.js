import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Testing login for: ${email}`);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        gender: true,
        role: true,
      },
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return NextResponse.json({
        success: false,
        message: 'User not found',
        email: email.toLowerCase().trim(),
        existingUsers: await prisma.user.count(),
      });
    }

    console.log(`✅ User found: ${user.email}`);

    // Check if password hash exists
    if (!user.password) {
      console.log(`❌ No password hash stored for user`);
      return NextResponse.json({
        success: false,
        message: 'User has no password (OAuth-only account?)',
        userId: user.id,
        email: user.email,
        username: user.username,
      });
    }

    // Test password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`🔐 Password match: ${isPasswordValid}`);

    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: 'Password is incorrect',
        email: user.email,
        username: user.username,
        hashedPasswordLength: user.password.length,
      });
    }

    // Password is correct!
    return NextResponse.json({
      success: true,
      message: 'Login test passed! Password is correct.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        gender: user.gender,
      },
    });
  } catch (error) {
    console.error('❌ Test login error:', error);
    return NextResponse.json(
      {
        error: 'Test login failed',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
