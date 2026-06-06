import { NextResponse } from 'next/server';

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
      NEXTAUTH_SECRET_SET: !!process.env.NEXTAUTH_SECRET,
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_NEXTAUTH_URL: process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'NOT SET',
    },
    endpoints: {
      session: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/session`,
      signin: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/signin`,
      callback_credentials: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/credentials`,
    },
    instructions: {
      step1: 'Check if NEXTAUTH_URL and NEXTAUTH_SECRET are set in Vercel environment variables',
      step2: 'Ensure NEXT_PUBLIC_NEXTAUTH_URL is also set in Vercel (for client-side access)',
      step3: 'Visit /api/auth/session to check if it returns JSON',
      step4: 'Check Vercel function logs for any errors',
      step5: 'Ensure MongoDB whitelist includes 0.0.0.0/0',
    },
  };

  return NextResponse.json(diagnostics);
}
