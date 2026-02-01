/**
 * Wishlist service
 */

import { supabase } from './supabase';
import { getUser } from './auth';
import { Wishlist, WishlistWithCar, ApiResponse } from './types';

/**
 * Add car to wishlist
 */
export async function addToWishlist(carId: string): Promise<ApiResponse<Wishlist>> {
  try {
    const user = await getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('wishlists')
      .insert([{ user_id: user.id, car_id: carId }])
      .select()
      .single();

    if (error) {
      // If unique constraint violated, already in wishlist
      if (error.code === '23505') {
        return { error: 'Already in wishlist' };
      }
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    console.error('Add to wishlist error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to add to wishlist' };
  }
}

/**
 * Remove car from wishlist
 */
export async function removeFromWishlist(carId: string): Promise<ApiResponse<null>> {
  try {
    const user = await getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('car_id', carId);

    if (error) {
      return { error: error.message };
    }

    return { data: null };
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to remove from wishlist' };
  }
}

/**
 * Get user's wishlist
 */
export async function getUserWishlist(): Promise<WishlistWithCar[]> {
  try {
    const user = await getUser();
    if (!user) {
      return [];
    }

    const { data: wishlists, error: wishError } = await supabase
      .from('wishlists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (wishError) {
      console.error('Get wishlist error:', wishError);
      return [];
    }

    if (!wishlists || wishlists.length === 0) {
      return [];
    }

    // Get car details
    const carIds = wishlists.map((w: any) => w.car_id);
    const { data: cars } = await supabase
      .from('cars')
      .select('*')
      .in('id', carIds);

    const carMap = new Map(cars?.map((c: any) => [c.id, c]) || []);

    return wishlists
      .map((w: any) => ({
        ...w,
        car: carMap.get(w.car_id),
      }))
      .filter((w: any) => w.car) as WishlistWithCar[];
  } catch (error) {
    console.error('Get wishlist error:', error);
    return [];
  }
}

/**
 * Check if car is in wishlist
 */
export async function isInWishlist(carId: string): Promise<boolean> {
  try {
    const user = await getUser();
    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('car_id', carId)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Check wishlist error:', error);
    return false;
  }
}

/**
 * Get wishlist count
 */
export async function getWishlistCount(): Promise<number> {
  try {
    const user = await getUser();
    if (!user) {
      return 0;
    }

    const { count, error } = await supabase
      .from('wishlists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return !error && count ? count : 0;
  } catch (error) {
    console.error('Get wishlist count error:', error);
    return 0;
  }
}
