'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import {
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function OAuthModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

  const handleOAuthSignIn = async (provider) => {
    setLoading(provider);
    setError('');

    try {
      // Determine callback URL based on environment
      const callbackUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback`
        : '/auth/callback';

      await signIn(provider, { 
        callbackUrl,
        redirect: true 
      });
    } catch (err) {
      console.error(`Error signing in with ${provider}:`, err);
      setError(`Failed to sign in with ${provider}. Please try again.`);
      setLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed right-0 top-0 h-screen w-full sm:w-96 bg-white dark:bg-slate-800 shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-6 h-6 text-emerald-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Continue Sign In
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col justify-center">
          <p className="text-gray-600 dark:text-slate-300 mb-6 text-center">
            Sign in securely with your social account
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            {/* Google Button */}
            <button
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading !== null}
              className="w-full px-6 py-3 bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 rounded-lg font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3"
            >
              {loading === 'google' ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 dark:border-t-white rounded-full animate-spin" />
              ) : (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span>{loading === 'google' ? 'Connecting...' : 'Google'}</span>
            </button>

            {/* GitHub Button */}
            <button
              onClick={() => handleOAuthSignIn('github')}
              disabled={loading !== null}
              className="w-full px-6 py-3 bg-gray-900 dark:bg-gray-800 rounded-lg font-medium text-white hover:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3"
            >
              {loading === 'github' ? (
                <div className="w-5 h-5 border-2 border-white border-t-gray-900 rounded-full animate-spin" />
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              )}
              <span>{loading === 'github' ? 'Connecting...' : 'GitHub'}</span>
            </button>
          </div>

          {/* Info */}
          <p className="text-xs text-gray-500 dark:text-slate-500 text-center mt-6">
            Your account will be created or linked automatically
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-slate-700">
          <p className="text-xs text-gray-500 dark:text-slate-400 text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </>
  );
}
