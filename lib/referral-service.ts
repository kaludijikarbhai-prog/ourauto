/**
 * Referral Service - User acquisition & reward system
 * Generate referral codes, track referrals, award bonuses
 */

import { supabase } from './supabase';
import { addCredits } from './wallet-service';

export interface ReferralLink {
  id: string;
  referrer_id: string;
  code: string;
  total_referrals: number;
  total_bonus_earned: number;
  created_at: string;
}

export interface ReferralHistory {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  referral_code: string;
  bonus_amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

const REFERRAL_BONUS = 25000; // 250 credits (in paise)

/**
 * Generate unique referral code for user
 * Format: USER_XXXX (e.g., JOHN_A1K2)
 */
export async function generateReferralCode(
  userId: string,
  userName: string
): Promise<ReferralLink> {
  try {
    // Check if user already has referral link
    const existing = await getUserReferralLink(userId);
    if (existing) return existing;

    // Generate unique code
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `${userName.substring(0, 4).toUpperCase()}_${randomPart}`;

    const { data, error } = await supabase
      .from('referral_links')
      .insert({
        referrer_id: userId,
        code,
      })
      .select()
      .single();

    if (error) throw error;
    return data as ReferralLink;
  } catch (error) {
    console.error('Failed to generate referral code:', error);
    throw error;
  }
}

/**
 * Get user's referral link
 */
export async function getUserReferralLink(
  userId: string
): Promise<ReferralLink | null> {
  try {
    const { data, error } = await supabase
      .from('referral_links')
      .select('*')
      .eq('referrer_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data as ReferralLink | null;
  } catch (error) {
    console.error('Failed to fetch referral link:', error);
    return null;
  }
}

/**
 * Apply referral code when user signs up
 */
export async function applyReferralCode(
  newUserId: string,
  referralCode: string
): Promise<ReferralHistory> {
  try {
    // Find referral link
    const { data: refLink, error: refError } = await supabase
      .from('referral_links')
      .select('referrer_id')
      .eq('code', referralCode)
      .maybeSingle();

    if (refError && refError.code !== 'PGRST116') throw refError;
    if (!refLink) {
      throw new Error('Invalid referral code');
    }

    const referrerId = refLink.referrer_id;

    // Create referral history record
    const { data: history, error: historyError } = await supabase
      .from('referral_history')
      .insert({
        referrer_id: referrerId,
        referred_user_id: newUserId,
        referral_code: referralCode,
        bonus_amount: REFERRAL_BONUS,
        status: 'pending',
      })
      .select()
      .single();

    if (historyError) throw historyError;

    return history as ReferralHistory;
  } catch (error) {
    console.error('Failed to apply referral code:', error);
    throw error;
  }
}

/**
 * Complete referral (user signs up and verifies email)
 * Awards bonus to referrer
 */
export async function completeReferral(referralId: string): Promise<void> {
  try {
    // Get referral details
    const { data: referral, error: fetchError } = await supabase
      .from('referral_history')
      .select('*')
      .eq('id', referralId)
      .single();

    if (fetchError) throw fetchError;

    if (referral.status !== 'pending') {
      throw new Error('Referral already processed');
    }

    // Award bonus to referrer
    await addCredits(
      referral.referrer_id,
      referral.bonus_amount,
      'referral_bonus',
      `Referral bonus for ${referral.referred_user_id}`,
      referral.id
    );

    // Mark as completed
    await supabase
      .from('referral_history')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', referralId);

    // Increment total_referrals count
    await supabase
      .from('referral_links')
      .update({
        total_referrals: referral.bonus_amount ? (referral.bonus_amount / REFERRAL_BONUS) + 1 : 1,
        total_bonus_earned: referral.bonus_amount,
      })
      .eq('referrer_id', referral.referrer_id);
  } catch (error) {
    console.error('Failed to complete referral:', error);
    throw error;
  }
}

/**
 * Get user's referral stats
 */
export async function getReferralStats(userId: string): Promise<{
  code: string;
  totalReferrals: number;
  totalBonusEarned: number;
  pendingReferrals: number;
  completedReferrals: number;
  referralUrl: string;
}> {
  try {
    const link = await getUserReferralLink(userId);
    if (!link) {
      throw new Error('No referral link found');
    }

    const { data: history, error } = await supabase
      .from('referral_history')
      .select('status')
      .eq('referrer_id', userId);

    if (error) throw error;

    const completed = history?.filter((h) => h.status === 'completed').length || 0;
    const pending = history?.filter((h) => h.status === 'pending').length || 0;

    return {
      code: link.code,
      totalReferrals: link.total_referrals,
      totalBonusEarned: link.total_bonus_earned,
      pendingReferrals: pending,
      completedReferrals: completed,
      referralUrl: `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${link.code}`,
    };
  } catch (error) {
    console.error('Failed to get referral stats:', error);
    throw error;
  }
}

/**
 * Get all referrals made by user
 */
export async function getUserReferrals(
  userId: string,
  status?: 'pending' | 'completed' | 'failed'
): Promise<ReferralHistory[]> {
  try {
    let query = supabase
      .from('referral_history')
      .select('*')
      .eq('referrer_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as ReferralHistory[];
  } catch (error) {
    console.error('Failed to fetch user referrals:', error);
    throw error;
  }
}

/**
 * Get top referrers (leaderboard)
 */
export async function getTopReferrers(limit: number = 10): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('top_referrers')
      .select('*')
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch top referrers:', error);
    return [];
  }
}

/**
 * Create referral for friend (immediate)
 * Used when dealer invites another dealer manually
 */
export async function createManualReferral(
  referrerId: string,
  referredUserId: string,
  referralCode: string
): Promise<ReferralHistory> {
  try {
    const { data, error } = await supabase
      .from('referral_history')
      .insert({
        referrer_id: referrerId,
        referred_user_id: referredUserId,
        referral_code: referralCode,
        bonus_amount: REFERRAL_BONUS,
        status: 'completed', // Auto-complete for manual referrals
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Immediately award bonus
    await addCredits(
      referrerId,
      REFERRAL_BONUS,
      'referral_bonus',
      `Manual referral for ${referredUserId}`
    );

    return data as ReferralHistory;
  } catch (error) {
    console.error('Failed to create manual referral:', error);
    throw error;
  }
}
