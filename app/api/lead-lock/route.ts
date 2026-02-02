/**
 * Lead Lock API - Dealer Exclusivity System
 * POST /api/lead-lock/claim - Dealer claims a car
 * GET /api/lead-lock/:carId - Check if car is locked
 * GET /api/lead-lock/dealer/locks - Get all dealer's active locks
 * DELETE /api/lead-lock/:lockId - Release a lock
 * GET /api/lead-lock/dealer/analytics - Get dealer lead analytics
 */

import { supabaseServer } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

const supabase = supabaseServer;

/**
 * GET /api/lead-lock
 * Check lock status or get dealer's locks
 */
export async function GET(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const carId = searchParams.get('carId');
    const action = searchParams.get('action') || 'check'; // 'check', 'my-locks', 'analytics'

    if (action === 'check' && carId) {
      return handleCheckLock(carId);
    } else if (action === 'my-locks') {
      return handleGetDealerLocks(user.id);
    } else if (action === 'analytics') {
      return handleGetAnalytics(user.id);
    }

    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Lead Lock GET] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get lock info' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lead-lock
 * Claim a car (create lock)
 */
export async function POST(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { carId, durationHours = 48, reason = 'Dealer interest' } = await request.json();

    if (!carId) {
      return NextResponse.json(
        { error: 'carId is required' },
        { status: 400 }
      );
    }

    // Verify user is dealer
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'dealer' && profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only dealers can claim leads' },
        { status: 403 }
      );
    }

    // Check if car exists
    const { data: car } = await supabase
      .from('cars')
      .select('id')
      .eq('id', carId)
      .single();

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }

    // Check if already locked
    const { data: existingLock } = await supabase
      .from('lead_locks')
      .select('*, dealer:profiles!dealer_id(name, phone)')
      .eq('car_id', carId)
      .eq('status', 'locked')
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (existingLock) {
      // If same dealer, extend it
      if (existingLock.dealer_id === user.id) {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + durationHours);

        const { data: updated, error } = await supabase
          .from('lead_locks')
          .update({ expires_at: expiresAt.toISOString() })
          .eq('id', existingLock.id)
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({
          success: true,
          lock: updated,
          action: 'extended',
          message: `Lock extended by ${durationHours} hours`,
        });
      }

      // Different dealer already has it
      return NextResponse.json(
        {
          error: 'Car is already claimed by another dealer',
          locked_by: existingLock.dealer?.name,
          expires_at: existingLock.expires_at,
        },
        { status: 409 }
      );
    }

    // Create new lock
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + durationHours);

    const { data: lock, error } = await supabase
      .from('lead_locks')
      .insert([
        {
          car_id: carId,
          dealer_id: user.id,
          status: 'locked',
          reason,
          expires_at: expiresAt.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violated
        const lock = await handleCheckLock(carId);
        return lock;
      }
      throw error;
    }

    // Log activity
    await supabase.from('lead_activity_logs').insert([
      {
        lead_lock_id: lock.id,
        dealer_id: user.id,
        car_id: carId,
        action: 'view',
        details: { reason },
      },
    ]);

    return NextResponse.json({
      success: true,
      lock,
      action: 'created',
      message: `Car claimed for ${durationHours} hours`,
    });
  } catch (error) {
    console.error('[Lead Lock POST] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to claim car' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/lead-lock/:id
 * Release a lock
 */
export async function DELETE(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lockId = searchParams.get('id');

    if (!lockId) {
      return NextResponse.json(
        { error: 'lockId is required' },
        { status: 400 }
      );
    }

    // Get lock
    const { data: lock } = await supabase
      .from('lead_locks')
      .select('*')
      .eq('id', lockId)
      .single();

    if (!lock) {
      return NextResponse.json(
        { error: 'Lock not found' },
        { status: 404 }
      );
    }

    // Verify permission (own lock or admin)
    if (lock.dealer_id !== user.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    // Release lock
    const { data: updated, error } = await supabase
      .from('lead_locks')
      .update({ status: 'available' })
      .eq('id', lockId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      lock: updated,
      message: 'Lock released',
    });
  } catch (error) {
    console.error('[Lead Lock DELETE] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to release lock' },
      { status: 500 }
    );
  }
}

// ============ HELPER FUNCTIONS ============

async function handleCheckLock(carId: string) {
  try {
    const { data: lock } = await supabase
      .from('lead_locks')
      .select('*, dealer:profiles!dealer_id(name, phone, city)')
      .eq('car_id', carId)
      .eq('status', 'locked')
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (!lock) {
      return NextResponse.json({
        is_locked: false,
        car_id: carId,
      });
    }

    return NextResponse.json({
      is_locked: true,
      car_id: carId,
      lock: {
        id: lock.id,
        dealer_name: lock.dealer?.name,
        dealer_phone: lock.dealer?.phone,
        expires_at: lock.expires_at,
        hours_remaining: Math.round(
          (new Date(lock.expires_at).getTime() - Date.now()) / 3600000
        ),
      },
    });
  } catch (error) {
    throw error;
  }
}

async function handleGetDealerLocks(dealerId: string) {
  try {
    const { data: locks, error } = await supabase
      .from('lead_locks')
      .select(`
        *,
        car:cars(id, title, brand, model, price, city)
      `)
      .eq('dealer_id', dealerId)
      .eq('status', 'locked')
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: locks?.length || 0,
      locks: locks || [],
    });
  } catch (error) {
    throw error;
  }
}

async function handleGetAnalytics(dealerId: string) {
  try {
    const [{ data: locks }, { data: activities }] = await Promise.all([
      supabase
        .from('lead_locks')
        .select('id')
        .eq('dealer_id', dealerId)
        .eq('status', 'locked')
        .gt('expires_at', new Date().toISOString()),
      supabase
        .from('lead_activity_logs')
        .select('action')
        .eq('dealer_id', dealerId),
    ]);

    const activityCounts: Record<string, number> = {};
    activities?.forEach((log: any) => {
      activityCounts[log.action] = (activityCounts[log.action] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      analytics: {
        total_active_locks: locks?.length || 0,
        total_activities: activities?.length || 0,
        activity_breakdown: activityCounts,
        top_actions: Object.entries(activityCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([action, count]) => ({ action, count })),
      },
    });
  } catch (error) {
    throw error;
  }
}
