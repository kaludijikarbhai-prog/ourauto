/**
 * Lead Lock Service - Prevent lead leakage
 * First dealer to claim → others blocked
 * Enterprise feature for dealer-centric platform
 */

import { supabase } from './supabase';

export type LeadStatus = 'available' | 'locked' | 'sold' | 'expired';

export interface LeadLock {
  id: string;
  car_id: string;
  dealer_id: string; // dealer who locked it
  locked_at: string;
  expires_at: string;
  status: LeadStatus;
  reason?: string; // why locked (interested, negotiating, etc)
}

export interface LeadLockWithDealerInfo extends LeadLock {
  dealer_name: string;
  dealer_phone: string;
  dealer_city: string;
}

/**
 * Check if lead is available for dealers to see
 */
export async function isLeadAvailable(carId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('lead_locks')
      .select('id')
      .eq('car_id', carId)
      .eq('status', 'locked')
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) throw error;
    return !data; // No active lock = available
  } catch (error) {
    console.error('Failed to check lead availability:', error);
    throw error;
  }
}

/**
 * Lock a lead (dealer claims it first)
 * Duration: 24 hours (configurable)
 */
export async function lockLead(
  carId: string,
  dealerId: string,
  reason: string = 'interested',
  durationHours: number = 24
): Promise<LeadLock> {
  try {
    // Check if lead is already locked
    const available = await isLeadAvailable(carId);
    if (!available) {
      throw new Error(
        'Lead already locked by another dealer. Please check back later.'
      );
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('lead_locks')
      .insert({
        car_id: carId,
        dealer_id: dealerId,
        status: 'locked',
        reason,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as LeadLock;
  } catch (error) {
    console.error('Failed to lock lead:', error);
    throw error;
  }
}

/**
 * Renew lead lock (dealer extends exclusivity)
 */
export async function renewLeadLock(
  lockId: string,
  dealerId: string,
  durationHours: number = 24
): Promise<LeadLock> {
  try {
    // Verify dealer owns this lock
    const { data: lock, error: fetchError } = await supabase
      .from('lead_locks')
      .select('*')
      .eq('id', lockId)
      .single();

    if (fetchError) throw fetchError;

    if (lock.dealer_id !== dealerId) {
      throw new Error('Only the lock owner can renew');
    }

    const now = new Date();
    const newExpiresAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('lead_locks')
      .update({
        expires_at: newExpiresAt.toISOString(),
      })
      .eq('id', lockId)
      .select()
      .single();

    if (error) throw error;
    return data as LeadLock;
  } catch (error) {
    console.error('Failed to renew lead lock:', error);
    throw error;
  }
}

/**
 * Release lead lock (dealer loses interest)
 */
export async function releaseLead(
  lockId: string,
  dealerId: string
): Promise<void> {
  try {
    // Verify dealer owns this lock
    const { data: lock, error: fetchError } = await supabase
      .from('lead_locks')
      .select('*')
      .eq('id', lockId)
      .single();

    if (fetchError) throw fetchError;

    if (lock.dealer_id !== dealerId) {
      throw new Error('Only the lock owner can release');
    }

    const { error } = await supabase
      .from('lead_locks')
      .update({
        status: 'available',
        expires_at: new Date().toISOString(),
      })
      .eq('id', lockId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to release lead:', error);
    throw error;
  }
}

/**
 * Mark lead as sold (deal completed)
 */
export async function markLeadAsSold(
  lockId: string,
  dealerId: string
): Promise<void> {
  try {
    // Verify dealer owns this lock
    const { data: lock, error: fetchError } = await supabase
      .from('lead_locks')
      .select('*')
      .eq('id', lockId)
      .single();

    if (fetchError) throw fetchError;

    if (lock.dealer_id !== dealerId) {
      throw new Error('Only the lock owner can mark as sold');
    }

    const { error } = await supabase
      .from('lead_locks')
      .update({
        status: 'sold',
        expires_at: new Date().toISOString(),
      })
      .eq('id', lockId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to mark lead as sold:', error);
    throw error;
  }
}

/**
 * Get active lock for a car
 */
export async function getActiveLock(carId: string): Promise<LeadLockWithDealerInfo | null> {
  try {
    const { data, error } = await supabase
      .from('lead_locks')
      .select(
        `
        *,
        dealer:dealer_id(name, phone, city)
      `
      )
      .eq('car_id', carId)
      .eq('status', 'locked')
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) throw error;

    if (!data) return null;

    return {
      id: data.id,
      car_id: data.car_id,
      dealer_id: data.dealer_id,
      locked_at: data.locked_at,
      expires_at: data.expires_at,
      status: data.status,
      reason: data.reason,
      dealer_name: data.dealer?.name,
      dealer_phone: data.dealer?.phone,
      dealer_city: data.dealer?.city,
    } as LeadLockWithDealerInfo;
  } catch (error) {
    console.error('Failed to get active lock:', error);
    throw error;
  }
}

/**
 * Get dealer's locked leads
 */
export async function getDealerLockedLeads(dealerId: string): Promise<LeadLock[]> {
  try {
    const { data, error } = await supabase
      .from('lead_locks')
      .select('*')
      .eq('dealer_id', dealerId)
      .eq('status', 'locked')
      .gt('expires_at', new Date().toISOString())
      .order('locked_at', { ascending: false });

    if (error) throw error;
    return data as LeadLock[];
  } catch (error) {
    console.error('Failed to fetch dealer locked leads:', error);
    throw error;
  }
}

/**
 * Auto-cleanup expired locks (runs as scheduled job)
 */
export async function cleanupExpiredLocks(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('lead_locks')
      .update({ status: 'expired' })
      .lt('expires_at', new Date().toISOString())
      .eq('status', 'locked')
      .select();

    if (error) throw error;
    return data?.length || 0;
  } catch (error) {
    console.error('Failed to cleanup expired locks:', error);
    throw error;
  }
}
