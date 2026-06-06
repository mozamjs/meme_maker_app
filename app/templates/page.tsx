import Link from 'next/link';
import Image from 'next/image';
import { memeTemplates } from '@/lib/memeTemplates';

export default function TemplatesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">Meme Templates</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Pick one to start creating instantly</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {memeTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="group flex flex-col rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md hover:border-sky-400 dark:hover:border-sky-500 transition-all hover:-translate-y-1"
          >
            <div className="aspect-square relative overflow-hidden">
              <Image
                src={tpl.url}
                alt={tpl.name}
                fill
                className="object-cover transition-transform group-hover:scale-105 duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
            <div className="p-3 flex flex-col gap-2">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{tpl.name}</p>
              <Link
                href={`/create?template=${tpl.id}`}
                className="block text-center py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium transition-colors"
              >
                Use Template
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
