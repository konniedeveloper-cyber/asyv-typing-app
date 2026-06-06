"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ClockIcon,
  BoltIcon,
  ChartBarIcon,
  ArrowPathIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BarsArrowUpIcon,
  ArrowRightCircleIcon,
  LockClosedIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { MobileKeyboard } from '../components/MobileKeyboard';
import { KeyboardGuide } from '../components/KeyboardGuide';
import NavBar from '../components/Navbar';
import { trackTypingMinutes } from '@/lib/progress-tracker';

// Animation themes for typing area
const animationThemes = {
  wave: {
    name: "🌊 Wave",
    className: "animate-wave",
    description: "Flowing wave motion"
  },
  pulse: {
    name: "💓 Pulse",
    className: "animate-pulse-theme",
    description: "Gentle pulsing rhythm"
  },
  fade: {
    name: "✨ Fade",
    className: "animate-fade",
    description: "Subtle fading effect"
  }
};

// Progressive typing levels with sub-lessons and exercises
const typingLevels = [
  {
    id: 1,
    title: "Beginner",
    description: "Master the fundamentals of touch typing",
    color: "emerald",
    icon: "🌱",
    subLessons: [
      {
        id: 1,
        title: "A & S Keys",
        description: "Learn the A and S keys - your first steps",
        targetAccuracy: 90,
        exercises: [
          { text: "a a a a a a a a a a", instruction: "Press A repeatedly" },
          { text: "s s s s s s s s s s", instruction: "Press S repeatedly" },
          { text: "a s a s a s a s a s", instruction: "Alternate A and S" },
          { text: "as as as as as as as", instruction: "Type 'as' together" },
          { text: "a a s a s a a s s a", instruction: "Varied A and S pattern" },
          { text: "asa asa asa asa asa", instruction: "Type 'asa' pattern" }
        ]
      },
      {
        id: 2,
        title: "D & F Keys",
        description: "Add D and F to your typing foundation",
        targetAccuracy: 90,
        exercises: [
          { text: "d d d d d d d d d d", instruction: "Press D repeatedly" },
          { text: "f f f f f f f f f f", instruction: "Press F repeatedly" },
          { text: "a d a d a d a d a d", instruction: "Alternate A and D" },
          { text: "s f s f s f s f s f", instruction: "Alternate S and F" },
          { text: "ad sf ad sf ad sf ad", instruction: "Type 'ad sf' pattern" },
          { text: "das fas das fas das", instruction: "Combined pattern" },
          { text: "ads dfs ads dfs ads", instruction: "Alternating combinations" }
        ]
      },
      {
        id: 3,
        title: "J & K Keys",
        description: "Learn the J and K keys for right hand",
        targetAccuracy: 90,
        exercises: [
          { text: "j j j j j j j j j j", instruction: "Press J repeatedly" },
          { text: "k k k k k k k k k k", instruction: "Press K repeatedly" },
          { text: "j k j k j k j k j k", instruction: "Alternate J and K" },
          { text: "fj dk fj dk fj dk fj", instruction: "Type 'fj dk' pattern" },
          { text: "jka jkd jka jkd jka", instruction: "Combined pattern" },
          { text: "kj jk kj jk kj jk", instruction: "Quick alternation" }
        ]
      },
      {
        id: 4,
        title: "Home Row Mastery",
        description: "Complete the home row with L and ;",
        targetAccuracy: 90,
        exercises: [
          { text: "l l l l l l l l l l", instruction: "Press L repeatedly" },
          { text: "; ; ; ; ; ; ; ; ; ;", instruction: "Press ; repeatedly" },
          { text: "j l j l j l j l j l", instruction: "Alternate J and L" },
          { text: "k ; k ; k ; k ; k ;", instruction: "Alternate K and ;" },
          { text: "asks fall flask flasks", instruction: "Real word patterns" },
          { text: "asdf jkl; asdf jkl;", instruction: "Type full home row" }
        ]
      },
      {
        id: 5,
        title: "Home Row Practice",
        description: "Master the complete home row",
        targetAccuracy: 95,
        exercises: [
          { text: "asdf jkl; asdf jkl; asdf jkl;", instruction: "Practice home row" },
          { text: "a s d f j k l ; a s d f j k l ;", instruction: "Type all home row keys" },
          { text: "the quick brown fox jumps over the lazy dog", instruction: "Classic pangram" },
          { text: "flask dask asks alls falls", instruction: "Home row words" },
          { text: "said desk kale safe jade", instruction: "Word combination" },
          { text: "flash slash seals leeds", instruction: "Double letter words" }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Intermediate",
    description: "Expand your typing skills beyond the home row",
    color: "blue",
    icon: "🚀",
    subLessons: [
      {
        id: 6,
        title: "E & I Keys",
        description: "Add E and I to your typing vocabulary",
        targetAccuracy: 90,
        exercises: [
          { text: "e e e e e e e e e e", instruction: "Press E repeatedly" },
          { text: "i i i i i i i i i i", instruction: "Press I repeatedly" },
          { text: "d e d e d e d e d e", instruction: "Alternate D and E" },
          { text: "f i f i f i f i f i", instruction: "Alternate F and I" },
          { text: "ease idea fled inside", instruction: "Word combinations" },
          { text: "beside beside ideals", instruction: "More word practice" }
        ]
      },
      {
        id: 7,
        title: "R & U Keys",
        description: "Learn R and U keys for better reach",
        targetAccuracy: 90,
        exercises: [
          { text: "r r r r r r r r r r", instruction: "Press R repeatedly" },
          { text: "u u u u u u u u u u", instruction: "Press U repeatedly" },
          { text: "e r e r e r e r e r", instruction: "Alternate E and R" },
          { text: "i u i u i u i u i u", instruction: "Alternate I and U" },
          { text: "sure user rural rude", instruction: "Words with R and U" },
          { text: "pure truer ruer urer", instruction: "Advanced combinations" }
        ]
      },
      {
        id: 8,
        title: "T & Y Keys",
        description: "Complete the top row with T and Y",
        targetAccuracy: 90,
        exercises: [
          { text: "t t t t t t t t t t", instruction: "Press T repeatedly" },
          { text: "y y y y y y y y y y", instruction: "Press Y repeatedly" },
          { text: "r t r t r t r t r t", instruction: "Alternate R and T" },
          { text: "u y u y u y u y u y", instruction: "Alternate U and Y" },
          { text: "type try true treaty", instruction: "Words with T and Y" },
          { text: "turkey turkey yearly", instruction: "Advanced T and Y" }
        ]
      },
      {
        id: 9,
        title: "Top Row Practice",
        description: "Master all top row combinations",
        targetAccuracy: 92,
        exercises: [
          { text: "qwertyuiop qwertyuiop", instruction: "Type the top row" },
          { text: "the quick brown fox jumps", instruction: "Practice with phrases" },
          { text: "typewriter quality test", instruction: "Advanced top row practice" },
          { text: "poetry poetry poetry", instruction: "Repetitive word pattern" },
          { text: "equipment equipped equip", instruction: "Complex words" },
          { text: "proper property type we", instruction: "Mixed word practice" }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Advanced",
    description: "Achieve typing mastery with complex patterns",
    color: "purple",
    icon: "⭐",
    subLessons: [
      {
        id: 10,
        title: "Number Row",
        description: "Master the number row and symbols",
        targetAccuracy: 95,
        exercises: [
          { text: "1234567890 1234567890", instruction: "Type numbers 1-0" },
          { text: "!@#$%^&*() !@#$%^&*()", instruction: "Type symbols" },
          { text: "the price is $123.45", instruction: "Numbers in context" },
          { text: "2023 2024 2025 2026", instruction: "Year numbers" },
          { text: "123-456-7890 phone", instruction: "Phone number format" },
          { text: "email@website.com #tag", instruction: "Modern formats" }
        ]
      },
      {
        id: 11,
        title: "Full Keyboard",
        description: "Combine all skills for complete mastery",
        targetAccuracy: 95,
        exercises: [
          { text: "the quick brown fox jumps over the lazy dog", instruction: "Classic pangram" },
          { text: "sphinx of black quartz judge my vow", instruction: "Advanced pangram" },
          { text: "pack my box with five dozen liquor jugs", instruction: "Complex sentence" },
          { text: "how vexingly quick daft zebras jump", instruction: "Challenging pangram" },
          { text: "waltz bad nymph for quick jigs vex", instruction: "Complex word order" },
          { text: "jack quietly gave six dozen pewter mugs", instruction: "Another challenging text" }
        ]
      },
      {
        id: 12,
        title: "Speed Building",
        description: "Push your limits with longer texts",
        targetAccuracy: 90,
        exercises: [
          { text: "programming is the art of telling another human what one wants the computer to do", instruction: "Technical text" },
          { text: "the only way to do great work is to love what you do if you havent found it yet keep looking", instruction: "Motivational text" },
          { text: "success is not final failure is not fatal it is the courage to continue that counts", instruction: "Inspirational text" },
          { text: "whether you think you can or you think you cant youre right", instruction: "Henry Ford quote" },
          { text: "the future belongs to those who believe in the beauty of their dreams", instruction: "Eleanor Roosevelt quote" },
          { text: "life is what happens when youre busy making other plans", instruction: "Philosophy text" }
        ]
      }
    ]
  }
];

const StatPanel = ({ icon, value, label, unit = "", color, className = "", compact = false }) => (
  <div className={`
    ${compact ? 'p-2 rounded-lg' : 'p-6 rounded-xl'} bg-slate-800/90 text-slate-200
    transition-all duration-200 shadow-lg  
    ${className}
  `}>
    <div className={`flex items-center ${compact ? 'gap-2 mb-0.5' : 'gap-3 mb-1'}`}>
      <span className={`${compact ? 'w-4 h-4' : ''} ${color}`}>{icon}</span>
      <span className={compact ? 'text-lg' : 'text-3xl'}>
        {value}{unit}
      </span>
    </div>
    <div className={`text-slate-400 ${compact ? 'text-xs' : 'text-sm'}`}>{label}</div>
  </div>
);

const ActionButton = ({ children, onClick, icon, variant = "primary", className = "", disabled }) => {
  const baseStyles = "flex items-center gap-2 rounded-xl font-medium transition-all duration-200";
  const variants = {
    primary: `bg-emerald-500 text-slate-900 font-medium ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-600'}`,
    secondary: `bg-slate-700 text-slate-200 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-600'}`
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled}
    >
      {icon}
      {children}
    </button>
  );
};

// Sign In Required Component
const SignInRequired = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (!result?.ok) {
        setError(result?.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Small delay to ensure session is created
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/90 backdrop-blur-lg rounded-xl p-8 border border-slate-700/50 shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-emerald-500/10 rounded-full">
              <LockClosedIcon className="w-16 h-16 text-emerald-500" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-200 mb-2">
            Sign In Required
          </h2>
          
          <p className="text-slate-400 text-sm">
            Sign in to access typing lessons and track your progress!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-slate-200 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-slate-200 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg font-medium text-slate-900 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <ArrowRightCircleIcon className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          Don't have an account?{' '}
          <Link
            href="/auth/signup"
            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default function ProfessionalTypingLab() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [input, setInput] = useState("");
  const [sentence, setSentence] = useState("");
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'results'
  const [stats, setStats] = useState({
    wpm: 0,
    accuracy: 100,
    time: 30,
    initialTime: 30,
    backspaceErrors: 0
  });
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [selectedAnimation, setSelectedAnimation] = useState('simple');
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedLevels, setExpandedLevels] = useState(new Set([1])); // Beginner level starts expanded
  const [loadingProgress, setLoadingProgress] = useState(true);

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const timerStartedRef = useRef(false);
  const totalCharsTypedRef = useRef(0);
  const correctCharsRef = useRef(0);
  const hasSubmittedRef = useRef(false);

  const completionSoundRef = useRef(null);

  // Set mounted flag on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check authentication - NextAuth session or localStorage
  useEffect(() => {
    if (!isMounted) return;

    console.log('🔐 [STUDY] Auth check - status:', status, 'session:', !!session);
    
    // If NextAuth has a session, user is authenticated
    if (session) {
      console.log('✅ [STUDY] Authenticated via NextAuth');
      setIsAuthenticated(true);
      setAuthChecked(true);
      return;
    }

    // If NextAuth is still loading, try localStorage first as fallback
    if (status === 'loading') {
      console.log('⏳ [STUDY] NextAuth session loading, checking localStorage...');
      const authUser = localStorage.getItem('authUser');
      if (authUser) {
        try {
          const userData = JSON.parse(authUser);
          console.log('✅ [STUDY] Using localStorage while NextAuth loads:', userData.email);
          setIsAuthenticated(true);
          setAuthChecked(true);
          return;
        } catch (error) {
          console.log('❌ [STUDY] Invalid localStorage data');
        }
      }
      // Still wait for NextAuth to load
      return;
    }

    // NextAuth returned unauthenticated, check localStorage as fallback
    if (status === 'unauthenticated') {
      console.log('📦 [STUDY] NextAuth unauthenticated, checking localStorage...');
      const authUser = localStorage.getItem('authUser');
      if (authUser) {
        try {
          const userData = JSON.parse(authUser);
          console.log('✅ [STUDY] Authenticated via localStorage:', userData.email);
          setIsAuthenticated(true);
          setAuthChecked(true);
        } catch (error) {
          console.log('❌ [STUDY] Invalid localStorage data, redirecting to login');
          router.push('/auth/login');
        }
      } else {
        console.log('❌ [STUDY] Not authenticated, redirecting to login');
        router.push('/auth/login');
      }
    }
  }, [status, session, router, isMounted]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio();
      audio.src = 'https://www.soundjay.com/sounds/success-fanfare-trumpets-01.mp3';
      audio.crossOrigin = 'anonymous';
      audio.preload = 'auto';
      audio.volume = 0.7;
      completionSoundRef.current = audio;
    }
  }, []);

  // Load progress from database
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch('/api/lessons');
        if (response.ok) {
          const data = await response.json();
          setCompletedLessons(new Set(data.completedLessons));
        }
      } catch (error) {
        console.error('Error loading lesson progress:', error);
        // Fallback to localStorage if API fails
        if (typeof window !== 'undefined') {
          const savedProgress = localStorage.getItem('typing-lessons-progress');
          if (savedProgress) {
            setCompletedLessons(new Set(JSON.parse(savedProgress)));
          }
        }
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchProgress();
  }, []);

  const handleLessonSelect = (lesson) => {
    if (lesson.id > 1 && !completedLessons.has(lesson.id - 1)) {
      return; // Don't allow selecting locked lessons
    }
    
    // Prevent sidebar scrolling
    const sidebar = document.querySelector('[data-sidebar]');
    if (sidebar) {
      sidebar.scrollTop = 0;
    }
    
    setSelectedLesson(lesson);
    setCurrentExerciseIndex(0);
    setShowModal(true);
    setGameState('playing');
    startExercise(lesson, 0);
  };

  const startExercise = (lesson, exerciseIndex) => {
    const exercise = lesson.exercises[exerciseIndex];
    setSentence(exercise.text);
    setInput("");
    setStats({
      wpm: 0,
      accuracy: 100,
      time: 30,
      initialTime: 30
    });

    totalCharsTypedRef.current = 0;
    correctCharsRef.current = 0;
    hasSubmittedRef.current = false;
    timerStartedRef.current = false;
    startTimeRef.current = null;

    setGameState('playing');
    if (inputRef.current) inputRef.current.focus();
  };

  const checkLessonCompletion = (lesson, finalAccuracy) => {
    return finalAccuracy >= lesson.targetAccuracy;
  };

  const saveLessonCompletion = async (lessonId) => {
    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId })
      });

      if (!response.ok) {
        console.error('Failed to save lesson completion');
      }
    } catch (error) {
      console.error('Error saving lesson to database:', error);
    }
  };

  const tryAgain = () => {
    if (!selectedLesson) return;
    startExercise(selectedLesson, currentExerciseIndex);
  };

  const nextExercise = async () => {
    if (!selectedLesson) return;

    const nextIndex = currentExerciseIndex + 1;
    if (nextIndex < selectedLesson.exercises.length) {
      setCurrentExerciseIndex(nextIndex);
      startExercise(selectedLesson, nextIndex);
    } else {
      // Lesson completed
      setCompletedLessons(prev => new Set([...prev, selectedLesson.id]));
      saveLessonCompletion(selectedLesson.id);
      
      // Track lesson minutes
      const durationMinutes = Math.max(1, Math.round((Date.now() - startTimeRef.current) / (1000 * 60)));
      try {
        await trackTypingMinutes(durationMinutes, 'lesson', selectedLesson.id);
      } catch (error) {
        console.error('Error tracking lesson minutes:', error);
      }
      
      setGameState('lesson-complete');
      // Play completion sound
      setTimeout(() => {
        if (completionSoundRef.current) {
          try {
            completionSoundRef.current.currentTime = 0;
            const playPromise = completionSoundRef.current.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => console.log('✓ Completion sound played'))
                .catch(err => {
                  console.warn('Audio autoplay blocked by browser:', err);
                });
            }
          } catch (err) {
            console.error('Error playing sound:', err);
          }
        }
      }, 300);
    }
  };

  const startGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    totalCharsTypedRef.current = 0;
    correctCharsRef.current = 0;
    hasSubmittedRef.current = false;
    timerStartedRef.current = false;
    startTimeRef.current = null;

    setInput("");
    setGameState("playing");
    setStats({
      wpm: 0,
      accuracy: 100,
      time: stats.initialTime,
      initialTime: stats.initialTime
    });

    if (inputRef.current) inputRef.current.focus();
  }, [stats.initialTime]);



  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  const endGame = useCallback(async () => {
    if (hasSubmittedRef.current) return;

    hasSubmittedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    // Beep sound removed - completion sound plays at lesson end instead

    const timeElapsed = (Date.now() - startTimeRef.current) / 1000;
    const finalWpm = Math.round((correctCharsRef.current / 5) / (timeElapsed / 60));
    const finalAccuracy = totalCharsTypedRef.current > 0
      ? Math.round((correctCharsRef.current / totalCharsTypedRef.current) * 100)
      : 100;

    setStats(prev => ({
      ...prev,
      wpm: finalWpm,
      accuracy: finalAccuracy,
      time: 0
    }));

    // Check if lesson is completed (all exercises done)
    if (selectedLesson && currentExerciseIndex >= selectedLesson.exercises.length - 1) {
      setCompletedLessons(prev => new Set([...prev, selectedLesson.id]));
      saveLessonCompletion(selectedLesson.id);
    }

    setGameState("results");
  }, [selectedLesson]);

  const startTimer = useCallback(() => {
    if (!timerStartedRef.current) {
      timerStartedRef.current = true;
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        setStats((prev) => {
          const newTime = prev.time - 1;
          if (newTime <= 0) {
            clearInterval(timerRef.current);
            endGame();
            return { ...prev, time: 0 };
          }
          return { ...prev, time: newTime };
        });
      }, 1000);
    }
  }, [endGame]);

  const processInput = useCallback((newInput) => {
    if (gameState !== "playing") return;

    if (!timerStartedRef.current && newInput.length > 0) {
      startTimer();
    }

    const addedChars = newInput.length - input.length;
    let backspaceErrors = stats.backspaceErrors;

    if (addedChars > 0) {
      totalCharsTypedRef.current += addedChars;
      for (let i = input.length; i < newInput.length; i++) {
        if (newInput[i] === sentence[i]) {
          correctCharsRef.current++;
        }
      }
    } else if (addedChars < 0) {
      // Track backspace errors - if user backspaces a correct character
      for (let i = newInput.length; i < input.length; i++) {
        if (input[i] === sentence[i]) {
          correctCharsRef.current--;
          backspaceErrors++;
        }
      }
    }

    setInput(newInput);

    const timeElapsed = timerStartedRef.current
      ? (Date.now() - startTimeRef.current) / 1000
      : 0;

    const netWpm = Math.round(
      timeElapsed > 0 ? (correctCharsRef.current / 5 / (timeElapsed / 60)) : 0
    );

    const accuracy = totalCharsTypedRef.current > 0
      ? Math.round((correctCharsRef.current / totalCharsTypedRef.current) * 100)
      : 100;

    setStats(prev => ({
      ...prev,
      wpm: netWpm,
      accuracy,
      backspaceErrors
    }));

    if (newInput.length >= sentence.length && !hasSubmittedRef.current) {
      endGame();
    }
  }, [sentence, endGame, startTimer, input.length, gameState, stats.backspaceErrors]);

  const handlePhysicalInput = useCallback((e) => {
    if (gameState !== "playing" || stats.time <= 0) return;
    processInput(e.target.value);
  }, [gameState, processInput, stats.time]);

  const handleVirtualInput = useCallback((key) => {
    if (gameState !== "playing" || stats.time <= 0) return;
    const newInput = key === "⌫" ? input.slice(0, -1) : input + key;
    processInput(newInput);
  }, [gameState, processInput, input, stats.time]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);



  // Show loading while checking authentication
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="text-slate-400 mt-4">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show sign-in page if not authenticated
  if (!isAuthenticated) {
    return <SignInRequired />;
  }

  const progressPercentage = (stats.time / stats.initialTime) * 100;
  const handleStartNewTest = () => {
    router.push('/');
  };

  // New Accordion-style lessons menu in main area
  const LessonsMenu = () => (
    <div className={`max-w-6xl mx-auto ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white'} rounded-xl shadow-lg border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} overflow-hidden`}>
      <div className={`p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
          📚 Typing Mastery Journey
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
          Click on a lesson to start your training
        </p>
      </div>

      <div className="divide-y divide-slate-700">
        {typingLevels.map((level) => {
          const isLevelLocked = level.id > 1 && !completedLessons.has((level.id - 1) * 5);
          const isExpanded = expandedLevels.has(level.id);
          const completedInLevel = level.subLessons.filter(lesson => completedLessons.has(lesson.id)).length;
          const totalInLevel = level.subLessons.length;

          return (
            <div key={level.id} className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
              {/* Level Header */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  !isLevelLocked && setExpandedLevels(prev =>
                    prev.has(level.id)
                      ? new Set([...prev].filter(id => id !== level.id))
                      : new Set([...prev, level.id])
                  );
                }}
                className={`w-full p-4 flex items-center justify-between hover:transition-colors ${
                  isLevelLocked
                    ? 'opacity-60 cursor-not-allowed'
                    : `${theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'} cursor-pointer`
                }`}
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  <span className="text-3xl">{level.icon}</span>
                  <div>
                    <h3 className={`font-semibold ${isLevelLocked ? 'text-slate-500' : theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                      {level.title}
                    </h3>
                    <p className={`text-sm ${isLevelLocked ? 'text-slate-500' : theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      {level.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    level.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    level.color === 'blue' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  }`}>
                    {completedInLevel}/{totalInLevel}
                  </span>

                  {isLevelLocked ? (
                    <LockClosedIcon className="w-5 h-5 text-slate-500" />
                  ) : (
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''} ${
                        level.color === 'emerald' ? 'text-emerald-500' :
                        level.color === 'blue' ? 'text-blue-500' : 'text-purple-500'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </button>

              {/* Lessons Grid */}
              {isExpanded && !isLevelLocked && (
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 border-t ${theme === 'dark' ? 'border-slate-700 bg-slate-800/30' : 'border-slate-100 bg-gray-50'}`}>
                  {level.subLessons.map((lesson) => {
                    const isLessonLocked = lesson.id > 1 && !completedLessons.has(lesson.id - 1);
                    const isCompleted = completedLessons.has(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          !isLessonLocked && handleLessonSelect(lesson);
                        }}
                        disabled={isLessonLocked}
                        className={`p-4 rounded-lg text-left transition-all duration-200 border ${
                          isLessonLocked
                            ? `${theme === 'dark' ? 'bg-slate-700/20 border-slate-600/30' : 'bg-gray-100/30 border-gray-300'} opacity-60 cursor-not-allowed`
                            : isCompleted
                            ? `${theme === 'dark' ? 'bg-emerald-500/20 border-emerald-500 shadow-lg' : 'bg-emerald-50 border-emerald-400'}`
                            : `${theme === 'dark' ? 'bg-slate-700/30 hover:bg-slate-700/50 border-slate-600/50' : 'bg-white hover:bg-slate-50 border-slate-200'}`
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`font-medium ${
                              isLessonLocked ? 'text-slate-500' :
                              isCompleted ? 'text-emerald-400' :
                              theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                            }`}>
                              {lesson.title}
                            </h4>
                            <p className={`text-xs mt-1 ${
                              isLessonLocked ? 'text-slate-500' :
                              isCompleted ? 'text-emerald-400/70' :
                              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                            }`}>
                              {lesson.description}
                            </p>
                            <div className={`text-xs mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                              Target: {lesson.targetAccuracy}% accuracy
                            </div>
                          </div>

                          {isCompleted && (
                            <div className="ml-2 flex-shrink-0">
                              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}

                          {isLessonLocked && (
                            <div className="ml-2 flex-shrink-0">
                              <LockClosedIcon className="w-5 h-5 text-slate-500" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen overflow-x-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Welcome Message */}
        {gameState === 'menu' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} mb-4`}>
                Welcome to Typing Mastery
              </h1>
              <p className={`text-xl ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mb-2`}>
                Your journey to becoming a typing expert starts here
              </p>
              <p className={`text-lg ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                Browse lessons below and select one to start training
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 justify-center mb-8 flex-wrap">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
              >
                <HomeIcon className="w-5 h-5" />
                Home
              </button>
              <button
                onClick={handleStartNewTest}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-emerald-50 font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Take Test
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} mb-2`}>
                    {completedLessons.size}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Lessons Completed
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} mb-2`}>
                    {Math.max(0, 12 - completedLessons.size)}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Lessons Remaining
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} mb-2`}>
                    {completedLessons.size > 0 ? Math.round((completedLessons.size / 12) * 100) : 0}%
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Progress
                  </div>
                </div>
              </div>
            </div>

            {/* Lessons Menu */}
            <LessonsMenu />

            {/* Motivational Message */}
            <div className={`p-8 rounded-xl ${theme === 'dark' ? 'bg-gradient-to-r from-emerald-500/10 to-blue-500/10' : 'bg-gradient-to-r from-emerald-50 to-blue-50'} border ${theme === 'dark' ? 'border-emerald-500/20' : 'border-emerald-200'}`}>
              <div className="text-center">
                <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} mb-4`}>
                  � Pro Tips
                </h3>
                <p className={`text-lg ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} mb-6`}>
                  Expand each level to see available lessons. Complete lessons sequentially by reaching the target accuracy.
                  Each level builds on the previous one, ensuring steady progress and mastery.
                </p>
                <div className="flex justify-center">
                  <div className={`px-6 py-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      ✨ Tip: Click on a level to expand it, then select a lesson to start training
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Typing Exercise Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-1 z-50">
            <div className={`relative w-full max-w-[92vw] h-[98vh] ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl overflow-hidden flex flex-col`}>
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 flex-shrink-0">
                <div>
                  <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                    {selectedLesson?.title}
                  </h2>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowModal(false);
                    setGameState('menu');
                  }}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="px-6 py-4 overflow-hidden flex-1 flex flex-col">
                {gameState === 'playing' && (
                  <div className="space-y-3 h-full flex flex-col">
                    {/* Typing Area - Sentence at top */}
                    <div className={`
                      relative text-2xl leading-relaxed
                      p-4 ${theme === 'dark' ? 'bg-slate-900/80' : 'bg-gray-50'} backdrop-blur-lg rounded-lg
                      border ${theme === 'dark' ? 'border-slate-700/30' : 'border-gray-200'}
                      shadow-lg flex-shrink-0 flex items-center justify-center
                    `}>
                      <div className="text-center">
                        {sentence.split("").map((char, index) => {
                          const inputChar = input[index];
                          const isActive = index === input.length && stats.time > 0;
                          
                          return (
                            <span
                              key={index}
                              className="relative inline-block align-middle"
                            >
                              {char === ' ' ? (
                                <span
                                  className={`inline-flex items-center justify-center w-7 h-7 align-middle mx-0 ${
                                    index < input.length
                                      ? inputChar === ' '
                                        ? 'bg-emerald-500/30 border border-emerald-400 rounded'
                                        : 'bg-red-500/30 border border-red-400 rounded'
                                      : isActive
                                      ? 'bg-emerald-500/30 border-b-2 border-emerald-400 rounded'
                                      : `${theme === 'dark' ? 'bg-slate-700/40' : 'bg-gray-300/40'} rounded`
                                  }`}
                                  title="Space"
                                >
                                </span>
                              ) : (
                                <span
                                  className={`
                                    relative text-4xl mx-0.5
                                    ${isActive ? `${theme === 'dark' ? 'text-emerald-500' : 'text-emerald-600'} border-b-2 border-emerald-500` : ""}
                                    ${inputChar !== undefined
                                      ? inputChar === char
                                        ? `${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`
                                        : "text-red-500"
                                      : theme === 'dark' ? "text-slate-500" : "text-slate-400"
                                    }
                                    ${isActive ? "animate-pulse" : ""}
                                    transition-colors duration-150
                                  `}
                                >
                                  {char}
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={handlePhysicalInput}
                        className="absolute inset-0 opacity-0 cursor-text"
                        disabled={stats.time <= 0}
                        autoFocus
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                      />
                    </div>

                    {/* Exercise Instruction */}
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'} border ${theme === 'dark' ? 'border-slate-600' : 'border-gray-200'} flex-shrink-0`}>
                      <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                        {selectedLesson?.exercises[currentExerciseIndex]?.instruction}
                      </p>
                    </div>

                    {/* Keyboard Guide - Shows finger placement and focus keys */}
                    <KeyboardGuide
                      lessonKeys={selectedLesson?.subLessons?.flatMap(l => 
                        l.exercises?.flatMap(e => 
                          Array.from(new Set(e.text.toLowerCase().split('').filter(c => /[a-z;]/.test(c))))
                        ) || []
                      ) || []}
                      currentInput={input}
                      sentence={sentence}
                      theme={theme}
                      instruction={selectedLesson?.exercises[currentExerciseIndex]?.instruction}
                      highlightMode="lesson"
                      compact={true}
                    />

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-700/50 rounded-full h-2 flex-shrink-0">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${(input.length / sentence.length) * 100}%` }}
                      />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                      <StatPanel
                        value={stats.wpm}
                        label="Words Per Minute"
                        icon={<BoltIcon className="w-4 h-4" />}
                        color="text-emerald-500"
                        compact={true}
                      />
                      <StatPanel
                        value={stats.accuracy}
                        label="Accuracy"
                        icon={<ChartBarIcon className="w-4 h-4" />}
                        color="text-emerald-500"
                        unit="%"
                        compact={true}
                      />
                    </div>

                    {/* Show timer when there are backspace errors */}
                    {stats.backspaceErrors > 0 && (
                      <div className="flex justify-center">
                        <StatPanel
                          value={stats.time}
                          label="Time Remaining"
                          icon={<ClockIcon className="w-6 h-6" />}
                          color="text-rose-500"
                          unit="s"
                          className="bg-rose-500/10 border-rose-500/30"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Exercise Results */}
                {gameState === 'results' && (
                  <div className="text-center space-y-6">
                    <div className={`p-8 rounded-xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <div className="flex justify-center mb-4">
                        {stats.accuracy >= selectedLesson?.targetAccuracy ? (
                          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
                            <ArrowPathIcon className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>

                      <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} mb-2`}>
                        {stats.accuracy >= selectedLesson?.targetAccuracy ? 'Exercise Completed!' : 'Try Again'}
                      </h3>

                      <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mb-6`}>
                        {stats.accuracy >= selectedLesson?.targetAccuracy
                          ? `Great job! You achieved ${stats.accuracy}% accuracy.`
                          : `You need ${selectedLesson?.targetAccuracy}% accuracy. You got ${stats.accuracy}%.`
                        }
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-6 max-w-xs mx-auto">
                        <StatPanel
                          value={stats.wpm}
                          label="WPM"
                          icon={<BoltIcon className="w-5 h-5" />}
                          color="text-emerald-500"
                        />
                        <StatPanel
                          value={stats.accuracy}
                          label="Accuracy"
                          icon={<ChartBarIcon className="w-5 h-5" />}
                          color="text-emerald-500"
                          unit="%"
                        />
                      </div>

                      <div className="flex gap-4 justify-center flex-wrap">
                        {stats.accuracy < selectedLesson?.targetAccuracy && (
                          <ActionButton
                            onClick={(e) => {
                              e.preventDefault();
                              tryAgain();
                            }}
                            icon={<ArrowPathIcon className="w-5 h-5" />}
                            variant="secondary"
                          >
                            Try Again
                          </ActionButton>
                        )}
                        <ActionButton
                          onClick={(e) => {
                            e.preventDefault();
                            nextExercise();
                          }}
                          icon={<ArrowRightCircleIcon className="w-5 h-5" />}
                          variant="primary"
                        >
                          Next Exercise
                        </ActionButton>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lesson Complete */}
                {gameState === 'lesson-complete' && (
                  <div className="text-center space-y-6">
                    <div className={`p-8 rounded-xl ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>

                      <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} mb-2`}>
                        Lesson Completed! 🎉
                      </h3>

                      <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mb-6`}>
                        Congratulations! You've mastered "{selectedLesson?.title}".
                        {selectedLesson?.id < 12 && " The next lesson is now unlocked!"}
                      </p>

                      <div className="flex gap-4 justify-center">
                        <ActionButton
                          onClick={(e) => {
                            e.preventDefault();
                            setShowModal(false);
                            setGameState('menu');
                          }}
                          icon={<HomeIcon className="w-5 h-5" />}
                          variant="primary"
                        >
                          Back to Lessons
                        </ActionButton>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}