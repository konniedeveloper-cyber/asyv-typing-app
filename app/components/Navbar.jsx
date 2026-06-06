"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
// 1. Import NextAuth hooks
import { useSession, signIn, signOut } from "next-auth/react";
import { 
  ChartBarIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  ChevronDownIcon,
  UserPlusIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { MdMenuBook } from 'react-icons/md';
import FuzzyText from '../components/FuzzyText';
import ThemeToggle from './ThemeToggle';
import { RainbowNavWrapper } from './RainbowNavWrapper';

const musicTracks = ["/run.mp3", "/auraox.mp3", "/whois.mp3"];

export default function NavBar() {
  // 2. Replace local state with NextAuth session
  const { data: session, status } = useSession();
  const user = session?.user; // For cleaner syntax below

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [showControls, setShowControls] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userData, setUserData] = useState(null);
  const audioRef = useRef(null);
  const controlsRef = useRef(null);
  const userMenuRef = useRef(null);

  const togglePlayback = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolume = (e) => {
    const newVolume = parseFloat(e.target.value);
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const changeTrack = (index) => {
    setCurrentTrack(index);
    audioRef.current.src = musicTracks[index];
    if (isPlaying) {
      audioRef.current.play();
    }
  };

  const toggleControls = () => setShowControls(!showControls);
  const toggleUserMenu = () => setShowUserMenu(!showUserMenu);

  // 3. Updated Auth Handlers
  const handleSignIn = () => {
    signIn(); // Opens default NextAuth sign-in or starts provider flow
  };

  const handleSignOut = async () => {
    // Clear all auth-related localStorage items first
    localStorage.removeItem('authUser');
    localStorage.removeItem('theme');
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('auth') || key.startsWith('token') || key.startsWith('session')) {
        localStorage.removeItem(key);
      }
    });
    setShowUserMenu(false);
    await signOut({ redirect: true, callbackUrl: '/auth/login' }); // Clears session and cookies automatically
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (session) {
        try {
          const userRes = await fetch('/api/user');
          const userResponse = await userRes.json();
          if (userResponse.data) {
            setUserData(userResponse.data);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [session]);

  // Check localStorage for user data as fallback while session is loading
  useEffect(() => {
    if (status === 'loading' && !userData) {
      const authUser = localStorage.getItem('authUser');
      if (authUser) {
        try {
          const userData = JSON.parse(authUser);
          setUserData(userData);
        } catch (error) {
          console.log('Error parsing localStorage in NavBar:', error);
        }
      }
    }
  }, [status, userData]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (controlsRef.current && !controlsRef.current.contains(event.target) &&
          !event.target.closest('[data-audio-toggle]')) {
        setShowControls(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target) &&
          !event.target.closest('[data-user-menu]')) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <RainbowNavWrapper className="sticky top-0 z-50 rounded-b-2xl overflow-hidden">
      <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center p-3 shadow-sm dark:shadow-md">
        <span className="text-4xl font-[600] text-emerald-500 flex items-center gap-2">
          <ComputerDesktopIcon className="w-8 h-8" />
          Flash key
          <span className="inline-block text-xl align-middle" style={{width: '35px', height: '35px'}}>
            <FuzzyText baseIntensity={0.2}>💖</FuzzyText>
          </span>
          _.
        </span>

      <div className="flex items-center gap-4">
        {/* Navigation Links */}
        <Link href="/Study" className="flex items-center gap-2 text-gray-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
          <MdMenuBook className="w-5 h-5" />
          <span className="hidden md:inline">Lesson</span>
        </Link>

        <Link href="/pro" className="flex items-center gap-2 text-gray-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
          <ChartBarIcon className="w-5 h-5" />
          <span className="hidden md:inline">Leaderboard</span>
        </Link>

        {session && (
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            <UserCircleIcon className="w-5 h-5" />
            <span className="hidden md:inline">Dashboard</span>
          </Link>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Music Controls */}
        <div className="pl-4 border-l border-gray-200 dark:border-slate-700 relative">
          <button data-audio-toggle onClick={toggleControls} className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 transition-colors">
            {isPlaying ? <SpeakerWaveIcon className="w-5 h-5 text-emerald-500" /> : <SpeakerXMarkIcon className="w-5 h-5" />}
          </button>
          {showControls && (
             <div ref={controlsRef} className="absolute right-0 mt-2 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg dark:shadow-xl w-48 border border-gray-200 dark:border-slate-700">
                {/* ... existing controls UI remains exactly the same ... */}
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={togglePlayback} className="p-1 rounded bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                    {isPlaying ? <SpeakerWaveIcon className="w-4 h-4 text-emerald-500" /> : <SpeakerXMarkIcon className="w-4 h-4 text-gray-600 dark:text-slate-400" />}
                  </button>
                  <span className="text-xs text-gray-700 dark:text-slate-300">Melody #{currentTrack + 1}</span>
                </div>
                <input type="range" min="0" max="1" step="0.1" value={volume} onChange={handleVolume} className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                <div className="grid grid-cols-3 gap-1 mt-2">
                   {musicTracks.map((_, index) => (
                    <button key={index} onClick={() => changeTrack(index)} className={`text-xs p-1 rounded transition-colors ${currentTrack === index ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600"}`}>{index + 1}</button>
                  ))}
                </div>
             </div>
          )}
        </div>

        {/* 4. Updated Auth Section Section */}
        <div className="pl-4 border-l border-gray-200 dark:border-slate-700 relative">
          {session || userData ? (
            // LOGGED IN - Show Session Info
            <div className="relative">
              <button data-user-menu onClick={toggleUserMenu} className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                {(userData?.image || user?.image) ? (
                  <img src={userData?.image || user?.image} alt={userData?.username || user?.name || 'User'} className="w-8 h-8 rounded-full border-2 border-emerald-500" />
                ) : (
                  <UserCircleIcon className="w-8 h-8 text-emerald-500" />
                )}
                <ChevronDownIcon className="w-4 h-4 text-gray-600 dark:text-slate-400 hidden md:block" />
              </button>

              {showUserMenu && (
                <div ref={userMenuRef} className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl dark:shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                  <div className="p-4 bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      {(userData?.image || user?.image) ? (
                        <img src={userData?.image || user?.image} alt={userData?.username || user?.name || 'User'} className="w-12 h-12 rounded-full border-2 border-emerald-500" />
                      ) : (
                        <UserCircleIcon className="w-12 h-12 text-emerald-500" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-slate-100 font-medium truncate">{userData?.username || user?.name}</p>
                        <p className="text-gray-600 dark:text-slate-400 text-sm truncate">{userData?.email || user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <Link href="/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      <UserCircleIcon className="w-5 h-5" />
                      <span>My Dashboard</span>
                    </Link>
                    <Link href="/Study" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      <MdMenuBook className="w-5 h-5" />
                      <span>Lessons</span>
                    </Link>
                    <Link href="/pro" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      <ChartBarIcon className="w-5 h-5" />
                      <span>Leaderboard</span>
                    </Link>
                    <Link href="/race" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      <span className="text-lg">🏎️</span>
                      <span>Race Mode</span>
                    </Link>
                  </div>
                  <div className="p-2 border-t border-gray-200 dark:border-slate-700">
                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors">
                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // LOGGED OUT - Show Login and Signup buttons
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-900 dark:text-slate-100 font-medium transition-colors">
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                <span className="hidden md:inline">Login</span>
              </Link>
              <Link href="/auth/signup" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white dark:text-gray-900 font-medium transition-colors">
                <UserPlusIcon className="w-5 h-5" />
                <span className="hidden md:inline">Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      <audio ref={audioRef} src={musicTracks[currentTrack]} loop={true} />
    </nav>
    </RainbowNavWrapper>
  );
}