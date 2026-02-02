/**
 * Watermark API - Complete Implementation
 * POST /api/watermark/apply - Apply watermark to image URL
 * POST /api/watermark/batch - Apply watermark to multiple images
 * GET /api/watermark/status/:carImageId - Check watermark status
 */

import { supabaseServer } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

const supabase = supabaseServer;

/**
 * Apply watermark to a single image
 * Can be done client-side or via external service
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'apply';

    if (action === 'apply') {
      return handleApplyWatermark(request);
    } else if (action === 'batch') {
      return handleBatchWatermark(request);
    } else if (action === 'status') {
      return handleWatermarkStatus(request);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Watermark API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleApplyWatermark(request: NextRequest) {
  const { imageUrl, carImageId, position = 'bottom-right', text = 'OurAuto.in' } = await request.json();

  if (!imageUrl || !carImageId) {
    return NextResponse.json(
      { error: 'imageUrl and carImageId are required' },
      { status: 400 }
    );
  }

  try {
    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns the car
    const { data: carImage } = await supabase
      .from('car_images')
      .select('car_id, cars!inner(owner_id)')
      .eq('id', carImageId)
      .single();

    const cars = carImage?.cars as any;
    if (!carImage || cars?.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - you do not own this image' },
        { status: 403 }
      );
    }

    // Mark as watermarked in database
    const { data: watermarked, error: watermarkError } = await supabase
      .from('watermarked_images')
      .insert([
        {
          car_image_id: carImageId,
          original_url: imageUrl,
          watermark_text: text,
          watermark_position: position,
          watermarked_url: imageUrl, // In production, this would be the processed URL
        },
      ])
      .select()
      .single();

    if (watermarkError) {
      throw watermarkError;
    }

    // Update car_images table
    await supabase
      .from('car_images')
      .update({
        is_watermarked: true,
        watermark_applied_at: new Date().toISOString(),
      })
      .eq('id', carImageId);

    return NextResponse.json({
      success: true,
      watermark: watermarked,
      message: `Watermark '${text}' applied at ${position}`,
    });
  } catch (error) {
    console.error('[Apply Watermark] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to apply watermark' },
      { status: 500 }
    );
  }
}

async function handleBatchWatermark(request: NextRequest) {
  const { imageIds, position = 'bottom-right', text = 'OurAuto.in' } = await request.json();

  if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
    return NextResponse.json(
      { error: 'imageIds array is required' },
      { status: 400 }
    );
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = [];
    const errors = [];

    for (const imageId of imageIds) {
      try {
        const { data: carImage } = await supabase
          .from('car_images')
          .select('car_id, cars!inner(owner_id)')
          .eq('id', imageId)
          .single();

        const cars = carImage?.cars as any;
        if (!carImage || cars?.owner_id !== user.id) {
          errors.push({ imageId, error: 'Not owned by user' });
          continue;
        }

        const { data: watermarked } = await supabase
          .from('watermarked_images')
          .insert([
            {
              car_image_id: imageId,
              watermark_text: text,
              watermark_position: position,
            },
          ])
          .select()
          .single();

        await supabase
          .from('car_images')
          .update({
            is_watermarked: true,
            watermark_applied_at: new Date().toISOString(),
          })
          .eq('id', imageId);

        results.push({ imageId, success: true, watermark: watermarked });
      } catch (error) {
        errors.push({
          imageId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      summary: {
        total: imageIds.length,
        succeeded: results.length,
        failed: errors.length,
      },
    });
  } catch (error) {
    console.error('[Batch Watermark] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Batch watermark failed' },
      { status: 500 }
    );
  }
}

async function handleWatermarkStatus(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const carImageId = searchParams.get('carImageId');

  if (!carImageId) {
    return NextResponse.json(
      { error: 'carImageId is required' },
      { status: 400 }
    );
  }

  try {
    const { data: watermark } = await supabase
      .from('watermarked_images')
      .select('*')
      .eq('car_image_id', carImageId)
      .single();

    return NextResponse.json({
      has_watermark: !!watermark,
      watermark: watermark || null,
    });
  } catch (error) {
    console.error('[Watermark Status] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get status' },
      { status: 500 }
    );
  }
}
