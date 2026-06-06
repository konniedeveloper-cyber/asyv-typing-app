"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "../context/ThemeContext";
import { useSession, signOut } from "next-auth/react";
import {
  HomeIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  UserCircleIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
  AcademicCapIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { MdMenuBook as MenuIcon } from "react-icons/md";
import { GiMusicalKeyboard } from "react-icons/gi";
import { IoMusicalNote } from "react-icons/io5";

const musicTracks = ["/run.mp3", "/auraox.mp3", "/whois.mp3"];

export default function DashboardSidebar({ isDark, onClose, isOpen }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Use theme from context for dark mode, not the prop
  const isDarkMode = theme === 'dark';
  
  // Set mounted flag on client
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Get user from localStorage (only on client after mount)
  useEffect(() => {
    if (!isMounted) return;

    const authUser = localStorage.getItem('authUser');
    if (authUser) {
      try {
        setUser(JSON.parse(authUser));
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, [isMounted]);
  
  // Music player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [showMusicControls, setShowMusicControls] = useState(false);
  const [showMelodyModal, setShowMelodyModal] = useState(false);
  
  // User menu state
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userData, setUserData] = useState(null);
  
  const audioRef = useRef(null);
  const musicControlsRef = useRef(null);
  const userMenuRef = useRef(null);
  
  const togglePlayback = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      const playPromise = audioRef.current?.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Playback failed:', error);
        });
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolume = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setVolume(newVolume);
  };

  const changeTrack = (index) => {
    if (index >= musicTracks.length || !audioRef.current) return;
    
    setCurrentTrack(index);
    audioRef.current.src = musicTracks[index];
    audioRef.current.load();
    
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Playback failed:', error);
        });
      }
    }
  };

  const handleMelodyOneClick = () => {
    if (!audioRef.current) return;
    
    setCurrentTrack(0);
    audioRef.current.src = musicTracks[0];
    audioRef.current.load();
    
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.error('Playback failed:', error);
      });
    }
    setShowMelodyModal(true);
  };
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (session && isMounted) {
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
  }, [session, isMounted]);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (musicControlsRef.current && !musicControlsRef.current.contains(event.target)) {
        setShowMusicControls(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize audio and set up handlers
  useEffect(() => {
    if (!audioRef.current) return;

    // Set initial volume
    audioRef.current.volume = volume;

    // Handle track ended - play next melody
    const handleTrackEnd = () => {
      const nextTrackIndex = (currentTrack + 1) % musicTracks.length;
      changeTrack(nextTrackIndex);
    };

    audioRef.current.addEventListener('ended', handleTrackEnd);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleTrackEnd);
      }
    };
  }, [currentTrack]);

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: ChartBarIcon,
    },
    {
      href: "/Study",
      label: "Lessons",
      icon: AcademicCapIcon,
    },
    {
      href: "/pro",
      label: "Leaderboard",
      icon: TrophyIcon,
    },
  ];

  const isActive = (href) => pathname === href;

  const handleSignOut = async () => {
    console.log('📤 [SIDEBAR] Signing out...');
    localStorage.removeItem('authUser');
    localStorage.removeItem('theme');
    // Clear all auth-related localStorage items
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('auth') || key.startsWith('token') || key.startsWith('session')) {
        localStorage.removeItem(key);
      }
    });
    setShowUserMenu(false);
    // Use NextAuth signOut
    await signOut({ redirect: true, callbackUrl: '/auth/login' });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen w-64 transition-all duration-300 z-50
          lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${
            isDarkMode
              ? "bg-slate-900 border-r border-slate-800"
              : "bg-white border-r border-gray-200"
          }
          flex flex-col
        `}
      >
        {/* Close Button - Mobile */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 lg:hidden p-2 rounded-lg transition z-10 ${
            isDarkMode
              ? "hover:bg-slate-800 text-slate-400"
              : "hover:bg-gray-100 text-gray-500"
          }`}
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Logo & Top Controls */}
        <div className="px-6 py-6 border-b" style={{
          borderBottomColor: isDarkMode ? 'rgb(30, 41, 59)' : 'rgb(229, 231, 235)'
        }}>
          <h2
            className={`text-2xl font-bold ${
              isDarkMode ? "text-emerald-500" : "text-emerald-600"
            }`}
          >
            Flash Typer
          </h2>
          
          {/* Music & Theme Controls */}
          <div className="flex items-center gap-2 mt-4">
            {/* Music Toggle */}
            <div className="relative flex-1">
              <button 
                onClick={handleMelodyOneClick}
                className={`w-full p-2 rounded-lg transition flex items-center gap-2 ${isDarkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
              >
                <IoMusicalNote className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium">Melody One</span>
              </button>
              
              {showMusicControls && (
                <div ref={musicControlsRef} className={`absolute top-12 left-0 right-0 rounded-lg shadow-lg p-3 z-20 ${isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white border border-gray-200"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={togglePlayback} className={`p-1 rounded ${isDarkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-gray-100 hover:bg-gray-200"}`}>
                      {isPlaying ? <SpeakerWaveIcon className="w-4 h-4 text-emerald-500" /> : <SpeakerXMarkIcon className="w-4 h-4" />}
                    </button>
                    <span className={`text-xs ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>Melody #{currentTrack + 1}</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.1" value={volume} onChange={handleVolume} className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                  <div className="grid grid-cols-3 gap-1 mt-2">
                    {musicTracks.map((_, index) => (
                      <button key={index} onClick={() => changeTrack(index)} className={`text-xs p-1 rounded transition ${currentTrack === index ? "bg-emerald-500 text-white" : isDarkMode ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>{index + 1}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition ${isDarkMode ? "bg-slate-800 hover:bg-slate-700 text-yellow-400" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
            >
              {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 py-6 overflow-y-auto">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition
                  ${
                    isActive(item.href)
                      ? isDark
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : isDark
                      ? "text-slate-400 hover:bg-slate-800 hover:text-slate-300"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
                onClick={onClose}
              >
                <IconComponent className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section & Sign Out */}
        <div className="px-4 pb-6 border-t pt-6" style={{
          borderTopColor: isDarkMode ? 'rgb(30, 41, 59)' : 'rgb(229, 231, 235)'
        }}>
          {session && (
            <div className="mb-4">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`w-full flex items-center gap-2 p-2 rounded-lg transition ${isDarkMode ? "bg-slate-800 hover:bg-slate-700" : "bg-gray-100 hover:bg-gray-200"}`}
              >
                {(userData?.image || user?.image) ? (
                  <img src={userData?.image || user?.image} alt={user?.name} className="w-8 h-8 rounded-full border-2 border-emerald-500" />
                ) : (
                  <UserCircleIcon className="w-8 h-8 text-emerald-500" />
                )}
                <div className="flex-1 text-left min-w-0">
                  <p className={`text-sm font-medium truncate ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>{user?.name}</p>
                  <p className={`text-xs truncate ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>{user?.email}</p>
                </div>
              </button>
              
              {showUserMenu && (
                <div ref={userMenuRef} className={`mt-2 rounded-lg shadow-lg border p-2 z-20 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
                  <Link href="/dashboard/profile" onClick={() => { setShowUserMenu(false); onClose(); }} className={`block px-3 py-2 rounded text-sm transition ${isDarkMode ? "text-slate-300 hover:bg-slate-700" : "text-gray-700 hover:bg-gray-100"}`}>
                    My Profile
                  </Link>
                  <Link href="/dashboard" onClick={() => { setShowUserMenu(false); onClose(); }} className={`block px-3 py-2 rounded text-sm transition ${isDarkMode ? "text-slate-300 hover:bg-slate-700" : "text-gray-700 hover:bg-gray-100"}`}>
                    Dashboard
                  </Link>
                  <Link href="/Study" onClick={() => { setShowUserMenu(false); onClose(); }} className={`block px-3 py-2 rounded text-sm transition ${isDarkMode ? "text-slate-300 hover:bg-slate-700" : "text-gray-700 hover:bg-gray-100"}`}>
                    Lessons
                  </Link>
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={handleSignOut}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium
              ${
                isDark
                  ? "text-rose-400 hover:bg-rose-500/10"
                  : "text-rose-600 hover:bg-rose-50"
              }
            `}
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Melody Selection Modal */}
      {showMelodyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className={`rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
            <h3 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
              Select Melody
            </h3>
            
            {/* Volume Control */}
            <div className="mb-6">
              <div className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                Volume: {Math.round(volume * 100)}%
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={volume} 
                onChange={handleVolume}
                className="w-full h-2 bg-gray-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 mb-6">
              {['Melody One', 'Melody Two', 'Melody Three', 'Melody Four'].map((name, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (index < musicTracks.length) {
                      changeTrack(index);
                      setIsPlaying(true);
                    }
                  }}
                  className={`p-3 rounded-lg transition font-medium ${
                    currentTrack === index && index < musicTracks.length
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : isDark
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } ${index >= musicTracks.length ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  disabled={index >= musicTracks.length}
                >
                  {name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowMelodyModal(false)}
              className={`w-full p-3 rounded-lg transition font-medium ${
                isDark
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <audio ref={audioRef} src={musicTracks[currentTrack]} loop={true} />
    </>
  );
}


