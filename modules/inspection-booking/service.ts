/**
 * Inspection Booking Service
 * 
 * Core functions for managing inspections
 */

import { supabaseServer } from '@/lib/supabase-server';
import type { InspectionBooking, InspectionReport } from './types';

export async function bookInspection(
  listingId: string,
  buyerId: string,
  dealerId: string,
  scheduledAt: string,
  notes?: string
): Promise<InspectionBooking | null> {
  // Using supabase directly
  const supabase = supabaseServer;
  const { data, error } = await supabase
    .from('inspection_bookings')
    .insert([
      {
        listing_id: listingId,
        buyer_id: buyerId,
        dealer_id: dealerId,
        scheduled_at: scheduledAt,
        notes,
        status: 'pending',
      } as never,
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getBooking(id: string): Promise<InspectionBooking | null> {
  // Using supabase directly
  const supabase = supabaseServer;
  const { data, error } = await supabase
    .from('inspection_bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching booking:', error);
    return null;
  }

  return data;
}

export async function getBookingsByListing(listingId: string): Promise<InspectionBooking[]> {
  // Using supabase directly
  const supabase = supabaseServer;
  const { data, error } = await supabase
    .from('inspection_bookings')
    .select('*')
    .eq('listing_id', listingId);

  if (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }

  return data || [];
}

export async function updateBookingStatus(
  id: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
): Promise<InspectionBooking | null> {

  const { data, error } = await supabaseServer
    .from('inspection_bookings')
    .update({ status } as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function submitReport(
  bookingId: string,
  inspectorId: string,
  report: Omit<InspectionReport, 'id' | 'bookingId' | 'inspectorId' | 'createdAt'>
): Promise<InspectionReport | null> {
  const { data, error } = await supabaseServer
    .from('inspection_reports')
    .insert([
      {
        booking_id: bookingId,
        inspector_id: inspectorId,
        ...report,
      } as never,
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
