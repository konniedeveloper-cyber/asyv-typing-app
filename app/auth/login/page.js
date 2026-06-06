import { Suspense } from 'react';
import LoginContent from './LoginContent';

function LoginSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-12 bg-gray-300 dark:bg-slate-700 rounded-lg w-3/4 mx-auto mb-4" />
          <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mx-auto" />
        </div>
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-8 space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-12 bg-gray-300 dark:bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}
