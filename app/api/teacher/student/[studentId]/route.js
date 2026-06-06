import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "teacher") {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    const { studentId } = params;

    // Get student's recent scores and performance
    const scores = await prisma.score.findMany({
      where: { userId: studentId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    if (!student) {
      return new Response(
        JSON.stringify({ error: "Student not found" }),
        { status: 404 }
      );
    }

    const avgWpm =
      scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s.wpm, 0) / scores.length)
        : 0;

    const avgAccuracy =
      scores.length > 0
        ? Math.round(
            scores.reduce((sum, s) => sum + s.accuracy, 0) / scores.length
          )
        : 0;

    return new Response(
      JSON.stringify({
        student,
        scores,
        stats: {
          totalTests: scores.length,
          avgWpm,
          avgAccuracy,
          bestWpm: scores.length > 0 ? Math.max(...scores.map((s) => s.wpm)) : 0,
          latestTest: scores.length > 0 ? scores[0] : null,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching student data:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
