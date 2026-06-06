import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    let { username, email, password, gender, classId } = await request.json();

    // Normalize email: trim whitespace and convert to lowercase
    email = email.trim().toLowerCase();

    // Map class formats to database class names
    const classMap = {
      'ey-jupiter': 'EY jupiter',
      'ey-venus': 'EY venus',
      'ey-mercury': 'EY mercury',
      'ey-neptune': 'EY neptune',
      'EY jupiter': 'EY jupiter',
      'EY venus': 'EY venus',
      'EY mercury': 'EY mercury',
      'EY neptune': 'EY neptune',
    };

    // Valid classes
    const validClasses = ['EY jupiter', 'EY venus', 'EY mercury', 'EY neptune'];

    // Validate input
    if (!username || !email || !password || !gender) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!['male', 'female'].includes(gender)) {
      return NextResponse.json(
        { error: 'Gender must be male or female' },
        { status: 400 }
      );
    }

    // Normalize classId to database format
    const normalizedClassId = classMap[classId];
    if (!normalizedClassId) {
      return NextResponse.json(
        { error: `Invalid class. Must be one of: ey-jupiter, ey-venus, ey-mercury, ey-neptune` },
        { status: 400 }
      );
    }
    classId = normalizedClassId;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user - default role is 'student'
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        gender,
        classId, // Save the selected class
        role: 'student', // Default to student
      },
    });

    // Don't return password
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({ 
      success: true, 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Signup error:', error);
    console.error('Error message:', error.message);
    console.error('Error details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}