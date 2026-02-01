/**
 * Watermark Service - Anti-bypass image protection
 * Adds OurAuto.in watermark to car images on upload
 */

export interface WatermarkOptions {
  text: string;
  fontSize?: number;
  opacity?: number;
  position?: 'bottom-right' | 'bottom-left' | 'center' | 'top-right';
  color?: string;
}

/**
 * Add watermark to image using Canvas API
 * Server-side: Use canvas library (node-canvas)
 * Client-side: Use HTML5 Canvas
 */
export async function addWatermarkToImage(
  imageUrl: string,
  options: WatermarkOptions = {
    text: 'OurAuto.in',
    fontSize: 32,
    opacity: 0.7,
    position: 'bottom-right',
    color: 'rgba(255, 255, 255, 0.8)',
  }
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Apply watermark
        ctx.globalAlpha = options.opacity || 0.7;
        ctx.fillStyle = options.color || 'rgba(255, 255, 255, 0.8)';
        ctx.font = `bold ${options.fontSize || 32}px Arial`;

        // Calculate position
        const padding = 20;
        let x = canvas.width - 200;
        let y = canvas.height - 50;

        switch (options.position) {
          case 'bottom-left':
            x = padding;
            y = canvas.height - padding;
            break;
          case 'center':
            x = canvas.width / 2 - 80;
            y = canvas.height / 2;
            break;
          case 'top-right':
            x = canvas.width - 200;
            y = padding + 30;
            break;
          case 'bottom-right':
          default:
            x = canvas.width - 200;
            y = canvas.height - padding;
        }

        ctx.fillText(options.text, x, y);

        // Reset global alpha
        ctx.globalAlpha = 1.0;

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert canvas to blob'));
            }
          },
          'image/jpeg',
          0.95
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = imageUrl;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Watermark multiple images
 */
export async function watermarkBatch(
  imageUrls: string[],
  options?: WatermarkOptions
): Promise<Blob[]> {
  return Promise.all(
    imageUrls.map((url) => addWatermarkToImage(url, options))
  );
}

/**
 * Check if image already has watermark
 * (Simple detection - can be enhanced)
 */
export function hasWatermark(imageUrl: string): boolean {
  // This is a placeholder - actual implementation would analyze image
  return imageUrl.includes('watermarked');
}
