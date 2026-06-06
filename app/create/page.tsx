'use client';

import { Suspense } from 'react';
import CreatePageInner from './CreatePageInner';

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CreatePageInner />
    </Suspense>
  );
}
