import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Get user notifications
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit')) || 50;

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Build filter
    const where = { userId: user.id };
    if (unreadOnly) {
      where.read = false;
    }

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Count unread
    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false
      }
    });

    return Response.json({
      success: true,
      data: notifications,
      unreadCount
    }, { status: 200 });
  } catch (error) {
    console.error('[GET-NOTIFICATIONS] Error:', error);
    return Response.json(
      { error: 'Failed to fetch notifications', details: error.message },
      { status: 500 }
    );
  }
}

// Mark notification as read
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { notificationId, read } = await request.json();

    if (!notificationId) {
      return Response.json(
        { error: 'notificationId is required' },
        { status: 400 }
      );
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification || notification.userId !== user.id) {
      return Response.json(
        { error: 'Notification not found or access denied' },
        { status: 404 }
      );
    }

    // Update notification
    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: read !== undefined ? read : true,
        readAt: read === true ? new Date() : null
      }
    });

    return Response.json({
      success: true,
      data: updated
    }, { status: 200 });
  } catch (error) {
    console.error('[UPDATE-NOTIFICATION] Error:', error);
    return Response.json(
      { error: 'Failed to update notification', details: error.message },
      { status: 500 }
    );
  }
}
