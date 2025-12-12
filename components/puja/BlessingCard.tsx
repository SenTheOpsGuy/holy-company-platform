'use client';

import { useEffect, useRef, useState } from 'react';
import { DEITIES, AFFIRMATIONS } from '@/lib/constants';
// import { generateBlessingImage } from '@/lib/blob';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface BlessingCardProps {
  deity: typeof DEITIES[0];
  punyaEarned: number;
  onShare?: () => void;
  onDownload?: () => void;
  className?: string;
}

export default function BlessingCard({
  deity,
  punyaEarned,
  onShare,
  onDownload,
  className
}: BlessingCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const affirmation = AFFIRMATIONS.find(a => a.deity === deity.id)?.text || 'Blessings flow to you';

  useEffect(() => {
    generateCard();
  }, [deity, punyaEarned]);

  const generateCard = async () => {
    if (!canvasRef.current) return;

    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 800;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#FFF8E1');
    gradient.addColorStop(0.5, '#FFFDF7');
    gradient.addColorStop(1, deity.color + '20');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = deity.color;
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Decorative corners
    drawCornerDecoration(ctx, 40, 40, deity.color);
    drawCornerDecoration(ctx, canvas.width - 80, 40, deity.color);
    drawCornerDecoration(ctx, 40, canvas.height - 80, deity.color);
    drawCornerDecoration(ctx, canvas.width - 80, canvas.height - 80, deity.color);

    // Title
    ctx.fillStyle = '#5D4037';
    ctx.font = 'bold 48px serif';
    ctx.textAlign = 'center';
    ctx.fillText('Divine Blessing', canvas.width / 2, 120);

    // Deity name
    ctx.font = 'bold 36px serif';
    ctx.fillStyle = deity.color;
    ctx.fillText(`From ${deity.name}`, canvas.width / 2, 180);

    // Deity emoji (large)
    ctx.font = '120px serif';
    ctx.fillText(deity.icon, canvas.width / 2, 320);

    // Affirmation
    ctx.fillStyle = '#5D4037';
    ctx.font = '28px serif';
    ctx.textAlign = 'center';
    const words = affirmation.split(' ');
    let line = '';
    const lines = [];
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > canvas.width - 120 && line !== '') {
        lines.push(line);
        line = word + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    const startY = 420;
    lines.forEach((line, index) => {
      ctx.fillText(line.trim(), canvas.width / 2, startY + (index * 40));
    });

    // Punya earned
    ctx.fillStyle = deity.color;
    ctx.font = 'bold 32px serif';
    ctx.fillText(`+${punyaEarned} Punya Points`, canvas.width / 2, startY + (lines.length * 40) + 80);

    // Footer
    ctx.fillStyle = '#8D6E63';
    ctx.font = '20px serif';
    ctx.fillText('The Holy Company', canvas.width / 2, canvas.height - 80);
    
    const currentDate = new Date().toLocaleDateString('en-IN');
    ctx.font = '16px serif';
    ctx.fillText(currentDate, canvas.width / 2, canvas.height - 50);

    // Convert to blob and create URL
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      }
      setIsGenerating(false);
    }, 'image/png');
  };

  const drawCornerDecoration = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 20, y);
    ctx.lineTo(x + 20, y + 5);
    ctx.lineTo(x + 5, y + 5);
    ctx.lineTo(x + 5, y + 20);
    ctx.lineTo(x, y + 20);
    ctx.closePath();
    ctx.fill();
  };

  const handleShare = async () => {
    if (!imageUrl || !navigator.share) {
      // Fallback: copy link or show modal
      onShare?.();
      return;
    }

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `blessing-${deity.id}.png`, { type: 'image/png' });

      await navigator.share({
        title: `Divine Blessing from ${deity.name}`,
        text: affirmation,
        files: [file]
      });
    } catch (error) {
      console.error('Error sharing:', error);
      onShare?.();
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.download = `blessing-${deity.id}-${Date.now()}.png`;
    link.href = imageUrl;
    link.click();

    onDownload?.();
  };

  return (
    <div className={cn(
      'bg-white rounded-2xl p-6 shadow-lg border-2',
      `border-[${deity.color}]/30`,
      className
    )}>
      {/* Canvas (hidden) */}
      <canvas
        ref={canvasRef}
        className="hidden"
        width={600}
        height={800}
      />

      {/* Preview */}
      <div className="text-center mb-6">
        <h3 className="font-playfair text-2xl font-bold text-deep-brown mb-2">
          Your Divine Blessing
        </h3>
        <p className="text-deep-brown/70">
          Share your spiritual journey with others
        </p>
      </div>

      {/* Blessing Card Preview */}
      {imageUrl ? (
        <div className="relative mb-6">
          <img
            src={imageUrl}
            alt={`Blessing from ${deity.name}`}
            className="w-full max-w-xs mx-auto rounded-lg shadow-md"
          />
          {isGenerating && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="text-white text-sm">Generating...</div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-6">
          <div className="text-gray-500">
            {isGenerating ? 'Generating blessing card...' : 'Loading...'}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <Button
          onClick={handleShare}
          variant="divine"
          disabled={!imageUrl || isGenerating}
          className="flex-1"
        >
          📤 Share
        </Button>
        <Button
          onClick={handleDownload}
          variant="outline"
          disabled={!imageUrl || isGenerating}
          className="flex-1"
        >
          💾 Save
        </Button>
      </div>

      {/* Blessing Text */}
      <div className="mt-6 p-4 bg-gradient-to-r from-saffron/10 to-gold/10 rounded-lg border border-saffron/30">
        <p className="text-center font-medium text-deep-brown italic">
          "{affirmation}"
        </p>
        <p className="text-center text-sm text-deep-brown/60 mt-2">
          - {deity.name}, {deity.subtitle}
        </p>
      </div>
    </div>
  );
}