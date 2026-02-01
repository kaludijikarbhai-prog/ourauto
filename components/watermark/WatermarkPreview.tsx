/**
 * Watermark Preview Component
 * Shows how image will look with watermark
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { addWatermarkToImage } from '@/lib/watermark-service';

interface WatermarkPreviewProps {
  imageUrl: string;
  onWatermarked?: (blob: Blob) => void;
  text?: string;
}

export default function WatermarkPreview({
  imageUrl,
  onWatermarked,
  text = 'OurAuto.in',
}: WatermarkPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) return;

    setLoading(true);
    setError(null);

    addWatermarkToImage(imageUrl, {
      text,
      fontSize: 32,
      opacity: 0.7,
      position: 'bottom-right',
    })
      .then((blob) => {
        // Create preview URL
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            canvasRef.current.width = img.width;
            canvasRef.current.height = img.height;
            ctx?.drawImage(img, 0, 0);
          }
          if (onWatermarked) {
            onWatermarked(blob);
          }
        };
        img.src = url;
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [imageUrl, text, onWatermarked]);

  return (
    <div className="space-y-4">
      <div className="relative rounded-lg border-2 border-blue-500 bg-gray-50 p-4">
        <canvas
          ref={canvasRef}
          className="max-h-96 w-full rounded-lg bg-white"
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
            <div className="text-white">Processing watermark...</div>
          </div>
        )}
      </div>
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}
      <p className="text-xs text-gray-600">
        ✓ Watermark protects your images from unauthorized use
      </p>
    </div>
  );
}
