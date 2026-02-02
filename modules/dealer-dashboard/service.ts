/**
 * Dealer Dashboard Service
 * 
 * Core functions for dealer operations
 */

import { supabaseServer } from '@/lib/supabase-server';
import type { DealerProfile, DealerStats } from './types';


export async function getDealerProfile(userId: string): Promise<DealerProfile | null> {
  const { data, error } = await supabaseServer
    .from('dealer_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) {
    console.error('Error fetching dealer profile:', error);
    return null;
  }
  return data;
}

export async function createDealerProfile(
  userId: string,
  profile: Omit<DealerProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<DealerProfile | null> {

  const supabase = supabaseServer;
  const { data, error } = await supabase
    .from('dealer_profiles')
    .insert([{ user_id: userId, ...profile } as never])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getDealerStats(_userId: string): Promise<DealerStats | null> {
  // TODO: Implement based on your database schema and userId
  // This is a placeholder returning default values
  return {
    totalListings: 0,
    activeListings: 0,
    soldThisMonth: 0,
    totalViews: 0,
    avgListingTime: 0,
  };
}
