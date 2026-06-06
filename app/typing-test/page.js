'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { HomeIcon, ChartBarIcon, LightBulbIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext';
import TypingTest from '@/app/components/TypingTest';
import { RainbowNavWrapper } from '@/app/components/RainbowNavWrapper';

export default function TypingTestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const suggestionId = searchParams.get('suggestionId');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check authentication - NextAuth session or localStorage
  useEffect(() => {
    if (!isMounted) return;

    console.log('🔐 [TYPING TEST PAGE] Auth check - status:', status, 'session:', !!session);
    
    // If NextAuth has a session, user is authenticated
    if (session) {
      console.log('✅ [TYPING TEST PAGE] Authenticated via NextAuth');
      setIsAuthenticated(true);
      setAuthChecked(true);
      return;
    }

    // If NextAuth is still loading, try localStorage first as fallback
    if (status === 'loading') {
      console.log('⏳ [TYPING TEST PAGE] NextAuth session loading, checking localStorage...');
      const authUser = localStorage.getItem('authUser');
      if (authUser) {
        try {
          const userData = JSON.parse(authUser);
          console.log('✅ [TYPING TEST PAGE] Using localStorage while NextAuth loads:', userData.email);
          setIsAuthenticated(true);
          setAuthChecked(true);
          return;
        } catch (error) {
          console.log('❌ [TYPING TEST PAGE] Invalid localStorage data');
        }
      }
      // Still wait for NextAuth to load
      return;
    }

    // NextAuth returned unauthenticated, check localStorage as fallback
    if (status === 'unauthenticated') {
      console.log('📦 [TYPING TEST PAGE] NextAuth unauthenticated, checking localStorage...');
      const authUser = localStorage.getItem('authUser');
      if (authUser) {
        try {
          const userData = JSON.parse(authUser);
          console.log('✅ [TYPING TEST PAGE] Authenticated via localStorage:', userData.email);
          setIsAuthenticated(true);
          setAuthChecked(true);
        } catch (error) {
          console.log('❌ [TYPING TEST PAGE] Invalid localStorage data, redirecting to login');
          router.push('/auth/login');
        }
      } else {
        console.log('❌ [TYPING TEST PAGE] Not authenticated, redirecting to login');
        router.push('/auth/login');
      }
    }
  }, [status, session, router, isMounted]);

  if (!authChecked || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800' : 'bg-gradient-to-br from-white via-gray-50 to-gray-100'}`}>
      {/* Navigation */}
      <RainbowNavWrapper className="fixed top-0 left-0 right-0 flex justify-center z-50 pt-6 px-4 rounded-full">
      <nav className="fixed top-0 left-0 right-0 flex justify-center z-50 pt-6 px-4">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full shadow-lg backdrop-blur-md bg-opacity-90 dark:bg-opacity-90 px-2 py-3 flex items-center gap-1">
          {/* Home */}
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200"
            title="Home"
          >
            <HomeIcon className="w-5 h-5" />
            <span>Home</span>
          </Link>

          {/* Learn */}
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200"
            title="Learn"
          >
            <LightBulbIcon className="w-5 h-5" />
            <span>Learn</span>
          </Link>

          {/* Leaderboard */}
          <Link
            href="/pro"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200"
            title="Leaderboard"
          >
            <ChartBarIcon className="w-5 h-5" />
            <span>Leaderboard</span>
          </Link>

          {/* Separator */}
          <div className="h-8 w-px bg-gray-300 dark:bg-slate-600 mx-1"></div>

          {/* Dashboard */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200"
          >
            <span>Dashboard</span>
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>
      </RainbowNavWrapper>

      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <TypingTest suggestionId={suggestionId} />
        </div>
      </section>
    </div>
  );
}
