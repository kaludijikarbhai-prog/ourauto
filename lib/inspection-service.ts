/**
 * Inspection booking service
 */

import { supabase } from './supabase';
import { getUser } from './auth';
import { Inspection, InspectionWithCar, InspectionStatus, ApiResponse } from './types';

/**
 * Book an inspection
 */
export async function bookInspection(input: {
  car_id: string;
  city: string;
  date: string;
  time_slot: string;
}): Promise<ApiResponse<Inspection>> {
  try {
    const user = await getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Check availability (max 3 bookings per slot per city per day)
    const { data: existingBookings, error: checkError } = await supabase
      .from('inspections')
      .select('*')
      .eq('city', input.city)
      .eq('date', input.date)
      .eq('time_slot', input.time_slot);

    if (!checkError && existingBookings && existingBookings.length >= 3) {
      return { error: 'This time slot is fully booked' };
    }

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
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    console.error('Book inspection error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to book inspection' };
  }
}

/**
 * Get user's inspections
 */
export async function getUserInspections(): Promise<InspectionWithCar[]> {
  try {
    const user = await getUser();
    if (!user) {
      return [];
    }

    const { data: inspections, error: inspError } = await supabase
      .from('inspections')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (inspError || !inspections) {
      return [];
    }

    // Get car details
    const carIds = inspections.map((i: any) => i.car_id);
    const { data: cars } = await supabase
      .from('cars')
      .select('*')
      .in('id', carIds);

    const carMap = new Map(cars?.map((c: any) => [c.id, c]) || []);

    return inspections
      .map((i: any) => ({
        ...i,
        car: carMap.get(i.car_id),
      }))
      .filter((i: any) => i.car) as InspectionWithCar[];
  } catch (error) {
    console.error('Get inspections error:', error);
    return [];
  }
}

/**
 * Cancel inspection
 */
export async function cancelInspection(inspectionId: string): Promise<ApiResponse<null>> {
  try {
    const user = await getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Verify ownership
    const { data: inspection } = await supabase
      .from('inspections')
      .select('user_id')
      .eq('id', inspectionId)
      .single();

    if (inspection?.user_id !== user.id) {
      return { error: 'Unauthorized' };
    }

    const { error } = await supabase.from('inspections').delete().eq('id', inspectionId);

    if (error) {
      return { error: error.message };
    }

    return { data: null };
  } catch (error) {
    console.error('Cancel inspection error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to cancel inspection' };
  }
}

/**
 * Update inspection status (admin/dealer only)
 */
export async function updateInspectionStatus(
  inspectionId: string,
  status: InspectionStatus
): Promise<ApiResponse<Inspection>> {
  try {
    const user = await getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Verify user is admin or has permission
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Allow only admin for now
    if (userProfile?.role !== 'admin') {
      return { error: 'Unauthorized' };
    }

    const { data, error } = await supabase
      .from('inspections')
      .update({ status })
      .eq('id', inspectionId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    console.error('Update status error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to update status' };
  }
}

/**
 * Get inspection by ID
 */
export async function getInspection(inspectionId: string): Promise<InspectionWithCar | null> {
  try {
    const { data: inspection } = await supabase
      .from('inspections')
      .select('*')
      .eq('id', inspectionId)
      .single();

    if (!inspection) {
      return null;
    }

    const { data: car } = await supabase.from('cars').select('*').eq('id', inspection.car_id).single();

    return {
      ...inspection,
      car,
    } as InspectionWithCar;
  } catch (error) {
    console.error('Get inspection error:', error);
    return null;
  }
}

/**
 * Get inspections for a car (available slots)
 */
export async function getCarInspections(carId: string): Promise<Inspection[]> {
  try {
    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('car_id', carId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Get car inspections error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Get inspections error:', error);
    return [];
  }
}

/**
 * Get available slots for a date and city
 */
export async function getAvailableSlots(
  city: string,
  date: string
): Promise<{ label: string; value: string; available: boolean }[]> {
  try {
    const slots = [
      { label: '10:00 AM - 1:00 PM', value: '10am-1pm' },
      { label: '2:00 PM - 5:00 PM', value: '2pm-5pm' },
    ];

    const { data: bookings } = await supabase
      .from('inspections')
      .select('time_slot')
      .eq('city', city)
      .eq('date', date);

    const slotCounts = new Map<string, number>();

    bookings?.forEach((b: any) => {
      slotCounts.set(b.time_slot, (slotCounts.get(b.time_slot) || 0) + 1);
    });

    return slots.map((slot) => ({
      ...slot,
      available: (slotCounts.get(slot.value) || 0) < 3,
    }));
  } catch (error) {
    console.error('Get available slots error:', error);
    return [];
  }
}
