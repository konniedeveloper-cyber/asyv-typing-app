"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  ClockIcon,
  BoltIcon,
  ChartBarIcon,
  ArrowPathIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { sentences } from "../constants/sentences";
import { MobileKeyboard } from './MobileKeyboard';
import NavBar from './Navbar';
import { useTheme } from '../context/ThemeContext';
import TypingResultsModal from './TypingResultsModal';
import { trackTypingMinutes } from '@/lib/progress-tracker';

// Animation themes for typing area
const animationThemes = {};

const StatPanel = ({ icon, value, label, unit = "", color, className = "", theme = "dark" }) => (
  <div className={`
    p-6 rounded-xl transition-all duration-200 shadow-lg
    ${theme === 'dark' ? 'bg-[#2d2d30]/90 text-[#d4d4d4]' : 'bg-slate-100 text-slate-900'}
    ${className}
  `}>
    <div className="flex items-center gap-3 mb-1">
      <span className={`${color}`}>{icon}</span>
      <span className="text-3xl">
        {value}{unit}
      </span>
    </div>
    <div className={theme === 'dark' ? 'text-[#b0b0b0]' : 'text-slate-600'}>
      {label}
    </div>
  </div>
);

const ActionButton = ({ children, onClick, icon, variant = "primary", className = "", disabled }) => {
  const baseStyles = "flex items-center gap-2 rounded-xl font-medium transition-all duration-200";
  const variants = {
    primary: `bg-emerald-500 text-slate-900 font-medium ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-600'}`,
    secondary: `bg-[#3e3e42] text-[#d4d4d4] ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#4a4a50]'}`
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

const AuthLoadingModal = ({ isVisible, provider }) => {
  if (!isVisible) return null;

  const getProviderInfo = () => {
    if (provider === 'google') {
      return {
        name: 'Google',
        icon: (
          <svg className="w-12 h-12" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        ),
      };
    }
    return {
      name: 'GitHub',
      icon: (
        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
    };
  };

  const providerInfo = getProviderInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative bg-[#2d2d30] rounded-2xl p-8 max-w-md w-full mx-4 border border-[#3e3e42] shadow-2xl">
        <div className="relative z-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              {providerInfo.icon}
              <div className="absolute inset-0 -m-3">
                <div className="w-20 h-20 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#d4d4d4] mb-2">
            Signing in with {providerInfo.name}
          </h2>
          <p className="text-[#b0b0b0] mb-6">
            Please wait while we authenticate you
          </p>
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProfessionalTypingLab({ suggestionId }) {
  const { theme } = useTheme();
  const { data: session, status } = useSession();
  const [input, setInput] = useState("");
  const [sentence, setSentence] = useState("");
  const [gameState, setGameState] = useState('loading');
  const [stats, setStats] = useState({
    wpm: 0,
    accuracy: 100,
    time: 30,
    initialTime: 30
  });
  const [isMobile, setIsMobile] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authProvider, setAuthProvider] = useState(null);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isFocused, setIsFocused] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [suggestionData, setSuggestionData] = useState(null);

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const timerStartedRef = useRef(false);
  const totalCharsTypedRef = useRef(0);
  const correctCharsRef = useRef(0);
  const hasSubmittedRef = useRef(false);
  const audioRef = useRef(null);
  const isFocusedRef = useRef(true);
  const wpmHistoryRef = useRef([]);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/beep-01a.mp3');
    }
  }, []);

  // Load suggestion data if suggestionId is provided
  useEffect(() => {
    if (!suggestionId) return;

    const loadSuggestion = async () => {
      try {
        const response = await fetch(`/api/teacher/suggestions/${suggestionId}`);
        if (!response.ok) {
          console.error('Failed to load suggestion');
          return;
        }
        
        const data = await response.json();
        if (data.data) {
          console.log('✅ [TYPING TEST] Loaded suggestion:', data.data.sentence);
          setSuggestionData(data.data);
        }
      } catch (error) {
        console.error('Error loading suggestion:', error);
      }
    };

    loadSuggestion();
  }, [suggestionId]);

  // Check authentication - NextAuth session or localStorage
  useEffect(() => {
    if (!isMounted) return;

    console.log('🔐 [TYPING TEST] Auth check - session status:', status, 'session:', !!session);
    
    // If NextAuth has a session, user is authenticated
    if (session) {
      console.log('✅ [TYPING TEST] Authenticated via NextAuth:', session.user?.email);
      // Also store in localStorage for consistency
      const authUser = {
        id: session.user?.id,
        email: session.user?.email,
        username: session.user?.username || session.user?.name,
        role: session.user?.role || 'student',
        image: session.user?.image,
      };
      localStorage.setItem('authUser', JSON.stringify(authUser));
      setIsAuthenticated(true);
      return;
    }

    // If NextAuth is still loading, wait
    if (status === 'loading') {
      console.log('⏳ [TYPING TEST] NextAuth session loading...');
      return;
    }

    // NextAuth returned null/unauthenticated, check localStorage as fallback
    if (status === 'unauthenticated') {
      console.log('📦 [TYPING TEST] NextAuth unauthenticated, checking localStorage...');
      const authUser = localStorage.getItem('authUser');
      if (authUser) {
        try {
          const userData = JSON.parse(authUser);
          console.log('✅ [TYPING TEST] Authenticated via localStorage:', userData.email);
          setIsAuthenticated(true);
          // Also set userData if not already set
          if (!userData) {
            setUserData(userData);
          }
        } catch (error) {
          console.log('❌ [TYPING TEST] Invalid localStorage data');
          setIsAuthenticated(false);
        }
      } else {
        console.log('❌ [TYPING TEST] Not authenticated');
        setIsAuthenticated(false);
      }
    }
  }, [session, status, isMounted]);

  // Fetch user data from API if authenticated via NextAuth, or use localStorage data
  useEffect(() => {
    const fetchUserData = async () => {
      // If authenticated via localStorage and no userData yet
      if (isAuthenticated && !userData) {
        const authUser = localStorage.getItem('authUser');
        if (authUser) {
          try {
            const localUserData = JSON.parse(authUser);
            console.log('📦 [TYPING TEST] Using localStorage user data:', localUserData.email);
            setUserData(localUserData);
          } catch (error) {
            console.error('Error parsing localStorage:', error);
          }
        }
      }

      // If authenticated via NextAuth session, fetch full user data from API
      if (session && !userData) {
        try {
          console.log('📡 [TYPING TEST] Fetching user data from API');
          const userRes = await fetch('/api/user');
          const userResponse = await userRes.json();
          if (userResponse.data) {
            console.log('✅ [TYPING TEST] Got user data from API:', userResponse.data.email);
            setUserData(userResponse.data);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated, session, userData]);

  useEffect(() => {
    setGameState('playing');
  }, []);

  const generateSentence = useCallback(() => {
    // If we have a suggestion, use that sentence
    if (suggestionData?.sentence) {
      return suggestionData.sentence;
    }
    
    // Otherwise generate a random sentence
    const crypto = window.crypto || window.msCrypto;
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return sentences[values[0] % sentences.length];
  }, [suggestionData]);

  const startGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    totalCharsTypedRef.current = 0;
    correctCharsRef.current = 0;
    hasSubmittedRef.current = false;
    timerStartedRef.current = false;
    startTimeRef.current = null;
    wpmHistoryRef.current = [];

    const newSentence = generateSentence();
    setSentence(newSentence);
    setInput("");
    setGameState("playing");
    setIsFocused(true);
    setStats({
      wpm: 0,
      accuracy: 100,
      time: stats.initialTime,
      initialTime: stats.initialTime
    });
    setShowSignInPrompt(false);

    if (inputRef.current) inputRef.current.focus();
  }, [generateSentence, stats.initialTime]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'playing' || gameState === 'results') {
          startGame();
        }
      }
      // Refocus if not focused and a key is pressed during playing
      if (!isFocusedRef.current && gameState === 'playing') {
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, startGame]);

  useEffect(() => {
    if (gameState === 'playing' && !sentence) {
      setSentence(generateSentence());
    }
  }, [gameState, generateSentence, sentence]);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const saveScore = useCallback(async (finalWpm, finalAccuracy) => {
    console.log('saveScore called - isAuthenticated:', isAuthenticated, 'userData:', !!userData);

    if (!isAuthenticated || !userData) {
      console.log('No authentication, showing sign in prompt');
      setShowSignInPrompt(true);
      return;
    }

    console.log('Saving score with userData:', userData);
    console.log('userId being used:', userData.id);
    console.log('userData.id type:', typeof userData.id);

    try {
      const payload = {
        name: userData.username || userData.name || userData.email,
        wpm: finalWpm,
        accuracy: finalAccuracy,
        rawWpm: finalWpm,
        userId: userData.id,
      };

      console.log('Sending payload:', payload);

      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        console.error('Response not ok, throwing error');
        throw new Error(responseData.error || 'Score submission failed');
      }

      console.log('Score saved successfully');
      setSubmitError('');
    } catch (error) {
      console.error('Save score error:', error);
      setSubmitError(error.message);
    }
  }, [isAuthenticated, userData]);

  const endGame = useCallback(async () => {
    if (hasSubmittedRef.current) return;
    
    hasSubmittedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    
    audioRef.current?.play();
    
    const timeElapsed = (Date.now() - startTimeRef.current) / 1000;
    const finalWpm = Math.round((correctCharsRef.current / 5) / (timeElapsed / 60));
    const finalAccuracy = totalCharsTypedRef.current > 0
      ? Math.round((correctCharsRef.current / totalCharsTypedRef.current) * 100)
      : 100;

    setStats(prev => ({
      ...prev,
      wpm: finalWpm,
      accuracy: finalAccuracy,
      time: 0,
      wpmHistory: wpmHistoryRef.current,
      testType: 'time 30',
      language: 'english',
      characters: totalCharsTypedRef.current,
      rawWpm: finalWpm,
    }));

    // Save score if user is authenticated
    await saveScore(finalWpm, finalAccuracy);

    // Record suggestion completion if a suggestion was used
    if (suggestionId && isAuthenticated) {
      try {
        const response = await fetch('/api/teacher/suggestions/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            suggestionId,
            wpm: finalWpm,
            accuracy: finalAccuracy
          })
        });

        if (!response.ok) {
          console.error('Failed to record suggestion completion');
        } else {
          console.log('✅ [TYPING TEST] Suggestion completion recorded');
        }
      } catch (error) {
        console.error('Error recording suggestion completion:', error);
      }
    }

    // Track typing minutes
    const durationMinutes = Math.max(1, Math.round((Date.now() - startTimeRef.current) / (1000 * 60)));
    try {
      await trackTypingMinutes(durationMinutes, 'test');
    } catch (error) {
      console.error('Error tracking typing minutes:', error);
    }

    setGameState("results");
  }, [saveScore, suggestionId, isAuthenticated]);

  const startTimer = useCallback(() => {
    if (!timerStartedRef.current) {
      timerStartedRef.current = true;
      startTimeRef.current = Date.now();
      wpmHistoryRef.current = [0]; // Start with 0 WPM

      timerRef.current = setInterval(() => {
        setStats((prev) => {
          const newTime = prev.time - 1;
          
          // Calculate WPM at this second
          const timeElapsed = (Date.now() - startTimeRef.current) / 1000;
          const currentWpm = Math.round((correctCharsRef.current / 5) / (timeElapsed / 60));
          wpmHistoryRef.current.push(currentWpm);
          
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
    if (gameState !== "playing" || stats.time <= 0) return;

    if (!timerStartedRef.current && newInput.length > 0) {
      startTimer();
    }

    const addedChars = newInput.length - input.length;
    if (addedChars > 0) {
      totalCharsTypedRef.current += addedChars;
      for (let i = input.length; i < newInput.length; i++) {
        if (newInput[i] === sentence[i]) {
          correctCharsRef.current++;
        }
      }
    } else if (addedChars < 0) {
      for (let i = newInput.length; i < input.length; i++) {
        if (input[i] === sentence[i]) {
          correctCharsRef.current--;
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
      accuracy
    }));

    if (newInput.length >= sentence.length && !hasSubmittedRef.current) {
      endGame();
    }
    
  }, [sentence, endGame, startTimer, input.length, gameState, stats.time]);

  const handleInputKeyDown = useCallback((e) => {
    // Prevent page scrolling when space is pressed, but allow the character to be typed
    if (e.key === ' ' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      // Manually add space to input
      processInput(input + ' ');
    }
    // Allow backspace to work properly
    if (e.key === 'Backspace') {
      e.preventDefault();
      processInput(input.slice(0, -1));
    }
  }, [input, processInput]);

  const handlePhysicalInput = useCallback((e) => {
    if (gameState !== "playing" || stats.time <= 0) return;
    processInput(e.target.value);
  }, [gameState, processInput, stats.time]);

  const handleVirtualInput = useCallback((key) => {
    if (gameState !== "playing" || stats.time <= 0) return;
    const newInput = key === "⌫" ? input.slice(0, -1) : input + key;
    processInput(newInput);
  }, [gameState, processInput, input, stats.time]);

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
    isFocusedRef.current = true;
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);
    isFocusedRef.current = false;
  }, []);

  const handleTypingAreaClick = useCallback(() => {
    if (gameState === 'playing' && !isFocused) {
      inputRef.current?.focus();
    }
  }, [gameState, isFocused]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const progressPercentage = (stats.time / stats.initialTime) * 100;

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen bg-white dark:bg-[#1e1e1e] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="text-slate-600 dark:text-[#b0b0b0] mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-gray-50'} transition-colors duration-300`}>
      <AuthLoadingModal isVisible={isAuthLoading} provider={authProvider} />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* User Info Bar */}
        {(session || userData) && (
          <div className="flex justify-end items-center gap-4 mb-6">
            <div className={`flex items-center gap-3 ${theme === 'dark' ? 'bg-[#2d2d30]/90' : 'bg-slate-200'} px-4 py-2 rounded-lg`}>
              {(userData?.image || session?.user?.image) && (
                <img
                  src={userData?.image || session?.user?.image}
                  alt={userData?.username || session?.user?.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <span className={theme === 'dark' ? 'text-[#d4d4d4]' : 'text-slate-800'}>{userData?.username || session?.user?.name || session?.user?.email || userData?.email}</span>
            </div>
          </div>
        )}

        {/* Sign In Prompt for Non-Authenticated Users */}
        {!isAuthenticated && (
          <div className={`mb-4 ${theme === 'dark' ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'} border rounded px-3 py-2 text-sm`}>
            <div className="flex items-center gap-2">
              <UserPlusIcon className={`w-4 h-4 flex-shrink-0 ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'}`} />
              <p className={`${theme === 'dark' ? 'text-[#d4d4d4]' : 'text-slate-700'}`}>Sign in to save your scores</p>
            </div>
          </div>
        )}

        {gameState === "playing" && (
          <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            {suggestionData && (
              <div className={`p-3 rounded-lg border-l-4 ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500' : 'bg-blue-50 border-blue-500'}`}>
                <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
                  📝 Practicing Suggested Sentence
                </p>
                {suggestionData.description && (
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
                    {suggestionData.description}
                  </p>
                )}
              </div>
            )}
            <div className="flex justify-between items-center mb-2">
              <span className={`text-xs ${theme === 'dark' ? 'text-[#b0b0b0]' : 'text-slate-500'}`}>Space bar types spaces</span>
              <button
                onClick={startGame}
                className={`flex items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'bg-[#3e3e42] hover:bg-[#4a4a50] text-[#d4d4d4]' : 'bg-slate-300 hover:bg-slate-400 text-slate-800'} rounded-lg text-sm transition-all`}
                title="Restart (Ctrl+Space)"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Restart
                <span className={`ml-1 px-2 py-0.5 ${theme === 'dark' ? 'bg-[#4a4a50]' : 'bg-slate-400'} rounded text-xs`}>Ctrl+Space</span>
              </button>
            </div>

            <div className={`w-full ${theme === 'dark' ? 'bg-[#3e3e42]' : 'bg-slate-300/50'} rounded-full h-2.5 mb-4`}>
              <div 
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className={`
              relative text-2xl md:text-3xl lg:text-4xl leading-relaxed
              p-6 md:p-8 lg:p-10 ${theme === 'dark' ? 'bg-[#2d2d30]/80 border-[#3e3e42]/30' : 'bg-white border-slate-300'} backdrop-blur-lg rounded-xl
              transition-all duration-300 border
              shadow-lg ${stats.time <= 0 ? 'opacity-75' : ''}
              ${isMobile ? "h-[40vh] overflow-y-auto mt-14" : "min-h-[35vh]"}
              ${!isFocused ? 'cursor-text' : ''}
            `}
              onClick={handleTypingAreaClick}
            >
              <div className={`relative mt-6 font-mono text-3xl leading-relaxed ${!isFocused ? 'blur-sm opacity-50' : ''}`}>
                {sentence.split("").map((char, index) => {
                  const inputChar = input[index];
                  const isActive = index === input.length && stats.time > 0;
                  return (
                    <span
                      key={index}
                      className={`
                        relative inline-block align-middle ${
                          isActive
                            ? 'bg-emerald-500/30'
                            : ''
                        }
                      `}
                    >
                      {char === ' ' ? (
                        <span className={`inline-flex items-center justify-center w-5 h-5 align-middle mx-0.5 ${
                          isActive
                            ? 'bg-emerald-500/30 border border-emerald-400 rounded'
                            : inputChar !== undefined
                            ? inputChar === ' '
                              ? 'bg-emerald-500/30 border border-emerald-400 rounded'
                              : 'bg-red-500/30 border border-red-400 rounded'
                            : 'bg-[#3e3e42]/40 rounded'
                        }`} title="Space"></span>
                      ) : (
                        <span
                          className={`
                            relative
                            ${isActive ? "text-emerald-500 border-b-2 border-emerald-500" : ""}
                            ${inputChar !== undefined
                              ? inputChar === char
                                ? theme === 'dark' ? "text-[#d4d4d4]" : "text-slate-700"
                                : "text-rose-500"
                              : theme === 'dark' ? "text-[#b0b0b0]" : "text-slate-400"
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
              
              {/* Focus Overlay */}
              {!isFocused && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <p className={`text-lg md:text-xl font-medium ${theme === 'dark' ? 'text-[#b0b0b0]' : 'text-slate-600'}`}>
                    🖱️  Click here or press any key to focus
                    </p>
                  </div>
                </div>
              )}
              
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handlePhysicalInput}
                onKeyDown={handleInputKeyDown}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="absolute inset-0 opacity-0 cursor-text"
                disabled={stats.time <= 0}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              <StatPanel
                value={stats.time}
                label="Time Remaining"
                icon={<ClockIcon className="w-6 h-6" />}
                color="text-emerald-500"
                unit="s"
                theme={theme}
              />
              <StatPanel
                value={stats.wpm}
                label="Words Per Minute"
                icon={<BoltIcon className="w-6 h-6" />}
                color="text-emerald-500"
                theme={theme}
              />
              <StatPanel
                value={stats.accuracy}
                label="Accuracy"
                icon={<ChartBarIcon className="w-6 h-6" />}
                color="text-emerald-500"
                unit="%"
                theme={theme}
              />
            </div>

            {isMobile && (
              <div className={`fixed bottom-0 left-0 right-0 ${theme === 'dark' ? 'bg-[#2d2d30]/95' : 'bg-white/95'} backdrop-blur-lg border-t ${theme === 'dark' ? 'border-[#3e3e42]' : 'border-slate-200'} p-3 pb-4`}>
                <MobileKeyboard
                  onKeyPress={handleVirtualInput}
                  theme={theme}
                  className="max-w-md mx-auto"
                  disabled={stats.time <= 0}
                />
              </div>
            )}
          </div>
        )}

        {gameState === "results" && (
          <TypingResultsModal
            isOpen={true}
            stats={stats}
            session={session}
            onRestart={startGame}
            onClose={() => setGameState('idle')}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
}