// =============================
// TYPES
// =============================

export type InspectionBooking = {
  id: string
  user_id: string
  car_id: string

  date: string
  time_slot: string

  city: string
  address?: string

  status:
    | 'pending'
    | 'confirmed'
    | 'completed'
    | 'cancelled'

  created_at?: string
}
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/* =================================================
   CONSTANTS
================================================= */

export const TIME_SLOTS = [
  '10:00 AM',
  '12:00 PM',
  '02:00 PM',
  '04:00 PM'
]

export const INSPECTION_CITIES = [
  'Ahmedabad',
  'Surat',
  'Vadodara',
  'Rajkot'
]

/* =================================================
   DATE HELPERS
================================================= */

export function getMinDate() {
  return new Date().toISOString().split('T')[0]
}

export function getMaxDate() {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  return d.toISOString().split('T')[0]
}

/* =================================================
   SLOT CHECK
================================================= */

export async function isSlotAvailable(date: string, time: string) {
  const { data } = await supabase
    .from('inspection_bookings')
    .select('id')
    .eq('date', date)
    .eq('time', time)

  return !data || data.length === 0
}

/* =================================================
   USER CARS
================================================= */

export async function getUserCarsForInspection(userId: string) {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('owner_id', userId)

  if (error) throw error
  return data
}

/* =================================================
   USER INSPECTIONS
================================================= */

export async function getUserInspections(userId: string) {
  const { data, error } = await supabase
    .from('inspection_bookings')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) throw error
  return data
}

/* =================================================
   CREATE / BOOK
================================================= */

export async function createInspectionBooking(payload: any) {
  const { error } = await supabase
    .from('inspection_bookings')
    .insert(payload)

  if (error) throw error
  return { success: true }
}

export async function bookInspection({
  car_id,
  user_id,
  date,
  time
}: any) {
  const available = await isSlotAvailable(date, time)

  if (!available) {
    throw new Error('Slot already booked')
  }

  return createInspectionBooking({
    car_id,
    user_id,
    date,
    time,
    status: 'pending'
  })
}

/* =================================================
   UPDATE STATUS
================================================= */

export async function updateInspectionStatus(
  id: string,
  status: string
) {
  const { error } = await supabase
    .from('inspection_bookings')
    .update({ status })
    .eq('id', id)

  if (error) throw error
  return { success: true }
}

/* =================================================
   CANCEL
================================================= */

export async function cancelInspection(id: string) {
  return updateInspectionStatus(id, 'cancelled')
}
