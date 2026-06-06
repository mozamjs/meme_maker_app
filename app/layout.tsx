import './globals.css';
import type { Metadata } from 'next';
import { Bangers, Oswald } from 'next/font/google';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';

const bangers = Bangers({ subsets: ['latin'], weight: '400', variable: '--font-bangers' });
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' });

export const metadata: Metadata = {
  title: 'Meme Gen — Create Memes in Seconds',
  description: 'The fastest way to create, customize, and share memes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${bangers.variable} ${oswald.variable} font-sans`}>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
