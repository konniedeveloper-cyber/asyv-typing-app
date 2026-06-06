import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AdminDashboardContent from "./AdminDashboardContent";

export const metadata = {
  title: "Admin Dashboard | TypingAuth",
  description: "Manage all users and system settings",
};

// Mark as dynamic since we're using cookies() and doing auth checks
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  try {
    // Get the session token from cookie
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('next-auth.session-token')?.value;

    if (!sessionToken) {
      redirect("/auth/login");
    }

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

    if (!session || new Date() > session.expires) {
      redirect("/auth/login");
    }

    // Redirect to appropriate dashboard if user is not an admin
    if (session.user.role !== "admin") {
      if (session.user.role === "teacher") {
        redirect("/teacher-dashboard");
      } else {
        redirect("/dashboard");
      }
    }

    return <AdminDashboardContent />;
  } catch (error) {
    console.error('🚨 [ADMIN-DASHBOARD] Error:', error.message);
    redirect("/auth/login");
  }
}
