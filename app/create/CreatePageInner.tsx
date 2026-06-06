'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getFirebaseDb } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { memeTemplates } from '@/lib/memeTemplates';
import MemeCanvas, { MemeCanvasRef, MemeTextConfig } from '@/components/meme/MemeCanvas';
import TextControls from '@/components/meme/TextControls';
import { CircleCheck as CheckCircle } from 'lucide-react';

const DEFAULT_CONFIG: MemeTextConfig = {
  topText: '',
  bottomText: '',
  fontFamily: 'Impact',
  fontSize: 40,
  textColor: '#ffffff',
  strokeColor: '#000000',
  strokeWidth: 3,
  textAlign: 'center',
};

export default function CreatePageInner() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const canvasRef = useRef<MemeCanvasRef>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [config, setConfig] = useState<MemeTextConfig>(DEFAULT_CONFIG);
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const templateId = searchParams.get('template');
    const directUrl = searchParams.get('imageUrl');
    if (directUrl) {
      setImageUrl(directUrl);
    } else if (templateId) {
      const tpl = memeTemplates.find((t) => t.id === templateId);
      if (tpl) setImageUrl(tpl.url);
    }
  }, [searchParams]);

  const handleConfigChange = useCallback((patch: Partial<MemeTextConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSave = async () => {
    if (!user || !imageUrl) {
      showToast('Please add an image first.');
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(getFirebaseDb(), 'users', user.uid, 'memes'), {
        imageUrl,
        topText: config.topText,
        bottomText: config.bottomText,
        fontFamily: config.fontFamily,
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="flex justify-center">
          <MemeCanvas ref={canvasRef} imageUrl={imageUrl} config={config} />
        </div>

        <TextControls
          config={config}
          onChange={handleConfigChange}
          onImageUpload={setImageUrl}
          onDownload={() => canvasRef.current?.downloadPng()}
          onSave={handleSave}
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
