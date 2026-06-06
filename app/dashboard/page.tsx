'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getFirebaseDb } from '@/lib/firebase';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
} from 'firebase/firestore';
import { Trash2, CreditCard as Edit, ImageOff, CirclePlus as PlusCircle } from 'lucide-react';

interface SavedMeme {
  id: string;
  imageUrl: string;
  topText: string;
  bottomText: string;
  fontFamily: string;
  createdAt: { seconds: number } | null;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [memes, setMemes] = useState<SavedMeme[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchMemes = async () => {
      setFetching(true);
      try {
        const q = query(
          collection(getFirebaseDb(), 'users', user.uid, 'memes'),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SavedMeme));
        setMemes(data);
      } catch {
        setMemes([]);
      } finally {
        setFetching(false);
      }
    };
    fetchMemes();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(getFirebaseDb(), 'users', user.uid, 'memes', id));
    setMemes((prev) => prev.filter((m) => m.id !== id));
  };

  if (loading || fetching) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">My Collection</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            {memes.length} meme{memes.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <Link
          href="/create"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors"
        >
          <PlusCircle size={16} />
          New Meme
        </Link>
      </div>

      {memes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ImageOff size={48} className="text-zinc-300 dark:text-zinc-600 mb-4" />
          <h2 className="text-xl font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
            No memes yet
          </h2>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm mb-6">
            Create your first meme and save it here.
          </p>
          <Link
            href="/create"
            className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium transition-colors"
          >
            Start Creating
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {memes.map((meme) => {
            const date = meme.createdAt
              ? new Date(meme.createdAt.seconds * 1000).toLocaleDateString()
              : '';
            return (
              <div
                key={meme.id}
                className="group flex flex-col rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm"
              >
                <div className="aspect-square relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <Image
                    src={meme.imageUrl}
                    alt={meme.topText || 'Meme'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="p-3 flex flex-col gap-1 flex-1">
                  {meme.topText && (
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate uppercase">
                      {meme.topText}
                    </p>
                  )}
                  {meme.bottomText && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate uppercase">
                      {meme.bottomText}
                    </p>
                  )}
                  {date && (
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-auto pt-1">{date}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Link
                      href={`/create?imageUrl=${encodeURIComponent(meme.imageUrl)}`}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-sky-400 text-sky-500 text-xs font-medium hover:bg-sky-50 dark:hover:bg-sky-950 transition-colors"
                    >
                      <Edit size={12} />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(meme.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-red-300 dark:border-red-800 text-red-500 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
