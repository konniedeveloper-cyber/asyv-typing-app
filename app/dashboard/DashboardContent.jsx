'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../context/ThemeContext';
import SuccessModal from '../components/SuccessModal';
import DashboardSidebar from '../components/DashboardSidebar';
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  TrophyIcon,
  ChartBarIcon,
  ClockIcon,
  Cog6ToothIcon,
  CameraIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  BoltIcon,
  Bars3Icon,
  AcademicCapIcon,
  BellIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

// Seeded random function for consistent hydration
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export default function DashboardContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggleTheme, mounted } = useTheme();
  const tabActiveRef = useRef(true);
  const [isMounted, setIsMounted] = useState(false);

  // Get user from localStorage (set during login)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get user from localStorage (set during login) - only runs on client after mount
  useEffect(() => {
    if (!isMounted) return;

    try {
      const authUser = localStorage.getItem('authUser');
      if (authUser) {
        try {
          const userData = JSON.parse(authUser);
          console.log('✅ [DASHBOARD] User data from localStorage:', userData.email);
          console.log('✅ [DASHBOARD] User role:', userData.role);
          console.log('✅ [DASHBOARD] User classId:', userData.classId);
        
        // Check role BEFORE setting user state to avoid rendering issues
        if (userData.role === 'teacher') {
          console.log('🔄 [DASHBOARD] Redirecting teacher to /teacher-dashboard');
          // Update localStorage before redirecting
          localStorage.setItem('authUser', JSON.stringify(userData));
          router.push('/teacher-dashboard');
          return; // Exit early, don't set user state
        } else if (userData.role === 'admin') {
          console.log('🔄 [DASHBOARD] Redirecting admin to /admin-dashboard');
          // Update localStorage before redirecting
          localStorage.setItem('authUser', JSON.stringify(userData));
          router.push('/admin-dashboard');
          return; // Exit early, don't set user state
        }
        
          // Only set user for students
          setUser(userData);
          
          // Initialize selectedClass from user's classId (database format like "EY Jupiter")
          if (userData.classId) {
            const classMap = {
              'EY Jupiter': 'ey-jupiter',
              'EY Venus': 'ey-venus',
              'EY Mercury': 'ey-mercury',
              'EY Neptune': 'ey-neptune',
            };
            setSelectedClass(classMap[userData.classId] || 'ey-jupiter');
          }
          // IMPORTANT: Don't set loading to false here!
          // Let the fetchData useEffect handle it after actual data is fetched
          
        } catch (error) {
          console.error('❌ [DASHBOARD] Failed to parse user data:', error);
          router.push('/auth/login');
        }
      } else {
        console.log('❌ [DASHBOARD] No user in localStorage, redirecting to login');
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('❌ [DASHBOARD] localStorage error:', error);
      router.push('/auth/login');
    }
  }, [isMounted, router]);


  // Track tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      tabActiveRef.current = !document.hidden;
      
      // Send tab activity to server
      if (user?.id) {
        fetch('/api/student/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            isActive: !document.hidden,
            timestamp: new Date().toISOString()
          })
        }).catch(err => console.error('Activity tracking error:', err));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);
  const [userData, setUserData] = useState(null);
  const [scores, setScores] = useState([]);
  const [stats, setStats] = useState({
    totalTests: 0,
    bestWpm: 0,
    bestAccuracy: 0,
    bestRawWpm: 0,
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [weeklyTrend, setWeeklyTrend] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [settingsForm, setSettingsForm] = useState({
    username: '',
    gender: '',
    classId: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState('ey-jupiter');
  const fileInputRef = useRef(null);

  // Progress tracking states
  const [userProgress, setUserProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  const CLASSES = [
    { id: 'ey-jupiter', name: 'EY Jupiter' },
    { id: 'ey-venus', name: 'EY Venus' },
    { id: 'ey-mercury', name: 'EY Mercury' },
    { id: 'ey-neptune', name: 'EY Neptune' },
  ];

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good Morning';
    } else if (hour < 18) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  useEffect(() => {
    if (searchParams.get('login') === 'success') {
      setShowSuccessModal(true);
      // Clear the query parameter after showing the message
      setTimeout(() => {
        router.replace('/dashboard', undefined, { shallow: true });
      }, 3000);
    }
  }, [searchParams, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const scoresRes = await fetch(`/api/scores?userId=${user.id}`);
        const response = await scoresRes.json();
        const scoresData = response.data || [];
        setScores(scoresData);

        // Calculate stats
        if (scoresData.length > 0) {
          const totalTests = scoresData.length;
          const bestWpm = Math.max(...scoresData.map((s) => s.wpm));
          const bestRawWpm = Math.max(...scoresData.map((s) => s.rawWpm || 0));
          
          // Get best accuracy
          const bestAccuracy = Math.max(...scoresData.map((s) => {
            const acc = parseFloat(s.accuracy);
            return Math.min(100, Math.max(0, acc));
          }));

          setStats({
            totalTests,
            bestWpm,
            bestAccuracy: Math.round(bestAccuracy * 100) / 100,
            bestRawWpm,
          });

          // Calculate weekly data (last 7 days)
          const last7Days = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const dayScores = scoresData.filter(score => {
              const scoreDate = new Date(score.createdAt);
              scoreDate.setHours(0, 0, 0, 0);
              return scoreDate.getTime() === date.getTime();
            });

            const dayAvgWpm = dayScores.length > 0
              ? dayScores.reduce((sum, s) => sum + s.wpm, 0) / dayScores.length
              : 0;

            last7Days.push({
              date: date,
              wpm: dayAvgWpm,
              dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
            });
          }

          setWeeklyData(last7Days);

          // Calculate trend (compare first 3 days vs last 3 days)
          const first3Days = last7Days.slice(0, 3).reduce((sum, d) => sum + d.wpm, 0) / 3;
          const last3Days = last7Days.slice(-3).reduce((sum, d) => sum + d.wpm, 0) / 3;
          const trend = first3Days > 0 ? Math.round(((last3Days - first3Days) / first3Days) * 100) : 0;
          setWeeklyTrend(trend);
        }

        // Fetch user data
        const userRes = await fetch('/api/user');
        const userResponse = await userRes.json();
        if (userResponse.data) {
          setUserData(userResponse.data);
          setProfileImage(userResponse.data.image);
          
          // Map database class names back to UI format
          const classMap = {
            'EY Jupiter': 'ey-jupiter',
            'EY Venus': 'ey-venus',
            'EY Mercury': 'ey-mercury',
            'EY Neptune': 'ey-neptune',
          };
          
          setSettingsForm({
            username: userResponse.data.username || '',
            gender: userResponse.data.gender || '',
            classId: classMap[userResponse.data.classId] || 'ey-jupiter',
          });
        }

        // Fetch student profile to get current class
        try {
          const profileRes = await fetch('/api/student/profile');
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData.classId) {
              // Map database class names back to IDs
              const classMap = {
                'EY Jupiter': 'ey-jupiter',
                'EY Venus': 'ey-venus',
                'EY Mercury': 'ey-mercury',
                'EY Neptune': 'ey-neptune',
              };
              setSelectedClass(classMap[profileData.classId] || 'ey-jupiter');
            }
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      if (!userData) {
        setUserData(user);
      }
      fetchData();
    }
  }, [user, userData]);

  // Fetch user's typing minutes progress
  const fetchUserProgress = async () => {
    try {
      setProgressLoading(true);
      const response = await fetch('/api/student/progress/get-minutes?days=30');
      
      if (!response.ok) {
        console.error('Failed to fetch user progress');
        return;
      }

      const data = await response.json();
      setUserProgress(data.data);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    } finally {
      setProgressLoading(false);
    }
  };

  // Fetch teacher suggestions for student's class
  const fetchSuggestions = async () => {
    if (!user?.classId) return; // Wait for class to be loaded

    try {
      setSuggestionsLoading(true);
      // Use selectedClass which is already in the correct format (ey-jupiter)
      const response = await fetch(`/api/teacher/suggestions?classId=${selectedClass}`);
      if (response.ok) {
        const data = await response.json();
        const suggestionsData = data.data || [];
        
        // Fetch completion status for each suggestion
        const suggestionsWithStatus = await Promise.all(
          suggestionsData.map(async (suggestion) => {
            try {
              const completionRes = await fetch(`/api/teacher/suggestions/complete?suggestionId=${suggestion.id}`);
              const completionData = await completionRes.json();
              return {
                ...suggestion,
                isCompleted: completionData.data?.isCompleted || false,
                completion: completionData.data?.completion || null
              };
            } catch (error) {
              console.error('Error fetching completion status:', error);
              return {
                ...suggestion,
                isCompleted: false,
                completion: null
              };
            }
          })
        );

        setSuggestions(suggestionsWithStatus);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?unreadOnly=false&limit=10');
      
      if (!response.ok) {
        console.error('Failed to fetch notifications');
        return;
      }

      const data = await response.json();
      setNotifications(data.data || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId,
          read: true
        })
      });

      if (response.ok) {
        // Update local notifications
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Load progress, suggestions, and notifications on mount
  useEffect(() => {
    if (user) {
      fetchUserProgress();
      fetchNotifications();
      // Fetch suggestions after user data is loaded
      if (userData) {
        fetchSuggestions();
      }
    }
  }, [user, userData]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 2MB' });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Convert UI format classId to DB format
      const classNameMap = {
        'ey-jupiter': 'EY Jupiter',
        'ey-venus': 'EY Venus',
        'ey-mercury': 'EY Mercury',
        'ey-neptune': 'EY Neptune',
      };

      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email, // Include email for authentication fallback
          username: settingsForm.username,
          gender: settingsForm.gender,
          image: profileImage,
          classId: classNameMap[settingsForm.classId] || settingsForm.classId,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setUserData(data.data);
        setTimeout(() => setShowSettings(false), 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    const isDarkMode = theme === 'dark';
    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}>
        <DashboardSidebar isDark={isDarkMode} isOpen={false} onClose={() => {}} />
        
        {/* Main Content */}
        <main className="lg:ml-64 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 lg:pt-8">
          {/* Welcome Section Skeleton */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div className="flex-1">
              <div className={`h-12 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-3/4 mb-2`}></div>
              <div className={`h-5 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-1/2`}></div>
            </div>
            <div className={`h-16 bg-gray-300 dark:bg-slate-700 rounded-xl animate-pulse w-40`}></div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`backdrop-blur-md border rounded-lg p-6 ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className={`h-3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-3 w-24`}></div>
                    <div className={`h-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-16`}></div>
                  </div>
                  <div className={`w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse`}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Buttons Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-16 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse`}></div>
            ))}
          </div>

          {/* Class Assignment Skeleton */}
          <div className={`backdrop-blur-md border rounded-lg p-6 mb-8 ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200'}`}>
            <div className={`h-6 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-40 mb-6`}></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-12 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse`}></div>
              ))}
            </div>
            <div className={`h-10 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse w-full`}></div>
          </div>

          {/* Advanced Stats & Chart Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className={`backdrop-blur-md border rounded-lg p-8 ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200'}`}>
              <div className={`w-32 h-32 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse mx-auto`}></div>
            </div>
            <div className={`backdrop-blur-md border rounded-lg p-8 lg:col-span-2 ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200'}`}>
              <div className={`h-6 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-40 mb-4`}></div>
              <div className="flex items-end gap-2 h-40">
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <div key={i} className={`flex-1 bg-gray-200 dark:bg-slate-700 rounded-t-lg animate-pulse`} style={{height: `${seededRandom(i) * 80 + 20}%`}}></div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Scores Table Skeleton */}
          <div className={`backdrop-blur-md border rounded-lg overflow-hidden ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700/50' : 'border-gray-200'}`}>
              <div className={`h-6 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-40`}></div>
            </div>
            <div className="p-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
                  <div className={`flex-1 h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse`}></div>
                  <div className={`flex-1 h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse`}></div>
                  <div className={`flex-1 h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse`}></div>
                  <div className={`flex-1 h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse`}></div>
                </div>
              ))}
            </div>
          </div>

          {/* User Info Card Skeleton */}
          <div className={`mt-8 backdrop-blur-md border rounded-lg p-6 ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse`}></div>
              <div className="flex-1">
                <div className={`h-5 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-32 mb-2`}></div>
                <div className={`h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-48`}></div>
              </div>
              <div className={`h-10 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse`}></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <>
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Login Successful!"
        message="Welcome to your dashboard. You're now logged in and ready to start typing!"
        buttonText="Let's Start"
      />
      <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}>
        <DashboardSidebar isDark={isDark} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main Content Area */}
        <div className="lg:ml-64 transition-all duration-300">
          {/* Hamburger Menu Button - Mobile */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`fixed top-20 left-4 lg:hidden p-2 rounded-lg z-40 transition ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'bg-white hover:bg-gray-100 text-gray-700 shadow-lg'
            }`}
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* Notifications Button - Mobile */}
          <button
            onClick={() => setShowNotificationsModal(true)}
            className={`fixed top-20 right-4 lg:hidden p-2 rounded-lg z-40 transition relative ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'bg-white hover:bg-gray-100 text-gray-700 shadow-lg'
            }`}
          >
            <BellIcon className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white shadow-xl'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className={`p-2 rounded-lg transition ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className={`w-24 h-24 rounded-full overflow-hidden border-4 ${isDark ? 'border-emerald-500' : 'border-emerald-400'}`}>
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-emerald-600 to-emerald-400' : 'bg-gradient-to-br from-emerald-500 to-emerald-300'}`}>
                      <UserIcon className={`w-12 h-12 ${isDark ? 'text-slate-900' : 'text-white'}`} />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`absolute bottom-0 right-0 p-2 rounded-full transition ${isDark ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
                >
                  <CameraIcon className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Click camera to upload photo</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Username</label>
                <input
                  type="text"
                  value={settingsForm.username}
                  onChange={(e) => setSettingsForm({ ...settingsForm, username: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border transition ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100 focus:border-emerald-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-emerald-500'} focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Email</label>
                <input
                  type="email"
                  value={userData?.email || ''}
                  disabled
                  className={`w-full px-4 py-2 rounded-lg border transition cursor-not-allowed ${isDark ? 'bg-slate-800 border-slate-600 text-slate-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Gender</label>
                <select
                  value={settingsForm.gender}
                  disabled
                  className={`w-full px-4 py-2 rounded-lg border transition cursor-not-allowed ${isDark ? 'bg-slate-800 border-slate-600 text-slate-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Class</label>
                <select
                  value={settingsForm.classId}
                  disabled
                  className={`w-full px-4 py-2 rounded-lg border transition cursor-not-allowed ${isDark ? 'bg-slate-800 border-slate-600 text-slate-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`}
                >
                  <option value="ey-jupiter">EY Jupiter</option>
                  <option value="ey-venus">EY Venus</option>
                  <option value="ey-mercury">EY Mercury</option>
                  <option value="ey-neptune">EY Neptune</option>
                </select>
              </div>

              {/* Theme Toggle in Settings */}
              <div className="flex items-center justify-between py-2">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Dark Mode</span>
                <button
                  onClick={toggleTheme}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isDark ? 'bg-emerald-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${isDark ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {/* Message */}
            {message.text && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {message.text}
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className={`w-full mt-6 py-3 rounded-lg font-semibold transition ${isDark ? 'bg-emerald-600 hover:bg-emerald-700 text-slate-900' : 'bg-emerald-500 hover:bg-emerald-600 text-white'} disabled:opacity-50`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-2xl p-6 transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white shadow-xl'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
                <BellIcon className="w-6 h-6" />
                Notifications
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h2>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className={`p-2 rounded-lg transition ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Notifications List */}
            <div className={`max-h-96 overflow-y-auto space-y-3`}>
              {notifications.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  <BellIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border-l-4 transition ${
                      notification.read
                        ? isDark ? 'bg-slate-700/20 border-slate-600' : 'bg-gray-50 border-gray-300'
                        : isDark ? 'bg-blue-500/10 border-blue-500' : 'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          <h4 className={`font-semibold text-sm ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="inline-flex h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        
                        {/* Display suggested sentence if available */}
                        {notification.type === 'suggestion' && (
                          <div className={`mt-3 p-3 rounded border-l-2 ${isDark ? 'bg-slate-700/30 border-amber-500' : 'bg-amber-50 border-amber-400'}`}>
                            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                              📝 Suggested sentence:
                            </p>
                            <p className={`font-mono text-sm ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
                              "{notification.message.match(/"([^"]+)"/)?.[1] || 'Type this sentence to practice'}"
                            </p>
                          </div>
                        )}

                        <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => markNotificationAsRead(notification.id)}
                            className={`px-3 py-1.5 text-xs font-medium rounded transition whitespace-nowrap ${
                              isDark
                                ? 'bg-blue-600/50 hover:bg-blue-700 text-blue-100'
                                : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-700'
                            }`}
                          >
                            <CheckIcon className="w-4 h-4 inline mr-1" />
                            Mark Read
                          </button>
                        )}
                        {notification.type === 'suggestion' && (
                          <Link
                            href={`/typing-test?suggestionId=${notification.suggestionId}`}
                            onClick={() => setShowNotificationsModal(false)}
                            className={`px-3 py-1.5 text-xs font-medium rounded transition whitespace-nowrap text-center ${
                              isDark
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            }`}
                          >
                            <SparklesIcon className="w-4 h-4 inline mr-1" />
                            Practice
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className={`mt-6 pt-6 border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className={`w-full py-2 rounded-lg font-medium transition ${
                  isDark
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-100'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 lg:pt-8">
        {/* Welcome Section with Race Button */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h2 className={`text-4xl font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
              {getTimeGreeting()}, {userData?.username || userData?.name || userData?.email}!
            </h2>
            <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>Track your typing progress and improve your speed</p>
          </div>
          
          {/* Buttons Container */}
          <div className="flex gap-4 flex-col sm:flex-row">
            {/* Notifications Button */}
            <button
              onClick={() => setShowNotificationsModal(true)}
              className={`
                group flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-lg
                transition-all duration-300 transform hover:scale-105 hover:shadow-2xl
                relative whitespace-nowrap
                ${isDark 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                }
                text-white shadow-lg
              `}
            >
              <BellIcon className="w-6 h-6" />
              Notifications
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Race Button - Special Positioning */}
            <Link
              href="/race"
              className={`
                group flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-lg
                transition-all duration-300 transform hover:scale-105 hover:shadow-2xl
                bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600
                text-white shadow-lg
                whitespace-nowrap
              `}
            >
              <span className="text-2xl group-hover:animate-bounce">🏎️</span>
              Race Mode
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Tests */}
          <div className={`backdrop-blur-md border rounded-lg p-6 transition hover:border-emerald-500/50 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Total Tests</p>
                <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{stats.totalTests}</p>
              </div>
              <ChartBarIcon className="w-12 h-12 text-emerald-500 opacity-30" />
            </div>
          </div>

          {/* Best WPM */}
          <div className={`backdrop-blur-md border rounded-lg p-6 transition hover:border-emerald-500/50 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Best WPM</p>
                <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{stats.bestWpm}</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>WPM</p>
              </div>
              <TrophyIcon className="w-12 h-12 text-emerald-500 opacity-30" />
            </div>
          </div>

          {/* Best Accuracy */}
          <div className={`backdrop-blur-md border rounded-lg p-6 transition hover:border-emerald-500/50 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Best Accuracy</p>
                <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{stats.bestAccuracy}%</p>
              </div>
              <SparklesIcon className="w-12 h-12 text-emerald-500 opacity-30" />
            </div>
          </div>

          {/* Best Raw WPM */}
          <div className={`backdrop-blur-md border rounded-lg p-6 transition hover:border-emerald-500/50 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Best Raw WPM</p>
                <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{stats.bestRawWpm}</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Raw</p>
              </div>
              <BoltIcon className="w-12 h-12 text-emerald-500 opacity-30" />
            </div>
          </div>
        </div>

        {/* Learning Buttons - Between Stats and Advanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/typing-test">
            <button className={`w-full font-semibold py-4 rounded-xl transition transform hover:scale-105 shadow-lg ${isDark ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white' : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'}`}>
              Start New Typing Test
            </button>
          </Link>
          <Link href="/Study">
            <button className={`w-full font-semibold py-4 rounded-xl transition transform hover:scale-105 shadow-lg ${isDark ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'}`}>
              Lessons
            </button>
          </Link>
          <Link href="/pro">
            <button className={`w-full font-semibold py-4 rounded-xl transition transform hover:scale-105 shadow-lg ${isDark ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white' : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'}`}>
              Leaderboard
            </button>
          </Link>
        </div>

        {/* Class Selection Card */}
        <div className={`backdrop-blur-md border rounded-lg p-6 mb-8 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200 shadow-sm'}`}>
          <div className="flex items-center gap-3">
            <AcademicCapIcon className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
                Your Class
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                {CLASSES.find((c) => c.id === selectedClass)?.name || 'Not assigned'}
              </p>
            </div>
          </div>
          <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
            Class assignment is set during registration. Contact your teacher if you need to change it.
          </p>
        </div>

        {/* Advanced Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Best Performance Card */}
          <div className={`backdrop-blur-md border rounded-lg p-8 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200 shadow-sm'}`}>
            <div className="flex items-center gap-8">
              {/* Circular Progress */}
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 120 120">
                  {/* Background circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke={isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)'}
                    strokeWidth="8"
                  />
                  {/* Progress circle - gradient */}
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    strokeDasharray={`${(stats.bestAccuracy / 100) * 339.29} 339.29`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
                      {Math.round(stats.bestAccuracy)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-1 space-y-6">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    Best Speed
                  </p>
                  <p className={`text-3xl font-bold mt-1 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
                    {stats.bestWpm}<span className={`text-base ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>wpm</span>
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    Best Accuracy
                  </p>
                  <p className={`text-3xl font-bold mt-1 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
                    {Math.round(stats.bestAccuracy)}<span className={`text-base ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>%</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Speed Trend Chart */}
          <div className={`backdrop-blur-md border rounded-lg p-8 lg:col-span-2 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200 shadow-sm'}`}>
            <div className="mb-6">
              <h3 className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Speed Trend</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Last 7 Days</p>
              <p className={`text-sm ${weeklyTrend >= 0 ? 'text-emerald-500' : 'text-red-500'} font-semibold mt-2`}>
                {weeklyTrend >= 0 ? '📈' : '📉'} {weeklyTrend >= 0 ? '+' : ''}{weeklyTrend}%
              </p>
            </div>

            {/* Simple Chart */}
            <div className="relative h-48 flex items-end gap-2">
              {/* Chart Bars - Real weekly data */}
              {weeklyData.length > 0 ? (
                weeklyData.map((day, idx) => {
                  const maxWpm = Math.max(...weeklyData.map(d => d.wpm || 10), 70);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-gradient-to-t from-emerald-500 to-purple-500 rounded-t-lg transition-all hover:opacity-80"
                        style={{ height: `${(day.wpm / maxWpm) * 160}px` }}
                        title={`${Math.round(day.wpm)} WPM`}
                      />
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {day.dayName}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className={`w-full text-center py-8 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  No data yet
                </div>
              )}
            </div>

            {/* Stats Label */}

            <div className="mt-6 pt-6 border-t" style={{ borderColor: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)' }}>
              <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                {Math.round(stats.bestWpm)} <span className={`font-normal ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>WPM best</span>
              </p>
            </div>
          </div>
        </div>

        {/* Recent Scores */}
        <div className={`backdrop-blur-md border rounded-lg overflow-hidden ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200 shadow-sm'}`}>
          <div className={`p-6 border-b ${isDark ? 'border-slate-700/50' : 'border-gray-200'}`}>
            <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
              <TrophyIcon className="w-6 h-6 text-emerald-500" />
              Recent Scores
            </h3>
          </div>

          {scores.length === 0 ? (
            <div className="p-8 text-center">
              <p className={`mb-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No tests taken yet</p>
              <Link href="/">
                <button className={`px-6 py-2 rounded-lg transition font-medium ${isDark ? 'bg-emerald-600 hover:bg-emerald-700 text-slate-900' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}>
                  Take Your First Test
                </button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'bg-slate-700/30 border-slate-700/50' : 'bg-gray-50 border-gray-200'}`}>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Date</th>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>WPM</th>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Raw WPM</th>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.slice(0, 10).map((score, index) => (
                    <tr
                      key={index}
                      className={`border-b transition ${isDark ? 'border-slate-700/30 hover:bg-slate-700/20' : 'border-gray-100 hover:bg-gray-50'}`}
                    >
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                        {new Date(score.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-emerald-400">
                        {score.wpm}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                        {score.rawWpm}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            score.accuracy >= 95
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : score.accuracy >= 85
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {score.accuracy.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Typing Minutes Progress */}
        {userProgress && (
          <div className={`mt-8 backdrop-blur-md border rounded-lg p-6 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ClockIcon className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                <h3 className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
                   Your Typing Practice Time
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`rounded-lg p-4 ${isDark ? 'bg-slate-700/50' : 'bg-emerald-50'}`}>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-emerald-700'}`}>Total Minutes</p>
                <p className={`text-3xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {userProgress.totalMinutes}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-emerald-600'}`}>Last 30 days</p>
              </div>

              <div className={`rounded-lg p-4 ${isDark ? 'bg-slate-700/50' : 'bg-blue-50'}`}>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-blue-700'}`}>Average per Day</p>
                <p className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {userProgress.avgMinutesPerDay}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-blue-600'}`}>minutes</p>
              </div>

              <div className={`rounded-lg p-4 ${isDark ? 'bg-slate-700/50' : 'bg-purple-50'}`}>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-purple-700'}`}>Practice Sessions</p>
                <p className={`text-3xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                  {userProgress.sessionsCount}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-purple-600'}`}>total sessions</p>
              </div>
            </div>

            {/* Practice breakdown by source */}
            {Object.keys(userProgress.bySource).length > 0 && (
              <div>
                <p className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Practice by Source</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(userProgress.bySource).map(([source, minutes]) => (
                    <div key={source} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-slate-700/30' : 'bg-gray-100'}`}>
                      <span className={`capitalize text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        {source}
                      </span>
                      <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {minutes}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Teacher Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <div className={`mt-8 backdrop-blur-md border rounded-lg p-6 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200 shadow-sm'}`}>
            <div className="flex items-center gap-3 mb-6">
              <SparklesIcon className={`w-6 h-6 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
              <h3 className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
                ✨ Practice Suggestions from Your Teacher
              </h3>
            </div>

            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    suggestion.isCompleted
                      ? isDark ? 'bg-emerald-500/10 border-emerald-500' : 'bg-emerald-50 border-emerald-500'
                      : isDark ? 'bg-slate-700/30 border-amber-500' : 'bg-amber-50 border-amber-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className={`font-mono text-sm p-3 rounded flex-1 ${isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-gray-900'}`}>
                          {suggestion.sentence}
                        </p>
                        {suggestion.isCompleted && (
                          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                            ✓ Completed
                          </div>
                        )}
                      </div>
                      {suggestion.description && (
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                          💡 {suggestion.description}
                        </p>
                      )}
                      <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                        From {suggestion.teacher.name || suggestion.teacher.email}
                      </p>
                      {suggestion.isCompleted && suggestion.completion && (
                        <div className={`text-xs mt-2 p-2 rounded ${isDark ? 'bg-slate-800/50' : 'bg-white/50'}`}>
                          <p className={isDark ? 'text-emerald-400' : 'text-emerald-700'}>
                            WPM: {suggestion.completion.wpm} | Accuracy: {suggestion.completion.accuracy}%
                          </p>
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/typing-test?suggestionId=${suggestion.id}`}
                      className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ml-4 ${
                        suggestion.isCompleted
                          ? isDark
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          : isDark
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                      }`}
                    >
                      {suggestion.isCompleted ? 'Practice Again' : 'Practice Now'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Info Card */}
        <div className={`mt-8 backdrop-blur-md border rounded-lg p-6 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200 shadow-sm'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${isDark ? 'border-emerald-500' : 'border-emerald-400'}`}>
              {profileImage || userData?.image ? (
                <img src={profileImage || userData?.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-slate-900" />
                </div>
              )}
            </div>
            <div>
              <h4 className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{userData?.username || userData?.name || userData?.email}</h4>
              <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>{userData?.email}</p>
              {userData?.gender && (
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Gender: {userData.gender}</p>
              )}
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className={`ml-auto px-4 py-2 rounded-lg transition ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </main>
      </div>
    </div>
    </>
  );
}
