import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center text-center px-4">
      <div className="mb-6 text-sky-400 font-bangers text-[10rem] leading-none select-none">
        404
      </div>
      <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100 mb-3">
        Page not found
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-colors shadow-lg shadow-sky-500/25"
      >
        Go Home
      </Link>
    </div>
  );
}
