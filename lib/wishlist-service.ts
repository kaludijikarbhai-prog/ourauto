/**
 * Wishlist service
 */




// All wishlist functions are disabled due to missing getUser implementation
export function addToWishlist() {
  throw new Error('addToWishlist is temporarily disabled: missing getUser implementation');
}


export async function removeFromWishlist(carId: string): Promise<void> {
  // temporary stub, does nothing
  return;
}


import type { WishlistWithCar } from './types';

export async function getUserWishlist(userId: string): Promise<WishlistWithCar[]> {
  try {
    // temporary safe stub
    return [];
  } catch {
    return [];
  }
}

export function isInWishlist() {
  throw new Error('isInWishlist is temporarily disabled: missing getUser implementation');
}

export function getWishlistCount() {
  throw new Error('getWishlistCount is temporarily disabled: missing getUser implementation');
}
