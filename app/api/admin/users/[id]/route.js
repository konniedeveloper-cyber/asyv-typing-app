import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const emailFromBody = body.email;
    
    let userEmail = session?.user?.email || emailFromBody;
    let adminUser = null;

    if (!userEmail) {
      console.error('❌ [ADMIN_API] No session or email found for PUT');
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      );
    }

    // Get user from database to check role
    adminUser = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, email: true, role: true },
    });

    if (!adminUser || adminUser.role !== 'admin') {
      console.error('❌ [ADMIN_API] User is not admin for PUT. Role:', adminUser?.role);
      return NextResponse.json(
        { error: `Unauthorized - Admin access required (Current role: ${adminUser?.role})` },
        { status: 403 }
      );
    }

    console.log('✅ [ADMIN_API] Admin user updating user role');

    const { id } = params;
    const { role } = await request.json();

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be student, teacher, or admin' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    console.log('✅ [ADMIN_API] User role updated:', updatedUser.id);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('❌ [ADMIN_API] Error updating user:', error.message);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: `Failed to update user: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json().catch(() => ({}));
    const emailFromBody = body.email;
    
    let userEmail = session?.user?.email || emailFromBody;
    let adminUser = null;

    if (!userEmail) {
      console.error('❌ [ADMIN_API] No session or email found for DELETE');
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      );
    }

    // Get user from database to check role
    adminUser = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, email: true, role: true },
    });

    console.log('🔐 [ADMIN_API] DELETE user role:', adminUser?.role);

    if (!adminUser || adminUser.role !== 'admin') {
      console.error('❌ [ADMIN_API] User is not admin for DELETE. Role:', adminUser?.role);
      return NextResponse.json(
        { error: `Unauthorized - Admin access required (Current role: ${adminUser?.role})` },
        { status: 403 }
      );
    }

    const { id } = params;

    console.log('✅ [ADMIN_API] Admin user deleting user:', id);

    // Prevent deleting own admin account
    if (id === adminUser.id) {
      console.warn('⚠️ [ADMIN_API] Attempted to delete own account');
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if user exists first
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    });

    if (!userToDelete) {
      console.warn('⚠️ [ADMIN_API] User to delete not found:', id);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    console.log('✅ [ADMIN_API] User deleted successfully:', userToDelete.email);
    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ [ADMIN_API] Error deleting user:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: `Failed to delete user: ${error.message}` },
      { status: 500 }
    );
  }
}
