import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Create NextAuth handler
const handler = NextAuth({
  ...authOptions,
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      }
    }
  }
});

// Export properly for App Router
export { handler as GET, handler as POST };