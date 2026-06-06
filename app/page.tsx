import Link from 'next/link';
import Image from 'next/image';
import { memeTemplates } from '@/lib/memeTemplates';
import { Zap, Image as ImageIcon } from 'lucide-react';

const PREVIEW_TEMPLATES = memeTemplates.slice(0, 4);

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-56px)]">
      <section className="relative py-24 px-4 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-100 via-white to-sky-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900" />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-sky-200/40 dark:bg-sky-900/20 blur-3xl -z-10" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-sky-300/30 dark:bg-sky-800/20 blur-3xl -z-10" />

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 mb-6">
          <Zap size={12} />
          Free meme creator
        </span>

        <h1 className="font-bangers text-6xl sm:text-8xl tracking-wide text-zinc-900 dark:text-white mb-4 leading-none">
          Create Memes in{' '}
          <span className="text-sky-400">Seconds</span>
        </h1>

        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mb-10">
          Pick a template, add your text, and download. No sign-in required to create. Save your collection when you&apos;re ready.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/create"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-base transition-all shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Zap size={18} />
            Start Creating
          </Link>
          <Link
            href="/templates"
            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-sky-300 dark:border-sky-700 text-sky-600 dark:text-sky-400 font-semibold text-base hover:bg-sky-50 dark:hover:bg-sky-950 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <ImageIcon size={18} />
            Browse Templates
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-bold text-zinc-700 dark:text-zinc-300 mb-6 text-center">
          Popular Templates
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {PREVIEW_TEMPLATES.map((tpl) => (
            <Link
              key={tpl.id}
              href={`/create?template=${tpl.id}`}
              className="group relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:border-sky-400 dark:hover:border-sky-500 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="aspect-square relative">
                <Image
                  src={tpl.url}
                  alt={tpl.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <span className="text-white text-sm font-medium">{tpl.name}</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/templates"
            className="text-sky-500 hover:text-sky-400 text-sm font-medium underline underline-offset-4"
          >
            View all 8 templates &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
