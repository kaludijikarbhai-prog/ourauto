/**
 * Car Listing Service
 * 
 * Core functions for managing vehicle listings
 */


import { supabaseServer } from '@/lib/supabase-server';
import type { CarListing, ListingFilter } from './types';

export async function getListings(filter: ListingFilter): Promise<CarListing[]> {
  const supabase = supabaseServer;
  let query = supabase.from('car_listings').select('*');

  if (filter?.make) {
    query = query.eq('make', filter.make);
  }
  if (filter?.yearMin) {
    query = query.gte('year', filter.yearMin);
  }
  if (filter?.yearMax) {
    query = query.lte('year', filter.yearMax);
  }
  if (filter?.priceMin) {
    query = query.gte('price', filter.priceMin);
  }
  if (filter?.priceMax) {
    query = query.lte('price', filter.priceMax);
  }

  const { data, error } = await query.eq('status', filter?.status || 'active');

  if (error) {
    console.error('Error fetching listings:', error);
    return [];
  }

  return data || [];
}

export async function getListingById(id: string): Promise<CarListing | null> {
  const supabase = supabaseServer;
  const { data, error } = await supabase
    .from('car_listings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching listing:', error);
    return null;
  }

  return data;
}

export async function createListing(
  dealerId: string,
  listing: Omit<CarListing, 'id' | 'dealerId' | 'createdAt' | 'updatedAt' | 'views'>
): Promise<CarListing | null> {
  const supabase = supabaseServer;
  const { data, error } = await supabase
    .from('car_listings')
    .insert([{ dealer_id: dealerId, ...listing } as never])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateListing(id: string, updates: Partial<CarListing>): Promise<CarListing | null> {
  const supabase = supabaseServer;
  const { data, error } = await supabase
    .from('car_listings')
    .update(updates as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteListing(id: string): Promise<void> {
  const supabase = supabaseServer;
  const { error } = await supabase
    .from('car_listings')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
