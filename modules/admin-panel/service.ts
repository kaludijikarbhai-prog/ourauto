/**
 * Admin Service
 * 
 * Core functions for system administration
 */

import { supabaseServer } from '@/lib/supabase-server';
import type { SystemStats, DealerVerificationRequest, ModerationAction } from './types';

export async function getSystemStats(): Promise<SystemStats | null> {
  try {
    const supabase = supabaseServer;
    const [users, dealers, listings, transactions] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('dealer_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('car_listings').select('*', { count: 'exact', head: true }),
      supabase.from('transactions').select('*', { count: 'exact', head: true }),
    ]);

    return {
      totalUsers: users.count || 0,
      totalDealers: dealers.count || 0,
      totalListings: listings.count || 0,
      activeListings: listings.count || 0, // TODO: filter by status
      totalTransactions: transactions.count || 0,
      platformRevenue: 0, // TODO: calculate from transactions
      averageListingPrice: 0, // TODO: calculate from listings
    };
  } catch (err) {
    console.error('Error fetching system stats:', err);
    return null;
  }
}

export async function getVerificationRequests(): Promise<DealerVerificationRequest[]> {
  const supabase = supabaseServer;
  const { data, error } = await supabase
    .from('dealer_verification_requests')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching verification requests:', error);
    return [];
  }

  return data || [];
}

export async function reviewVerification(
  requestId: string,
  status: 'approved' | 'rejected',
  adminId: string,
  notes?: string
): Promise<DealerVerificationRequest | null> {
  const supabase = supabaseServer;
  const { data, error } = await supabase
    .from('dealer_verification_requests')
    .update({
      status,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      notes,
    } as never)
    .eq('id', requestId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createModerationAction(
  targetId: string,
  targetType: 'user' | 'listing' | 'message',
  action: 'warning' | 'suspension' | 'removal' | 'appeal_review',
  reason: string,
  adminId: string,
  expiresAt?: string
): Promise<ModerationAction | null> {

  const { data, error } = await supabaseServer
    .from('moderation_actions')
    .insert([
      {
        target_id: targetId,
        target_type: targetType,
        action,
        reason,
        admin_id: adminId,
        expires_at: expiresAt,
      } as never,
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getModerationHistory(targetId: string): Promise<ModerationAction[]> {

  const { data, error } = await supabaseServer
    .from('moderation_actions')
    .select('*')
    .eq('target_id', targetId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching moderation history:', error);
    return [];
  }

  return data || [];
}
