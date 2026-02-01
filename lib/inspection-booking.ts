import { supabase } from './supabase';
import { getUser } from './auth';

export interface InspectionBooking {
  id: string;
  user_id: string;
  car_id: string;
  city: string;
  date: string;
  time_slot: string;
  status: 'pending' | 'confirmed' | 'completed';
  created_at: string;
}

export interface BookInspectionInput {
  car_id: string;
  city: string;
  date: string;
  time_slot: string;
}

/**
 * Available inspection time slots
 */
export const TIME_SLOTS = [
  '10:00 AM - 1:00 PM',
  '2:00 PM - 5:00 PM',
];

/**
 * Get available cities for inspection
 */
export const INSPECTION_CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Chandigarh',
  'Indore',
  'Nashik',
  'Surat',
  'Vadodara',
];

/**
 * Get minimum inspection date (tomorrow)
 */
export function getMinDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

/**
 * Get maximum inspection date (30 days from now)
 */
export function getMaxDate(): string {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  return maxDate.toISOString().split('T')[0];
}

/**
 * Book an inspection
 */
export async function bookInspection(
  input: BookInspectionInput
): Promise<{ inspection: InspectionBooking | null; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('inspections')
      .insert([
        {
          user_id: user.id,
          car_id: input.car_id,
          city: input.city,
          date: input.date,
          time_slot: input.time_slot,
          status: 'pending',
          created_at: now,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { inspection: data as InspectionBooking };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to book inspection';
    console.error('Book inspection error:', message);
    return { inspection: null, error: message };
  }
}

/**
 * Get user's inspections
 */
export async function getUserInspections(): Promise<
  Array<InspectionBooking & { brand: string; model: string; year: number }>
> {
  try {
    const user = await getUser();
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('inspections')
      .select(
        `
        id,
        user_id,
        car_id,
        city,
        date,
        time_slot,
        status,
        created_at,
        cars (
          brand,
          model,
          year
        )
      `
      )
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (error) {
      console.error('Get inspections error:', error);
      return [];
    }

    // Flatten the response
    return (data || []).map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      car_id: item.car_id,
      city: item.city,
      date: item.date,
      time_slot: item.time_slot,
      status: item.status,
      created_at: item.created_at,
      brand: item.cars?.brand || 'Unknown',
      model: item.cars?.model || 'Unknown',
      year: item.cars?.year || 0,
    }));
  } catch (error) {
    console.error('Get inspections error:', error);
    return [];
  }
}

/**
 * Get inspection by ID
 */
export async function getInspection(
  inspectionId: string
): Promise<InspectionBooking | null> {
  try {
    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('id', inspectionId)
      .single();

    if (error) {
      console.error('Get inspection error:', error);
      return null;
    }

    return data as InspectionBooking;
  } catch (error) {
    console.error('Get inspection error:', error);
    return null;
  }
}

/**
 * Update inspection status
 */
export async function updateInspectionStatus(
  inspectionId: string,
  status: 'pending' | 'confirmed' | 'completed'
): Promise<{ inspection: InspectionBooking | null; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify ownership
    const { data: inspection } = await supabase
      .from('inspections')
      .select('user_id')
      .eq('id', inspectionId)
      .single();

    if (inspection?.user_id !== user.id) {
      throw new Error('You can only update your own inspections');
    }

    const { data, error } = await supabase
      .from('inspections')
      .update({ status })
      .eq('id', inspectionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { inspection: data as InspectionBooking };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update inspection';
    return { inspection: null, error: message };
  }
}

/**
 * Cancel inspection
 */
export async function cancelInspection(
  inspectionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify ownership
    const { data: inspection } = await supabase
      .from('inspections')
      .select('user_id')
      .eq('id', inspectionId)
      .single();

    if (inspection?.user_id !== user.id) {
      throw new Error('You can only cancel your own inspections');
    }

    const { error } = await supabase
      .from('inspections')
      .delete()
      .eq('id', inspectionId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to cancel inspection';
    return { success: false, error: message };
  }
}

/**
 * Check if a time slot is available
 */
export async function isSlotAvailable(
  city: string,
  date: string,
  timeSlot: string
): Promise<boolean> {
  try {
    let query = supabase
      .from('inspections')
      .select('id', { count: 'exact', head: true })
      .eq('city', city)
      .eq('date', date)
      .eq('time_slot', timeSlot)
      .eq('status', 'pending');

    // Limit to 3 inspections per slot
    const { count, error } = await query;

    if (error) {
      console.error('Check availability error:', error);
      return false;
    }

    return (count || 0) < 3;
  } catch (error) {
    console.error('Check availability error:', error);
    return false;
  }
}

/**
 * Get user's car list for inspection booking
 */
export async function getUserCarsForInspection(): Promise<
  Array<{ id: string; brand: string; model: string; year: number }>
> {
  try {
    const user = await getUser();
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('cars')
      .select('id, brand, model, year')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (error) {
      console.error('Get cars error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Get cars error:', error);
    return [];
  }
}
