import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import TeacherDashboardContent from "./TeacherDashboardContent";

export const metadata = {
  title: "Teacher Dashboard | TypingAuth",
  description: "Monitor your classes and track student progress",
};

// Mark as dynamic since we're using cookies() and doing auth checks
export const dynamic = 'force-dynamic';

export default async function TeacherDashboard() {
  try {
    // Try to get session from NextAuth cookie
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('next-auth.session-token')?.value;

    if (sessionToken) {
      try {
        // Query the database for the session
        const session = await prisma.session.findUnique({
          where: { sessionToken },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        });

        if (session && new Date() <= session.expires) {
          // Redirect to student dashboard if user is not a teacher
          if (session.user.role !== "teacher") {
            redirect("/dashboard");
          }
          // Valid teacher session, allow access
          return <TeacherDashboardContent />;
        }
      } catch (sessionError) {
        console.error('[TEACHER-DASHBOARD] Error checking session:', sessionError.message);
        // Fall through to client-side auth with localStorage
      }
    }

    // No valid server-side session, allow client to handle with localStorage
    // The TeacherDashboardContent component will check localStorage and redirect if needed
    return <TeacherDashboardContent />;
  } catch (error) {
    console.error('[TEACHER-DASHBOARD] Error:', error.message);
    // Allow client component to handle auth with localStorage
    return <TeacherDashboardContent />;
  }
}
