import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get('email');
    
    let userEmail = session?.user?.email || emailParam;
    let user = null;

    if (!userEmail) {
      console.error('❌ [ADMIN_API] No session or email found');
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      );
    }

    // Get user from database to check role
    user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      console.error('❌ [ADMIN_API] User not found:', userEmail);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('🔐 [ADMIN_API] Admin user:', {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    if (user.role !== 'admin') {
      console.error('❌ [ADMIN_API] User is not admin. Role:', user.role);
      return NextResponse.json(
        { error: `Unauthorized - Admin access required (Current role: ${user.role})` },
        { status: 403 }
      );
    }

    console.log('✅ [ADMIN_API] Admin user accessing users list');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        gender: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats
    const stats = {
      totalUsers: users.length,
      students: users.filter((u) => u.role === 'student').length,
      teachers: users.filter((u) => u.role === 'teacher').length,
      admins: users.filter((u) => u.role === 'admin').length,
    };

    return NextResponse.json({ users, stats });
  } catch (error) {
    console.error('❌ [ADMIN_API] Error fetching users:', error);
    return NextResponse.json(
      { error: `Failed to fetch users: ${error.message}` },
      { status: 500 }
    );
  }
}
