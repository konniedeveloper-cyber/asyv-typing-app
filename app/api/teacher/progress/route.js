import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
    const classId = searchParams.get('classId');
    const days = parseInt(searchParams.get('days')) || 30; // Default: last 30 days

    // Get teacher ID from email
    const teacher = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!teacher || teacher.role !== 'teacher') {
      return Response.json(
        { error: 'Unauthorized - Teacher access required' },
        { status: 403 }
      );
    }

    if (!classId) {
      return Response.json(
        { error: 'classId is required' },
        { status: 400 }
      );
    }

    // Map class IDs to database class names
    const classNameMap = {
      'ey-jupiter': 'EY jupiter',
      'ey-venus': 'EY venus',
      'ey-mercury': 'EY mercury',
      'ey-neptune': 'EY neptune',
    };

    const className = classNameMap[classId];
    if (!className) {
      return Response.json(
        { error: 'Invalid class ID' },
        { status: 400 }
      );
    }

    // Verify/create teacher class
    let classData = await prisma.class.findFirst({
      where: {
        name: className,
        teacherId: teacher.id
      },
      include: {
        students: true
      }
    });

    // If class doesn't exist, create it
    if (!classData) {
      classData = await prisma.class.create({
        data: {
          name: className,
          teacherId: teacher.id,
        },
        include: {
          students: true
        }
      });
    }

    // Calculate date range
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    // Get all typing minutes for students in this class
    const allMinutes = await prisma.typingMinutes.findMany({
      where: {
        user: {
          classId: classData.id
        },
        date: {
          gte: dateFrom
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    // Calculate class-wide statistics
    const totalMinutes = allMinutes.reduce((sum, record) => sum + record.minutes, 0);
    const totalStudentsInClass = classData.students.length;
    const activeStudents = new Set(allMinutes.map(m => m.userId)).size;
    const avgMinutesPerStudent = totalStudentsInClass > 0 
      ? Math.round((totalMinutes / totalStudentsInClass) * 10) / 10 
      : 0;

    // Calculate per-student statistics
    const studentStats = {};
    classData.students.forEach(student => {
      studentStats[student.id] = {
        id: student.id,
        name: student.name || student.username || student.email,
        email: student.email,
        totalMinutes: 0,
        sessionsCount: 0,
        lastSession: null,
        averagePerSession: 0
      };
    });

    // Aggregate minutes by student
    allMinutes.forEach(record => {
      if (studentStats[record.userId]) {
        studentStats[record.userId].totalMinutes += record.minutes;
        studentStats[record.userId].sessionsCount += 1;
        if (!studentStats[record.userId].lastSession || 
            new Date(record.date) > new Date(studentStats[record.userId].lastSession)) {
          studentStats[record.userId].lastSession = record.date;
        }
      }
    });

    // Calculate averages
    Object.values(studentStats).forEach(student => {
      if (student.sessionsCount > 0) {
        student.averagePerSession = Math.round((student.totalMinutes / student.sessionsCount) * 10) / 10;
      }
    });

    // Convert to array and sort by total minutes
    const studentList = Object.values(studentStats).sort((a, b) => b.totalMinutes - a.totalMinutes);

    // Group minutes by day
    const byDay = {};
    allMinutes.forEach(record => {
      const date = new Date(record.date).toISOString().split('T')[0];
      if (!byDay[date]) {
        byDay[date] = 0;
      }
      byDay[date] += record.minutes;
    });

    return Response.json({
      success: true,
      data: {
        classInfo: {
          id: classData.id,
          name: classData.name,
          totalStudents: totalStudentsInClass,
          activeStudents,
          teacherId: classData.teacherId
        },
        statistics: {
          totalMinutes,
          avgMinutesPerStudent,
          daysTracked: Object.keys(byDay).length
        },
        students: studentList,
        byDay
      }
    }, { status: 200 });
  } catch (error) {
    console.error('[TEACHER-PROGRESS] Error:', error);
    return Response.json(
      { error: 'Failed to fetch class progress', details: error.message },
      { status: 500 }
    );
  }
}
