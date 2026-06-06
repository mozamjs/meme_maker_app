'use client';

import { useRef, useState } from 'react';
import { Upload, Download, Save, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { useAuth } from '@/context/AuthContext';
import type { MemeTextConfig } from './MemeCanvas';

interface TextControlsProps {
  config: MemeTextConfig;
  onChange: (patch: Partial<MemeTextConfig>) => void;
  onImageUpload: (url: string) => void;
  onDownload: () => void;
  onSave: () => void;
}

const FONTS = ['Impact', 'Arial', 'Comic Sans MS', 'Oswald', 'Bangers'];

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
      <div
        className="h-full bg-sky-500 transition-all duration-150"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function TextControls({ config, onChange, onImageUpload, onDownload, onSave }: TextControlsProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadToCloudinary(file, setUploadProgress);
      onImageUpload(url);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const labelClass = 'block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1';
  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-400 transition';

  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
      <div>
        <label className={labelClass}>Top Text</label>
        <input
          type="text"
          value={config.topText}
          onChange={(e) => onChange({ topText: e.target.value })}
          placeholder="TOP TEXT"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Bottom Text</label>
        <input
          type="text"
          value={config.bottomText}
          onChange={(e) => onChange({ bottomText: e.target.value })}
          placeholder="BOTTOM TEXT"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Font</label>
          <select
            value={config.fontFamily}
            onChange={(e) => onChange({ fontFamily: e.target.value })}
            className={inputClass}
          >
            {FONTS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Font Size: {config.fontSize}px</label>
          <input
            type="range"
            min={16}
            max={80}
            value={config.fontSize}
            onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
            className="w-full accent-sky-500 mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Text Color</label>
          <input
            type="color"
            value={config.textColor}
            onChange={(e) => onChange({ textColor: e.target.value })}
            className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 cursor-pointer"
          />
        </div>
        <div>
          <label className={labelClass}>Stroke Color</label>
          <input
            type="color"
            value={config.strokeColor}
            onChange={(e) => onChange({ strokeColor: e.target.value })}
            className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 cursor-pointer"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Stroke Width: {config.strokeWidth}px</label>
        <input
          type="range"
          min={0}
          max={10}
          value={config.strokeWidth}
          onChange={(e) => onChange({ strokeWidth: Number(e.target.value) })}
          className="w-full accent-sky-500"
        />
      </div>

      <div>
        <label className={labelClass}>Text Align</label>
        <div className="flex gap-2">
          {(['left', 'center', 'right'] as const).map((align) => {
            const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
            return (
              <button
                key={align}
                onClick={() => onChange({ textAlign: align })}
                className={`flex-1 flex justify-center items-center py-2 rounded-lg border transition-colors ${
                  config.textAlign === align
                    ? 'bg-sky-500 border-sky-500 text-white'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-sky-400'
                }`}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 flex flex-col gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-sky-400 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950 transition-colors text-sm font-medium disabled:opacity-60"
        >
          <Upload size={16} />
          {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Image'}
        </button>

        {uploading && <ProgressBar value={uploadProgress} />}
        {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}

        <button
          onClick={onDownload}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white transition-colors text-sm font-medium"
        >
          <Download size={16} />
          Download PNG
        </button>

        {user && (
          <button
            onClick={onSave}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-600 text-white transition-colors text-sm font-medium"
          >
            <Save size={16} />
            Save to Collection
          </button>
        )}
      </div>
    </div>
  );
}
