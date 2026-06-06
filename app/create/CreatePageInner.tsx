'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getFirebaseDb } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { memeTemplates } from '@/lib/memeTemplates';
import { uploadToCloudinary } from '@/lib/cloudinary';
import MemeCanvas, { MemeCanvasRef, TextBlock } from '@/components/meme/MemeCanvas';
import TextControls from '@/components/meme/TextControls';
import { CircleCheck as CheckCircle } from 'lucide-react';

const makeBlock = (overrides?: Partial<TextBlock>): TextBlock => ({
  id: Math.random().toString(36).slice(2),
  text: '',
  x: 0.5,
  y: 0.1,
  fontFamily: 'Impact',
  fontSize: 40,
  textColor: '#ffffff',
  strokeColor: '#000000',
  strokeWidth: 3,
  textAlign: 'center',
  bold: false,
  italic: false,
  ...overrides,
});

export default function CreatePageInner() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const canvasRef = useRef<MemeCanvasRef>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/signin');
  }, [user, loading, router]);

  useEffect(() => {
    const templateId = searchParams.get('template');
    const directUrl = searchParams.get('imageUrl');
    if (directUrl) setImageUrl(directUrl);
    else if (templateId) {
      const tpl = memeTemplates.find((t) => t.id === templateId);
      if (tpl) setImageUrl(tpl.url);
    }
  }, [searchParams]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAddBlock = () => {
    const b = makeBlock({ x: 0.5, y: 0.5, text: 'New Text' });
    setTextBlocks((prev) => [...prev, b]);
    setSelectedId(b.id);
  };

  const handleDeleteBlock = (id: string) => {
    setTextBlocks((prev) => prev.filter((b) => b.id !== id));
    setSelectedId(null);
  };

  const handleUpdateBlock = useCallback((id: string, patch: Partial<TextBlock>) => {
    setTextBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }, []);

  const handleMoveBlock = useCallback((id: string, x: number, y: number) => {
    setTextBlocks((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) }
          : b
      )
    );
  }, []);

  const handleReset = () => {
    setImageUrl(null);
    setTextBlocks([]);
    setSelectedId(null);
  };

  const handleDrop = async (file: File) => {
    try {
      const url = await uploadToCloudinary(file);
      setImageUrl(url);
    } catch {
      showToast('Image upload failed. Try again.');
    }
  };

  const handleSave = async () => {
    if (!user || !imageUrl) {
      showToast('Please add an image first.');
      return;
    }
    setSaving(true);
    try {
      const topBlock = textBlocks[0];
      const bottomBlock = textBlocks[1];
      await addDoc(collection(getFirebaseDb(), 'users', user.uid, 'memes'), {
        imageUrl,
        topText: topBlock?.text || '',
        bottomText: bottomBlock?.text || '',
        fontFamily: topBlock?.fontFamily || 'Impact',
        textBlocks: textBlocks.map(({ id, ...rest }) => rest),
        createdAt: serverTimestamp(),
      });
      showToast('Saved to your collection!');
    } catch {
      showToast('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">Meme Creator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="flex justify-center">
          <MemeCanvas
            ref={canvasRef}
            imageUrl={imageUrl}
            textBlocks={textBlocks}
            selectedId={selectedId}
            onSelectBlock={setSelectedId}
            onMoveBlock={handleMoveBlock}
            onDrop={handleDrop}
          />
        </div>

        <TextControls
          textBlocks={textBlocks}
          selectedId={selectedId}
          onSelectBlock={setSelectedId}
          onAddBlock={handleAddBlock}
          onDeleteBlock={handleDeleteBlock}
          onUpdateBlock={handleUpdateBlock}
          onImageUpload={setImageUrl}
          onDownload={() => canvasRef.current?.downloadPng()}
          onSave={handleSave}
          onReset={handleReset}
        />
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xl text-sm font-medium z-50">
          <CheckCircle size={16} className="text-sky-400 dark:text-sky-600" />
          {toast}
        </div>
      )}
    </div>
  );
}
