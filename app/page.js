'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  SparklesIcon,
  ChartBarIcon,
  UserGroupIcon,
  LightBulbIcon,
  ArrowRightIcon,
  SunIcon,
  MoonIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  BellIcon,
  UserIcon,
  RocketLaunchIcon,
  EyeIcon,
  AcademicCapIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from './context/ThemeContext';
import TypingTest from './components/TypingTest';
import Silk from '../src/component/Silk';
import { RainbowNavWrapper } from './components/RainbowNavWrapper';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check NextAuth session first
    if (session?.user?.email) {
      console.log('[HOME] Authenticated via NextAuth session:', session.user.email);
      setIsAuthenticated(true);
      return;
    }
    
    // Fallback to localStorage if no NextAuth session
    try {
      const authUser = localStorage.getItem('authUser');
      if (authUser) {
        const userData = JSON.parse(authUser);
        if (userData?.email) {
          console.log('[HOME] Authenticated via localStorage:', userData.email);
          setIsAuthenticated(true);
          return;
        }
      }
    } catch (error) {
      console.log('[HOME] Error checking localStorage:', error);
    }
    
    console.log('[HOME] Not authenticated');
    setIsAuthenticated(false);
  }, [session]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-[#1e1e1e] via-[#252526] to-[#2d2d30]' : 'bg-gradient-to-br from-white via-gray-50 to-gray-100'}`}>
      <RainbowNavWrapper className="fixed top-0 left-0 right-0 flex justify-center z-50 pt-6 px-4" isDark={theme === 'dark'}>
        <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-full shadow-lg backdrop-blur-md bg-opacity-95 dark:bg-opacity-95 px-2 py-3 flex items-center gap-1`}>
          {/* Home */}
          <Link
            href="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${theme === 'dark' ? 'text-[#d4d4d4] hover:bg-[#3e3e42]' : 'text-gray-700 hover:bg-gray-100'} hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200`}
            title="Home"
          >
            <HomeIcon className="w-5 h-5" />
            <span>Home</span>
          </Link>

          {/* Search */}
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${theme === 'dark' ? 'text-[#d4d4d4] hover:bg-[#3e3e42]' : 'text-gray-700 hover:bg-gray-100'} hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200`}
            title="Learn to Type"
          >
            <LightBulbIcon className="w-5 h-5" />
            <span>Learn</span>
          </button>

          {/* Leaderboard */}
          <Link
            href="/pro"
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${theme === 'dark' ? 'text-[#d4d4d4] hover:bg-[#3e3e42]' : 'text-gray-700 hover:bg-gray-100'} hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200`}
            title="Leaderboard"
          >
            <ChartBarIcon className="w-5 h-5" />
            <span>Leaderboard</span>
          </Link>

          {/* Notifications */}
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${theme === 'dark' ? 'text-[#d4d4d4] hover:bg-[#3e3e42]' : 'text-gray-700 hover:bg-gray-100'} hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 relative`}
            title="Notifications"
          >
            <BellIcon className="w-5 h-5" />
            <span>Trendings</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* Profile / Auth */}
          <div className={`h-8 w-px ${theme === 'dark' ? 'bg-[#3e3e42]' : 'bg-gray-300'} mx-1`}></div>

          {/* Auth Buttons */}
          {mounted && !isAuthenticated ? (
            <>
              <Link
                href="/auth/login"
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${theme === 'dark' ? 'text-[#d4d4d4] hover:bg-[#3e3e42]' : 'text-gray-700 hover:bg-gray-100'} hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200`}
              >
                <UserIcon className="w-5 h-5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-all duration-200"
              >
                <UserIcon className="w-5 h-5" />
                <span>Get Started</span>
              </Link>
            </>
          ) : mounted && isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-all duration-200"
              >
                <UserIcon className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
            </>
          ) : null}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${theme === 'dark' ? 'text-[#d4d4d4] hover:bg-[#3e3e42]' : 'text-gray-700 hover:bg-gray-100'} transition-all duration-200`}
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </RainbowNavWrapper>

      {/* Typing Test Section - Below Navbar */}
      <section className={`pt-24 pb-16 px-4 sm:px-6 lg:px-8 ${theme === 'dark' ? 'bg-gradient-to-b from-[#1e1e1e] via-[#252526] to-[#2d2d30]/50' : 'bg-gradient-to-b from-white via-gray-50 to-transparent'}`}>
        <div className="max-w-6xl mx-auto">
          <TypingTest />
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Silk
            speed={5}
            scale={1}
            color="#7B7481"
            noiseIntensity={1.5}
            rotation={0}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className={`${theme === 'dark' ? 'bg-[#2d2d30]/95' : 'bg-white/95'} backdrop-blur-sm rounded-3xl p-12 sm:p-16 shadow-2xl ${theme === 'dark' ? 'border-[#3e3e42]/50' : 'border-white/20'} border animate-fade-in`}>
            <div className="text-center">
              <div className="inline-block px-4 py-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-full mb-6">
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  ⚡ Welcome to the typing revolution
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 dark:from-emerald-400 dark:via-emerald-500 dark:to-emerald-600 bg-clip-text text-transparent">
                  Master Typing
                </span>
              </h1>
              <p className={`text-xl ${theme === 'dark' ? 'text-[#d4d4d4]' : 'text-gray-700'} max-w-3xl mx-auto mb-8`}>
                Practice typing with realistic challenges, compete with friends in real-time races, and watch your skills improve. Join thousands of typists pushing their limits.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  href="/auth/signup"
                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-emerald-500/30"
                >
                  Start Typing Now
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link
                  href="/auth/login"
                  className="px-8 py-4 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 font-semibold rounded-xl transition-all duration-200"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className={`relative py-24 px-4 sm:px-6 lg:px-8 ${theme === 'dark' ? 'bg-[#1e1e1e]/50' : 'bg-white'} overflow-hidden`}>
        <div className="absolute inset-0 z-0 opacity-30">
          <Silk
            speed={5}
            scale={1}
            color="#7B7481"
            noiseIntensity={1.5}
            rotation={0}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl sm:text-5xl font-bold bg-gradient-to-r ${theme === 'dark' ? 'from-emerald-400 to-blue-400' : 'from-emerald-600 to-blue-600'} bg-clip-text text-transparent mb-4`}>
              Powerful Features for Every User
            </h2>
            <p className={`text-xl ${theme === 'dark' ? 'text-[#b0b0b0]' : 'text-gray-600'}`}>
              Everything you need to master typing and track your progress
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Racing Feature */}
            <div className={`p-8 bg-gradient-to-br from-orange-50 to-red-50 ${theme === 'dark' ? 'dark:from-orange-950/30 dark:to-red-950/30' : ''} rounded-2xl border-2 ${theme === 'dark' ? 'border-orange-700' : 'border-orange-200'} hover:shadow-lg transition-shadow`}>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <RocketLaunchIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className={`text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 ${theme === 'dark' ? 'dark:from-orange-400 dark:to-red-400' : ''} bg-clip-text text-transparent mb-2`}>
                Real-Time Racing
              </h3>
              <p className="text-gray-700 dark:text-[#d4d4d4] mb-4">
                Challenge friends and compete in live multiplayer races. Watch your progress in real-time as you type against others worldwide.
              </p>
              <Link href="/race" className={`${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'} font-semibold hover:underline flex items-center gap-2`}>
                Start Racing <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {/* Real-Time Typing Tests */}
            <div className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl border-2 border-emerald-200 dark:border-emerald-700 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                <SparklesIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-2">
                Typing Tests & Lessons
              </h3>
              <p className="text-gray-700 dark:text-[#d4d4d4] mb-4">
                Master typing fundamentals with our interactive lessons. Get instant feedback on your speed, accuracy, and typing technique.
              </p>
              <Link href="/typing-test" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-2">
                Start Learning <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {/* Teacher Monitoring */}
            <div className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl border-2 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <EyeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
                Teacher Dashboard
              </h3>
              <p className="text-gray-700 dark:text-[#d4d4d4] mb-4">
                Monitor your entire class in real-time. See active students, track minutes typed, activity status, and student progress all in one dashboard.
              </p>
              <Link href="/teacher-dashboard" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-2">
                View Dashboard <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {/* Progress Dashboard */}
            <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-2xl border-2 border-purple-200 dark:border-purple-700 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <ChartBarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
                Analytics & Progress
              </h3>
              <p className="text-gray-700 dark:text-[#d4d4d4] mb-4">
                Track every achievement with detailed statistics. Monitor WPM, accuracy, personal records, and improvements over time with beautiful charts.
              </p>
              <Link href="/dashboard" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-2">
                View Stats <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Teacher Monitoring Showcase */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <Silk
            speed={5}
            scale={1}
            color="#0369A1"
            noiseIntensity={1.5}
            rotation={0}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-6">
                Class Monitoring Made Easy
              </h2>
              <p className="text-lg text-blue-800 dark:text-blue-200 mb-6">
                Teachers can monitor their entire class with real-time insights:
              </p>
              <ul className="space-y-4">
                <li className="flex gap-4 items-start">
                  <CheckCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <span className="text-blue-700 dark:text-blue-300"><strong>Live Activity Status</strong> - See which students are actively typing</span>
                </li>
                <li className="flex gap-4 items-start">
                  <CheckCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <span className="text-blue-700 dark:text-blue-300"><strong>Minutes Tracked</strong> - Monitor total practice time per student</span>
                </li>
                <li className="flex gap-4 items-start">
                  <CheckCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <span className="text-blue-700 dark:text-blue-300"><strong>Performance Analytics</strong> - See WPM and accuracy for each student</span>
                </li>
                <li className="flex gap-4 items-start">
                  <CheckCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <span className="text-blue-700 dark:text-blue-300"><strong>Progress Tracking</strong> - Compare student improvement over time</span>
                </li>
              </ul>
              <Link href="/teacher-dashboard" className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Explore Teacher Features <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
            <div className="bg-white dark:bg-[#2d2d30] rounded-2xl p-8 shadow-xl border border-blue-200 dark:border-blue-700">
              <div className="space-y-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg">
                  <p className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Active Students: 24/30</p>
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{width: '80%'}}></div></div>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-lg">
                  <p className="font-semibold text-emerald-900 dark:text-emerald-200">Average WPM: 62</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">Class progress: ↑ 8% this week</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-lg">
                  <p className="font-semibold text-purple-900 dark:text-purple-200">Total Class Minutes: 1,240</p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">Average: 41.3 minutes per student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learn to Type Showcase */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#1e1e1e]/50 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30">
          <Silk
            speed={5}
            scale={1}
            color="#7B7481"
            noiseIntensity={1.5}
            rotation={0}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-white dark:bg-[#2d2d30] rounded-2xl p-8 shadow-xl border border-emerald-200 dark:border-emerald-700">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <AcademicCapIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="font-semibold text-emerald-900 dark:text-emerald-200">Beginner Fundamentals</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <AcademicCapIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="font-semibold text-emerald-900 dark:text-emerald-200">Touch Typing Lessons</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <AcademicCapIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="font-semibold text-emerald-900 dark:text-emerald-200">Speed & Accuracy Training</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <AcademicCapIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="font-semibold text-emerald-900 dark:text-emerald-200">Expert Tips & Techniques</span>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Learn to Type<br />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">the Easy Way</span>
              </h2>
              <p className="text-lg text-gray-700 dark:text-[#d4d4d4] mb-6">
                Our comprehensive lessons guide you from complete beginner to typing expert. Learn proper finger placement, build muscle memory, and develop consistent technique.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex gap-3 items-center">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-[#d4d4d4]">Interactive step-by-step tutorials</span>
                </li>
                <li className="flex gap-3 items-center">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-[#d4d4d4]">Real-time feedback on mistakes</span>
                </li>
                <li className="flex gap-3 items-center">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-[#d4d4d4]">Progressive difficulty levels</span>
                </li>
                <li className="flex gap-3 items-center">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-[#d4d4d4]">Certificate upon completion</span>
                </li>
              </ul>
              <Link href="/Study" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                Start Learning <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Silk
            speed={5}
            scale={1}
            color="#7B7481"
            noiseIntensity={1.5}
            rotation={0}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 dark:from-emerald-600 dark:via-emerald-700 dark:to-emerald-800 rounded-2xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Typing?</h2>
            <p className="text-xl mb-8 text-emerald-50">
              Join thousands of students and teachers building better typing skills. Start your journey today and see measurable progress.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/auth/signup"
                className="px-8 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-colors shadow-lg"
              >
                Sign Up Free
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-[#3e3e42] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center text-gray-600 dark:text-[#b0b0b0] text-sm">
          <p>&copy; 2026 TypingAuth. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}