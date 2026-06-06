'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import Link from 'next/link';
import {
  PlayIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  UsersIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  HomeIcon,
  LightBulbIcon,
  ChartBarIcon,
  BellIcon,
  UserIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline';
import RaceResultsModal from '../components/RaceResultsModal';
import ThemeToggle from '../components/ThemeToggle';
import { RainbowNavWrapper } from '../components/RainbowNavWrapper';
import { sentences } from '../constants/sentences';

export default function RacePage() {
  const { theme, toggleTheme } = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [mode, setMode] = useState('home'); // home, create, join, racing
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [race, setRace] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentSentence, setCurrentSentence] = useState('');
  const [userInput, setUserInput] = useState('');
  const [raceStarted, setRaceStarted] = useState(false);
  const [countDown, setCountDown] = useState(null);
  const [countdownStartedState, setCountdownStartedState] = useState(false); // Trigger countdown effect
  const [results, setResults] = useState([]);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [error, setError] = useState('');
  const [raceStartTime, setRaceStartTime] = useState(null);
  const [finished, setFinished] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Handle user menu click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target) &&
          !event.target.closest('[data-user-menu]')) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const inputRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const userInputRef = useRef('');
  const raceStartTimeRef = useRef(null);
  const countdownStartedRef = useRef(false); // Track if we've started countdown for this race

  // Set mounted flag on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check authentication - NextAuth session or localStorage
  useEffect(() => {
    if (!isMounted) return;

    console.log('🔐 [RACE] Auth check - NextAuth status:', status, 'session:', !!session);
    
    // If NextAuth has a session, user is authenticated
    if (session) {
      console.log('✅ [RACE] Authenticated via NextAuth:', session.user?.email);
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
      setAuthChecked(true);
      return;
    }

    // If NextAuth is still loading, try localStorage first as fallback
    if (status === 'loading') {
      console.log('⏳ [RACE] NextAuth session loading, checking localStorage...');
      const authUser = localStorage.getItem('authUser');
      if (authUser) {
        try {
          const userData = JSON.parse(authUser);
          console.log('✅ [RACE] Using localStorage while NextAuth loads:', userData.email);
          setIsAuthenticated(true);
          setAuthChecked(true);
          return;
        } catch (error) {
          console.log('❌ [RACE] Invalid localStorage data');
        }
      }
      // Still wait for NextAuth to load
      return;
    }

    // NextAuth returned unauthenticated, check localStorage as fallback
    if (status === 'unauthenticated') {
      console.log('📦 [RACE] NextAuth unauthenticated, checking localStorage...');
      const authUser = localStorage.getItem('authUser');
      if (authUser) {
        try {
          const userData = JSON.parse(authUser);
          console.log('✅ [RACE] Authenticated via localStorage:', userData.email);
          setIsAuthenticated(true);
          setAuthChecked(true);
        } catch (error) {
          console.log('❌ [RACE] Invalid localStorage data, redirecting to login');
          router.push('/auth/login');
        }
      } else {
        console.log('❌ [RACE] Not authenticated, redirecting to login');
        router.push('/auth/login');
      }
    }
  }, [status, session, router, isMounted]);

  // Polling for race updates
  const pollRaceUpdates = async () => {
    if (!roomCode || roomCode.trim() === '') return;

    try {
      const res = await fetch(`/api/race?roomCode=${encodeURIComponent(roomCode)}`);
      
      if (!res.ok) {
        console.error('Poll race failed:', res.status);
        return;
      }

      const data = await res.json();
      
      // Log participants progress for debugging
      if (raceStarted && data.participants) {
        console.log('Participants progress:', data.participants.map(p => ({
          username: p.user.username,
          progress: p.progress,
          wpm: p.wpm,
          rawWpm: p.rawWpm
        })));
      }
      
      // Only update participants to avoid triggering full re-renders
      // Don't update race object during active race to prevent state resets
      if (!raceStarted) {
        setRace(data);
      }
      
      // Update participants from server - ALWAYS update to get latest finished status
      setParticipants(prevParticipants => {
        return (data.participants || []).map(newP => {
          // If this is the current user and race is active and we have local typing state, preserve ONLY the progress/input
          // But ALWAYS update finished status from server
          if (newP.userId === currentUserId && raceStarted) {
            const currentUserState = prevParticipants.find(p => p.userId === currentUserId);
            if (currentUserState && !currentUserState.finished) {
              // Keep local progress state but use server's finished status
              return {
                ...currentUserState,
                finished: newP.finished, // Always use server's finished status
                finishTime: newP.finishTime
              };
            }
          }
          // For other players, ALWAYS use server data to show their real finished status
          return newP;
        });
      });
      
      // If race is active and has a startTime, update countdown based on server time
      if (data.status === 'active' && data.startTime) {
        // Store the server startTime for countdown calculation
        if (!raceStartTimeRef.current) {
          // First time we see the race start, store the server's startTime
          const serverStartTime = new Date(data.startTime).getTime();
          raceStartTimeRef.current = serverStartTime;
          countdownStartedRef.current = true;
          setCountdownStartedState(true); // Trigger countdown effect for late joiners
        }
      }
    } catch (err) {
      // Silently handle polling errors - temporary network issues shouldn't break the UI
      // Polling will retry on next interval
    }
  };

  // Countdown effect - updates countdown display based on server time
  useEffect(() => {
    if (!countdownStartedState || raceStarted) return;

    const updateCountdown = () => {
      if (!raceStartTimeRef.current) return;
      
      const serverStartTime = raceStartTimeRef.current;
      const elapsedSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
      const remainingCountdown = Math.max(0, 5 - elapsedSeconds);
      
      if (remainingCountdown > 0) {
        setCountDown(remainingCountdown);
      } else {
        // Countdown finished
        setCountDown(null);
        const startTime = Date.now();
        setRaceStartTime(startTime);
        setRaceStarted(true);
        setFinished(false);
      }
    };

    // Update countdown every 100ms for smooth updates
    const countdownInterval = setInterval(updateCountdown, 100);
    
    // Also update immediately
    updateCountdown();
    
    return () => clearInterval(countdownInterval);
  }, [countdownStartedState, raceStarted]);

  // When race actually starts (after countdown), prepare for typing
  useEffect(() => {
    if (raceStarted && !countDown) {
      setUserInput('');
      setFinished(false);
      setError('');
      inputRef.current?.focus();
    }
  }, [raceStarted]);

  useEffect(() => {
    if (!roomCode || mode !== 'racing') return;

    // Poll for updates - frequency depends on race state
    // Before race starts: 300ms for countdown sync (invitee needs to see countdown)
    // During race: 30ms for real-time participant updates and finished status
    const pollInterval = raceStarted ? 30 : 300;
    pollIntervalRef.current = setInterval(pollRaceUpdates, pollInterval);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [roomCode, mode, raceStarted]);

  // Prevent backspace from navigating back in the browser
  useEffect(() => {
    const handleBackspaceNavigation = (e) => {
      // Only prevent backspace if not in an input field
      if (e.key === 'Backspace' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleBackspaceNavigation);
    return () => {
      window.removeEventListener('keydown', handleBackspaceNavigation);
    };
  }, []);

  // Sync refs with state
  useEffect(() => {
    userInputRef.current = userInput;
  }, [userInput]);

  useEffect(() => {
    raceStartTimeRef.current = raceStartTime;
  }, [raceStartTime]);

  // Global keyboard listener for typing during race
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Prevent typing while countdown is active or race hasn't started
      if (!raceStarted || countDown > 0 || mode !== 'racing' || !currentSentence) return;

      // Allow Enter to manually finish the race
      if (e.key === 'Enter' && !finished) {
        e.preventDefault();
        finishRace();
        return;
      }

      let newInput = userInputRef.current;

      if (e.key === ' ') {
        e.preventDefault();
        newInput = userInputRef.current + ' ';
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        newInput = userInputRef.current.slice(0, -1);
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        newInput = userInputRef.current + e.key;
      } else {
        return;
      }

      // Update ref immediately so next keystroke has correct value
      userInputRef.current = newInput;

      // Update state - use setter function to ensure closure has fresh value
      setUserInput(newInput);

      // Send progress update to server
      if (raceStartTimeRef.current && roomCode && roomCode.trim() !== '') {
        const progress = newInput.length;
        const typed = newInput.split('');
        const sentenceChars = currentSentence.split('');
        const correctChars = typed.filter((char, idx) => char === sentenceChars[idx]).length;
        const accuracy = typed.length > 0 ? (correctChars / typed.length) * 100 : 100;
        const elapsed = Date.now() - raceStartTimeRef.current;
        // Calculate WPM based on correct characters only (like TypingTest)
        const wpm = calculateWPM(correctChars, elapsed);
        const rawWpm = calculateRawWPM(correctChars, elapsed);

        // Get user email for fallback auth
        let userEmail = session?.user?.email;
        if (!userEmail) {
          const authUser = localStorage.getItem('authUser');
          if (authUser) {
            try {
              const userData = JSON.parse(authUser);
              userEmail = userData.email;
            } catch (error) {
              // Silently catch
            }
          }
        }

        // Update local state immediately for UI responsiveness
        setParticipants(prev => prev.map(p => 
          p.userId === currentUserId 
            ? { ...p, progress, accuracy, wpm, rawWpm }
            : p
        ));

        // Send progress update to server (non-blocking, don't log errors since polling handles updates)
        fetch(`/api/race/${encodeURIComponent(roomCode)}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ progress, accuracy, wpm, rawWpm, userEmail })
        })
          .catch(err => {
            // Silently catch errors - progress updates via polling are the source of truth
            // This is just for server-side tracking
          });

        // Check if finished: either typed exactly correct OR reached the sentence length
        if (!finished && (newInput === currentSentence || progress >= currentSentence.length)) {
          console.log('Race finished!', { 
            exact: newInput === currentSentence, 
            reachedLength: progress >= currentSentence.length 
          });
          finishRaceWithStats(wpm, accuracy, rawWpm, userEmail);
        }
      }
    };

    if (raceStarted && mode === 'racing') {
      window.addEventListener('keydown', handleGlobalKeyDown);
      return () => {
        window.removeEventListener('keydown', handleGlobalKeyDown);
      };
    }
  }, [raceStarted, countDown, mode, currentSentence, roomCode, finished]);

  const handleCreateRoom = async () => {
    try {
      setError('');
      setIsCreating(true);
      
      // Get user email from session or localStorage for fallback auth
      let userEmail = session?.user?.email;
      console.log('[CREATE ROOM] Session email:', userEmail);
      
      if (!userEmail) {
        const authUser = localStorage.getItem('authUser');
        if (authUser) {
          try {
            const userData = JSON.parse(authUser);
            userEmail = userData.email;
            console.log('[CREATE ROOM] localStorage email:', userEmail);
          } catch (error) {
            console.log('[CREATE ROOM] Error parsing localStorage:', error);
          }
        }
      }
      
      // Check if we have an email
      if (!userEmail) {
        console.error('[CREATE ROOM] No email found in session or localStorage');
        setError('Unable to create room - not authenticated properly');
        setIsCreating(false);
        return;
      }
      
      console.log('[CREATE ROOM] Creating room with email:', userEmail);
      const res = await fetch('/api/race', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail })
      });
      const data = await res.json();
      
      console.log('[CREATE ROOM] Response:', { status: res.status, data });
      
      if (!res.ok) {
        console.error('[CREATE ROOM] Failed:', data);
        setError(data.error || 'Failed to create room');
        setIsCreating(false);
        return;
      }

      console.log('[CREATE ROOM] Room created successfully:', data.roomCode);
      setRoomCode(data.roomCode);
      setRace(data);
      setParticipants(data.participants);
      setCurrentUserId(data.creatorId);
      setCurrentSentence(sentences[data.sentenceId]);
      setMode('racing');
      setIsCreating(false);
    } catch (err) {
      console.error('[CREATE ROOM] Error:', err);
      setError('Failed to create room: ' + err.message);
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    try {
      setError('');
      if (!inputCode.trim()) {
        setError('Please enter a room code');
        return;
      }

      setIsJoining(true);
      
      // Get user email from session or localStorage for fallback auth
      let userEmail = session?.user?.email;
      if (!userEmail) {
        const authUser = localStorage.getItem('authUser');
        if (authUser) {
          try {
            const userData = JSON.parse(authUser);
            userEmail = userData.email;
          } catch (error) {
            console.log('Error parsing localStorage:', error);
          }
        }
      }
      
      const res = await fetch('/api/race/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: inputCode.toUpperCase(), userEmail })
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to join room');
        setIsJoining(false);
        return;
      }

      setRoomCode(data.roomCode);
      setRace(data);
      setParticipants(data.participants);
      
      // Find current user in participants - use localStorage fallback if session not ready
      let username = session?.user?.name || session?.user?.username;
      if (!username) {
        const authUser = localStorage.getItem('authUser');
        if (authUser) {
          try {
            const userData = JSON.parse(authUser);
            username = userData.username;
          } catch (error) {
            console.log('Error parsing localStorage:', error);
          }
        }
      }
      
      const myParticipant = data.participants?.find(p => p.user?.username === username);
      if (myParticipant) {
        setCurrentUserId(myParticipant.userId);
      }
      setCurrentSentence(sentences[data.sentenceId]);
      setMode('racing');
      setIsJoining(false);
    } catch (err) {
      setError('Failed to join room');
      setIsJoining(false);
    }
  };

  const handleStartRace = async () => {
    try {
      setError('');
      
      // Check if at least 2 participants
      if (participants.length < 2) {
        setError('At least 2 participants are required to start the race');
        return;
      }

      setIsStarting(true);
      console.log('[RACE START] Starting race with roomCode:', roomCode, 'Participants:', participants.length);
      
      // Get user email for fallback auth - prioritize localStorage
      let userEmail = null;
      
      // First try localStorage
      const authUser = localStorage.getItem('authUser');
      if (authUser) {
        try {
          const userData = JSON.parse(authUser);
          userEmail = userData.email;
          console.log('[RACE START] Got email from localStorage:', userEmail);
        } catch (error) {
          console.log('[RACE START] Error parsing localStorage:', error);
        }
      }
      
      // Fallback to session
      if (!userEmail && session?.user?.email) {
        userEmail = session.user.email;
        console.log('[RACE START] Got email from session:', userEmail);
      }
      
      console.log('[RACE START] Using email:', userEmail);
      
      const res = await fetch(`/api/race/${roomCode}/start`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail })
      });
      
      console.log('Start response status:', res.status);
      
      let data = null;
      const contentType = res.headers.get('content-type');
      console.log('[RACE START CLIENT] Response content-type:', contentType);
      
      // Get response text first to debug
      const responseText = await res.text();
      console.log('[RACE START CLIENT] Response text:', responseText.substring(0, 500));
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('[RACE START CLIENT] Failed to parse response JSON:', parseError);
          console.error('[RACE START CLIENT] Response was:', responseText);
          setError('Failed to parse server response - check server logs');
          setIsStarting(false);
          return;
        }
      } else {
        console.error('[RACE START CLIENT] Unexpected response content-type:', contentType);
        console.error('[RACE START CLIENT] Response body:', responseText);
        setError(`Unexpected response from server. Status: ${res.status}. Check server logs.`);
        setIsStarting(false);
        return;
      }
      
      console.log('[RACE START CLIENT] Parsed response:', { status: res.status, data });
      
      if (!res.ok) {
        const errorMsg = data?.error || `Failed to start race: ${res.status}`;
        console.error('[RACE START CLIENT] Start race failed:', errorMsg, data?.details);
        setError(errorMsg);
        setIsStarting(false);
        return;
      }

      console.log('[RACE START CLIENT] Race started successfully, data:', data);
      setRace(data);
      
      // Store server's startTime for countdown calculation
      if (data.startTime) {
        raceStartTimeRef.current = new Date(data.startTime).getTime();
      }
      countdownStartedRef.current = true; // Mark countdown as started
      setCountdownStartedState(true); // Trigger countdown effect
      
      // The countdown effect will handle the countdown display automatically
      // No need for manual setTimeout - it will update based on server time
    } catch (err) {
      console.error('Start race error:', err);
      setError('Failed to start race: ' + err.message);
      setIsStarting(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const calculateWPM = (chars, timeMs) => {
    const minutes = timeMs / 60000;
    return Math.round((chars / 5) / minutes) || 0;
  };

  const calculateRawWPM = (chars, timeMs) => {
    const minutes = timeMs / 60000;
    return Math.round(chars / 5 / minutes) || 0;
  };

  const calculateAccuracy = (typed, sentence) => {
    const sentenceChars = sentence.split('');
    const correctChars = typed.filter((char, idx) => char === sentenceChars[idx]).length;
    return typed.length > 0 ? (correctChars / typed.length) * 100 : 100;
  };

  // Helper function to finish the race with stats
  const finishRaceWithStats = (wpm, accuracy, rawWpm, userEmail) => {
    if (finished) return; // Prevent multiple finishes
    
    setFinished(true);

    // Update local state to finished immediately
    setParticipants(prev => prev.map(p => 
      p.userId === currentUserId 
        ? { ...p, progress: currentSentence.length, finished: true }
        : p
    ));

    fetch(`/api/race/${encodeURIComponent(roomCode)}/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wpm, accuracy, rawWpm, userEmail })
    })
      .then(res => res.json())
      .then(data => {
        setTimeout(() => {
          setResults(data.results || []);
          setShowResultsModal(true);
        }, 2000);
      })
      .catch(err => console.error('Failed to finish race:', err));
  };

  // Manual race finish (called by Enter key)
  const finishRace = () => {
    if (finished) return;
    
    const typed = userInputRef.current.split('');
    const sentenceChars = currentSentence.split('');
    const correctChars = typed.filter((char, idx) => char === sentenceChars[idx]).length;
    const accuracy = typed.length > 0 ? (correctChars / typed.length) * 100 : 100;
    const elapsed = Date.now() - raceStartTimeRef.current;
    const wpm = calculateWPM(correctChars, elapsed);
    const rawWpm = calculateRawWPM(correctChars, elapsed);

    // Get user email for fallback auth
    let userEmail = session?.user?.email;
    if (!userEmail) {
      const authUser = localStorage.getItem('authUser');
      if (authUser) {
        try {
          const userData = JSON.parse(authUser);
          userEmail = userData.email;
        } catch (error) {
          // Silently catch
        }
      }
    }

    finishRaceWithStats(wpm, accuracy, rawWpm, userEmail);
  };

  const handleKeyDown = (e) => {
    // Prevent page scrolling when space is pressed, but allow the character to be typed
    if (e.key === ' ' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      // Manually add space to input
      setUserInput(userInput + ' ');
    }
    // Allow backspace to work properly
    if (e.key === 'Backspace') {
      e.preventDefault();
      setUserInput(userInput.slice(0, -1));
    }
  };

  const handleTyping = async (e) => {
    const value = e.target.value;
    setUserInput(value);

    if (raceStarted && raceStartTime) {
      const progress = value.length;
      const typed = value.split('');
      const sentenceChars = currentSentence.split('');
      const correctChars = typed.filter((char, idx) => char === sentenceChars[idx]).length;
      const accuracy = typed.length > 0 ? (correctChars / typed.length) * 100 : 100;
      const elapsed = Date.now() - raceStartTime;
      // Calculate WPM based on correct characters only (like TypingTest)
      const wpm = calculateWPM(correctChars, elapsed);
      const rawWpm = calculateRawWPM(correctChars, elapsed);

      // Get user email for fallback auth
      let userEmail = session?.user?.email;
      if (!userEmail) {
        const authUser = localStorage.getItem('authUser');
        if (authUser) {
          try {
            const userData = JSON.parse(authUser);
            userEmail = userData.email;
          } catch (error) {
            // Silently catch
          }
        }
      }

      // Update progress - send immediately (non-blocking)
      fetch(`/api/race/${roomCode}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress, accuracy: accuracy, wpm, rawWpm, userEmail })
      }).catch(err => {
        // Silently catch errors - progress updates via polling are the source of truth
      });

      // Check if finished
      if (value === currentSentence && !finished) {
        setFinished(true);
        try {
          const res = await fetch(`/api/race/${roomCode}/finish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wpm, accuracy: accuracy, rawWpm, userEmail })
          });

          if (res.ok) {
            const data = await res.json();
            // Show results modal after 2 seconds
            await new Promise(resolve => setTimeout(resolve, 2000));
            setResults(data.results || []);
            setShowResultsModal(true);
          }
        } catch (err) {
          console.error('Failed to finish race:', err);
        }
      }
    }
  };

  const handleBackHome = () => {
    // Clear all polling intervals
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    // Reset all state to initial values
    setMode('home');
    setRoomCode('');
    setInputCode('');
    setUserInput('');
    setError('');
    setParticipants([]);
    setRaceStarted(false);
    setFinished(false);
    setCurrentUserId(null);
    setResults([]);
    setCountDown(null);
    setCountdownStartedState(false);
    setCurrentSentence('');
    setRaceStartTime(null);
    setShowResultsModal(false);
    setRace(null);
    // Force a small delay to ensure state is cleared before navigation
    userInputRef.current = '';
    raceStartTimeRef.current = null;
    countdownStartedRef.current = false;
  };

  const handleRestartRace = async () => {
    try {
      // Reset countdown tracking for new race
      countdownStartedRef.current = false;
      setCountdownStartedState(false);
      raceStartTimeRef.current = null;
      
      // Reset race state while keeping room and participants
      setUserInput('');
      setRaceStarted(false);
      setFinished(false);
      setResults([]);
      setShowResultsModal(false);
      setMode('racing');
      setCountDown(null); // Clear countdown initially
      setError('');
      setRaceStartTime(null);
      
      // Reset progress for all participants
      setParticipants(prev => prev.map(p => ({
        ...p,
        progress: 0,
        accuracy: 100,
        wpm: 0,
        rawWpm: 0,
        finished: false
      })));

      // Start a new race with the same participants
      const res = await fetch(`/api/race/${encodeURIComponent(roomCode)}/start`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.startTime) {
        setRace(data);
        // Store server's startTime for countdown calculation
        if (data.startTime) {
          raceStartTimeRef.current = new Date(data.startTime).getTime();
        }
        countdownStartedRef.current = true;
        setCountdownStartedState(true); // Trigger countdown effect with server time
        // The countdown effect will handle the 5-second countdown automatically
      } else {
        setError('Failed to restart race');
        setMode('waiting');
      }
    } catch (err) {
      console.error('Restart race error:', err);
      setError('Failed to restart race: ' + err.message);
      setMode('waiting');
    }
  };

  if (!authChecked || !isAuthenticated) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
      <RainbowNavWrapper className="fixed top-0 left-0 right-0 flex justify-center z-50 pt-6 px-4" isDark={theme === 'dark'}>
        <div className="bg-white dark:bg-slate-800 rounded-full shadow-lg backdrop-blur-md bg-opacity-95 dark:bg-opacity-95 px-2 py-3 flex items-center gap-1" style={{pointerEvents: 'auto'}}>
          {/* Home */}
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200"
            title="Home"
          >
            <HomeIcon className="w-5 h-5" />
            <span>Home</span>
          </Link>

          {/* Study/Learn */}
          <Link
            href="/Study"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200"
            title="Learn to Type"
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

          {/* Race (Current Page - Highlighted) */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10">
            <span className="text-lg">🏎️</span>
            <span>Race</span>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-300 dark:bg-slate-600 mx-1"></div>

          {/* Dashboard (if logged in) */}
          {session && (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200"
              title="Dashboard"
            >
              <UserIcon className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
          )}

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
      </RainbowNavWrapper>
      
      <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
        {/* Home Screen */}
        {mode === 'home' && (
          <div className="text-center py-12">
            <h1 className={`text-5xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'} mb-4`}>
              Race Mode
            </h1>
            <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mb-12 text-lg`}>
              Challenge your friends in real-time typing races
            </p>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <button
                onClick={handleCreateRoom}
                disabled={isCreating}
                className={`p-8 rounded-xl transition-all group ${isCreating ? 'opacity-70 cursor-not-allowed' : ''} ${theme === 'dark' ? 'bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500' : 'bg-emerald-50 border border-emerald-200 hover:border-emerald-400'}`}
              >
                <div className="text-4xl mb-4">{isCreating ? '⏳' : '🚀'}</div>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} mb-2`}>
                  {isCreating ? 'Creating...' : 'Create Room'}
                </h2>
                <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} text-sm`}>
                  {isCreating ? 'Setting up your race' : 'Start a new race and invite friends'}
                </p>
              </button>

              <button
                onClick={() => setMode('join')}
                className={`p-8 rounded-xl ${theme === 'dark' ? 'bg-blue-500/10 border border-blue-500/30 hover:border-blue-500' : 'bg-blue-50 border border-blue-200 hover:border-blue-400'} transition-all group`}
              >
                <div className="text-4xl mb-4">🎯</div>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} mb-2`}>
                  Join Room
                </h2>
                <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} text-sm`}>
                  Join an existing race with a room code
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Join Screen */}
        {mode === 'join' && (
          <div className="max-w-md mx-auto py-12">
            <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'} mb-6`}>
              Enter Room Code
            </h2>

            <div className={`${theme === 'dark' ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-50 border-slate-200'} rounded-xl p-8 border`}>
              <input
                type="text"
                placeholder="Enter room code"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:border-emerald-500 mb-4 ${
                  theme === 'dark'
                    ? 'bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-500'
                    : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />

              {error && (
                <div className={`p-3 rounded-lg text-sm mb-4 ${theme === 'dark' ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-red-100 border border-red-300 text-red-600'}`}>
                  {error}
                </div>
              )}

              <button
                onClick={handleJoinRoom}
                disabled={isJoining}
                className={`w-full py-3 font-bold rounded-lg transition-all mb-3 flex items-center justify-center gap-2 ${isJoining ? 'opacity-70 cursor-not-allowed' : ''} ${theme === 'dark' ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-900' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
              >
                {isJoining ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    Joining...
                  </>
                ) : (
                  'Join Race'
                )}
              </button>

              <button
                onClick={() => setMode('home')}
                className={`w-full py-3 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-slate-100' : 'bg-slate-300 hover:bg-slate-400 text-slate-900'} font-bold rounded-lg transition-all`}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Racing Screen */}
        {mode === 'racing' && (
          <div className="py-8">
            {/* Room Code & Participants */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <div>
                    <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Room Code</p>
                    <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>{roomCode}</p>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className={`p-3 rounded-lg transition-all ${copied ? theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600' : theme === 'dark' ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'} flex items-center gap-2`}
                    title="Copy room code"
                  >
                    <DocumentDuplicateIcon className="w-5 h-5" />
                    {copied && <span className="text-xs font-semibold">Copied!</span>}
                  </button>
                </div>
                <button
                  onClick={handleBackHome}
                  className={`px-4 py-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-red-100 hover:bg-red-200 text-red-600 border border-red-300'}`}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Participants List */}
              <div className={`${theme === 'dark' ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-100/90 border-slate-300'} rounded-xl p-6 border`}>
                <div className="flex items-center gap-2 mb-4">
                  <UsersIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  <h3 className={`${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'} font-bold`}>Participants ({participants.length})</h3>
                </div>

                <div className="grid gap-4">
                  {(raceStarted 
                    ? participants.slice().sort((a, b) => (b.progress || 0) - (a.progress || 0))
                    : participants
                  ).map((p) => {
                    const isCurrentUser = p.userId === currentUserId;
                    const progressPercent = currentSentence && raceStarted ? Math.min(100, (p.progress / currentSentence.length) * 100) : 0;

                    return (
                      <div
                        key={p.userId}
                        className={`p-4 rounded-lg border transition-all ${
                          raceStarted
                            ? isCurrentUser
                              ? theme === 'dark' ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-emerald-50 border-emerald-300'
                              : p.finished
                              ? theme === 'dark' ? 'bg-green-500/20 border-green-500/50' : 'bg-green-50 border-green-300'
                              : theme === 'dark' ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-100 border-slate-300'
                            : theme === 'dark' ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200'
                        }`}
                      >
                        {/* Header with username and WPM */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {p.user?.image && (
                              <img
                                src={p.user.image}
                                alt={p.user.username}
                                className="w-8 h-8 rounded-full flex-shrink-0"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className={`font-bold text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                                {p.user.username}
                                {isCurrentUser && ' (You)'}
                              </p>
                            </div>
                          </div>
                          {raceStarted && (
                            <div className="text-right ml-4 flex-shrink-0">
                              <p className={`text-sm font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                {Math.round(p.wpm)} WPM
                              </p>
                              {p.finished && <p className="text-xs text-green-400 font-bold">✓ FINISHED</p>}
                            </div>
                          )}
                        </div>

                        {/* Progress bar and stats only during race */}
                        {raceStarted && (
                          <>
                            {/* Progress Bar */}
                            <div className={`w-full h-2 rounded-full overflow-hidden mb-2 ${theme === 'dark' ? 'bg-slate-600' : 'bg-slate-300'}`}>
                              <div
                                className={`h-full transition-all duration-300 ${
                                  p.finished
                                    ? theme === 'dark' ? 'bg-green-500' : 'bg-green-400'
                                    : isCurrentUser
                                    ? 'bg-emerald-500'
                                    : theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400'
                                }`}
                                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                              />
                            </div>

                            {/* Progress Stats */}
                            <div className="flex justify-between text-xs">
                              <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                                {p.progress}/{currentSentence.length} • {p.accuracy}%
                              </span>
                              <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                                {Math.round(progressPercent)}%
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Race Area */}
            {!raceStarted && (
              <div className="py-12">
                {error && (
                  <div className={`mb-6 p-4 rounded-lg text-sm text-center ${theme === 'dark' ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-red-100 border border-red-300 text-red-600'}`}>
                    {error}
                  </div>
                )}

                {/* Show sentence to all participants */}
                {currentSentence && (
                  <div className="mb-8">
                    <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} text-center text-lg mb-4`}>
                      Practice typing this sentence:
                    </p>
                    <div className={`${theme === 'dark' ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-50 border-slate-200'} p-6 rounded-lg border max-w-4xl mx-auto mb-6`}>
                      <p className={`text-3xl font-mono ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} leading-relaxed text-center`}>
                        {currentSentence.split('').map((char, idx) => {
                          let color = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
                          if (idx < userInput.length) {
                            color =
                              userInput[idx] === char
                                ? 'text-emerald-400'
                                : 'text-red-400';
                          }
                          return (
                            <span
                              key={idx}
                              className={`inline-block align-middle ${
                                idx === userInput.length
                                  ? 'bg-emerald-500/30'
                                  : ''
                              }`}
                            >
                              {char === ' ' ? (
                                <span className={`inline-flex items-center justify-center w-5 h-5 align-middle mx-0.5 ${
                                  idx < userInput.length
                                    ? userInput[idx] === ' '
                                      ? 'bg-emerald-500/30 border border-emerald-400 rounded'
                                      : 'bg-red-500/30 border border-red-400 rounded'
                                    : theme === 'dark' ? 'bg-slate-700/40 rounded' : 'bg-slate-300/40 rounded'
                                }`} title="Space"></span>
                              ) : (
                                <span className={color}>{char}</span>
                              )}
                            </span>
                          );
                        })}
                      </p>
                    </div>

                    {/* Practice typing input removed - not necessary */}
                  </div>
                )}

                <div className="text-center">
                  {countDown > 0 ? (
                    <div className="text-center">
                      <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Get Ready to Start! Race begins in:</p>
                      <div className={`text-6xl font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-500'} mb-4 animate-pulse`}>
                        {countDown}
                      </div>
                    </div>
                  ) : race?.countdown && race.countdown > 0 ? (
                    <div className={`text-6xl font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-500'} mb-4 animate-pulse`}>
                      {race.countdown}
                    </div>
                  ) : (
                    <>
                      <p className={`mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        {participants.length < 2 
                          ? `Waiting for participants... (${participants.length}/2)`
                          : 'Ready to type? Click start when everyone is ready!'
                        }
                      </p>
                      {currentUserId === race?.creatorId && (
                        <button
                          onClick={handleStartRace}
                          disabled={participants.length < 2 || isStarting}
                          className={`px-8 py-3 font-bold rounded-lg flex items-center gap-2 mx-auto transition-all ${
                            participants.length < 2 || isStarting
                              ? theme === 'dark' ? 'bg-slate-600 cursor-not-allowed text-slate-400' : 'bg-slate-300 cursor-not-allowed text-slate-600'
                              : theme === 'dark' ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-900' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          }`}
                        >
                          {isStarting ? (
                            <>
                              <span className="inline-block animate-spin">⏳</span>
                              Starting...
                            </>
                          ) : (
                            <>
                              <PlayIcon className="w-5 h-5" />
                              Start Race {participants.length < 2 ? `(${participants.length}/2)` : ''}
                            </>
                          )}
                        </button>
                      )}
                      {currentUserId !== race?.creatorId && (
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                          {participants.length < 2 
                            ? `Waiting for more participants... (${participants.length}/2)`
                            : 'Waiting for race creator to start...'
                          }
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Typing Area with Live Race - Simplified with Progress Bars */}
            {raceStarted && (
              <div className={`max-w-4xl mx-auto ${theme === 'dark' ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200'} rounded-xl p-8 border`}>
                
                {/* Countdown */}
                {countDown > 0 && (
                  <div className="text-center mb-8">
                    <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mb-2`}>Race starts in:</p>
                    <div className={`text-6xl font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-500'} animate-pulse`}>
                      {countDown}
                    </div>
                  </div>
                )}

                {/* Sentence Display with Current Word Highlighted */}
                <div className="mb-8">
                  <div className="text-center mb-2">
                    <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} text-center text-sm mb-2 uppercase tracking-wide`}>
                      Type the sentence:
                    </p>
                    <p className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'} text-xs`}>
                      ({currentSentence?.length || 0} characters • Press Enter to finish)
                    </p>
                  </div>
                  <div className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'} p-6 rounded-lg mb-4 relative min-h-[100px] flex items-center justify-start`}>
                    {!currentSentence ? (
                      <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Loading sentence...</p>
                    ) : (
                      <div className={`text-2xl md:text-3xl font-mono ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} leading-relaxed`}>
                        {currentSentence.split('').map((char, index) => {
                          const inputChar = userInput[index];
                          const isActive = index === userInput.length;

                          return (
                            <span
                              key={index}
                              className={`relative inline-block align-middle ${
                                isActive ? 'bg-emerald-500/30' : ''
                              }`}
                            >
                              {char === ' ' ? (
                                <span
                                  className={`inline-flex items-center justify-center w-5 h-5 align-middle mx-0.5 ${
                                    isActive
                                      ? 'bg-emerald-500/30 border border-emerald-400 rounded'
                                      : inputChar !== undefined
                                      ? inputChar === ' '
                                        ? 'bg-emerald-500/30 border border-emerald-400 rounded'
                                        : 'bg-red-500/30 border border-red-400 rounded'
                                      : theme === 'dark' ? 'bg-slate-700/40 rounded' : 'bg-slate-300/40 rounded'
                                  }`}
                                  title="Space"
                                />
                              ) : (
                                <span
                                  className={`relative ${
                                    isActive ? 'text-emerald-500 border-b-2 border-emerald-500' : ''
                                  } ${
                                    inputChar !== undefined
                                      ? inputChar === char
                                        ? theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                                        : 'text-rose-500'
                                      : theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                                  } ${isActive ? 'animate-pulse' : ''}`}
                                >
                                  {char}
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* No input element needed - using global keyboard listener */}
              </div>
            )}
          </div>
        )}

        {/* Results Screen */}
        {mode === 'results' && (
          <div className="max-w-4xl mx-auto py-12">
            {/* Winner Announcement */}
            {results.length > 0 && (
              <div className="text-center mb-8">
                <div className={`inline-block p-8 bg-gradient-to-r from-yellow-500/20 to-emerald-500/20 rounded-2xl ${theme === 'dark' ? 'border border-yellow-500/30' : 'border border-yellow-400/50'} mb-6`}>
                  <div className="text-6xl mb-4">🏆</div>
                  <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'} mb-2`}>
                    Winner!
                  </h1>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    {results[0].userImage && (
                      <img
                        src={results[0].userImage}
                        alt={results[0].userName}
                        className={`w-16 h-16 rounded-full border-4 ${theme === 'dark' ? 'border-yellow-400' : 'border-yellow-500'}`}
                      />
                    )}
                    <div>
                      <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                        {results[0].userName}
                      </p>
                      <p className={`text-xl font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {Math.round(results[0].wpm)} WPM • {Math.round(results[0].rawWpm || 0)} Raw • {results[0].accuracy}% Accuracy
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <h2 className={`text-4xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'} mb-8 text-center`}>
              Final Rankings
            </h2>

            <div className={`${theme === 'dark' ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-50 border-slate-200'} rounded-xl p-8 border`}>
              <div className="space-y-4">
                {results.map((result, idx) => (
                  <div
                    key={result.userId}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      idx === 0
                        ? 'bg-gradient-to-r from-yellow-500/20 to-emerald-500/20 border border-yellow-500/30'
                        : idx === 1
                        ? 'bg-gradient-to-r from-slate-400/20 to-slate-500/20 border border-slate-400/30'
                        : idx === 2
                        ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30'
                        : theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-200/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-3xl font-bold w-12 ${
                        idx === 0 ? 'text-yellow-400' :
                        idx === 1 ? theme === 'dark' ? 'text-slate-300' : 'text-slate-500' :
                        idx === 2 ? 'text-orange-400' :
                        theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                      }`}>
                        #{idx + 1}
                      </div>
                      <div className="flex items-center gap-3">
                        {result.userImage && (
                          <img
                            src={result.userImage}
                            alt={result.userName}
                            className="w-10 h-10 rounded-full border-2 border-slate-600"
                          />
                        )}
                        <div>
                          <p className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                            {result.userName}
                          </p>
                          {idx === 0 && (
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>🏆 Champion</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {Math.round(result.wpm)} WPM
                      </p>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                        {Math.round(result.rawWpm || 0)} Raw WPM
                      </p>
                      <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>{result.accuracy}% Accuracy</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-full mt-8 flex gap-4">
                <button
                  onClick={handleRestartRace}
                  className={`flex-1 py-3 ${theme === 'dark' ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-900' : 'bg-emerald-500 hover:bg-emerald-600 text-white'} font-bold rounded-lg transition-all flex items-center justify-center gap-2`}
                >
                  <ArrowPathIcon className="w-5 h-5" />
                  Restart Race
                </button>
                <button
                  onClick={handleBackHome}
                  className={`flex-1 py-3 ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-slate-100' : 'bg-slate-300 hover:bg-slate-400 text-slate-900'} font-bold rounded-lg transition-all flex items-center justify-center gap-2`}
                >
                  <ArrowRightIcon className="w-5 h-5" />
                  New Race
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
