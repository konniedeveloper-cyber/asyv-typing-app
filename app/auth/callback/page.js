'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

function CallbackContent() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔄 [CALLBACK] Status:', status);
      console.log('🔄 [CALLBACK] Session:', session?.user?.email);

      if (status === 'unauthenticated') {
        console.log('❌ [CALLBACK] Not authenticated, redirecting to login');
        router.push('/auth/login?error=auth_failed');
        return;
      }

      if (status === 'authenticated' && session?.user) {
        try {
          console.log('✅ [CALLBACK] User authenticated, storing in localStorage');
          
          // Store user data in localStorage
          const authUser = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            username: session.user.username || '',
            role: session.user.role || 'student',
            image: session.user.image || null,
          };

          console.log('💾 [CALLBACK] Storing authUser:', authUser);
          localStorage.setItem('authUser', JSON.stringify(authUser));
          console.log('✅ [CALLBACK] authUser successfully stored in localStorage');

          // Check if this is OAuth or complete-profile redirect
          // If user just completed profile, route will handle it
          // If this is direct OAuth callback, complete profile if needed
          const redirectUrl = 
            authUser.role === 'admin' 
              ? '/admin-dashboard'
              : authUser.role === 'teacher' 
              ? '/teacher-dashboard'
              : !authUser.username
              ? '/auth/complete-profile' // New OAuth users need to complete profile
              : '/dashboard';

          console.log('🔄 [CALLBACK] Redirecting to:', redirectUrl);
          router.replace(redirectUrl);
        } catch (error) {
          console.error('❌ [CALLBACK] Error handling callback:', error);
          router.push('/auth/login?error=callback_failed');
        }
      }
    };

    if (status !== 'loading') {
      handleCallback();
    }
  }, [status, session, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-emerald-500 animate-spin mx-auto mb-4 border-slate-700 dark:border-slate-700"></div>
        <p className="text-slate-600 dark:text-slate-400">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-t-emerald-500 animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
