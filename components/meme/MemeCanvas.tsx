'use client';

import {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';

export interface MemeCanvasRef {
  downloadPng: () => void;
}

export interface MemeTextConfig {
  topText: string;
  bottomText: string;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  textAlign: CanvasTextAlign;
}

interface MemeCanvasProps {
  imageUrl: string | null;
  config: MemeTextConfig;
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
  return lines;
}

const MemeCanvas = forwardRef<MemeCanvasRef, MemeCanvasProps>(
  ({ imageUrl, config }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const draw = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const render = (img: HTMLImageElement | null) => {
        if (img) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        } else {
          ctx.fillStyle = '#18181b';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#52525b';
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('No image selected', canvas.width / 2, canvas.height / 2);
        }

        const { topText, bottomText, fontFamily, fontSize, textColor, strokeColor, strokeWidth, textAlign } = config;
        const padding = 20;
        const lineHeight = fontSize * 1.2;

        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.textAlign = textAlign;
        ctx.textBaseline = 'top';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineJoin = 'round';
        ctx.fillStyle = textColor;

        let xPos = padding;
        if (textAlign === 'center') xPos = canvas.width / 2;
        else if (textAlign === 'right') xPos = canvas.width - padding;

        if (topText.trim()) {
          const lines = wrapText(ctx, topText.toUpperCase(), canvas.width - padding * 2);
          lines.forEach((line, i) => {
            const y = padding + i * lineHeight;
            if (strokeWidth > 0) ctx.strokeText(line, xPos, y);
            ctx.fillText(line, xPos, y);
          });
        }

        if (bottomText.trim()) {
          ctx.textBaseline = 'bottom';
          const lines = wrapText(ctx, bottomText.toUpperCase(), canvas.width - padding * 2);
          const totalHeight = lines.length * lineHeight;
          lines.forEach((line, i) => {
            const y = canvas.height - padding - totalHeight + (i + 1) * lineHeight;
            if (strokeWidth > 0) ctx.strokeText(line, xPos, y);
            ctx.fillText(line, xPos, y);
          });
        }
      };

      if (imageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => render(img);
        img.onerror = () => render(null);
        img.src = imageUrl;
      } else {
        render(null);
      }
    }, [imageUrl, config]);

    useEffect(() => {
      draw();
    }, [draw]);

    useImperativeHandle(ref, () => ({
      downloadPng() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'meme.png';
          a.click();
          URL.revokeObjectURL(url);
        }, 'image/png');
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className="w-full max-w-[600px] rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-lg"
      />
    );
  }
);

MemeCanvas.displayName = 'MemeCanvas';
export default MemeCanvas;
