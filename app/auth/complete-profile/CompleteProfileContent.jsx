'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UserIcon } from '@heroicons/react/24/outline';

export default function CompleteProfileContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    username: '',
    gender: 'male',
    classId: 'ey-jupiter',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const classes = [
    { id: 'ey-jupiter', name: 'EY Jupiter' },
    { id: 'ey-venus', name: 'EY Venus' },
    { id: 'ey-mercury', name: 'EY Mercury' },
    { id: 'ey-neptune', name: 'EY Neptune' },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Check authentication status
    if (status === 'unauthenticated') {
      console.log('❌ [COMPLETE PROFILE] Not authenticated, redirecting to login');
      router.push('/auth/login');
      return;
    }

    // If authenticated, check if user already has a profile
    if (status === 'authenticated' && session?.user) {
      console.log('✅ [COMPLETE PROFILE] User authenticated:', session.user.email);
      
      // Check if user already has a username (profile already complete)
      if (session.user.username) {
        console.log('✅ [COMPLETE PROFILE] User already has complete profile, storing and redirecting');
        
        // Store user data in localStorage
        const authUser = {
          id: session.user.id,
          email: session.user.email,
          username: session.user.username,
          role: session.user.role || 'student',
          image: session.user.image,
        };

        localStorage.setItem('authUser', JSON.stringify(authUser));

        // Redirect based on role
        const redirectUrl = 
          authUser.role === 'admin' 
            ? '/admin-dashboard'
            : authUser.role === 'teacher' 
            ? '/teacher-dashboard'
            : '/dashboard';

        console.log('🔄 [COMPLETE PROFILE] Redirecting to:', redirectUrl);
        router.replace(redirectUrl);
      }
    }
  }, [status, session, router, isMounted]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/user/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session?.user?.email,
          username: formData.username,
          gender: formData.gender,
          classId: formData.classId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update profile');
        setLoading(false);
        return;
      }

      console.log('✅ [COMPLETE PROFILE] Profile updated:', data.user.email);
      console.log('✅ [COMPLETE PROFILE] User role:', data.user.role);

      // Store user data in localStorage with complete info
      const authUser = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        gender: data.user.gender,
        classId: data.user.classId,
        role: data.user.role || 'student',
        image: session?.user?.image,
      };

      console.log('💾 [COMPLETE PROFILE] Storing user in localStorage:', authUser);
      try {
        localStorage.setItem('authUser', JSON.stringify(authUser));
      } catch (error) {
        console.error('❌ [COMPLETE PROFILE] Failed to store in localStorage:', error);
      }

      // Determine redirect based on role
      const redirectUrl = 
        data.user.role === 'admin' 
          ? '/admin-dashboard'
          : data.user.role === 'teacher' 
          ? '/teacher-dashboard'
          : '/dashboard';

      console.log('🔄 [COMPLETE PROFILE] Redirecting to:', redirectUrl);
      router.replace(redirectUrl);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          {/* Profile Picture */}
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || 'Profile'}
              className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-emerald-500 shadow-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-500">
              <UserIcon className="w-10 h-10 text-white" />
            </div>
          )}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-600 bg-clip-text text-transparent mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Just a few more details to get started
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl p-8 backdrop-blur-sm animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Info Display */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                <span className="font-semibold">Email:</span> {session?.user?.email}
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                <span className="font-semibold">Name:</span> {session?.user?.name || 'Not Set'}
              </p>
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-gray-900 dark:text-slate-200 text-sm font-medium mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username for your profile"
                required
                minLength={3}
                maxLength={30}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
              />
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">3-30 characters, letters and numbers only</p>
            </div>

            {/* Gender Field */}
            <div>
              <label htmlFor="gender" className="block text-gray-900 dark:text-slate-200 text-sm font-medium mb-2">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            {/* Class Selection */}
            <div>
              <label htmlFor="classId" className="block text-gray-900 dark:text-slate-200 text-sm font-medium mb-2">
                Select Your Class
              </label>
              <select
                id="classId"
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm animate-fade-in">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:from-emerald-700 active:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-emerald-500/30 mt-6"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
                  Saving...
                </>
              ) : (
                'Continue to Dashboard'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-gray-600 dark:text-slate-400 text-sm">
            <p>
              You can always update these details later in your profile settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
