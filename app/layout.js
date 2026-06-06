import { Providers } from './providers';
import './globals.css';
import SplashCursor from '@/components/SplashCursor';

// 1. Import the DM_Sans font from next/font/google
import { DM_Sans } from 'next/font/google';

// 2. Configure the font loader
// Use the 'variable' option for seamless integration with Tailwind CSS
const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans', // Define a CSS variable name
});

export const metadata = {
  title: 'LFHS Typing Web',
  description: 'Improve your typing speed',
};

// 3. Apply the font's CSS variable to the <html> tag
export default function RootLayout({ children }) {
  return (
    // Apply the font class to the <html> element
    <html lang="en" className={`${dmSans.variable}`}>
      <body>
        <SplashCursor />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}