import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

console.log('🔧 [AUTH_MINIMAL] Building minimal auth config for testing');

export const authOptionsMinimal = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log('🔐 [AUTH_MINIMAL] authorize called');
          
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const email = credentials.email.trim().toLowerCase();
          
          let user;
          try {
            user = await prisma.user.findUnique({
              where: { email },
              select: {
                id: true,
                email: true,
                username: true,
                password: true,
                gender: true,
                role: true,
              },
            });
          } catch (dbError) {
            console.error('❌ [AUTH_MINIMAL] DB error:', dbError.message);
            return null;
          }

          if (!user) {
            return null;
          }

          if (!user.password) {
            return null;
          }

          let isPasswordValid = false;
          try {
            isPasswordValid = await bcrypt.compare(
              credentials.password,
              user.password
            );
          } catch (bcryptError) {
            console.error('❌ [AUTH_MINIMAL] Bcrypt error:', bcryptError.message);
            return null;
          }

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.username || user.email,
            username: user.username,
            gender: user.gender,
            role: user.role || 'student',
          };
        } catch (error) {
          console.error('🚨 [AUTH_MINIMAL] Error:', error.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session?.user) {
        session.user.id = token.sub;
        if (token.username) session.user.username = token.username;
        if (token.role) session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.username = user.username;
        token.email = user.email;
        token.role = user.role || 'student';
      }
      return token;
    },
    async signIn({ user, account }) {
      console.log('🔑 [AUTH_MINIMAL] signIn callback');
      if (user || account) {
        return true;
      }
      return false;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    signOut: "/",
    error: "/auth/error",
  },
};

console.log('✅ [AUTH_MINIMAL] Config created');
