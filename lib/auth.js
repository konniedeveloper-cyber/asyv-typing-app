import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

console.log('🔧 [AUTH] Initializing auth config');
console.log('🔧 [AUTH] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING');
console.log('🔧 [AUTH] GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING');
console.log('🔧 [AUTH] GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? 'SET' : 'MISSING');
console.log('🔧 [AUTH] GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET ? 'SET' : 'MISSING');
console.log('🔧 [AUTH] NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('🔧 [AUTH] NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING');

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: 'select_account',
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('🔐 [AUTH] === AUTHORIZE START ===');
        console.log('🔐 [AUTH] Credentials received:', !!credentials?.email, !!credentials?.password);
        
        try {
          // Step 1: Validate inputs
          if (!credentials?.email || !credentials?.password) {
            console.error('❌ [AUTH] Missing credentials');
            return null;
          }

          const email = credentials.email.trim().toLowerCase();
          console.log('🔐 [AUTH] Looking for email:', email);

          // Step 2: Find user
          console.log('🔐 [AUTH] Querying database...');
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              username: true,
              password: true,
              role: true,
            },
          });
          console.log('🔐 [AUTH] Database query complete. User exists:', !!user);

          if (!user) {
            console.log('❌ [AUTH] User not found');
            return null;
          }

          // Step 3: Check password
          console.log('🔐 [AUTH] Checking password...');
          console.log('🔐 [AUTH] User password hash type:', typeof user.password);
          console.log('🔐 [AUTH] User password hash length:', user.password?.length);
          console.log('🔐 [AUTH] Input password type:', typeof credentials.password);
          console.log('🔐 [AUTH] Input password length:', credentials.password?.length);

          const passwordMatch = await bcrypt.compare(credentials.password, user.password);
          console.log('🔐 [AUTH] Password match result:', passwordMatch);

          if (!passwordMatch) {
            console.log('❌ [AUTH] Password incorrect');
            return null;
          }

          // Step 4: Success
          console.log('✅ [AUTH] Authorization successful');
          console.log('✅ [AUTH] === AUTHORIZE END ===');
          
          return {
            id: user.id,
            email: user.email,
            name: user.username || user.email,
            username: user.username,
            role: user.role || 'student',
          };
        } catch (error) {
          console.error('🚨 [AUTH] EXCEPTION in authorize:',  error.message);
          console.error('🚨 [AUTH] Stack:', error.stack);
          console.error('🚨 [AUTH] === AUTHORIZE END (ERROR) ===');
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log('🔄 [AUTH] redirect callback', { url, baseUrl });
      // Redirect to same origin URLs, otherwise redirect to base URL
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async profile({ profile, account, user }) {
      console.log('👤 [AUTH] profile callback', { provider: account?.provider, email: profile?.email });
      try {
        const result = {
          id: profile?.id || profile?.sub || profile?.node_id,
          name: profile?.name || profile?.login || 'User',
          email: profile?.email,
          image: profile?.picture || profile?.avatar_url || profile?.image,
        };
        console.log('👤 [AUTH] profile result:', result);
        return result;
      } catch (error) {
        console.error('❌ [AUTH] Profile error:', error);
        // Return safe defaults on error
        return {
          id: profile?.id || profile?.sub,
          email: profile?.email,
          name: profile?.name || 'User',
        };
      }
    },
    async signIn({ user, account, profile }) {
      console.log('🔑 [AUTH] signIn called', { provider: account?.provider, email: user?.email });
      
      try {
        // For OAuth providers, ensure user exists in database
        if (account?.provider === 'google' || account?.provider === 'github') {
          // User should already be created by PrismaAdapter, but add fallback
          if (user?.email) {
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email },
              select: { id: true, email: true, username: true },
            });
            
            if (!dbUser) {
              console.log('🔐 [AUTH] OAuth user not found, PrismaAdapter might not have created user');
            } else {
              console.log('🔐 [AUTH] OAuth user found in database:', dbUser.email);
            }
          }
        }
        return true;
      } catch (error) {
        console.error('❌ [AUTH] signIn error:', error);
        return true; // Allow sign in to continue even if there's an error
      }
    },
    async jwt({ token, user, account }) {
      console.log('🔑 [AUTH] jwt called', { hasUser: !!user, email: user?.email || token.email });
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name || user.username;
        token.username = user.username;
        token.role = user.role || 'student';
        token.image = user.image;
      }
      return token;
    },
    async session({ session, user, token }) {
      console.log('📊 [AUTH] session callback called', { 
        email: session?.user?.email,
        hasUser: !!user,
        hasToken: !!token,
        strategy: 'database'
      });
      
      // For database strategy with OAuth, fetch user data from DB
      if (session.user && session.user.email && !user) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
              id: true,
              email: true,
              username: true,
              role: true,
              image: true,
            },
          });
          
          if (dbUser) {
            session.user.id = dbUser.id;
            session.user.role = dbUser.role || 'student';
            session.user.username = dbUser.username;
            session.user.image = dbUser.image;
            console.log('📊 [AUTH] Fetched OAuth user from DB:', dbUser.email);
          }
        } catch (error) {
          console.error('❌ [AUTH] Error fetching user from DB in session callback:', error);
        }
      } else if (session.user && user) {
        // User data already available from JWT/callback
        session.user.id = user.id;
        session.user.role = user.role || 'student';
        session.user.username = user.username;
        session.user.image = user.image;
      }
      
      console.log('📊 [AUTH] session callback returning:', {
        email: session?.user?.email,
        role: session?.user?.role,
        id: session?.user?.id
      });
      
      return session;
    },
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    signOut: "/",
    error: "/auth/error",
    newUser: "/auth/complete-profile",
  },
};

console.log('✅ [AUTH] Config initialized');
