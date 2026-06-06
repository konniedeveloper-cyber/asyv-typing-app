import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const emailParam = searchParams.get('email');
    
    let userEmail = session?.user?.email || emailParam;
    let user = null;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from database to check role
    user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, email: true, role: true },
    });

    if (!user || user.role !== "teacher") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { classId } = params;
    console.log('API received classId:', classId, 'type:', typeof classId);

    // Map class IDs to database class names
    const classNameMap = {
      "ey-jupiter": "EY Jupiter",
      "ey-venus": "EY Venus",
      "ey-mercury": "EY Mercury",
      "ey-neptune": "EY Neptune",
    };

    console.log('Available classIds:', Object.keys(classNameMap));
    const className = classNameMap[classId];
    console.log('Mapped className:', className);

    if (!className) {
      console.error('Invalid class ID:', classId, '- not found in map');
      return NextResponse.json(
        { error: "Invalid class ID" },
        { status: 400 }
      );
    }

    // Find or create the class
    let classRecord = await prisma.class.findFirst({
      where: {
        name: className,
        teacherId: user.id,
      },
    });

    // If class doesn't exist, create it
    if (!classRecord) {
      classRecord = await prisma.class.create({
        data: {
          name: className,
          teacherId: user.id,
        },
      });
    }

    // Fetch students assigned to this class
    const classStudents = await prisma.user.findMany({
      where: {
        classId: className,
        role: 'student', // Only include actual students, not teachers
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    // Get student statistics
    const students = await Promise.all(
      classStudents.map(async (student) => {
        const scores = await prisma.score.findMany({
          where: { userId: student.id },
          select: { wpm: true, accuracy: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });

        const avgWpm =
          scores.length > 0
            ? Math.round(
                scores.reduce((sum, s) => sum + s.wpm, 0) / scores.length
              )
            : 0;

        // Check real-time tab activity:
        // 1. First check Redis (fastest)
        // 2. Then check database Activity (persistent)
        // 3. Fall back to score submission time (basic)
        let isActive = false;
        let lastActivity = null;
        
        // Try Redis first (fastest)
        try {
          const redis = await getRedis();
          if (redis) {
            const activityKey = `student:activity:${student.id}`;
            const activityData = await redis.get(activityKey);
            
            if (activityData) {
              try {
                const activity = JSON.parse(activityData);
                isActive = activity.isActive === true;
                lastActivity = activity.timestamp || activity.updatedAt;
              } catch (parseError) {
                // Ignore parse errors
              }
            }
          }
        } catch (redisError) {
          // Redis not available - continue to database check silently
        }

        // If no Redis data, check database
        if (!lastActivity) {
          try {
            const recentActivity = await prisma.activity.findFirst({
              where: { userId: student.id },
              orderBy: { timestamp: 'desc' },
              take: 1,
            });

            if (recentActivity) {
              // Only consider active if activity is within last 60 seconds
              const secondsAgo = (Date.now() - new Date(recentActivity.timestamp).getTime()) / 1000;
              if (secondsAgo < 60) {
                isActive = recentActivity.isActive;
                lastActivity = recentActivity.timestamp.toISOString();
              }
            }
          } catch (dbError) {
            console.error(`Failed to fetch activity for student ${student.id}:`, dbError);
          }
        }

        // Final fallback: check if they submitted a score recently
        if (!lastActivity && scores.length > 0) {
          const lastScore = scores[0].createdAt;
          lastActivity = lastScore.toISOString();
          isActive = (Date.now() - lastScore.getTime()) < 30000;
        }

        return {
          id: student.id,
          name: student.username || student.email,
          email: student.email,
          avgWpm,
          testCount: scores.length,
          isActive,
          lastActivity: lastActivity?.toString?.() || lastActivity,
        };
      })
    );

    return NextResponse.json({
      totalStudents: students.length,
      activeStudents: 0, // In a real-time setup, count active sessions
      completedTests: students.reduce((sum, s) => sum + s.testCount, 0),
      students,
    });
  } catch (error) {
    console.error("Error fetching class data:", error.message, error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
