'use client';

import {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useState,
} from 'react';

export interface MemeCanvasRef {
  downloadPng: () => void;
}

export interface TextBlock {
  id: string;
  text: string;
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  fontFamily: string;
  fontSize: number;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  textAlign: CanvasTextAlign;
  bold: boolean;
  italic: boolean;
}

export interface MemeCanvasProps {
  imageUrl: string | null;
  textBlocks: TextBlock[];
  selectedId: string | null;
  onSelectBlock: (id: string) => void;
  onMoveBlock: (id: string, x: number, y: number) => void;
  onDrop: (file: File) => void;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

const MemeCanvas = forwardRef<MemeCanvasRef, MemeCanvasProps>(
  ({ imageUrl, textBlocks, selectedId, onSelectBlock, onMoveBlock, onDrop }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dragging, setDragging] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragOver, setIsDragOver] = useState(false);
    const loadedImageRef = useRef<HTMLImageElement | null>(null);

    // Draw everything
    const draw = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background / image
      if (loadedImageRef.current) {
        ctx.drawImage(loadedImageRef.current, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#3f3f46';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Drop image here or upload', canvas.width / 2, canvas.height / 2);
      }

      // Draw text blocks
      textBlocks.forEach((block) => {
        if (!block.text.trim()) return;
        const px = block.x * canvas.width;
        const py = block.y * canvas.height;
        const fontStr = `${block.italic ? 'italic ' : ''}${block.bold ? 'bold ' : ''}${block.fontSize}px ${block.fontFamily}`;
        ctx.font = fontStr;
        ctx.textAlign = block.textAlign;
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = block.strokeColor;
        ctx.lineWidth = block.strokeWidth;
        ctx.lineJoin = 'round';
        ctx.fillStyle = block.textColor;

        const maxW = canvas.width - 40;
        const lines = wrapText(ctx, block.text, maxW);
        const lineH = block.fontSize * 1.25;
        const totalH = lines.length * lineH;
        const startY = py - totalH / 2 + lineH / 2;

        lines.forEach((line, i) => {
          const y = startY + i * lineH;
          if (block.strokeWidth > 0) ctx.strokeText(line, px, y);
          ctx.fillText(line, px, y);
        });

        // Selection indicator
        if (block.id === selectedId) {
          const metrics = ctx.measureText(lines[0]);
          const w = Math.min(metrics.width + 20, maxW + 20);
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 3]);
          ctx.strokeRect(px - w / 2, py - totalH / 2 - 6, w, totalH + 12);
          ctx.setLineDash([]);
        }
      });
    }, [imageUrl, textBlocks, selectedId]);

    // Load image when URL changes
    useEffect(() => {
      if (!imageUrl) {
        loadedImageRef.current = null;
        draw();
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        loadedImageRef.current = img;
        draw();
      };
      img.onerror = () => {
        loadedImageRef.current = null;
        draw();
      };
      img.src = imageUrl;
    }, [imageUrl]);

    useEffect(() => {
      draw();
    }, [draw]);

    // Get canvas-relative normalized position
    const getNormPos = (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      let clientX: number, clientY: number;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      return {
        x: ((clientX - rect.left) * scaleX) / canvas.width,
        y: ((clientY - rect.top) * scaleY) / canvas.height,
      };
    };

    // Hit test — find which block was clicked
    const hitTest = (normX: number, normY: number): string | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      for (let i = textBlocks.length - 1; i >= 0; i--) {
        const b = textBlocks[i];
        const fontStr = `${b.italic ? 'italic ' : ''}${b.bold ? 'bold ' : ''}${b.fontSize}px ${b.fontFamily}`;
        ctx.font = fontStr;
        const lines = wrapText(ctx, b.text || ' ', canvas.width - 40);
        const lineH = b.fontSize * 1.25;
        const totalH = lines.length * lineH;
        const hitW = 0.3;
        const hitH = (totalH + 20) / canvas.height;
        if (
          Math.abs(normX - b.x) < hitW / 2 &&
          Math.abs(normY - b.y) < hitH / 2
        ) {
          return b.id;
        }
      }
      return null;
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      const pos = getNormPos(e);
      const hit = hitTest(pos.x, pos.y);
      if (hit) {
        const block = textBlocks.find((b) => b.id === hit)!;
        setDragging(hit);
        setDragOffset({ x: pos.x - block.x, y: pos.y - block.y });
        onSelectBlock(hit);
      } else {
        // deselect — don't pass empty string, just pick nothing
      }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!dragging) return;
      const pos = getNormPos(e);
      onMoveBlock(dragging, pos.x - dragOffset.x, pos.y - dragOffset.y);
    };

    const handleMouseUp = () => setDragging(null);

    // Drag & drop file
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    };
    const handleDragLeave = () => setIsDragOver(false);
    const handleFileDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) onDrop(file);
    };

    useImperativeHandle(ref, () => ({
      downloadPng() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        // Redraw without selection box
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `meme-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }, 'image/png');
      },
    }));

    return (
      <div className="relative w-full max-w-[600px]">
        {isDragOver && (
          <div className="absolute inset-0 z-10 rounded-xl bg-sky-400/20 border-2 border-dashed border-sky-400 flex items-center justify-center pointer-events-none">
            <p className="text-sky-400 font-bold text-lg">Drop image here</p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-lg cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleFileDrop}
        />
        <p className="text-center text-xs text-zinc-400 mt-2">
          Click text to select • Drag to reposition • Drop image to change
        </p>
      </div>
    );
  }
);

MemeCanvas.displayName = 'MemeCanvas';
export default MemeCanvas;
