'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { Layers, LogOut, LogIn, UserPlus } from 'lucide-react';

const navLinks = [
  { href: '/templates', label: 'Templates' },
  { href: '/create', label: 'Create' },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-black/80 border-b border-sky-200 dark:border-sky-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Layers size={20} className="text-sky-400" />
          <span className="font-bangers text-2xl tracking-widest text-sky-400">MEME GEN</span>
        </Link>

        <div className="hidden sm:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === href
                  ? 'text-sky-500 dark:text-sky-400 bg-sky-50 dark:bg-sky-950'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-zinc-800'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <span className="hidden sm:block text-sm text-zinc-500 dark:text-zinc-400 max-w-[120px] truncate">
                {user.displayName ?? user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md text-zinc-600 dark:text-zinc-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-sky-500 hover:bg-sky-600 text-white transition-colors"
              >
                <UserPlus size={14} />
                <span>Sign Up</span>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="sm:hidden flex border-t border-sky-100 dark:border-zinc-800">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 text-center py-2 text-xs font-medium transition-colors ${
              pathname === href
                ? 'text-sky-500 border-b-2 border-sky-500'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
