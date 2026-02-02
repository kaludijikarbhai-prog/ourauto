/**
 * AI Valuation Service
 * 
 * Core functions for vehicle valuation
 * 
 * TODO: Integrate with AI/ML service for price estimation
 */

// Removed unused import of supabase
import type { ValuationRequest, ValuationResult } from './types';
import { supabaseServer } from '@/lib/supabase-server';

export async function getValuation(request: ValuationRequest): Promise<ValuationResult | null> {
  // This is a placeholder implementation
  // In production, integrate with an AI/ML model or external valuation API
  
  try {

    const supabase = supabaseServer;
    const { data, error } = await supabase
      .from('valuations')
      .select('*')
      .match({
        make: request.make,
        model: request.model,
        year: request.year,
        condition: request.condition,
      })
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching valuation:', error);
    }

    return data || null;
  } catch (err) {
    console.error('Valuation service error:', err);
    return null;
  }
}

export async function createValuation(
  request: ValuationRequest,
  result: Omit<ValuationResult, 'id' | 'createdAt'>
): Promise<ValuationResult | null> {
  // Using supabase directly
  const supabase = supabaseServer;
  const { data, error } = await supabase
    .from('valuations')
    .insert([{ ...request, ...result } as never])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getListingValuation(listingId: string): Promise<ValuationResult | null> {
  // Using supabase directly
  const supabase = supabaseServer;
  const { data, error } = await supabase
    .from('valuations')
    .select('*')
    .eq('listing_id', listingId)
    .single();

  if (error) {
    console.error('Error fetching listing valuation:', error);
    return null;
  }

  return data;
}
