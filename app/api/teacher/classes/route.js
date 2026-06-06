import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'teacher') {
      return NextResponse.json(
        { error: "Unauthorized - Teacher access required" },
        { status: 403 }
      );
    }

    const teacher = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true }
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    // Sample classes from signup form (normalized to database format)
    const sampleClasses = [
      { id: 'ey-jupiter', name: 'EY Jupiter' },
      { id: 'ey-venus', name: 'EY Venus' },
      { id: 'ey-mercury', name: 'EY Mercury' },
      { id: 'ey-neptune', name: 'EY Neptune' }
    ];

    // Get all classes for this teacher with student counts and details
    const dbClasses = await prisma.class.findMany({
      where: { teacherId: teacher.id },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            gender: true,
            createdAt: true
          }
        },
        suggestions: {
          select: {
            id: true,
            sentence: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Get all students to find which sample classes have students
    const allStudents = await prisma.user.findMany({
      where: { role: 'student' },
      select: {
        id: true,
        classId: true,
        name: true,
        username: true,
        email: true,
        gender: true,
        createdAt: true
      }
    });

    // Combine database classes with sample classes
    const classMap = new Map();

    // Add database classes
    for (const cls of dbClasses) {
      classMap.set(cls.name, {
        ...cls,
        dbClass: true,
        isDatabase: true
      });
    }

    // Add sample classes if they have students
    for (const sampleClass of sampleClasses) {
      const classStudents = allStudents.filter(s => s.classId === sampleClass.name);
      
      if (!classMap.has(sampleClass.name)) {
        classMap.set(sampleClass.name, {
          id: sampleClass.id,
          name: sampleClass.name,
          teacherId: teacher.id,
          students: [],
          suggestions: [],
          createdAt: new Date(),
          isDatabase: false
        });
      }
    }

    // Enrich all classes with student stats
    const enrichedClasses = await Promise.all(
      Array.from(classMap.values()).map(async (cls) => {
        // Get all students for this class
        const classStudents = allStudents.filter(s => s.classId === cls.name);

        // Get stats for each student
        const studentsWithStats = await Promise.all(
          classStudents.map(async (student) => {
            const scores = await prisma.score.findMany({
              where: { userId: student.id },
              select: { wpm: true, accuracy: true },
              orderBy: { createdAt: 'desc' },
              take: 1
            });

            return {
              ...student,
              lastScore: scores[0] || null
            };
          })
        );

        // Get suggestions count (from database class if exists)
        const suggestionsCount = cls.suggestions ? cls.suggestions.length : 0;

        // Map class name to display ID
        const classNameMap = {
          'EY Jupiter': 'ey-jupiter',
          'EY Venus': 'ey-venus',
          'EY Mercury': 'ey-mercury',
          'EY Neptune': 'ey-neptune'
        };

        return {
          ...cls,
          students: studentsWithStats,
          studentCount: studentsWithStats.length,
          suggestionsCount,
          displayId: classNameMap[cls.name] || cls.name.toLowerCase().replace(/ /g, '-')
        };
      })
    );

    return NextResponse.json({
      success: true,
      teacher: {
        id: teacher.id,
        email: teacher.email,
        name: teacher.name
      },
      classes: enrichedClasses.sort((a, b) => a.name.localeCompare(b.name)),
      totalClasses: enrichedClasses.length,
      totalStudents: enrichedClasses.reduce((sum, cls) => sum + cls.studentCount, 0)
    });
  } catch (error) {
    console.error('[GET-TEACHER-CLASSES] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes', details: error.message },
      { status: 500 }
    );
  }
}
