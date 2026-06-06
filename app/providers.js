'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <SessionProvider 
          refetchInterval={60 * 15} // Refetch every 15 minutes instead of 5
          refetchOnWindowFocus={false} // Don't refetch on window focus (better performance)
          refetchOnMount={false} // Don't refetch on mount if already cached
          baseUrl={process.env.NEXT_PUBLIC_NEXTAUTH_URL || process.env.NEXTAUTH_URL}
        >
          {children}
        </SessionProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
