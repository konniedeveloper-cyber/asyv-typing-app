'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ErrorPageContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const getErrorMessage = () => {
    switch (error) {
      case 'CredentialsSignin':
        return 'Invalid email or password. Please check and try again.';
      case 'Callback':
        return 'There was a problem with the OAuth provider. Please try again.';
      case 'OAuthSignin':
        return 'Could not sign in with the OAuth provider.';
      case 'OAuthCallback':
        return 'OAuth callback error. Please try again.';
      case 'EmailSigninEmail':
        return 'Could not send sign in email. Please try again.';
      case 'AccessDenied':
        return 'Access denied. Please try again.';
      default:
        return 'Authentication failed. Please check your credentials and try again.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl p-8 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
              Sign In Failed
            </h1>
            <p className="text-gray-600 dark:text-slate-400 mb-4">
              {getErrorMessage()}
            </p>
            
            {errorDescription && (
              <p className="text-sm text-gray-500 dark:text-slate-500 mb-4 p-3 bg-gray-100 dark:bg-slate-700/50 rounded-lg">
                {errorDescription}
              </p>
            )}

            {error && (
              <p className="text-xs text-gray-500 dark:text-slate-500 mb-4 font-mono bg-gray-100 dark:bg-slate-700/50 p-2 rounded">
                Error: {error}
              </p>
            )}

            <div className="flex gap-3 flex-col">
              <Link
                href="/auth/login"
                className="py-2 px-4 rounded-lg font-medium text-slate-900 bg-emerald-500 hover:bg-emerald-600 transition-colors"
              >
                Try Again
              </Link>
              <Link
                href="/auth/signup"
                className="py-2 px-4 rounded-lg font-medium text-slate-100 bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                Create Account
              </Link>
              <Link
                href="/"
                className="py-2 px-4 rounded-lg font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl p-8">
            <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded-lg mx-auto mb-4 w-12"></div>
            <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>
    }>
      <ErrorPageContent />
    </Suspense>
  );
}

