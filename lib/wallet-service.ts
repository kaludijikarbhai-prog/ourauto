/**
 * Wallet Service - User credit management
 * Track balance, add credits, deduct for purchases
 * Enterprise-grade transaction logging
 */

import { supabase } from './supabase-client';

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 
  | 'inspection_complete' // Gift from completing inspection
  | 'referral_bonus' // Referral reward
  | 'manual_credit' // Admin manual add
  | 'subscription_payment' // Payment for subscription
  | 'listing_boost' // Payment for feature boost
  | 'refund'; // Refund transaction

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  reference_id?: string; // inspection_id, referral_id, etc
  created_at: string;
}

/**
 * Get user's wallet
 */
export async function getWallet(userId: string): Promise<Wallet> {
  try {
    // use supabase-client for client-side usage
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Wallet doesn't exist, create it
      return await initializeWallet(userId);
    }

    if (error) throw error;
    return data as Wallet;
  } catch (error) {
    console.error('Failed to fetch wallet:', error);
    throw error;
  }
}

/**
 * Initialize new wallet for user
 */
export async function initializeWallet(userId: string): Promise<Wallet> {
  try {
    const { data, error } = await supabase
      .from('wallets')
      .insert({
        user_id: userId,
        balance: 0,
        total_earned: 0,
        total_spent: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Wallet;
  } catch (error) {
    console.error('Failed to initialize wallet:', error);
    throw error;
  }
}

/**
 * Add credits to wallet (gift, referral, refund, etc)
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: TransactionType,
  description: string,
  referenceId?: string
): Promise<WalletTransaction> {
  try {
    // Get current balance
    const wallet = await getWallet(userId);
    const newBalance = wallet.balance + amount;

    // Record transaction
    const { data, error } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        type,
        amount,
        balance_before: wallet.balance,
        balance_after: newBalance,
        description,
        reference_id: referenceId,
      })
      .select()
      .single();

    if (error) throw error;

    // Update wallet
    await supabase
      .from('wallets')
      .update({
        balance: newBalance,
        total_earned: wallet.total_earned + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    return data as WalletTransaction;
  } catch (error) {
    console.error('Failed to add credits:', error);
    throw error;
  }
}

/**
 * Deduct credits from wallet (purchase, subscription, etc)
 * Returns false if insufficient balance
 */
export async function deductCredits(
  userId: string,
  amount: number,
  type: TransactionType,
  description: string,
  referenceId?: string
): Promise<WalletTransaction | null> {
  try {
    // Get current balance
    const wallet = await getWallet(userId);

    if (wallet.balance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    const newBalance = wallet.balance - amount;

    // Record transaction
    const { data, error } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        type,
        amount: -amount, // Negative for deduction
        balance_before: wallet.balance,
        balance_after: newBalance,
        description,
        reference_id: referenceId,
      })
      .select()
      .single();

    if (error) throw error;

    // Update wallet
    await supabase
      .from('wallets')
      .update({
        balance: newBalance,
        total_spent: wallet.total_spent + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    return data as WalletTransaction;
  } catch (error) {
    console.error('Failed to deduct credits:', error);
    throw error;
  }
}

/**
 * Get transaction history
 */
export async function getTransactionHistory(
  userId: string,
  limit: number = 50
): Promise<WalletTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as WalletTransaction[];
  } catch (error) {
    console.error('Failed to fetch transaction history:', error);
    throw error;
  }
}

/**
 * Check if user has sufficient balance
 */
export async function hasSufficientBalance(
  userId: string,
  amount: number
): Promise<boolean> {
  try {
    const wallet = await getWallet(userId);
    return wallet.balance >= amount;
  } catch (error) {
    console.error('Failed to check balance:', error);
    return false;
  }
}

/**
 * Get wallet stats for user
 */
export async function getWalletStats(userId: string): Promise<{
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  lastTransaction?: WalletTransaction;
}> {
  try {
    const wallet = await getWallet(userId);
    const transactions = await getTransactionHistory(userId, 1);

    return {
      currentBalance: wallet.balance,
      totalEarned: wallet.total_earned,
      totalSpent: wallet.total_spent,
      lastTransaction: transactions[0],
    };
  } catch (error) {
    console.error('Failed to get wallet stats:', error);
    throw error;
  }
}

/**
 * Refund credits (admin only)
 */
export async function refundCredits(
  userId: string,
  amount: number,
  reason: string
): Promise<WalletTransaction> {
  return addCredits(userId, amount, 'refund', `Refund: ${reason}`);
}

/**
 * Award inspection bonus
 */
export async function awardInspectionBonus(
  userId: string,
  inspectionId: string,
  bonusAmount: number = 100 // 100 credits default
): Promise<WalletTransaction> {
  return addCredits(
    userId,
    bonusAmount,
    'inspection_complete',
    'Inspection completed successfully',
    inspectionId
  );
}

/**
 * Award referral bonus
 */
export async function awardReferralBonus(
  referrerId: string,
  referralId: string,
  bonusAmount: number = 250 // 250 credits default
): Promise<WalletTransaction> {
  return addCredits(
    referrerId,
    bonusAmount,
    'referral_bonus',
    'Referral bonus earned',
    referralId
  );
}
