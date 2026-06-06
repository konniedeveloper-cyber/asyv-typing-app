import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import prisma from '@/lib/prisma';
import DashboardContent from './DashboardContent';

// Mark as dynamic since we're using cookies() and doing auth checks
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  console.log('📊 [DASHBOARD] Page rendering...');
  
  try {
    // Get the session token from cookie
    // In production (HTTPS), cookie is named __Secure-next-auth.session-token
    // In development (HTTP), cookie is named next-auth.session-token
    const cookieStore = await cookies();
    let sessionToken = cookieStore.get('next-auth.session-token')?.value;
    
    // Fallback to secure cookie name for production
    if (!sessionToken) {
      sessionToken = cookieStore.get('__Secure-next-auth.session-token')?.value;
    }
    
    console.log('📊 [DASHBOARD] Session token found:', !!sessionToken);

    if (!sessionToken) {
      console.log('❌ [DASHBOARD] No session token in cookie, redirecting to login');
      redirect("/auth/login");
    }

    console.log('📊 [DASHBOARD] Looking up session in database...');
    console.log('📊 [DASHBOARD] Token preview:', sessionToken.substring(0, 20) + '...');
    console.log('📊 [DASHBOARD] Using Prisma to find session...');

    // Query the database directly for the session with a timeout
    let session;
    try {
      // Use Promise.race to add a timeout
      session = await Promise.race([
        prisma.session.findUnique({
          where: { sessionToken },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                role: true,
                image: true,
              },
            },
          },
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout after 8 seconds')), 8000)
        ),
      ]);
      
      console.log('📊 [DASHBOARD] Database query succeeded');
      console.log('📊 [DASHBOARD] Session found:', !!session);
    } catch (dbError) {
      console.error('🚨 [DASHBOARD] Database error:', {
        message: dbError.message,
        code: dbError.code,
        timestamp: new Date().toISOString(),
      });
      // Fall back to a simple response instead of redirecting
      console.error('🚨 [DASHBOARD] Falling back to login due to DB error');
      redirect("/auth/login");
    }

    if (!session) {
      console.log('❌ [DASHBOARD] Session not found in database');
      redirect("/auth/login");
    }

    // Check if session is expired
    const now = new Date();
    const expiresAt = new Date(session.expires);
    
    if (now > expiresAt) {
      console.log('❌ [DASHBOARD] Session expired');
      redirect("/auth/login");
    }

    console.log('✅ [DASHBOARD] Valid session for:', session.user.email);

    // Check user role and redirect if needed
    if (session.user.role === "admin") {
      console.log('🔄 [DASHBOARD] Redirecting admin to /admin-dashboard');
      redirect("/admin-dashboard");
    }

    if (session.user.role === "teacher") {
      console.log('🔄 [DASHBOARD] Redirecting teacher to /teacher-dashboard');
      redirect("/teacher-dashboard");
    }

    console.log('✅ [DASHBOARD] Rendering student dashboard');

    // Only students see the student dashboard
    return <DashboardContent />;
  } catch (error) {
    console.error('🚨 [DASHBOARD] Caught error:', error.message);
    redirect("/auth/login");
  }
}
