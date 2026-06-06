'use client';

import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Upload, Download, Save, AlignLeft, AlignCenter, AlignRight,
  Plus, Trash2, Bold, Italic, Smile, ChevronDown, ChevronUp,
} from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { useAuth } from '@/context/AuthContext';
import type { TextBlock } from './MemeCanvas';

interface TextControlsProps {
  textBlocks: TextBlock[];
  selectedId: string | null;
  onSelectBlock: (id: string) => void;
  onAddBlock: () => void;
  onDeleteBlock: (id: string) => void;
  onUpdateBlock: (id: string, patch: Partial<TextBlock>) => void;
  onImageUpload: (url: string) => void;
  onDownload: () => void;
  onSave: () => void;
  onReset: () => void;
}

const FONTS = ['Impact', 'Arial', 'Comic Sans MS', 'Oswald', 'Bangers'];

const EMOJIS = [
  '😂','🔥','💀','😭','🤣','👀','😍','🙏','💯','🎉',
  '😤','🤦','🥹','😊','😎','🤩','🥳','😏','😒','🙄',
  '🤔','💪','🎯','🌟','💥','✨','🎮','🎨','🏆','👑',
  '💎','🎁','🌈','🦄','🐸','🐵','🙈','🙉','🙊','💩',
  '👻','👾','🤖','👽','🦁','🐯','🦊','🐺','😱','🥶',
  '🤯','🫡','☠️','🤑','🥸','😈','👿','🎃','🤡','🫠',
];

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
      <div className="h-full bg-sky-500 transition-all duration-150" style={{ width: `${value}%` }} />
    </div>
  );
}

// Portal-based emoji picker — renders at body level so no overflow clipping
function EmojiPicker({
  anchorRef,
  onSelect,
  onClose,
}: {
  anchorRef: React.RefObject<HTMLButtonElement>;
  onSelect: (e: string) => void;
  onClose: () => void;
}) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 6,
        left: Math.min(rect.left + window.scrollX, window.innerWidth - 280),
      });
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [anchorRef, onClose]);

  return createPortal(
    <div
      style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 9999 }}
      className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl p-2 w-64"
    >
      <div className="grid grid-cols-10 gap-0.5 max-h-48 overflow-y-auto">
        {EMOJIS.map((em, i) => (
          <button
            key={`${em}-${i}`}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(em);
              onClose();
            }}
            className="text-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded p-0.5 transition-colors"
          >
            {em}
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}

const labelClass = 'block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1';
const inputClass =
  'w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-400 transition';

function BlockEditor({
  block,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
}: {
  block: TextBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdate: (patch: Partial<TextBlock>) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);
  const textRef = useRef<HTMLInputElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-focus input when this block becomes selected
  useEffect(() => {
    if (isSelected && textRef.current) {
      textRef.current.focus();
    }
  }, [isSelected]);

  const handleEmojiSelect = (emoji: string) => {
    const input = textRef.current;
    if (input) {
      const start = input.selectionStart ?? block.text.length;
      const end = input.selectionEnd ?? block.text.length;
      const newText = block.text.slice(0, start) + emoji + block.text.slice(end);
      onUpdate({ text: newText });
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      onUpdate({ text: block.text + emoji });
    }
  };

  return (
    <div
      className={`rounded-xl border transition-colors ${
        isSelected
          ? 'border-sky-400 bg-sky-50 dark:bg-sky-950/30'
          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none"
        onClick={() => { onSelect(); setExpanded((v) => !v); }}
      >
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex-1 truncate">
          {block.text || 'Empty text block'}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 text-zinc-400 hover:text-red-500 transition-colors rounded"
        >
          <Trash2 size={13} />
        </button>
        {expanded ? (
          <ChevronUp size={14} className="text-zinc-400" />
        ) : (
          <ChevronDown size={14} className="text-zinc-400" />
        )}
      </div>

      {expanded && (
        <div className="px-3 pb-3 flex flex-col gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-2">
          {/* Text + emoji */}
          <div>
            <label className={labelClass}>Text</label>
            <div className="flex gap-1">
              <input
                ref={textRef}
                type="text"
                value={block.text}
                onChange={(e) => onUpdate({ text: e.target.value })}
                placeholder="Enter text..."
                className={inputClass + ' flex-1'}
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
              />
              <button
                ref={emojiButtonRef}
                onClick={() => setShowEmoji((v) => !v)}
                className="px-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              >
                <Smile size={16} className="text-zinc-500" />
              </button>
              {showEmoji && (
                <EmojiPicker
                  anchorRef={emojiButtonRef}
                  onSelect={handleEmojiSelect}
                  onClose={() => setShowEmoji(false)}
                />
              )}
            </div>
          </div>

          {/* Font + size */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Font</label>
              <select
                value={block.fontFamily}
                onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                className={inputClass}
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Size: {block.fontSize}px</label>
              <input
                type="range" min={16} max={120} value={block.fontSize}
                onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
                className="w-full accent-sky-500 mt-2"
              />
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Text Color</label>
              <input
                type="color" value={block.textColor}
                onChange={(e) => onUpdate({ textColor: e.target.value })}
                className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer"
              />
            </div>
            <div>
              <label className={labelClass}>Stroke Color</label>
              <input
                type="color" value={block.strokeColor}
                onChange={(e) => onUpdate({ strokeColor: e.target.value })}
                className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer"
              />
            </div>
          </div>

          {/* Stroke width */}
          <div>
            <label className={labelClass}>Stroke Width: {block.strokeWidth}px</label>
            <input
              type="range" min={0} max={10} value={block.strokeWidth}
              onChange={(e) => onUpdate({ strokeWidth: Number(e.target.value) })}
              className="w-full accent-sky-500"
            />
          </div>

          {/* Bold, Italic, Align */}
          <div className="flex gap-1.5">
            <button
              onClick={() => onUpdate({ bold: !block.bold })}
              className={`flex-1 py-1.5 rounded-lg border transition-colors flex justify-center items-center ${
                block.bold
                  ? 'bg-sky-500 border-sky-500 text-white'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Bold size={14} />
            </button>
            <button
              onClick={() => onUpdate({ italic: !block.italic })}
              className={`flex-1 py-1.5 rounded-lg border transition-colors flex justify-center items-center ${
                block.italic
                  ? 'bg-sky-500 border-sky-500 text-white'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Italic size={14} />
            </button>
            {(['left', 'center', 'right'] as const).map((align) => {
              const Icon =
                align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
              return (
                <button
                  key={align}
                  onClick={() => onUpdate({ textAlign: align })}
                  className={`flex-1 py-1.5 rounded-lg border transition-colors flex justify-center items-center ${
                    block.textAlign === align
                      ? 'bg-sky-500 border-sky-500 text-white'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <Icon size={14} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TextControls({
  textBlocks, selectedId, onSelectBlock, onAddBlock, onDeleteBlock,
  onUpdateBlock, onImageUpload, onDownload, onSave, onReset,
}: TextControlsProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  const handleFileUpload = async (file: File) => {
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

  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm max-h-[85vh] overflow-y-auto">

      {/* IMAGE */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">📁 Image</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-sky-400 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950 transition-colors text-sm font-medium disabled:opacity-60"
        >
          <Upload size={15} />
          {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Image'}
        </button>
        {uploading && <ProgressBar value={uploadProgress} />}
        {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
        <p className="text-xs text-zinc-400 text-center">or drag & drop image onto the canvas</p>
      </div>

      <div className="border-t border-zinc-100 dark:border-zinc-800" />

      {/* TEXT BLOCKS */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">✏️ Text Blocks</p>
          <button
            onClick={onAddBlock}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-colors"
          >
            <Plus size={13} /> Add Text
          </button>
        </div>

        {textBlocks.length === 0 && (
          <div className="text-center py-6 text-zinc-400">
            <p className="text-2xl mb-1">✏️</p>
<p className="text-xs">Click &quot;Add Text&quot; to add text anywhere on the meme</p>          </div>
        )}

        <div className="flex flex-col gap-2">
          {textBlocks.map((block) => (
            <BlockEditor
              key={block.id}
              block={block}
              isSelected={block.id === selectedId}
              onSelect={() => onSelectBlock(block.id)}
              onDelete={() => onDeleteBlock(block.id)}
              onUpdate={(patch) => onUpdateBlock(block.id, patch)}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-100 dark:border-zinc-800" />

      {/* ACTIONS */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">⚙️ Actions</p>
        <button
          onClick={onDownload}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white transition-colors text-sm font-medium"
        >
          <Download size={15} /> Download PNG
        </button>
        {user && (
          <button
            onClick={onSave}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-600 text-white transition-colors text-sm font-medium"
          >
            <Save size={15} /> Save to Collection
          </button>
        )}
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-red-300 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-sm font-medium"
        >
          Reset Canvas
        </button>
      </div>
    </div>
  );
}
  